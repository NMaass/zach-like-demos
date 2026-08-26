import type { PuzzleStory } from '../../core/types';

export type Direction = 'N' | 'E' | 'S' | 'W';
export type TrackType = 'straight' | 'curve' | 'junction' | 'cross';
export type CargoKind = 'mail' | 'milk' | 'coal' | 'timber' | 'passenger' | 'machinery' | 'fish' | 'produce';

export interface TrackTile {
  type: TrackType;
  rotation: 0 | 1 | 2 | 3;
  switchState: 0 | 1;
  mirrored: boolean;
}

export interface RailSource {
  id: string;
  x: number;
  y: number;
  side: Direction;
  sequence: readonly CargoKind[];
  releaseEvery?: number;
  startDelay?: number;
  label: string;
}

export interface RailOutput {
  id: string;
  x: number;
  y: number;
  side: Direction;
  expected: readonly CargoKind[];
  label: string;
}

export interface RailObstacle {
  x: number;
  y: number;
  kind: 'building' | 'water' | 'snow' | 'platform';
}

export interface RailPuzzle extends PuzzleStory {
  width: number;
  height: number;
  budget: number;
  sources: readonly RailSource[];
  outputs: readonly RailOutput[];
  obstacles: readonly RailObstacle[];
  solution: RailBoardState;
}

export interface RailBoardState {
  tiles: Record<string, TrackTile>;
}

export interface RailToken {
  id: string;
  cargo: CargoKind;
  x: number;
  y: number;
  incoming: Direction;
  sourceId: string;
}

export interface RailFrame {
  tick: number;
  tokens: readonly RailToken[];
  deliveries: Record<string, readonly CargoKind[]>;
  switches: Record<string, 0 | 1>;
}

export interface RailRunResult {
  ok: boolean;
  message: string;
  ticks: number;
  deliveries: Record<string, readonly CargoKind[]>;
  frames: readonly RailFrame[];
  failureCell?: { x: number; y: number };
}

export const cargoLabels: Record<CargoKind, string> = {
  mail: 'Mail',
  milk: 'Milk',
  coal: 'Coal',
  timber: 'Timber',
  passenger: 'Coach',
  machinery: 'Machinery',
  fish: 'Fish',
  produce: 'Produce',
};

export const directions: readonly Direction[] = ['N', 'E', 'S', 'W'];

export function keyOf(x: number, y: number): string {
  return `${x},${y}`;
}

export function opposite(direction: Direction): Direction {
  return direction === 'N' ? 'S' : direction === 'S' ? 'N' : direction === 'E' ? 'W' : 'E';
}

export function delta(direction: Direction): readonly [number, number] {
  if (direction === 'N') return [0, -1];
  if (direction === 'E') return [1, 0];
  if (direction === 'S') return [0, 1];
  return [-1, 0];
}

export function rotateDirection(direction: Direction, rotation: number): Direction {
  const index = directions.indexOf(direction);
  return directions[(index + rotation) % directions.length] ?? direction;
}

interface TileShape {
  connections: readonly Direction[];
  stem?: Direction;
  branches?: readonly [Direction, Direction];
}

export function tileShape(tile: TrackTile): TileShape {
  if (tile.type === 'straight') {
    const horizontal = tile.rotation % 2 === 0;
    return { connections: horizontal ? ['E', 'W'] : ['N', 'S'] };
  }
  if (tile.type === 'curve') {
    return {
      connections: [rotateDirection('N', tile.rotation), rotateDirection('E', tile.rotation)],
    };
  }
  if (tile.type === 'cross') {
    return { connections: directions };
  }
  const stem = rotateDirection('W', tile.rotation);
  const branches = [
    rotateDirection('E', tile.rotation),
    rotateDirection(tile.mirrored ? 'S' : 'N', tile.rotation),
  ] as const;
  return { connections: [stem, ...branches], stem, branches };
}

