import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {isClubActiveToken} from '../../../../lib/memberAccess'
import {supabaseUpsert} from '../../../../lib/supabaseAdmin'

async function findUserId(email){
 try{
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://siferzggaubvtjlqdckj.supabase.co'
  const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!key)return null
  const r=await fetch(`${base}/auth/v1/admin/users?per_page=1000`,{
   headers:{apikey:key,Authorization:`Bearer ${key}`},
   cache:'no-store'
  })
  const d=await r.json()
  return (d?.users||[]).find(u=>String(u.email||'').toLowerCase()===email)?.id||null
 }catch{return null}
}

async function ensureGameEntitlement(member,email){
 const role=String(member?.role||'').toLowerCase()
 const internal=Boolean(member?.fullAccess)&&['owner','admin'].includes(role)
 const productCode=internal?'complete':'romantic'
 const uid=await findUserId(email)
 const synthetic=internal?`internal_${role}_${email}`:`club_member_${email}`

 await supabaseUpsert(
  'entitlements',
  [{
   user_id:uid,
   email,
   product_code:productCode,
   stripe_session_id:synthetic,
   purchased_at:new Date().toISOString()
  }],
  'stripe_session_id'
 )

 return {internal,productCode}
}

function resolveLanguage(member,store){
 const raw=
  member?.preferredLanguage||
  member?.preferred_language||
  member?.language||
  member?.lang||
  store.get('mrgreys_lang')?.value||
  store.get('NEXT_LOCALE')?.value||
  'sk'
 const lang=String(raw).toLowerCase()
 return ['sk','cs','pl','en'].includes(lang)?lang:'sk'
}

export async function GET(req){
 try{
  const store=cookies()
  const m=readClubToken(store.get(clubCookieName)?.value)

  if(!m?.email||!isClubActiveToken(m)){
   return NextResponse.redirect(new URL('/club/join',req.url))
  }

  const email=String(m.email).trim().toLowerCase()
  const {productCode}=await ensureGameEntitlement(m,email)

  const base=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://siferzggaubvtjlqdckj.supabase.co'
  const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!key)throw new Error('Supabase server env missing')

  // Admin generate_link creates the verification token server-side.
  // No email is sent. We only use the one-time token hash for the game-domain handoff.
  const r=await fetch(`${base}/auth/v1/admin/generate_link`,{
   method:'POST',
   headers:{
    apikey:key,
    Authorization:`Bearer ${key}`,
    'Content-Type':'application/json'
   },
   body:JSON.stringify({
    type:'magiclink',
    email
   })
  })

  const d=await r.json()
  if(!r.ok)throw new Error(d?.msg||d?.message||'Game bridge token failed')

  const tokenHash=
   d?.properties?.hashed_token||
   d?.hashed_token||
   ''

  if(!tokenHash)throw new Error('Game bridge token was not generated')

  const lang=resolveLanguage(m,store)
  const target=new URL('https://datenight.mrgreysroom.sk/bridge.html')
  target.searchParams.set('token_hash',tokenHash)
  target.searchParams.set('pack',productCode)
  target.searchParams.set('lang',lang)

  return NextResponse.redirect(target)
 }catch(e){
  return NextResponse.json(
   {error:e?.message||'Game bridge failed'},
   {status:500}
  )
 }
}
