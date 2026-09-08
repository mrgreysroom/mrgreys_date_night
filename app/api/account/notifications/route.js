import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {supabaseSelect,supabaseUpdate} from '../../../../lib/supabaseAdmin'
function member(){return readClubToken(cookies().get(clubCookieName)?.value)}
export async function GET(){
 const m=member(); if(!m?.email) return NextResponse.json({error:'Unauthorized'},{status:401})
 const rows=await supabaseSelect('member_notifications',`member_email=eq.${encodeURIComponent(String(m.email).toLowerCase())}&select=id,kind,title,body,href,is_read,created_at&order=created_at.desc&limit=20`)
 return NextResponse.json({items:rows||[],unread:(rows||[]).filter(x=>!x.is_read).length})
}
export async function PATCH(req){
 const m=member(); if(!m?.email) return NextResponse.json({error:'Unauthorized'},{status:401})
 const b=await req.json(); const email=String(m.email).toLowerCase()
 if(b.all===true){await supabaseUpdate('member_notifications',`member_email=eq.${encodeURIComponent(email)}&is_read=eq.false`,{is_read:true});return NextResponse.json({ok:true})}
 if(!b.id) return NextResponse.json({error:'Missing id'},{status:400})
 await supabaseUpdate('member_notifications',`id=eq.${encodeURIComponent(b.id)}&member_email=eq.${encodeURIComponent(email)}`,{is_read:true})
 return NextResponse.json({ok:true})
}
