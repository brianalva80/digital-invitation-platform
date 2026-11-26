import {owner,smallJson,HttpError,reply,errorReply} from '../../../lib/payment/server';
import {validId} from '../../../lib/payment/core.mjs';
import {guestInput,parseGuestsCSV} from '../../../lib/guests/core.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const {c,actor,wid}=await owner(req);const b=await smallJson(req,120000);if(!b||typeof b!=='object'||Array.isArray(b))throw new HttpError(400,'Permintaan tidak valid.');
 let rows:unknown=null,id:string|null=null,action=b.action;
 try{if(action==='add')rows=[guestInput(b.guest)];else if(action==='import'){rows=parseGuestsCSV(b.csv);action='add';}else if(['edit','delete','rotate'].includes(action)){if(!validId(b.id))throw Error('ID tidak valid.');id=b.id;if(action==='edit')rows=guestInput(b.guest);}else if(action!=='list')throw Error('Aksi tidak dikenal.');}catch(e){throw new HttpError(400,e instanceof Error?e.message:'Data tidak valid.');}
 const {data,error}=await c.rpc('amplop_manage_guests',{p_actor:actor,p_wedding:wid,p_action:action,p_rows:rows,p_id:id});if(error||!Array.isArray(data))throw new HttpError(409,'Daftar tamu belum dapat diubah. Periksa batas tamu, kapasitas RSVP, dan workspace.');return reply({guests:data});
}catch(e){return errorReply(e);}}
