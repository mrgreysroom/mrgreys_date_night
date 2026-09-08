import crypto from 'crypto'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {readClubToken,clubCookieName} from '../../../../lib/clubAuth'
import {supabaseUpsert} from '../../../../lib/supabaseAdmin'

export async function POST(req){
  try{
    const member=readClubToken(cookies().get(clubCookieName)?.value)
    if(!member) return NextResponse.json({ok:false},{status:401})
    const {slug}=await req.json(); if(!slug) return NextResponse.json({ok:false},{status:400})
    const ref=crypto.createHash('sha256').update(String(member.stripeCustomer||member.email||'member')).digest('hex')
    await supabaseUpsert('story_likes',[{member_ref:ref,story_slug:String(slug).slice(0,80)}],'member_ref,story_slug')
    return NextResponse.json({ok:true})
  }catch(e){return NextResponse.json({ok:false,error:e.message},{status:500})}
}
