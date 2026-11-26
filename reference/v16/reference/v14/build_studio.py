from pathlib import Path
import json,base64,mimetypes
p=Path(__file__).resolve().parent
b={'data':json.loads((p/'invitation.json').read_text()),'registry':json.loads((p/'registry.json').read_text()),'shared':(p/'shared.js').read_text(),'audioRuntime':(p/'audio-runtime.js').read_text(),'templates':{f.stem:f.read_text() for f in (p/'templates').glob('*.html')},'assets':{f.name:'data:'+('audio/mpeg' if f.suffix=='.mp3' else mimetypes.guess_type(f.name)[0])+';base64,'+base64.b64encode(f.read_bytes()).decode() for f in (p/'assets').iterdir() if f.is_file()}}
text=json.dumps(b,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
(p/'amplop-studio-v13.html').write_text((p/'studio-shell.html').read_text().replace('__BUNDLE__',text).replace('__ENGINE__',(p/'typography.js').read_text()+'\n'+(p/'engine.js').read_text()).replace('__STUDIO__',(p/'studio.js').read_text()))
