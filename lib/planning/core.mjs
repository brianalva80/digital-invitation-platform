// V24: pure shared validation and accounting. All money is integer IDR.
const MAX=1_000_000_000_000;
const fail=m=>{throw Error(m);};
const object=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))fail('Struktur rencana tidak valid.');return v;};
const text=(v,n,required=false)=>{if(typeof v!=='string'||v.length>n||/[\u0000-\u001f\u007f]/.test(v)||(required&&!v.trim()))fail('Teks tidak valid.');return v.trim();};
const id=v=>{if(typeof v!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v))fail('ID tidak valid.');return v;};
const money=v=>{if(!Number.isSafeInteger(v)||v<0||v>MAX)fail('Nominal IDR tidak valid.');return v;};
const date=(v,optional=false)=>{if(optional&&v==='')return v;if(typeof v!=='string'||!/^20\d\d-\d{2}-\d{2}$/.test(v))fail('Tanggal tidak valid.');const d=new Date(v+'T00:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==v)fail('Tanggal tidak valid.');return v;};
const time=v=>{if(typeof v!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v))fail('Waktu WIB tidak valid.');return v;};
const choice=(v,options)=>options.includes(v)?v:fail('Status tidak valid.');
const rows=(v,max,parse)=>{if(!Array.isArray(v)||v.length>max)fail('Batas jumlah baris terlampaui.');const result=v.map(parse);if(new Set(result.map(x=>x.id)).size!==result.length)fail('ID ganda.');return result;};
export const emptyPlan=()=>({schema:1,target:0,tasks:[],vendors:[],expenses:[],payments:[],rundown:[]});
export function validatePlan(raw){
 const p=object(raw,['schema','target','tasks','vendors','expenses','payments','rundown']);if(p.schema!==1)fail('Versi rencana tidak didukung.');
 const tasks=rows(p.tasks,200,x=>{object(x,['id','title','due','assignee','status']);return {id:id(x.id),title:text(x.title,120,true),due:date(x.due,true),assignee:text(x.assignee,100),status:choice(x.status,['todo','doing','done'])};});
 const vendors=rows(p.vendors,100,x=>{object(x,['id','name','category','contact','status','note']);return {id:id(x.id),name:text(x.name,120,true),category:text(x.category,80,true),contact:text(x.contact,160),status:choice(x.status,['shortlist','contacted','booked','completed']),note:text(x.note,300)};});
 const expenses=rows(p.expenses,200,x=>{object(x,['id','title','category','vendor','estimated','actual']);return {id:id(x.id),title:text(x.title,120,true),category:text(x.category,80,true),vendor:x.vendor===''?'':id(x.vendor),estimated:money(x.estimated),actual:x.actual===null?null:money(x.actual)};});
 const payments=rows(p.payments,300,x=>{object(x,['id','expense','date','amount','note']);const amount=money(x.amount);if(!amount)fail('Pembayaran harus lebih dari nol.');return {id:id(x.id),expense:id(x.expense),date:date(x.date),amount,note:text(x.note,160)};});
 const rundown=rows(p.rundown,200,x=>{object(x,['id','date','start','end','title','pic','location']);const start=time(x.start),end=time(x.end);if(end<=start)fail('Waktu selesai harus setelah mulai pada hari yang sama.');return {id:id(x.id),date:date(x.date),start,end,title:text(x.title,120,true),pic:text(x.pic,100),location:text(x.location,120)};});
 const vendorIds=new Set(vendors.map(v=>v.id));const expenseMap=new Map(expenses.map(e=>[e.id,e]));const paid=new Map();
 for(const e of expenses)if(e.vendor&&!vendorIds.has(e.vendor))fail('Vendor masih dirujuk atau tidak tersedia.');
 for(const t of payments){if(!expenseMap.has(t.expense))fail('Pos biaya masih memiliki pembayaran atau tidak tersedia.');paid.set(t.expense,(paid.get(t.expense)||0)+t.amount);}
 for(const e of expenses)if(e.actual!==null&&(paid.get(e.id)||0)>e.actual)fail('Pembayaran melebihi biaya aktual.');
 return {schema:1,target:money(p.target),tasks,vendors,expenses,payments,rundown};
}
export function summary(p){const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);const paidBy=new Map();for(const t of p.payments)paidBy.set(t.expense,(paidBy.get(t.expense)||0)+t.amount);const estimated=sum(p.expenses,x=>x.estimated),actual=sum(p.expenses,x=>x.actual??0),paid=sum(p.payments,x=>x.amount),projected=sum(p.expenses,x=>x.actual??Math.max(x.estimated,paidBy.get(x.id)||0));return {estimated,actual,paid,projected,remaining:p.target-projected,outstanding:projected-paid,unknownActual:p.expenses.filter(x=>x.actual===null).length,done:p.tasks.filter(x=>x.status==='done').length,total:p.tasks.length};}
export function sortedRundown(p){return [...p.rundown].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start)||a.id.localeCompare(b.id));}
export function overlaps(p){const r=sortedRundown(p),out=[];for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length&&r[j].date===r[i].date&&r[j].start<r[i].end;j++)out.push([r[i].id,r[j].id]);return out;}
const csvCell=v=>'"'+(typeof v==='number'?String(v):String(v??'').replace(/^[\s]*[=+\-@]/,m=>"'"+m)).replace(/"/g,'""')+'"';
export function exportPlan(p){p=validatePlan(p);const s=summary(p),vendors=new Map(p.vendors.map(v=>[v.id,v.name])),expenses=new Map(p.expenses.map(e=>[e.id,e.title]));const rows=[['section','title','category','date','start_wib','end_wib','pic','status','vendor','estimated_idr','actual_idr','paid_idr','detail'],['summary','Target','','','','','','','','','','',p.target],['summary','Projected','','','','','','','','','','',s.projected],['summary','Remaining','','','','','','','','','','',s.remaining],['summary','Outstanding','','','','','','','','','','',s.outstanding]];
 for(const x of p.tasks)rows.push(['task',x.title,'',x.due,'','',x.assignee,x.status]);for(const x of p.vendors)rows.push(['vendor',x.name,x.category,'','','','',x.status,'','','','',x.contact+' | '+x.note]);for(const x of p.expenses)rows.push(['expense',x.title,x.category,'','','','','',vendors.get(x.vendor)||'',x.estimated,x.actual,p.payments.filter(t=>t.expense===x.id).reduce((s,t)=>s+t.amount,0)]);for(const x of p.payments)rows.push(['payment',expenses.get(x.expense),'',x.date,'','','','','','','',x.amount,x.note]);for(const x of sortedRundown(p))rows.push(['rundown',x.title,'',x.date,x.start,x.end,x.pic,'','','','','',x.location]);return '\uFEFF'+rows.map(r=>Array.from({length:13},(_,i)=>csvCell(r[i])).join(',')).join('\r\n');}
