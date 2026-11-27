const encoder = new TextEncoder();
const bytes = value => encoder.encode(value);
const concat = chunks => { const size = chunks.reduce((n, part) => n + part.length, 0), out = new Uint8Array(size); let offset = 0; for (const part of chunks) { out.set(part, offset); offset += part.length; } return out; };

export function validateGuestName(value) {
  if (typeof value !== 'string') throw new Error('Nama tamu harus berupa teks.');
  const name = value.trim();
  if (!name) throw new Error('Masukkan nama tamu terlebih dahulu.');
  if (Array.from(name).length > 80) throw new Error('Nama tamu maksimal 80 karakter.');
  if (/[\u0000-\u001f\u007f]/u.test(name)) throw new Error('Nama tamu mengandung karakter yang tidak didukung.');
  return name;
}

export function personalizedUrl(base, guestName) {
  const url = new URL(base);
  url.searchParams.set('to', validateGuestName(guestName));
  return url.href;
}

export function invitationMessage(project, guestName, url) {
  const guest = validateGuestName(guestName);
  const d = project.data;
  const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(d.events.ceremony.start));
  return `Kepada ${guest},\n\nDengan penuh kebahagiaan, kami mengundang Anda untuk merayakan hari pernikahan kami.\n\n${d.couple.first} & ${d.couple.second}\n${date}\n\nBuka undangan kami melalui tautan berikut:\n${url}\n\nMerupakan kebahagiaan bagi kami apabila Anda berkenan hadir.\nSalam hangat,\n${d.couple.first} & ${d.couple.second}`;
}

export function sharingPage(project) {
  const couple = `${project.data.couple.first} & ${project.data.couple.second}`;
  const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(project.data.events.ceremony.start));
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const safe = value => JSON.stringify(value).replace(/[<>&]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><meta name="description" content="Bagikan undangan ${escapeHtml(couple)}"><title>Undangan ${escapeHtml(couple)} · AMPLOP</title><link rel="stylesheet" href="../share.css"></head><body><header><a href="./" class="brand">AMPLOP <span>WEDDING INVITATION</span></a></header><main><p class="eyebrow">DENGAN PENUH KEBAHAGIAAN</p><h1 id="couple"></h1><p class="date" id="date"></p><section><label for="guest">Undangan untuk</label><div class="input-row"><input id="guest" maxlength="80" autocomplete="name" placeholder="Nama tamu" aria-describedby="privacy error"><button id="clear" type="button" aria-label="Hapus nama tamu" title="Hapus nama">×</button></div><p id="error" role="alert"></p><label for="link">Tautan undangan pribadi</label><input id="link" readonly><div class="actions"><button id="copy-link" type="button">Salin tautan</button><a id="open" target="_blank" rel="noopener">Lihat undangan</a></div><label for="message">Pesan WhatsApp</label><textarea id="message" readonly rows="9"></textarea><div class="actions"><button id="copy-message" type="button">Salin pesan</button><a id="whatsapp" target="_blank" rel="noopener">Bagikan via WhatsApp</a></div><p id="notice" role="status"></p></section><p class="privacy" id="privacy">Nama pada tautan pribadi dapat terlihat di riwayat browser dan log. Tautan bukan perlindungan kerahasiaan daftar tamu. Halaman ini tidak menyimpan nama tamu.</p></main><footer>AMPLOP · MADE WITH CARE</footer><script>const couple=${safe(couple)},date=${safe(date)};document.getElementById('couple').textContent=couple;document.getElementById('date').textContent=date;const guest=document.getElementById('guest'),link=document.getElementById('link'),message=document.getElementById('message'),wa=document.getElementById('whatsapp'),open=document.getElementById('open'),error=document.getElementById('error'),notice=document.getElementById('notice');function update(){const name=guest.value.trim();error.textContent='';if(!name){link.value='';message.value='';wa.removeAttribute('href');open.href='../';return}if(Array.from(name).length>80||/[\\u0000-\\u001f\\u007f]/u.test(name)){error.textContent='Nama tamu maksimal 80 karakter dan tidak boleh memuat karakter kontrol.';link.value='';message.value='';wa.removeAttribute('href');return}const base=new URL('../',location.href);base.search='';base.hash='';const personalized=new URL(base.href);personalized.searchParams.set('to',name);link.value=personalized.href;open.href=personalized.href;message.value='Kepada '+name+',\\n\\nDengan penuh kebahagiaan, kami mengundang Anda untuk merayakan hari pernikahan kami.\\n\\n'+couple+'\\n'+date+'\\n\\nBuka undangan kami melalui tautan berikut:\\n'+personalized.href+'\\n\\nMerupakan kebahagiaan bagi kami apabila Anda berkenan hadir.\\nSalam hangat,\\n'+couple;wa.href='https://wa.me/?text='+encodeURIComponent(message.value)}guest.addEventListener('input',update);document.getElementById('clear').onclick=()=>{guest.value='';update();guest.focus()};async function copy(value){if(!value){notice.textContent='Masukkan nama tamu terlebih dahulu.';return}try{await navigator.clipboard.writeText(value);notice.textContent='Berhasil disalin.'}catch{notice.textContent='Penyalinan tidak tersedia di konteks ini. Buka melalui HTTPS atau gunakan halaman terpasang.'}}document.getElementById('copy-link').onclick=()=>copy(link.value);document.getElementById('copy-message').onclick=()=>copy(message.value);update();</script></body></html>`;
}

function crc32(data) { let crc = -1; for (const byte of data) { crc ^= byte; for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320); } return (crc ^ -1) >>> 0; }
function u16(n) { return [n & 255, n >>> 8 & 255]; }
function u32(n) { return [...u16(n), ...u16(n >>> 16)]; }
export function createStaticPackage(files) {
  const entries = Object.entries(files).map(([name, value]) => ({ name: bytes(name), data: typeof value === 'string' ? bytes(value) : value }));
  const locals = [], central = []; let offset = 0;
  for (const entry of entries) { const crc = crc32(entry.data), head = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(entry.data.length), ...u32(entry.data.length), ...u16(entry.name.length), ...u16(0)]); locals.push(head, entry.name, entry.data); const dir = new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(entry.data.length), ...u32(entry.data.length), ...u16(entry.name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]); central.push(dir, entry.name); offset += head.length + entry.name.length + entry.data.length; }
  const directory = concat(central), end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length), ...u32(directory.length), ...u32(offset), ...u16(0)]);
  return concat([...locals, directory, end]);
}