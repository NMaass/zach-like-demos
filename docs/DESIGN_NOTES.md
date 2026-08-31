# Revision B design notes

## What changed

The earlier prototype interpreted “simple Zach-like” as “many small tools in a themed editor.” That is the wrong abstraction. Revision B removes tool selection from the core loop.

Each trial now asks whether one physical manipulation can generate enough expressive space for ten open-ended specifications:

| Trial | Player-created vocabulary | Fixed puzzle material | Optimization pressure |
| --- | --- | --- | --- |
| Coldwater Junction | rail segments | survey restrictions, destinations, freight cut | rail length / shared geometry |
| Bellweather Bindery | folds | press imposition, approved dummy | fold sequence / correctness |
| Orpheum Fly Loft | one rope path | pulleys, scenery, load, travel envelope | effort vs handline travel |

Fixed puzzle material is not a second toolbox. It is the specification. This lets work orders differ technically without teaching a new editor every level.

## Interaction standard

The workbench is the product. Every puzzle opens directly into a stable, full-height workspace with the job ticket at left and permanent test/undo controls below. There are no modal tool choosers or side inventories.

Edits are immediate and reversible. Invalid physical constructions are refused at the point of manipulation where practical. Testing explains a failed specification in physical terms rather than returning a generic invalid state.

## Narrative standard

Every work order answers four questions in a paragraph or less:

1. Who asked for this?
2. What real thing are they trying to accomplish?
3. Why is the constraint present?
4. What does the player actually have to make work?

The setting should make the specification feel inevitable. It should not be flavor text pasted onto an abstract target.

## What experts should evaluate

Do not score these prototypes for content volume. Evaluate whether revision is pleasurable: whether a player can see a better idea, alter the mechanism, and immediately understand the consequences. The strongest candidate should create multiple plausible solutions from a tiny vocabulary and make optimization feel like craftsmanship rather than cleanup.
