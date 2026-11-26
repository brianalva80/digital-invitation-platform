import {createHash,timingSafeEqual} from 'node:crypto';
export const validId=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
export const validSlug=v=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]{2,62}[a-z0-9]$/.test(v);
export function configuredAmount(s){if(typeof s!=='string'||!/^\d{1,9}$/.test(s)||Number(s)<1||Number(s)>100000000)throw Error('Sandbox price not configured');return Number(s);}
export function validRedirect(v){if(typeof v!=='string')return false;try{const u=new URL(v);return u.origin==='https://app.sandbox.midtrans.com'&&!u.username&&!u.password&&u.pathname.startsWith('/snap/');}catch{return false;}}
export function verifyNotification(n,key){if(!key||!validId(n?.order_id)||typeof n.status_code!=='string'||typeof n.gross_amount!=='string'||typeof n.signature_key!=='string'||! /^[0-9a-f]{128}$/i.test(n.signature_key))return false;const expected=createHash('sha512').update(n.order_id+n.status_code+n.gross_amount+key).digest();return timingSafeEqual(expected,Buffer.from(n.signature_key,'hex'));}
export function classify(status,order){if(status?.order_id!==order.id||status.currency!=='IDR'||typeof status.gross_amount!=='string'||!/^\d{1,9}(?:\.00)?$/.test(status.gross_amount)||Number(status.gross_amount)!==order.amount)throw Error('Provider identity or amount mismatch');
 if(['refund','partial_refund','chargeback','partial_chargeback','cancel','deny','expire','failure'].includes(status.transaction_status)||status.fraud_status==='deny')return 'blocked';
 // Conservative sandbox rule: wait for settlement, not capture. Never trust browser result.
 if(status.transaction_status==='settlement'&&status.status_code==='200'&&(status.fraud_status===undefined||status.fraud_status==='accept'))return 'paid';
 return 'pending';}

// Missing/failed canonical status is indeterminate, never evidence of settlement or a safe retry.
export function providerResult(httpStatus, data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Provider response invalid');
 if(httpStatus===404||data.status_code==='404')throw Error('Provider status unavailable; reconciliation required');
 if(!Number.isInteger(httpStatus)||httpStatus<200||httpStatus>=300)throw Error('Provider request failed');
 return data;
}
