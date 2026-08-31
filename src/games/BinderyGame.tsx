import { useMemo, useState } from 'react';
import { GameFrame, type RunState } from '../components/GameFrame';
import { binderyPuzzles } from '../data';
import { useHistory } from '../core/useHistory';

interface BinderyGameProps {
  puzzleIndex: number;
  onPuzzleIndexChange: (index: number) => void;
  onBack: () => void;
}

type Fold = 'L' | 'R' | 'T' | 'B';
interface Leaf { front: number; back: number; frontUp: boolean; id: number }
type Stack = Leaf[];
type Grid = Stack[][];
interface FoldState { grid: Grid; folds: Fold[] }

const canonical: Fold[][] = [
  ['R'], ['R','B'], ['R','R'], ['R','B','R'], ['B','R'], ['R','R','B'], ['R','B','L','T'], ['B','R','R'], ['T','L','B','R'], ['L','T','R','B'],
];

function makeGrid(rows: number, cols: number, front: number[], back: number[]): Grid {
  let id = 0;
  return Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => {
    const index = y * cols + x;
    return [{ front: front[index]!, back: back[index]!, frontUp: true, id: id++ }];
  }));
}

function flipStack(stack: Stack): Stack {
  return [...stack].reverse().map((leaf) => ({ ...leaf, frontUp: !leaf.frontUp }));
}

function foldGrid(grid: Grid, direction: Fold): Grid | null {
  const rows = grid.length;
  const cols = grid[0]!.length;
  if ((direction === 'L' || direction === 'R') && (cols < 2 || cols % 2 !== 0)) return null;
  if ((direction === 'T' || direction === 'B') && (rows < 2 || rows % 2 !== 0)) return null;

  if (direction === 'R') {
    const half = cols / 2;
    return grid.map((row) => Array.from({ length: half }, (_, x) => [...flipStack(row[cols - 1 - x]!), ...row[x]!]));
  }
  if (direction === 'L') {
    const half = cols / 2;
    return grid.map((row) => Array.from({ length: half }, (_, x) => [...flipStack(row[half - 1 - x]!), ...row[half + x]!]));
  }
  if (direction === 'B') {
    const half = rows / 2;
    return Array.from({ length: half }, (_, y) => grid[y]!.map((stack, x) => [...flipStack(grid[rows - 1 - y]![x]!), ...stack]));
  }
  const half = rows / 2;
  return Array.from({ length: half }, (_, y) => grid[half + y]!.map((stack, x) => [...flipStack(grid[half - 1 - y]![x]!), ...stack]));
}

function applySequence(grid: Grid, sequence: Fold[]): Grid {
  return sequence.reduce((current, direction) => foldGrid(current, direction) ?? current, grid);
}

function visiblePage(leaf: Leaf) {
  return leaf.frontUp ? leaf.front : leaf.back;
}

function undersidePage(leaf: Leaf) {
  return leaf.frontUp ? leaf.back : leaf.front;
}

function signature(grid: Grid) {
  if (grid.length !== 1 || grid[0]!.length !== 1) return null;
  const stack = grid[0]![0]!;
  return {
    stack,
    top: visiblePage(stack[0]!),
    bottom: undersidePage(stack[stack.length - 1]!),
    edge: stack.map(visiblePage),
    key: stack.map((leaf) => `${leaf.id}:${leaf.frontUp ? 'F' : 'B'}`).join('|'),
  };
}

