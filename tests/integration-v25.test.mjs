import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {providerResult,classify} from '../lib/payment/core.mjs';
import {renderInvitation} from '../lib/payment/render.mjs';
import {guestPage} from '../lib/guests/page.mjs';
import {pinPage} from '../lib/event/core.mjs';
const read=p=>readFileSync(p,'utf8');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(p+'/'+x.name):[p+'/'+x.name]);
const sql=walk('supabase/migrations').sort().map(read).join('\n');
const files=walk('app').concat(walk('lib')).filter(f=>/\.tsx?$/.test(f));
const legacy=['amplop_read_publication','amplop_read_guest','amplop_submit_rsvp'];
test('canonical provider 404, non-2xx and malformed responses fail closed without altering order',()=>{
 for(const [status,data] of [[404,{status_code:'404'}],[200,{status_code:'404'}],[500,{status_code:'200'}],[200,null],[200,[]],[200,'ok']])assert.throws(()=>providerResult(status,data));
 const order={id:'00000000-0000-4000-8000-000000000001',amount:10000};const valid={order_id:order.id,gross_amount:'10000.00',currency:'IDR',status_code:'200',transaction_status:'settlement'};
 assert.equal(classify(providerResult(200,valid),order),'paid');assert.ok(read('lib/payment/server.ts').includes('providerResult(r.status,await r.json())'));
 assert.ok(!read('lib/payment/server.ts').includes("status_code==='404')return o.state"));
});
test('all server and client RPC references have definitions in ordered migrations; no pre-PIN call remains',()=>{
 const names=new Set([...sql.matchAll(/create\s+(?:or replace\s+)?function\s+public\.(\w+)\s*\(/gi)].map(x=>x[1]));
 let count=0;for(const f of files){for(const m of read(f).matchAll(/\.rpc\(['"](\w+)['"]/g)){count++;assert.ok(names.has(m[1]),f+': '+m[1]);assert.ok(!legacy.includes(m[1]),f+': obsolete RPC');}}assert.ok(count>=15);
});
test('six ordered migrations, every application table enables RLS, no V15 scratch migration',()=>{
 const migrations=walk('supabase/migrations').sort();assert.equal(migrations.length,6);migrations.forEach((f,i)=>assert.ok(f.includes('20261126000'+(i+1))));
 const tables=[...sql.matchAll(/create table public\.(\w+)/gi)].map(x=>x[1]);assert.equal(new Set(tables).size,12);for(const t of tables)assert.match(sql,new RegExp('alter table public\\.'+t+' enable row level security','i'));
});
test('V25 migration retires legacy service-role execution and retains scoped reads (static contract)',()=>{
 const s=read('supabase/migrations/202611260006_amplop_v25.sql');for(const name of legacy)assert.ok(s.includes('public.'+name+'('));assert.match(s,/from public,anon,authenticated,service_role;/);assert.ok(s.includes('grant select on public.amplop_weddings,public.amplop_drafts to service_role;'));
 assert.ok(existsSync('supabase/tests/v25_privileges.sql'));
});
test('no client component directly imports server payment module or references server secrets',()=>{
 for(const f of files){const s=read(f);if(/^\s*['"]use client['"]/.test(s)){assert.doesNotMatch(s,/SUPABASE_SERVICE_ROLE_KEY|MIDTRANS_SANDBOX_SERVER_KEY|from\s+['"][^'\"]*\/payment\/server['"]/);}}
 assert.match(read('.env.example'),/AMPLOP_SANDBOX_ENABLED=false/);
});
test('account module links and routes are present; health remains liveness only',()=>{
 const a=read('app/account/workspace.tsx');for(const name of ['Publishing','Guests','EventOwner','Planning'])assert.ok(a.includes('<'+name+' '));for(const r of ['publishing','guests','event','event/staff','planning','midtrans/notification','health'])assert.ok(existsSync('app/api/'+r+'/route.ts'));
 assert.match(read('app/api/health/route.ts'),/stage: 'V25', scope: 'liveness'/);
});
test('published personal link, RSVP and separate QR credential survive all five templates',async()=>{
 const data=JSON.parse(read('reference/v16/reference/v14/invitation.json'));const registry=JSON.parse(read('reference/v16/reference/v14/registry.json'));const token='a'.repeat(64),code='b'.repeat(64),g={id:'fixture-guest',name:'Tamu <V25>',seats:3,attendance:'yes',count:2,message:'Selamat!',check_code:code};
 const outer=guestPage(token,g);assert.ok(outer.includes('/g/'+token+'/invitation'));assert.ok(outer.includes('/g/'+token+'/qr'));assert.ok(outer.includes('AMPLOP23:'+code));assert.ok(!pinPage(token).includes(g.name));
 for(const slug of Object.keys(registry)){const draft={data,slug,settings:{},uploads:{},mode:'mobile',experience:{fonts:{},music:{track:'none',volume:.3,onOpen:false,upload:'',filename:''}}};const h=await renderInvitation(draft,{publicView:true,weddingId:'fixture',guest:{id:g.id,name:g.name}});assert.match(h,/Tamu &lt;V25&gt;/);assert.ok(!h.includes(code));assert.ok(!h.includes(token));assert.ok(!/<form\b/.test(h));}
});
