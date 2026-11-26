"""Targeted Chromium check of server renderer HTML in opaque sandbox iframe.
No Next HTTP, real CSP headers, Auth, provider, or database integration. Requires Playwright + Chromium.
Run from project root. Produces temporary HTML; no permanent user data.
"""
import subprocess, tempfile, pathlib, json, shutil, html
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]
checks=[]
def check(name,ok):
    assert ok,name
    checks.append(name)
with tempfile.TemporaryDirectory() as d:
    js='''import {readFileSync,writeFileSync} from 'node:fs';import {renderInvitation} from './lib/payment/render.mjs';import {Engine} from './lib/cloud/v14-engine.mjs';for(const slug of Object.keys(Engine.variants)){const draft={data:JSON.parse(readFileSync('reference/v16/reference/v14/invitation.json','utf8')),slug,settings:{},uploads:{},mode:'mobile',experience:{fonts:{},music:{track:'golden-hour',volume:.3,onOpen:false,upload:'',filename:''}}};writeFileSync(process.argv[1]+'/'+slug+'.html',await renderInvitation(draft,{publicView:true,weddingId:'sandbox-fixture'}));}'''
    subprocess.run(['node','--input-type=module','-e',js,d],cwd=root,check=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
        for path in sorted(pathlib.Path(d).glob('*.html')):
            page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.set_content('<iframe title="Sandbox" sandbox="allow-scripts allow-downloads" style="width:100%;height:95vh;border:0" srcdoc="'+html.escape(path.read_text(),quote=True)+'"></iframe>')
            frame=page.frame_locator('iframe');frame.locator('#skip').click(timeout=10000)
            # Gate close differs by template; verify post-opening via presence of visible closing note and no demo form.
            frame.locator('aside').filter(has_text='RSVP belum aktif').wait_for(state='visible',timeout=10000)
            check(path.stem+' no RSVP form',frame.locator('form').count()==0)
            check(path.stem+' guest generic',frame.locator('#invitation-data').evaluate('(el)=>JSON.parse(el.textContent).guest.name')=='Tamu Istimewa')
            check(path.stem+' audio element',frame.locator('#amplop-audio').count()==1)
            check(path.stem+' no pageerror',not errors)
            page.close()
        browser.close()
print(json.dumps({'passed':len(checks),'checks':checks,'scope':'in-memory iframe, reduced motion, no HTTP'},indent=2))
