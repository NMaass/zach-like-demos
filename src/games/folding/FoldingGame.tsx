import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkbenchShell } from '../../components/WorkbenchShell';
import { useHistory } from '../../core/useHistory';
import type { CompletionRecord, Notebook } from '../../core/types';
import { foldPaper, initialPaper, isPaperSolved, legalFoldCounts, type FoldEdge, type FoldOp, type PaperState } from './model';
import { foldingPuzzles } from './puzzles';

function layerLabel(id: string, panelLabels: string[], cols: number): string {
  const [rowRaw, colRaw] = id.split(':');
  const index = Number(rowRaw) * cols + Number(colRaw);
  return panelLabels[index] ?? String(index + 1);
}

function PaperDrawing({ state, panelLabels, originalCols, compact = false }: { state: PaperState; panelLabels: string[]; originalCols: number; compact?: boolean }) {
  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 1;
  return (
    <svg className={compact ? 'paper-drawing paper-drawing--compact' : 'paper-drawing'} viewBox={`0 0 ${cols * 100} ${rows * 100}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={compact ? 'paperNoiseMini' : 'paperNoise'} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="8" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
          <feComponentTransfer in="mono"><feFuncA type="table" tableValues="0 0.045"/></feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply"/>
        </filter>
      </defs>
      {state.grid.map((row, rowIndex) => row.map((cell, colIndex) => {
        const top = cell[0]!;
        const label = layerLabel(top.id, panelLabels, originalCols);
        const stack = Math.min(6, cell.length - 1);
        const x = colIndex * 100; const y = rowIndex * 100;
        return (
          <g key={`${rowIndex}:${colIndex}`} transform={`translate(${x} ${y})`}>
            {Array.from({ length: stack }, (_, index) => <rect key={index} className="paper-layer-shadow" x={2 + index * 0.9} y={3 + index * 0.9} width="96" height="94" rx="1.6"/>)}
            <g transform={`rotate(${top.rotation} 50 50)`}>
              <rect className={`paper-panel paper-panel--${top.face}`} x="1" y="1" width="96" height="96" rx="1.6" filter={`url(#${compact ? 'paperNoiseMini' : 'paperNoise'})`}/>
              <path className="paper-print-rule" d="M13 20H87M13 77H87"/>
              <path className="paper-print-furniture" d="M18 31h20v11H18zM62 31h20M62 37h20M62 43h15M18 57C35 47 52 69 82 53"/>
              <text className="paper-face-mark" x="50" y="13" textAnchor="middle">{top.face === 'front' ? 'RECTO' : 'VERSO'}</text>
              <text className="paper-panel-label" x="50" y="55" textAnchor="middle">{label}</text>
              {!compact ? <text className="paper-stack-count" x="86" y="90" textAnchor="end">{cell.length > 1 ? `${cell.length} leaves` : ''}</text> : null}
            </g>
          </g>
        );
      }))}
    </svg>
  );
}

