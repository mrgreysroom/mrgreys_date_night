function cfg(){
  const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://siferzggaubvtjlqdckj.supabase.co')
  const key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY)
  if(!base||!key) throw new Error('Supabase server env missing')
  return {base,key}
}
function headers(extra={}){const {key}=cfg();return {apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...extra}}
export async function supabaseUpsert(table, rows, onConflict=''){
  const {base}=cfg(); const url=new URL(`${base}/rest/v1/${table}`)
  if(onConflict) url.searchParams.set('on_conflict',onConflict)
  const r=await fetch(url,{method:'POST',headers:headers({Prefer:'resolution=merge-duplicates,return=representation'}),body:JSON.stringify(rows),cache:'no-store'})
  if(!r.ok) throw new Error(`Supabase ${table}: ${await r.text()}`)
  return r.json()
}
export async function supabaseInsert(table, rows){
  const {base}=cfg(); const r=await fetch(`${base}/rest/v1/${table}`,{method:'POST',headers:headers({Prefer:'return=representation'}),body:JSON.stringify(rows),cache:'no-store'})
  if(!r.ok) throw new Error(`Supabase ${table}: ${await r.text()}`)
  return r.json()
}
export async function supabaseSelect(table, query=''){
  const {base}=cfg(); const r=await fetch(`${base}/rest/v1/${table}?${query}`,{headers:headers(),cache:'no-store'})
  if(!r.ok) throw new Error(`Supabase ${table}: ${await r.text()}`)
  return r.json()
}
export async function supabaseUpdate(table, query, patch){
  const {base}=cfg(); const r=await fetch(`${base}/rest/v1/${table}?${query}`,{method:'PATCH',headers:headers({Prefer:'return=representation'}),body:JSON.stringify(patch),cache:'no-store'})
  if(!r.ok) throw new Error(`Supabase ${table}: ${await r.text()}`)
  return r.json()
}
export async function supabaseDelete(table, query){
  const {base}=cfg(); const r=await fetch(`${base}/rest/v1/${table}?${query}`,{method:'DELETE',headers:headers({Prefer:'return=representation'}),cache:'no-store'})
  if(!r.ok) throw new Error(`Supabase ${table}: ${await r.text()}`)
  return r.json()
}
