import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkbenchShell } from '../../components/WorkbenchShell';
import { useHistory } from '../../core/useHistory';
import type { CompletionRecord, Notebook } from '../../core/types';
import { rigMetrics, validateRig, type RigPoint, type RigSolution } from './model';
import { riggingPuzzles } from './puzzles';

export function RiggingGame({
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
  onComplete: (game: 'rigging', puzzleId: string, completion: CompletionRecord) => void;
}) {
  const puzzle = riggingPuzzles[puzzleIndex]!;
  const history = useHistory<RigSolution>({ path: ['tie'] });
  const [status, setStatus] = useState<{ kind: 'idle' | 'error' | 'running' | 'success'; text: string }>({ kind: 'idle', text: 'The standing end is tied. Reeve from the live end.' });
  const [routing, setRouting] = useState(false);
  const [pointer, setPointer] = useState({ x: 10, y: 12 });
  const [runProgress, setRunProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const startedAt = useRef(performance.now());
  const attempts = useRef(0);
  const undos = useRef(0);

  useEffect(() => {
    history.reset({ path: ['tie'] });
    setStatus({ kind: 'idle', text: 'The standing end is tied. Reeve from the live end.' });
    setRouting(false);
    setRunProgress(0);
    startedAt.current = performance.now();
    attempts.current = 0;
    undos.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);

  const completed = useMemo(() => new Set(riggingPuzzles.map((entry, index) => notebook.completions.rigging?.[entry.id] ? index : -1).filter((value) => value >= 0)), [notebook]);
  const pointById = useMemo(() => new Map(puzzle.points.map((point) => [point.id, point])), [puzzle.points]);
  const liftScreen = Math.min(19, puzzle.lift * 1.05);
  const renderPoint = useCallback((point: RigPoint) => point.kind === 'load' ? { ...point, y: point.y - liftScreen * runProgress } : point, [liftScreen, runProgress]);
  const currentTailId = history.value.path.at(-1) ?? 'tie';
  const currentTail = renderPoint(pointById.get(currentTailId)!);
  const used = useMemo(() => new Set(history.value.path), [history.value.path]);
  const metrics = rigMetrics(puzzle, history.value);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  }, []);

  useEffect(() => {
    if (!routing) return;
    const move = (event: PointerEvent) => setPointer(clientToSvg(event.clientX, event.clientY));
    const up = (event: PointerEvent) => {
      const end = clientToSvg(event.clientX, event.clientY);
      const candidates = puzzle.points
        .filter((point) => point.id !== currentTailId && point.id !== 'tie' && !used.has(point.id))
        .map((point) => ({ point, distance: Math.hypot(point.x - end.x, point.y - end.y) }))
        .sort((a, b) => a.distance - b.distance);
      const nearest = candidates[0];
      if (nearest && nearest.distance < 5) {
        history.commit((current) => ({ path: [...current.path, nearest.point.id] }));
        setStatus({ kind: 'idle', text: nearest.point.kind === 'hand' ? 'Hand line reached. Ready to test the lift.' : `Line through ${nearest.point.label}.` });
      }
      setRouting(false);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [clientToSvg, currentTailId, history, puzzle.points, routing, used]);

  useEffect(() => {
    if (status.kind !== 'running') return;
    if (runProgress >= 1) {
      const timer = window.setTimeout(() => {
        setStatus({ kind: 'success', text: 'The scenery reached trim without fouling or overloading the crew.' });
        if (!notebook.completions.rigging?.[puzzle.id]) {
          const finalMetrics = rigMetrics(puzzle, history.value);
          onComplete('rigging', puzzle.id, {
            solvedAt: new Date().toISOString(), elapsedMs: Math.round(performance.now() - startedAt.current), attempts: attempts.current, undos: undos.current,
            score: { primary: Math.round(finalMetrics.rope), secondary: finalMetrics.blocks, tertiary: Math.round(finalMetrics.effort) },
          });
        }
      }, 260);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setRunProgress((value) => Math.min(1, value + 0.04)), 28);
    return () => window.clearTimeout(timer);
  }, [history.value, notebook.completions.rigging, onComplete, puzzle, runProgress, status.kind]);

  const run = useCallback(() => {
    attempts.current += 1;
    setRunProgress(0);
    const error = validateRig(puzzle, history.value);
    if (error) { setStatus({ kind: 'error', text: error }); return; }
    setStatus({ kind: 'running', text: 'Taking the strain…' });
  }, [history.value, puzzle]);

  const undo = useCallback(() => { if (history.canUndo) { undos.current += 1; history.undo(); setRunProgress(0); setStatus({ kind: 'idle', text: 'Last reeve removed.' }); } }, [history]);
  const redo = useCallback(() => { if (history.canRedo) { history.redo(); setRunProgress(0); setStatus({ kind: 'idle', text: 'Reeve restored.' }); } }, [history]);
  const removeTail = useCallback(() => {
    if (history.value.path.length <= 1) return;
    history.commit((current) => ({ path: current.path.slice(0, -1) }));
    setStatus({ kind: 'idle', text: 'Line pulled back one block.' });
  }, [history]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
      else if ((event.key === 'Backspace' || event.key === 'Delete') && !command) { event.preventDefault(); removeTail(); }
      else if (event.key.toLowerCase() === 'r' && !command) { event.preventDefault(); run(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [redo, removeTail, run, undo]);

  const pathPoints = history.value.path.map((id) => renderPoint(pointById.get(id)!));
  const ropePath = pathPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const draftPath = routing ? `${ropePath} L ${pointer.x} ${pointer.y}` : ropePath;

  const side = status.kind === 'success' ? (
    <div className="side-stack success-side">
      <div className="inspection-stamp">CUE READY</div>
      <h2>It flies clean.</h2>
      <p>The crew can run the cue. Now decide whether you like the reeve: fewer blocks, less hemp, or a line that simply looks right.</p>
      <div className="score-triple"><div><span>ROPE</span><strong>{Math.round(metrics.rope)}</strong><small>ft</small></div><div><span>BLOCKS</span><strong>{metrics.blocks}</strong><small>used</small></div><div><span>EFFORT</span><strong>{Math.round(metrics.effort)}</strong><small>lb</small></div></div>
      <button className="primary-action full" onClick={() => onPuzzleIndexChange(Math.min(riggingPuzzles.length - 1, puzzleIndex + 1))}>{puzzleIndex === riggingPuzzles.length - 1 ? 'Run it again' : 'Next cue →'}</button>
    </div>
  ) : (
    <div className="side-stack">
      <section className="rule-card">
        <span className="eyebrow">THE ONLY OPERATION</span>
        <h2>Reeve the line.</h2>
        <p>Drag the live rope end through any available block. Fixed blocks redirect. Blocks attached to the scenery move with it.</p>
        <p>Every upward rope segment at a moving block shares the load. More support means less hand effort — and more rope to haul.</p>
      </section>
      <section className="limit-card">
        <span className="eyebrow">CUE LIMITS</span>
        <div className="limit-grid"><span>SCENERY <b>{puzzle.weight} lb</b></span><span>LIFT <b>{puzzle.lift} ft</b></span><span>HAND EFFORT <b>≤ {puzzle.constraints.maxEffort} lb</b></span><span>HAND TRAVEL <b>≤ {puzzle.constraints.maxPull} ft</b></span><span>HEMP <b>≤ {puzzle.constraints.maxRope} ft</b></span><span>BLOCKS <b>≤ {puzzle.constraints.maxBlocks}</b></span></div>
      </section>
      <section className={`status-card status-card--${status.kind}`} aria-live="polite"><span className="eyebrow">HEAD FLYMAN</span><p>{status.text}</p></section>
      <div className="live-score live-score--rig"><span>EFFORT <b>{Number.isFinite(metrics.effort) ? Math.round(metrics.effort) : '—'}</b></span><span>PULL <b>{Number.isFinite(metrics.pull) ? Math.round(metrics.pull) : '—'}</b></span><span>ROPE <b>{Math.round(metrics.rope)}</b></span></div>
    </div>
  );

  return (
    <WorkbenchShell
      theme="rigging" gameTitle="Orpheum Fly Loft" gameSubtitle="hemp stage house · 1908"
      puzzle={puzzle} puzzleIndex={puzzleIndex} total={riggingPuzzles.length} completed={completed}
      onSelectPuzzle={onPuzzleIndexChange} onBack={onBack}
      onUndo={undo} onRedo={redo} onReset={() => { history.reset({ path: ['tie'] }); setRunProgress(0); setStatus({ kind: 'idle', text: 'Fresh line. Standing end tied.' }); }}
      canUndo={history.canUndo} canRedo={history.canRedo} action={run} actionLabel={status.kind === 'running' ? 'Flying…' : 'Take the strain'} actionDisabled={history.value.path.at(-1) !== 'hand' || status.kind === 'running'}
      shortcutHint="Drag the bright live end to the next block · Backspace pulls the line back · R tests the lift · ⌘/Ctrl Z undoes"
      side={side}
    >
      <div className="rigging-bench">
        <div className="board-caption"><span>SECTION THROUGH FLY LOFT · {puzzle.scenery.toUpperCase()}</span><span>C.G. {puzzle.centerOfMassX.toFixed(0)}%</span></div>
        <svg ref={svgRef} className="rigging-plot" viewBox="0 0 100 100">
          <defs>
            <pattern id="rig-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="currentColor" strokeWidth="0.07"/></pattern>
            <filter id="rope-shadow"><feDropShadow dx="0.3" dy="0.5" stdDeviation="0.35" floodOpacity="0.32"/></filter>
          </defs>
          <rect x="0" y="0" width="100" height="100" className="rig-grid-bg" fill="url(#rig-grid)"/>
          <path className="gridiron" d="M4 8H96M12 8v5M24 8v5M36 8v5M48 8v5M60 8v5M72 8v5M84 8v5"/>
          <path className="stage-floor" d="M3 88H97"/>
          <text className="plot-label" x="5" y="6">GRID</text><text className="plot-label" x="5" y="86">STAGE</text>

          {puzzle.obstacles.map((obstacle) => <g key={obstacle.label} className="rig-obstacle"><rect x={obstacle.x} y={obstacle.y} width={obstacle.w} height={obstacle.h}/><text x={obstacle.x + obstacle.w / 2} y={obstacle.y + obstacle.h / 2 + 1} textAnchor="middle">{obstacle.label}</text></g>)}

          <g className="scenery" transform={`translate(0 ${-liftScreen * runProgress})`}>
            <rect x="18" y="72" width="64" height="8" rx="1.2"/>
            <path d="M18 72l6-5h52l6 5"/>
            <text x="50" y="77" textAnchor="middle">{puzzle.scenery.toUpperCase()}</text>
            <path className="cg-mark" d={`M${puzzle.centerOfMassX} 65v7m-2-4 2 4 2-4`}/>
          </g>

          <path className="rope-line rope-line--shadow" d={draftPath} filter="url(#rope-shadow)"/>
          <path className="rope-line" d={draftPath}/>

          {puzzle.points.map((rawPoint) => {
            const point = renderPoint(rawPoint);
            const isUsed = used.has(point.id);
            const isTail = point.id === currentTailId;
            if (point.kind === 'tie') return <g key={point.id} className="tie-point"><path d={`M${point.x - 2} ${point.y - 2}l4 4m0-4l-4 4`}/><text x={point.x + 3} y={point.y - 2}>TIE OFF</text></g>;
            if (point.kind === 'hand') return <g key={point.id} className={`hand-point${isUsed ? ' hand-point--used' : ''}`}><circle cx={point.x} cy={point.y} r="2.2"/><path d={`M${point.x} ${point.y + 2}v7`}/><text x={point.x - 2} y={point.y + 11} textAnchor="end">HAND LINE</text></g>;
            return <g key={point.id} className={`rig-block rig-block--${point.kind}${isUsed ? ' rig-block--used' : ''}`} transform={`translate(${point.x} ${point.y})`}>
              <circle className="rig-block__outer" r="3.2"/><circle className="rig-block__wheel" r="1.8" transform={`rotate(${runProgress * 720})`}/><path d="M-1.5 0h3M0-1.5v3"/><text x="0" y={point.kind === 'fixed' ? -5 : 6.5} textAnchor="middle">{point.label}</text>
            </g>;
          })}

          {currentTail && history.value.path.at(-1) !== 'hand' && status.kind !== 'running' ? <circle className="live-rope-end" cx={currentTail.x} cy={currentTail.y} r="3.3" onPointerDown={(event) => { event.preventDefault(); setRouting(true); setPointer({ x: currentTail.x, y: currentTail.y }); }}/>: null}
        </svg>
        <div className="reeve-sequence" aria-label="Rope path">
          {history.value.path.map((id, index) => <span key={`${id}-${index}`}><b>{index + 1}</b>{pointById.get(id)?.label}</span>)}
          {history.value.path.length > 1 && status.kind !== 'running' ? <button onClick={removeTail}>pull back</button> : null}
        </div>
      </div>
    </WorkbenchShell>
  );
}
