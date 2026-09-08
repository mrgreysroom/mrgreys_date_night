import {cookies} from 'next/headers'
import {notFound} from 'next/navigation'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {canUseDeepTest} from '../../../../lib/memberAccess'
import {DEEP_TESTS} from '../../../../lib/deepDesire'
import {supabaseUpsert} from '../../../../lib/supabaseAdmin'
import DeepTestClient from '../DeepTestClient'

export default async function Page({params,searchParams}){
  const test=DEEP_TESTS[params.slug]
  if(!test)notFound()
  const member=readClubToken(cookies().get(clubCookieName)?.value)
  let access=false
  if(member?.email){
    access=await canUseDeepTest(member,params.slug)
    if(!access&&searchParams?.session_id&&process.env.STRIPE_SECRET_KEY){
      try{
        const rr=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(searchParams.session_id)}`,{headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`},cache:'no-store'})
        const ss=await rr.json()
        if(rr.ok&&ss.mode==='payment'&&ss.payment_status==='paid'&&ss.metadata?.test_slug===params.slug&&String(ss.metadata?.member_email||'').toLowerCase()===String(member.email).toLowerCase()){
          await supabaseUpsert('product_entitlements',[{member_email:String(member.email).toLowerCase(),product_key:`desire_${params.slug}`,source:'stripe',stripe_session_id:ss.id,stripe_payment_intent:String(ss.payment_intent||''),is_active:true,purchased_at:new Date().toISOString()}],'member_email,product_key')
          access=true
        }
      }catch{}
    }
  }

  if(access) return <main className="deepShell"><DeepTestClient test={test} slug={params.slug}/></main>

  const buyHref=member?.email?`/api/stripe/create-desire-checkout?test=${params.slug}`:`/login`
  return <main className="deepShell">
    <article className="deepStart deepSales">
      <a className="deepBackLink" href="/desire">← VŠETKY DESIRE TESTY</a>
      <div className="deepIcon">{test.icon}</div>
      <small>MR GREY'S DESIRE · HLBŠÍ TEST</small>
      <h1>{test.title}</h1>
      <p className="deepLead">{test.subtitle}</p>
      <div className="deepInfoRow"><span>◷ {test.duration}</span><span>♡ PRE VÁS OBOCH</span><span>🔒 SÚKROMNÉ ODPOVEDE</span></div>
      <section className="deepAbout"><h2>Čo v tomto teste objavíte?</h2><p>{test.about}</p><ul>{test.discover.map(x=><li key={x}>✓ {x}</li>)}</ul></section>
      <section className="deepResultPreview"><small>VAŠE SPOLOČNÉ VYHODNOTENIE</small><h2>Nie skóre. To, čo sa medzi vami stretlo.</h2><p>{test.result}</p></section>
      <div className="deepPrivacy">🔒 Každý odpovedá samostatne. Partner neuvidí vaše jednotlivé odpovede.</div>
      <div className="deepPriceBox"><div><small>JEDNORAZOVO</small><b>2,99 €</b><span>test vám zostane odomknutý</span></div><a className="deepPrimary deepLink" href={buyHref}>KÚPIŤ TEST ZA 2,99 € →</a></div>
      <div className="deepClubChoice"><small>👑 MR GREY'S CLUB</small><h2>Všetkých 5 DESIRE testov v členstve.</h2><p>9,90 €/mesiac + hry, Stories, Academy, Couple Challenge a členské výhody.</p><a className="deepGold deepClubBtn" href="/club/join">VSTÚPIŤ DO CLUBU ZA 9,90 € / MESIAC →</a></div>
      {!member?.email&&<p className="deepLoginHint">Už ste členom? <a href="/login">PRIHLÁSIŤ SA →</a></p>}
    </article>
  </main>
}
