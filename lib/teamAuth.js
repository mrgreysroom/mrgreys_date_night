import {supabaseSelect} from './supabaseAdmin'

export async function getTeamRoleByEmail(email){
  const normalized=String(email||'').trim().toLowerCase()
  if(!normalized) return null
  try{
    const rows=await supabaseSelect('team_access',`email=eq.${encodeURIComponent(normalized)}&select=email,role,is_active&limit=1`)
    const row=Array.isArray(rows)?rows[0]:null
    if(!row||!row.is_active) return null
    return row.role||null
  }catch{return null}
}

export function isFullAccessRole(role){return ['owner','admin'].includes(String(role||'').toLowerCase())}
