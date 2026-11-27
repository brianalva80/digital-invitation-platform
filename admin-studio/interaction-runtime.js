(()=>{'use strict';
const audio=document.getElementById('amplop-audio');
if(audio&&!audio.dataset.v26Runtime){audio.dataset.v26Runtime='true';
 const playButton=document.querySelector('[data-music-play]'),volume=document.querySelector('[data-music-volume]'),status=document.querySelector('[data-music-status]');
 let target=volume?Number(volume.value):0.35;
 const sync=()=>{if(playButton){playButton.textContent=audio.paused?'Putar musik':'Jeda musik';playButton.setAttribute('aria-pressed',String(!audio.paused))}};
 const start=()=>{if(!audio.paused)return;audio.volume=target;if(status)status.textContent='';try{const result=audio.play();if(result?.catch)result.catch(error=>{if(status)status.textContent=error.name==='NotAllowedError'?'Browser memblokir pemutaran. Tekan Putar musik untuk mencoba lagi.':`Musik gagal diputar: ${error.message||'periksa file audio.'}`;sync()})}catch(error){if(status)status.textContent=`Musik gagal diputar: ${error.message||'periksa file audio.'}`;sync()}};
 const toggle=()=>{if(audio.paused)start();else audio.pause()};
 const expand=document.querySelector('[data-music-expand]'),options=document.getElementById('amplop-music-options'),mute=document.querySelector('[data-music-mute]');
 expand?.addEventListener('click',()=>{if(options){options.hidden=!options.hidden;expand.setAttribute('aria-expanded',String(!options.hidden))}});
 mute?.addEventListener('click',()=>{audio.muted=!audio.muted;mute.textContent=audio.muted?'Aktifkan suara':'Bisukan';mute.setAttribute('aria-pressed',String(audio.muted))});
 playButton?.addEventListener('click',toggle);
 volume?.addEventListener('input',()=>{target=Number(volume.value);if(!audio.paused)audio.volume=target});
 audio.addEventListener('play',()=>{if(status)status.textContent='';sync()});audio.addEventListener('pause',sync);audio.addEventListener('ended',sync);audio.addEventListener('error',()=>{const errors={1:'pemutaran dibatalkan',2:'kesalahan jaringan',3:'file audio gagal didekode',4:'format atau sumber audio tidak didukung'};if(status)status.textContent=`Audio error: ${errors[audio.error?.code]||'sumber audio tidak tersedia'}.`;sync()});
 const open=()=>{if(audio.dataset.open==='true')start()};
 document.getElementById('open')?.addEventListener('click',open);
 document.addEventListener('click',event=>{if(audio.dataset.open==='true'&&event.target.closest('#play,#seal'))start()});
 sync();
}
let storyCount=0;try{storyCount=window.AMPLOP_STORY_COUNT||0}catch{}
let chapters=[...document.querySelectorAll('[data-chapter],.scene-copy')];
if(!chapters.length)chapters=[...document.querySelectorAll('#story .chapter')];
if(storyCount&&chapters.length>storyCount)chapters=chapters.slice(0,storyCount);
const label=document.getElementById('chapterLabel'),fill=document.getElementById('chapterFill'),count=document.getElementById('chapterText'),bar=document.getElementById('progress');
if(chapters.length){
 const romans=['I','II','III','IV','V','VI','VII','VIII','IX','X'];let frame=0;
 const update=()=>{frame=0;const marker=innerHeight*.55;let active=0;chapters.forEach((chapter,index)=>{if(chapter.getBoundingClientRect().top<=marker)active=index});const total=chapters.length;
  if(label)label.textContent=`Chapter ${romans[active]||active+1} / ${romans[total-1]||total}`;
  if(fill)fill.style.width=`${(active+1)/total*100}%`;
  if(count)count.textContent=`${String(active+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
  document.querySelectorAll('[data-jump]').forEach((button,index)=>button.setAttribute('aria-current',String(index===active)));
  if(bar){const first=chapters[0].getBoundingClientRect().top,last=chapters[total-1].getBoundingClientRect().top;const progress=total<2?1:Math.max(0,Math.min(1,(marker-first)/(last-first)));bar.style.width=`${progress*100}%`}
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
}
})();