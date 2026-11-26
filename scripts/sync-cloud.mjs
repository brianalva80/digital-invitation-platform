import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),ref=new URL('reference/v16/reference/v14/',root);
await writeFile(new URL('lib/cloud/v14-engine.mjs',root),(await readFile(new URL('typography.js',ref),'utf8'))+'\n'+(await readFile(new URL('engine.js',ref),'utf8'))+'\nexport {Engine,Typography};\n');
