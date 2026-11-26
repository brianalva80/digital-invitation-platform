export function validId(v:unknown):v is string;
export function validSlug(v:unknown):v is string;
export function configuredAmount(s:unknown):number;
export function validRedirect(v:unknown):v is string;
export function verifyNotification(n:unknown,key:string):boolean;
export function classify(status:unknown,order:{id:string;amount:number}):'paid'|'blocked'|'pending';
export function providerResult<T>(httpStatus:number,data:T):T;
