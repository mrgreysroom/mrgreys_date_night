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

const SB='https://siferzggaubvtjlqdckj.supabase.co/rest/v1/rpc/'
async function rpc(name,body){const key=process.env.SUPABASE_SECRET_KEY;if(!key)throw new Error('CRM unavailable');const r=await fetch(SB+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('CRM sync failed');return r.json()}
export async function captureContact(email,touch,lang){return rpc('crm_record_acquisition',{p_email:email,p_touch:{...cleanAcquisition(touch),first_touch:cleanAcquisition(touch?.first_touch||touch)},p_lang:lang==='cz'?'cs':lang,p_project:'date_night'})}
export async function capturePayment(s){if(s.livemode===false||!/^cs_live_/.test(s.id||'')||s.mode!=='payment'||s.payment_status!=='paid')return false;if(!Number.isSafeInteger(s.amount_total)||s.amount_total<0||!/^[a-z]{3}$/.test(s.currency||''))throw new Error('Invalid amount');return rpc('crm_record_payment',{p_email:String(s.customer_details?.email||s.customer_email||'').trim().toLowerCase(),p_record:{external_key:'checkout:'+s.id,provider_reference:s.id,product_code:'date_night_'+s.metadata.product_code,kind:'one_time',status:'paid',amount_minor:s.amount_total,currency:s.currency,occurred_at:new Date(s.created*1000).toISOString(),provider_updated_at:new Date().toISOString(),source:'date_night',attribution:acquisitionFromMetadata(s.metadata)}})}
