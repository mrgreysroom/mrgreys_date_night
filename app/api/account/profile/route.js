import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {supabaseSelect,supabaseUpsert} from '../../../../lib/supabaseAdmin'

function member(){return readClubToken(cookies().get(clubCookieName)?.value)}
export async function GET(){
  const m=member(); if(!m?.email) return NextResponse.json({error:'Unauthorized'},{status:401})
  const email=String(m.email).toLowerCase()
  const rows=await supabaseSelect('member_profiles',`email=eq.${encodeURIComponent(email)}&select=*&limit=1`)
  return NextResponse.json({profile:rows?.[0]||{email,display_name:m.name||'',preferred_language:'sk',marketing_consent:false,notify_email:true,notify_club:true},role:m.role||'member',fullAccess:!!m.fullAccess,clubActive:!!(m.fullAccess||m.clubActive||m.tier==='founding')})
}
export async function PATCH(req){
  const m=member(); if(!m?.email) return NextResponse.json({error:'Unauthorized'},{status:401})
  const b=await req.json(); const email=String(m.email).toLowerCase()
  const lang=['sk','cs','pl','en'].includes(b.preferred_language)?b.preferred_language:'sk'
  const row={email,display_name:String(b.display_name||'').slice(0,120),date_of_birth:b.date_of_birth||null,preferred_language:lang,marketing_consent:!!b.marketing_consent,notify_email:b.notify_email!==false,notify_club:b.notify_club!==false,updated_at:new Date().toISOString()}
  const saved=await supabaseUpsert('member_profiles',[row],'email')
  return NextResponse.json({ok:true,profile:saved?.[0]||row})
}
