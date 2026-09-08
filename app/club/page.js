import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {readClubToken,clubCookieName} from '../../lib/clubAuth'
import {isClubActiveToken} from '../../lib/memberAccess'
import ClubHeader from './ClubHeader'

const games=[
 {title:'Romantic Date Night',status:'ODOMKNUTÉ V CLUBE',href:'/play/date-night',img:'/card-play-clean.jpg',cta:'HRAŤ TERAZ →'},
 {title:'After Dark',status:'ČLENSKÁ CENA · PRIPRAVUJEME',href:'#',img:'/story-bar.jpg',cta:'ČOSKORO'},
 {title:'Secret Missions',status:'PRIPRAVUJEME',href:'#',img:'/story-elevator.jpg',cta:'ČOSKORO'}
]
const desire=[
 {icon:'❤️',title:'MY DVAJA',slug:'my-dvaja'},{icon:'💬',title:'BEZ FILTRA',slug:'bez-filtra'},{icon:'🔮',title:'NAŠA BUDÚCNOSŤ',slug:'nasa-buducnost'},{icon:'🔥',title:'INTIMITA',slug:'intimita'},{icon:'😈',title:'TAJNÉ TÚŽBY',slug:'tajne-tuzby'}
]
const storyCards=[
 {title:'Denník luxusnej spoločníčky — I. časť',img:'/story-sklamanie.jpg',href:'/club/stories/spolocnicka'},
 {title:'Víkend v Tatrách — I. časť',img:'/story-tatry-couple.jpg',href:'/club/stories/tatry'},
 {title:'Stretla som ho v kine — I. časť',img:'/story-theatre.jpg',href:'/club/stories/kino'}
]
export default function Club(){
 const member=readClubToken(cookies().get(clubCookieName)?.value)
 if(!member||!isClubActiveToken(member)) redirect('/club/join')
 const first=(member.name||'').trim().split(/\s+/)[0]
 return <div className="clubShell"><ClubHeader name={member.name||''} email={member.email||''}/>
 <section className="clubHero clubHeroBold" style={{backgroundImage:"linear-gradient(180deg,rgba(4,3,7,.08),rgba(4,3,7,.96) 88%),url('/club-hero-clean.jpg')"}}><div><div className="clubKicker">MEMBERS ONLY · ODOMKNUTÉ</div><h1>{first?`${first}, váš súkromný svet`:'Váš súkromný svet'}<br/><em>začína tu.</em></h1><p>Všetko, čo máte odomknuté, nájdete na jednom mieste.</p></div></section>
 <main className="clubMain" id="dashboard">
  <section className="clubDashboardIntro"><div><small>👑 MÔJ MR GREY'S</small><h2>Čo dnes chcete objaviť?</h2></div><div className="memberState"><b>✓ {member.fullAccess?'PLNÝ INTERNÝ PRÍSTUP':'AKTÍVNE ČLENSTVO'}</b><span>{member.fullAccess?`${String(member.role||'admin').toUpperCase()} · 100 % ODOMKNUTÉ`:'Founding Member · 9,90 €/mesiac'}</span></div></section>

  <section className="clubShelf"><div className="clubSectionHead"><div><small>🎮 MOJE HRY</small><h2>Hrajte to, čo máte odomknuté.</h2></div></div><div className="gameShelf">{games.map(g=><a key={g.title} className={`gameTile ${g.href==='#'?'isLocked':''}`} href={g.href}><div style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(4,3,7,.96)),url(${g.img})`}}/><span>{g.status}</span><h3>{g.title}</h3><i>{g.cta}</i></a>)}</div></section>

  <section className="clubShelf"><div className="clubSectionHead"><div><small>❤️ MOJE DESIRE</small><h2>Všetkých 5 hlbších testov patrí do Clubu.</h2></div><a href="/desire">SPUSTIŤ DESIRE →</a></div><div className="desireEntitlements">{desire.map(d=><a href={`/desire/deep/${d.slug}`} key={d.slug}><b>{d.icon} {d.title}</b><span>✓ ZAHRNUTÉ V CLUBE</span></a>)}</div><p className="partnerRule">Stačí členstvo jedného z vás. Partnera do spoločných Club DESIRE testov pozývate zdarma.</p><div className="desireClubChoices"><a href="/desire">⚡ VYBRAŤ TEST A OBJAVOVAŤ HNEĎ →</a><a href="/club/desire/journey">✨ SPUSTIŤ DESIRE JOURNEY →</a></div></section>

  <section className="clubNew"><div className="clubSectionHead"><div><small>✨ NOVÉ PRE VÁS</small><h2>Práve teraz v MR GREY'S.</h2></div></div><div className="clubNewGrid compactNew"><a className="clubMini" href="/play/date-night" style={{backgroundImage:"linear-gradient(180deg,rgba(4,3,7,.12),rgba(4,3,7,.95)),url('/card-play-clean.jpg')"}}><span>🎮 ODOMKNUTÁ HRA</span><h3>Date Night</h3><i>HRAŤ →</i></a><a className="clubMini" href="/desire" style={{backgroundImage:"linear-gradient(180deg,rgba(4,3,7,.12),rgba(4,3,7,.95)),url('/card-desire-clean.jpg')"}}><span>❤️ DESIRE</span><h3>Bezplatný test</h3><i>SPUSTIŤ →</i></a><a className="clubMini" href="/club/stories/spolocnicka" style={{backgroundImage:"linear-gradient(180deg,rgba(4,3,7,.12),rgba(4,3,7,.95)),url('/story-sklamanie.jpg')"}}><span>😈 NOVÁ STORY</span><h3>Denník spoločníčky</h3><i>ČÍTAŤ →</i></a><a className="clubMini" href="/club/stories/tatry" style={{backgroundImage:"linear-gradient(180deg,rgba(4,3,7,.12),rgba(4,3,7,.95)),url('/story-tatry-couple.jpg')"}}><span>🏔️ I. ČASŤ</span><h3>Víkend v Tatrách</h3><i>ČÍTAŤ →</i></a></div></section>

  <section className="clubStories"><div className="clubSectionHead"><div><small>🔥 STORIES</small><h2>Príbehy, ktoré pokračujú.</h2></div><a href="/club/stories">VŠETKY →</a></div><div className="clubStoryGrid">{storyCards.map(s=><a href={s.href} className="clubStoryCard" key={s.title}><div style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(4,3,7,.95)),url(${s.img})`}}/><h3>{s.title}</h3><span>ČÍTAŤ →</span></a>)}</div></section>

  <section className="clubBenefitGrid"><a className="voucherCard" href="https://mrgreysroom.sk" style={{backgroundImage:"linear-gradient(90deg,rgba(5,4,7,.97),rgba(5,4,7,.42)),url('/card-room-clean.jpg')"}}><span className="voucherTag">👑 ČLENSKÁ VÝHODA</span><strong>–20 %</strong><h3>na pobyt v MR GREY'S ROOM</h3><p>Váš aktuálny kód: <b>LETOKONCI</b><br/>Platnosť do 30. 9. 2026</p><i>REZERVOVAŤ POBYT →</i></a><a className="benefitCard" href="/academy"><small>🎓 ACADEMY</small><h3>Vzťahy, sex, psychológia a Bondage Basics.</h3><p>Práve pripravujeme prvé lekcie a kurzy.</p><span>POZRIEŤ, ČO CHYSTÁME →</span></a><a className="benefitCard" href="/club/desire/journey"><small>✨ DESIRE JOURNEY</small><h3>Postupná cesta pre vás dvoch.</h3><p>Prvý test dnes. Ďalšie po 3, 7, 10 a 14 dňoch od spustenia.</p><span>SPUSTIŤ JOURNEY →</span></a></section>

  <section className="clubMembership"><div><small>👑 MÔJ PRÍSTUP</small><h2>{member.fullAccess?String(member.role||'admin').toUpperCase():'Founding Member'}</h2><p>{member.fullAccess?'Interná rola · 100 % prístup ku Clubu, DESIRE, PLAY, Stories, Academy a benefitom bez Stripe platby.':'9,90 €/mesiac · automatická obnova · pri zrušení zostáva prístup do konca zaplateného obdobia.'}</p></div><span className="memberActive">✓ {member.fullAccess?'FULL ACCESS':'AKTÍVNE'}</span></section>
 </main></div>
}
