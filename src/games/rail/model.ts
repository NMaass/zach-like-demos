import type { PuzzleMeta } from '../../core/types';

export type SwitchBranch = 'a' | 'b';
export type SwitchPort = 'stem' | SwitchBranch;

export interface RailCar {
  id: string;
  mark: string;
  label: string;
  tone: 'brick' | 'ochre' | 'teal' | 'ink' | 'olive';
}

export interface RailTarget {
  id: string;
  label: string;
  expected: string[];
}

export interface RailConnection { a: string; b: string }
export interface RailSwitchState { id: string; x: number; y: number; branch: SwitchBranch }
export interface RailSolution { switches: RailSwitchState[]; connections: RailConnection[] }

export interface RailPuzzle extends PuzzleMeta {
  switches: number;
  incoming: RailCar[];
  targets: RailTarget[];
  canonical: RailConnection[];
  canonicalBranches?: SwitchBranch[];
  yardNote: string;
}

export interface RailRun {
  ok: boolean;
  error?: string;
  outputs: Record<string, string[]>;
  routes: { carId: string; ports: string[]; target?: string }[];
  finalBranches: Record<string, SwitchBranch>;
}

export function switchPortId(index: number, port: SwitchPort): string {
  return `s${index}:${port}`;
}

export function parseSwitchPort(portId: string): { index: number; port: SwitchPort } | null {
  const match = /^s(\d+):(stem|a|b)$/.exec(portId);
  if (!match) return null;
  return { index: Number(match[1]), port: match[2] as SwitchPort };
}

export function targetPortId(id: string): string { return `out:${id}`; }

function connectionMap(connections: RailConnection[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const connection of connections) {
    if (connection.a === connection.b) continue;
    if (map.has(connection.a) || map.has(connection.b)) continue;
    map.set(connection.a, connection.b);
    map.set(connection.b, connection.a);
  }
  return map;
}

export function validateConnections(connections: RailConnection[]): string | null {
  const used = new Set<string>();
  for (const connection of connections) {
    if (connection.a === connection.b) return 'A rail cannot return to the same socket.';
    if (used.has(connection.a) || used.has(connection.b)) return 'Each rail socket accepts one length of track.';
    used.add(connection.a);
    used.add(connection.b);
  }
  return null;
}

export function runRail(puzzle: RailPuzzle, solution: RailSolution): RailRun {
  const invalid = validateConnections(solution.connections);
  if (invalid) return { ok: false, error: invalid, outputs: {}, routes: [], finalBranches: {} };

  const links = connectionMap(solution.connections);
  const branches: Record<string, SwitchBranch> = {};
  for (let index = 0; index < puzzle.switches; index += 1) {
    branches[`s${index}`] = solution.switches[index]?.branch ?? puzzle.canonicalBranches?.[index] ?? 'a';
  }

  const outputs: Record<string, string[]> = Object.fromEntries(puzzle.targets.map((target) => [target.id, []]));
  const routes: RailRun['routes'] = [];

  for (const car of puzzle.incoming) {
    let port = 'in';
    const ports = ['in'];
    let target: string | undefined;
    const seen = new Map<string, number>();

    for (let step = 0; step < 80; step += 1) {
      const next = links.get(port);
      if (!next) {
        return { ok: false, error: `${car.mark} reaches an open rail end.`, outputs, routes: [...routes, { carId: car.id, ports }], finalBranches: branches };
      }
      port = next;
      ports.push(port);

      if (port.startsWith('out:')) {
        target = port.slice(4);
        if (!(target in outputs)) {
          return { ok: false, error: `${car.mark} reaches an unmarked siding.`, outputs, routes, finalBranches: branches };
        }
        outputs[target]!.push(car.id);
        break;
      }

      const parsed = parseSwitchPort(port);
      if (!parsed || parsed.index >= puzzle.switches) {
        return { ok: false, error: `${car.mark} enters a rail end that is not part of this yard.`, outputs, routes, finalBranches: branches };
      }

      const switchId = `s${parsed.index}`;
      let exit: SwitchPort;
      if (parsed.port === 'stem') {
        exit = branches[switchId] ?? 'a';
        branches[switchId] = exit === 'a' ? 'b' : 'a';
      } else {
        exit = 'stem';
      }
      port = switchPortId(parsed.index, exit);
      ports.push(port);

      const signature = `${port}:${branches[switchId]}`;
      const count = (seen.get(signature) ?? 0) + 1;
      seen.set(signature, count);
      if (count > 5) {
        return { ok: false, error: `${car.mark} is trapped in a loop.`, outputs, routes, finalBranches: branches };
      }
    }

    if (!target) {
      return { ok: false, error: `${car.mark} never reaches a siding.`, outputs, routes, finalBranches: branches };
    }
    routes.push({ carId: car.id, ports, target });
  }

  for (const targetSpec of puzzle.targets) {
    const actual = outputs[targetSpec.id] ?? [];
    if (actual.length !== targetSpec.expected.length || actual.some((id, index) => id !== targetSpec.expected[index])) {
      return { ok: false, error: `The consist on ${targetSpec.label} is wrong.`, outputs, routes, finalBranches: branches };
    }
  }

  return { ok: true, outputs, routes, finalBranches: branches };
}

export function railLength(solution: RailSolution, puzzle: RailPuzzle): number {
  const portPosition = (id: string): { x: number; y: number } | null => {
    if (id === 'in') return { x: 4, y: 50 };
    if (id.startsWith('out:')) {
      const index = puzzle.targets.findIndex((target) => target.id === id.slice(4));
      const count = puzzle.targets.length;
      return { x: 96, y: 18 + (index * 64) / Math.max(1, count - 1) };
    }
    const parsed = parseSwitchPort(id);
    if (!parsed) return null;
    const sw = solution.switches[parsed.index];
    if (!sw) return null;
    const offsets: Record<SwitchPort, { x: number; y: number }> = {
      stem: { x: -5.2, y: 0 },
      a: { x: 5.2, y: -3.8 },
      b: { x: 5.2, y: 3.8 },
    };
    const offset = offsets[parsed.port];
    return { x: sw.x + offset.x, y: sw.y + offset.y };
  };

  return Math.round(solution.connections.reduce((total, connection) => {
    const a = portPosition(connection.a);
    const b = portPosition(connection.b);
    return total + (a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0);
  }, 0));
}

export function makeRailPuzzle(base: Omit<RailPuzzle, 'targets'> & { targetLabels: string[] }): RailPuzzle {
  const temporary: RailPuzzle = { ...base, targets: base.targetLabels.map((label, index) => ({ id: String.fromCharCode(65 + index), label, expected: [] })) };
  const switches: RailSwitchState[] = Array.from({ length: base.switches }, (_, index) => ({
    id: `s${index}`,
    x: 36 + (index % 2) * 24,
    y: 28 + Math.floor(index / 2) * 30,
    branch: base.canonicalBranches?.[index] ?? 'a',
  }));
  const result = runRail(temporary, { switches, connections: base.canonical });
  if (result.error && !result.error.includes('wrong')) throw new Error(`Invalid canonical rail puzzle ${base.id}: ${result.error}`);
  const targets = temporary.targets.map((target) => ({ ...target, expected: result.outputs[target.id] ?? [] }));
  return { ...temporary, targets };
}
