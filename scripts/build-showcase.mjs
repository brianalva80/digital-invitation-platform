// Build standalone invitation previews using the immutable V14 engine, not a second renderer.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const root = new URL('../', import.meta.url);
const ref = new URL('reference/v16/reference/v14/',root);
const read = async p => readFile(new URL(p,ref),'utf8');
const registry = JSON.parse(await read('registry.json'));
const data = JSON.parse(await read('invitation.json'));
const bundle = { templates:{}, assets:{}, shared:await read('shared.js'), audioRuntime:await read('audio-runtime.js') };
const v26Runtime=await readFile(new URL('../admin-studio/interaction-runtime.js',import.meta.url),'utf8');
for(const [key,entry] of Object.entries(registry)) bundle.templates[key]=await read(entry.file);
const types={webp:'image/webp',svg:'image/svg+xml',mp3:'audio/mpeg'};
for(const file of await readdir(new URL('assets/',ref))){const mime=types[file.split('.').pop()];if(mime)bundle.assets[file]='data:'+mime+';base64,'+(await readFile(new URL('assets/'+file,ref))).toString('base64');}
const engine=runInNewContext((await read('typography.js'))+'\n'+(await read('engine.js'))+'\nEngine;', {atob,btoa,TextEncoder,TextDecoder});
const out=new URL('public/demo/templates/',root);await mkdir(out,{recursive:true});
for(const key of Object.keys(registry)){
  const html=engine.render({...bundle,audioRuntime:`window.AMPLOP_STORY_COUNT=${data.story.length};${v26Runtime}`},data,key,{}, {}, {music:{track:'none',onOpen:false}}).replace('<audio id="amplop-audio" preload="none"','<audio id="amplop-audio" preload="auto"');
 // Keep a visible demo notice outside signature animation; no modifications to reference files.
 const note='<style>.amplop-demo-label{position:fixed;top:4px;left:4px;z-index:2147483647;background:#fff9ed;color:#392d29;padding:2px 5px;font:10px/1.4 system-ui,sans-serif;pointer-events:none}</style><div class="amplop-demo-label">DEMO · RSVP lokal</div>';
 await writeFile(new URL(key+'.html',out),html.replace('</body>',()=>note+'</body>'));
 console.log('Preview:',key);
}
