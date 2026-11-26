import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const keys=Object.keys(JSON.parse(read('reference/v16/reference/v14/registry.json')));
const landing=read('public/landing-preview.html');
test('five showcase cards and local demo links',()=>{assert.equal((landing.match(/<article /g)||[]).length,5);for(const k of keys){assert.ok(landing.includes(`./demo/templates/${k}.html`));assert.ok(existsSync(new URL(`public/showcase/${k}.webp`,root)));const h=read(`public/demo/templates/${k}.html`);assert.ok(h.includes('id="invitation-data"'));assert.ok(h.includes('DEMO · RSVP lokal'));assert.ok(!h.includes('{{shared_runtime}}'));}});
test('CTA, navigation and accessible native opening present',()=>{assert.equal((landing.match(/Create your invitation/g)||[]).length,2);for(const id of ['main-content','koleksi','cara-kerja','hero-title'])assert.ok(landing.includes(`id="${id}"`));assert.ok(landing.includes('<details'));assert.ok(landing.includes('<summary>'));assert.ok(landing.includes('./dashboard.html'));});
test('staging remains noindex and claims remain demo-only',()=>{assert.ok(landing.includes('noindex,nofollow'));assert.ok(read('next.config.ts').includes('noindex, nofollow'));assert.ok(landing.includes('Belum tersedia publikasi online'));assert.ok(landing.includes('pembayaran, dan publikasi belum aktif'));});
