"use client"
import {useState} from 'react'
import LanguageSwitcher from '../../../components/LanguageSwitcher'

export default function JoinClub(){
 const [form,setForm]=useState({name:'',email:'',password:'',password2:'',dob:'',adult:false,marketing:false,terms:false})
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 function set(k,v){setForm(f=>({...f,[k]:v}))}
 async function submit(e){
   e.preventDefault(); setError('')
   if(form.password.length<8){setError('Heslo musí mať aspoň 8 znakov.');return}
   if(form.password!==form.password2){setError('Heslá sa nezhodujú.');return}
   if(!form.adult||!form.terms){setError('Pre pokračovanie potvrďte vek 18+ a podmienky členstva.');return}
   setBusy(true)
   try{
     const rr=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
     const rd=await rr.json(); if(!rr.ok) throw new Error(rd.error||'Registrácia zlyhala.')
     if(rd.fullAccess){window.location.href='/club';return}
     const r=await fetch('/api/stripe/create-club-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
     const d=await r.json(); if(!r.ok||!d.url) throw new Error(d.error||'Platbu sa nepodarilo otvoriť.')
     window.location.href=d.url
   }catch(err){setError(err.message)}finally{setBusy(false)}
 }
 return <div className="joinShell"><div className="joinBackdrop"/><a className="joinBack" href="/">← MR GREY'S WORLD</a><div className="joinLang"><LanguageSwitcher/></div><main className="joinModal"><div className="joinCrown">♛</div><small>MR GREY'S CLUB</small><h1>Váš kľúč do sveta MR GREY'S.</h1><p className="joinLead">Vytvorte si účet. Po aktivácii sa vždy vrátite priamo do svojho Clubu.</p>
 <div className="joinPrice"><b>9,90 €</b><span>/ mesiac</span><em>zakladateľská cena</em></div>
 <div className="joinBenefits"><span>✓ automatická obnova každý mesiac</span><span>✓ zrušiť môžete kedykoľvek</span><span>✓ po aktivácii sa vrátite priamo do svojho Clubu</span></div>
 <form onSubmit={submit} className="joinForm">
  <label>MENO ALEBO PREZÝVKA<input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ako vás máme oslovovať?"/></label>
  <label>E-MAIL<input type="email" required value={form.email} onChange={e=>set('email',e.target.value)} placeholder="meno@email.sk"/></label>
  <label>VYTVORIŤ HESLO<input type="password" minLength="8" required value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Minimálne 8 znakov" autoComplete="new-password"/></label>
  <label>ZOPAKOVAŤ HESLO<input type="password" minLength="8" required value={form.password2} onChange={e=>set('password2',e.target.value)} placeholder="Zadajte heslo ešte raz" autoComplete="new-password"/></label>
  {form.password2&&<div className={`passwordMatch ${form.password===form.password2?'ok':'bad'}`}>{form.password===form.password2?'✓ Heslá sa zhodujú':'Heslá sa nezhodujú'}</div>}
  <label>DÁTUM NARODENIA<input type="date" value={form.dob} onChange={e=>set('dob',e.target.value)}/></label>
  <label className="joinCheck"><input type="checkbox" checked={form.adult} onChange={e=>set('adult',e.target.checked)}/><span>Potvrdzujem, že mám minimálne 18 rokov.</span></label>
  <label className="joinCheck"><input type="checkbox" checked={form.terms} onChange={e=>set('terms',e.target.checked)}/><span>Súhlasím s podmienkami členstva a pri bežnom členstve s opakovanou mesačnou platbou 9,90 €.</span></label>
  <label className="joinCheck"><input type="checkbox" checked={form.marketing} onChange={e=>set('marketing',e.target.checked)}/><span>Chcem dostávať vybrané novinky a inšpirácie. Voliteľné.</span></label>
  <button disabled={busy} className="joinPay" type="submit">{busy?'VYTVÁRAM ÚČET…':'VYTVORIŤ ÚČET A POKRAČOVAŤ →'}</button>
  {error&&<div className="joinError">{error}</div>}
 </form>
 <div className="joinLogin">Už máte účet? <a href="/login">PRIHLÁSIŤ SA →</a></div>
 <div className="joinSecure">🔒 Bezpečné prihlásenie · po platbe vás vrátime priamo do Clubu</div>
 </main></div>
}