export function nextDirection(tile: TrackTile, incoming: Direction): { direction?: Direction; toggles: boolean } {
  const shape = tileShape(tile);
  if (!shape.connections.includes(incoming)) return { toggles: false };

  if (tile.type === 'cross') {
    return { direction: opposite(incoming), toggles: false };
  }

  if (tile.type === 'junction' && shape.stem && shape.branches) {
    if (incoming === shape.stem) {
      return { direction: shape.branches[tile.switchState], toggles: true };
    }
    if (shape.branches.includes(incoming)) return { direction: shape.stem, toggles: false };
    return { toggles: false };
  }

  const direction = shape.connections.find((connection) => connection !== incoming);
  return direction ? { direction, toggles: false } : { toggles: false };
}

function isInside(puzzle: RailPuzzle, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < puzzle.width && y < puzzle.height;
}

function immutableDeliveries(outputs: readonly RailOutput[]): Record<string, readonly CargoKind[]> {
  return Object.fromEntries(outputs.map((output) => [output.id, [] as CargoKind[]]));
}

function snapshotSwitches(tiles: Record<string, TrackTile>): Record<string, 0 | 1> {
  return Object.fromEntries(
    Object.entries(tiles)
      .filter(([, tile]) => tile.type === 'junction')
      .map(([key, tile]) => [key, tile.switchState]),
  );
}

export function countTrack(board: RailBoardState): number {
  return Object.keys(board.tiles).length;
}

