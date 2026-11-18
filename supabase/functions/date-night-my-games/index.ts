import { createClient } from "npm:@supabase/supabase-js@2.57.4";
Deno.serve(async (req) => {
  const h={"Content-Type":"application/json","Cache-Control":"no-store"};
  if(req.method!=="POST")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:h});
  const bearer=req.headers.get("authorization")||"";
  const token=bearer.match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!token)return new Response(JSON.stringify({error:"Sign in required"}),{status:401,headers:h});
  const url=Deno.env.get("SUPABASE_URL")!;
  const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  try {
    const auth=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:{user},error:authError}=await auth.auth.getUser(token);
    if(authError && ![400,401,403,422].includes(authError.status ?? 0)) throw authError;
    if(authError||!user?.id)return new Response(JSON.stringify({error:"Invalid session"}),{status:401,headers:h});
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error}=await admin.from("entitlements").select("product_code,purchased_at").eq("user_id",user.id);
    if(error){console.error("Purchase query failed",error.code,error.message);return new Response(JSON.stringify({error:"Purchase lookup unavailable"}),{status:502,headers:h});}
    return new Response(JSON.stringify({games:data||[]}),{status:200,headers:h});
  }catch(e){console.error("Library edge error",String(e));return new Response(JSON.stringify({error:"Purchase lookup unavailable"}),{status:502,headers:h});}
});
