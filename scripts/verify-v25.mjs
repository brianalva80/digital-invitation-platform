// Source-only verification, never deploys or accesses external services.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));process.chdir(root);
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(p+'/'+x.name):[p+'/'+x.name]);
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const generated=['public/demo/studio-v14.html','public/dashboard/bundle-v14.js','public/dashboard/engine-v14.js','lib/cloud/v14-engine.mjs',...walk('public/demo/templates')];
const before=new Map(generated.map(f=>[f,hash(f)]));
execFileSync('npm',['run','prepare:demo'],{stdio:'inherit'});
for(const [f,h] of before)if(hash(f)!==h)throw Error('Generated output changed: '+f);
console.log(`Deterministic regeneration: ${generated.length}/${generated.length}`);
const require=createRequire(import.meta.url);let ts;try{ts=require('typescript')}catch{ts=require(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'));}
const typed=[...walk('app'),...walk('lib'),'next.config.ts'].filter(f=>/\.tsx?$/.test(f));
for(const f of typed){const d=ts.transpileModule(readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true}).diagnostics??[];if(d.some(x=>x.category===ts.DiagnosticCategory.Error))throw Error(f+': '+d.map(x=>ts.flattenDiagnosticMessageText(x.messageText,' ')).join('; '));}
console.log(`TypeScript syntax (not semantic checking): ${typed.length}/${typed.length}`);
const js=[...walk('app'),...walk('lib'),...walk('scripts'),...walk('tests'),...walk('public/dashboard')].filter(f=>/\.(mjs|js)$/.test(f));
for(const f of js)execFileSync(process.execPath,['--check',f]);
console.log(`JS syntax: ${js.length}/${js.length}`);
for(const f of readdirSync('.'))if(f.startsWith('.env')&&f!=='.env.example')throw Error('Local environment file present; do not package credentials: '+f);
console.log('Source-only verification passed; build, semantic typecheck, SQL and real HTTP remain separate gates.');
