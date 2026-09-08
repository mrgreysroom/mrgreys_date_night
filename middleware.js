import {NextResponse} from 'next/server'
const supported=['sk','cs','pl','en']
export function middleware(req){
 const {pathname}=req.nextUrl
 if(pathname.startsWith('/api/')||pathname.startsWith('/_next/')||pathname.includes('.')) return NextResponse.next()
 const parts=pathname.split('/').filter(Boolean); const prefix=parts[0]
 if(supported.includes(prefix)){
   const url=req.nextUrl.clone(); url.pathname='/' + parts.slice(1).join('/'); if(url.pathname==='/'||url.pathname==='') url.pathname='/'
   const headers=new Headers(req.headers); headers.set('x-mrgreys-lang',prefix)
   const res=NextResponse.rewrite(url,{request:{headers}}); res.cookies.set('mrgreys_lang',prefix,{path:'/',maxAge:31536000,sameSite:'lax'}); return res
 }
 const saved=req.cookies.get('mrgreys_lang')?.value
 if(saved&&supported.includes(saved)&&saved!=='sk'){
   const url=req.nextUrl.clone(); url.pathname=`/${saved}${pathname==='/'?'':pathname}`; return NextResponse.redirect(url)
 }
 const headers=new Headers(req.headers); headers.set('x-mrgreys-lang','sk'); return NextResponse.next({request:{headers}})
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']}
