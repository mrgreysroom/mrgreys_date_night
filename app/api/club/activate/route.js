import { NextResponse } from 'next/server'
import { makeClubToken,clubCookieName } from '../../../../lib/clubAuth'
import {supabaseUpsert} from '../../../../lib/supabaseAdmin'

async function stripeGet(path){
  const r=await fetch(`https://api.stripe.com/v1/${path}`,{headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`},cache:'no-store'})
  const d=await r.json(); if(!r.ok) throw new Error(d?.error?.message||'Stripe verify failed'); return d
}
export async function POST(req){
  try{
    const {sessionId}=await req.json()
    if(!sessionId||!process.env.STRIPE_SECRET_KEY) return NextResponse.json({active:false},{status:400})
    const session=await stripeGet(`checkout/sessions/${encodeURIComponent(sessionId)}`)
    if(session.mode!=='subscription'||session.payment_status!=='paid'||!session.subscription) return NextResponse.json({active:false},{status:202})
    const sub=await stripeGet(`subscriptions/${encodeURIComponent(session.subscription)}`)
    const active=['active','trialing'].includes(sub.status)
    if(!active) return NextResponse.json({active:false,status:sub.status},{status:202})
    const exp=sub.current_period_end
    const member={
      exp,
      stripeCustomer:session.customer,
      stripeSubscription:sub.id,
      email:session.customer_details?.email||session.customer_email||'',
      name:session.metadata?.name||'',
      tier:'founding',
      clubActive:true
    }
    await supabaseUpsert('club_memberships',[{stripe_subscription_id:sub.id,stripe_customer_id:String(session.customer||''),email:member.email||null,display_name:member.name||null,tier:'founding',status:sub.status,is_active:true,cancel_at_period_end:Boolean(sub.cancel_at_period_end),current_period_end:new Date(sub.current_period_end*1000).toISOString(),updated_at:new Date().toISOString()}],'stripe_subscription_id')
    let uid=null;try{const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://siferzggaubvtjlqdckj.supabase.co'),key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY);const r=await fetch(`${base}/auth/v1/admin/users?per_page=1000`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store'});const d=await r.json();uid=(d?.users||[]).find(u=>String(u.email||'').toLowerCase()===String(member.email||'').toLowerCase())?.id||null}catch{}
    await supabaseUpsert('entitlements',[{user_id:uid,email:String(member.email||'').toLowerCase(),product_code:'complete',stripe_session_id:`club_${sub.id}`,purchased_at:new Date().toISOString()}],'stripe_session_id')
    const token=makeClubToken(member)
    const res=NextResponse.json({active:true,redirect:'/club'})
    res.cookies.set(clubCookieName,token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:Math.max(60,exp-Math.floor(Date.now()/1000))})
    return res
  }catch(e){return NextResponse.json({active:false,error:e.message},{status:500})}
}
