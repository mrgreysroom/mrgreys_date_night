"use client"

import { useState } from "react"
import LanguageSwitcher from "../../components/LanguageSwitcher"

export default function DesireEntry(){
  const [email,setEmail] = useState("")
  const [adult,setAdult] = useState(false)
  const [marketing,setMarketing] = useState(false)
  const [error,setError] = useState("")
  const [ready,setReady] = useState(false)

  async function continueToPrivacy(e){
    e.preventDefault()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if(!validEmail){ setError("Zadajte prosím platný e-mail."); return }
    if(!adult){ setError("Pre pokračovanie je potrebné potvrdiť vek 18+."); return }
    try{
      const r = await fetch("https://siferzggaubvtjlqdckj.supabase.co/functions/v1/desire-api", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"create",email,adult:true,marketing,language:"sk"})
      })
      const data = await r.json()
      if(!r.ok) throw new Error(data.error || "CREATE_FAILED")
      sessionStorage.setItem("desire_email", email)
      sessionStorage.setItem("desire_marketing", marketing ? "1" : "0")
      sessionStorage.setItem("desire_a_access_token", data.accessToken)
      sessionStorage.setItem("desire_session_id", data.sessionId)
    }catch(err){ setError("Nepodarilo sa bezpečne vytvoriť DESIRE. Skús to prosím znova."); return }
    setError("")
    setReady(true)
  }

  if(ready){
    return <div className="desireShell">
      <header className="desireNav">
        <a className="brand" href="/">MR GREY'S<span>WORLD</span></a>
        <a className="desireBack" href="/">← SPÄŤ DO WORLD</a>
      </header>
      <main className="desireStage">
        <div className="desireAura"/>
        <section className="desireEntry desireTransition">
          <div className="lockBig">🔒</div>
          <div className="desireMini">PRED PRVOU OTÁZKOU</div>
          <h2>Odpovedaj za seba.<br/>Nie za partnera.</h2>
          <p>DESIRE funguje najlepšie vtedy, keď sú vaše odpovede naozaj vaše. <strong>Partner neuvidí tvoje jednotlivé odpovede.</strong> Spojíme iba to, čo sa medzi vami môže bezpečne stať spoločným objavom.</p>
          <a className="desirePrimary" style={{display:"flex",alignItems:"center",justifyContent:"center"}} href="/desire/test">ZAČAŤ MOJU ČASŤ ❤️</a>
          <button className="testGhostBtn" onClick={()=>setReady(false)}>← Späť</button>
        </section>
      </main>
    </div>
  }

  return <div className="desireShell">
    <header className="desireNav">
      <a className="brand" href="/">MR GREY'S<span>WORLD</span></a>
      <div className="desireNavRight"><LanguageSwitcher/><span>SÚKROMNÉ • 18+ • ZDARMA</span><a className="desireBack" href="/">← WORLD</a></div>
    </header>
    <main className="desireStage">
      <div className="desireAura"/>
      <section className="desireEntry">
        <div className="desireMini">❤️ MR GREY'S DESIRE</div>
        <h1 className="desireTitle">DESIRE<span>.</span></h1>
        <h2 className="desireHook">Po čom obaja túžite…<br/><em>ale ešte ste si to nepovedali?</em></h2>
        <p className="desireIntro">Možno po väčšej blízkosti, novom zážitku, väčšej iskre alebo po niečom, o čom ste sa ešte nikdy nerozprávali. Každý odpovedá samostatne. DESIRE vám ukáže iba to, v čom sa bezpečne stretnete.</p>
        <div className="desirePrivacy"><i>🔒</i><span>Tvoje jednotlivé odpovede partnerovi neukážeme.</span></div>

        <section className="desireTaste">
          <small>✨ PRVÁ OCHUTNÁVKA MR GREY'S DESIRE</small>
          <h3>Tento bezplatný test je výberom z našich 5 hlbších DESIRE testov.</h3>
          <p>Ochutnáte každú z piatich oblastí a zistíte, čo vás spája. Po výsledku môžete každú z nich preskúmať oveľa hlbšie.</p>
          <div className="desireTastePills"><a href="/desire/deep/my-dvaja">❤️ MY DVAJA</a><a href="/desire/deep/bez-filtra">💬 BEZ FILTRA</a><a href="/desire/deep/nasa-buducnost">🔮 NAŠA BUDÚCNOSŤ</a><a href="/desire/deep/intimita">🔥 INTIMITA</a><a href="/desire/deep/tajne-tuzby">😈 TAJNÉ TÚŽBY</a></div>
          <div className="desireTastePrice">Kliknite na ktorúkoľvek oblasť, pozrite si detail a odomknite ju <b>za 2,99 € jednorazovo</b> · alebo získajte všetkých 5 v <b>MR GREY'S CLUB za 9,90 €/mesiac</b>.</div>
        </section>

        <div className="desireHow"><b>AKO TO FUNGUJE?</b><span>Ty odpovieš → pošleš partnerovi → partner odpovie → objavíte, v čom sa stretávate. ❤️</span><small>🔒 Vaše jednotlivé odpovede zostávajú súkromné.</small></div>

        <form className="desirePanel" onSubmit={continueToPrivacy}>
          <h2>Začni svoju časť.</h2>
          <p>E-mail použijeme na uloženie postupu, bezpečné prepojenie vášho spoločného DESIRE a doručenie výsledku.</p>
          <div className="desireField">
            <label>TVÔJ E-MAIL</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="napr. meno@email.sk" autoComplete="email"/>
          </div>
          <div className="desireChecks">
            <label className="desireCheck">
              <input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/>
              <span>Potvrdzujem, že mám minimálne 18 rokov. <small>Povinné pre vstup do MR GREY'S DESIRE.</small></span>
            </label>
            <label className="desireCheck">
              <input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/>
              <span><strong>Chcem dostávať nové testy, príbehy, hry a výhody zo sveta MR GREY’S. 😈</strong> <small>Súhlasím so zasielaním marketingových noviniek na uvedený e-mail. Súhlas môžem kedykoľvek jednoducho odvolať. Voliteľné — DESIRE dokončíš aj bez neho.</small></span>
            </label>
          </div>
          <button className="desirePrimary" type="submit">VYTVORIŤ NAŠE DESIRE 😈</button>
          {error && <div className="desireError">{error}</div>}
        </form>

        <section className="deepExplore">
          <small>✨ 5 HLBŠÍCH DESIRE TESTOV</small>
          <h2>Chcete ísť ešte hlbšie?</h2>
          <p>Po bezplatnom DESIRE môžete pokračovať presne tam, kde vás to zaujalo najviac. Vyberte si jeden test za 2,99 € alebo odomknite všetkých päť.</p>
          <div className="deepExploreGrid">
            <a href="/desire/deep/my-dvaja"><b>❤️ MY DVAJA</b><span>Blízkosť, pozornosť a vaše spoločné rituály.</span><i>OBJAVIŤ TEST →</i></a>
            <a href="/desire/deep/bez-filtra"><b>💬 BEZ FILTRA</b><span>Rozhovory, potreby a témy, ktoré často odkladáme.</span><i>OBJAVIŤ TEST →</i></a>
            <a href="/desire/deep/nasa-buducnost"><b>🔮 NAŠA BUDÚCNOSŤ</b><span>Sny, priority a smer, ktorým chcete ísť spolu.</span><i>OBJAVIŤ TEST →</i></a>
            <a href="/desire/deep/intimita"><b>🔥 INTIMITA</b><span>Dotyk, atmosféra, tempo a to, čo vás priťahuje.</span><i>OBJAVIŤ TEST →</i></a>
            <a href="/desire/deep/tajne-tuzby"><b>😈 TAJNÉ TÚŽBY</b><span>Najodvážnejšia vrstva — iba bezpečné spoločné objavy.</span><i>OBJAVIŤ TEST →</i></a>
          </div>
          <div className="desireBundle">
            <div><small>💜 KOMPLETNÉ DESIRE</small><h3>Všetkých 5 hlbších testov</h3><strong>14,95 €</strong><p>Jednorazovo · zostanú vám odomknuté natrvalo.</p><a href="/api/stripe/create-desire-checkout?bundle=1">KÚPIŤ VŠETKY TESTY — 14,95 € →</a></div>
            <div className="bundleClub"><small>👑 MR GREY'S CLUB</small><h3>Všetkých 5 testov + celý Club</h3><strong>9,90 € <em>/ mesiac</em></strong><p>PLAY, Stories, Academy, Journey a členské výhody.</p><a href="/club/join">VSTÚPIŤ DO CLUBU — 9,90 € / MES. →</a></div>
          </div>
        </section>

        <div className="desireMeta"><span>◷ 5–8 MIN</span><span>♡ PRE VÁS OBOCH</span><span>18+ ZDARMA</span></div>

      </section>
    </main>
  </div>
}
