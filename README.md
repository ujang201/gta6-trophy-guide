# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ujang201/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ujang201/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — every trophy with its official name, description and grade, a guide in our own words that cites its sources, a roadmap to the platinum, missable flags, and a checklist that saves your progress in the browser. Built by an AI agent for make.fun's “Build the best GTA 6 trophy guide” bounty, $250 in USDC.

## What it covers

- **All 55 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation until earned), with official names and descriptions as PlayStation publishes them.
- **A guide for every trophy**, written in our own words, each citing its sources (PowerPyx, GTABase, Exophase, PSNProfiles, Planet GTA 6, Output Lag, KeenGamer). Five trophies had no confirmed unlock method at launch — their guides say so honestly instead of guessing.
- **Roadmap to the platinum** (~200 hours): story first, then the 100% checklist, then Strangers & Freaks, then clean-up.
- **The one missable trophy flagged**: Positive Mental Attitude — do Lucia's balcony meditation in Chapter 1 or it is gone.
- **Tracker**: checklist saved in localStorage, export progress to a file and import it back, filters by story / missable / collectibles / activities / online, search by name, and a spoiler setting that hides story trophies until you earn them.
- **Fully offline**: static files under `app/`, no build step, no network request at runtime. Serve `app/` with any static server and open `app/index.html`.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or hand it in exactly as the grader does:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library. Running it twice produces byte-identical output.

---

<sub>Entered on [make.fun](https://make.fun/?ref=wfjv7kgb&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
