"use client"

import { useState } from "react"

const categories = [
  {
    key:"my", icon:"❤️", title:"MY DVAJA",
    intro:null,
    questions:[
      {q:"Chcel/a by som, aby ma partner častejšie spontánne objal.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som viac bozkov počas bežného dňa.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som, aby sme si častejšie vyšli na spoločnú večeru alebo rande.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som večer bez telefónov — iba my dvaja.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som častejšie počuť konkrétne, čo si na mne partner váži.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som si počas dňa posielať viac milých alebo flirtujúcich správ.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som aspoň raz za tri mesiace víkend alebo krátky pobyt iba vo dvojici.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som, aby sme si každý mesiac naplánovali aspoň jeden spoločný zážitok.",a:["❤️ Áno, veľmi","🙂 Možno / občas","👌 Nepotrebujem to viac"]}
    ]
  },
  {
    key:"filter",icon:"💬",title:"BEZ FILTRA",
    intro:"Prvú vrstvu máme. Teraz sa pozrieme na to, ako sa navzájom čítate, počúvate a čo od seba potrebujete.",
    questions:[
      {q:"Ako podľa teba partner najlepšie prejavuje, že mu na tebe záleží?",a:["🤍 Dotykom","💬 Slovami","⏳ Spoločným časom","🫶 Konkrétnou pomocou"]},
      {q:"Máš pocit, že sa spolu dostatočne rozprávate o tom, čo prežívate a cítite?",a:["❤️ Áno","🙂 Väčšinou áno","🤔 Mohli by sme viac","💬 Chýba mi to"]},
      {q:"Keď je pre teba niečo dôležité, máš pocit, že ťa partner naozaj počúva?",a:["❤️ Áno","🙂 Väčšinou","🤔 Nie vždy","💬 Chcel/a by som viac"]},
      {q:"Dokážeš partnerovi otvorene povedať, čo potrebuješ, bez obavy z jeho reakcie?",a:["❤️ Áno","🙂 Väčšinou","🤔 Niekedy je to ťažké","💬 Chcel/a by som to vedieť lepšie"]},
      {q:"Keď si v strese alebo ti nie je dobre, čo od partnera potrebuješ najviac?",a:["🤍 Objatie","👂 Aby ma vypočul","🧩 Pomôcť nájsť riešenie","🌙 Dať mi chvíľu priestor"]},
      {q:"Keď sa pohádate, čo ti najviac vyhovuje?",a:["💬 Vyriešiť to hneď","🌙 Najprv vychladnúť","❤️ Najprv uistenie, potom rozhovor","🤝 Vrátiť sa k tomu, keď sme obaja pokojní"]},
      {q:"Ktorú vetu by si od partnera chcel/a počuť častejšie?",a:["❤️ Ľúbim ťa","👑 Som na teba hrdý/á","🤍 Vážim si, čo robíš","🔥 Stále ma priťahuješ"]},
      {q:"Kedy sa cítiš partnerovi najbližšie?",a:["💬 Pri úprimnom rozhovore","🤍 Pri dotykoch","🌍 Pri spoločnom zážitku","😄 Keď sa spolu smejeme"]}
    ]
  },
  {
    key:"future",icon:"🔮",title:"NAŠA BUDÚCNOSŤ",
    intro:"Viete, ako fungujete dnes. Teraz sa pozrieme na to, kam by ste chceli smerovať spolu.",
    questions:[
      {q:"Ako by si si najradšej predstavoval/a váš spoločný život o 5 rokov?",a:["🏡 Stabilita a pokoj","🌍 Zážitky a cestovanie","🚀 Spoločne niečo budovať","⚖️ Rovnováha zo všetkého"]},
      {q:"Aký veľký spoločný sen by si chcel/a splniť v najbližších 3 rokoch?",a:["🏡 Bývanie / domov","✈️ Veľká cesta","❤️ Rodinný sen","🚀 Vybudovať niečo vlastné"]},
      {q:"Ak by ste mali výrazne viac peňazí, kam by si ich najradšej smeroval/a?",a:["🌍 Do zážitkov","🏡 Do bývania a istoty","💎 Do finančnej slobody","⚖️ Rozdelil/a by som to medzi všetko"]},
      {q:"Ak by prišlo finančne náročné obdobie, veríš, že by ste sa dokázali navzájom podržať?",a:["❤️ Určite áno","🙂 Skôr áno","🤔 Neviem","💬 Potrebovali by sme sa o tom porozprávať"]},
      {q:"Ak by sa partnerovi dlhšie nedarilo v práci alebo kariére, dokázal/a by si pri ňom stáť a veriť, že to spolu zvládnete?",a:["❤️ Určite","🙂 Skôr áno","🤔 Záležalo by od situácie","💬 Potreboval/a by som otvorený plán"]},
      {q:"Ak ešte nemáte deti, ako to cítiš do budúcnosti?",a:["❤️ Určite ich chcem","🙂 Skôr ich chcem","🤔 Nie som si istý/á","👌 Nechcem deti","— Netýka sa nás to"]},
      {q:"Ak by si jeden z vás chcel splniť vlastný veľký projekt alebo osobný sen, ako by si k tomu pristúpil/a?",a:["👑 Sme tím, išiel/a by som do toho s ním/ňou","❤️ Podporil/a by som ho/ju","🧠 Najprv by som posúdil/a riziká","↔️ Nechal/a by som to ako jeho/jej vlastnú cestu"]},
      {q:"Keď si predstavíš, že spolu zostarnete, čo by si medzi vami chcel/a zachovať najviac?",a:["😄 Smiech","🌍 Objavovanie","🤝 Vzájomnú oporu","🔥 Blízkosť a iskru"]}
    ]
  },
  {
    key:"intimacy",icon:"🔥",title:"INTIMITA",
    intro:"Budúcnosť máme. Teraz pôjdeme bližšie — k tomu, čo medzi vami vytvára príťažlivosť, dotyk a iskru.",
    questions:[
      {q:"Chcel/a by som medzi nami viac vášnivých bozkov.",a:["🔥 Áno, veľmi","😏 Bol/a by som za","🤔 Nie som si istý/á","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som, aby sme si niekedy dopriali sex bez ponáhľania a vyrušovania.",a:["🔥 Áno, veľmi","😏 Bol/a by som za","🤔 Nie som si istý/á","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som, aby partner častejšie inicioval sex.",a:["🔥 Áno, veľmi","😏 Občas by sa mi to páčilo","🤔 Neviem","👌 Nepotrebujem to viac"]},
      {q:"Chcel/a by som si niekedy dopriať dlhšiu predohru.",a:["🔥 Áno, veľmi","😏 Bol/a by som za","🤔 Nie som si istý/á","👌 Nepotrebujem to viac"]},
      {q:"Aká atmosféra ti pri intimite sedí najviac?",a:["🕯️ Pomalá a zmyselná","🔥 Spontánna a vášnivá","😈 Hravá a provokatívna","🤍 Blízka a nežná"]},
      {q:"Chcel/a by som partnerovi otvorenejšie hovoriť, čo mi robí dobre a po čom túžim.",a:["🔥 Áno","😏 Bol/a by som otvorený/á","🤔 Nie je to pre mňa ľahké","👌 Takto mi to vyhovuje"]},
      {q:"Lákalo by ťa niekedy zmeniť miesto a nebyť pri sexe vždy iba v posteli?",a:["🔥 Áno, láka ma to","😏 Bol/a by som otvorený/á skúsiť","🤔 Nie som si istý/á","🛑 Nie, toto nechcem"]},
      {q:"Čoho by si chcel/a vo vašej intimite viac?",a:["🤍 Nežnosti","🔥 Vášne","😈 Hry a flirtu","✨ Nových zážitkov"]}
    ]
  },
  {
    key:"secret",icon:"😈",title:"TAJNÉ TÚŽBY",
    intro:"Posledná vrstva. Teraz môžete byť úplne úprimní. To, čo označíš iba ty, partnerovi neukážeme. Túžbu odhalíme len vtedy, keď sa v nej bezpečne stretnete obaja.",
    questions:[
      {q:"V intimite ťa viac láka viesť, nechať sa viesť alebo role striedať?",a:["👑 Radšej vediem","😈 Radšej sa nechám viesť","↔️ Chcem role striedať","👌 Nemám výraznú preferenciu"]},
      {q:"Aký štýl intimity ťa priťahuje najviac?",a:["🤍 Nežný a pomalý","🔥 Intenzívnejší a dominantnejší","↔️ Chcem ich striedať","✨ Podľa nálady"]},
      {q:"Lákalo by ťa, keby ti partner pri intimite zaviazal oči?",a:["🔥 Áno, láka ma to","😏 Bol/a by som otvorený/á skúsiť","🤔 Nie som si istý/á","🛑 Nie, toto nechcem"]},
      {q:"Lákalo by ťa bezpečné a dobrovoľné obmedzenie pohybu, napríklad putami?",a:["🔥 Áno, láka ma to","😏 Bol/a by som otvorený/á skúsiť","🤔 Nie som si istý/á","🛑 Nie, toto nechcem"]},
      {q:"Lákala by ťa erotická hra na role, pri ktorej na chvíľu vystúpite zo svojich bežných rolí?",a:["🔥 Áno, láka ma to","😏 Bol/a by som otvorený/á skúsiť","🤔 Nie som si istý/á","🛑 Nie, toto nechcem"]},
      {q:"Lákalo by ťa vyskúšať s partnerom análny sex?",a:["🔥 Áno, láka ma to","😏 Bol/a by som otvorený/á skúsiť","🤔 Nie som si istý/á","🛑 Nie, toto nechcem"]},
      {q:"Lákala by ťa spoločná sexuálna skúsenosť v trojici s ďalším dospelým človekom?",a:["🔥 Áno, láka ma to","😏 Bol/a by som otvorený/á skúsiť","🤔 Nie som si istý/á","🛑 Nie, toto nechcem"]},
      {q:"Máš fantáziu, ktorú by si partnerovi prezradil/a iba vtedy, keby si vedel/a, že ho/ju tiež láka?",a:["🔥 Áno","😏 Možno áno","🤔 Nie som si istý/á","👌 Nie"]}
    ]
  }
]

export default function DesireTest(){
  const [cat,setCat]=useState(0)
  const [q,setQ]=useState(0)
  const [answers,setAnswers]=useState({})
  const [transition,setTransition]=useState(false)
  const [finished,setFinished]=useState(false)
  const [submitting,setSubmitting]=useState(false)
  const [submitError,setSubmitError]=useState("")
  const [marketingBusy,setMarketingBusy]=useState(false)
  const [marketingSaved,setMarketingSaved]=useState(false)

  const current=categories[cat]
  const question=current.questions[q]

  function select(answer){
    const next={...answers,[`${cat}-${q}`]:answer}
    setAnswers(next)
    try{sessionStorage.setItem("desire_answers",JSON.stringify(next))}catch{}
    if(q<7){ setQ(q+1); return }
    if(cat<categories.length-1){ setTransition(true); return }
    submitCompleted(next)
  }

  async function submitCompleted(finalAnswers){
    setSubmitting(true); setSubmitError("")
    try{
      const params=new URLSearchParams(window.location.search)
      const role=params.get("role")==="B" ? "B" : "A"
      const accessToken=sessionStorage.getItem(role==="B"?"desire_b_access_token":"desire_a_access_token")
      if(!accessToken) throw new Error("NO_TOKEN")
      const payload=[]
      categories.forEach((c,ci)=>c.questions.forEach((qq,qi)=>payload.push({questionKey:`${c.key}_${qi+1}`,categoryKey:c.key,answerCode:finalAnswers[`${ci}-${qi}`]})))
      const r=await fetch("https://siferzggaubvtjlqdckj.supabase.co/functions/v1/desire-api",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:role==="B"?"submit_b":"submit_a",accessToken,answers:payload})})
      const data=await r.json(); if(!r.ok) throw new Error(data.error||"SUBMIT_FAILED")
      if(role==="A") sessionStorage.setItem("desire_invite_token",data.inviteToken)
      setFinished(true)
    }catch(e){ setSubmitError("Odpovede sa nepodarilo bezpečne uložiť. Skús poslednú odpoveď ešte raz.") }
    finally{setSubmitting(false)}
  }

  async function saveMarketingConsent(){
    const email=sessionStorage.getItem("desire_email")||""
    if(!email) return
    setMarketingBusy(true)
    try{
      const r=await fetch("/api/marketing-consent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,language:"sk",source:"desire_post_test"})})
      if(!r.ok) throw new Error("SAVE_FAILED")
      sessionStorage.setItem("desire_marketing","1")
      setMarketingSaved(true)
    }catch{}
    finally{setMarketingBusy(false)}
  }

  function nextCategory(){
    setCat(cat+1); setQ(0); setTransition(false)
  }

  if(finished){
    const isB = typeof window!=="undefined" && new URLSearchParams(window.location.search).get("role")==="B"
    if(isB){
      return <div className="testShell">
        <header className="testTop"><a className="testLogo" href="/">MR GREY'S <span>DESIRE</span></a><span className="testCounter">OBAJA ✓</span></header>
        <div className="roomProgress">{categories.map((_,i)=><i key={i} className="roomDot active"/>)}</div>
        <main className="questionStage"><section className="categoryDone inviteDone">
          <div className="heartPulse">❤️</div><div className="questionCategory">OBAJA STE HOTOVÍ</div>
          <h1>Dve samostatné odpovede.<br/>Jedno spoločné DESIRE. 😈</h1>
          <p>Vaše odpovede sú bezpečne uložené a pripravené na spojenie cez privacy filter. <strong>Jednotlivé odpovede si navzájom neukážeme.</strong></p>
          <div className="secretPrivacy"><b>❤️ Ďalší krok: VAŠE DESIRE</b><br/>Teraz vytvoríme spoločný výsledok iba z toho, čo sa medzi vami môže bezpečne zobraziť.</div>
          {typeof window!=="undefined" && sessionStorage.getItem("desire_marketing")!=="1" && <div className="desirePostOptin"><b>Týmto sa to nekončí. 😈</b><span>Chceš dostať ďalší test, nový príbeh alebo výhodu pre vás dvoch priamo do e-mailu?</span>{marketingSaved?<strong>✓ Hotovo. Ďalšie MR GREY’S novinky ti môžeme poslať.</strong>:<button className="testGhostBtn" disabled={marketingBusy} onClick={saveMarketingConsent}>{marketingBusy?"UKLADÁM…":"ÁNO, CHCEM ĎALŠÍ TEST →"}</button>}<small>Kedykoľvek sa môžeš jednoducho odhlásiť.</small></div>}
        </section></main>
      </div>
    }
    return <div className="testShell">
      <header className="testTop"><a className="testLogo" href="/">MR GREY'S <span>DESIRE</span></a><span className="testCounter">TVOJA ČASŤ ✓</span></header>
      <div className="roomProgress">{categories.map((_,i)=><i key={i} className="roomDot active"/>)}</div>
      <main className="questionStage">
        <section className="categoryDone inviteDone">
          <div className="heartPulse">😈</div>
          <div className="questionCategory">TVOJA ČASŤ JE HOTOVÁ</div>
          <h1>Teraz chýba už len<br/>druhá polovica. ❤️</h1>
          <p>Možno ste práve obaja označili niečo, čo ste si ešte nikdy nepovedali. <strong>Tvoje odpovede sú bezpečne uložené a zostávajú súkromné.</strong> Výsledok vytvoríme až po dokončení partnerovej časti.</p>
          <button className="desirePrimary" onClick={async()=>{
            const invite=sessionStorage.getItem("desire_invite_token")
            if(!invite) return
            const url=window.location.origin+"/desire/partner?invite="+encodeURIComponent(invite)
            const text="Dokončil/a som svoju časť MR GREY'S DESIRE ❤️ Teraz si na rade ty. 😈 Odpovede máme každý súkromné a DESIRE nám ukáže iba to, v čom sa stretneme. Som zvedavý/á, čo o nás objaví. 👀"
            if(navigator.share){try{await navigator.share({title:"MR GREY'S DESIRE",text,url})}catch{}}
            else{await navigator.clipboard.writeText(text+" "+url)}
          }}>❤️ POSLAŤ PARTNEROVI</button>
          <div className="testNote">🔒 Pozývací odkaz neobsahuje tvoje odpovede.</div>
          {typeof window!=="undefined" && sessionStorage.getItem("desire_marketing")!=="1" && <div className="desirePostOptin"><b>Týmto sa to nekončí. 😈</b><span>Chceš dostať ďalší test, nový príbeh alebo výhodu pre vás dvoch priamo do e-mailu?</span>{marketingSaved?<strong>✓ Hotovo. Ďalšie MR GREY’S novinky ti môžeme poslať.</strong>:<button className="testGhostBtn" disabled={marketingBusy} onClick={saveMarketingConsent}>{marketingBusy?"UKLADÁM…":"ÁNO, CHCEM ĎALŠÍ TEST →"}</button>}<small>Kedykoľvek sa môžeš jednoducho odhlásiť.</small></div>}
        </section>
      </main>
    </div>
  }

  if(transition){
    const next=categories[cat+1]
    const secret=next.key==="secret"
    return <div className="testShell">
      <header className="testTop"><a className="testLogo" href="/">MR GREY'S <span>DESIRE</span></a><span className="testCounter">{current.icon} {current.title} ✓</span></header>
      <div className="roomProgress">{categories.map((_,i)=><i key={i} className={"roomDot "+(i<=cat?"active":"")}/>)}</div>
      <main className="questionStage">
        <section className="categoryDone">
          <div className="heartPulse">{next.icon}</div>
          <div className="questionCategory">{cat+1}. VRSTVA JE HOTOVÁ</div>
          <h1>{next.title}</h1>
          <p>{next.intro}</p>
          {secret && <div className="secretPrivacy"><b>🔒 Žiadne hodnotenie. Žiadne presviedčanie.</b><br/>Ak sa v citlivej túžbe bezpečne nestretnete obaja, v spoločnom výsledku sa vôbec nezobrazí.</div>}
          <button className="desirePrimary" onClick={nextCategory}>POKRAČOVAŤ: {next.icon} {next.title} →</button>
        </section>
      </main>
    </div>
  }

  return <div className={"testShell category-"+current.key}>
    <header className="testTop">
      <a className="testLogo" href="/">MR GREY'S <span>DESIRE</span></a>
      <span className="testCounter">{cat+1}. VRSTVA Z 5</span>
    </header>
    <div className="roomProgress">{categories.map((_,i)=><i key={i} className={"roomDot "+(i<=cat?"active":"")}/>)}</div>
    <main className="questionStage">
      <section className="questionWrap">
        <div className="questionCategory">{current.icon} {current.title}</div>
        <div className="questionIndex">{q+1} / 8</div>
        <div className="questionCard" key={`${cat}-${q}`}>
          <h1>{question.q}</h1>
          <div className="answerGrid">
            {question.a.map(a=><button className="answerBtn" disabled={submitting} key={a} onClick={()=>select(a)}>{submitting?"Bezpečne ukladám…":a}</button>)}
          </div>
        </div>
        <div className="testNote">🔒 <b>Odpovedaj za seba.</b> Partner jednotlivé odpovede neuvidí.</div>{submitError && <div className="desireError">{submitError}</div>}
      </section>
    </main>
  </div>
}
