
const ML_BASE = "https://connect.mailerlite.com/api";

async function mlRequest(path, options = {}) {
  const token = process.env.MAILERLITE_API_TOKEN;
  if (!token) throw new Error("MAILERLITE_API_TOKEN missing");
  const r = await fetch(`${ML_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await r.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!r.ok) {
    const e = new Error(data?.message || `MailerLite ${r.status}`);
    e.status = r.status;
    throw e;
  }
  return data;
}

async function ensureGroup(name) {
  const q = encodeURIComponent(name);
  const existing = await mlRequest(`/groups?filter[name]=${q}&limit=100`);
  const exact = (existing?.data || []).find(g => g.name === name);
  if (exact) return String(exact.id);
  try {
    const created = await mlRequest("/groups", {
      method: "POST",
      body: JSON.stringify({ name })
    });
    return String(created?.data?.id);
  } catch (e) {
    // Handle a race where another request created the group.
    const retry = await mlRequest(`/groups?filter[name]=${q}&limit=100`);
    const found = (retry?.data || []).find(g => g.name === name);
    if (found) return String(found.id);
    throw e;
  }
}

export async function upsertMailerLiteContact(email, groupNames = []) {
  const clean = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw new Error("Invalid email");
  }
  const ids = [];
  for (const name of [...new Set(groupNames.filter(Boolean))]) {
    ids.push(await ensureGroup(name));
  }
  const result = await mlRequest("/subscribers", {
    method: "POST",
    body: JSON.stringify({
      email: clean,
      groups: ids
    })
  });
  return result?.data || null;
}
