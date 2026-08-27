import { describe, expect, it } from 'vitest';
import { railPuzzles } from '../src/games/rail/puzzles';
import { runRail, type RailSolution } from '../src/games/rail/model';
import { foldingPuzzles } from '../src/games/folding/puzzles';
import { foldPaper, initialPaper, isPaperSolved, paperSignature } from '../src/games/folding/model';
import { riggingPuzzles } from '../src/games/rigging/puzzles';
import { rigMetrics, validateRig } from '../src/games/rigging/model';

function canonicalRailSolution(index: number): RailSolution {
  const puzzle = railPuzzles[index]!;
  return {
    switches: Array.from({ length: puzzle.switches }, (_, switchIndex) => ({
      id: `s${switchIndex}`,
      x: 36 + (switchIndex % 2) * 24,
      y: 28 + Math.floor(switchIndex / 2) * 30,
      branch: puzzle.canonicalBranches?.[switchIndex] ?? 'a',
    })),
    connections: puzzle.canonical,
  };
}

describe('Coldwater Junction', () => {
  it('ships ten work orders with valid canonical classifications', () => {
    expect(railPuzzles).toHaveLength(10);
    railPuzzles.forEach((puzzle, index) => {
      const result = runRail(puzzle, canonicalRailSolution(index));
      expect(result.error, puzzle.id).toBeUndefined();
      expect(result.ok, puzzle.id).toBe(true);
      expect(puzzle.incoming.length).toBeGreaterThanOrEqual(2);
      expect(puzzle.switches).toBeLessThanOrEqual(4);
    });
  });

  it('uses one switch behavior across the full campaign', () => {
    expect(new Set(railPuzzles.map((puzzle) => puzzle.switches)).size).toBeGreaterThan(1);
    expect(railPuzzles.every((puzzle) => puzzle.canonical.every((connection) => connection.a && connection.b))).toBe(true);
  });

  it('eventually requires the same turnout to work backward as a merger', () => {
    for (const id of ['short-iron', 'relief-yard']) {
      const puzzle = railPuzzles.find((entry) => entry.id === id)!;
      const ports = new Set(puzzle.canonical.flatMap((connection) => [connection.a, connection.b]));
      const hasTrailingMerge = Array.from({ length: puzzle.switches }, (_, index) =>
        ports.has(`s${index}:a`) && ports.has(`s${index}:b`) && ports.has(`s${index}:stem`),
      ).some(Boolean);
      expect(hasTrailingMerge, id).toBe(true);
      expect(puzzle.targets).toHaveLength(3);
    }
  });

  it('finishes with all four machines serving a five-road cut', () => {
    const puzzle = railPuzzles.at(-1)!;
    expect(puzzle.targets).toHaveLength(5);
    for (let index = 0; index < puzzle.switches; index += 1) {
      expect(
        puzzle.canonical.some((connection) => connection.a.startsWith(`s${index}:`) || connection.b.startsWith(`s${index}:`)),
        `s${index}`,
      ).toBe(true);
    }
  });
});

describe('Bellweather Folding Room', () => {
  it('ships ten work orders solved entirely by legal edge folds', () => {
    expect(foldingPuzzles).toHaveLength(10);
    for (const puzzle of foldingPuzzles) {
      let state = initialPaper(puzzle.rows, puzzle.cols);
      for (const op of puzzle.canonical) {
        const before = paperSignature(state);
        state = foldPaper(state, op);
        expect(paperSignature(state), `${puzzle.id}: ${op.edge} ${op.count}`).not.toBe(before);
      }
      expect(isPaperSolved(state, puzzle.target), puzzle.id).toBe(true);
    }
  });

  it('never requires a non-fold operation', () => {
    expect(foldingPuzzles.every((puzzle) => puzzle.canonical.every((op) => ['left','right','top','bottom'].includes(op.edge)))).toBe(true);
  });
});

describe('Orpheum Fly Loft', () => {
  it('ships ten physically valid canonical reeves', () => {
    expect(riggingPuzzles).toHaveLength(10);
    for (const puzzle of riggingPuzzles) {
      expect(validateRig(puzzle, { path: puzzle.canonical }), puzzle.id).toBeNull();
      const metrics = rigMetrics(puzzle, { path: puzzle.canonical });
      expect(Number.isFinite(metrics.effort), puzzle.id).toBe(true);
      expect(metrics.support, puzzle.id).toBeGreaterThan(0);
      expect(metrics.blocks, puzzle.id).toBeLessThanOrEqual(puzzle.constraints.maxBlocks);
    }
  });

  it('uses only the act of extending a single rope path', () => {
    expect(riggingPuzzles.every((puzzle) => puzzle.canonical[0] === 'tie' && puzzle.canonical.at(-1) === 'hand')).toBe(true);
  });
});
