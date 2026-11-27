import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { stripDemoRsvp } from '../admin-studio/project-store.mjs';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const engine = Function((await read('admin-studio/engine-v14.js')) + '\nreturn Engine;')();
const bundle = Function((await read('admin-studio/bundle-v14.js')) + '\nreturn AMPlOP_V14_BUNDLE;')();
const runtime = await read('admin-studio/interaction-runtime.js');
const runtimeSource = `window.AMPLOP_STORY_COUNT=${bundle.data.story.length};${runtime}`;
for (const slug of Object.keys(bundle.templates)) {
  test(`V26 rendered HTML: audio script closes correctly (${slug})`, () => {
    const html = engine.render({...bundle, audioRuntime: runtimeSource}, structuredClone(bundle.data), slug, {}, {}, {music:{track:'golden-hour', volume:.5, onOpen:true}});
    for (const output of [html, stripDemoRsvp(html)]) {
      assert.ok(output.includes(`<script>${runtimeSource}</script>`), 'audio runtime must be a complete HTML script element');
      assert.ok(!output.includes('<\\/script>'), 'literal backslash before script closing tag');
      const scripts = [...output.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
      const audioScripts = scripts.filter(m => m[2] === runtimeSource);
      assert.equal(audioScripts.length, 1);
      new vm.Script(audioScripts[0][2]);
      assert.match(output, /<audio id="amplop-audio"[^>]*data-open="true"[^>]*src="data:audio\/mpeg;base64,[A-Za-z0-9+/=]+"/);
    }
  });
}
