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
 sk:{reason:"Tento e-mail dostávaš, pretože si dobrovoľne udelili súhlas s novinkami MR GREY’S DATE NIGHT.",unsub:"Odhlásiť marketingové e-maily"},
 cz:{reason:"Tenhle e-mail dostáváš, protože jsi dobrovolně udělili souhlas s novinkami MR GREY’S DATE NIGHT.",unsub:"Odhlásit marketingové e-maily"},
 pl:{reason:"Otrzymujesz tę wiadomość, ponieważ dobrowolnie wyrażono zgodę się na nowości MR GREY’S DATE NIGHT.",unsub:"Wypisz się z wiadomości marketingowych"},
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
  demo_1_immediate:["Odważycie się zapytać? ✕","Jedno pytanie może zmienić wieczór.","<strong>Seks na jedną noc. Czy kiedykolwiek przyznaliście sobie, czy chcielibyście to powtórzyć?</strong><br><br>SECRETS otwiera tematy, o których zwykle się milczy. Odkryjcie cztery gry w X COMPLETE.","ODBLOKUJ X COMPLETE ✕"],
  demo_2_special_x:["Która komenda działa najmocniej? ✕","Prawdziwa karta DARE.","<strong>Która z tych komend działa na ciebie najmocniej: ‚bliżej‘, ‚patrz na mnie‘, ‚zostań‘ czy ‚klęknij‘?</strong><br><br>To tylko jedno z wyzwań DATE NIGHT. Odkryjcie wszystkie cztery gry.","ODBLOKUJ X COMPLETE ✕"],
  demo_3_pack_followup:["A co wydarzy się po zmroku? ✕","AFTER DARK dla odważnych.","Kajdanki, opaska na oczy czy słowne komendy? <strong>Co chcielibyście razem odkryć?</strong><br><br>ROMANTIC, SECRETS, DARE i AFTER DARK w jednym zestawie.","ODBLOKUJ X COMPLETE ✕"],
  demo_4_complete:["Jak dobrze się znacie? ✕","25 pytań. Bezpłatny test.","Co Was łączy, a co może jeszcze zaskoczyć? <strong>CONNECTION TEST</strong> to 25 pytań o Waszą relację. Całkowicie za darmo.","ROZPOCZNIJ BEZPŁATNY TEST ✕"],
  demo_5_last_call:["Jeden wieczór. Cztery nastroje. ✕","Cały DATE NIGHT w jednym miejscu.","ROMANTIC, SECRETS, DARE i AFTER DARK. <strong>X COMPLETE za 95 zł jednorazowo.</strong> Bez abonamentu. Wybierzcie wieczór, który zapamiętacie.","ODBLOKUJ X COMPLETE ✕"],
  demo_6_club_day10:["DATE NIGHT to dopiero początek ✕","Odkryjcie świat MR GREY’S.","Gry, odważne historie, nowe doświadczenia i korzyści dla członków. <strong>MR GREY’S CLUB</strong> czeka.","DOŁĄCZ DO CLUBU ✕"],
  purchase_reminder_day7:["Wasza gra nadal czeka ✕","Macie ją. Wystarczy zacząć.","DATE NIGHT już należy do Was. Znajdźcie chwilę dla siebie, otwórzcie swoje gry i wybierzcie nastrój na dziś.","OTWÓRZ MOJE GRY ✕"],
  purchase_single_upgrade_day1:["Jedna gra to za mało? ✕","Odkryjcie wszystkie cztery nastroje.","Wasza gra to dopiero początek. <strong>ROMANTIC, SECRETS, DARE i AFTER DARK</strong> czekają w X COMPLETE.","ODKRYJ X COMPLETE ✕"],
  purchase_single_upgrade_day3:["Jeszcze jedno odważne pytanie ✕","Odkryjcie więcej.","SECRETS ujawnia niewypowiedziane pytania. DARE przynosi wyzwania. AFTER DARK podkręca atmosferę. <strong>Wszystkie cztery gry w X COMPLETE.</strong>","ODKRYJ X COMPLETE ✕"],
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
  demo_1_immediate:["Wasz Date Night właśnie się zaczyna ✕","Wybraliście dwie pierwsze energie wieczoru.","Osiem kart to był tylko przedsmak. Jeśli zrobiło się ciekawie, reszta wieczoru już na Was czeka.","WRÓĆ DO DATE NIGHT ✕"],
  demo_2_special_x:["SPECIAL X nie kończy się na ostatniej karcie 😈","Niektóre karty mają ciąg dalszy.","Jedne wyzwania kończą się po odwróceniu karty. Inne zostają z Wami do następnego dnia. Właśnie na tym polega SPECIAL X.","ODBLOKUJ DATE NIGHT ✕"],
  demo_3_pack_followup:["Który pakiet wciągnął Was bardziej?","Wróćcie do klimatu, przy którym zrobiło się najciekawiej.","W demo wybraliście <strong>{packs}</strong>. Możecie odblokować ten pakiet, do którego chcecie wrócić — albo od razu cały zestaw.","ODBLOKUJ MÓJ PAKIET ✕"],
  demo_4_complete:["4 gry. Jeden dostęp. X COMPLETE.","Cały Date Night bez wybierania tylko jednego klimatu.","ROMANTIC, SECRETS, DARE i AFTER DARK w jednym dostępie. X COMPLETE w cenie <strong>95 zł</strong> — jednorazowo.","ODBLOKUJ X COMPLETE ✕"],
  demo_5_last_call:["Może dzisiejszy wieczór nie musi być zwyczajny…","Date Night nadal na Was czeka.","Jeśli odłożyliście demo na później, być może właśnie dziś jest dobry moment, żeby sprawdzić, co było dalej.","WRÓĆ DO DATE NIGHT ✕"]
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

