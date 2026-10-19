// Acquisition labels only; never questionnaire answers, email, tokens or full URLs.
export const ACQUISITION_KEYS=['source','medium','campaign','content','term','campaign_id','adset_id','ad_id','placement']
export function cleanAcquisition(input={}){
 if(!input||typeof input!=='object')input={}
 const out={}
 for(const key of ACQUISITION_KEYS){const v=input[key];out[key]=typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,120}$/.test(v)&&(!key.endsWith('_id')||/^\d{5,30}$/.test(v))?v:null}
 return out
}
export function acquisitionMetadata(form,input={}){
 const last=cleanAcquisition(input),first=cleanAcquisition(input?.first_touch||input)
 for(const [prefix,touch] of [['acq_',last],['first_acq_',first]])for(const [key,value] of Object.entries(touch))if(value){form.set('metadata['+prefix+key+']',value);if(form.get('mode')==='subscription')form.set('subscription_data[metadata]['+prefix+key+']',value)}
}
export function acquisitionFromMetadata(metadata={}){
 const read=prefix=>cleanAcquisition(Object.fromEntries(ACQUISITION_KEYS.map(k=>[k,metadata[prefix+k]])))
 const last=read('acq_'),first=read('first_acq_')
 return {...last,first_touch:first.source?first:last}
}
export function requestAcquisition(req){try{const raw=req.cookies?.get('mrgrey_acquisition')?.value||String(req.headers.get('cookie')||'').split('; ').find(x=>x.startsWith('mrgrey_acquisition='))?.split('=').slice(1).join('=');const x=JSON.parse(decodeURIComponent(raw||''));return {...cleanAcquisition(x),first_touch:cleanAcquisition(x.first_touch)}}catch{return {}}}
export const cleanConnectionAttribution=cleanAcquisition
export function connectionContext(){
 if(typeof window==='undefined')return {}
 try{
 const q=new URLSearchParams(location.search)
 if(q.get('qa')==='1'){sessionStorage.setItem('connection_qa','1');return {qa:true}}
 const test=q.get('test');if(['my-dvaja','bez-filtra','nasa-buducnost'].includes(test))sessionStorage.setItem('connection_next_test',test)
 const current=cleanAcquisition(Object.fromEntries(['source','medium','campaign','content','term'].map(k=>[k,q.get('utm_'+k)]).concat(['campaign_id','adset_id','ad_id','placement'].map(k=>[k,q.get(k)||(k==='campaign_id'?q.get('utm_id'):null)]))))
 const prior=JSON.parse(sessionStorage.getItem('connection_attribution')||'{}')
 if(!current.source&&!prior.source){try{const host=new URL(document.referrer).hostname;if(!['mrgrey.sk','www.mrgrey.sk','mrgrey.pl','www.mrgrey.pl','datenight.mrgreysroom.sk','mrgreysroom.sk','www.mrgreysroom.sk'].includes(host)){current.source=/facebook\.com$|fb\.com$/.test(host)?'facebook':/instagram\.com$/.test(host)?'instagram':/^([a-z]+\.)?google\./.test(host)?'google':'referral';current.medium=current.source==='google'?'organic_search':'referral'}}catch{}}
 const last=current.source?current:cleanAcquisition(prior)
 const first=cleanAcquisition(prior.first_touch?.source?prior.first_touch:prior.source?prior:last)
 const attribution={...last,first_touch:first}
 sessionStorage.setItem('connection_attribution',JSON.stringify(attribution))
 // Session cookie carries the same labels to server-rendered purchase links.
 document.cookie='mrgrey_acquisition='+encodeURIComponent(JSON.stringify(attribution))+'; Path=/; SameSite=Lax; Secure'
 let id=sessionStorage.getItem('connection_visit');if(!/^[a-f0-9-]{36}$/i.test(id||'')){id=crypto.randomUUID();sessionStorage.setItem('connection_visit',id)}
 return {id,attribution,qa:sessionStorage.getItem('connection_qa')==='1'}
 }catch{return {id:crypto.randomUUID(),attribution:{}}}
}
// This module never accepts quiz answers, profiles or contact information.
export const META_PIXEL_ID='1387350766843286'
export const META_CONSENT_KEY='mrgrey_marketing_consent_v1'
const MAX_AGE=180*24*60*60*1000
let loading=null
export function marketingAllowed(){
 try{const c=JSON.parse(localStorage.getItem(META_CONSENT_KEY)||'null');return c?.allowed===true&&Date.now()-c.at<MAX_AGE}catch{return false}
}
export function hasMarketingChoice(){
 try{const c=JSON.parse(localStorage.getItem(META_CONSENT_KEY)||'null');return typeof c?.allowed==='boolean'&&Date.now()-c.at<MAX_AGE}catch{return false}
}
export function setMarketingChoice(allowed){
 try{localStorage.setItem(META_CONSENT_KEY,JSON.stringify({allowed:allowed===true,at:Date.now()}))}catch{}
 if(!allowed&&window.fbq)window.fbq('consent','revoke')
 if(!allowed){const parent='.mrgreysroom.sk';for(const name of ['_fbp','_fbc'])for(const domain of ['',location.hostname,parent])document.cookie=`${name}=; Max-Age=0; Path=/; SameSite=Lax${domain?'; Domain='+domain:''}`}
 window.dispatchEvent(new Event('mrgrey:marketing-consent'))
}
function prepareUrl(){
 connectionContext()
 // In particular, never expose Stripe's Checkout session token to Meta.
 const u=new URL(location.href),q=new URLSearchParams()
 if(['sk','cs','pl','en'].includes(u.searchParams.get('lang')))q.set('lang',u.searchParams.get('lang'))
 if(['connection','connection_email'].includes(u.searchParams.get('source')))q.set('source',u.searchParams.get('source'))
 if(u.searchParams.get('cancelled')==='1')q.set('cancelled','1')
 const fbclid=u.searchParams.get('fbclid');if(fbclid&&/^[A-Za-z0-9_-]{1,500}$/.test(fbclid))q.set('fbclid',fbclid)
 const attribution=cleanConnectionAttribution({source:u.searchParams.get('utm_source'),medium:u.searchParams.get('utm_medium'),campaign:u.searchParams.get('utm_campaign'),content:u.searchParams.get('utm_content')})
 for(const [key,value] of Object.entries(attribution))if(value&&['source','medium','campaign','content','term'].includes(key))q.set('utm_'+key,value)
 const next=u.pathname+(q.size?'?'+q.toString():'');if(next!==u.pathname+u.search)history.replaceState(history.state,'',next)
}
function loadPixel(){
 if(loading)return loading
 loading=new Promise(resolve=>{
  if(!window.fbq){const f=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments)};f.queue=[];f.loaded=true;f.version='2.0';f.push=f;window.fbq=f;window._fbq=f}
  window.fbq('consent','grant')
  window.fbq('set','autoConfig',false,META_PIXEL_ID)
  window.fbq('init',META_PIXEL_ID)
  const script=document.createElement('script');script.id='mrgrey-meta-pixel';script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';script.referrerPolicy='no-referrer';script.onload=()=>{script.dataset.loaded='true';resolve(true)};script.onerror=()=>{loading=null;script.remove();resolve(false)};document.head.appendChild(script)
  setTimeout(()=>resolve(false),4000)
 });return loading
}
export async function trackMarketing(event,purchase){
 if(typeof window==='undefined'||!['datenight.mrgreysroom.sk'].includes(location.hostname)||!marketingAllowed())return false
 const path=location.pathname.replace(/^\/(?:sk|cs|pl|en)(?=\/|$)/,'')||'/'
 if(!['/','/index.html','/success.html'].includes(path))return false
 if(!['PageView','Lead','InitiateCheckout','Purchase'].includes(event))return false
 if(event==='Purchase'&&(!purchase||!/^game_[a-f0-9]{64}$/.test(purchase.eventId)||!Number.isInteger(purchase.amount)||purchase.amount<=0||!['EUR','PLN'].includes(purchase.currency)))return false
 prepareUrl()
 if(event==='Lead'){try{if(sessionStorage.getItem('mrgrey_meta_lead'))return false}catch{}}
 if(!await loadPixel()||!marketingAllowed())return false
 window.fbq('consent','grant')
 if(event==='Purchase'){
  const key='mrgrey_meta_'+purchase.eventId
  try{if(localStorage.getItem(key))return false}catch{}
  window.fbq('trackSingle',META_PIXEL_ID,event,{value:purchase.amount/100,currency:purchase.currency},{eventID:purchase.eventId})
  try{localStorage.setItem(key,String(Date.now()))}catch{}
 }else {window.fbq('trackSingle',META_PIXEL_ID,event);if(event==='Lead')try{sessionStorage.setItem('mrgrey_meta_lead','1')}catch{}}
 return true // queued in the browser; this is not a Meta delivery acknowledgement
}

