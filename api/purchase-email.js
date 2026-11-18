import {sendCrmMail} from "./_crm-mail.js";

const PRODUCTS=new Set(["romantic","secrets","dare","afterdark","complete"]);

function authOk(req){
  const expected=String(process.env.MARKETING_CRON_SECRET||"").trim();
  const supplied=(String(req.headers["x-marketing-cron-secret"]||"") || String(req.headers.authorization||"").replace(/^Bearer\s+/i,"")).trim();
  return expected && supplied===expected;
}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  if(!authOk(req)) return res.status(401).json({error:"Unauthorized"});
  const email=String(req.body?.email||"").trim().toLowerCase();
  const product=String(req.body?.product||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:"Invalid email"});
  if(!PRODUCTS.has(product)) return res.status(400).json({error:"Invalid product"});
  try{
    await sendCrmMail({kind:"purchase",email,product});
    return res.status(200).json({ok:true});
  }catch(e){
    console.error("Purchase email failed",e?.message||e);
    return res.status(500).json({error:"Send failed"});
  }
}

