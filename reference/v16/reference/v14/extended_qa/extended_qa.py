from pathlib import Path
from playwright.sync_api import sync_playwright
import json, time, statistics, shutil, subprocess
P=Path(__file__).resolve().parent; V=P.parent; SRC=(V/'amplop-studio-v13.html').read_text(); results=[]; errors=[]; metrics=[]
slugs=['secret-letter','cinematic-romance','wedding-editorial','enchanted-garden','our-story']
def ck(name,fn):
 try:
  value=fn(); result='PASS' if value else 'FAIL'; detail=''
 except Exception as e: result='FAIL';detail=str(e).splitlines()[0][:250]
 results.append(dict(name=name,status=result,detail=detail));print(result,name,detail,flush=True)
def record(name,status,detail):
 results.append(dict(name=name,status=status,detail=detail));print(status,name,detail,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio']);p=b.new_page(viewport={'width':1440,'height':1000});p.set_default_timeout(2200);p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(SRC);p.emulate_media(reduced_motion='reduce');p.locator('.template').first.wait_for();p.locator('#experience-panel').evaluate('e=>e.open=true')
 for ext,mime in [('wav','audio/wav'),('ogg','audio/ogg'),('m4a','audio/mp4')]:
  p.locator('#music-choice').select_option('none');p.locator('#music-file').set_input_files({'name':'test.'+ext,'mimeType':mime,'buffer':(P/('test.'+ext)).read_bytes()});
  def audio_check():
   p.wait_for_function('document.querySelector("#music-choice").value==="custom"',timeout=5500);p.locator('#music-preview').click();p.wait_for_function('!document.querySelector("#studio-audio").paused && document.querySelector("#studio-audio").currentTime>0.1',timeout=3000);p.locator('#music-stop').click();return p.locator('#studio-audio').evaluate('a=>a.paused')
  ck('Upload, decode, play, stop '+ext.upper(),audio_check)
 p.locator('#music-choice').select_option('ivory-nocturne');p.locator('#music-open').check();p.wait_for_timeout(150)
 for i in range(10):
  p.locator('[data-slug="'+slugs[i%5]+'"]').click(); f=p.frame_locator('iframe'); f.locator('#play' if i%5==1 else '#open').evaluate('e=>e.click()');p.wait_for_timeout(50);p.locator('#music-preview').click();
 ck('10 switches during active sample/guest interaction: single iframe',lambda:p.locator('iframe').count()==1)
 ck('Editor sample plays after switch',lambda:p.locator('#studio-audio').evaluate('a=>!a.paused'))
 p.locator('[data-slug="secret-letter"]').click();ck('Switch stops previous editor sample',lambda:p.locator('#studio-audio').evaluate('a=>a.paused'))
 f=p.frame_locator('iframe');f.locator('#open').click();p.wait_for_timeout(250);p.locator('#music-preview').click();p.wait_for_timeout(300);ck('Starting editor sample pauses current guest audio',lambda:f.locator('#amplop-audio').evaluate('a=>a.paused'))
 docs=p.evaluate('''slugs=>{const b=JSON.parse(document.querySelector('#bundle').textContent);return slugs.map(s=>Engine.render(b,b.data,s,{},{},{music:{track:'ivory-nocturne',volume:.35,onOpen:true}}))}''',slugs)
 longdocs=p.evaluate('''slugs=>{const b=JSON.parse(document.querySelector('#bundle').textContent);b.data.couple.first='W'.repeat(100);b.data.couple.second='長'.repeat(100);b.data.guest.name='M'.repeat(100);return slugs.map(s=>Engine.render(b,b.data,s,{},{},{}))}''',slugs)
 q=b.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);q.set_default_timeout(2500);q.on('pageerror',lambda e:errors.append(str(e)));q.emulate_media(reduced_motion='reduce');cdp=q.context.new_cdp_session(q);cdp.send('Performance.enable')
 for slug,html,longhtml in zip(slugs,docs,longdocs):
  q.goto('about:blank');t=time.monotonic();q.set_content(html);q.evaluate('Promise.all(Array.from(document.images, i=>i.decode().catch(()=>{})))');ms=(time.monotonic()-t)*1000
  perf={x['name']:x['value'] for x in cdp.send('Performance.getMetrics')['metrics']};metrics.append({'template':slug,'html_bytes':len(html.encode()),'set_content_and_decode_ms':round(ms,1),'dom_nodes':perf.get('Nodes'),'js_heap_bytes':perf.get('JSHeapUsedSize')})
  op='#play' if slug=='cinematic-romance' else '#open';ck(slug+' touch tap opening',lambda:(q.locator(op).tap(),q.wait_for_timeout(150),not q.locator('#main').evaluate('e=>e.inert'))[-1]);
  ck(slug+' visible focus on keyboard navigation',lambda:(q.keyboard.press('Tab'),q.evaluate('()=>{let e=document.activeElement;return e!==document.body && e.getBoundingClientRect().width>0 && !e.closest("[inert]") }'))[-1])
  ck(slug+' form controls have accessible name',lambda:q.locator('#rsvp input:not([type=hidden]),#rsvp select,#rsvp textarea').evaluate_all('es=>es.every(e=>e.labels?.length||e.getAttribute("aria-label")||e.getAttribute("aria-labelledby"))'))
  ck(slug+' meaningful images have alt attribute',lambda:q.locator('img').evaluate_all('es=>es.every(e=>e.hasAttribute("alt"))'))
  ck(slug+' touch photo viewer opens',lambda:(q.locator('[data-photo]').first.tap(),q.wait_for_timeout(180),q.locator('dialog[open]').count()>0)[-1])
  ck(slug+' Escape closes photo viewer',lambda:(q.keyboard.press('Escape'),q.wait_for_timeout(100),q.locator('dialog[open]').count()==0)[-1]);
  ck(slug+' RSVP unavailable storage reports failure',lambda:(q.locator('#rsvp [name=name]').fill('QA Guest'),q.locator('#rsvp [name=attendance]').select_option('yes'),q.locator('#rsvp form').evaluate('e=>e.requestSubmit()'), 'tidak tersimpan' in q.locator('#status').inner_text())[-1]);
  q.goto('about:blank');q.set_viewport_size({'width':320,'height':568});q.set_content(longhtml);ck(slug+' long-name opening skip reachable',lambda:(q.locator('#skip').click(timeout=900),True)[-1]);q.locator('#skip').evaluate('e=>e.click()') if q.locator('#main').evaluate('e=>e.inert') else None;q.wait_for_timeout(100)
  ck(slug+' 100-character names: no horizontal document overflow',lambda:q.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  # Detect actual text box horizontal/vertical clipping by immediate text range against viewport, ignoring deliberate offscreen elements.
  clipping=q.evaluate('''()=>{let h=document.querySelector('#heroTitle')||document.querySelector('#hero h1');if(!h)return {ok:false};let r=document.createRange();r.selectNodeContents(h);let rs=[...r.getClientRects()].filter(r=>r.width&&r.height);return {ok:rs.every(r=>r.left>=-2&&r.right<=innerWidth+2),left:Math.round(Math.min(...rs.map(r=>r.left))),right:Math.round(Math.max(...rs.map(r=>r.right)))}}''');record(slug+' long-name hero text bounds','PASS' if clipping['ok'] else 'FAIL',json.dumps(clipping));q.screenshot(path=str(P/(slug+'-long.png')))
  q.set_viewport_size({'width':390,'height':844})
 # native storage not available in current origin
 try:
  q.evaluate('localStorage.setItem("nativeQA","x")');record('Native storage','PASS','Current origin write succeeds; reload still unverified')
 except Exception as e:record('Native storage','BLOCKED',str(e).splitlines()[0])
 record('Safari / WebKit / Firefox','BLOCKED','Executables unavailable; Chromium mobile emulation is not Safari or a physical device.')
 record('Lighthouse / field CWV','BLOCKED','No Lighthouse executable or deployable URL; local set_content timing is only a diagnostic.')
 ck('No uncaught JavaScript errors',lambda:not errors);b.close()
(P/'results.json').write_text(json.dumps({'checks':results,'metrics':metrics,'errors':errors},indent=2));print('TOTAL', {s:sum(r['status']==s for r in results) for s in ['PASS','FAIL','BLOCKED']},flush=True)
