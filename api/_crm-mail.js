export async function sendCrmMail(body){
 const secret=process.env.DATE_NIGHT_BRIDGE_SECRET
 if(!secret)throw new Error('DATE NIGHT email integration is not configured')
 const r=await fetch('https://www.mrgrey.sk/api/internal/date-night-email',{method:'POST',headers:{'Content-Type':'application/json','x-date-night-secret':secret},body:JSON.stringify(body)})
 if(!r.ok)throw new Error('DATE NIGHT email delivery failed ('+r.status+')')
 return r.json()
}
