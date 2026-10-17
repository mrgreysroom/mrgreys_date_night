const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm')
function runtime(lang='pl'){const ctx=vm.createContext({window:{},document:{documentElement:{},readyState:'loading',addEventListener(){}},URLSearchParams,location:{search:'?lang='+lang},navigator:{language:'pl'},localStorage:{getItem(){return null},setItem(){}}});vm.runInContext(fs.readFileSync('pricing.js','utf8'),ctx);vm.runInContext(fs.readFileSync('i18n-core.js','utf8'),ctx);return ctx.window}
const pl=runtime(),sk=runtime('sk');let texts=0
for(const file of ['index.html','account.html','play.html','success.html','offline.html']){
 const source=fs.readFileSync(file,'utf8');assert(source.includes('/i18n-core.js'));const html=source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'')
 for(const part of html.split(/<[^>]+>/)){const s=part.trim();if(!s||!/[áäčďéíĺľňóôŕšťúýžÁČĎÉÍĽŇÓŠŤÚÝŽ]/.test(s))continue;assert.notEqual(pl.MRG_T(s),s,file+': '+s);assert.equal(sk.MRG_T(s),s);texts++}
}
for(const s of ['Hotovo. Zakúpené hry sú pripravené offline na 30 dní od posledného online overenia.','Prístup je uložený v tomto zariadení. Offline overenie platí do 18.10.2026; pri každom online otvorení sa automaticky obnoví.','Použite prosím najnovší prijatý e-mail. Ďalší odkaz môžete poslať o 59 s.','Prihlasovací odkaz ste si vyžiadali príliš rýchlo za sebou. Počkajte prosím aspoň 60 sekúnd a skúste to znova.'])assert.notEqual(pl.MRG_T(s),s)
assert.match(fs.readFileSync('account.html','utf8'),/emailRedirectTo:location.origin\+"\/account.html\?lang="/)
assert(fs.readFileSync('service-worker.js','utf8').includes('v4-polish-flow'))
const a=JSON.parse(fs.readFileSync('locales/cards-sk.json')),b=JSON.parse(fs.readFileSync('locales/cards-pl.json'));let cards=0
for(const pack of Object.keys(a)){assert.equal(b[pack].length,a[pack].length);a[pack].forEach((x,i)=>{assert.equal(b[pack][i]._id,x._id);assert.equal(b[pack][i].type,x.type);assert.notEqual(b[pack][i].text,x.text);assert(!/[ľťčďá]/i.test(b[pack][i].text));cards++})}
console.log(`PASS: ${texts} Slovak static UI fragments localized across five screens; PL offline/cooldown errors; login return preserves lang; ${cards} Polish cards with original IDs/types; no login or real mail sent`)
