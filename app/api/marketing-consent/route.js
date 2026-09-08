import { NextResponse } from "next/server"
import { supabaseInsert, supabaseSelect, supabaseUpdate } from "../../../lib/supabaseAdmin"

export async function POST(req){
  try{
    const body=await req.json().catch(()=>({}))
    const email=String(body?.email||"").trim().toLowerCase()
    const language=String(body?.language||"sk").toLowerCase()
    const source=String(body?.source||"desire_post_test").slice(0,80)
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({error:"INVALID_EMAIL"},{status:400})
    const now=new Date().toISOString()
    const found=await supabaseSelect("marketing_leads",`email=eq.${encodeURIComponent(email)}&select=id&limit=1`)
    if(found?.length){
      await supabaseUpdate("marketing_leads",`id=eq.${encodeURIComponent(found[0].id)}`,{marketing_consent:true,consented_at:now,unsubscribed_at:null,language,source,updated_at:now})
    }else{
      await supabaseInsert("marketing_leads",[{email,selected_packs:[],marketing_consent:true,consented_at:now,unsubscribed_at:null,source,language,created_at:now,updated_at:now}])
    }
    return NextResponse.json({ok:true})
  }catch(e){
    console.error("marketing-consent",e)
    return NextResponse.json({error:"CONSENT_SAVE_FAILED"},{status:500})
  }
}
