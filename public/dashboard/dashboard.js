/* V19 local workspace. V14 remains the sole editor; never interpret localStorage as production data. */
(()=>{'use strict';
const $=id=>document.getElementById(id),key='amplop:studio:v12:draft',legacy='amplop:studio:v11:draft';
let bundle=null,ready=false,activeRaw=null,state=null,origin='demo',previewInvoker=null;
function status(message){$('storage-status').textContent=message}
function load(){
  let raw;try{raw=localStorage.getItem(key);origin='saved';if(raw===null){raw=localStorage.getItem(legacy);origin=raw===null?'demo':'legacy'}activeRaw=raw;
    if(raw===null){state={data:structuredClone(bundle.data),slug:Object.keys(bundle.registry)[0],settings:{},uploads:{},mode:'mobile',experience:{fonts:{},music:{track:'none',volume:.35,onOpen:false,upload:'',filename:''}}};return true}
    const parsed=JSON.parse(raw);Engine.validate(parsed.data);if(!Object.hasOwn(bundle.registry,parsed.slug))throw Error('Desain tidak dikenal');state=parsed;return true;
  }catch{state=null;origin='error';return false}
}
function draw(){
 const list=$('templates');list.replaceChildren();$('preview').disabled=!state;
 if(!state){$('couple').textContent='Draft tidak dapat dimuat';$('wedding-date').textContent='Buka Studio untuk memeriksa data lokal.';$('draft-state').textContent='Perlu diperiksa';$('draft-note').textContent='Data lokal tidak diubah';$('countdown').textContent='—';$('template-title').textContent='—';$('template-image').hidden=true;status('Draft rusak atau penyimpanan browser tidak tersedia. Tidak ada data yang ditimpa.');}
 else {const d=state.data; $('couple').textContent=d.couple.first+' & '+d.couple.second;$('wedding-date').textContent=new Intl.DateTimeFormat('id-ID',{dateStyle:'full',timeZone:'Asia/Jakarta'}).format(new Date(d.events.ceremony.start))+' · '+d.city;
 $('draft-state').textContent=origin==='demo'?'Data contoh':'Tersimpan lokal';$('draft-note').textContent=origin==='legacy'?'Draft versi lama':'Tidak dipublikasikan';const delta=Date.parse(d.events.ceremony.start)-Date.now();$('countdown').textContent=delta>0?Math.ceil(delta/86400000)+' hari':'Hari acara / lewat';$('template-title').textContent=bundle.registry[state.slug].label;$('template-image').hidden=false;$('template-image').src='./showcase/'+state.slug+'.webp';status(origin==='demo'?'Belum ada draft tersimpan. Mulai dari data contoh; pilih desain atau simpan draft di Studio.':'Draft lokal dimuat. Perubahan Studio muncul di sini setelah menekan Simpan draft. Jangan edit draft bersamaan di beberapa tab.');}
 for(const [slug,item] of Object.entries(bundle.registry)){const card=document.createElement('article'),im=document.createElement('img'),h=document.createElement('h3'),btn=document.createElement('button');const chosen=state?.slug===slug;card.className='template'+(chosen?' selected':'');im.src='./showcase/'+slug+'.webp';im.alt='Contoh '+item.label;im.loading='lazy';h.textContent=item.label;btn.type='button';btn.className='button outline';btn.textContent=chosen?'Terpilih':'Pilih desain';btn.setAttribute('aria-label',(chosen?'Terpilih: ':'Pilih ')+item.label);btn.setAttribute('aria-pressed',String(chosen));btn.disabled=!state||chosen;btn.addEventListener('click',()=>choose(slug));card.append(im,h,btn);list.append(card)}
}
function choose(slug){if(!state||!Object.hasOwn(bundle.registry,slug))return;
 try{const latest=localStorage.getItem(key),raw=latest===null?localStorage.getItem(legacy):latest;if(raw!==activeRaw){refresh();status('Draft berubah di tab lain. Data terbaru dimuat; pilih desain kembali.');return}
 const next={...state,slug};Engine.validate(next.data);localStorage.setItem(key,JSON.stringify(next));refresh();status('Desain diganti dan draft disimpan lokal. Konten, foto, pengaturan desain dan musik tetap tersimpan.');
 }catch{status('Gagal menyimpan desain. Draft sebelumnya tidak diubah; periksa kapasitas penyimpanan browser.')}
}
function refresh(){if(!ready)return;load();draw()}
$('preview').addEventListener('click',()=>{if(!state)return;try{const {data,slug,settings,uploads,experience}=state;const html=Engine.render(bundle,data,slug,settings||{},uploads||{},experience||{});const iframe=document.createElement('iframe');iframe.title='Preview '+bundle.registry[slug].label;iframe.setAttribute('sandbox','allow-scripts allow-downloads');iframe.srcdoc=html;$('preview-frame').replaceChildren(iframe);$('preview-heading').textContent=bundle.registry[slug].label;previewInvoker=document.activeElement;$('preview-dialog').showModal();$('close-preview').focus()}catch{status('Preview gagal dirender. Periksa draft melalui Studio.')}});
$('close-preview').addEventListener('click',()=>$('preview-dialog').close());$('preview-dialog').addEventListener('close',()=>{$('preview-frame').replaceChildren();previewInvoker?.focus()});
window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);window.addEventListener('storage',e=>{if(e.key===key||e.key===legacy||e.key===null)refresh()});
try{bundle=AMPlOP_V14_BUNDLE;Engine.validate(bundle.data);ready=true;refresh()}catch{status('Workspace tidak dapat memuat engine/data demo. Ekstrak paket lengkap atau buka Studio langsung.')}
})();
