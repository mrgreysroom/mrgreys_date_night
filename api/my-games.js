// Server-side purchase lookup. Never trust an email address supplied by the browser.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({error:"Method not allowed"});
  const token=String(req.headers.authorization||"").match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({error:"Sign in required"});
  const base="https://siferzggaubvtjlqdckj.supabase.co";
  try {
    const auth=await fetch(base+"/auth/v1/user",{
      headers:{apikey:"sb_publishable_5V6HZj-kn5B9CVFWrGDR8g_xEWKdJwu",Authorization:"Bearer "+token},
      signal:AbortSignal.timeout(10000)
    });
    if (!auth.ok) return res.status(401).json({error:"Session expired"});
    const user=await auth.json();
    if (!user?.id || !user?.email) return res.status(401).json({error:"Invalid session"});
    const query=new URLSearchParams({select:"product_code,purchased_at"});
    const rr=await fetch(base+"/rest/v1/entitlements?"+query,{
      headers:{apikey:"sb_publishable_5V6HZj-kn5B9CVFWrGDR8g_xEWKdJwu",Authorization:"Bearer "+token},
      signal:AbortSignal.timeout(10000)
    });
    if (!rr.ok) {console.error("my-games database lookup failed",rr.status,await rr.text());return res.status(502).json({error:"Purchase lookup unavailable"});}
    const rows=await rr.json();
    return res.status(200).json({games:rows});
  } catch(e) {
    console.error("my-games lookup failed",e);
    return res.status(502).json({error:"Purchase lookup unavailable"});
  }
}
