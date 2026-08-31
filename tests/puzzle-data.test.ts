import { describe, expect, it } from 'vitest';
import { binderyPuzzles, railPuzzles, riggingPuzzles } from '../src/data';

describe('vertical slice content', () => {
  it('ships exactly ten authored work orders for every mechanism', () => {
    expect(railPuzzles).toHaveLength(10);
    expect(binderyPuzzles).toHaveLength(10);
    expect(riggingPuzzles).toHaveLength(10);
  });

  it('keeps every work order concrete and addressed by a person or organization', () => {
    for (const puzzle of [...railPuzzles, ...binderyPuzzles, ...riggingPuzzles]) {
      expect(puzzle.title.length).toBeGreaterThan(4);
      expect(puzzle.sender.length).toBeGreaterThan(3);
      expect(puzzle.story.length).toBeGreaterThan(70);
      expect(puzzle.instruction.length).toBeGreaterThan(35);
    }
  });

  it('uses one player-created material per prototype', () => {
    expect(new Set(railPuzzles.flatMap((puzzle) => puzzle.exits.map(() => 'rail')))).toEqual(new Set(['rail']));
    expect(binderyPuzzles.every((puzzle) => puzzle.rows > 0 && puzzle.cols > 0)).toBe(true);
    expect(riggingPuzzles.every((puzzle) => puzzle.fixed.length > 0 && puzzle.moving.length > 0)).toBe(true);
  });
});
