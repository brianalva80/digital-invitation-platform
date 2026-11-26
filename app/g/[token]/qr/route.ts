import QRCode from 'qrcode';
import {getGuest,privateHeaders} from '../../../../lib/guests/server';
import {qrPayload} from '../../../../lib/event/core.mjs';
import {HttpError} from '../../../../lib/payment/server';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{token:string}>}){try{const {token}=await params;const {guest}=await getGuest(req,token);const png=await QRCode.toBuffer(qrPayload(guest.check_code),{type:'png',errorCorrectionLevel:'M',width:320,margin:4});return new Response(new Uint8Array(png),{headers:{...privateHeaders,'Content-Type':'image/png'}});}catch(e){return new Response('QR tidak tersedia.',{status:e instanceof HttpError?e.status:503,headers:privateHeaders});}}
