import { sendMarketingMail } from "./_marketing-mail.js";
const SB="https://siferzggaubvtjlqdckj.supabase.co";
function h(secret,prefer){const out={apikey:secret,"Content-Type":"application/json",...(prefer?{Prefer:prefer}:{})};if(String(secret).startsWith("eyJ"))out.Authorization=`Bearer ${secret}`;return out;}
export default async function handler(req,res){
 if(req.method!=="GET"&&req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
 const expected=String(process.env.MARKETING_CRON_SECRET||"").trim();
 const supplied=(String(req.headers["x-marketing-cron-secret"]||"") || String(req.headers.authorization||"").replace(/^Bearer\s+/i,"")).trim();
 if(!expected||supplied!==expected) return res.status(401).json({error:"Unauthorized"});
 const secret=process.env.SUPABASE_SECRET_KEY;if(!secret) return res.status(503).json({error:"Not configured"});
 const q=encodeURIComponent(new Date().toISOString());
 const r=await fetch(`${SB}/rest/v1/marketing_email_queue?status=eq.pending&scheduled_for=lte.${q}&select=id,lead_id,email,template_key,attempts&order=scheduled_for.asc&limit=20`,{headers:h(secret)});
 if(!r.ok) return res.status(500).json({error:"Queue read failed"});
 const jobs=await r.json();let sent=0,failed=0,skipped=0;
 for(const job of jobs){
  const lr=await fetch(`${SB}/rest/v1/marketing_leads?id=eq.${job.lead_id}&select=marketing_consent,unsubscribed_at,selected_packs,language&limit=1`,{headers:h(secret)});
  const lead=(await lr.json().catch(()=>[]))[0];
  if(!lead?.marketing_consent||lead?.unsubscribed_at){await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:"cancelled",updated_at:new Date().toISOString()})});continue;}
  const salesKeys=new Set(["demo_1_immediate","demo_2_special_x","demo_3_pack_followup","demo_5_last_call","purchase_single_upgrade_day1","purchase_single_upgrade_day3"]);
  const clubKeys=new Set(["purchase_complete_club_day3","demo_6_club_day10"]);
  if(salesKeys.has(job.template_key)||clubKeys.has(job.template_key)){
   const ent=await fetch(`${SB}/rest/v1/entitlements?email=eq.${encodeURIComponent(job.email)}&select=product_code&limit=30`,{headers:h(secret)});
   if(!ent.ok){failed++;continue;}
   const owned=(await ent.json()).map(x=>x.product_code);
   if((salesKeys.has(job.template_key)&&owned.includes("complete"))||(job.template_key.startsWith("demo_")&&salesKeys.has(job.template_key)&&owned.length>0)){
    await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:"cancelled",updated_at:new Date().toISOString()})});skipped++;continue;
   }
  }
  if(clubKeys.has(job.template_key)){
   const member=await fetch(`${SB}/rest/v1/club_memberships?email=eq.${encodeURIComponent(job.email)}&is_active=eq.true&select=id&limit=1`,{headers:h(secret)});
   if(!member.ok){failed++;continue;}
   if((await member.json()).length){await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:"cancelled",updated_at:new Date().toISOString()})});skipped++;continue;}
  }

  await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}&status=eq.pending`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:"processing",attempts:(job.attempts||0)+1,updated_at:new Date().toISOString()})});
  try{const result=await sendMarketingMail({jobId:job.id,email:job.email,key:job.template_key,packs:lead.selected_packs||[],language:lead.language||"sk"});await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:result.skipped?"cancelled":"sent",sent_at:result.skipped?null:new Date().toISOString(),last_error:null,updated_at:new Date().toISOString()})});if(result.skipped)skipped++;else sent++;}
  catch(e){const attempts=(job.attempts||0)+1;await fetch(`${SB}/rest/v1/marketing_email_queue?id=eq.${job.id}`,{method:"PATCH",headers:h(secret),body:JSON.stringify({status:attempts>=3?"failed":"pending",last_error:String(e?.message||e).slice(0,500),updated_at:new Date().toISOString()})});failed++;}
 }
 return res.status(200).json({ok:true,processed:jobs.length,sent,failed,skipped});
}

