import nodemailer from "nodemailer";

const SITE="https://datenight.mrgreysroom.sk";
const FROM='"MR GREY’S DATE NIGHT" <info@mrgreysroom.sk>';
const NAMES={romantic:"ROMANTIC",secrets:"SECRETS",dare:"DARE",afterdark:"AFTER DARK",complete:"X COMPLETE"};

function html(product){
  const name=NAMES[product]||"DATE NIGHT";
  return `<!doctype html><html><body style="margin:0;background:#08070a;color:#f5eff8;font-family:Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">Platba prebehla úspešne. Vaša hra ${name} je pripravená.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08070a"><tr><td align="center" style="padding:28px 12px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111015;border:1px solid #33273a;border-radius:20px">
  <tr><td style="padding:38px 28px;text-align:center">
    <div style="font-size:13px;letter-spacing:4px;color:#b78acb">MR GREY’S</div>
    <div style="font-size:27px;font-weight:700;margin:8px 0 30px">DATE NIGHT ✕</div>
    <div style="font-size:42px;line-height:1;color:#c052ff;margin-bottom:18px">✕</div>
    <h1 style="font-size:25px;line-height:1.25;margin:0 0 16px;color:#fff">${name} je váš.</h1>
    <div style="font-size:16px;line-height:1.7;color:#cfc7d4">Ďakujeme za nákup. Platba prebehla úspešne a hra bola natrvalo priradená k e-mailu použitému pri objednávke.</div>
    <a href="${SITE}/account.html" style="display:inline-block;margin-top:28px;padding:16px 26px;border-radius:999px;background:#a946d1;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.5px">OTVORIŤ MOJE HRY ✕</a>
    <div style="margin-top:26px;font-size:13px;line-height:1.65;color:#958b9a">Na stránke <strong style="color:#d9d0dd">Moje hry</strong> zadajte rovnaký e-mail. Pošleme vám bezpečný prihlasovací odkaz. Žiadne heslo si nemusíte pamätať.</div>
    <div style="margin-top:30px;border-top:1px solid #2e2635;padding-top:20px;font-size:11px;line-height:1.55;color:#756d7a">Toto je servisný e-mail k vášmu nákupu MR GREY’S DATE NIGHT.</div>
  </td></tr></table></td></tr></table></body></html>`;
}

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
  if(!NAMES[product]) return res.status(400).json({error:"Invalid product"});
  if(!process.env.SMTP_PASSWORD) return res.status(503).json({error:"SMTP not configured"});
  try{
    const transport=nodemailer.createTransport({host:"smtp.m1.websupport.sk",port:587,secure:false,requireTLS:true,auth:{user:"info@mrgreysroom.sk",pass:process.env.SMTP_PASSWORD}});
    const name=NAMES[product];
    await transport.sendMail({from:FROM,to:email,subject:`${name} je váš ✕`,html:html(product)});
    return res.status(200).json({ok:true});
  }catch(e){
    console.error("Purchase email failed",e?.message||e);
    return res.status(500).json({error:"Send failed"});
  }
}
