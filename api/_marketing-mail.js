import nodemailer from "nodemailer";
import crypto from "crypto";

const SITE="https://datenight.mrgreysroom.sk";
const FROM='"MR GREY’S DATE NIGHT" <info@mrgreysroom.sk>';
const packNames={romantic:"ROMANTIC",secrets:"SECRETS",dare:"DARE",afterdark:"AFTER DARK"};
const VALID_LANGS=new Set(["sk","cz","pl","en"]);
const L=v=>VALID_LANGS.has(String(v||"sk").toLowerCase())?String(v).toLowerCase():"sk";

export function unsubscribeToken(email){
  return crypto.createHmac("sha256",process.env.MARKETING_UNSUBSCRIBE_SECRET||"").update(email).digest("hex");
}
export function unsubscribeUrl(email){ return `${SITE}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email)}`; }

const legal={
 sk:{reason:"Tento e-mail dostávaš, pretože si dobrovoľne súhlasil/a s novinkami MR GREY’S DATE NIGHT.",unsub:"Odhlásiť marketingové e-maily"},
 cz:{reason:"Tenhle e-mail dostáváš, protože jsi dobrovolně souhlasil/a s novinkami MR GREY’S DATE NIGHT.",unsub:"Odhlásit marketingové e-maily"},
 pl:{reason:"Otrzymujesz tę wiadomość, ponieważ dobrowolnie zgodziłeś/aś się na nowości MR GREY’S DATE NIGHT.",unsub:"Wypisz się z wiadomości marketingowych"},
 en:{reason:"You’re receiving this because you opted in to MR GREY’S DATE NIGHT updates.",unsub:"Unsubscribe from marketing emails"}
};

function shell(title,preheader,body,cta,email,language){
 const lang=L(language), l=legal[lang];
 return `<!doctype html><html lang="${lang==="cz"?"cs":lang}"><body style="margin:0;background:#08070a;color:#f5eff8;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${preheader}</div><table width="100%" cellpadding="0" cellspacing="0" style="background:#08070a"><tr><td align="center" style="padding:28px 12px"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111015;border:1px solid #2e2635;border-radius:18px"><tr><td style="padding:34px 28px;text-align:center"><div style="font-size:13px;letter-spacing:4px;color:#b78acb">MR GREY’S</div><div style="font-size:26px;font-weight:700;margin:8px 0 28px">DATE NIGHT ✕</div><h1 style="font-size:24px;line-height:1.25;margin:0 0 18px">${title}</h1><div style="font-size:16px;line-height:1.65;color:#cfc7d4">${body}</div><a href="${SITE}/?lang=${lang}#try" style="display:inline-block;margin-top:26px;padding:15px 24px;border-radius:999px;background:#a946d1;color:white;text-decoration:none;font-weight:700;letter-spacing:.5px">${cta}</a><div style="margin-top:32px;font-size:11px;line-height:1.5;color:#756d7a">${l.reason}<br><a href="${unsubscribeUrl(email)}" style="color:#a999b1">${l.unsub}</a></div></td></tr></table></td></tr></table></body></html>`;
}

