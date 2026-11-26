import {db} from '../../../lib/payment/server';
import {validSlug} from '../../../lib/payment/core.mjs';
import {renderInvitation} from '../../../lib/payment/render.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"sandbox allow-scripts allow-downloads; default-src 'none'; img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
export async function GET(_req:Request,{params}:{params:Promise<{slug:string}>}){
 try{const {slug}=await params;if(!validSlug(slug))return new Response('Undangan tidak tersedia.',{status:404,headers});const c=db();const {data,error}=await c.rpc('amplop_read_publication_v23',{p_slug:slug});if(error)throw Error('Read failed');if(!data)return new Response('Undangan tidak tersedia.',{status:404,headers});return new Response(await renderInvitation(data,{publicView:true,weddingId:slug}),{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});}catch{return new Response('Undangan belum dapat dimuat.',{status:503,headers});}
}
