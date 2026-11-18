// DATE NIGHT library lookup. Identity is verified twice, and the database is accessed
// only inside the Supabase Edge Function using its own managed server credential.
export default async function handler(req,res){
 res.setHeader("Cache-Control","private, no-store");
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const token=String(req.headers.authorization||"").match(/^Bearer\\s+(.+)$/i)?.[1];
 if(!token)return res.status(401).json({error:"Sign in required"});
 try{
  const response=await fetch("https://siferzggaubvtjlqdckj.supabase.co/functions/v1/date-night-my-games",{
   method:"POST",headers:{"Content-Type":"application/json",apikey:"sb_publishable_5V6HZj-kn5B9CVFWrGDR8g_xEWKdJwu",Authorization:"Bearer "+token},
   body:"{}",signal:AbortSignal.timeout(12000)
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){console.error("date-night library edge failed",response.status,payload?.error||"Unknown");return res.status(response.status===401?401:502).json({error:response.status===401?"Session expired":"Purchase lookup unavailable"});}
  return res.status(200).json({games:Array.isArray(payload.games)?payload.games:[]});
 }catch(e){console.error("date-night library transport failed",String(e));return res.status(502).json({error:"Purchase lookup unavailable"});}
}
