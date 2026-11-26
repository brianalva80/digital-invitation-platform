/* AMPLOP V10: shared browser behavior; no network or production RSVP. */
(()=>{'use strict';
const data=JSON.parse(document.getElementById('invitation-data').textContent);
const $=s=>document.querySelector(s), pad=n=>String(n).padStart(2,'0');
const key=`amplop:v10:${data.id}:${data.guest.id}:rsvp`;
function countdown(){const min=Math.max(0,Math.floor((Date.parse(data.events.ceremony.start)-Date.now())/60000));const d=Math.floor(min/1440);if($('#days')){$('#days').textContent=d;$('#hours').textContent=pad(Math.floor(min/60)%24);$('#minutes').textContent=pad(min%60)}if($('#countdown'))$('#countdown').textContent=min?`${Math.ceil(min/1440)} hari menuju hari bahagia`:'Hari yang telah kami nantikan.'}
countdown();let timer=setInterval(countdown,15000);window.addEventListener('pagehide',()=>{clearInterval(timer);timer=0});window.addEventListener('pageshow',()=>{countdown();if(!timer)timer=setInterval(countdown,15000)});
const stamp=v=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const escapeICS=v=>String(v).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
function fold(line){let out='',n=0;for(const c of line){const len=new TextEncoder().encode(c).length;if(n+len>75){out+='\r\n ';n=1}out+=c;n+=len}return out}
function calendar(id){const e=data.events[id];if(!e)return;const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AMPLOP//V10 Demo//ID','BEGIN:VEVENT',`UID:${data.id}-${id}@amplop.example`, `DTSTAMP:${stamp(Date.now())}`,`DTSTART:${stamp(e.start)}`,`DTEND:${stamp(e.end)}`,`SUMMARY:${escapeICS(e.title+' — '+data.couple.first+' & '+data.couple.second+' (demo)')}`,`LOCATION:${escapeICS(e.venue+' — '+e.location)}`,'END:VEVENT','END:VCALENDAR'];const url=URL.createObjectURL(new Blob([lines.map(fold).join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`amplop-${id}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.querySelectorAll('.calendar[data-event]').forEach(b=>b.addEventListener('click',()=>calendar(b.dataset.event)));
const form=$('#rsvp form'),status=$('#status');if(!form)return;const name=form.elements.namedItem('name'),attendance=form.elements.namedItem('attendance'),message=form.elements.namedItem('message');
function valid(v){return v&&typeof v.name==='string'&&v.name.trim()&&v.name.length<=100&&['yes','no'].includes(v.attendance)&&typeof v.message==='string'&&v.message.length<=500}
function restore(){try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(valid(saved)){name.value=saved.name;attendance.value=saved.attendance;message.value=saved.message;status.textContent='Jawaban demo sebelumnya dimuat. Tidak dikirim kepada pengantin.'}}catch{}}
restore();form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const v={name:name.value.trim(),attendance:attendance.value,message:message.value.trim()};if(!valid(v)){status.textContent='Isi nama dan kehadiran dengan valid.';return}try{localStorage.setItem(key,JSON.stringify(v));status.textContent='Jawaban demo tersimpan di browser ini. Tidak dikirim kepada pengantin.'}catch{status.textContent='Penyimpanan browser tidak tersedia. Jawaban tidak tersimpan.'}});
$('#clear')?.addEventListener('click',()=>{try{localStorage.removeItem(key);form.reset();status.textContent='Jawaban demo dihapus.'}catch{status.textContent='Penyimpanan browser tidak tersedia. Jawaban belum dihapus.'}});
})();
