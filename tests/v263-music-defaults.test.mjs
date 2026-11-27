import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
const read = name => readFile(new URL('../'+name, import.meta.url),'utf8');
const engine=Function(await read('admin-studio/engine-v14.js')+'\nreturn Engine;')();
const bundle=Function(await read('admin-studio/bundle-v14.js')+'\nreturn AMPlOP_V14_BUNDLE;')();
const runtime=await read('admin-studio/interaction-runtime.js');
for(const slug of Object.keys(bundle.templates)) {
 test(`No music: no audio controls or empty source (${slug})`,()=>{
  const html=engine.render({...bundle,audioRuntime:runtime},structuredClone(bundle.data),slug,{}, {},{music:{track:'none',volume:.35,onOpen:true}});
  assert.doesNotMatch(html,/<audio\b|<aside id="amplop-music"/i);
  assert.ok(html.includes(`<script>${runtime}</script>`),'chapter runtime must remain');
  new vm.Script(runtime);
 });
}
test('New draft music defaults without modifying saved projects',async()=>{
 const studio=await read('admin-studio/studio.js');
 const source=studio.match(/function draft\(\)\{.*\}/)?.[0];
 assert.ok(source);
 const draft=Function('AMPlOP_V14_BUNDLE','names',source+';return draft();')(bundle,Object.keys(bundle.registry));
 assert.deepEqual(draft.experience.music,{track:'golden-hour',volume:.35,onOpen:true,upload:'',filename:''});
});
