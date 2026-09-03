import { upsertMailerLiteContact } from "./_mailerlite.js";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false
  }
};

const VALID_PRODUCTS = new Set([
  "romantic",
  "secrets",
  "dare",
  "afterdark",
  "complete"
]);

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));

  if (!timestampPart || signatures.length === 0) return false;

  const timestamp = timestampPart.slice(2);
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((sig) => {
    try {
      const a = Buffer.from(expected, "hex");
      const b = Buffer.from(sig, "hex");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

  if (!webhookSecret || !supabaseSecret) {
    console.error("Webhook server configuration missing.");
    return res.status(503).json({ error: "Server is not configured" });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    console.error("Could not read raw webhook body", e);
    return res.status(400).json({ error: "Invalid body" });
  }

  const signature = req.headers["stripe-signature"];
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    console.warn("Invalid Stripe webhook signature.");
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return res.status(200).json({ received: true, ignored: true });
  }

  const session = event?.data?.object;
  if (!session?.id || !String(session.id).startsWith("cs_")) {
    return res.status(400).json({ error: "Missing checkout session" });
  }

  // Never unlock unpaid or still-pending sessions.
  if (session.payment_status !== "paid") {
    return res.status(200).json({ received: true, pending: true });
  }

  const email = String(
    session.customer_details?.email ||
    session.customer_email ||
    ""
  ).trim().toLowerCase();

  const product = String(session.metadata?.product_code || "");

  if (!email || !VALID_PRODUCTS.has(product)) {
    console.error("Webhook missing purchase data", {
      sessionId: session.id,
      hasEmail: Boolean(email),
      product
    });
    return res.status(400).json({ error: "Missing purchase data" });
  }

  const rr = await fetch(
    "https://siferzggaubvtjlqdckj.supabase.co/rest/v1/entitlements?on_conflict=stripe_session_id",
    {
      method: "POST",
      headers: {
        apikey: supabaseSecret,
        Authorization: `Bearer ${supabaseSecret}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=minimal"
      },
      body: JSON.stringify({
        email,
        product_code: product,
        stripe_session_id: session.id
      })
    }
  );

  if (!rr.ok) {
    const detail = await rr.text().catch(() => "");
    console.error("Could not store entitlement", rr.status, detail);
    // 5xx makes Stripe retry the webhook.
    return res.status(500).json({ error: "Could not store entitlement" });
  }

  // CRM sync is intentionally non-blocking: a MailerLite outage must never
  // prevent a paid customer from receiving access to the game.
  try {
    const groups = [
      "DATE NIGHT · CUSTOMERS",
      `DATE NIGHT · CUSTOMER · ${product.toUpperCase()}`
    ];
    if (product === "complete") groups.push("DATE NIGHT · X COMPLETE");
    await upsertMailerLiteContact(email, groups);
  } catch (e) {
    console.error("MailerLite customer sync failed", e?.message || e);
  }

  return res.status(200).json({
    received: true,
    stored: true,
    product,
    email
  });
}
