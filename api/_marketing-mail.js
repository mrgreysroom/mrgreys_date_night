import {sendCrmMail} from "./_crm-mail.js";
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
 sk:{reason:"Tento e-mail dostávaš, na základe vášho súhlasu s novinkami MR GREY’S DATE NIGHT.",unsub:"Odhlásiť marketingové e-maily"},
 cz:{reason:"Tenhle e-mail dostáváš, na základě vašeho souhlasu s novinkami MR GREY’S DATE NIGHT.",unsub:"Odhlásit marketingové e-maily"},
 pl:{reason:"Otrzymujesz tę wiadomość, na podstawie zgody na wiadomości MR GREY’S DATE NIGHT.",unsub:"Wypisz się z wiadomości marketingowych"},
 en:{reason:"You’re receiving this because you opted in to MR GREY’S DATE NIGHT updates.",unsub:"Unsubscribe from marketing emails"}
};

function shell(title,preheader,body,cta,email,language,key){
 const lang=L(language), l=legal[lang];
 const club=lang==="pl"?"https://mrgrey.pl/club":"https://mrgrey.sk/club";
 const target=key==="demo_4_complete"?(lang==="pl"?"https://mrgrey.pl/connection":"https://mrgrey.sk/connection"):key==="purchase_reminder_day7"?`${SITE}/account.html`:key==="purchase_complete_club_day3"||key==="demo_6_club_day10"?club:`${SITE}/?lang=${lang}#featuredBuy`;
 return `<!doctype html><html lang="${lang==="cz"?"cs":lang}"><body style="margin:0;background:#08070a;color:#f5eff8;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${preheader}</div><table width="100%" cellpadding="0" cellspacing="0" style="background:#08070a"><tr><td align="center" style="padding:28px 12px"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111015;border:1px solid #2e2635;border-radius:18px"><tr><td style="padding:34px 28px;text-align:center"><div style="font-size:13px;letter-spacing:4px;color:#b78acb">MR GREY’S</div><div style="font-size:26px;font-weight:700;margin:8px 0 28px">DATE NIGHT ✕</div><h1 style="font-size:24px;line-height:1.25;margin:0 0 18px">${title}</h1><div style="font-size:16px;line-height:1.65;color:#cfc7d4">${body}</div><a href="${target}" style="display:inline-block;margin-top:26px;padding:15px 24px;border-radius:999px;background:#a946d1;color:white;text-decoration:none;font-weight:700;letter-spacing:.5px">${cta}</a><div style="margin-top:32px;font-size:11px;line-height:1.5;color:#756d7a">${l.reason}<br><a href="${unsubscribeUrl(email)}" style="color:#a999b1">${l.unsub}</a></div></td></tr></table></td></tr></table></body></html>`;
}

