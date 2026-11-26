import {readFile} from 'node:fs/promises';
import {Engine} from '../cloud/v14-engine.mjs';
import {validateDraft} from '../cloud/draft.mjs';
let bundlePromise;
async function getBundle(){return bundlePromise??=readFile(process.cwd()+'/public/dashboard/bundle-v14.js','utf8').then(s=>JSON.parse(s.replace(/^const AMPlOP_V14_BUNDLE = /,'').replace(/;\s*$/,''))).catch(e=>{bundlePromise=undefined;throw e;});}
export async function renderInvitation(content,{publicView=false,weddingId,guest}={}){
 const draft=validateDraft(content);if(publicView){draft.data.id=weddingId??'published';draft.data.guest=guest??{id:'public',name:'Tamu Istimewa'};}
 const html=Engine.render(await getBundle(),draft.data,draft.slug,draft.settings,draft.uploads,draft.experience);
 // Strip only the audited, non-nested RSVP sections from the rendered trusted template. No guest submissions in V21.
 return html.replace(/<section\b[^>]*\bid="rsvp"[^>]*>[\s\S]*?<\/section>/,'').replace(/<a href="#rsvp">RSVP<\/a>/g,'').replace('</body>','<aside style="padding:12px;text-align:center;font:12px system-ui;background:#f7f1e7;color:#392d29">AMPLOP sandbox · '+(publicView?'Undangan uji publik':'Preview privat')+(guest?' · RSVP pada halaman utama':' · RSVP belum aktif')+'</aside></body>');
}
