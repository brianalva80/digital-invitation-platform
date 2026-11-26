"""In-memory Chromium review. Local storage is explicitly simulated; HTTP/file navigation is not tested."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, base64, shutil
root=Path(__file__).resolve().parents[1]; public=root/'public'
key='amplop:studio:v12:draft'; checks=[]; storage={}; errors=[]
def check(name,condition):
    assert condition,name
    checks.append(name)
def inline_image(name): return 'data:image/webp;base64,'+base64.b64encode((public/'showcase'/name).read_bytes()).decode()
def snapshot(name):
    html=(public/name).read_text()
    shim='<script>const _qaStore = '+json.dumps(storage).replace('<','\\u003c')+'; Object.defineProperty(window,"localStorage",{value:{getItem:k=>Object.hasOwn(_qaStore,k)?_qaStore[k]:null,setItem:(k,v)=>{_qaStore[k]=String(v)},removeItem:k=>{delete _qaStore[k]}}});</script>'
    html=html.replace('<head>','<head>'+shim,1)
    if name=='dashboard.html':
        html=html.replace('<link rel="stylesheet" href="./dashboard/dashboard.css">','<style>'+(public/'dashboard/dashboard.css').read_text()+'</style>')
        for f in ['engine-v14.js','bundle-v14.js','dashboard.js']:
            js=(public/'dashboard'/f).read_text()
            if f=='dashboard.js':
                assets={p.stem:inline_image(p.name) for p in (public/'showcase').glob('*.webp')}
                js=js.replace("'./showcase/'+state.slug+'.webp'",f'({json.dumps(assets)})[state.slug]').replace("'./showcase/'+slug+'.webp'",f'({json.dumps(assets)})[slug]')
            html=html.replace(f'<script defer src="./dashboard/{f}"></script>','<script>'+js.replace('</script>','<\\/script>')+'</script>' if f=='bundle-v14.js' else '<script>'+js+'</script>')
        # defer equivalent: move scripts after DOM
        import re
        scripts=re.findall(r'<script>.*?</script>',html,flags=re.S);html=re.sub(r'<script>.*?</script>','',html,flags=re.S);html=html.replace('</body>',''.join(scripts)+'</body>')
        for name in ['hero.webp','secret-letter.webp']:html=html.replace('./showcase/'+name,inline_image(name))
    return html
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
    ctx=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    def load(name):
        page=ctx.new_page();page.set_default_timeout(6000);page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(snapshot(name),wait_until='load');return page
    def save(page):
        storage.clear();storage.update(page.evaluate('JSON.parse(JSON.stringify(_qaStore))'));page.close()
    page=load('dashboard.html');page.wait_for_selector('#templates article',timeout=5000);check('Five cards',page.locator('#templates article').count()==5);check('Default demo state',page.locator('#draft-state').inner_text()=='Data contoh');check('No implicit draft write',page.evaluate('(k)=>localStorage.getItem(k)',key) is None)
    page.screenshot(path=str(root/'dashboard-1440.png'),animations='disabled');page.screenshot(path=str(root/'dashboard-1440-full.png'),full_page=True,animations='disabled')
    page.get_by_role('button',name='Pilih Cinematic Romance',exact=True).click();check('Selection saved to storage adapter',page.evaluate('(k)=>JSON.parse(localStorage.getItem(k)).slug',key)=='cinematic-romance');save(page);page=load('dashboard.html');check('Selection restored from fixture',page.locator('#template-title').inner_text()=='Cinematic Romance');save(page)
    page=load('demo/studio-v14.html');page.wait_for_selector('#first');check('Unchanged Studio loads selected design from fixture',page.locator('[data-slug="cinematic-romance"]').get_attribute('aria-pressed')=='true');page.locator('#first').fill('Raka');page.locator('#second').fill('Nara');page.locator('#experience-panel summary').click();page.locator('#music-choice').select_option('ivory-nocturne');page.locator('#save').click();stored=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key);check('Actual editor saved customized content to adapter',stored['data']['couple']=={'first':'Raka','second':'Nara'} and stored['experience']['music']['track']=='ivory-nocturne');save(page);page=load('dashboard.html');check('Dashboard reflects editor fixture',page.locator('#couple').inner_text()=='Raka & Nara')
    for slug,title in [('wedding-editorial','The Wedding Editorial'),('enchanted-garden','The Enchanted Garden'),('our-story','Our Story'),('secret-letter','The Secret Letter'),('cinematic-romance','Cinematic Romance')]:
      page.get_by_role('button',name='Pilih '+title,exact=True).click();saved=page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key);check('Preserved all draft fields: '+slug,saved=={**stored,'slug':slug});page.locator('#preview').click();iframe=page.locator('#preview-frame iframe');check('Sandbox: '+slug,iframe.get_attribute('sandbox')=='allow-scripts allow-downloads');frame=iframe.content_frame;frame.locator('#invitation-data').wait_for(state='attached',timeout=5000);d=json.loads(frame.locator('#invitation-data').text_content());check('Personalized actual renderer: '+slug,d['couple']=={'first':'Raka','second':'Nara'});check('Audio retained: '+slug,frame.locator('#amplop-audio').count()==1);page.locator('#close-preview').click();iframe.wait_for(state='detached');check('Preview iframe destroyed: '+slug,iframe.count()==0)
    for width in [320,390,768,1440]:
      page.set_viewport_size({'width':width,'height':844});check('No horizontal overflow: '+str(width),page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
      if width==390: page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(root/'dashboard-390.png'),animations='disabled');page.screenshot(path=str(root/'dashboard-390-full.png'),full_page=True,animations='disabled')
    page.evaluate('(k)=>localStorage.setItem(k,"{broken")',key);save(page);page=load('dashboard.html');check('Corrupt draft blocked',page.locator('#preview').is_disabled() and page.get_by_role('button',name='Pilih Our Story',exact=True).is_disabled());check('Corrupt draft preserved',page.evaluate('(k)=>localStorage.getItem(k)',key)=='{broken');check('No uncaught page errors',not errors);ctx.close();browser.close()
report={'passed':len(checks),'mode':'in-memory HTML + actual JS and renderer; simulated localStorage fixture and embedded images; no native navigation/storage','checks':checks};(root/'DASHBOARD_BROWSER_REPORT.json').write_text(json.dumps(report,indent=2)+'\n');print(f'{len(checks)} in-memory Chromium checks passed')
