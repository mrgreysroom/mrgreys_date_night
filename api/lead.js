import { sendMarketingMail } from "./_marketing-mail.js";

const VALID_PACKS = new Set(["romantic","secrets","dare","afterdark"]);
const SB = "https://siferzggaubvtjlqdckj.supabase.co";

function sbHeaders(secret, prefer="return=representation") {
  const h = { apikey: secret, "Content-Type":"application/json", Prefer: prefer };
  if (String(secret).startsWith("eyJ")) h.Authorization = `Bearer ${secret}`;
  return h;
}

async function sendImmediateIfDue(secret, lead){
  if(!lead?.id || !lead?.marketing_consent || lead?.unsubscribed_at) return {sent:false};
  const qr=await fetch(`${SB}/rest/v1/marketing_email_queue?lead_id=eq.${encodeURIComponent(lead.id)}&template_key=eq.demo_1_immediate&status=eq.pending&select=id,email,template_key&limit=1`,{headers:sbHeaders(secret,"")});
  if(!qr.ok) return {sent:false,error:`queue ${qr.status}`};
  const job=(await qr.json().catch(()=>[]))[0];
  if(!job) return {sent:false};
  try{
    await sendMarketingMail({email:lead.email,key:"demo_1_immediate",packs:lead.selected_packs||[]});
    const now=new Date().toISOString();
    await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${encodeURIComponent(job.id)}`,{
      method:"PATCH",headers:sbHeaders(secret,"return=minimal"),body:JSON.stringify({status:"sent",sent_at:now,attempts:1,last_error:null,updated_at:now})
    });
    return {sent:true};
  }catch(e){
    const now=new Date().toISOString();
    await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${encodeURIComponent(job.id)}`,{
      method:"PATCH",headers:sbHeaders(secret,"return=minimal"),body:JSON.stringify({attempts:1,last_error:String(e?.message||e).slice(0,500),updated_at:now})
    }).catch(()=>{});
    return {sent:false,error:String(e?.message||e)};
  }
}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const email=String(req.body?.email||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:"Invalid email"});
  const packs=Array.isArray(req.body?.packs)?req.body.packs.map(String).filter(p=>VALID_PACKS.has(p)).slice(0,2):[];
  const marketingConsent=req.body?.marketingConsent===true;
  const secret=process.env.SUPABASE_SECRET_KEY;
  if(!secret) return res.status(503).json({error:"Server is not configured",demoFallback:true});

  try {
    const now=new Date().toISOString();
    const body={email,marketing_consent:marketingConsent,source:String(req.body?.source||"landing_v12").slice(0,80),updated_at:now};
    if(packs.length) body.selected_packs=packs;
    if(marketingConsent){body.consented_at=now;body.unsubscribed_at=null;}
    const r=await fetch(`${SB}/rest/v1/marketing_leads?on_conflict=email`,{
      method:"POST",headers:sbHeaders(secret,"resolution=merge-duplicates,return=representation"),body:JSON.stringify(body)
    });
    if(!r.ok) throw new Error(`lead ${r.status} ${await r.text()}`);
    const lead=(await r.json().catch(()=>[]))[0];
    const immediate=marketingConsent?await sendImmediateIfDue(secret,lead):{sent:false};
    return res.status(200).json({ok:true,leadStored:true,immediateSent:Boolean(immediate.sent)});
  } catch(err) {
    console.error("Marketing lead sync failed",err?.message||err);
    return res.status(200).json({ok:true,demoFallback:true});
  }
}
