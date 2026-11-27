import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'portfolio');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const configSource = await readFile(path.join(root, 'config.js'), 'utf8');
const siteSource = await readFile(path.join(root, 'site.js'), 'utf8');
const config = Function('window', `${configSource}; return window.AMPLOP_PORTFOLIO;`)({});
const designs = [
  ['The Secret Letter', 'secret-letter'],
  ['Cinematic Romance', 'cinematic-romance'],
  ['The Wedding Editorial', 'wedding-editorial'],
  ['The Enchanted Garden', 'enchanted-garden'],
  ['Our Story', 'our-story'],
];

test('portfolio has exactly five named designs with preview, demo, and order links', async () => {
  assert.equal((html.match(/class="template-card /g) || []).length, 5);
  for (const [name, slug] of designs) {
    assert.ok(html.includes(`<h3>${name}</h3>`), `missing ${name}`);
    assert.ok(html.includes(`assets/${slug}.webp`), `missing preview for ${name}`);
    assert.ok(html.includes(`demos/${slug}.html`), `missing demo for ${name}`);
    assert.ok(html.includes(`data-design="${name}"`), `missing order CTA for ${name}`);
    await stat(path.join(root, 'demos', `${slug}.html`));
    await stat(path.join(root, 'assets', `${slug}.webp`));
  }
  await stat(path.join(root, 'assets', 'hero.webp'));
});

test('WhatsApp integration uses centralized number and exact encoded message templates', () => {
  assert.equal(config.whatsappNumber, '6285786755308');
  assert.equal(config.whatsappBaseUrl, 'https://wa.me/6285786755308');
  assert.equal(config.orderMessage('The Secret Letter'), 'Halo AMPLOP, saya tertarik dengan desain The Secret Letter. Boleh konsultasi mengenai harga dan proses pemesanan?');
  assert.equal(config.orderMessage('Cinematic Romance'), 'Halo AMPLOP, saya tertarik dengan desain Cinematic Romance. Boleh konsultasi mengenai harga dan proses pemesanan?');
  assert.equal(config.orderMessage('The Wedding Editorial'), 'Halo AMPLOP, saya tertarik dengan desain The Wedding Editorial. Boleh konsultasi mengenai harga dan proses pemesanan?');
  assert.equal(config.orderMessage('The Enchanted Garden'), 'Halo AMPLOP, saya tertarik dengan desain The Enchanted Garden. Boleh konsultasi mengenai harga dan proses pemesanan?');
  assert.equal(config.orderMessage('Our Story'), 'Halo AMPLOP, saya tertarik dengan desain Our Story. Boleh konsultasi mengenai harga dan proses pemesanan?');
  assert.match(config.generalMessage, /^Halo AMPLOP,.*konsultasi.*proses pemesanan\?$/);
  assert.match(siteSource, /encodeURIComponent\(message\)/);
  assert.match(siteSource, /config\.whatsappBaseUrl/);
});

test('public portfolio excludes editing, account, payment, and private configuration artifacts', async () => {
  const files = await readdir(root, { recursive: true });
  const publicFiles = files.map(String).join('\n');
  assert.doesNotMatch(publicFiles, /(^|\/)(admin|studio|dashboard|account|api|drafts?)(\/|\.|$)/i);
  assert.doesNotMatch(publicFiles, /(^|\/)(\.env[^/]*|supabase|credentials?)(\/|\.|$)/i);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.ok(hrefs.every(href => !/\b(login|register|signup|dashboard|studio|editor|payment|checkout)(?:\.html|\/|$)/i.test(href)));
  const whatsappLinks = [...html.matchAll(/<a\b[^>]*class="[^"]*whatsapp-link[^"]*"[^>]*href="([^"]+)"/g)];
  assert.ok(whatsappLinks.length >= 7);
  assert.ok(whatsappLinks.every(([, href]) => href === config.whatsappBaseUrl));
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /RSVP demo hanya simulasi lokal/);
  for (const file of files.map(String)) {
    if (!file.endsWith('.html')) continue;
    const page = await readFile(path.join(root, file), 'utf8');
    assert.match(page, /name="robots"[^>]+content="noindex,nofollow"/i, `${file} should remain noindex`);
  }
});

test('all internal navigation fragments resolve and local references stay inside portfolio', async () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(target), `missing #${target}`);
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|#|data:|mailto:|tel:)/i.test(ref)) continue;
    assert.ok(!ref.startsWith('/'), `absolute root reference ${ref}`);
    await stat(path.join(root, ref));
  }
});

test('all bundled invitation demos label RSVP as a local simulation and use fictional data', async () => {
  for (const [, slug] of designs) {
    const demo = await readFile(path.join(root, 'demos', `${slug}.html`), 'utf8');
    assert.match(demo, /DEMO · RSVP lokal/);
    assert.match(demo, /Adrian/);
    assert.match(demo, /Clara/);
    assert.match(demo, /amplop-demo-001/);
    assert.match(demo, /Content-Security-Policy/);
  }
});