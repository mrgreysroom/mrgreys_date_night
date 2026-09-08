'use client'
import {useEffect,useState} from 'react'
export default function StoryFollow({slug}){const [on,setOn]=useState(false),[busy,setBusy]=useState(false)
 useEffect(()=>{fetch('/api/account/story-follow?slug='+encodeURIComponent(slug)).then(r=>r.json()).then(d=>setOn((d.items||[]).some(x=>x.story_slug===slug&&x.is_active))).catch(()=>{})},[slug])
 async function toggle(){setBusy(true);const r=await fetch('/api/account/story-follow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,active:!on,email_enabled:true,club_enabled:true})});if(r.ok)setOn(!on);setBusy(false)}
 return <button className={'storyFollowBtn '+(on?'active':'')} disabled={busy} onClick={toggle}>{on?'✓ UPOZORNENIE JE ZAPNUTÉ':'🔔 UPOZORNIŤ MA NA ĎALŠIU ČASŤ'}</button>}
