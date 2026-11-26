import {owner,getOrder,getDraft,checkout,reconcile,reply,errorReply,smallJson,HttpError,serverKey,type Order} from '../../../lib/payment/server';
import {configuredAmount,validSlug,validRedirect} from '../../../lib/payment/core.mjs';
import {renderInvitation} from '../../../lib/payment/render.mjs';
import {validateDraft} from '../../../lib/cloud/draft.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const {c,actor,wid}=await owner(req);const body=await smallJson(req);if(!body||typeof body!=='object'||Array.isArray(body))throw new HttpError(400,'Permintaan tidak valid.');
 if(body.action==='preview'){const d=await getDraft(c,wid);return reply({html:await renderInvitation(d.content),revision:d.revision});}
 if(body.action==='status'){
  const o=await getOrder(c,wid);const {data:p,error}=await c.from('amplop_publications').select('slug,active_revision').eq('wedding_id',wid).maybeSingle();if(error)throw new HttpError(502,'Publikasi belum dapat dimuat.');
  let amount:number|null=null;try{amount=configuredAmount(process.env.AMPLOP_SANDBOX_PRICE_IDR);}catch{}
  return reply({state:o?.state??'none',amount:o?.amount??amount,redirect:o&&['pending','creating'].includes(o.state)&&validRedirect(o.redirect_url)?o.redirect_url:null,publication:p?{slug:p.slug,revision:p.active_revision,active:o?.state==='paid'}:null});
 }
 if(body.action==='checkout'){
  serverKey();const d=await getDraft(c,wid);validateDraft(d.content);const amount=configuredAmount(process.env.AMPLOP_SANDBOX_PRICE_IDR);
  // The browser must explicitly accept the currently displayed amount; server remains authority.
  const existing=await getOrder(c,wid);if(body.amount!==(existing?.amount??amount))throw new HttpError(409,'Harga berubah. Muat ulang status dan konfirmasi kembali.');
  const {data,error}=await c.rpc('amplop_claim_checkout',{p_actor:actor,p_wedding:wid,p_amount:amount});if(error||!data?.order)throw new HttpError(409,'Checkout belum tersedia.');const o=data.order as Order;
  if(o.amount!==body.amount)throw new HttpError(409,'Harga order berubah. Muat ulang status.');
  if(data.claimed===true)return reply({redirect:await checkout(c,o)});
  if(o.state==='pending'&&validRedirect(o.redirect_url))return reply({redirect:o.redirect_url});
  return reply({state:o.state});
 }
 if(body.action==='reconcile'){const o=await getOrder(c,wid);if(!o)throw new HttpError(409,'Belum ada order.');return reply({state:await reconcile(c,o)});}
 if(body.action==='publish'){
  if(!validSlug(body.slug)||!Number.isSafeInteger(body.revision)||body.revision<1)throw new HttpError(400,'Slug atau revisi tidak valid.');
  const d=await getDraft(c,wid);if(d.revision!==body.revision)throw new HttpError(409,'Draft berubah. Preview ulang sebelum publikasi.');
  // Validate and render before committing; database compares original JSON and revision atomically.
  await renderInvitation(d.content,{publicView:true,weddingId:wid});
  const {data,error}=await c.rpc('amplop_publish',{p_actor:actor,p_wedding:wid,p_revision:d.revision,p_slug:body.slug,p_content:d.content});
  if(error)throw new HttpError(409,'Publikasi ditolak. Periksa pembayaran, slug, atau revisi draft.');return reply({slug:body.slug,revision:data});
 }
 throw new HttpError(400,'Aksi tidak dikenal.');
}catch(e){return errorReply(e);}}
