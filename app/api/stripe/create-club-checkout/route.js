import { NextResponse } from 'next/server'

const PRICE_ID='price_1UCg6zPeOVi2qayNrXEcqUN9'

export async function POST(req){
  try{
    const {email,name,dob,marketing,adult}=await req.json()
    if(!adult) return NextResponse.json({error:'18+ confirmation required'},{status:400})
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email||'')) return NextResponse.json({error:'Invalid email'},{status:400})
    if(!process.env.STRIPE_SECRET_KEY) return NextResponse.json({error:'Stripe server key missing'},{status:500})
    const origin=(process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin).replace(/\/$/,'')
    const form=new URLSearchParams()
    form.set('mode','subscription')
    form.set('success_url',`${origin}/club/welcome?session_id={CHECKOUT_SESSION_ID}`)
    form.set('cancel_url',`${origin}/club/join?cancelled=1`)
    form.set('customer_email',email)
    form.set('line_items[0][price]',PRICE_ID)
    form.set('line_items[0][quantity]','1')
    form.set('allow_promotion_codes','true')
    form.set('subscription_data[metadata][app]','mrgreys_world')
    form.set('subscription_data[metadata][kind]','membership')
    form.set('subscription_data[metadata][tier]','founding')
    form.set('metadata[app]','mrgreys_world')
    form.set('metadata[kind]','membership')
    form.set('metadata[tier]','founding')
    form.set('metadata[name]',String(name||'').slice(0,120))
    form.set('metadata[dob]',String(dob||'').slice(0,20))
    form.set('metadata[marketing]',marketing?'true':'false')
    form.set('billing_address_collection','auto')
    const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:form.toString()})
    const data=await r.json()
    if(!r.ok) throw new Error(data?.error?.message||'Stripe checkout failed')
    return NextResponse.json({url:data.url})
  }catch(e){return NextResponse.json({error:e.message||'Checkout failed'},{status:500})}
}
