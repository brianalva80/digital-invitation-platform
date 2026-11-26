from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
import shutil,json
P=Path(__file__).parent; slugs=json.loads((P/'registry.json').read_text()); results=[]; errors=[]
def ck(name,ok):
 results.append((name,bool(ok)));print(('PASS ' if ok else 'FAIL ')+name,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio']); p=b.new_page(viewport={'width':1440,'height':1000});p.set_content((P/'amplop-studio-v14.html').read_text());p.locator('.template').first.wait_for();docs=p.evaluate('''()=>{const b=JSON.parse(document.querySelector('#bundle').textContent);return Object.keys(b.registry).map(s=>Engine.render(b,b.data,s,{},{},{music:{track:'ivory-nocturne',volume:.35,onOpen:false}}))}''');q=b.new_page(viewport={'width':390,'height':844});q.emulate_media(reduced_motion='reduce');q.on('pageerror',lambda e:errors.append(str(e)));q.set_default_timeout(3500)
 for slug,html in zip(slugs,docs):
  q.goto('about:blank');q.set_content(html); panel=q.locator('#amplop-music'); exp=q.locator('[data-music-expand]');opt=q.locator('#amplop-music-options');ck(slug+' hidden during gate',panel.evaluate('e=>e.inert&&getComputedStyle(e).visibility==="hidden"'));q.locator('#skip').click();ck(slug+' starts collapsed',not opt.is_visible() and exp.get_attribute('aria-expanded')=='false');ck(slug+' no autoplay',q.locator('#amplop-audio').evaluate('a=>a.paused'));q.locator('[data-music-play]').click();q.wait_for_timeout(160);ck(slug+' play via visible button',q.locator('#amplop-audio').evaluate('a=>!a.paused'));exp.click();ck(slug+' expand and controls visible',opt.is_visible() and exp.get_attribute('aria-expanded')=='true');q.locator('[data-music-mute]').click();ck(slug+' mute works',q.locator('#amplop-audio').evaluate('a=>a.muted'));q.locator('[data-music-volume]').focus();q.keyboard.press('Escape');ck(slug+' Escape collapses and restores focus',not opt.is_visible() and exp.evaluate('e=>document.activeElement===e'));q.locator('[data-music-play]').click();q.wait_for_timeout(300);ck(slug+' pause works',q.locator('#amplop-audio').evaluate('a=>a.paused'))
  for w,h in [(320,568),(390,844),(1440,900)]:
   q.set_viewport_size({'width':w,'height':h});exp.click();ck(slug+f' expanded fits {w}',panel.evaluate('e=>{let r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}') and q.evaluate('document.documentElement.scrollWidth<=innerWidth'));exp.click()
  q.set_viewport_size({'width':390,'height':844});q.evaluate('scrollTo(0,0)');q.screenshot(path=str(P/(slug+'-review.png')));exp.click();q.screenshot(path=str(P/(slug+'-expanded.png')));q.locator('#replay').evaluate('e=>e.click()');ck(slug+' replay closes controls',not opt.is_visible() and panel.evaluate('e=>e.inert'))
 ck('no uncaught browser errors',not errors);b.close()
report='V14 focused UI regression, Chromium in-memory, reduced-motion, muted runner.\n'+'\n'.join(('PASS ' if v else 'FAIL ')+n for n,v in results)+f'\n{sum(v for n,v in results)} passed / {sum(not v for n,v in results)} failed\nErrors: {errors}\n';(P/'QA_V14.txt').write_text(report)
canvas=Image.new('RGB',(1500,710),'#eeebe5');d=ImageDraw.Draw(canvas)
for i,n in enumerate(slugs):
 im=Image.open(P/(n+'-review.png')).convert('RGB');im.thumbnail((280,630));canvas.paste(im,(i*300+(300-im.width)//2,53));d.text((i*300+12,24),slugs[n]['label'],fill='#292b25')
canvas.save(P/'COLLECTION_V14.jpg',quality=92)