function PacketIndex({ state, panelLabels, originalCols }: { state: PaperState; panelLabels: string[]; originalCols: number }) {
  const cells = state.grid.flat();
  return (
    <div className="packet-index" aria-label="Approved leaf order, top to bottom">
      {cells.map((cell, cellIndex) => (
        <div className="packet-index__cell" key={cellIndex}>
          <span className="packet-index__cell-number">{cells.length > 1 ? `PACKET ${cellIndex + 1}` : 'LEAF ORDER'}</span>
          <div>
            {cell.map((layer, layerIndex) => (
              <i key={`${layer.id}-${layerIndex}`} title={`${layer.face}, ${layer.rotation} degrees`}>
                <b>{layerIndex + 1}</b><span>{layerLabel(layer.id, panelLabels, originalCols)}</span><em>{layer.face === 'front' ? 'R' : 'V'} · {layer.rotation}°</em>
              </i>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FoldingGame({
  puzzleIndex,
  onPuzzleIndexChange,
  onBack,
  notebook,
  onComplete,
}: {
  puzzleIndex: number;
  onPuzzleIndexChange: (index: number) => void;
  onBack: () => void;
  notebook: Notebook;
  onComplete: (game: 'folding', puzzleId: string, completion: CompletionRecord) => void;
}) {
  const puzzle = foldingPuzzles[puzzleIndex]!;
  const history = useHistory<PaperState>(initialPaper(puzzle.rows, puzzle.cols));
  const [status, setStatus] = useState('Take any outside edge and fold it to a panel line.');
  const [drag, setDrag] = useState<{ edge: FoldEdge; count: number; startX: number; startY: number; distance: number } | null>(null);
  const startedAt = useRef(performance.now());
  const undos = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    history.reset(initialPaper(puzzle.rows, puzzle.cols));
    setStatus('Take any outside edge and fold it to a panel line.');
    setDrag(null);
    startedAt.current = performance.now();
    undos.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);

  const solved = isPaperSolved(history.value, puzzle.target);
  const completed = useMemo(() => new Set(foldingPuzzles.map((entry, index) => notebook.completions.folding?.[entry.id] ? index : -1).filter((value) => value >= 0)), [notebook]);

  useEffect(() => {
    if (!solved || notebook.completions.folding?.[puzzle.id]) return;
    onComplete('folding', puzzle.id, {
      solvedAt: new Date().toISOString(),
      elapsedMs: Math.round(performance.now() - startedAt.current),
      attempts: history.value.moves.length,
      undos: undos.current,
      score: { primary: history.value.moves.length, secondary: history.value.effort },
    });
  }, [history.value.effort, history.value.moves.length, notebook.completions.folding, onComplete, puzzle.id, solved]);

  const startFold = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (solved) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const edgeBand = Math.min(34, Math.min(rect.width, rect.height) * 0.09);
    const distances: { edge: FoldEdge; value: number }[] = [
      { edge: 'left', value: localX }, { edge: 'right', value: rect.width - localX },
      { edge: 'top', value: localY }, { edge: 'bottom', value: rect.height - localY },
    ];
    const nearest = distances.sort((a, b) => a.value - b.value)[0]!;
    if (nearest.value > edgeBand || legalFoldCounts(history.value, nearest.edge).length === 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ edge: nearest.edge, count: 1, startX: event.clientX, startY: event.clientY, distance: 0 });
  }, [history.value, solved]);

  const moveFold = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rows = history.value.grid.length;
    const cols = history.value.grid[0]?.length ?? 1;
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;
    const delta = drag.edge === 'left' ? event.clientX - drag.startX
      : drag.edge === 'right' ? drag.startX - event.clientX
      : drag.edge === 'top' ? event.clientY - drag.startY
      : drag.startY - event.clientY;
    const cell = drag.edge === 'left' || drag.edge === 'right' ? cellW : cellH;
    const max = legalFoldCounts(history.value, drag.edge).at(-1) ?? 1;
    const count = Math.max(1, Math.min(max, Math.round(Math.max(0, delta) / Math.max(1, cell * 1.65)) || 1));
    setDrag((current) => current ? { ...current, count, distance: Math.max(0, delta) } : current);
  }, [drag, history.value]);

  const finishFold = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.distance < 14) { setDrag(null); return; }
    const op: FoldOp = { edge: drag.edge, count: drag.count };
    const next = foldPaper(history.value, op);
    if (next !== history.value) {
      history.commit(next);
      setStatus(`${drag.edge[0]!.toUpperCase()}${drag.edge.slice(1)} edge folded ${drag.count} panel${drag.count === 1 ? '' : 's'}.`);
    }
    setDrag(null);
  }, [drag, history]);

  const undo = useCallback(() => { if (history.canUndo) { undos.current += 1; history.undo(); setStatus('Fold opened again.'); } }, [history]);
  const redo = useCallback(() => { if (history.canRedo) { history.redo(); setStatus('Fold restored.'); } }, [history]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [redo, undo]);

  const currentRows = history.value.grid.length;
  const currentCols = history.value.grid[0]?.length ?? 1;

  const previewStyle = drag ? (() => {
    const percentX = (drag.count / currentCols) * 100;
    const percentY = (drag.count / currentRows) * 100;
    if (drag.edge === 'left') return { left: 0, top: 0, width: `${percentX}%`, height: '100%' };
    if (drag.edge === 'right') return { right: 0, top: 0, width: `${percentX}%`, height: '100%' };
    if (drag.edge === 'top') return { left: 0, top: 0, width: '100%', height: `${percentY}%` };
    return { left: 0, bottom: 0, width: '100%', height: `${percentY}%` };
  })() : undefined;

  const side = solved ? (
    <div className="side-stack success-side">
      <div className="inspection-stamp">MATCHES DUMMY</div>
      <h2>The packet is right.</h2>
      <p>Open it again if you want a lighter sequence. A correct fold is only the first answer.</p>
      <div className="score-pair"><div><span>FOLDS</span><strong>{history.value.moves.length}</strong><small>operations</small></div><div><span>HAND-LOAD</span><strong>{history.value.effort}</strong><small>shop units</small></div></div>
      <button className="primary-action full" onClick={() => onPuzzleIndexChange(Math.min(foldingPuzzles.length - 1, puzzleIndex + 1))}>{puzzleIndex === foldingPuzzles.length - 1 ? 'Keep this copy' : 'Next work order →'}</button>
    </div>
  ) : (
    <div className="side-stack">
      <section className="rule-card">
        <span className="eyebrow">THE WHOLE VOCABULARY</span>
        <h2>Fold from an edge.</h2>
        <p>Grab the outside edge of the sheet and pull inward. It snaps to legal panel lines. A fold flips the moving layers and reverses their stack order.</p>
        <p>There is no cut, glue, rotate, or “page” command. If the dummy can be made, folds alone make it.</p>
      </section>
      <section className="dummy-card">
        <span className="eyebrow">APPROVED DUMMY</span>
        <div className="dummy-preview"><PaperDrawing state={puzzle.target} panelLabels={puzzle.panelLabels} originalCols={puzzle.cols} compact/></div>
        <PacketIndex state={puzzle.target} panelLabels={puzzle.panelLabels} originalCols={puzzle.cols}/>
        <div className="dummy-spec"><span>{puzzle.delivery}</span><span>{puzzle.stock}</span><span>{puzzle.ink}</span></div>
      </section>
      <section className="status-card" aria-live="polite"><span className="eyebrow">FOREWOMAN</span><p>{status}</p></section>
      <div className="live-score"><span>FOLDS <b>{history.value.moves.length}</b></span><span>HAND-LOAD <b>{history.value.effort}</b></span></div>
    </div>
  );

  return (
    <WorkbenchShell
      theme="folding" gameTitle="Bellweather Folding Room" gameSubtitle="commercial print shop · 1927"
      puzzle={puzzle} puzzleIndex={puzzleIndex} total={foldingPuzzles.length} completed={completed}
      onSelectPuzzle={onPuzzleIndexChange} onBack={onBack}
      onUndo={undo} onRedo={redo} onReset={() => { history.reset(initialPaper(puzzle.rows, puzzle.cols)); setStatus('Fresh sheet on the table.'); }}
      canUndo={history.canUndo} canRedo={history.canRedo}
      shortcutHint="Grab any outside paper edge and pull it inward · release when the intended panels are shaded · ⌘/Ctrl Z opens the last fold"
      side={side}
    >
      <div className="folding-bench">
        <div className="board-caption"><span>FOLDING TABLE · {puzzle.stock.toUpperCase()}</span><span>{currentCols} × {currentRows} PACKET</span></div>
        <div
          ref={stageRef}
          className={`paper-stage${drag ? ' paper-stage--dragging' : ''}`}
          style={{ aspectRatio: `${currentCols} / ${currentRows}` }}
          onPointerDown={startFold}
          onPointerMove={moveFold}
          onPointerUp={finishFold}
          onPointerCancel={() => setDrag(null)}
        >
          <PaperDrawing state={history.value} panelLabels={puzzle.panelLabels} originalCols={puzzle.cols}/>
          {drag ? <div className={`fold-preview fold-preview--${drag.edge}`} style={previewStyle}><span>{drag.count} panel{drag.count === 1 ? '' : 's'}</span></div> : null}
          <span className="edge-cue edge-cue--left" aria-hidden="true"/><span className="edge-cue edge-cue--right" aria-hidden="true"/><span className="edge-cue edge-cue--top" aria-hidden="true"/><span className="edge-cue edge-cue--bottom" aria-hidden="true"/>
        </div>
        <div className="fold-history" aria-label="Fold sequence">
          {history.value.moves.length === 0 ? <span className="fold-history-empty">No creases yet.</span> : history.value.moves.map((move, index) => <span key={index}>{index + 1}<b>{move.edge[0]!.toUpperCase()}</b>{move.count}</span>)}
        </div>
      </div>
    </WorkbenchShell>
  );
}
