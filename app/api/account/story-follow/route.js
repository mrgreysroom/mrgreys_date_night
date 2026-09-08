import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {supabaseSelect,supabaseUpsert,supabaseUpdate} from '../../../../lib/supabaseAdmin'
function member(){return readClubToken(cookies().get(clubCookieName)?.value)}
export async function GET(req){
 const m=member(); if(!m?.email) return NextResponse.json({error:'Unauthorized'},{status:401})
 const slug=new URL(req.url).searchParams.get('slug')||''
 const rows=await supabaseSelect('story_subscriptions',`member_email=eq.${encodeURIComponent(String(m.email).toLowerCase())}&story_slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`)
 return NextResponse.json({following:!!rows?.[0]?.is_active,settings:rows?.[0]||null})
}
export async function POST(req){
 const m=member(); if(!m?.email) return NextResponse.json({error:'Unauthorized'},{status:401})
 const b=await req.json(); const email=String(m.email).toLowerCase(), slug=String(b.slug||'').replace(/[^a-z0-9_-]/gi,'')
 if(!slug) return NextResponse.json({error:'Missing story'},{status:400})
 const active=b.active!==false
 const row={member_email:email,story_slug:slug,email_enabled:b.email_enabled!==false,club_enabled:b.club_enabled!==false,is_active:active,updated_at:new Date().toISOString()}
 await supabaseUpsert('story_subscriptions',[row],'member_email,story_slug')
 return NextResponse.json({ok:true,following:active})
}