export function simulateRail(puzzle: RailPuzzle, board: RailBoardState): RailRunResult {
  const obstacleKeys = new Set(puzzle.obstacles.map((obstacle) => keyOf(obstacle.x, obstacle.y)));
  const tiles: Record<string, TrackTile> = Object.fromEntries(
    Object.entries(board.tiles).map(([key, tile]) => [key, { ...tile }]),
  );
  const deliveries = Object.fromEntries(
    puzzle.outputs.map((output) => [output.id, [] as CargoKind[]]),
  ) as Record<string, CargoKind[]>;
  const sourceIndexes = Object.fromEntries(puzzle.sources.map((source) => [source.id, 0])) as Record<string, number>;
  let tokens: RailToken[] = [];
  const frames: RailFrame[] = [
    { tick: 0, tokens: [], deliveries: immutableDeliveries(puzzle.outputs), switches: snapshotSwitches(tiles) },
  ];

  const fail = (message: string, tick: number, failureCell?: { x: number; y: number }): RailRunResult => ({
    ok: false,
    message,
    ticks: tick,
    deliveries,
    frames,
    ...(failureCell ? { failureCell } : {}),
  });

  for (let tick = 1; tick <= 180; tick += 1) {
    for (const source of puzzle.sources) {
      const sourceIndex = sourceIndexes[source.id] ?? 0;
      if (sourceIndex >= source.sequence.length) continue;
      const cadence = source.releaseEvery ?? 5;
      const delay = source.startDelay ?? 0;
      if (tick < delay || (tick - delay) % cadence !== 1 % cadence) continue;
      const cellKey = keyOf(source.x, source.y);
      if (tokens.some((token) => token.x === source.x && token.y === source.y)) {
        return fail(`The ${source.label} throat is blocked.`, tick, { x: source.x, y: source.y });
      }
      const tile = tiles[cellKey];
      if (!tile || !tileShape(tile).connections.includes(source.side)) {
        return fail(`${source.label} has no receiving rail.`, tick, { x: source.x, y: source.y });
      }
      const cargo = source.sequence[sourceIndex];
      if (!cargo) continue;
      tokens.push({
        id: `${source.id}-${sourceIndex}`,
        cargo,
        x: source.x,
        y: source.y,
        incoming: source.side,
        sourceId: source.id,
      });
      sourceIndexes[source.id] = sourceIndex + 1;
    }

    const proposed: Array<{
      token: RailToken;
      x: number;
      y: number;
      incoming: Direction;
      outputId?: string;
      toggledKey?: string;
    }> = [];

    for (const token of tokens) {
      const tileKey = keyOf(token.x, token.y);
      const tile = tiles[tileKey];
      if (!tile) return fail('A car rolled off unfinished track.', tick, { x: token.x, y: token.y });
      const next = nextDirection(tile, token.incoming);
      if (!next.direction) {
        return fail('A rail joint does not meet the arriving track.', tick, { x: token.x, y: token.y });
      }
      const [dx, dy] = delta(next.direction);
      const targetX = token.x + dx;
      const targetY = token.y + dy;
      if (!isInside(puzzle, targetX, targetY)) {
        const output = puzzle.outputs.find(
          (candidate) => candidate.x === token.x && candidate.y === token.y && candidate.side === next.direction,
        );
        if (!output) return fail('A car left the yard through an unassigned gate.', tick, { x: token.x, y: token.y });
        proposed.push({
          token,
          x: targetX,
          y: targetY,
          incoming: opposite(next.direction),
          outputId: output.id,
          ...(next.toggles ? { toggledKey: tileKey } : {}),
        });
        continue;
      }
      const targetKey = keyOf(targetX, targetY);
      if (obstacleKeys.has(targetKey)) {
        return fail('Track enters a protected structure.', tick, { x: targetX, y: targetY });
      }
      const targetTile = tiles[targetKey];
      if (!targetTile || !tileShape(targetTile).connections.includes(opposite(next.direction))) {
        return fail('The route ends at an open joint.', tick, { x: targetX, y: targetY });
      }
      proposed.push({
        token,
        x: targetX,
        y: targetY,
        incoming: opposite(next.direction),
        ...(next.toggles ? { toggledKey: tileKey } : {}),
      });
    }

    const occupiedTargets = new Map<string, RailToken[]>();
    for (const move of proposed) {
      if (move.outputId) continue;
      const targetKey = keyOf(move.x, move.y);
      const list = occupiedTargets.get(targetKey) ?? [];
      list.push(move.token);
      occupiedTargets.set(targetKey, list);
    }
    const collision = [...occupiedTargets.entries()].find(([, cars]) => cars.length > 1);
    if (collision) {
      const [x, y] = collision[0].split(',').map(Number);
      return fail('Two cars entered the same block.', tick, { x: x ?? 0, y: y ?? 0 });
    }

    for (let a = 0; a < proposed.length; a += 1) {
      const first = proposed[a];
      if (!first || first.outputId) continue;
      for (let b = a + 1; b < proposed.length; b += 1) {
        const second = proposed[b];
        if (!second || second.outputId) continue;
        if (
          first.x === second.token.x &&
          first.y === second.token.y &&
          second.x === first.token.x &&
          second.y === first.token.y
        ) {
          return fail('Two cars met nose-to-nose on one block.', tick, { x: first.x, y: first.y });
        }
      }
    }

    const toggled = new Set<string>();
    const nextTokens: RailToken[] = [];
    for (const move of proposed) {
      if (move.toggledKey && !toggled.has(move.toggledKey)) {
        const tile = tiles[move.toggledKey];
        if (tile) tile.switchState = tile.switchState === 0 ? 1 : 0;
        toggled.add(move.toggledKey);
      }
      if (move.outputId) {
        deliveries[move.outputId]?.push(move.token.cargo);
      } else {
        nextTokens.push({ ...move.token, x: move.x, y: move.y, incoming: move.incoming });
      }
    }
    tokens = nextTokens;

    frames.push({
      tick,
      tokens: tokens.map((token) => ({ ...token })),
      deliveries: Object.fromEntries(Object.entries(deliveries).map(([id, values]) => [id, [...values]])),
      switches: snapshotSwitches(tiles),
    });

    const allReleased = puzzle.sources.every(
      (source) => (sourceIndexes[source.id] ?? 0) >= source.sequence.length,
    );
    if (allReleased && tokens.length === 0) {
      const wrongOutput = puzzle.outputs.find((output) => {
        const actual = deliveries[output.id] ?? [];
        return actual.length !== output.expected.length || actual.some((cargo, index) => cargo !== output.expected[index]);
      });
      if (wrongOutput) {
        return fail(`${wrongOutput.label} received the wrong consist.`, tick, { x: wrongOutput.x, y: wrongOutput.y });
      }
      if (countTrack(board) > puzzle.budget) {
        return fail(`The plan uses ${countTrack(board) - puzzle.budget} more rail sections than authorized.`, tick);
      }
      return {
        ok: true,
        message: puzzle.completion,
        ticks: tick,
        deliveries,
        frames,
      };
    }
  }

  return fail('The yard did not clear before the inspection window closed.', 180);
}

export function railBoardsEqual(a: RailBoardState, b: RailBoardState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
