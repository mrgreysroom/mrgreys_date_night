"use client"
import {usePathname} from 'next/navigation'
const langs=[['sk','SK'],['cs','CZ'],['pl','PL'],['en','EN']]
export default function LanguageSwitcher(){
 const pathname=usePathname()||'/'
 const m=pathname.match(/^\/(sk|cs|pl|en)(?=\/|$)/); const current=m?m[1]:'sk'; const bare=m?(pathname.replace(/^\/(sk|cs|pl|en)/,'')||'/'):pathname
 function href(lang){return lang==='sk'?bare:`/${lang}${bare==='/'?'':bare}`}
 function choose(e,lang){e.preventDefault();document.cookie=`mrgreys_lang=${lang}; path=/; max-age=31536000; samesite=lax`;window.location.assign(href(lang))}
 return <div className="langSwitch" aria-label="Jazyk">{langs.map(([k,label])=><a key={k} className={current===k?'active':''} href={href(k)} onClick={e=>choose(e,k)}>{label}</a>)}</div>
}
