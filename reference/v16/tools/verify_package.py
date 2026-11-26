"""Read-only bundle checks; build and contract tests use a disposable copy."""
from pathlib import Path
import csv, hashlib, json, shutil, subprocess, sys, tempfile
P=Path(__file__).resolve().parents[1]; V=P/'reference/v14'; A=P/'architecture'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def run(args,cwd):
    r=subprocess.run(args,cwd=cwd,capture_output=True,text=True,check=True); print(r.stdout.strip())
    return r.stdout
rows=list(csv.DictReader((V/'ASSET_REVIEW_V14.csv').open()))
for r in rows:
    f=V/'assets'/r['file']; assert f.stat().st_size==int(r['bytes']) and sha(f)==r['sha256'],f
print(f'PASS: {len(rows)} asset sizes and SHA-256 hashes')
reg=json.loads((V/'registry.json').read_text()); assert len(reg)==5 and all((V/x['file']).is_file() for x in reg.values()); print('PASS: five registered template source files')
assert (V/'amplop-studio-v13.html').read_bytes()==(V/'amplop-studio-v14.html').read_bytes(); print('PASS: legacy alias and V14 demo byte-identical')
for f in list(V.glob('*.js')):run(['node','--check',str(f)],V)
print('PASS: syntax check for '+str(len(list(V.glob('*.js'))))+' top-level JavaScript files')
for f in list(V.rglob('*.py'))+list(A.glob('*.py'))+list((P/'tools').glob('*.py')):compile(f.read_text(),str(f),'exec')
print('PASS: Python syntax (test/build/verification scripts)')
with tempfile.TemporaryDirectory() as tmp:
    work=Path(tmp)/'v14'; shutil.copytree(V,work); run([sys.executable,'build_studio.py'],work)
    assert (work/'amplop-studio-v13.html').read_bytes()==(V/'amplop-studio-v14.html').read_bytes(),'Build differs from archived V14'
    print('PASS: reference rebuild byte-identical to archived V14')
    work=Path(tmp)/'architecture';shutil.copytree(A,work);run([sys.executable,'verify_contracts.py'],work)
if (P/'MANIFEST.sha256').exists():
    for line in (P/'MANIFEST.sha256').read_text().splitlines():
        expected,rel=line.split('  ',1); assert sha(P/rel)==expected,rel
    print('PASS: package SHA-256 manifest')
print('NOT RUN: browser QA, web staging, native storage, database, payment, original repo audit. No production readiness claim.')
