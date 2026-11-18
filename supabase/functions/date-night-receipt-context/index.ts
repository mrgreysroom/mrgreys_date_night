import postgres from "npm:postgres@3.4.7";
const db=postgres(Deno.env.get("SUPABASE_DB_URL")!,{prepare:false,max:1,idle_timeout:10,connect_timeout:5});
const url=Deno.env.get("SUPABASE_URL")!;
const reply=(status:number,body:object)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
Deno.serve(async (req)=>{
 if(req.method!=="POST")return reply(405,{error:"Method not allowed"});
 const key=req.headers.get("apikey");
 if(!key || key.length>4096)return reply(401,{error:"Unauthorized"});
 try {
  const h:Record<string,string>={apikey:key};
  if(!key.startsWith("sb_secret_"))h.Authorization="Bearer "+key;
  const access=await fetch(url+"/auth/v1/admin/users?page=1&per_page=1",{headers:h,signal:AbortSignal.timeout(5000)});
  await access.body?.cancel();
  if(!access.ok)return reply([401,403].includes(access.status)?401:502,{error:"Authorization unavailable"});
  const {email,product}=await req.json();
  if(typeof email!=="string"||email.length>254||!["romantic","secrets","dare","afterdark","complete"].includes(product))return reply(400,{error:"Invalid purchase"});
  const rows=await db`
    select e.id,e.language,
      (select m.provider_message_id from public.crm_email_messages m
       where m.campaign_code='date_night_purchase_' || e.id::text limit 1) as provider_message_id
    from public.entitlements e where e.email=${email} and e.product_code=${product}
    order by e.created_at desc limit 1`;
  return reply(200,{entitlement:rows[0]??null});
 }catch(error){console.error("DATE NIGHT receipt context failed", (error as {code?:string})?.code||"unknown");return reply(502,{error:"Purchase lookup unavailable"});}
});
