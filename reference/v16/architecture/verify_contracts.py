import json,yaml,copy,pathlib, re
from jsonschema import Draft202012Validator,FormatChecker
p=pathlib.Path(__file__).parent
schema=json.loads((p/'DATA_CONTRACT.json').read_text()); sample=json.loads((p/'SAMPLE_PUBLISH.json').read_text()); Draft202012Validator.check_schema(schema);v=Draft202012Validator(schema,format_checker=FormatChecker());v.validate(sample); print('PASS: JSON Schema meta-validation and sample publish payload')
for label,mutate in [('unknown template',lambda x:x.update(templateKey='bad')),('missing chapter',lambda x:x['story'].pop()),('wrong timezone',lambda x:x.update(timezone='UTC')),('invalid audio ref',lambda x:x['audio'].update(source='upload')),('invalid font index',lambda x:x['templateSettings']['our-story'].update(fontIndex=7)),('guest injection',lambda x:x.update(guest={'name':'unexpected'})),('bad date',lambda x:x['events']['ceremony'].update(start='2027-02-30T10:00:00+07:00'))]:
    x=copy.deepcopy(sample);mutate(x);assert not v.is_valid(x),label;print('PASS: rejects '+label)
a=yaml.safe_load((p/'API_CONTRACT.yaml').read_text());ids=[]
for path,methods in a['paths'].items():
    for m,op in methods.items():
        ids.append(op['operationId']);assert set(re.findall(r'{(\w+)}',path))=={x['name'] for x in op.get('parameters',[])};assert op['responses'];assert op['x-authorization']
assert len(ids)==len(set(ids));print(f'PASS: YAML parse, unique operation IDs, path parameter coverage and auth annotations ({len(ids)} operations)')
print('NOT RUN: PostgreSQL migration, actual endpoints, payment sandbox, RLS/tenant enforcement, browser/deployment. No PostgreSQL executable available. API check is structural, not full OpenAPI validation.')
