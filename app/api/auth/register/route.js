import {NextResponse} from 'next/server'
import {makeClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {getTeamRoleByEmail,isFullAccessRole} from '../../../../lib/teamAuth'
import {supabaseUpsert} from '../../../../lib/supabaseAdmin'
import {sendServiceEmail} from '../../../../lib/email'

function env(){
  const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://siferzggaubvtjlqdckj.supabase.co')
  const key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY)
  if(!base||!key) throw new Error('Supabase server env missing')
  return {base,key}
}
async function signIn(email,password){
  const {base,key}=env()
  const r=await fetch(`${base}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({email,password})})
  const d=await r.json(); if(!r.ok) throw new Error(d?.msg||d?.error_description||'Nesprávny e-mail alebo heslo.')
  return d
}
async function createUser({email,password,name,dob}){
  const {base,key}=env()
  const r=await fetch(`${base}/auth/v1/admin/users`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({email,password,email_confirm:true,user_metadata:{display_name:name||'',date_of_birth:dob||''}})})
  const d=await r.json()
  if(r.ok) return d
  const text=String(d?.msg||d?.message||d?.error||'')
  if(r.status===422 || /already|registered|exists/i.test(text)) return signIn(email,password)
  throw new Error(text||'Účet sa nepodarilo vytvoriť.')
}
export async function POST(req){
  try{
    const body=await req.json(); const email=String(body.email||'').trim().toLowerCase(); const password=String(body.password||'')
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({error:'Zadajte platný e-mail.'},{status:400})
    if(password.length<8) return NextResponse.json({error:'Heslo musí mať aspoň 8 znakov.'},{status:400})
    if(!body.adult) return NextResponse.json({error:'Pre pokračovanie potvrďte vek 18+.'},{status:400})
    await createUser({email,password,name:body.name,dob:body.dob})
    await supabaseUpsert('member_profiles',[{email,display_name:String(body.name||'').slice(0,120),date_of_birth:body.dob||null,preferred_language:['sk','cs','pl','en'].includes(body.lang)?body.lang:'sk',marketing_consent:!!body.marketing,notify_email:true,notify_club:true,updated_at:new Date().toISOString()}],'email')
    await sendServiceEmail({to:email,lang:['sk','cs','pl','en'].includes(body.lang)?body.lang:'sk',template:'account_welcome',data:{href:`${process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'}/club/account`}})
    const role=await getTeamRoleByEmail(email)
    if(isFullAccessRole(role)){
      const exp=Math.floor(Date.now()/1000)+60*60*24*30
      const token=makeClubToken({exp,email,name:body.name||'',role,tier:'internal',fullAccess:true})
      const res=NextResponse.json({ok:true,fullAccess:true,role,redirect:'/club'})
      res.cookies.set(clubCookieName,token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:60*60*24*30})
      return res
    }
    const exp=Math.floor(Date.now()/1000)+60*60*24*30
    const token=makeClubToken({exp,email,name:body.name||'',role:'member',tier:'account',accountOnly:true,clubActive:false})
    const res=NextResponse.json({ok:true,fullAccess:false,requiresPayment:true})
    res.cookies.set(clubCookieName,token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:60*60*24*30})
    return res
  }catch(e){return NextResponse.json({error:e.message||'Registrácia zlyhala.'},{status:500})}
}
