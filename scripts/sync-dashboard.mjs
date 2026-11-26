// Reuse the exact immutable renderer, no new implementation of invitation validation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),ref=new URL('reference/v16/reference/v14/',root),out=new URL('public/dashboard/',root);
await mkdir(out,{recursive:true});
await writeFile(new URL('engine-v14.js',out),(await readFile(new URL('typography.js',ref),'utf8'))+'\n'+(await readFile(new URL('engine.js',ref),'utf8'))+'\n');
// Extract the exact trusted JSON payload from the preserved Studio HTML for offline review.
const studio=await readFile(new URL('amplop-studio-v14.html',ref),'utf8');
const raw=studio.match(/<script[^>]*id="bundle"[^>]*>([\s\S]*?)<\/script>/)?.[1];
if(!raw)throw Error('V14 bundle missing');
JSON.parse(raw);
await writeFile(new URL('bundle-v14.js',out),'const AMPlOP_V14_BUNDLE = '+raw+';\n');
