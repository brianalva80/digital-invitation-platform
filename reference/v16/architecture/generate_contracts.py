import json, pathlib, yaml
p=pathlib.Path(__file__).parent
s=lambda n:{'type':'string','minLength':1,'maxLength':n}
obj=lambda props:{'type':'object','properties':props,'required':list(props),'additionalProperties':False}
uid={'type':'string','format':'uuid'}
asset={'anyOf':[uid,{'enum':['demo:portrait','demo:walk','demo:window']}]}
slugs=['secret-letter','cinematic-romance','wedding-editorial','enchanted-garden','our-story']
dt={'type':'string','format':'date-time','pattern':r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+07:00$'}
event=obj({'title':s(500),'venue':s(500),'location':s(500),'start':dt,'end':dt})
settings=obj({'accentIndex':{'type':'integer','minimum':0,'maximum':2},'fontIndex':{'type':'integer','minimum':0,'maximum':2}})
audio=obj({'source':{'enum':['none','builtin','upload']},'track':{'anyOf':[uid,{'enum':['ivory-nocturne','golden-hour','garden-waltz',None]}]},'volume':{'type':'number','minimum':0,'maximum':1},'loop':{'type':'boolean'},'autoOnOpen':{'type':'boolean'}})
audio['allOf']=[{'if':{'properties':{'source':{'const':'none'}}},'then':{'properties':{'track':{'type':'null'}}}},{'if':{'properties':{'source':{'const':'builtin'}}},'then':{'properties':{'track':{'enum':['ivory-nocturne','golden-hour','garden-waltz']}}}},{'if':{'properties':{'source':{'const':'upload'}}},'then':{'properties':{'track':uid}}}]
schema=obj({'schemaVersion':{'const':1},'couple':obj({'first':s(100),'second':s(100)}),'city':s(100),'country':s(100),'timezone':{'const':'Asia/Jakarta'},'events':obj({'ceremony':event,'reception':event}),'story':{'type':'array','minItems':3,'maxItems':3,'items':obj({'year':s(500),'text':s(500),'note':s(500)})},'photos':obj({k:asset for k in ['portrait','walk','window']}),'templateKey':{'enum':slugs},'templateSettings':obj({k:settings for k in slugs}),'audio':audio})
schema.update({'$schema':'https://json-schema.org/draft/2020-12/schema','title':'AMPLOP V15 publish candidate (proposed, not a draft schema)','description':'Semantic checks (calendar date and order, ownership, asset status, rights, quotas, no whitespace-only values) must run server-side in addition to schema validation. Demo references are staging only.'})
(p/'DATA_CONTRACT.json').write_text(json.dumps(schema,indent=2)+'\n')
base=json.loads(pathlib.Path('/mnt/data/AMPLOP_review_v14/invitation.json').read_text()); base.pop('id');base.pop('guest');base['photos']={k:'demo:'+k for k in base['photos']};base.update(templateKey=slugs[0],templateSettings={k:{'accentIndex':0,'fontIndex':0} for k in slugs},audio={'source':'builtin','track':'ivory-nocturne','volume':0.5,'loop':True,'autoOnOpen':True});(p/'SAMPLE_PUBLISH.json').write_text(json.dumps(base,indent=2,ensure_ascii=False)+'\n')
# Contract-level endpoint list. Detailed response payloads intentionally deferred to implementation.
paths={}; operations=[
('POST','/weddings','createWedding','owner-session', 'Create wedding and initial draft',obj({'slug':s(80)}),201),
('GET','/weddings/{weddingId}/draft','readDraft','member-session','Read private draft and revision',None,200),
('PUT','/weddings/{weddingId}/draft','saveDraft','editor-session','CAS save partial draft; 409 if revision stale',obj({'expectedRevision':{'type':'integer','minimum':1},'content':{'type':'object'}}),200),
('POST','/weddings/{weddingId}/assets/intents','createUploadIntent','editor-session','Constrained private upload intent',obj({'kind':{'enum':['photo','audio','video']},'bytes':{'type':'integer','minimum':1},'mime':s(100),'rightsAttested':{'const':True}}),201),
('POST','/weddings/{weddingId}/assets/{assetId}/complete','completeUpload','editor-session','Enqueue server validation; never mark ready from client',None,202),
('GET','/weddings/{weddingId}/assets/{assetId}','readAssetStatus','member-session','Read asset processing state',None,200),
('POST','/weddings/{weddingId}/orders','createOrder','owner-session','Server priced sandbox order',obj({'idempotencyKey':s(100)}),201),
('GET','/weddings/{weddingId}/orders/{orderId}','readOrder','owner-session','Read normalized payment status',None,200),
('POST','/payments/midtrans/webhook','paymentWebhook','provider-signature','Verify signature plus provider status; atomic idempotent payment update',{'type':'object'},200),
('POST','/weddings/{weddingId}/publish','publishWedding','owner-session','Lock and publish validated revision if entitled',obj({'expectedRevision':{'type':'integer','minimum':1}}),201),
('POST','/weddings/{weddingId}/unpublish','unpublishWedding','owner-session','Remove active publication access',None,200),
('GET','/weddings/{weddingId}/guests','listGuests','editor-session','Private guest list; paginate',None,200),
('POST','/weddings/{weddingId}/guests','createGuest','editor-session','Create guest with party limit',obj({'name':s(100),'partyLimit':{'type':'integer','minimum':1,'maximum':100}}),201),
('POST','/weddings/{weddingId}/guests/{guestId}/rotate-token','rotateGuestToken','editor-session','Issue raw token once; invalidate old token',None,201),
('POST','/invitations/{slug}/session','exchangeGuestToken','public-rate-limited','Exchange opaque token for scoped cookie',obj({'token':s(200)}),200),
('GET','/invitations/{slug}','getPublication','public-or-guest-session','Return allowlisted publication projection only',None,200),
('PUT','/invitations/{slug}/rsvp','saveRsvp','guest-session','Upsert RSVP for session guest only; validate deadline and party limit',obj({'attendance':{'enum':['yes','no']},'partyCount':{'type':'integer','minimum':0,'maximum':100},'message':{'type':'string','maxLength':500}}),200)]
import re
for method,path,op,role,desc,body,code in operations:
    a={'operationId':op,'summary':desc,'x-authorization':role,'responses':{str(code):{'description':'Success; response fields finalized after repo audit'},**{str(i):{'description':d} for i,d in [(400,'Malformed'),(401,'Unauthenticated'),(403,'Forbidden'),(404,'Not found'),(409,'Conflict'),(413,'Too large'),(422,'Validation error'),(429,'Rate limited')]}}}
    if role.endswith('session') and role!='public-or-guest-session':a['security']=[{'guestCookie' if role=='guest-session' else 'ownerCookie':[]}]
    params=[{'name':n,'in':'path','required':True,'schema':{'type':'string',**({'format':'uuid'} if n.endswith('Id') else {})}} for n in re.findall(r'{(\w+)}',path)]
    if params:a['parameters']=params
    if body is not None:a['requestBody']={'required':True,'content':{'application/json':{'schema':body}}}
    paths.setdefault(path,{})[method.lower()]=a
api={'openapi':'3.1.0','info':{'title':'AMPLOP V15 proposed API contract','version':'0.15.0','description':'Planning only; no live endpoints. Response models and precise provider payload mapping remain integration work. Cookie-auth routes require CSRF protection.'},'servers':[{'url':'/api/v1'}],'paths':paths,'components':{'securitySchemes':{'ownerCookie':{'type':'apiKey','in':'cookie','name':'amplop_session'},'guestCookie':{'type':'apiKey','in':'cookie','name':'amplop_guest'}}}}
(p/'API_CONTRACT.yaml').write_text(yaml.safe_dump(api,sort_keys=False,allow_unicode=True))
