"""Optional legacy QA runner: run only on an approved test machine. Never edits reference."""
from pathlib import Path
import argparse, json, re, shutil, subprocess, sys, tempfile
p=argparse.ArgumentParser();p.add_argument('--suite',choices=['focused','all'],default='focused');p.add_argument('--output',required=True,help='New directory outside the package for test output');a=p.parse_args()
root=Path(__file__).resolve().parents[1]; out=Path(a.output).resolve();assert not out.is_relative_to(root),'Use output outside the immutable package';out.mkdir(parents=True,exist_ok=False)
suites=[('test_v14.py',61,'QA_V14.txt')]
if a.suite=='all':suites += [('test_regression.py',48,'REGRESSION_V12.txt'),('test_v13.py',73,'QA_V13.txt'),('extended_qa/extended_qa.py',58,'extended_qa/results.json')]
summary=[]
with tempfile.TemporaryDirectory() as tmp:
    for script,expected,report in suites:
        work=Path(tmp)/Path(script).stem;shutil.copytree(root/'reference/v14',work)
        (work/report).unlink(missing_ok=True)
        try:
            r=subprocess.run([sys.executable,script],cwd=work,capture_output=True,text=True,timeout=300); log=r.stdout+'\n'+r.stderr; code=r.returncode
        except subprocess.TimeoutExpired as e:
            log='Timed out after 300s';code=124
        (out/(Path(script).stem+'.log')).write_text(log)
        report_path=work/report; passed=failed=blocked=0
        if report_path.exists():
            shutil.copy2(report_path,out/Path(report).name)
            if report.endswith('.json'):
                checks=json.loads(report_path.read_text())['checks'];passed=sum(x['status']=='PASS' for x in checks);failed=sum(x['status']=='FAIL' for x in checks);blocked=sum(x['status']=='BLOCKED' for x in checks)
            else:
                lines=report_path.read_text().splitlines();passed=sum(x.startswith('PASS ') for x in lines);failed=sum(x.startswith('FAIL ') for x in lines)
        ok=code==0 and passed==expected and failed==0
        summary.append(dict(suite=script,expected=expected,passed=passed,failed=failed,blocked=blocked,exit=code,result='PASS_IN_SCOPE' if ok else 'FAIL_OR_BLOCKED'))
(out/'summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2));sys.exit(0 if all(x['result']=='PASS_IN_SCOPE' for x in summary) else 1)
