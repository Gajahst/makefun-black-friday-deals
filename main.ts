// main.ts: hands Lowtide in. Copies the static site (app/) and its screenshots to the output folder and writes
// dossier.json with the vendored make.fun library, which must stay unchanged. Node 22+, standard library only.
// Locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(name: string): void {
  const from = join(root, name);
  const to = join(outDir, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyFolder('app');
copyFolder('screenshots');

const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};
writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, limits));