export function BinderyGame({ puzzleIndex, onPuzzleIndexChange, onBack }: BinderyGameProps) {
  const puzzle = binderyPuzzles[puzzleIndex] ?? binderyPuzzles[0]!;
  const initial = useMemo<FoldState>(() => ({ grid: makeGrid(puzzle.rows,puzzle.cols,puzzle.front,puzzle.back), folds: [] }), [puzzle]);
  const targetGrid = useMemo(() => applySequence(makeGrid(puzzle.rows,puzzle.cols,puzzle.front,puzzle.back), (canonical[puzzleIndex] ?? canonical[0]!)), [puzzle,puzzleIndex]);
  const target = signature(targetGrid)!;
  const history = useHistory<FoldState>(initial);
  const [runState,setRunState]=useState<RunState>('idle');
  const [status,setStatus]=useState('Fold from an outside edge. Nothing else in the shop is part of this puzzle.');

  const currentSig = signature(history.state.grid);
  const doFold = (direction: Fold) => {
    const next = foldGrid(history.state.grid,direction);
    if (!next) return;
    history.commit({ grid: next, folds: [...history.state.folds,direction] });
    setRunState('idle');
    setStatus(next.length===1 && next[0]!.length===1 ? 'Signature folded. Compare it with the approved dummy.' : 'Crease made.');
  };

  const run = () => {
    const result = signature(history.state.grid);
    if (!result) { setRunState('failure'); setStatus('The sheet is not yet a finished signature. Keep folding.'); return; }
    if (result.key !== target.key) {
      setRunState('failure');
      if (result.top !== target.top) setStatus(`Outside front is page ${result.top}; the approved dummy starts with page ${target.top}.`);
      else if (result.bottom !== target.bottom) setStatus(`Outside back is page ${result.bottom}; the approved dummy ends with page ${target.bottom}.`);
      else setStatus('The covers are right, but the leaves are nested in the wrong order. Unfold and revise the sequence.');
      return;
    }
    setRunState('running');
    setStatus('Checking the dummy against the press form…');
    window.setTimeout(()=>{setRunState('success');setStatus(`Approved. ${history.state.folds.length} folds, no extra operations.`)},500);
  };

  const rows = history.state.grid.length;
  const cols = history.state.grid[0]!.length;

  return (
    <GameFrame
      gameId="bindery"
      gameTitle="Bellweather Bindery"
      workshop="Bellweather & Co. / Folding Room"
      puzzle={puzzle}
      puzzleIndex={puzzleIndex}
      runState={runState}
      status={status}
      metric={`${history.state.folds.length} folds`}
      onBack={onBack}
      onPuzzle={onPuzzleIndexChange}
      onRun={run}
      onUndo={() => { history.undo(); setRunState('idle'); }}
      onRedo={() => { history.redo(); setRunState('idle'); }}
      onReset={() => { history.reset(initial); setRunState('idle'); setStatus('Fresh press sheet on the table.'); }}
      canUndo={history.canUndo}
      canRedo={history.canRedo}
      hint={puzzleIndex===0 ? <><strong>The entire mechanic is folding.</strong> The arrow means “bring this outside edge inward.” Paper above other paper stays above it unless the fold turns it over.</> : undefined}
    >
      <div className="bindery-table">
        <section className="approved-dummy" aria-label="Approved finished dummy">
          <div className="dummy-label">APPROVED DUMMY</div>
          <div className="dummy-book" style={{'--leaves':Math.min(target.stack.length,16)} as React.CSSProperties}>
            {target.stack.slice(0,8).map((leaf,index)=><span key={leaf.id} style={{transform:`translate(${index*1.2}px, ${index*1.2}px)`}} />)}
            <div className="dummy-cover"><small>FRONT</small><strong>{target.top}</strong></div>
          </div>
          <div className="dummy-spec"><span>outside back</span><b>{target.bottom}</b><span>leaves</span><b>{target.stack.length}</b></div>
          <div className="fore-edge">{target.edge.slice(0,12).map((page,index)=><i key={index}>{page}</i>)}</div>
        </section>

        <section className="folding-station">
          <button className="fold-handle top" onClick={()=>doFold('T')} disabled={rows<2} aria-label="Fold top edge inward"><span>↓</span></button>
          <button className="fold-handle left" onClick={()=>doFold('L')} disabled={cols<2} aria-label="Fold left edge inward"><span>→</span></button>
          <div className="paper-grid" style={{gridTemplateColumns:`repeat(${cols}, minmax(0,1fr))`,gridTemplateRows:`repeat(${rows}, minmax(0,1fr))`}}>
            {history.state.grid.flatMap((row,y)=>row.map((stack,x)=>{
              const leaf=stack[0]!;
              return <div className="paper-panel" key={`${x}-${y}-${history.state.folds.length}`} style={{'--depth':Math.min(stack.length,8)} as React.CSSProperties}>
                <span className="registration">{String.fromCharCode(65+y)}{x+1}</span>
                <strong>{visiblePage(leaf)}</strong>
                <small>{stack.length>1?`${stack.length} leaves`:'press side'}</small>
              </div>;
            }))}
          </div>
          <button className="fold-handle right" onClick={()=>doFold('R')} disabled={cols<2} aria-label="Fold right edge inward"><span>←</span></button>
          <button className="fold-handle bottom" onClick={()=>doFold('B')} disabled={rows<2} aria-label="Fold bottom edge inward"><span>↑</span></button>
          <div className="fold-history" aria-label="Fold sequence">{history.state.folds.length ? history.state.folds.map((fold,index)=><span key={index}>{fold}</span>) : <em>no creases yet</em>}</div>
        </section>

        <section className="current-dummy" aria-label="Current outside faces">
          <div><span>YOUR FRONT</span><strong>{currentSig?.top ?? '—'}</strong></div>
          <div><span>YOUR BACK</span><strong>{currentSig?.bottom ?? '—'}</strong></div>
        </section>
      </div>
    </GameFrame>
  );
}
