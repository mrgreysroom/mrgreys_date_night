import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import crypto from 'crypto'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {canUseDeepTest} from '../../../../lib/memberAccess'
import {supabaseInsert,supabaseSelect,supabaseUpdate,supabaseUpsert} from '../../../../lib/supabaseAdmin'
import {DEEP_TESTS,buildResult} from '../../../../lib/deepDesire'
import {sendServiceEmail} from '../../../../lib/email'

function tokenMember(){return readClubToken(cookies().get(clubCookieName)?.value)}
function cleanEmail(v){return String(v||'').trim().toLowerCase()}
export async function POST(req){
 try{
  const body=await req.json(); const action=body.action
  if(action==='start'){
   const member=tokenMember(); const slug=String(body.slug||''); const test=DEEP_TESTS[slug]
   if(!member?.email||!test) return NextResponse.json({error:'Prístup nebol nájdený.'},{status:401})
   if(!(await canUseDeepTest(member,slug))) return NextResponse.json({error:'Tento test nie je odomknutý.',needsPurchase:true},{status:403})
   const invite=crypto.randomBytes(24).toString('base64url')
   const rows=await supabaseInsert('desire_deep_sessions',[{test_slug:slug,owner_email:cleanEmail(member.email),invite_token:invite,status:'A_IN_PROGRESS'}])
   return NextResponse.json({ok:true,session:rows[0]})
  }
  if(action==='submitA'){
   const member=tokenMember(); if(!member?.email) return NextResponse.json({error:'Prihláste sa.'},{status:401})
   const id=String(body.id||''); const rows=await supabaseSelect('desire_deep_sessions',`id=eq.${encodeURIComponent(id)}&owner_email=eq.${encodeURIComponent(cleanEmail(member.email))}&select=*&limit=1`); const s=rows?.[0]
   if(!s) return NextResponse.json({error:'Test sa nenašiel.'},{status:404})
   const partner=cleanEmail(body.partnerEmail); if(partner&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner)) return NextResponse.json({error:'E-mail partnera nie je platný.'},{status:400})
   await supabaseUpdate('desire_deep_sessions',`id=eq.${encodeURIComponent(id)}`,{a_answers:body.answers,partner_email:partner||null,status:'WAITING_FOR_B',updated_at:new Date().toISOString()})
   const site=process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'; const href=`${site}/desire/deep/partner?token=${encodeURIComponent(s.invite_token)}`
   if(partner) await sendServiceEmail({to:partner,lang:'sk',template:'desire_invite',data:{test:DEEP_TESTS[s.test_slug]?.title||'DESIRE',href}})
   return NextResponse.json({ok:true,invite:href})
  }
  if(action==='submitB'){
   const invite=String(body.token||''); const rows=await supabaseSelect('desire_deep_sessions',`invite_token=eq.${encodeURIComponent(invite)}&select=*&limit=1`); const s=rows?.[0]; if(!s) return NextResponse.json({error:'Pozvánka nie je platná.'},{status:404})
   const partner=cleanEmail(body.email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner))return NextResponse.json({error:'Zadajte platný e-mail.'},{status:400});if(body.adult!==true)return NextResponse.json({error:'Pre pokračovanie je potrebné potvrdiť vek 18+.'},{status:400});await supabaseUpsert('member_profiles',[{email:partner,marketing_consent:!!body.marketing,preferred_language:'sk',updated_at:new Date().toISOString()}],'email');await supabaseUpdate('desire_deep_sessions',`id=eq.${encodeURIComponent(s.id)}`,{partner_email:partner,updated_at:new Date().toISOString()});s.partner_email=partner; const test=DEEP_TESTS[s.test_slug]; const result=buildResult(test,s.a_answers||[],body.answers||[]); const now=new Date().toISOString()
   await supabaseUpdate('desire_deep_sessions',`id=eq.${encodeURIComponent(s.id)}`,{b_answers:body.answers,result_snapshot:result,status:'RESULT_READY',completed_at:now,updated_at:now})
   const records=[{session_id:s.id,test_slug:s.test_slug,member_email:cleanEmail(s.owner_email),partner_email:cleanEmail(s.partner_email),result_snapshot:result},{session_id:s.id,test_slug:s.test_slug,member_email:cleanEmail(s.partner_email),partner_email:cleanEmail(s.owner_email),result_snapshot:result}]
   for(const r of records){try{await supabaseInsert('desire_result_history',[r])}catch{}}
   for(const to of [s.owner_email,s.partner_email]){try{await supabaseInsert('member_notifications',[{member_email:cleanEmail(to),kind:'desire',title:`${test.icon} Vaše ${test.title} je pripravené`,body:'Spoločný výsledok je uložený vo vašom MR GREY’S účte.',href:`/desire/results/${s.id}`}])}catch{}}
   const site=process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'; const href=`${site}/desire/results/${s.id}`
   for(const to of [s.owner_email,s.partner_email]) await sendServiceEmail({to,lang:'sk',template:'desire_result',data:{test:test.title,href}})
   return NextResponse.json({ok:true,result,sessionId:s.id})
  }
  return NextResponse.json({error:'Unknown action'},{status:400})
 }catch(e){return NextResponse.json({error:e.message||'DESIRE zlyhal.'},{status:500})}
}
export async function GET(req){
 try{const url=new URL(req.url); const token=url.searchParams.get('token'); if(token){const rows=await supabaseSelect('desire_deep_sessions',`invite_token=eq.${encodeURIComponent(token)}&select=id,test_slug,status,invite_token,owner_email&limit=1`);const ss=rows?.[0]||null;let inviter='';if(ss?.owner_email){try{const pp=await supabaseSelect('member_profiles',`email=eq.${encodeURIComponent(ss.owner_email)}&select=display_name&limit=1`);inviter=pp?.[0]?.display_name||ss.owner_email}catch{inviter=ss.owner_email}}return NextResponse.json({session:ss,test:ss?DEEP_TESTS[ss.test_slug]:null,inviter})}return NextResponse.json({error:'Missing token'},{status:400})}catch(e){return NextResponse.json({error:e.message},{status:500})}
}
