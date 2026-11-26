import {getGuest,privateHeaders} from '../../../../lib/guests/server';
import {HttpError} from '../../../../lib/payment/server';
import {renderInvitation} from '../../../../lib/payment/render.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={...privateHeaders,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"sandbox allow-scripts allow-downloads; default-src 'none'; img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'"};
export async function GET(req:Request,{params}:{params:Promise<{token:string}>}){try{const {token}=await params;const {guest:g}=await getGuest(req,token);return new Response(await renderInvitation(g.content,{publicView:true,weddingId:g.slug,guest:{id:g.id,name:g.name}}),{headers});}catch(e){return new Response('Undangan tidak tersedia.',{status:e instanceof HttpError?e.status:503,headers});}}
