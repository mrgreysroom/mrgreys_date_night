import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {readClubToken,clubCookieName} from '../../../lib/clubAuth'
import {isClubActiveToken} from '../../../lib/memberAccess'
export default function Page(){const m=readClubToken(cookies().get(clubCookieName)?.value);if(!m?.email)redirect('/login');if(!isClubActiveToken(m))redirect('/club/join');return <main className="deepShell"><div className="deepStart"><div className="deepIcon">🎮</div><small>MR GREY'S PLAY</small><h1>Date Night je odomknutý.</h1><p>Prepojíme váš MR GREY'S účet s hernou verziou a otvoríme plnú hru bez ďalšieho nákupu.</p><a className="deepPrimary deepLink" href="/api/play/date-night-link">HRAŤ DATE NIGHT →</a><span className="deepPrivacy">🔐 Pri prvom otvorení vytvoríme bezpečný jednorazový prihlasovací prechod na hernú doménu.</span></div></main>}