const copy={
 sk:{
  purchase_complete_club_day3:["X COMPLETE je len začiatok ✕","Vstúpte do sveta MR GREY’S.","DATE NIGHT už máte. V Clube vás čakajú ďalšie hry, príbehy a členské výhody. <strong>Objavte viac.</strong>","VSTÚPIŤ DO CLUBU ✕"],
  demo_1_immediate:["Odvážite sa opýtať? ✕","Jedna otázka môže zmeniť večer.","<strong>Sex na jednu noc. Priznali ste si niekedy navzájom, či by ste to zopakovali?</strong><br><br>SECRETS otvára nevyslovené otázky. Odomknite X COMPLETE za <strong>19,99 €</strong>.","ODOMKNÚŤ X COMPLETE ✕"],
  demo_2_special_x:["Ktorý príkaz by fungoval na vás? ✕","Skutočná karta DARE.","<strong>Ktorý z týchto príkazov na teba funguje najviac: „poď bližšie“, „pozri sa na mňa“, „zostaň“ alebo „kľakni“?</strong><br><br>Objavte všetky štyri hry.","ODOMKNÚŤ X COMPLETE ✕"],
  demo_3_pack_followup:["Čo sa stane po zotmení? ✕","AFTER DARK.","Putá, zaviazané oči alebo slovné príkazy? <strong>Čo by ste spolu chceli skúsiť?</strong><br><br>ROMANTIC, SECRETS, DARE a AFTER DARK v jednom balíku.","ODOMKNÚŤ X COMPLETE ✕"],
  demo_4_complete:["Ako dobre sa naozaj poznáte? ✕","25 otázok zadarmo.","<strong>CONNECTION TEST</strong> vám v 25 otázkach ukáže, čo vás spája. Bezplatne.","SPUSTIŤ BEZPLATNÝ TEST ✕"],
  demo_5_last_call:["Jeden večer. Štyri nálady. ✕","Celý DATE NIGHT.","ROMANTIC, SECRETS, DARE a AFTER DARK. <strong>X COMPLETE za 19,99 € jednorazovo.</strong> Bez predplatného.","ODOMKNÚŤ X COMPLETE ✕"],
  demo_6_club_day10:["DATE NIGHT je len začiatok ✕","Objavte MR GREY’S CLUB.","Ďalšie hry, príbehy a členské výhody. <strong>Objavte celý svet MR GREY’S.</strong>","VSTÚPIŤ DO CLUBU ✕"],
  purchase_reminder_day7:["Vaša hra stále čaká ✕","Stačí začať.","DATE NIGHT už vlastníte. Otvorte svoje hry a vyberte si náladu spoločného večera.","OTVORIŤ MOJE HRY ✕"],
  purchase_single_upgrade_day1:["Jedna hra nestačí? ✕","Odomknite celý balík.","ROMANTIC, SECRETS, DARE aj AFTER DARK čakajú v X COMPLETE. Objavte všetky štyri hry.","OBJAVIŤ X COMPLETE ✕"],
  purchase_single_upgrade_day3:["Ešte jedna odvážna otázka ✕","Viac než jedna hra.","SECRETS otvára otázky. DARE prináša výzvy. AFTER DARK mení atmosféru. <strong>Objavte X COMPLETE.</strong>","OBJAVIŤ X COMPLETE ✕"],
 },
 cz:{
  purchase_complete_club_day3:["X COMPLETE je teprve začátek ✕","Objevte svět MR GREY’S.","DATE NIGHT už máte. V Clubu čekají další hry, příběhy a členské výhody.","VSTOUPIT DO CLUBU ✕"],
  demo_1_immediate:["Váš Date Night právě začíná ✕","První dvě nálady máte vybrané.","Osm karet byla jen ochutnávka. Jestli vás to chytlo, zbytek večera už čeká za dveřmi.","POKRAČOVAT V DATE NIGHT ✕"],
  demo_2_special_x:["SPECIAL X nekončí poslední kartou 😈","Některé karty mají dohru.","Některé výzvy skončí otočením karty. Jiné vám zůstanou v hlavě ještě zítra. A právě tam začíná SPECIAL X.","ODEMKNOUT DATE NIGHT ✕"],
  demo_3_pack_followup:["Který balíček vás dostal víc?","Vraťte se tam, kde to mezi vámi začalo jiskřit.","V demu jste sáhli po <strong>{packs}</strong>. Odemkněte si ten, ke kterému vás to táhne víc — nebo si vezměte rovnou celý večer.","ODEMKNOUT MŮJ BALÍČEK ✕"],
  demo_4_complete:["4 hry. Jeden přístup. X COMPLETE.","Když nechcete vybírat jen jednu náladu.","ROMANTIC, SECRETS, DARE i AFTER DARK v jednom přístupu. X COMPLETE je teď za launch cenu <strong>19,99 €</strong> jednorázově.","ODEMKNOUT X COMPLETE ✕"],
  demo_5_last_call:["Co když dnešní večer nebude úplně obyčejný…","Date Night je pořád připravený.","Jestli jste si demo nechali na potom, možná právě dnes nastal ten správný čas zjistit, co bylo dál.","POKRAČOVAT V DATE NIGHT ✕"]
 },
 pl:{
  purchase_complete_club_day3:["X COMPLETE to dopiero początek ✕","Odkryj świat MR GREY’S.","DATE NIGHT jest już Wasz. W Clubie czekają kolejne gry, historie i korzyści dla członków. <strong>Odkryj więcej.</strong>","DOŁĄCZ DO CLUBU ✕"],
  demo_1_immediate:["Odważycie się zapytać? ✕","Jedno pytanie może zmienić wieczór.","<strong>Seks na jedną noc. Czy kiedykolwiek przyznaliście sobie, czy chcielibyście to powtórzyć?</strong><br><br>SECRETS otwiera niewypowiedziane pytania. Odkryjcie X COMPLETE.","ODBLOKUJ X COMPLETE ✕"],
  demo_2_special_x:["Która komenda działa najmocniej? ✕","Prawdziwa karta DARE.","<strong>Która z tych komend działa na ciebie najmocniej: ‚bliżej‘, ‚patrz na mnie‘, ‚zostań‘ czy ‚klęknij‘?</strong><br><br>Odkryjcie wszystkie cztery gry.","ODBLOKUJ X COMPLETE ✕"],
  demo_3_pack_followup:["Co wydarzy się po zmroku? ✕","AFTER DARK.","Kajdanki, opaska na oczy czy słowne komendy? <strong>Co chcielibyście razem odkryć?</strong><br><br>Cztery gry w jednym zestawie.","ODBLOKUJ X COMPLETE ✕"],
  demo_4_complete:["Jak dobrze się znacie? ✕","25 pytań za darmo.","<strong>CONNECTION TEST</strong> to 25 pytań o Waszą relację. Całkowicie bezpłatnie.","ROZPOCZNIJ BEZPŁATNY TEST ✕"],
  demo_5_last_call:["Jeden wieczór. Cztery nastroje. ✕","Cały DATE NIGHT.","ROMANTIC, SECRETS, DARE i AFTER DARK. <strong>X COMPLETE za 95 zł jednorazowo.</strong> Bez abonamentu.","ODBLOKUJ X COMPLETE ✕"],
  demo_6_club_day10:["DATE NIGHT to dopiero początek ✕","Odkryjcie MR GREY’S CLUB.","Kolejne gry, historie i korzyści dla członków. <strong>Odkryjcie świat MR GREY’S.</strong>","DOŁĄCZ DO CLUBU ✕"],
  purchase_reminder_day7:["Wasza gra nadal czeka ✕","Wystarczy zacząć.","DATE NIGHT już należy do Was. Otwórzcie swoje gry i wybierzcie nastrój na dziś.","OTWÓRZ MOJE GRY ✕"],
  purchase_single_upgrade_day1:["Jedna gra to za mało? ✕","Odkryjcie cały zestaw.","ROMANTIC, SECRETS, DARE i AFTER DARK czekają w X COMPLETE.","ODKRYJ X COMPLETE ✕"],
  purchase_single_upgrade_day3:["Jeszcze jedno odważne pytanie ✕","Więcej niż jedna gra.","SECRETS odkrywa pytania. DARE przynosi wyzwania. AFTER DARK zmienia atmosferę. <strong>Odkryjcie X COMPLETE.</strong>","ODKRYJ X COMPLETE ✕"],
 },
 en:{
  purchase_complete_club_day3:["X COMPLETE is only the beginning ✕","Discover MR GREY’S WORLD.","DATE NIGHT is yours. The Club unlocks more games, stories and member benefits.","JOIN THE CLUB ✕"],
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
 return {subject:row[0],html:shell(row[0],row[1],body,row[3],email,lang,key)};
}

export async function sendMarketingMail({email,key,packs,language,jobId}){
 const msg=template(key,email,packs,language);
 return sendCrmMail({kind:"marketing",queueId:jobId,...msg});
}

