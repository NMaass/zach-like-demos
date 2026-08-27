# Asset direction

The prototypes use authored vector and CSS assets generated from simulation state. Nothing visual is downloaded at runtime.

The objective is not generic “vintage” decoration. Each workbench should look like a tool the fictional worker could plausibly recognize:

- **Rail:** pale civil-engineering plan, nickel rail, wood/tie texture, brass cam levers, numbered rolling-stock blocks.
- **Folding:** worn composition table, warm uncoated stock, two-sided ink furniture, registration-like labels, visible leaf stack depth.
- **Rigging:** dark sectional fly-loft plot, hemp line, brass/wood blocks, gridiron marks, muted scenic flats and a marked center of gravity.

Functional geometry and art geometry are the same SVG objects wherever possible. A turnout is not a decorative icon layered over a hit target; the player manipulates the turnout they are reading. Paper labels rotate and flip with the physical leaf. Rope is the path the solver actually defined.

Textures are deliberately low contrast so the artifact remains the highest-contrast object. Motion is reserved for semantic events: a car traversing a finished route or scenery actually flying. Reduced-motion mode removes nonessential movement.
