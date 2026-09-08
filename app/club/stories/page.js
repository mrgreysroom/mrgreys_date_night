const stories=[
 ['spolocnicka','Denník luxusnej spoločníčky — I. časť','Z malej dediny do Bratislavy. Prvý klient, prvý hotel, prvé pravidlá.','/story-sklamanie.jpg'],
 ['tatry','Víkend v Tatrách — I. časť','Žena, muž a víkend, ktorý znovu zapálil iskru.','/story-tatry-couple.jpg'],
 ['kino','Stretla som ho v kine — I. časť','Jeden pohľad počas filmu a večer dostal úplne iný scenár.','/story-theatre.jpg'],
 ['vytah','Výťah, ktorý všetko zmenil','Napätie, ktoré sa už nedalo ignorovať.','/story-elevator.jpg'],
 ['bar','Neznámy v bare','Keď sa fantázia stretne s realitou.','/story-bar.jpg']
]
export default function Stories(){return <div className="storiesPage"><header className="clubTop"><a className="clubBrand" href="/">MR GREY'S <span>STORIES</span></a><a href="/club/join">👑 CLUB</a></header><main><div className="storiesIntro"><small>MR GREY'S STORIES · 18+</small><h1>Príbehy, ktoré sa čítajú<br/>najlepšie po zotmení.</h1><p>Každý príbeh vám dovolíme ochutnať. Celé, dlhé kapitoly a pokračovania patria členom MR GREY'S CLUB.</p></div><div className="storiesLibrary">{stories.map(s=><a href={`/club/stories/${s[0]}`} className="libraryStory" key={s[0]}><div style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(4,3,7,.95)),url(${s[3]})`}}/><h2>{s[1]}</h2><p>{s[2]}</p><span>OCHUTNAŤ PRÍBEH →</span></a>)}</div></main></div>}
