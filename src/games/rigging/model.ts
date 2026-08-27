import type { PuzzleMeta } from '../../core/types';

export type RigPointKind = 'tie' | 'hand' | 'fixed' | 'load';
export interface RigPoint { id: string; x: number; y: number; kind: RigPointKind; label: string }
export interface RigObstacle { x: number; y: number; w: number; h: number; label: string }
export interface RigSolution { path: string[] }

export interface RigMetrics {
  support: number;
  effort: number;
  pull: number;
  rope: number;
  balanceX: number;
  balanceError: number;
  blocks: number;
}

export interface RigConstraints {
  maxEffort: number;
  maxPull: number;
  maxRope: number;
  maxBlocks: number;
  balanceTolerance: number;
}

export interface RiggingPuzzle extends PuzzleMeta {
  weight: number;
  lift: number;
  centerOfMassX: number;
  points: RigPoint[];
  obstacles: RigObstacle[];
  canonical: string[];
  constraints: RigConstraints;
  scenery: string;
}

function pointMap(puzzle: RiggingPuzzle | Omit<RiggingPuzzle, 'constraints'>): Map<string, RigPoint> {
  return new Map(puzzle.points.map((point) => [point.id, point]));
}

function supportContribution(load: RigPoint, other: RigPoint): number {
  const dx = other.x - load.x;
  const dy = other.y - load.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.001) return 0;
  return Math.max(0, -dy / length);
}

function segmentHitsRect(a: RigPoint, b: RigPoint, rect: RigObstacle): boolean {
  const pad = 0.8;
  const xMin = rect.x - pad;
  const xMax = rect.x + rect.w + pad;
  const yMin = rect.y - pad;
  const yMax = rect.y + rect.h + pad;

  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const checks: [number, number][] = [
    [-dx, a.x - xMin], [dx, xMax - a.x], [-dy, a.y - yMin], [dy, yMax - a.y],
  ];
  for (const [p, q] of checks) {
    if (Math.abs(p) < 1e-9) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return false;
  }
  return t0 < 0.98 && t1 > 0.02;
}

export function rigMetrics(puzzle: RiggingPuzzle | Omit<RiggingPuzzle, 'constraints'>, solution: RigSolution): RigMetrics {
  const points = pointMap(puzzle);
  const supportAt = new Map<string, number>();
  let rope = 0;
  for (let index = 0; index < solution.path.length - 1; index += 1) {
    const a = points.get(solution.path[index]!);
    const b = points.get(solution.path[index + 1]!);
    if (!a || !b) continue;
    rope += Math.hypot(a.x - b.x, a.y - b.y) * 0.22;
    if (a.kind === 'load' && b.kind !== 'load') supportAt.set(a.id, (supportAt.get(a.id) ?? 0) + supportContribution(a, b));
    if (b.kind === 'load' && a.kind !== 'load') supportAt.set(b.id, (supportAt.get(b.id) ?? 0) + supportContribution(b, a));
  }

  const support = [...supportAt.values()].reduce((sum, value) => sum + value, 0);
  const effort = support > 0 ? puzzle.weight / support : Infinity;
  const pull = support > 0 ? puzzle.lift * support : Infinity;
  const weightedX = [...supportAt.entries()].reduce((sum, [id, value]) => sum + (points.get(id)?.x ?? 0) * value, 0);
  const balanceX = support > 0 ? weightedX / support : 0;
  const blocks = solution.path.filter((id) => {
    const kind = points.get(id)?.kind;
    return kind === 'fixed' || kind === 'load';
  }).length;
  return {
    support,
    effort,
    pull,
    rope,
    balanceX,
    balanceError: Math.abs(balanceX - puzzle.centerOfMassX),
    blocks,
  };
}

export function validateRig(puzzle: RiggingPuzzle, solution: RigSolution): string | null {
  const points = pointMap(puzzle);
  if (solution.path[0] !== 'tie') return 'Start at the standing end marked TIE OFF.';
  if (solution.path.at(-1) !== 'hand') return 'Finish at the hand line.';
  if (solution.path.length < 3) return 'The line needs at least one working block.';
  const seen = new Set<string>();
  for (const id of solution.path) {
    if (!points.has(id)) return 'The line passes through a point that is not on this plot.';
    if (id !== 'tie' && id !== 'hand') {
      if (seen.has(id)) return 'A single-sheave block cannot take the line twice.';
      seen.add(id);
    }
  }
  for (let index = 0; index < solution.path.length - 1; index += 1) {
    const a = points.get(solution.path[index]!)!;
    const b = points.get(solution.path[index + 1]!)!;
    const obstacle = puzzle.obstacles.find((rect) => segmentHitsRect(a, b, rect));
    if (obstacle) return `The line fouls the ${obstacle.label}.`;
  }
  const metrics = rigMetrics(puzzle, solution);
  if (!Number.isFinite(metrics.effort)) return 'Nothing is actually supporting the scenery.';
  if (metrics.effort > puzzle.constraints.maxEffort + 0.01) return `Hand effort is ${Math.ceil(metrics.effort)} lb; the crew limit is ${puzzle.constraints.maxEffort} lb.`;
  if (metrics.pull > puzzle.constraints.maxPull + 0.01) return `The hand line must travel ${Math.ceil(metrics.pull)} ft; only ${puzzle.constraints.maxPull} ft is clear.`;
  if (metrics.rope > puzzle.constraints.maxRope + 0.01) return `The reeve uses ${Math.ceil(metrics.rope)} ft of rope; the cut piece is ${puzzle.constraints.maxRope} ft.`;
  if (metrics.blocks > puzzle.constraints.maxBlocks) return `This cue allows ${puzzle.constraints.maxBlocks} blocks.`;
  if (metrics.balanceError > puzzle.constraints.balanceTolerance + 0.01) return 'The supporting lines do not balance under the marked center of gravity.';
  return null;
}

export function makeRiggingPuzzle(base: Omit<RiggingPuzzle, 'constraints'> & { constraints?: Partial<RigConstraints> }): RiggingPuzzle {
  const seed = { ...base, constraints: undefined } as unknown as Omit<RiggingPuzzle, 'constraints'>;
  const metrics = rigMetrics(seed, { path: base.canonical });
  const constraints: RigConstraints = {
    maxEffort: base.constraints?.maxEffort ?? Math.ceil(metrics.effort / 5) * 5,
    maxPull: base.constraints?.maxPull ?? Math.ceil(metrics.pull + 0.5),
    maxRope: base.constraints?.maxRope ?? Math.ceil(metrics.rope + 2),
    maxBlocks: base.constraints?.maxBlocks ?? metrics.blocks,
    balanceTolerance: base.constraints?.balanceTolerance ?? Math.max(1.6, metrics.balanceError + 0.8),
  };
  return { ...base, constraints } as RiggingPuzzle;
}
