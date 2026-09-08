"use client"

import { useEffect, useState } from "react"

const API="https://siferzggaubvtjlqdckj.supabase.co/functions/v1/desire-api"

export default function DesirePartner(){
  const [invite,setInvite]=useState("")
  const [valid,setValid]=useState(null)
  const [email,setEmail]=useState("")
  const [adult,setAdult]=useState(false)
  const [marketing,setMarketing]=useState(false)
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(false)
  const [inviter,setInviter]=useState("")

  useEffect(()=>{
    const token=new URLSearchParams(window.location.search).get("invite")||""
    setInvite(token)
    if(!token){setValid(false);return}
    fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"invite_info",inviteToken:token})})
      .then(async r=>({ok:r.ok,data:await r.json()})).then(x=>{setValid(x.ok);if(x.ok)setInviter(x.data?.inviterName||x.data?.inviter_name||x.data?.ownerName||x.data?.owner_name||x.data?.ownerEmail||x.data?.owner_email||"")}).catch(()=>setValid(false))
  },[])

  async function join(e){
    e.preventDefault(); setError("")
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError("Zadaj prosím platný e-mail.");return}
    if(!adult){setError("Pre pokračovanie je potrebné potvrdiť vek 18+.");return}
    setLoading(true)
    try{
      const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"join_b",inviteToken:invite,email,adult:true,marketing})})
      const data=await r.json(); if(!r.ok) throw new Error(data.error||"JOIN_FAILED")
      sessionStorage.setItem("desire_b_access_token",data.accessToken)
      sessionStorage.setItem("desire_session_id",data.sessionId)
      sessionStorage.setItem("desire_email",email)
      sessionStorage.setItem("desire_marketing",marketing ? "1" : "0")
      window.location.href="/desire/test?role=B"
    }catch(e){setError(e.message==="INVITE_ALREADY_CLAIMED"?"Tento pozývací odkaz už používa partner.":"Pozvánku sa nepodarilo pripojiť. Skús to prosím znova.")}
    finally{setLoading(false)}
  }

  return <div className="desireShell">
    <header className="desireNav"><a className="brand" href="/">MR GREY'S<span>WORLD</span></a><a className="desireBack" href="/">← WORLD</a></header>
    <main className="desireStage"><div className="desireAura"/><section className="desireEntry desireTransition">
      <div className="lockBig">😈</div><div className="desireMini">❤️ MR GREY'S DESIRE</div>
      <h2>{inviter?<>Pozval vás {inviter}.<br/>DESIRE čaká na vás.</>:<>Partner vás pozval<br/>do DESIRE.</>}</h2>
      {valid===null && <p>Bezpečne overujeme pozvánku…</p>}
      {valid===false && <><p>Táto pozvánka nie je platná alebo už nie je dostupná.</p><a className="desirePrimary" href="/desire">OTVORIŤ DESIRE</a></>}
      {valid===true && <>
        <p>Partner už dokončil svoju časť. Teraz si na rade ty. <strong>Odpovedáš samostatne a partner tvoje jednotlivé odpovede neuvidí.</strong></p>
        <div className="desirePrivacy"><i>🔒</i><span>Tajné túžby odhalíme iba vtedy, keď sa v nich bezpečne stretnete obaja.</span></div>
        <form className="desirePanel" onSubmit={join}>
          <h2>Pripoj sa k vášmu DESIRE.</h2>
          <p>Tvoj e-mail potrebujeme na uloženie postupu, bezpečné prepojenie s vaším spoločným DESIRE a doručenie výsledku.</p>
          <div className="desireField"><label>TVÔJ E-MAIL</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="napr. meno@email.sk" autoComplete="email"/></div>
          <div className="desireChecks">
            <label className="desireCheck"><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/><span>Potvrdzujem, že mám minimálne 18 rokov. <small>Povinné.</small></span></label>
            <label className="desireCheck"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/><span><strong>Chcem dostávať nové testy, príbehy, hry a výhody zo sveta MR GREY’S. 😈</strong> <small>Súhlasím so zasielaním marketingových noviniek na uvedený e-mail. Súhlas môžem kedykoľvek jednoducho odvolať. Voliteľné.</small></span></label>
          </div>
          <button className="desirePrimary" disabled={loading} type="submit">{loading?"PRIPÁJAM…":"ZAČAŤ MOJU ČASŤ ❤️"}</button>
          {error && <div className="desireError">{error}</div>}
        </form>
        <div className="desireMeta"><span>◷ 5–8 MIN</span><span>🔒 SÚKROMNÉ</span><span>18+</span></div>
      </>}
    </section></main>
  </div>
}