const copy={
 sk:{
  demo_1_immediate:["Tvoj Date Night sa práve začína ✕","Vybrali ste si svoje prvé dve nálady.","Ukážka bola iba začiatok. Keď budete chcieť pokračovať, celý Date Night na vás čaká.","POKRAČOVAŤ V DATE NIGHT ✕"],
  demo_2_special_x:["SPECIAL X ešte nekončí dnes večer 😈","Niektoré karty pokračujú aj po otočení.","Niektoré momenty skončia po otočení karty. Iné dokážu zmeniť celý večer. Pokračovanie je pripravené.","ODOMKNÚŤ DATE NIGHT ✕"],
  demo_3_pack_followup:["Ktorý z vašich dvoch balíkov vás lákal viac?","Vráťte sa k nálade, ktorá vám sadla najviac.","V deme ste si vybrali <strong>{packs}</strong>. Teraz si môžete odomknúť ten, ku ktorému sa chcete vrátiť — alebo rovno všetky.","ODOMKNÚŤ MÔJ BALÍK ✕"],
  demo_4_complete:["4 hry. Jeden prístup. X COMPLETE.","Celý Date Night v jednom prístupe.","ROMANTIC, SECRETS, DARE aj AFTER DARK. X COMPLETE ich spája do jedného prístupu za launch cenu <strong>19,99 €</strong> — jednorazovo.","ODOMKNÚŤ X COMPLETE ✕"],
  demo_5_last_call:["Možno dnes nebude obyčajný večer…","Date Night je stále pripravený.","Ak ste si ukážku odložili na neskôr, toto môže byť ten správny večer pokračovať.","POKRAČOVAŤ V DATE NIGHT ✕"]
 },
 cz:{
  demo_1_immediate:["Váš Date Night právě začíná ✕","První dvě nálady máte vybrané.","Osm karet byla jen ochutnávka. Jestli vás to chytlo, zbytek večera už čeká za dveřmi.","POKRAČOVAT V DATE NIGHT ✕"],
  demo_2_special_x:["SPECIAL X nekončí poslední kartou 😈","Některé karty mají dohru.","Některé výzvy skončí otočením karty. Jiné vám zůstanou v hlavě ještě zítra. A právě tam začíná SPECIAL X.","ODEMKNOUT DATE NIGHT ✕"],
  demo_3_pack_followup:["Který balíček vás dostal víc?","Vraťte se tam, kde to mezi vámi začalo jiskřit.","V demu jste sáhli po <strong>{packs}</strong>. Odemkněte si ten, ke kterému vás to táhne víc — nebo si vezměte rovnou celý večer.","ODEMKNOUT MŮJ BALÍČEK ✕"],
  demo_4_complete:["4 hry. Jeden přístup. X COMPLETE.","Když nechcete vybírat jen jednu náladu.","ROMANTIC, SECRETS, DARE i AFTER DARK v jednom přístupu. X COMPLETE je teď za launch cenu <strong>19,99 €</strong> jednorázově.","ODEMKNOUT X COMPLETE ✕"],
  demo_5_last_call:["Co když dnešní večer nebude úplně obyčejný…","Date Night je pořád připravený.","Jestli jste si demo nechali na potom, možná právě dnes nastal ten správný čas zjistit, co bylo dál.","POKRAČOVAT V DATE NIGHT ✕"]
 },
 pl:{
  demo_1_immediate:["Wasz Date Night właśnie się zaczyna ✕","Wybraliście dwie pierwsze energie wieczoru.","Osiem kart to był tylko przedsmak. Jeśli zrobiło się ciekawie, reszta wieczoru już na Was czeka.","WRÓĆ DO DATE NIGHT ✕"],
  demo_2_special_x:["SPECIAL X nie kończy się na ostatniej karcie 😈","Niektóre karty mają ciąg dalszy.","Jedne wyzwania kończą się po odwróceniu karty. Inne zostają z Wami do następnego dnia. Właśnie na tym polega SPECIAL X.","ODBLOKUJ DATE NIGHT ✕"],
  demo_3_pack_followup:["Który pakiet wciągnął Was bardziej?","Wróćcie do klimatu, przy którym zrobiło się najciekawiej.","W demo wybraliście <strong>{packs}</strong>. Możecie odblokować ten pakiet, do którego chcecie wrócić — albo od razu cały zestaw.","ODBLOKUJ MÓJ PAKIET ✕"],
  demo_4_complete:["4 gry. Jeden dostęp. X COMPLETE.","Cały Date Night bez wybierania tylko jednego klimatu.","ROMANTIC, SECRETS, DARE i AFTER DARK w jednym dostępie. X COMPLETE w cenie startowej <strong>19,99 €</strong> — jednorazowo.","ODBLOKUJ X COMPLETE ✕"],
  demo_5_last_call:["Może dzisiejszy wieczór nie musi być zwyczajny…","Date Night nadal na Was czeka.","Jeśli odłożyliście demo na później, być może właśnie dziś jest dobry moment, żeby sprawdzić, co było dalej.","WRÓĆ DO DATE NIGHT ✕"]
 },
 en:{
  demo_1_immediate:["Your Date Night just started ✕","You picked your first two moods.","Eight cards were only the teaser. If the room already feels different, the rest of the night is waiting.","KEEP THE DATE NIGHT GOING ✕"],
  demo_2_special_x:["SPECIAL X doesn’t end with the last card 😈","Some cards have an after-effect.","Some challenges end when you flip the card. Others stay in your head tomorrow. That’s where SPECIAL X really begins.","UNLOCK DATE NIGHT ✕"],
  demo_3_pack_followup:["Which of your two packs pulled you in more?","Go back to the mood that sparked the most tension.","In the demo you chose <strong>{packs}</strong>. Unlock the one you want more of — or take the whole collection.","UNLOCK MY PACK ✕"],
  demo_4_complete:["4 games. One access. X COMPLETE.","Every Date Night mood in one place.","ROMANTIC, SECRETS, DARE and AFTER DARK together. X COMPLETE is currently <strong>€19.99</strong> as a one-time launch price.","UNLOCK X COMPLETE ✕"],
  demo_5_last_call:["Maybe tonight doesn’t have to be ordinary…","Date Night is still waiting.","If you saved the demo for later, tonight might be exactly the right time to see what comes next.","KEEP THE DATE NIGHT GOING ✕"]
 }
};

export function template(key,email,packs=[],language="sk"){
 const lang=L(language), c=copy[lang], chosen=packs.map(p=>packNames[p]).filter(Boolean).join(" + ");
 const row=c[key]||c.demo_5_last_call;
 const body=row[2].replace("{packs}",chosen|| (lang==="cz"?"vaše dva balíčky":lang==="pl"?"Wasze dwa pakiety":lang==="en"?"your two packs":"vaše dva balíky"));
 return {subject:row[0],html:shell(row[0],row[1],body,row[3],email,lang)};
}

export function transporter(){
 if(!process.env.SMTP_PASSWORD) throw new Error("SMTP_PASSWORD missing");
 return nodemailer.createTransport({host:"smtp.m1.websupport.sk",port:587,secure:false,requireTLS:true,auth:{user:"info@mrgreysroom.sk",pass:process.env.SMTP_PASSWORD}});
}
export async function sendMarketingMail({email,key,packs,language}){
 const msg=template(key,email,packs,language);
 return transporter().sendMail({from:FROM,to:email,subject:msg.subject,html:msg.html});
}
