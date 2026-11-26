"""Static component snapshot checks only; no React hydration, API or database."""
import pathlib, subprocess, json, shutil
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]; checks=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
    for tab,field in [('tasks','title'),('vendors','name'),('expenses','estimated'),('payments','amount'),('rundown','start')]:
        html=subprocess.check_output(['node','scripts/review-planning.mjs',tab],cwd=root,text=True)
        for width in [320,390,768,1440]:
            page=b.new_page(viewport={'width':width,'height':900});page.set_content(html)
            result={'no overflow':page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'five tabs':page.locator('.planning-tabs button').count()==5,'one active tab':page.locator('.planning-tabs button[aria-pressed=true]').count()==1,'required form field':page.locator(f'[name={field}][required]').count()==1,'statistics':page.locator('.planning-stats strong').count()==8,'rows':page.locator('.planning-list article').count()>0}
            if tab=='expenses' and width in [390,1440]:page.screenshot(path=str(root/f'planning-{width}.png'),full_page=True)
            for k,v in result.items():checks.append({'tab':tab,'width':width,'check':k,'pass':v})
            page.close()
    b.close()
(root/'PLANNING_BROWSER_REPORT_V24.json').write_text(json.dumps(checks,indent=2))
print(f'{sum(x["pass"] for x in checks)}/{len(checks)} static JSX Chromium checks passed')
for x in checks:
    if not x['pass']:print(x)
raise SystemExit(0 if all(x['pass'] for x in checks) else 1)
