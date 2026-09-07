import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {readClubToken,clubCookieName} from '../../../lib/clubAuth'
import {isClubActiveToken} from '../../../lib/memberAccess'

export default function Page(){
 const m=readClubToken(cookies().get(clubCookieName)?.value)
 if(!m?.email)redirect('/login')
 if(!isClubActiveToken(m))redirect('/club/join')

 const internal=Boolean(m.fullAccess)&&['owner','admin'].includes(String(m.role||'').toLowerCase())

 return <main className="deepShell">
  <div className="deepStart">
   <div className="deepIcon">🎮</div>
   <small>MR GREY'S PLAY</small>
   <h1>{internal?'Celá Date Night je odomknutá.':'ROMANTIC je odomknutý.'}</h1>
   <p>
    {internal
     ?'OWNER / ADMIN má interný prístup ku všetkým balíkom: ROMANTIC, SECRETS, DARE, AFTER DARK aj X COMPLETE bez platby.'
     :'Aktívne členstvo MR GREY\\'S CLUB zahŕňa balík ROMANTIC. Ostatné balíky zostávajú samostatne platené.'}
   </p>
   <a className="deepPrimary deepLink" href="/api/play/date-night-link">
    {internal?'OTVORIŤ CELÚ DATE NIGHT →':'HRAŤ ROMANTIC →'}
   </a>
   <span className="deepPrivacy">🔐 Otvorí sa priamo bez ďalšieho prihlasovania a bez overovacieho e-mailu.</span>
  </div>
 </main>
}
