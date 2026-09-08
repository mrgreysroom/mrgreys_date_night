import PartnerClient from './PartnerClient'
export default function Page({searchParams}){return <main className="deepShell"><PartnerClient token={String(searchParams.token||'')}/></main>}
