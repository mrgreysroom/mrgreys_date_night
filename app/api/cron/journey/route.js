import {NextResponse} from 'next/server'
import {supabaseSelect,supabaseUpdate,supabaseInsert} from '../../../../lib/supabaseAdmin'
import {sendServiceEmail} from '../../../../lib/email'
const DEFAULT=[{slug:'my-dvaja',afterDays:0},{slug:'bez-filtra',afterDays:3},{slug:'nasa-buducnost',afterDays:4},{slug:'intimita',afterDays:4},{slug:'tajne-tuzby',afterDays:5}]
export async function GET(req){
 const secret=process.env.CRON_SECRET; if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401})
 try{const now=new Date();const rows=await supabaseSelect('desire_journeys',`status=eq.active&next_unlock_at=lte.${encodeURIComponent(now.toISOString())}&select=*&limit=100`);let advanced=0
  for(const j of rows||[]){const seq=Array.isArray(j.sequence)?j.sequence:DEFAULT;const next=Number(j.current_step||0)+1;if(next>=seq.length){await supabaseUpdate('desire_journeys',`id=eq.${j.id}`,{status:'complete',current_step:next,next_unlock_at:null,updated_at:now.toISOString()});continue}const following=seq[next+1];const nextAt=following?new Date(now.getTime()+Number(following.afterDays||3)*86400000).toISOString():null;await supabaseUpdate('desire_journeys',`id=eq.${j.id}`,{current_step:next,next_unlock_at:nextAt,updated_at:now.toISOString()});const slug=seq[next].slug;for(const email of [j.owner_email,j.partner_email].filter(Boolean)){try{await supabaseInsert('member_notifications',[{member_email:String(email).toLowerCase(),kind:'desire',title:'✨ Ďalší krok DESIRE je pripravený',body:'Vaša spoločná Journey pokračuje. Nový test je odomknutý.',href:`/desire/deep/${slug}`}]);await sendServiceEmail({to:email,lang:'sk',template:'journey_step',data:{href:`${process.env.NEXT_PUBLIC_SITE_URL||'https://mrgrey.sk'}/desire/deep/${slug}`}})}catch{}}advanced++}
  return NextResponse.json({ok:true,advanced})
 }catch(e){return NextResponse.json({error:e.message},{status:500})}
}
