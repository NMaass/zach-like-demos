# Rebuild principles

This branch replaces the first prototype set rather than polishing it.

## What was wrong with the first pass

The first pass treated “Zach-like” as a presentation genre: engineering-themed UI, several manipulable parts, a success simulation, and optimization numbers. That produced busy interfaces and shallow construction systems. The redesign instead starts from the *construction grammar*.

## Constraints for all three trials

1. **One physical idea is the game.** Each trial has one generative operation or component behavior, not a toolbox assembled from individually obvious puzzle gadgets.
2. **Difficulty comes from composition.** A later work order may add more instances, constraints, geometry, or a stranger target, but it should not need a parade of new commands.
3. **The player edits the artifact directly.** No mode toolbar sits between intention and construction. Rail is drawn socket-to-socket; paper is folded by its edge; rope is reeved from the live end.
4. **Simulation is deterministic and legible.** Failure should be explainable from the visible construction, not discovered by repeated physics guesses.
5. **The first correct solution is not the endpoint.** Every system surfaces quantities that make a player want to rebuild: iron/joints, folds/hand-load, rope/blocks/effort.
6. **The job precedes the mechanism.** Every puzzle is a small workplace story whose requirements naturally create its mechanical problem.
7. **The workbench does not jump around.** Ticket, surface, spec rail, navigation and controls have fixed geometry; changing state changes contents, not the player's spatial map.

## The three grammars

### Coldwater Junction

One component: an automatic spring turnout with a two-position cam. Facing traffic takes the selected branch and advances the cam. Trailing traffic springs through to the stem without advancing it. The player places instances, connects their sockets, and chooses initial cam positions. Sorting behavior emerges from topology and state.

### Bellweather Folding Room

One operation: fold an exterior band of a rectangular printed sheet inward along a panel boundary. The fold flips faces and reverses layer order. There is no cut, glue, rotate, page-order, or staple command. The target is a physical dummy, not an abstract sequence.

### Orpheum Fly Loft

One operation: extend one continuous rope through a fixed or moving block. Moving blocks attached to scenery collect support from upward rope segments. The same reeve simultaneously determines hand effort, hand travel, rope consumption, balance and obstacle clearance.
