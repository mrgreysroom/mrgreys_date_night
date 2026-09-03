import crypto from "crypto";
const SB="https://siferzggaubvtjlqdckj.supabase.co";
export default async function handler(req,res){
 const email=String(req.query?.email||"").trim().toLowerCase();const token=String(req.query?.token||"");const key=process.env.MARKETING_UNSUBSCRIBE_SECRET||"";
 const expected=crypto.createHmac("sha256",key).update(email).digest("hex");
 let ok=false;try{ok=Boolean(key&&token&&crypto.timingSafeEqual(Buffer.from(token),Buffer.from(expected)));}catch{}
 if(!ok) return res.status(400).send("Neplatný odkaz na odhlásenie.");
 const secret=process.env.SUPABASE_SECRET_KEY;const headers={apikey:secret,"Content-Type":"application/json"};if(String(secret).startsWith("eyJ"))headers.Authorization=`Bearer ${secret}`;const now=new Date().toISOString();
 await fetch(`${SB}/rest/v1/marketing_leads?email=eq.${encodeURIComponent(email)}`,{method:"PATCH",headers,body:JSON.stringify({marketing_consent:false,unsubscribed_at:now,updated_at:now})});
 return res.status(200).setHeader("Content-Type","text/html; charset=utf-8").send('<!doctype html><html><body style="background:#08070a;color:#f4eef6;font-family:Arial;text-align:center;padding:60px 20px"><h1>Odhlásenie bolo úspešné ✕</h1><p style="color:#aaa1ae">Marketingové e-maily MR GREY’S DATE NIGHT už na túto adresu posielať nebudeme.</p></body></html>');
}
