import {createHash} from "node:crypto";
import {capturePayment} from "./_acquisition.js";
export default async function handler(req,res){
  if(!["GET","POST"].includes(req.method)) return res.status(405).json({error:"Method not allowed"});
  const sessionId=String(req.query?.session_id||req.body?.session_id||"");
  if(!sessionId.startsWith("cs_")) return res.status(400).json({error:"Invalid session"});
  const stripe=process.env.STRIPE_SECRET_KEY;
  const supabaseSecret=process.env.SUPABASE_SECRET_KEY;
  if(!stripe||!supabaseSecret) return res.status(503).json({error:"Server is not configured"});
  const sr=await fetch("https://api.stripe.com/v1/checkout/sessions/"+encodeURIComponent(sessionId),{headers:{Authorization:`Bearer ${stripe}`}});
  const s=await sr.json();
  if(!sr.ok||s.payment_status!=="paid") return res.status(402).json({error:"Payment not verified"});
  const email=(s.customer_details?.email||s.customer_email||"").toLowerCase();
  const product=s.metadata?.product_code||"";
  if(!email||!["romantic","secrets","dare","afterdark","complete"].includes(product)) return res.status(400).json({error:"Missing purchase data"});
  const rr=await fetch("https://siferzggaubvtjlqdckj.supabase.co/rest/v1/entitlements?on_conflict=stripe_session_id",{
    method:"POST",
    headers:{"apikey":supabaseSecret,"Authorization":`Bearer ${supabaseSecret}`,"Content-Type":"application/json","Prefer":"resolution=ignore-duplicates,return=minimal"},
    body:JSON.stringify({email,product_code:product,language:["sk","cz","pl","en"].includes(s.metadata?.language)?s.metadata.language:"sk",stripe_session_id:sessionId})
  });
  if(!rr.ok) return res.status(502).json({error:"Could not store entitlement"});
  await capturePayment(s);
  res.setHeader("Cache-Control","private, no-store");
  res.status(200).json({ok:true,product,purchase:s.livemode!==false&&/^cs_live_/.test(s.id)?{eventId:"game_"+createHash("sha256").update(s.id).digest("hex"),amount:s.amount_total,currency:String(s.currency).toUpperCase()}:null});
}
