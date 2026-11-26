from pathlib import Path
from playwright.sync_api import sync_playwright
import json, shutil, time, traceback
P=Path(__file__).parent; src=(P/'amplop-studio-v13.html').read_text(); results=[]; errors=[]
def ck(n,v):
 results.append((n,bool(v))); print(('PASS ' if v else 'FAIL ')+n,flush=True)
def case(n,fn):
 try: ck(n,fn())
 except Exception as e: ck(n,False); print(str(e)[:400],flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio']); p=b.new_page(viewport={'width':1440,'height':1000},accept_downloads=True);p.set_default_timeout(3000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept());p.set_content(src);p.locator('.template').first.wait_for();p.emulate_media(reduced_motion='reduce')
 slugs=['secret-letter','cinematic-romance','wedding-editorial','enchanted-garden','our-story']
 for slug in slugs:
  case(slug+' XSS escaped and asset-like text preserved',lambda:p.evaluate('''slug=>{const b=JSON.parse(document.querySelector('#bundle').textContent);const value='<img src=x onerror=alert(1)> assets/portrait.webp & "雪"';b.data.guest.name=value;const html=Engine.render(b,b.data,slug);const doc=new DOMParser().parseFromString(html,'text/html');return doc.querySelector('#guest').textContent===value&&!doc.querySelector('img[src=x]')&&JSON.parse(doc.querySelector('#invitation-data').textContent).guest.name===value}''',slug))
  case(slug+' Unicode text renders',lambda:p.evaluate('''slug=>{const b=JSON.parse(document.querySelector('#bundle').textContent);b.data.couple.first='Éléonore 雪';b.data.couple.second='محمد';const doc=new DOMParser().parseFromString(Engine.render(b,b.data,slug),'text/html');return doc.querySelector('#hero').textContent.includes('Éléonore 雪')&&doc.querySelector('#hero').textContent.includes('محمد')}''',slug))
 for name,change in [('invalid calendar','d.events.ceremony.start="2027-02-30T10:00:00+07:00"'),('reversed time','d.events.ceremony.end=d.events.ceremony.start'),('numeric ID','d.id=123'),('early year','d.events.ceremony.start="0099-06-20T10:00:00+07:00"'),('empty name','d.couple.first=" "'),('long name','d.couple.first="x".repeat(101)'),('invalid image path','d.photos.portrait="../secret"'),('invalid guest ID','d.guest.id="a:b"')]:
  case(name+' rejected',lambda:p.evaluate('()=>{const d=JSON.parse(document.querySelector("#bundle").textContent).data;'+change+';try{Engine.validate(d);return false}catch{return true}}'))
 p.locator('#first').fill('Nama Uji');p.wait_for_timeout(450)
 for i in range(20): p.locator(f'[data-slug="{slugs[i%5]}"]').evaluate('e=>e.click()')
 case('20 template switches keep one iframe and data',lambda:p.locator('iframe').count()==1 and p.locator('#first').input_value()=='Nama Uji' and 'Nama Uji' in p.frame_locator('iframe').locator('#hero').inner_text())
 p.locator('#experience-panel').evaluate('e=>e.open=true');p.locator('#music-choice').select_option('ivory-nocturne');p.locator('#music-file').set_input_files({'name':'fake.mp3','mimeType':'audio/mpeg','buffer':b'not an mp3'});p.wait_for_timeout(500);case('corrupt MP3 rejected without replacing track',lambda:p.locator('#music-choice').input_value()=='ivory-nocturne' and 'didekode' in p.locator('#music-status').inner_text())
 p.locator('#music-file').set_input_files({'name':'big.mp3','mimeType':'audio/mpeg','buffer':b'0'*(2*1024*1024+1)});case('oversized audio rejected',lambda:'maksimal 2 MB' in p.locator('#music-status').inner_text())
 # Force asynchronous photo decode, reset before it resolves; original photo must stay.
 p.evaluate('''()=>{const orig=window.createImageBitmap;window.createImageBitmap=async(...args)=>{await new Promise(r=>setTimeout(r,700));return orig(...args)}}''');p.locator('#file-portrait').set_input_files(str(P/'assets/portrait.webp'));p.locator('#reset').click();p.wait_for_timeout(1000);case('reset cancels pending photo upload',lambda:p.locator('#thumb-portrait').get_attribute('src')==p.evaluate('JSON.parse(document.querySelector("#bundle").textContent).assets["portrait.webp"]'))
 # Capture all five actual rendered pages, then test full motion outside the editor.
 docs=p.evaluate('''slugs=>{const b=JSON.parse(document.querySelector('#bundle').textContent);return slugs.map(s=>Engine.render(b,b.data,s,{},{},{music:{track:'ivory-nocturne',volume:.35,onOpen:true}}))}''',slugs)
 q=b.new_page(viewport={'width':390,'height':844},accept_downloads=True);q.set_default_timeout(5000);q.on('pageerror',lambda e:errors.append(str(e)));q.emulate_media(reduced_motion='no-preference')
 for slug,html in zip(slugs,docs):
  q.goto('about:blank');q.set_content(html);gate=q.locator('#gate');op=q.locator('#play' if slug=='cinematic-romance' else '#open');case(slug+' audio controls hidden while gate closed',lambda:q.locator('#amplop-music').evaluate('e=>e.inert && getComputedStyle(e).visibility==="hidden"'))
  t=time.monotonic();op.click();q.wait_for_function('()=>document.querySelector("#gate").hidden || document.querySelector("#gate").inert',timeout=5000);elapsed=time.monotonic()-t
  case(slug+' full motion opens',lambda:0.65<elapsed<5 and not q.locator('#main').evaluate('e=>e.inert'));case(slug+' audio after open',lambda:q.locator('#amplop-audio').evaluate('a=>!a.paused&&a.currentTime>0'))
  q.locator('[data-music-play]').click();q.locator('[data-music-volume]').evaluate('e=>{e.value=.7;e.dispatchEvent(new Event("input"))}');q.wait_for_timeout(400);case(slug+' pause survives volume change during fade',lambda:q.locator('#amplop-audio').evaluate('a=>a.paused'))
  q.locator('#replay').evaluate('e=>e.click()');q.wait_for_timeout(100);case(slug+' replay stops audio',lambda:q.locator('#amplop-audio').evaluate('a=>a.paused') and not gate.evaluate('e=>e.hidden||e.inert'))
  q.locator('#skip').click();case(slug+' skip opens',lambda:not q.locator('#main').evaluate('e=>e.inert'))
  for w,h in [(320,568),(390,844),(768,1024),(1440,900)]:
   q.set_viewport_size({'width':w,'height':h});q.wait_for_timeout(80);case(slug+' layout '+str(w),lambda:q.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  q.set_viewport_size({'width':390,'height':844});q.evaluate('scrollTo(0,0)');q.screenshot(path=str(P/(slug+'-qa.png')))
 case('no uncaught browser errors',lambda:not errors);b.close()
report='V13: Chromium in-memory; full-motion standalone + reduced-motion editor; native HTTP blocked; audio muted by test runner; no backend.\n'+'\n'.join(('PASS ' if v else 'FAIL ')+n for n,v in results)+f'\n{sum(v for n,v in results)} passed / {sum(not v for n,v in results)} failed.\nErrors: {errors}\n';(P/'QA_V13.txt').write_text(report);print(report)
