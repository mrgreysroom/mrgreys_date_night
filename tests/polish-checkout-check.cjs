const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto')
const strip=p=>fs.readFileSync(p,'utf8').replace(/^import .*\n/gm,'').replace(/export default async function handler/,'async function handler').replace(/export const config/,'const config')
let requests=[],syncs=0
const ctx=vm.createContext({URLSearchParams,Buffer,Date,crypto,Set,console,process:{env:{STRIPE_SECRET_KEY:'fixture',STRIPE_PRICE_COMPLETE:'fixture-price',STRIPE_WEBHOOK_SECRET:'fixture-secret',SUPABASE_SECRET_KEY:'fixture'}},upsertMailerLiteContact:async()=>{syncs++},fetch:async(url,args)=>{requests.push({url,args});return {ok:true,json:async()=>({url:'https://checkout.stripe.com/fixture'})}}})
vm.runInContext(fs.readFileSync('api/_pricing.js','utf8').replace(/export /g,''),ctx)
vm.runInContext('(function(){'+strip('api/create-checkout.js')+';this.checkout=handler}).call(this)',ctx)
vm.runInContext('(function(){'+strip('api/stripe-webhook.js')+';this.hook=handler}).call(this)',ctx)
const response=()=>({status(n){this.code=n;return this},json(body){this.body=body;return this}})
function hookReq(obj){const raw=Buffer.from(JSON.stringify({type:'checkout.session.completed',data:{object:obj}})),ts=Math.floor(Date.now()/1000),sig=crypto.createHmac('sha256','fixture-secret').update(ts+'.'+raw).digest('hex');return {method:'POST',headers:{'stripe-signature':`t=${ts},v1=${sig}`},async *[Symbol.asyncIterator](){yield raw}}}
;(async()=>{
 let r=response();await ctx.checkout({method:'POST',body:{product:'complete',email:'fixture@example.invalid',language:'pl'}},r);assert.equal(r.code,200);const form=new URLSearchParams(requests.at(-1).args.body);assert.equal(form.get('locale'),'pl');assert.equal(form.get('metadata[language]'),'pl');assert.match(form.get('success_url'),/lang=pl/)
 requests=[]
 for(const kind of ['membership','date_night_member']){r=response();await ctx.hook(hookReq({id:'cs_fixture',mode:kind==='membership'?'subscription':'payment',payment_status:'paid',metadata:{app:'mrgreys_world',kind}}),r);assert.equal(r.code,200);assert.equal(r.body.ignored,true);assert.equal(requests.length,0)}
 r=response();await ctx.hook(hookReq({id:'cs_fixture',mode:'payment',payment_status:'unpaid',customer_email:'fixture@example.invalid',metadata:{product_code:'complete',language:'pl'}}),r);assert.equal(requests.length,0)
 r=response();await ctx.hook(hookReq({id:'cs_fixture',mode:'payment',payment_status:'paid',customer_email:'fixture@example.invalid',metadata:{product_code:'complete',language:'pl'}}),r);assert.equal(r.code,200);assert.equal(JSON.parse(requests[0].args.body).language,'pl');assert.equal(syncs,1)
 const sk=JSON.parse(fs.readFileSync('locales/cards-sk.json')),pl=JSON.parse(fs.readFileSync('locales/cards-pl.json'));let total=0
 for(const key of Object.keys(sk)){assert.equal(pl[key].length,sk[key].length);for(let i=0;i<sk[key].length;i++){assert.equal(pl[key][i]._id,sk[key][i]._id);assert.equal(pl[key][i].type,sk[key][i].type);assert(pl[key][i].text.trim());assert.notEqual(pl[key][i].text,sk[key][i].text);total++}}
 console.log('PASS: PL Stripe checkout and stored language; World purchases ignored without duplicate fulfillment; unpaid blocked; '+total+' Polish cards with matching identifiers and types; fixtures only')
})().catch(e=>{console.error(e);process.exitCode=1})
