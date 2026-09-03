
import { upsertMailerLiteContact } from "./_mailerlite.js";

const VALID_PACKS = new Set(["romantic","secrets","dare","afterdark"]);

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const email=String(req.body?.email||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:"Invalid email"});

  const packs = Array.isArray(req.body?.packs)
    ? req.body.packs.map(String).filter(p=>VALID_PACKS.has(p)).slice(0,2)
    : [];

  const marketingConsent = req.body?.marketingConsent === true;
  const groups = ["DATE NIGHT · DEMO LEADS"];
  for (const p of packs) groups.push(`DATE NIGHT · INTEREST · ${p.toUpperCase()}`);
  if(marketingConsent) groups.push("DATE NIGHT · MARKETING CONSENT");

  try{
    await upsertMailerLiteContact(email, groups);
    return res.status(200).json({ok:true});
  }catch(err){
    console.error("MailerLite lead sync failed", err?.message || err);
    // Never block access to the free demo if the email provider is temporarily unavailable.
    return res.status(200).json({ok:true,demoFallback:true});
  }
}
