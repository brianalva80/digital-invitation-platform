import { readFile, writeFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const demos = new URL('portfolio/demos/', root);
for (const file of await readdir(demos)) {
  if (!file.endsWith('.html')) continue;
  const path = new URL(file, demos);
  let html = await readFile(path, 'utf8');
  const marker = 'AMPLOP_V26_RUNTIME_SOURCE';
  if (!html.includes(marker)) continue;
  const start = html.lastIndexOf('<script>', html.indexOf(marker));
  const end = html.indexOf('</script></body>', html.indexOf(marker));
  if (start < 0 || end < 0) throw new Error(`Injected runtime boundary missing in ${file}`);
  html = html.slice(0, start) + html.slice(end + '</script>'.length);
  await writeFile(path, html);
}