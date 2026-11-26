from pathlib import Path
from playwright.sync_api import sync_playwright
import json,shutil,subprocess,re
P=Path(__file__).parent;V=P.parent;S=(V/'amplop-studio-v13.html').read_text(); out={};slugs=['secret-letter','cinematic-romance','wedding-editorial','enchanted-garden','our-story']
with sync_playwright() as w:
 b=w.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--mute-audio']);p=b.new_page(viewport={'width':1440,'height':1000});p.set_content(S);p.emulate_media(reduced_motion='reduce');p.locator('.template').first.wait_for();c=p.context.new_cdp_session(p);c.send('Performance.enable')
 def snap():
  c.send('HeapProfiler.collectGarbage');return {x['name']:x['value'] for x in c.send('Performance.getMetrics')['metrics'] if x['name'] in ['JSHeapUsedSize','Documents','Nodes','JSEventListeners']}
 initial=snap()
 for i in range(30):p.locator('[data-slug="'+slugs[i%5]+'"]').evaluate('e=>e.click()')
 p.wait_for_timeout(250);out['heap_diagnostic']={'before':initial,'after_30_switches':snap(),'iframe_count':p.locator('iframe').count(),'note':'Parent renderer only; not a full memory leak profile.'}
 docs=p.evaluate('''slugs=>{let b=JSON.parse(document.querySelector('#bundle').textContent);b.data.couple.first='Raka';b.data.couple.second='Mira';for(const k of ['ceremony','reception'])for(const x of ['start','end'])b.data.events[k][x]=b.data.events[k][x].replace('2027-06-20','2028-02-29');return slugs.map(s=>Engine.render(b,b.data,s))}''',slugs)
 q=b.new_page(viewport={'width':390,'height':844});q.emulate_media(reduced_motion='reduce');out['dynamic_cover']={};out['contrast_sample']={}
 for slug,html in zip(slugs,docs):
  q.goto('about:blank');q.set_content(html);gate=q.locator('#gate').inner_text();out['dynamic_cover'][slug]={'old_demo_names_present':bool(re.search(r'ADRIAN|CLARA',gate,re.I)),'old_short_date_present':'20.06.27' in gate,'new_name_visible': 'Raka' in gate or 'Mira' in gate,'new_date_visible':'29.02.2028' in gate}
  q.locator('#skip').click();q.wait_for_timeout(100)
  # Conservative flat solid-background contrast checks: omit gradients/images/translucent foregrounds.
  out['contrast_sample'][slug]=q.evaluate('''()=>{let checked=0,flagged=[];const rgb=s=>{let m=s.match(/^rgba?\\(([^)]+)\\)$/);return m?m[1].split(',').map(Number):null};const l=c=>{let x=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return x[0]*.2126+x[1]*.7152+x[2]*.0722};for(let e of document.querySelectorAll('#main button,#main a,#main label,#main p')){let s=getComputedStyle(e);if(!e.getClientRects().length||s.visibility!=='visible'||!e.textContent.trim())continue;let fg=rgb(s.color),bg=null;if(!fg||fg.length===4&&fg[3]!==1)continue;for(let n=e;n;n=n.parentElement){let t=getComputedStyle(n),c=rgb(t.backgroundColor);if(t.backgroundImage!=='none')break;if(c&&(c.length===3||c[3]===1)){bg=c;break}if(c&&c[3]>0)break}if(!bg)continue;let r=(Math.max(l(fg),l(bg))+.05)/(Math.min(l(fg),l(bg))+.05),size=parseFloat(s.fontSize),large=size>=24||size>=18.66&&parseInt(s.fontWeight)>=700;checked++;if(r<(large?3:4.5))flagged.push({text:e.textContent.trim().slice(0,80),ratio:+r.toFixed(2),threshold:large?3:4.5})}return {checked,flagged,note:'Only sampled opaque flat backgrounds; not WCAG certification.'}}''')
 b.close()
out['audio_analysis']={}
for f in (V/'assets').glob('*.mp3'):
 x=subprocess.run(['ffmpeg','-hide_banner','-i',str(f),'-af','volumedetect','-f','null','-'],capture_output=True,text=True).stderr
 out['audio_analysis'][f.name]={k:re.search(k+r': ([^\n]+)',x).group(1) for k in ['mean_volume','max_volume'] if re.search(k+r': ([^\n]+)',x)}
(P/'diagnostics.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
