import {cookies} from 'next/headers'
import {notFound} from 'next/navigation'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {canUseDeepTest} from '../../../../lib/memberAccess'
import {DEEP_TESTS} from '../../../../lib/deepDesire'
import {getLang} from '../../../../lib/i18n'
import {UI,localizedTest} from '../../../../lib/update13i18n'
import {supabaseUpsert} from '../../../../lib/supabaseAdmin'
import DeepTestClient from '../DeepTestClient'

export default async function Page({params,searchParams}){
  const baseTest=DEEP_TESTS[params.slug]
  if(!baseTest)notFound()
  const lang=getLang(),t=UI[lang]||UI.sk,test=localizedTest(baseTest,params.slug,lang)
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

  const buyHref=`/api/stripe/create-desire-checkout?test=${params.slug}`
  return <main className="deepShell">
    <article className="deepStart deepSales">
      <a className="deepBackLink" href="/desire">{t.back}</a>
      <div className="deepIcon">{test.icon}</div>
      <small>{t.deep}</small>
      <h1>{test.title}</h1>
      <p className="deepLead">{test.subtitle}</p>
      <div className="deepInfoRow"><span>◷ {test.duration}</span><span>{t.forBoth}</span><span>{t.private}</span></div>
      <section className="deepAbout"><h2>{t.discover}</h2><p>{test.about}</p><ul>{test.discover.map(x=><li key={x}>✓ {x}</li>)}</ul></section>
      <section className="deepResultPreview"><small>{t.shared}</small><h2>{t.notScore}</h2><p>{test.result}</p></section>
      <div className="deepPrivacy">{t.privacy}</div>
      <div className="deepPriceBox"><div><small>{t.once}</small><b>2,99 €</b><span>{t.keeps}</span></div><a className="deepPrimary deepLink" href={buyHref}>{t.buy}</a></div>
      <div className="deepClubChoice"><small>👑 MR GREY'S CLUB</small><h2>{t.allClub}</h2><p>{t.clubBenefits}</p><a className="deepGold deepClubBtn" href="/club/join">{t.join}</a></div>
      {!member?.email&&<p className="deepLoginHint">Nákup môžete dokončiť bez prihlásenia. Prístup sa po platbe priradí k e-mailu zo Stripe. <a href="/login">{t.login}</a></p>}
    </article>
  </main>
}