window.MRG_ACQUISITION=connectionContext
window.MRG_TRACK=trackMarketing
connectionContext()
const lang=new URLSearchParams(location.search).get('lang')||'sk'
const c=lang==='pl'?['Opcjonalny pomiar reklam','Za Twoją zgodą Meta Pixel mierzy wizytę, przesłanie kontaktu i zakup. Nie wysyłamy adresu e-mail ani treści gry.','Zezwól','Odrzuć','Prywatność']:lang==='en'?['Optional advertising measurement','With consent, Meta Pixel measures visits, contact submissions and purchases. We do not send your email or game content.','Allow','Decline','Privacy']:lang==='cz'?['Volitelné reklamní měření','S vaším souhlasem Meta Pixel měří návštěvy, odeslání kontaktu a nákupy. Neposíláme e-mail ani obsah hry.','Povolit','Odmítnout','Soukromí']:['Voliteľné reklamné meranie','S vaším súhlasom Meta Pixel meria návštevy, odoslanie kontaktu a nákupy. Neposielame e-mail ani obsah hry.','Povoliť','Odmietnuť','Súkromie']
const settings=document.createElement('button');settings.textContent=c[4];settings.style.cssText='position:fixed;bottom:8px;left:8px;z-index:9998;background:#160c20;color:#fff;border:1px solid #a97ec3;border-radius:22px;padding:8px 14px';document.body.append(settings)
function showChoice(){if(document.getElementById('mrg-consent'))return;const box=document.createElement('section');box.id='mrg-consent';box.setAttribute('aria-label',c[0]);box.style.cssText='position:fixed;bottom:50px;left:12px;right:12px;max-width:560px;margin:auto;z-index:9999;background:#160c20;color:#fff;border:1px solid #a97ec3;border-radius:16px;padding:20px;font-family:Arial';const h=document.createElement('strong');h.textContent=c[0];box.append(h);const p=document.createElement('p');p.textContent=c[1];box.append(p);for(const allowed of [false,true]){const b=document.createElement('button');b.textContent=c[allowed?2:3];b.style.cssText='margin:6px;padding:10px 16px;border-radius:18px;cursor:pointer';b.onclick=()=>{setMarketingChoice(allowed);box.remove();if(allowed&&location.pathname!=='/success.html')void trackMarketing('PageView');if(allowed&&window.MRG_PURCHASE)void trackMarketing('Purchase',window.MRG_PURCHASE)};box.append(b)}document.body.append(box)}
settings.onclick=showChoice
if(!hasMarketingChoice())showChoice();else if(marketingAllowed()&&location.pathname!=='/success.html')void trackMarketing('PageView')
if(window.MRG_PURCHASE)void trackMarketing('Purchase',window.MRG_PURCHASE)
