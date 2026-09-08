import {supabaseSelect} from './supabaseAdmin'

export function isClubActiveToken(member){
  if(!member) return false
  if(member.fullAccess) return true
  if(member.clubActive===true) return true
  if(member.tier==='founding' && !member.accountOnly) return true
  return false
}
export async function hasProductEntitlement(email,productKey){
  const e=String(email||'').trim().toLowerCase(); if(!e) return false
  try{
    const rows=await supabaseSelect('product_entitlements',`member_email=eq.${encodeURIComponent(e)}&product_key=eq.${encodeURIComponent(productKey)}&is_active=eq.true&select=id&limit=1`)
    return Array.isArray(rows)&&rows.length>0
  }catch{return false}
}
export async function canUseDeepTest(member,slug){
  if(isClubActiveToken(member)) return true
  return (await hasProductEntitlement(member?.email,'desire_bundle')) || (await hasProductEntitlement(member?.email,`desire_${slug}`))
}
