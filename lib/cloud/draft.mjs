import {Engine,Typography} from './v14-engine.mjs';
export const LOCAL_KEY='amplop:studio:v12:draft', LEGACY_KEY='amplop:studio:v11:draft';
export const MAX_BYTES=4100000;
const fail=()=>{throw Error('Format draft tidak didukung. Periksa dan simpan ulang di Studio.');};
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const keys=(v,allowed)=>{if(!object(v)||Object.keys(v).some(k=>!allowed.includes(k)))fail();};
const slots=['portrait','walk','window'], templates=Object.keys(Engine.variants);
const media=(v,re,max)=>typeof v==='string'&&v.length<=max&&re.test(v);
// Accept V14 save shape, not arbitrary HTML, URLs or executable content. Engine validates schedule and fields.
export function validateDraft(input){
 if(!object(input))fail();
 const raw=JSON.stringify(input);if(new TextEncoder().encode(raw).length>MAX_BYTES)throw Error('Draft melebihi batas teknis V20. Kurangi ukuran foto atau musik.');
 const x=JSON.parse(raw);
 keys(x,['data','slug','settings','uploads','mode','experience']);if(!templates.includes(x.slug))fail();
 const d=x.data;keys(d,['schemaVersion','id','couple','guest','city','country','timezone','events','story','photos']);
 keys(d.couple,['first','second']);keys(d.guest,['id','name']);keys(d.events,['ceremony','reception']);for(const e of Object.values(d.events))keys(e,['title','start','end','venue','location']);
 if(!Array.isArray(d.story))fail();for(const row of d.story)keys(row,['year','text','note']);keys(d.photos,slots);Engine.validate(d);
 x.settings??={};x.uploads??={};x.mode??='mobile';x.experience??={fonts:{},music:{track:'none',volume:.35,onOpen:false,upload:'',filename:''}};
 keys(x.settings,templates);for(const [slug,color] of Object.entries(x.settings))if(!Engine.variants[slug].includes(color))fail();
 keys(x.uploads,slots);for(const v of Object.values(x.uploads))if(!media(v,/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/,400000))fail();
 if(!['mobile','desktop'].includes(x.mode))fail();
 keys(x.experience,['fonts','music']);keys(x.experience.fonts,templates);for(const [slug,font] of Object.entries(x.experience.fonts))if(!Typography.options[slug].includes(font))fail();
 const m=x.experience.music;keys(m,['track','volume','onOpen','upload','filename']);
 if(!['none','golden-hour','garden-waltz','ivory-nocturne','custom'].includes(m.track)||!Number.isFinite(m.volume)||m.volume<0||m.volume>1||typeof m.onOpen!=='boolean'||typeof m.filename!=='string'||m.filename.length>255||typeof m.upload!=='string')fail();
 if(m.upload!==''&&!media(m.upload,/^data:audio\/(?:mpeg|wav|ogg|mp4);base64,[A-Za-z0-9+/]+={0,2}$/,2800000))fail();if(m.track==='custom'&&!m.upload)fail();
 return x;
}
export function readLocal(storage){const raw=storage.getItem(LOCAL_KEY)??storage.getItem(LEGACY_KEY);return raw===null?null:validateDraft(JSON.parse(raw));}
export function restoreLocal(storage,content){const validated=validateDraft(content);storage.setItem(LOCAL_KEY,JSON.stringify(validated));return validated;}
export function clearLocal(storage){storage.removeItem(LOCAL_KEY);storage.removeItem(LEGACY_KEY);}
