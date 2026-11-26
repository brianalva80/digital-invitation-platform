import {db,smallJson,HttpError,reply,errorReply} from '../../../../lib/payment/server';
import {eventAction} from '../../../../lib/event/server';
import {validToken} from '../../../../lib/guests/core.mjs';
import {digest} from '../../../../lib/event/core.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:Request){try{const token=req.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!validToken(token))throw new HttpError(401,'Kode petugas diperlukan.');const b=await smallJson(req,4096);if(!b||typeof b!=='object'||Array.isArray(b))throw new HttpError(400,'Permintaan tidak valid.');return reply(await eventAction(db(),null,null,digest(token),b));}catch(e){return errorReply(e);}}
