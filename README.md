# Workshop Trials — Revision B

Three deliberately small, non-computing Zach-like vertical slices for comparative expert playtesting.

The first implementation failed the premise by treating “small toolset” as a theme rather than a mechanical constraint. Revision B starts over from one rule: **the player gets one construction vocabulary per game; depth must come from composition, not feature accumulation.**

## The three trials

### Coldwater Junction — `#/rail/1`
1937 railroad civil engineering. **The player places only rail.** Drag between survey pins; junctions emerge where rail branches. A fixed tower routes freight cars by their waybills when the design is tested. The optimization pressure is shared infrastructure and rail length.

### Bellweather Bindery — `#/bindery/1`
1925 commercial bookbinding. **The player only folds.** Every sheet starts with a fixed printer's imposition. Fold outside edges inward until the physical leaf stack matches the approved dummy. The puzzle is sequence and state transformation, not a palette of craft operations.

### The Orpheum Fly Loft — `#/rigging/1`
1956 theatrical rigging. **The player places only one continuous rope.** Pulleys, battens, obstacles, and tie-offs belong to the work order. Reeve a path through them; mechanical advantage and handline travel emerge from the rope path.

Each trial contains ten authored work orders with concrete in-world reasons for the specification.

## Run

```bash
npm install
npm run dev
```

Full verification:

```bash
npm run check
npx playwright install chromium
npm run test:e2e
```

## Design standard

Revision B is intentionally narrower:

- one player-created material / operation per prototype;
- direct manipulation instead of a tool palette;
- deterministic rules that can be reasoned about before pressing Test;
- puzzle-specific fixed hardware/geometry when it makes a work order technically and narratively distinct;
- specifications described as believable jobs, not arbitrary level goals;
- immediate undo and revision;
- fixed workspace geometry and stable status regions;
- visible optimization metrics after the mechanism already works;
- no research, currencies, inventories, unlock trees, ratings forms, or meta-progression competing with the puzzle.

The target of these slices is not “feature complete.” It is to determine whether manipulating **rail**, **a folded sheet**, or **a rope path** is intrinsically satisfying enough to justify a larger Zach-like.
