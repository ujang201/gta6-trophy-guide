// Leonida Trophy Guide — the entry program for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is app/: plain static files a browser
// opens at app/index.html, offline, with the 55 trophies and their guides in
// app/data/trophies.json. This program hands it in: it copies app/ and
// screenshots/ from beside this file to the output directory and writes
// output/dossier.json with the kit's vendored library, so the judge can read
// the screenshots, the first load's files and the source. vendor/makefun-frontend.ts
// stays exactly as the kit shipped it: the scorer rebuilds the dossier with its
// own copy and the two must match byte for byte.
//
// Run it locally with MAKEFUN_OUTPUT_DIR set, e.g.:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two outputs are byte-identical.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps from the kit: at most 4 screenshots, each at most 256 KiB;
// app/ at most 993 files and 48 MiB. The dossier text is capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
