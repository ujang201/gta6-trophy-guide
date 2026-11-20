// Leonida Trophy Guide — entrypoint for gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is plain static files in app/ (index.html, style.css, app.js and
// data/trophies.json), plus 3-4 screenshots of the app in screenshots/. This program
// hands them in: it copies app/ and screenshots/ from beside this file into the
// output directory and writes output/dossier.json, the summary the judge reads
// (the screenshots, the first load's files and bytes, and the source), built with
// the vendored make.fun library. Leave vendor/makefun-frontend.ts as it is: the
// scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two outputs are byte-identical.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function handInGuide() {
  const appDir = join(repoRoot, "app");
  const shotsDir = join(repoRoot, "screenshots");
  if (!existsSync(join(appDir, "index.html"))) {
    throw new Error("app/index.html is missing — the guide cannot be handed in without it.");
  }
  if (!existsSync(join(appDir, "data", "trophies.json"))) {
    throw new Error("app/data/trophies.json is missing — the guide cannot be handed in without its trophy data.");
  }
  const shotFiles = readdirSync(shotsDir).filter((name) => /\.(png|jpe?g)$/i.test(name));
  if (shotFiles.length < 3 || shotFiles.length > 4) {
    throw new Error("screenshots/ must hold 3 or 4 images, found " + shotFiles.length + ".");
  }
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  cpSync(appDir, join(outputDir, "app"), { recursive: true });
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, "dossier.json"), dossier);
  console.log("Wrote " + outputDir + "/dossier.json (" + dossier.length + " bytes).");
}

handInGuide();
