import {owner,smallJson,HttpError,reply,errorReply} from '../../../lib/payment/server';
import {config,eventAction} from '../../../lib/event/server';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:Request){try{const {c,actor,wid}=await owner(req);const b=await smallJson(req,4096);if(!b||typeof b!=='object'||Array.isArray(b))throw new HttpError(400,'Permintaan tidak valid.');return reply(['settings','pin','public','staff','revoke'].includes(b.action)?await config(c,actor,wid,b):await eventAction(c,actor,wid,null,b));}catch(e){return errorReply(e);}}
