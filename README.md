# Workshop Trials

Three deliberately minimal, non-computing Zach-like vertical slices for expert playtesting.

- **Coldwater Junction** — automatic railway classification using one alternating spring-turnout behavior.
- **Bellweather Folding Room** — commercial print finishing using edge folds and nothing else.
- **Orpheum Fly Loft** — theatrical rigging by reeving one continuous rope through available blocks.

Each contains ten authored work orders. The prototypes are comparative research instruments: the question is whether the *construction grammar* is pleasurable and expressive enough to justify a larger game.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

Direct routes:

```text
#/rail/1
#/folding/1
#/rigging/1
```

## Verify

```bash
npm run check
npx playwright install chromium
npm run test:e2e
npm run audit:ui
```

`tests/models.test.ts` verifies a legal canonical solution for all thirty work orders. Playwright checks the three workbenches, stable frame geometry, and captures reference screenshots.

## Design documents

- [`docs/REBUILD_PRINCIPLES.md`](docs/REBUILD_PRINCIPLES.md)
- [`docs/ASSET_DIRECTION.md`](docs/ASSET_DIRECTION.md)

Progress and expert ratings stay in `localStorage` and can be exported as JSON from the launcher. There are no accounts, analytics, network APIs, or runtime art dependencies.
