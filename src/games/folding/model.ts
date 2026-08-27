import type { PuzzleMeta } from '../../core/types';

export type FoldEdge = 'left' | 'right' | 'top' | 'bottom';
export type PaperFace = 'front' | 'back';

export interface PaperLayer {
  id: string;
  face: PaperFace;
  rotation: 0 | 90 | 180 | 270;
}
export type PaperCell = PaperLayer[];

export interface FoldOp { edge: FoldEdge; count: number }
export interface PaperState { grid: PaperCell[][]; moves: FoldOp[]; effort: number }

export interface FoldingPuzzle extends PuzzleMeta {
  rows: number;
  cols: number;
  panelLabels: string[];
  canonical: FoldOp[];
  target: PaperState;
  stock: string;
  ink: string;
  delivery: string;
}

function cloneGrid(grid: PaperCell[][]): PaperCell[][] {
  return grid.map((row) => row.map((cell) => cell.map((layer) => ({ ...layer }))));
}

export function initialPaper(rows: number, cols: number): PaperState {
  return {
    grid: Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => [{ id: `${row}:${col}`, face: 'front' as const, rotation: 0 as const }]),
    ),
    moves: [],
    effort: 0,
  };
}

function flipLayer(layer: PaperLayer, axis: 'vertical' | 'horizontal'): PaperLayer {
  const face: PaperFace = layer.face === 'front' ? 'back' : 'front';
  const rotation = axis === 'vertical'
    ? ((360 - layer.rotation) % 360)
    : ((180 - layer.rotation + 360) % 360);
  return { ...layer, face, rotation: rotation as PaperLayer['rotation'] };
}

function flippedStack(cell: PaperCell, axis: 'vertical' | 'horizontal'): PaperCell {
  return [...cell].reverse().map((layer) => flipLayer(layer, axis));
}

export function legalFoldCounts(state: PaperState, edge: FoldEdge): number[] {
  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 0;
  const dimension = edge === 'left' || edge === 'right' ? cols : rows;
  return Array.from({ length: Math.floor(dimension / 2) }, (_, index) => index + 1);
}

export function foldPaper(state: PaperState, op: FoldOp): PaperState {
  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0 || !Number.isInteger(op.count) || op.count < 1) return state;
  if (!legalFoldCounts(state, op.edge).includes(op.count)) return state;

  const source = cloneGrid(state.grid);
  const vertical = op.edge === 'left' || op.edge === 'right';
  const newRows = vertical ? rows : rows - op.count;
  const newCols = vertical ? cols - op.count : cols;
  const result: PaperCell[][] = Array.from({ length: newRows }, () => Array.from({ length: newCols }, () => [] as PaperCell));
  let movedLayers = 0;

  if (op.edge === 'left') {
    for (let row = 0; row < rows; row += 1) {
      for (let col = op.count; col < cols; col += 1) result[row]![col - op.count] = source[row]![col]!;
      for (let col = 0; col < op.count; col += 1) {
        const targetCol = op.count - 1 - col;
        const moved = flippedStack(source[row]![col]!, 'vertical');
        movedLayers += moved.length;
        result[row]![targetCol] = [...moved, ...result[row]![targetCol]!];
      }
    }
  } else if (op.edge === 'right') {
    const stationary = cols - op.count;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < stationary; col += 1) result[row]![col] = source[row]![col]!;
      for (let col = stationary; col < cols; col += 1) {
        const targetCol = stationary - 1 - (col - stationary);
        const moved = flippedStack(source[row]![col]!, 'vertical');
        movedLayers += moved.length;
        result[row]![targetCol] = [...moved, ...result[row]![targetCol]!];
      }
    }
  } else if (op.edge === 'top') {
    for (let row = op.count; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) result[row - op.count]![col] = source[row]![col]!;
    }
    for (let row = 0; row < op.count; row += 1) {
      const targetRow = op.count - 1 - row;
      for (let col = 0; col < cols; col += 1) {
        const moved = flippedStack(source[row]![col]!, 'horizontal');
        movedLayers += moved.length;
        result[targetRow]![col] = [...moved, ...result[targetRow]![col]!];
      }
    }
  } else {
    const stationary = rows - op.count;
    for (let row = 0; row < stationary; row += 1) {
      for (let col = 0; col < cols; col += 1) result[row]![col] = source[row]![col]!;
    }
    for (let row = stationary; row < rows; row += 1) {
      const targetRow = stationary - 1 - (row - stationary);
      for (let col = 0; col < cols; col += 1) {
        const moved = flippedStack(source[row]![col]!, 'horizontal');
        movedLayers += moved.length;
        result[targetRow]![col] = [...moved, ...result[targetRow]![col]!];
      }
    }
  }

  const creaseLength = vertical ? rows : cols;
  return { grid: result, moves: [...state.moves, op], effort: state.effort + movedLayers * creaseLength };
}

export function paperSignature(state: PaperState): string {
  return `${state.grid.length}x${state.grid[0]?.length ?? 0}|${state.grid.map((row) =>
    row.map((cell) => cell.map((layer) => `${layer.id}/${layer.face}/${layer.rotation}`).join('>')).join(',')
  ).join(';')}`;
}

export function isPaperSolved(state: PaperState, target: PaperState): boolean {
  return paperSignature(state) === paperSignature(target);
}

export function makeFoldingPuzzle(base: Omit<FoldingPuzzle, 'target'>): FoldingPuzzle {
  let target = initialPaper(base.rows, base.cols);
  for (const op of base.canonical) target = foldPaper(target, op);
  return { ...base, target };
}
