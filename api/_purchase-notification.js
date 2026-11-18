import nodemailer from "nodemailer";

const BASE="https://siferzggaubvtjlqdckj.supabase.co/rest/v1/date_night_purchase_notifications";
function headers(key,extra={}) {return {apikey:key,...(key.startsWith("sb_secret_")?{}:{Authorization:"Bearer "+key}),"Content-Type":"application/json",...extra};}
export async function notifyOwnerOfPurchase(session,email,product) {
  const key=process.env.SUPABASE_SECRET_KEY;
  const password=process.env.SMTP_PASSWORD;
  if(!key || !password) throw new Error("Purchase notification SMTP or database secret missing");
  const claim=await fetch(BASE+"?on_conflict=stripe_session_id",{method:"POST",headers:headers(key,{Prefer:"resolution=ignore-duplicates,return=representation"}),body:JSON.stringify({stripe_session_id:session.id,email,product_code:product,amount_minor:session.amount_total,currency:session.currency})});
  if(!claim.ok)throw new Error("Purchase notification claim failed: "+claim.status+" "+(await claim.text()).slice(0,250));
  const rows=await claim.json();
  if(!rows.length)return {alreadyProcessed:true};
  try {
    const transport=nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:"mrgreysroomsk@gmail.com",pass:password},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
    const amount=(Number(session.amount_total||0)/100).toFixed(2)+" "+String(session.currency||"eur").toUpperCase();
    await transport.sendMail({
      from:"MR GREY’S DATE NIGHT <mrgreysroomsk@gmail.com>",
      to:"mrgreysroomsk@gmail.com",
      subject:"DATE NIGHT | Nová platba | "+product.toUpperCase()+" | "+amount,
      text:["Nová úspešná platba – MR GREY’S DATE NIGHT","","Produkt: "+product.toUpperCase(),"Suma: "+amount,"Zákazník: "+email,"Objednávka: "+session.id,"Čas: "+new Date((session.created||Math.floor(Date.now()/1000))*1000).toISOString(),"Stav: zaplatené"].join("\n")
    });
    const mark=await fetch(BASE+"?stripe_session_id=eq."+encodeURIComponent(session.id),{method:"PATCH",headers:headers(key),body:JSON.stringify({sent_at:new Date().toISOString()})});
    if(!mark.ok)console.error("Owner notification sent but marking failed",mark.status);
    return {sent:true};
  }catch(error){
    const cleanup=await fetch(BASE+"?stripe_session_id=eq."+encodeURIComponent(session.id)+"&sent_at=is.null",{method:"DELETE",headers:headers(key)}).catch(()=>null);
    if(!cleanup?.ok)console.error("Purchase notification claim cleanup failed");
    throw error;
  }
}
