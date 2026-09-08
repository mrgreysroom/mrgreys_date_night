import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import ClubHeader from '../ClubHeader'
import AccountClient from './AccountClient'
import {readClubToken,clubCookieName} from '../../../lib/clubAuth'
import {supabaseSelect} from '../../../lib/supabaseAdmin'
import {isClubActiveToken} from '../../../lib/memberAccess'
export default async function Account(){
 const member=readClubToken(cookies().get(clubCookieName)?.value); if(!member?.email) redirect('/login')
 const email=String(member.email).toLowerCase()
 let profileRows=[],subs=[],results=[],journeys=[]
 try{[profileRows,subs,results,journeys]=await Promise.all([
  supabaseSelect('member_profiles',`email=eq.${encodeURIComponent(email)}&select=*&limit=1`),
  supabaseSelect('story_subscriptions',`member_email=eq.${encodeURIComponent(email)}&select=*&order=created_at.desc`),
  supabaseSelect('desire_result_history',`member_email=eq.${encodeURIComponent(email)}&select=id,session_id,test_slug,result_snapshot,created_at&order=created_at.desc&limit=30`),
  supabaseSelect('desire_journeys',`owner_email=eq.${encodeURIComponent(email)}&status=eq.active&select=*&order=created_at.desc&limit=1`)
 ])}catch{}
 const profile=profileRows?.[0]||{email,display_name:member.name||'',date_of_birth:'',preferred_language:'sk',marketing_consent:false,notify_email:true,notify_club:true}
 return <div className="clubShell"><ClubHeader name={profile.display_name||member.name||''} email={email}/><AccountClient initialProfile={profile} role={member.role||'member'} fullAccess={!!member.fullAccess} clubActive={isClubActiveToken(member)} subscriptions={subs||[]} results={results||[]} journey={journeys?.[0]||null}/></div>
}
