# Workshop Trials

Three polished, non-computing Zach-like vertical slices built as a comparative playtest instrument:

- **Coldwater Junction** — design compact railroad yards whose spring turnouts sort complete cuts of cars.
- **Bellweather Bindery** — fold, trim, and stitch printed sheets until they physically match an approved dummy.
- **The Orpheum Fly Loft** — route orthogonal lift lines, select pulley ratios, and balance theatrical scenery.

Each prototype includes **10 authored puzzles**, a tiny deterministic toolset, a self-contained period story, persistent local progress, undo/redo, keyboard shortcuts, sound feedback, and an expert evaluation form. A shared launcher exports all playtest notes as JSON.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

Production check:

```bash
npm run check
npm run build
npm run preview
```

Browser tests:

```bash
npx playwright install chromium
npm run test:e2e
```

## Direct routes

The launcher is at `#/`. Each prototype and puzzle can be opened directly:

```text
#/rail/1
#/bindery/1
#/rigging/1
```

Puzzle numbers run from 1 through 10.

## Playtest protocol

1. Play at least three work orders in each prototype.
2. Judge the *act of building* before judging content quantity.
3. Record hesitation, misclicks, unwanted movement, and whether revision feels safer than restarting.
4. Use **Rate this prototype** and export the notebook from the launcher.

No accounts, network calls, analytics, or external services are used. Progress and notes stay in browser `localStorage` until exported or cleared.

## Design constraints

- Small, fixed vocabulary; complexity comes from composition.
- Deterministic simulation with explicit failure messages.
- Outcome specifications rather than prescribed procedures.
- Stable workspace geometry: tool changes, status changes, and sound toggles do not move the workbench.
- Original vector/CSS art with no externally licensed runtime assets.

See [Design Notes](docs/DESIGN_NOTES.md), [Asset Strategy](docs/ASSET_STRATEGY.md), and [Playtest Guide](docs/PLAYTEST_GUIDE.md).
