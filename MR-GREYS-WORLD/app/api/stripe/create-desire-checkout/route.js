import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'

function priceMap(){
  return {
    'my-dvaja':process.env.STRIPE_DESIRE_MY_DVAJA_PRICE_ID,
    'bez-filtra':process.env.STRIPE_DESIRE_BEZ_FILTRA_PRICE_ID,
    'nasa-buducnost':process.env.STRIPE_DESIRE_NASA_BUDUCNOST_PRICE_ID,
    'intimita':process.env.STRIPE_DESIRE_INTIMITA_PRICE_ID,
    'tajne-tuzby':process.env.STRIPE_DESIRE_TAJNE_TUZBY_PRICE_ID
  }
}

export async function GET(req){
 try{
  const m=readClubToken(cookies().get(clubCookieName)?.value)
  const url=new URL(req.url)
  const bundle=url.searchParams.get('bundle')==='1'
  const slug=url.searchParams.get('test')
  const prices=priceMap()
  const price=prices[slug]
  if(!bundle&&!price){
    if(slug&&Object.prototype.hasOwnProperty.call(prices,slug)) return NextResponse.json({error:'Stripe price for this DESIRE test is missing'},{status:500})
    return NextResponse.json({error:'Unknown test'},{status:400})
  }
  if(!process.env.STRIPE_SECRET_KEY)return NextResponse.json({error:'Stripe server key missing'},{status:500})
  const origin=(process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin).replace(/\/$/,'')
  const form=new URLSearchParams()
  form.set('mode','payment')
  form.set('success_url',bundle?`${origin}/desire?bundle_purchased=1&session_id={CHECKOUT_SESSION_ID}`:`${origin}/desire/deep/${slug}?purchased=1&session_id={CHECKOUT_SESSION_ID}`)
  form.set('cancel_url',bundle?`${origin}/desire?cancelled=1`:`${origin}/desire/deep/${slug}?cancelled=1`)
  if(m?.email) form.set('customer_email',m.email)
  if(bundle){
    if(process.env.STRIPE_DESIRE_BUNDLE_PRICE_ID){
      form.set('line_items[0][price]',process.env.STRIPE_DESIRE_BUNDLE_PRICE_ID)
    }else{
      form.set('line_items[0][price_data][currency]','eur')
      form.set('line_items[0][price_data][unit_amount]','1495')
      form.set('line_items[0][price_data][product_data][name]',"MR GREY'S DESIRE — Kompletných 5 testov")
    }
  }else{
    form.set('line_items[0][price]',price)
  }
  form.set('line_items[0][quantity]','1')
  form.set('metadata[app]','mrgreys_world')
  form.set('metadata[kind]',bundle?'desire_bundle':'desire_deep')
  if(!bundle)form.set('metadata[test_slug]',slug)
  if(m?.email) form.set('metadata[member_email]',m.email)
  const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded'},body:form.toString()})
  const d=await r.json()
  if(!r.ok||!d.url)throw new Error(d?.error?.message||'Stripe checkout failed')
  return NextResponse.redirect(d.url,{status:303})
 }catch(e){return NextResponse.json({error:e.message||'Checkout failed'},{status:500})}
}
