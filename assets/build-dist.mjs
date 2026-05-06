import {mkdir, cp, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const assetsRoot = fileURLToPath(new URL('.', import.meta.url));
const distRoot = resolve(assetsRoot, 'dist');
const sourceFile = resolve(assetsRoot, 'scripts', 'collection-form-type.js');
const targetFile = resolve(distRoot, 'collection-form-type.js');

await rm(distRoot, {recursive: true, force: true});
await mkdir(distRoot, {recursive: true});
await cp(sourceFile, targetFile);
