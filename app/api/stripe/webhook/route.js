import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { supabaseUpsert, supabaseSelect, supabaseDelete } from '../../../../lib/supabaseAdmin'
import {sendServiceEmail} from '../../../../lib/email'

export const runtime='nodejs'

function verifyStripeSignature(raw,header,secret){
  if(!header||!secret) return false
  const parts=Object.fromEntries(header.split(',').map(x=>x.split('=').map(s=>s.trim())))
  const t=parts.t, v1=parts.v1
  if(!t||!v1) return false
  const expected=crypto.createHmac('sha256',secret).update(`${t}.${raw}`).digest('hex')
  const a=Buffer.from(expected), b=Buffer.from(v1)
  if(a.length!==b.length) return false
  return crypto.timingSafeEqual(a,b)
}


async function preferredLang(email){try{const r=await supabaseSelect('member_profiles',`email=eq.${encodeURIComponent(String(email||'').toLowerCase())}&select=preferred_language&limit=1`);return r?.[0]?.preferred_language||'sk'}catch{return 'sk'}}
async function membershipEmail(subId){try{const r=await supabaseSelect('club_memberships',`stripe_subscription_id=eq.${encodeURIComponent(subId)}&select=email&limit=1`);return r?.[0]?.email||''}catch{return ''}}

async function stripeGet(path){
  const r=await fetch(`https://api.stripe.com/v1/${path}`,{headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`},cache:'no-store'})
  const d=await r.json(); if(!r.ok) throw new Error(d?.error?.message||'Stripe fetch failed'); return d
}


async function syncDateNightClubEntitlement(sub,email=''){
  const e=String(email||'').trim().toLowerCase(); if(!e||!sub?.id) return
  const synthetic=`club_${sub.id}`
  const active=['active','trialing'].includes(sub.status)
  if(!active){await supabaseDelete('entitlements',`stripe_session_id=eq.${encodeURIComponent(synthetic)}`);return}
  let uid=null
  try{const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://siferzggaubvtjlqdckj.supabase.co'),key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY);const r=await fetch(`${base}/auth/v1/admin/users?per_page=1000`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store'});const d=await r.json();uid=(d?.users||[]).find(u=>String(u.email||'').toLowerCase()===e)?.id||null}catch{}
  await supabaseUpsert('entitlements',[{user_id:uid,email:e,product_code:'complete',stripe_session_id:synthetic,purchased_at:new Date().toISOString()}],'stripe_session_id')
}

async function upsertMembershipFromSubscription(sub,email='',name='',dob='',marketing=false){
  if(!email){try{const old=await supabaseSelect('club_memberships',`stripe_subscription_id=eq.${encodeURIComponent(sub.id)}&select=email,display_name,date_of_birth,marketing_consent&limit=1`);const m=old?.[0];if(m){email=m.email||'';name=name||m.display_name||'';dob=dob||m.date_of_birth||'';marketing=marketing||!!m.marketing_consent}}catch{}}
  const active=['active','trialing'].includes(sub.status)
  await supabaseUpsert('club_memberships',[{
    stripe_subscription_id:sub.id,
    stripe_customer_id:String(sub.customer||''),
    email:email||null,
    display_name:name||null,
    date_of_birth:dob||null,
    marketing_consent:Boolean(marketing),
    tier:'founding',
    status:sub.status,
    is_active:active,
    cancel_at_period_end:Boolean(sub.cancel_at_period_end),
    current_period_end:new Date((sub.current_period_end||0)*1000).toISOString(),
    updated_at:new Date().toISOString()
  }],'stripe_subscription_id')
  await syncDateNightClubEntitlement(sub,email)
}

export async function POST(req){
  const raw=await req.text()
  if(!verifyStripeSignature(raw,req.headers.get('stripe-signature'),process.env.STRIPE_WEBHOOK_SECRET)) return NextResponse.json({error:'Invalid signature'},{status:400})
  try{
    const event=JSON.parse(raw)
    const obj=event.data?.object||{}
    if(event.type==='checkout.session.completed' && obj.mode==='payment' && obj.metadata?.kind==='desire_bundle'){
      const email=String(obj.metadata?.member_email||obj.customer_details?.email||obj.customer_email||'').toLowerCase()
      if(email){await supabaseUpsert('product_entitlements',[{member_email:email,product_key:'desire_bundle',source:'stripe',stripe_session_id:obj.id,stripe_payment_intent:String(obj.payment_intent||''),is_active:true,purchased_at:new Date().toISOString()}],'member_email,product_key');await sendServiceEmail({to:email,lang:await preferredLang(email),template:'deep_purchase',data:{test:'KOMPLETNÉ DESIRE — 5 TESTOV',href:`${process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'}/desire`}})}
    }
    if(event.type==='checkout.session.completed' && obj.mode==='payment' && obj.metadata?.kind==='desire_deep'){
      const email=String(obj.metadata?.member_email||obj.customer_details?.email||obj.customer_email||'').toLowerCase()
      const slug=String(obj.metadata?.test_slug||'')
      if(email&&slug){await supabaseUpsert('product_entitlements',[{member_email:email,product_key:`desire_${slug}`,source:'stripe',stripe_session_id:obj.id,stripe_payment_intent:String(obj.payment_intent||''),is_active:true,purchased_at:new Date().toISOString()}],'member_email,product_key');await sendServiceEmail({to:email,lang:await preferredLang(email),template:'deep_purchase',data:{test:slug.replaceAll('-',' ').toUpperCase(),href:`${process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'}/desire/deep/${slug}`}})}
    }
    if(event.type==='checkout.session.completed' && obj.mode==='subscription' && obj.subscription){
      const sub=await stripeGet(`subscriptions/${encodeURIComponent(obj.subscription)}`)
      const email=obj.customer_details?.email||obj.customer_email||'';await upsertMembershipFromSubscription(sub,email,obj.metadata?.name||'',obj.metadata?.dob||'',obj.metadata?.marketing==='true');if(email)await sendServiceEmail({to:email,lang:await preferredLang(email),template:'club_welcome',data:{href:`${process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'}/club`}})
    }
    if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)){
      const email=await membershipEmail(obj.id);await upsertMembershipFromSubscription(obj,email)
      if(event.type==='customer.subscription.deleted'&&email) await sendServiceEmail({to:email,lang:await preferredLang(email),template:'membership_cancelled',data:{href:`${process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'}/club/account`}})
    }
    if(event.type==='invoice.payment_failed' && obj.subscription){
      const sub=await stripeGet(`subscriptions/${encodeURIComponent(obj.subscription)}`)
      const email=await membershipEmail(sub.id);await upsertMembershipFromSubscription(sub,email);if(email)await sendServiceEmail({to:email,lang:await preferredLang(email),template:'payment_failed',data:{href:`${process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'}/club/account`}})
    }
    if(event.type==='invoice.paid' && obj.subscription){
      const sub=await stripeGet(`subscriptions/${encodeURIComponent(obj.subscription)}`)
      await upsertMembershipFromSubscription(sub)
    }
    return NextResponse.json({received:true})
  }catch(e){return NextResponse.json({error:e.message||'Webhook failed'},{status:500})}
}
