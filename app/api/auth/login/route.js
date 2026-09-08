import {NextResponse} from 'next/server'
import {makeClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {getTeamRoleByEmail,isFullAccessRole} from '../../../../lib/teamAuth'
import {supabaseSelect} from '../../../../lib/supabaseAdmin'

async function verifyPassword(email,password){
  const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://siferzggaubvtjlqdckj.supabase.co'), key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY)
  if(!base||!key) throw new Error('Supabase server env missing')
  const r=await fetch(`${base}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({email,password})})
  const d=await r.json(); if(!r.ok) throw new Error('Nesprávny e-mail alebo heslo.')
  return d
}
export async function POST(req){
  try{
    const {email:raw,password}=await req.json(); const email=String(raw||'').trim().toLowerCase()
    await verifyPassword(email,String(password||''))
    const role=await getTeamRoleByEmail(email)
    if(isFullAccessRole(role)){
      const exp=Math.floor(Date.now()/1000)+60*60*24*30
      const token=makeClubToken({exp,email,name:'',role,tier:'internal',fullAccess:true})
      const res=NextResponse.json({ok:true,redirect:'/club',role})
      res.cookies.set(clubCookieName,token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:60*60*24*30})
      return res
    }
    const rows=await supabaseSelect('club_memberships',`email=eq.${encodeURIComponent(email)}&is_active=eq.true&select=email,display_name,tier,status,current_period_end,stripe_customer_id,stripe_subscription_id&order=updated_at.desc&limit=1`)
    const m=Array.isArray(rows)?rows[0]:null
    if(!m){
      const exp=Math.floor(Date.now()/1000)+60*60*24*30
      const token=makeClubToken({exp,email,name:'',role:'member',tier:'account',accountOnly:true,clubActive:false})
      const res=NextResponse.json({ok:true,accountOnly:true,redirect:'/club/account',role:'member'})
      res.cookies.set(clubCookieName,token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:60*60*24*30})
      return res
    }
    const end=Math.floor(new Date(m.current_period_end||Date.now()+86400000).getTime()/1000)
    const token=makeClubToken({exp:Math.max(end,Math.floor(Date.now()/1000)+3600),email,name:m.display_name||'',tier:m.tier||'founding',stripeCustomer:m.stripe_customer_id,stripeSubscription:m.stripe_subscription_id,role:'member',clubActive:true})
    const res=NextResponse.json({ok:true,redirect:'/club',role:'member'})
    res.cookies.set(clubCookieName,token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:Math.max(3600,end-Math.floor(Date.now()/1000))})
    return res
  }catch(e){return NextResponse.json({error:e.message||'Prihlásenie zlyhalo.'},{status:401})}
}
