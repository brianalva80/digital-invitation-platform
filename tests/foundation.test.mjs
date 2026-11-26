import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root));
const json = p => JSON.parse(read(p));
const sha = buf => createHash('sha256').update(buf).digest('hex');
const v14 = 'reference/v16/reference/v14/';
const registry = json(v14+'registry.json');
const expected = ['secret-letter','cinematic-romance','wedding-editorial','enchanted-garden','our-story'];
test('exactly five original template keys and source files', () => {
  assert.deepEqual(Object.keys(registry),expected);
  for (const key of expected) assert.ok(existsSync(new URL(v14+registry[key].file, root)));
});
test('original V16 manifest integrity', () => {
  const rows = read('reference/v16/MANIFEST.sha256').toString().trim().split(/\r?\n/);
  assert.ok(rows.length > 0);
  for (const row of rows) { const [hash,path] = row.split('  '); assert.equal(sha(read('reference/v16/'+path)),hash,path); }
});
test('public preview byte-identical to V14 source', () => {
  assert.deepEqual(read('public/demo/studio-v14.html'),read(v14+'amplop-studio-v14.html'));
});
test('foundation route files and runtime scripts present', () => {
  for (const path of ['app/layout.tsx','app/page.tsx','app/studio/page.tsx','app/api/health/route.ts','app/not-found.tsx','lib/routes.ts','lib/templates.ts']) assert.ok(existsSync(new URL(path,root)),path);
  const p=json('package.json'); assert.equal(p.private,true);
  assert.deepEqual(Object.keys(p.dependencies).sort(),['@supabase/supabase-js','next','qrcode','react','react-dom']);
  for(const key of ['dev','build','start','typecheck','test']) assert.ok(p.scripts[key]);
});
test('no local credentials and migration source present', () => {
  assert.equal(existsSync(new URL('.env.local',root)),false);
  assert.equal(existsSync(new URL('supabase/migrations/',root)),true);
  assert.ok(read('.env.example').toString().includes('Never use a secret/service_role key'));
});
