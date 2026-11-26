"""In-memory Chromium fixture: actual generated PIN and guest ticket shells. No live HTTP, QR encoder, camera or database."""
import pathlib, subprocess, json, tempfile, shutil
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1];checks=[]
def check(name,ok):
    assert ok,name
    checks.append(name)
with tempfile.TemporaryDirectory() as d:
    js="""import {writeFileSync} from 'node:fs';import {pinPage} from './lib/event/core.mjs';import {guestPage} from './lib/guests/page.mjs';const t='a'.repeat(64);writeFileSync(process.argv[1]+'/pin.html',pinPage(t));writeFileSync(process.argv[1]+'/ticket.html',guestPage(t,{name:'Tamu Contoh',seats:2,attendance:null,count:null,message:'',check_code:'b'.repeat(64)}));"""
    subprocess.run(['node','--input-type=module','-e',js,d],cwd=root,check=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
        for width in [320,390,768,1440]:
            page=browser.new_page(viewport={'width':width,'height':844},reduced_motion='reduce')
            page.set_content((pathlib.Path(d)/'pin.html').read_text());check(f'{width} PIN no overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'));check(f'{width} password masked',page.locator('[name=pin]').get_attribute('type')=='password');page.fill('[name=pin]','12345');check(f'{width} rejects short PIN',not page.locator('[name=pin]').evaluate('(el)=>el.checkValidity()'));page.fill('[name=pin]','012345');check(f'{width} accepts valid PIN',page.locator('[name=pin]').evaluate('(el)=>el.checkValidity()'));check(f'{width} no guest iframe before PIN',page.locator('iframe').count()==0)
            if width==390:page.screenshot(path=str(root/'private-pin-390.png'))
            # Replace iframe with inert content only. Ticket image URL is verified, not loaded.
            page.set_content((pathlib.Path(d)/'ticket.html').read_text().replace('src="/g/'+'a'*64+'/invitation"','srcdoc="&lt;p&gt;Invitation fixture&lt;/p&gt;"'))
            check(f'{width} ticket no overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'));check(f'{width} separate code',page.locator('#ticket code').inner_text()=='AMPLOP23:'+'b'*64);check(f'{width} image route',page.locator('#ticket img').get_attribute('src')=='/g/'+'a'*64+'/qr');check(f'{width} RSVP preserved',page.locator('#rsvp form').count()==1);page.close()
        browser.close()
print(json.dumps({'passed':len(checks),'checks':checks,'scope':'in-memory PIN and ticket shell fixtures; no QR image decoding, camera, HTTP or database'},indent=2))
