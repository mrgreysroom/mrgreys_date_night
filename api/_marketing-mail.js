import nodemailer from "nodemailer";
import crypto from "crypto";

const SITE="https://datenight.mrgreysroom.sk";
const FROM='"MR GREY’S DATE NIGHT" <info@mrgreysroom.sk>';
const packNames={romantic:"ROMANTIC",secrets:"SECRETS",dare:"DARE",afterdark:"AFTER DARK"};

export function unsubscribeToken(email){
  return crypto.createHmac("sha256",process.env.MARKETING_UNSUBSCRIBE_SECRET||"").update(email).digest("hex");
}
export function unsubscribeUrl(email){ return `${SITE}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email)}`; }

function shell(title,preheader,body,cta,email){
 return `<!doctype html><html><body style="margin:0;background:#08070a;color:#f5eff8;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${preheader}</div><table width="100%" cellpadding="0" cellspacing="0" style="background:#08070a"><tr><td align="center" style="padding:28px 12px"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111015;border:1px solid #2e2635;border-radius:18px"><tr><td style="padding:34px 28px;text-align:center"><div style="font-size:13px;letter-spacing:4px;color:#b78acb">MR GREY’S</div><div style="font-size:26px;font-weight:700;margin:8px 0 28px">DATE NIGHT ✕</div><h1 style="font-size:24px;line-height:1.25;margin:0 0 18px">${title}</h1><div style="font-size:16px;line-height:1.65;color:#cfc7d4">${body}</div><a href="${SITE}/#try" style="display:inline-block;margin-top:26px;padding:15px 24px;border-radius:999px;background:#a946d1;color:white;text-decoration:none;font-weight:700;letter-spacing:.5px">${cta}</a><div style="margin-top:32px;font-size:11px;line-height:1.5;color:#756d7a">Tento e-mail dostávaš, pretože si dobrovoľne súhlasil/a s novinkami MR GREY’S DATE NIGHT.<br><a href="${unsubscribeUrl(email)}" style="color:#a999b1">Odhlásiť marketingové e-maily</a></div></td></tr></table></td></tr></table></body></html>`;
}

export function template(key,email,packs=[]){
 const chosen=packs.map(p=>packNames[p]).filter(Boolean);
 if(key==="demo_1_immediate") return {subject:"Tvoj Date Night sa práve začína ✕",html:shell("Tvoj Date Night sa práve začína ✕","Vybrali ste si svoje prvé dve nálady.","Ukážka bola iba začiatok. Keď budete chcieť pokračovať, celý Date Night na vás čaká.","POKRAČOVAŤ V DATE NIGHT ✕",email)};
 if(key==="demo_2_special_x") return {subject:"SPECIAL X ešte nekončí dnes večer 😈",html:shell("SPECIAL X ešte nekončí dnes večer 😈","Niektoré karty pokračujú aj po otočení.","Niektoré momenty skončia po otočení karty. Iné dokážu zmeniť celý večer. Pokračovanie je pripravené.","ODOMKNÚŤ DATE NIGHT ✕",email)};
 if(key==="demo_3_pack_followup") return {subject:"Ktorý z vašich dvoch balíkov vás lákal viac?",html:shell("Ktorý vás lákal viac?","Vráťte sa k nálade, ktorá vám sadla najviac.",chosen.length?`V deme ste si vybrali <strong>${chosen.join(" + ")}</strong>. Teraz si môžete odomknúť ten, ku ktorému sa chcete vrátiť — alebo rovno všetky.`:"Vráťte sa k balíku, ktorý vás zaujal najviac — alebo si odomknite všetky naraz.","ODOMKNÚŤ MÔJ BALÍK ✕",email)};
 if(key==="demo_4_complete") return {subject:"4 hry. Jeden prístup. X COMPLETE.",html:shell("4 hry. Jeden prístup. X COMPLETE.","Celý Date Night v jednom prístupe.","ROMANTIC, SECRETS, DARE aj AFTER DARK. X COMPLETE ich spája do jedného prístupu za launch cenu <strong>19,99 €</strong> — jednorazovo.","ODOMKNÚŤ X COMPLETE ✕",email)};
 return {subject:"Možno dnes nebude obyčajný večer…",html:shell("Možno dnes nebude obyčajný večer…","Date Night je stále pripravený.","Ak ste si ukážku odložili na neskôr, toto môže byť ten správny večer pokračovať.","POKRAČOVAŤ V DATE NIGHT ✕",email)};
}

export function transporter(){
 if(!process.env.SMTP_PASSWORD) throw new Error("SMTP_PASSWORD missing");
 return nodemailer.createTransport({host:"smtp.m1.websupport.sk",port:587,secure:false,requireTLS:true,auth:{user:"info@mrgreysroom.sk",pass:process.env.SMTP_PASSWORD}});
}
export async function sendMarketingMail({email,key,packs}){
 const msg=template(key,email,packs);
 return transporter().sendMail({from:FROM,to:email,subject:msg.subject,html:msg.html});
}
