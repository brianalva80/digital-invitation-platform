import {HttpError} from '../payment/server';
import {guestAccess} from '../event/server';
export async function getGuest(req:Request,token:string){const {c,key}=await guestAccess(req,token);const {data,error}=await c.rpc('amplop_read_guest_v23',{p_token:token,p_key:key});if(error)throw new HttpError(503,'Undangan belum dapat dimuat.');if(!data)throw new HttpError(404,'Undangan tidak tersedia.');return {c,guest:data,key};}
export const privateHeaders={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
