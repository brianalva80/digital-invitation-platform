// Review-only static snapshot of the presentational JSX, using installed TypeScript.
// Does not substitute for React SSR, Next build, or semantic type checking.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'))}
const root=path.resolve(new URL('..',import.meta.url).pathname);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const html=v=>v==null||v===false||v===true?'':Array.isArray(v)?v.map(html).join(''):typeof v==='object'&&v.raw!==undefined?v.raw:esc(v);
const voids=new Set(['img','meta','link','br','input','hr']);
const jsx=(tag,props)=>{if(typeof tag==='function')return tag(props);const attrs=Object.entries(props).filter(([k,v])=>k!=='children'&&k!=='key'&&v!=null&&v!==false).map(([k,v])=>` ${k==='className'?'class':k.toLowerCase()}${v===true?'':`="${esc(v)}"`}`).join('');return {raw:`<${tag}${attrs}>${voids.has(tag)?'':html(props.children)+`</${tag}>`}`}};
const cache=new Map();
function load(file){if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const src=fs.readFileSync(file,'utf8');const r=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},reportDiagnostics:true});const errors=r.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error);if(errors.length)throw Error(ts.formatDiagnosticsWithColorAndContext(errors,{getCanonicalFileName:x=>x,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));const m={exports:{}};cache.set(file,m.exports);const req=id=>{if(id==='react/jsx-runtime')return {jsx,jsxs:jsx};const p=path.resolve(path.dirname(file),id);for(const f of [p,p+'.ts',p+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);throw Error('Unsupported import '+id)};new Function('require','module','exports',r.outputText)(req,m,m.exports);return m.exports;}
const {Landing}=load(path.join(root,'app/components/landing.tsx'));
let body=html(Landing({base:'.',studioHref:'./dashboard.html'}));
body=body.replace(/src="\.\/showcase\/([^"/]+)"/g,(_,f)=>`src="data:image/webp;base64,${fs.readFileSync(path.join(root,'public/showcase',f)).toString('base64')}"`);
const css=['app/globals.css','app/landing.css'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
fs.writeFileSync(path.join(root,'public/landing-preview.html'),`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>AMPLOP — Landing Review V18</title><style>${css}</style></head><body>${body}</body></html>`);
console.log('Static review snapshot generated from landing JSX.');
