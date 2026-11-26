import {db,serverKey,reconcile,reply,errorReply,smallJson,HttpError,type Order} from '../../../../lib/payment/server';
import {verifyNotification} from '../../../../lib/payment/core.mjs';
export const runtime='nodejs';
export async function POST(req:Request){try{const n=await smallJson(req,32768);if(!verifyNotification(n,serverKey()))throw new HttpError(401,'Invalid notification');const c=db();const {data,error}=await c.from('amplop_orders').select('id,wedding_id,amount,state,redirect_url').eq('id',n.order_id).maybeSingle();if(error)throw new HttpError(502,'Order lookup failed');if(!data)return reply({received:true});await reconcile(c,data as Order);return reply({received:true});}catch(e){return errorReply(e);}}
