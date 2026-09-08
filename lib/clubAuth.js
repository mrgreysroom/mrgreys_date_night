import crypto from 'crypto'

const COOKIE='mrgreys_club'
function secret(){return process.env.CLUB_SESSION_SECRET||process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||''}
function b64url(s){return Buffer.from(s).toString('base64url')}
function unb64(s){return Buffer.from(s,'base64url').toString('utf8')}
function sig(payload){return crypto.createHmac('sha256',secret()).update(payload).digest('base64url')}
export function makeClubToken(data){
  if(!secret()) throw new Error('CLUB_SESSION_SECRET missing')
  const payload=b64url(JSON.stringify(data))
  return `${payload}.${sig(payload)}`
}
export function readClubToken(raw){
  try{
    if(!raw||!secret()) return null
    const [payload,signature]=raw.split('.')
    const a=Buffer.from(sig(payload)); const b=Buffer.from(signature||'')
    if(a.length!==b.length||!crypto.timingSafeEqual(a,b)) return null
    const data=JSON.parse(unb64(payload))
    if(!data.exp||Date.now()/1000>data.exp) return null
    return data
  }catch{return null}
}
export const clubCookieName=COOKIE
