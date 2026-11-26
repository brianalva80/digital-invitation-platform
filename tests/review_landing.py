from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[1]
html=(root/'public/landing-preview.html').read_text()
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for w,h in [(320,568),(390,844),(768,1024),(1440,900)]:
  page=b.new_page(viewport={'width':w,'height':h},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.locator('.template-card').last.scroll_into_view_if_needed();page.evaluate('Promise.all([...document.images].map(i=>i.decode()))');page.evaluate('window.scrollTo(0,0)')
  checks={'no horizontal overflow':page.evaluate('document.documentElement.scrollWidth <= innerWidth'),'five cards':page.locator('.template-card').count()==5,'all images decoded':page.evaluate('[...document.images].every(i=>i.complete&&i.naturalWidth>0)')}
  page.locator('.hero-letter summary').click();checks['letter open']=page.locator('.hero-letter').get_attribute('open') is not None
  page.locator('.hero-letter summary').press('Enter');checks['keyboard close']=page.locator('.hero-letter').get_attribute('open') is None
  page.locator('a[href="#koleksi"]').first.click();checks['collection navigation']=page.evaluate('Math.abs(document.querySelector("#koleksi").getBoundingClientRect().top)<=35')
  page.evaluate('window.scrollTo(0,0)');checks['no JS error']=not errors
  if w in [390,1440]:page.screenshot(path=str(root/f'landing-{w}.png'),animations='disabled');page.screenshot(path=str(root/f'landing-{w}-full.png'),full_page=True,animations='disabled')
  for k,v in checks.items():results.append({'viewport':w,'check':k,'pass':bool(v)})
  page.close()
 # Check the generated V14 demos can load and open from the new showcase output.
 for f in sorted((root/'public/demo/templates').glob('*.html')):
  page=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(f.read_text(),wait_until='load')
  data=page.locator('#invitation-data').count()==1
  # use template-specific known open controls from V14; locate via actual button labels
  buttons=page.locator('button').all_text_contents()
  results.append({'viewport':390,'check':f.stem+' generated demo loads','pass':data and not errors,'button_samples':[x.strip() for x in buttons[:5]]})
  page.locator('#play' if f.stem=='cinematic-romance' else '#open').click()
  page.wait_for_function("document.querySelector('#gate').hidden || getComputedStyle(document.querySelector('#gate')).display === 'none'",timeout=5000)
  results.append({'viewport':390,'check':f.stem+' reduced-motion opening','pass':not errors and page.locator('#main').is_visible()})
  page.close()
 b.close()
(root/'LANDING_BROWSER_REPORT.json').write_text(json.dumps(results,indent=2))
print(f'{sum(x["pass"] for x in results)}/{len(results)} in-memory Chromium checks passed')
for x in results:
 if not x['pass']:print(x)
raise SystemExit(0 if all(x['pass'] for x in results) else 1)
