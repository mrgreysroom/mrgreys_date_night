import { sendMarketingMail } from "./_marketing-mail.js";
const SB="https://siferzggaubvtjlqdckj.supabase.co";
function h(secret,prefer){const out={apikey:secret,"Content-Type":"application/json",...(prefer?{Prefer:prefer}:{})};if(String(secret).startsWith("eyJ"))out.Authorization=`Bearer ${secret}`;return out;}
export default async function handler(req,res){
 if(req.method!=="GET"&&req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
 const expected=process.env.MARKETING_CRON_SECRET;
 const supplied=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"") || String(req.query?.key||"");
 const fromVercelCron=String(req.headers["x-vercel-cron"]||"")==="1";
 if(!fromVercelCron && (!expected||supplied!==expected)) return res.status(401).json({error:"Unauthorized"});
 const secret=process.env.SUPABASE_SECRET_KEY;if(!secret) return res.status(503).json({error:"Not configured"});
 const q=encodeURIComponent(new Date().toISOString());
 const r=await fetch(`${SB}/rest/v1/marketing_email_queue?status=eq.pending&scheduled_for=lte.${q}&select=id,lead_id,email,template_key,attempts&order=scheduled_for.asc&limit=20`,{headers:h(secret)});
 if(!r.ok) return res.status(500).json({error:"Queue read failed"});
 const jobs=await r.json();let sent=0,failed=0;
 for(const job of jobs){
  const lr=await fetch(`${SB}/rest/v1/marketing_leads?id=eq.${job.lead_id}&select=marketing_consent,unsubscribed_at,selected_packs&limit=1`,{headers:h(secret)});
  const lead=(await lr.json().catch(()=>[]))[0];
  if(!lead?.marketing_consent||lead?.unsubscribed_at){await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:"cancelled",updated_at:new Date().toISOString()})});continue;}
  await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}&status=eq.pending`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:"processing",attempts:(job.attempts||0)+1,updated_at:new Date().toISOString()})});
  try{await sendMarketingMail({email:job.email,key:job.template_key,packs:lead.selected_packs||[]});await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:"sent",sent_at:new Date().toISOString(),last_error:null,updated_at:new Date().toISOString()})});sent++;}
  catch(e){const attempts=(job.attempts||0)+1;await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:attempts>=3?"failed":"pending",last_error:String(e?.message||e).slice(0,500),updated_at:new Date().toISOString()})});failed++;}
 }
 return res.status(200).json({ok:true,processed:jobs.length,sent,failed});
}
