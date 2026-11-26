"""Chromium fixture interception; actual generated guest HTML and five V14 personalized renders.
No Next server, authentication, SQL, live POST or native network verification."""
import subprocess,tempfile,pathlib,json,shutil
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]; checks=[]
def check(name,ok):
 assert ok,name
 checks.append(name)
with tempfile.TemporaryDirectory() as d:
 js='''import {readFileSync,writeFileSync} from 'node:fs';import {renderInvitation} from './lib/payment/render.mjs';import {guestPage} from './lib/guests/page.mjs';import {Engine} from './lib/cloud/v14-engine.mjs';const g={id:'fixture-guest',name:'Tamu Contoh',seats:2,attendance:null,count:null,message:''};writeFileSync(process.argv[1]+'/shell.html',guestPage('a'.repeat(64),g));for(const slug of Object.keys(Engine.variants)){const draft={data:JSON.parse(readFileSync('reference/v16/reference/v14/invitation.json','utf8')),slug,settings:{},uploads:{},mode:'mobile',experience:{fonts:{},music:{track:'none',volume:.3,onOpen:false,upload:'',filename:''}}};writeFileSync(process.argv[1]+'/'+slug+'.html',await renderInvitation(draft,{publicView:true,weddingId:'sandbox-fixture',guest:{id:g.id,name:g.name}}));}'''
 subprocess.run(['node','--input-type=module','-e',js,d],cwd=root,check=True)
 folder=pathlib.Path(d)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
  for path in sorted(folder.glob('*.html')):
   if path.name=='shell.html':continue
   page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   # Replace only the fixture iframe src with srcdoc for in-memory QA; no real route or POST.
   import html
   shell=(folder/'shell.html').read_text().replace('src="/g/'+'a'*64+'/invitation"','srcdoc="'+html.escape(path.read_text(),quote=True)+'"')
   page.set_content(shell);frame=page.frame_locator('iframe');frame.locator('#skip').click(timeout=10000)
   frame.locator('aside').filter(has_text='RSVP pada halaman utama').wait_for(state='visible',timeout=10000)
   check(path.stem+' guest name',frame.locator('#invitation-data').evaluate('(el)=>JSON.parse(el.textContent).guest.name')=='Tamu Contoh')
   check(path.stem+' no local RSVP',frame.locator('form').count()==0)
   check(path.stem+' one outer form',page.locator('form').count()==1)
   page.select_option('[name=attendance]','yes');page.select_option('[name=count]','2');page.fill('[name=message]','Selamat!')
   check(path.stem+' form fields editable',page.locator('[name=count]').input_value()=='2' and page.locator('[name=message]').input_value()=='Selamat!')
   check(path.stem+' mobile no overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
   check(path.stem+' no pageerror',not errors)
   if path.stem=='secret-letter':
    page.locator('#rsvp').scroll_into_view_if_needed();page.screenshot(path=str(root/'guest-rsvp-390.png'))
   page.close()
  browser.close()
print(json.dumps({'passed':len(checks),'checks':checks,'scope':'in-memory fixture iframe, reduced motion, no HTTP or form submission'},indent=2))
