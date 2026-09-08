"use client"
import {useEffect,useRef,useState} from 'react'
import LanguageSwitcher from '../../components/LanguageSwitcher'
function Bell(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>}
export default function ClubHeader({name,email}){
 const [open,setOpen]=useState(null),[items,setItems]=useState([]),[unread,setUnread]=useState(0); const ref=useRef(null)
 const first=(name||email||'M').trim()[0]?.toUpperCase()||'M'
 async function load(){try{const r=await fetch('/api/account/notifications',{cache:'no-store'});if(r.ok){const d=await r.json();setItems(d.items||[]);setUnread(d.unread||0)}}catch{}}
 useEffect(()=>{load();const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(null)};document.addEventListener('pointerdown',fn);return()=>document.removeEventListener('pointerdown',fn)},[])
 async function openBell(){const n=open==='bell'?null:'bell';setOpen(n);if(n==='bell'){await load()}}
 async function mark(item){if(!item.is_read){await fetch('/api/account/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id})});setUnread(x=>Math.max(0,x-1))}if(item.href)location.href=item.href}
 return <header className="clubTop" ref={ref}><a className="clubBrand" href="/">MR GREY'S <span>CLUB</span></a><div className="clubTools"><LanguageSwitcher/>
  <div className="toolWrap"><button className="clubBell" aria-label="Notifikácie" onClick={openBell}><Bell/>{unread>0&&<i>{unread>9?'9+':unread}</i>}</button>{open==='bell'&&<div className="toolPopover notifPopover"><div className="popoverHead"><b>🔔 NOTIFIKÁCIE</b>{unread>0&&<button onClick={async()=>{await fetch('/api/account/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({all:true})});setUnread(0);setItems(v=>v.map(x=>({...x,is_read:true})))}}>Označiť všetko</button>}</div>{items.length===0?<p className="emptyPop">Zatiaľ tu nemáte nové upozornenia.</p>:items.map(x=><button key={x.id} className={'notifItem '+(!x.is_read?'unread':'')} onClick={()=>mark(x)}><span>{x.kind==='story'?'😈':x.kind==='desire'?'❤️':'✨'}</span><div><b>{x.title}</b>{x.body&&<small>{x.body}</small>}</div></button>)}</div>}</div>
  <div className="toolWrap"><button className="clubAvatar" aria-label="Môj účet" onClick={()=>setOpen(open==='profile'?null:'profile')}>{first}</button>{open==='profile'&&<div className="toolPopover profilePopover"><small>MÔJ MR GREY'S</small><b>{name||'Môj účet'}</b><span>{email}</span><a href="/club/account">👤 MÔJ ÚČET A NASTAVENIA</a><a href="/club/account#follow">🔔 MOJE UPOZORNENIA</a><form action="/api/auth/logout" method="post"><button>ODHLÁSIŤ SA →</button></form></div>}</div>
 </div></header>
}
