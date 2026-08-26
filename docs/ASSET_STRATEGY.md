# Asset Strategy

## Decision

The vertical slices use **original inline SVG and CSS-rendered materials** rather than stock illustrations, AI-generated raster art, or a third-party icon pack.

This choice was made for four reasons:

1. **Coherence:** every asset obeys the same line weight, material palette, and period-artifact framing.
2. **Legibility:** functional marks remain sharp at any zoom and can react to game state.
3. **Licensing:** the repository has no ambiguous runtime art dependency or attribution burden.
4. **Iteration:** track, paper, rope, pulleys, cards, and diagrams are driven directly by simulation data.

## Visual language by prototype

### Coldwater Junction

- faded civil-engineering plan paper;
- ballast, sleepers, and rails rendered as separate SVG strokes;
- small enamel-like cargo plaques;
- depot labels and scale notes in tabular drafting typography;
- terrain communicated through restrained material patterns rather than detailed illustration.

### Bellweather Bindery

- warm wood cutting table;
- fiber and registration texture generated in CSS;
- each paper leaf carries front/back content, rotation, stack depth, and binding marks;
- fold and trim affordances resemble removable shop jigs rather than generic UI handles;
- approved dummies use the same renderer as the live workpiece.

### The Orpheum Fly Loft

- sectional-elevation drawing on a dark backstage surface;
- rope and scenery rendered in SVG so routing is exact;
- pulley glyphs built from layered CSS shapes;
- handline rails, hooks, arbors, and iron stacks remain mechanically readable at a glance;
- muted brass, hemp, and burgundy evoke a mid-century theater without obscuring the graph.

## When external assets would be appropriate

A production game could add commissioned key art, portraiture, prop illustrations, ambient loops, and professionally recorded Foley. The asset brief should specify:

- period and geographic reference board;
- orthographic or diagrammatic viewpoint where gameplay depends on geometry;
- silhouette and value requirements at actual UI size;
- layered/vector delivery for stateful parts;
- explicit commercial license and source files;
- no baked text in illustrations;
- a reduced-motion or static equivalent for animated assets.

For these slices, external decorative art would add review noise without improving the core manipulation test.
