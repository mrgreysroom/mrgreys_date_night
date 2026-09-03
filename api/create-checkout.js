const PRICE_ENV = {
  romantic: "STRIPE_PRICE_ROMANTIC",
  secrets: "STRIPE_PRICE_SECRETS",
  dare: "STRIPE_PRICE_DARE",
  afterdark: "STRIPE_PRICE_AFTERDARK",
  complete: "STRIPE_PRICE_COMPLETE"
};
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const product=String(req.body?.product||"");
  if(!Object.prototype.hasOwnProperty.call(PRICE_ENV,product)) return res.status(400).json({error:"Invalid product"});
  const email=String(req.body?.email||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:"Email is required"});
  const price=process.env[PRICE_ENV[product]];
  const secret=process.env.STRIPE_SECRET_KEY;
  if(!secret||!price) return res.status(503).json({error:"Stripe is not configured"});
  const origin="https://datenight.mrgreysroom.sk";
  const p=new URLSearchParams();
  p.append("mode","payment");
  p.append("line_items[0][price]",price);
  p.append("line_items[0][quantity]","1");
  p.append("success_url",`${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  p.append("cancel_url",`${origin}/?payment=cancelled#try`);
  p.append("metadata[product_code]",product);
  p.append("allow_promotion_codes","true");
  p.append("customer_email",email);
  try{
    const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{"Authorization":`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded"},body:p.toString()});
    const data=await r.json().catch(()=>({}));
    if(!r.ok){ console.error("Stripe checkout failed",r.status,data?.error?.message||""); return res.status(r.status).json({error:data?.error?.message||"Stripe error"}); }
    if(!data?.url) return res.status(502).json({error:"Stripe did not return checkout URL"});
    return res.status(200).json({url:data.url});
  }catch(e){
    console.error("Checkout request failed",e?.message||e);
    return res.status(502).json({error:"Checkout unavailable"});
  }
}