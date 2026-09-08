import {NextResponse} from 'next/server'
import {clubCookieName} from '../../../../lib/clubAuth'
export async function POST(req){const res=NextResponse.json({ok:true});res.cookies.set(clubCookieName,'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});return res}
