import {owner,smallJson,HttpError,reply,errorReply} from '../../../lib/payment/server';
import {emptyPlan,validatePlan} from '../../../lib/planning/core.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const {c,actor,wid}=await owner(req);const b=await smallJson(req,1200000);
 if(!b||typeof b!=='object'||Array.isArray(b)||!['load','save'].includes(b.action))throw new HttpError(400,'Permintaan tidak valid.');
 let content=null,expected=null;
 if(b.action==='save'){if(!Number.isInteger(b.revision)||b.revision<0||b.revision>=2147483647)throw new HttpError(400,'Revisi tidak valid.');expected=b.revision;try{content=validatePlan(b.content);}catch(e){throw new HttpError(400,e instanceof Error?e.message:'Rencana tidak valid.');}}
 const {data,error}=await c.rpc('amplop_plan',{p_actor:actor,p_wedding:wid,p_action:b.action,p_expected:expected,p_content:content});
 if(error){if(error.code==='40001')throw new HttpError(409,'Rencana berubah di sesi lain. Salin atau ekspor perubahan lokal sebelum memuat ulang.');throw new HttpError(502,'Rencana belum dapat diproses.');}
 if(!data||!Number.isInteger(data.revision)||data.revision<0||(data.revision===0?data.content!==null:data.content===null))throw new HttpError(502,'Respons rencana tidak valid.');
 return reply({revision:data.revision,content:data.revision===0?emptyPlan():validatePlan(data.content)});
}catch(e){return errorReply(e);}}
