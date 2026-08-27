import { makeRiggingPuzzle, type RigPoint, type RiggingPuzzle } from './model';

const fixed = (id: string, x: number, y: number, label = 'grid hook'): RigPoint => ({ id, x, y, kind: 'fixed', label });
const load = (id: string, x: number, y: number, label = 'moving block'): RigPoint => ({ id, x, y, kind: 'load', label });
const endpoints = (tieX = 10, handX = 90): RigPoint[] => [
  { id: 'tie', x: tieX, y: 12, kind: 'tie', label: 'tie off' },
  { id: 'hand', x: handX, y: 88, kind: 'hand', label: 'hand line' },
];

export const riggingPuzzles: RiggingPuzzle[] = [
  makeRiggingPuzzle({
    id: 'painted-moon', title: 'The Painted Moon', date: 'SEP 03 · 1908', sender: 'Walter Rook, Head Flyman', subject: 'One block, one lesson',
    memo: 'The moon drop weighs more than it looks and young Ellis cannot haul it straight. Reeve the line so he can lift it from the rail without leaving the floor.',
    aside: 'Every rope segment that rises from a moving block shares the load. Nothing else is magic.',
    scenery: 'painted moon drop', weight: 180, lift: 10, centerOfMassX: 48,
    points: [...endpoints(), fixed('c1', 48, 14), load('l1', 48, 68)], obstacles: [], canonical: ['tie', 'l1', 'c1', 'hand'],
  }),
  makeRiggingPuzzle({
    id: 'chandelier', title: 'The Chandelier', date: 'SEP 19 · 1908', sender: 'Walter Rook, Head Flyman', subject: 'Four supporting parts of line',
    memo: 'The lobby chandelier is coming onto the stage for the masquerade scene. It is too heavy for a simple purchase. Two moving blocks will do, if you remember where the force actually goes.',
    scenery: 'brass chandelier', weight: 520, lift: 12, centerOfMassX: 50,
    points: [...endpoints(), fixed('c1', 34, 14), fixed('c2', 66, 14), load('l1', 42, 68), load('l2', 58, 68)], obstacles: [], canonical: ['tie', 'l1', 'c1', 'l2', 'c2', 'hand'],
  }),
  makeRiggingPuzzle({
    id: 'border', title: 'The Garden Border', date: 'OCT 07 · 1908', sender: 'Mabel Crane, Scenic Artist', subject: 'Level, please',
    memo: 'My new garden border is thirty feet wide and painted on thin muslin. If one side rises before the other it wrinkles like washing. Pick it at both marked eyes and keep it level.',
    scenery: 'garden border', weight: 360, lift: 14, centerOfMassX: 50,
    points: [...endpoints(), fixed('c1', 30, 14), fixed('c2', 70, 14), load('l1', 32, 68, 'stage-left pick'), load('l2', 68, 68, 'stage-right pick')], obstacles: [], canonical: ['tie', 'l1', 'c1', 'l2', 'c2', 'hand'],
    constraints: { balanceTolerance: 2.2 },
  }),
  makeRiggingPuzzle({
    id: 'low-beam', title: 'Under the Beam', date: 'NOV 02 · 1908', sender: 'Walter Rook, Head Flyman', subject: 'The carpenter got there first',
    memo: 'A new roof brace sits exactly where a sensible line ought to go. The snowcloth still has to fly. Use the side grid hooks and keep the hemp clear of timber.',
    scenery: 'snowcloth', weight: 300, lift: 11, centerOfMassX: 50,
    points: [...endpoints(), fixed('c1', 24, 18), fixed('c2', 50, 12), fixed('c3', 76, 18), load('l1', 38, 70), load('l2', 62, 70)],
    obstacles: [{ x: 42, y: 27, w: 16, h: 8, label: 'roof brace' }], canonical: ['tie', 'l1', 'c1', 'l2', 'c3', 'hand'],
  }),
  makeRiggingPuzzle({
    id: 'quick-change', title: 'The Quick Change', date: 'DEC 14 · 1908', sender: 'Nell Foster, Stage Manager', subject: 'Twelve seconds of darkness',
    memo: 'The street drop must clear during a blackout. Rook keeps adding purchase until the crew has to haul a mile of rope. I need something a person can actually move before the lights come back.',
    scenery: 'street drop', weight: 240, lift: 9, centerOfMassX: 50,
    points: [...endpoints(), fixed('c1', 35, 14), fixed('c2', 65, 14), load('l1', 50, 68)], obstacles: [], canonical: ['tie', 'l1', 'c1', 'hand'],
    constraints: { maxPull: 19 },
  }),
  makeRiggingPuzzle({
    id: 'off-center-sign', title: 'The Electric Sign', date: 'JAN 23 · 1909', sender: 'C. E. Phelps, Electrician', subject: 'The transformer is on the right',
    memo: 'The roof sign looks centered. It is not. The transformer makes the stage-right end heavy, and I would prefer not to discover that over the orchestra. Give that side more support.',
    scenery: 'electric roof sign', weight: 460, lift: 8, centerOfMassX: 59,
    points: [...endpoints(), fixed('c1', 24, 14), fixed('c2', 50, 14), fixed('c3', 76, 14), load('l1', 32, 68, 'left pick'), load('r1', 60, 68, 'right pick'), load('r2', 72, 68, 'right auxiliary')], obstacles: [],
    canonical: ['tie', 'l1', 'c1', 'r1', 'c2', 'r2', 'c3', 'hand'], constraints: { balanceTolerance: 4.5 },
  }),
  makeRiggingPuzzle({
    id: 'short-rope', title: 'Short Rope', date: 'FEB 18 · 1909', sender: 'Walter Rook, Head Flyman', subject: 'The good hemp is downstairs',
    memo: 'Someone cut my long piece for a handrail. We have one sound seventy-foot length left in the loft. The palace arch still flies tonight. Keep your reeve compact.',
    scenery: 'palace arch', weight: 400, lift: 10, centerOfMassX: 50,
    points: [...endpoints(14, 86), fixed('c1', 35, 15), fixed('c2', 50, 11), fixed('c3', 65, 15), load('l1', 40, 67), load('l2', 60, 67)], obstacles: [],
    canonical: ['tie', 'l1', 'c1', 'l2', 'c3', 'hand'], constraints: { maxRope: 70 },
  }),
  makeRiggingPuzzle({
    id: 'glass-sky', title: 'Glass Sky', date: 'MAR 27 · 1909', sender: 'Mabel Crane, Scenic Artist', subject: 'It is not actually glass, but treat it as if it were',
    memo: 'The blue mica sky has three pick points because the frame is absurdly delicate. I want all three taking weight. If the center bows, the seams will show under the footlights.',
    scenery: 'mica sky frame', weight: 510, lift: 13, centerOfMassX: 50,
    points: [...endpoints(), fixed('c1', 22, 13), fixed('c2', 50, 11), fixed('c3', 78, 13), load('l1', 28, 68), load('l2', 50, 68), load('l3', 72, 68)], obstacles: [],
    canonical: ['tie', 'l1', 'c1', 'l2', 'c2', 'l3', 'c3', 'hand'], constraints: { balanceTolerance: 2.5 },
  }),
  makeRiggingPuzzle({
    id: 'proscenium', title: 'Around the Proscenium', date: 'APR 15 · 1909', sender: 'Nell Foster, Stage Manager', subject: 'No rope in the sightline',
    memo: 'The anniversary banner has to rise behind the proscenium leg. The audience can see the center grid opening, so any line through it is unacceptable even if the physics is perfect.',
    scenery: 'anniversary banner', weight: 430, lift: 12, centerOfMassX: 50,
    points: [...endpoints(), fixed('c1', 20, 16), fixed('c2', 36, 12), fixed('c3', 64, 12), fixed('c4', 80, 16), load('l1', 34, 69), load('l2', 66, 69)],
    obstacles: [{ x: 44, y: 18, w: 12, h: 42, label: 'open sightline' }], canonical: ['tie', 'l1', 'c2', 'c3', 'l2', 'c4', 'hand'],
  }),
  makeRiggingPuzzle({
    id: 'opening-night', title: 'Opening Night', date: 'MAY 01 · 1909', sender: 'Walter Rook, Head Flyman', subject: 'The new house',
    memo: 'We open the renovated stage tonight. The first reveal is a wide gilded portal: heavy, slightly right-loaded, and close under the grid. Reeve it cleanly enough that the crew stops thinking about the rope and watches the show.',
    aside: 'Rook has left a fresh coil of hemp on your bench. No note.',
    scenery: 'gilded portal', weight: 680, lift: 15, centerOfMassX: 54,
    points: [...endpoints(8, 92), fixed('c1', 18, 13), fixed('c2', 38, 11), fixed('c3', 58, 11), fixed('c4', 80, 13), load('l1', 26, 70, 'left pick'), load('l2', 58, 70, 'center pick'), load('l3', 74, 70, 'right pick')],
    obstacles: [{ x: 45, y: 24, w: 10, h: 14, label: 'old smoke vent' }], canonical: ['tie', 'c1', 'l1', 'l3', 'c4', 'l2', 'c3', 'hand'], constraints: { balanceTolerance: 5.5 },
  }),
];
