# Asset strategy

Revision B does not rely on decorative stock imagery. The important visuals are functional diagrams, so they are generated from the same state that drives the puzzle.

- **Rail:** survey paper, pins, obstructions, track geometry, waybill colors, and moving freight cars are SVG/CSS primitives tied directly to the rail graph.
- **Bindery:** imposed pages, paper stacks, registration marks, dummy leaves, and fold controls are DOM/CSS objects tied directly to the leaf stack.
- **Rigging:** gridiron, pulleys, batten, scenery, rope, and dimensional annotations are SVG tied directly to the reeving path.

This is deliberate. For a construction game, an attractive object that lies about the underlying rules is worse than a simpler asset that perfectly communicates state.

If a full game is greenlit, the next art pass should be commissioned around these functional silhouettes rather than replacing them with unrelated illustration. Reference gathering should focus on period technical drawings, trade manuals, shop forms, material samples, and photographs whose geometry can inform original art. Do not lift third-party artwork into the runtime.
