"use client"
import {useEffect,useState} from 'react'
export default function Welcome(){
 const [state,setState]=useState('Aktivujeme váš Club…')
 useEffect(()=>{let n=0,stop=false;async function go(){const id=new URLSearchParams(window.location.search).get('session_id');if(!id){setState('Chýba identifikácia platby.');return}n++;try{const r=await fetch('/api/club/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:id})});const d=await r.json();if(d.active){window.location.replace('/club');return}}catch{}if(!stop&&n<12)setTimeout(go,1200);else if(!stop)setState('Platba prebehla. Aktivácia trvá dlhšie než zvyčajne — obnovte stránku o chvíľu.')}go();return()=>{stop=true}},[])
 return <div className="welcomeShell"><div className="welcomeCard"><div className="welcomeCrown">♛</div><small>MR GREY'S CLUB</small><h1>Vitajte vo vašom súkromnom svete.</h1><p>{state}</p><div className="welcomePulse"/></div></div>
}
