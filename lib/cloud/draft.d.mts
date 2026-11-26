export const LOCAL_KEY:string, LEGACY_KEY:string, MAX_BYTES:number;
export type CloudDraft={data:{couple:{first:string;second:string};[key:string]:unknown};slug:string;settings:Record<string,string>;uploads:Record<string,string>;mode:string;experience:{fonts:Record<string,string>;music:{track:string;volume:number;onOpen:boolean;upload:string;filename:string}}};
export function validateDraft(input:unknown):CloudDraft;
export function readLocal(storage:Storage):CloudDraft|null;
export function restoreLocal(storage:Storage,content:unknown):CloudDraft;
export function clearLocal(storage:Storage):void;
