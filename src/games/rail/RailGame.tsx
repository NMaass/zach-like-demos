import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkbenchShell } from '../../components/WorkbenchShell';
import { useHistory } from '../../core/useHistory';
import type { CompletionRecord, Notebook } from '../../core/types';
import { railPuzzles } from './puzzles';
import {
  parseSwitchPort,
  railLength,
  runRail,
  switchPortId,
  targetPortId,
  type RailConnection,
  type RailPuzzle,
  type RailSolution,
  type SwitchPort,
} from './model';

const switchOffsets: Record<SwitchPort, { x: number; y: number }> = {
  stem: { x: -5.2, y: 0 },
  a: { x: 5.2, y: -3.8 },
  b: { x: 5.2, y: 3.8 },
};

function initialSolution(puzzle: RailPuzzle): RailSolution {
  return {
    switches: Array.from({ length: puzzle.switches }, (_, index) => ({
      id: `s${index}`,
      x: 34 + (index % 2) * 24,
      y: 28 + Math.floor(index / 2) * 29,
      branch: puzzle.canonicalBranches?.[index] ?? 'a',
    })),
    connections: [],
  };
}

function connectionKey(connection: RailConnection): string {
  return [connection.a, connection.b].sort().join('|');
}

function curvePath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const bend = Math.max(8, Math.abs(b.x - a.x) * 0.45);
  const sign = b.x >= a.x ? 1 : -1;
  return `M ${a.x} ${a.y} C ${a.x + bend * sign} ${a.y}, ${b.x - bend * sign} ${b.y}, ${b.x} ${b.y}`;
}

export function RailGame({
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
  onComplete: (game: 'rail', puzzleId: string, completion: CompletionRecord) => void;
}) {
  const puzzle = railPuzzles[puzzleIndex]!;
  const history = useHistory<RailSolution>(initialSolution(puzzle));
  const [status, setStatus] = useState<{ kind: 'idle' | 'error' | 'running' | 'success'; text: string }>({ kind: 'idle', text: 'Ready for the shove.' });
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [drag, setDrag] = useState<{ index: number; x: number; y: number; startX: number; startY: number } | null>(null);
  const [timeline, setTimeline] = useState<{ carId: string; portId: string }[]>([]);
  const [timelineIndex, setTimelineIndex] = useState(-1);
  const attempts = useRef(0);
  const undos = useRef(0);
  const startedAt = useRef(performance.now());
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    history.reset(initialSolution(puzzle));
    setStatus({ kind: 'idle', text: 'Ready for the shove.' });
    setDraftStart(null);
    setDrag(null);
    setTimeline([]);
    setTimelineIndex(-1);
    attempts.current = 0;
    undos.current = 0;
    startedAt.current = performance.now();
    // history.reset is intentionally stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);

  const completed = useMemo(() => new Set(railPuzzles.map((entry, index) => notebook.completions.rail?.[entry.id] ? index : -1).filter((value) => value >= 0)), [notebook]);

  const solution: RailSolution = useMemo(() => {
    if (!drag) return history.value;
    return {
      ...history.value,
      switches: history.value.switches.map((sw, index) => index === drag.index ? { ...sw, x: drag.x, y: drag.y } : sw),
    };
  }, [drag, history.value]);

  const pointForPort = useCallback((id: string) => {
    if (id === 'in') return { x: 4.5, y: 50 };
    if (id.startsWith('out:')) {
      const index = puzzle.targets.findIndex((target) => target.id === id.slice(4));
      return { x: 95.5, y: 18 + (index * 64) / Math.max(1, puzzle.targets.length - 1) };
    }
    const parsed = parseSwitchPort(id);
    if (!parsed) return null;
    const sw = solution.switches[parsed.index];
    if (!sw) return null;
    const offset = switchOffsets[parsed.port];
    return { x: sw.x + offset.x, y: sw.y + offset.y };
  }, [puzzle.targets, solution.switches]);

  const allPorts = useMemo(() => {
    const ports = ['in', ...puzzle.targets.map((target) => targetPortId(target.id))];
    for (let index = 0; index < puzzle.switches; index += 1) ports.push(switchPortId(index, 'stem'), switchPortId(index, 'a'), switchPortId(index, 'b'));
    return ports;
  }, [puzzle]);

  const occupied = useMemo(() => new Set(history.value.connections.flatMap((connection) => [connection.a, connection.b])), [history.value.connections]);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  }, []);

  useEffect(() => {
    if (!draftStart && !drag) return;
    const move = (event: PointerEvent) => {
      const next = clientToSvg(event.clientX, event.clientY);
      setPointer(next);
      if (drag) setDrag((current) => current ? { ...current, x: Math.max(18, Math.min(82, next.x)), y: Math.max(12, Math.min(88, next.y)) } : current);
    };
    const up = (event: PointerEvent) => {
      const end = clientToSvg(event.clientX, event.clientY);
      if (drag) {
        if (Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 0.3) {
          history.commit((current) => ({
            ...current,
            switches: current.switches.map((sw, index) => index === drag.index ? { ...sw, x: drag.x, y: drag.y } : sw),
          }));
          setStatus({ kind: 'idle', text: 'Turnout moved.' });
        }
        setDrag(null);
        return;
      }
      if (draftStart) {
        const nearest = allPorts
          .filter((id) => id !== draftStart && !occupied.has(id))
          .map((id) => ({ id, point: pointForPort(id) }))
          .filter((item): item is { id: string; point: { x: number; y: number } } => Boolean(item.point))
          .map((item) => ({ ...item, distance: Math.hypot(item.point.x - end.x, item.point.y - end.y) }))
          .sort((a, b) => a.distance - b.distance)[0];
        if (nearest && nearest.distance < 4.6) {
          history.commit((current) => ({ ...current, connections: [...current.connections, { a: draftStart, b: nearest.id }] }));
          setStatus({ kind: 'idle', text: 'Rail joined.' });
        }
        setDraftStart(null);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: false });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [allPorts, clientToSvg, draftStart, drag, history, occupied, pointForPort]);

  useEffect(() => {
    if (status.kind !== 'running' || timeline.length === 0) return;
    if (timelineIndex >= timeline.length - 1) {
      const timer = window.setTimeout(() => {
        setStatus({ kind: 'success', text: 'Every car is on the marked road.' });
        const current = runRail(puzzle, history.value);
        if (current.ok && !notebook.completions.rail?.[puzzle.id]) {
          onComplete('rail', puzzle.id, {
            solvedAt: new Date().toISOString(),
            elapsedMs: Math.round(performance.now() - startedAt.current),
            attempts: attempts.current,
            undos: undos.current,
            score: { primary: railLength(history.value, puzzle), secondary: history.value.connections.length },
          });
        }
      }, 260);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setTimelineIndex((current) => current + 1), 145);
    return () => window.clearTimeout(timer);
  }, [history.value, notebook.completions.rail, onComplete, puzzle, status.kind, timeline.length, timelineIndex]);

  const run = useCallback(() => {
    attempts.current += 1;
    const result = runRail(puzzle, history.value);
    if (!result.ok) {
      setStatus({ kind: 'error', text: result.error ?? 'The shove failed.' });
      setTimeline(result.routes.flatMap((route) => route.ports.map((portId) => ({ carId: route.carId, portId }))));
      setTimelineIndex(0);
      return;
    }
    const steps = result.routes.flatMap((route) => route.ports.map((portId) => ({ carId: route.carId, portId })));
    setTimeline(steps);
    setTimelineIndex(0);
    setStatus({ kind: 'running', text: 'Cars rolling. Watch the brass cams.' });
  }, [history.value, puzzle]);

  const undo = useCallback(() => { if (history.canUndo) { undos.current += 1; history.undo(); setStatus({ kind: 'idle', text: 'Last change lifted.' }); } }, [history]);
  const redo = useCallback(() => { if (history.canRedo) { history.redo(); setStatus({ kind: 'idle', text: 'Change restored.' }); } }, [history]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      } else if (event.key.toLowerCase() === 'r' && !command) {
        event.preventDefault();
        run();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [redo, run, undo]);

  const currentStep = timelineIndex >= 0 ? timeline[timelineIndex] : undefined;
  const currentCar = currentStep ? puzzle.incoming.find((car) => car.id === currentStep.carId) : undefined;
  const currentPoint = currentStep ? pointForPort(currentStep.portId) : null;
  const feet = railLength(history.value, puzzle);

  const side = status.kind === 'success' ? (
    <div className="side-stack success-side">
      <div className="inspection-stamp">ACCEPTED</div>
      <h2>Yard test passed.</h2>
      <p>The interesting question begins now: can you make the same classification with less iron or a cleaner ladder?</p>
      <div className="score-pair"><div><span>RAIL</span><strong>{feet}</strong><small>plan units</small></div><div><span>JOINTS</span><strong>{history.value.connections.length}</strong><small>connections</small></div></div>
      <button className="primary-action full" onClick={() => onPuzzleIndexChange(Math.min(railPuzzles.length - 1, puzzleIndex + 1))}>{puzzleIndex === railPuzzles.length - 1 ? 'Stay with this yard' : 'Next work order →'}</button>
    </div>
  ) : (
    <div className="side-stack">
      <section className="rule-card">
        <span className="eyebrow">THE ONLY MECHANISM</span>
        <h2>Alternating points</h2>
        <svg className="turnout-rule" viewBox="0 0 180 80" aria-hidden="true"><path d="M12 40H76M76 40C110 40 120 16 166 16M76 40C110 40 120 64 166 64"/><circle cx="77" cy="40" r="8"/><path d="M73 43l12-10"/></svg>
        <p><strong>Facing:</strong> a car takes the brass lever’s route; the cam then advances to the other route.</p>
        <p><strong>Trailing:</strong> a car from either branch springs through to the stem without advancing the cam.</p>
      </section>
      <section className="manifest-card">
        <span className="eyebrow">CLASSIFICATION CARD</span>
        {puzzle.targets.map((target) => (
          <div className="manifest-row" key={target.id}><span>{target.label}</span><div>{target.expected.map((id) => <i key={id} title={puzzle.incoming.find((car) => car.id === id)?.label}>{puzzle.incoming.find((car) => car.id === id)?.mark}</i>)}</div></div>
        ))}
      </section>
      <section className={`status-card status-card--${status.kind}`} aria-live="polite">
        <span className="eyebrow">YARDMASTER</span><p>{status.text}</p>
      </section>
      <div className="live-score"><span>RAIL <b>{feet}</b></span><span>JOINTS <b>{history.value.connections.length}</b></span></div>
    </div>
  );

  return (
    <WorkbenchShell
      theme="rail" gameTitle="Coldwater Junction" gameSubtitle="automatic classification yard · 1912"
      puzzle={puzzle} puzzleIndex={puzzleIndex} total={railPuzzles.length} completed={completed}
      onSelectPuzzle={onPuzzleIndexChange} onBack={onBack}
      onUndo={undo} onRedo={redo} onReset={() => { history.reset(initialSolution(puzzle)); setStatus({ kind: 'idle', text: 'Board cleared.' }); }}
      canUndo={history.canUndo} canRedo={history.canRedo} action={run} actionLabel={status.kind === 'running' ? 'Rolling…' : 'Call for the shove'} actionDisabled={status.kind === 'running'}
      shortcutHint="Drag socket → socket to lay rail · drag a turnout to move it · brass lever sets first route · right-click rail lifts it · R runs the cut"
      side={side}
    >
      <div className="rail-board-wrap">
        <div className="board-caption"><span>{puzzle.yardNote}</span><span>INBOUND CUT · {puzzle.incoming.length} CARS</span></div>
        <svg ref={svgRef} className="rail-board" viewBox="0 0 100 100" onPointerMove={(event) => setPointer(clientToSvg(event.clientX, event.clientY))}>
          <defs>
            <pattern id="rail-grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="currentColor" strokeWidth="0.08"/></pattern>
            <filter id="rail-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0.7" stdDeviation="0.5" floodOpacity="0.24"/></filter>
          </defs>
          <rect className="rail-grid-bg" x="0" y="0" width="100" height="100" fill="url(#rail-grid)"/>
          <g className="yard-fixed">
            <path className="terminal-track" d="M0 50H4.5"/>
            <text x="1.3" y="46.7">IN</text>
            {puzzle.targets.map((target, index) => {
              const p = pointForPort(targetPortId(target.id))!;
              return <g key={target.id}><path className="terminal-track" d={`M${p.x} ${p.y}H100`}/><text x="98.6" y={p.y - 1.8} textAnchor="end">{target.label}</text></g>;
            })}
          </g>

          <g className="laid-rail">
            {history.value.connections.map((connection) => {
              const a = pointForPort(connection.a); const b = pointForPort(connection.b); if (!a || !b) return null;
              const path = curvePath(a, b);
              return <g key={connectionKey(connection)} onContextMenu={(event) => { event.preventDefault(); history.commit((current) => ({ ...current, connections: current.connections.filter((item) => connectionKey(item) !== connectionKey(connection)) })); }}>
                <path className="rail-sleeper" d={path}/><path className="rail-steel" d={path}/><path className="rail-hit" d={path}/>
              </g>;
            })}
            {draftStart ? (() => { const a = pointForPort(draftStart); return a ? <g><path className="rail-sleeper rail-draft" d={curvePath(a, pointer)}/><path className="rail-steel rail-draft" d={curvePath(a, pointer)}/></g> : null; })() : null}
          </g>

          {solution.switches.map((sw, index) => (
            <g key={sw.id} className="auto-turnout" transform={`translate(${sw.x} ${sw.y})`} filter="url(#rail-shadow)">
              <g className="turnout-body" onPointerDown={(event) => { if ((event.target as Element).closest('.rail-socket,.brass-lever')) return; event.preventDefault(); setDrag({ index, x: sw.x, y: sw.y, startX: sw.x, startY: sw.y }); }}>
                <path d="M-5.2 0H0M0 0C2 0 3.1-3.8 5.2-3.8M0 0C2 0 3.1 3.8 5.2 3.8"/>
                <rect x="-2.8" y="-2.7" width="5.6" height="5.4" rx="0.7"/>
                <text x="0" y="0.9" textAnchor="middle">{index + 1}</text>
              </g>
              <g className="brass-lever">
                <circle cx="0" cy="-5.4" r="1.5"/><path d={sw.branch === 'a' ? 'M0 -5.4l3-2.2' : 'M0 -5.4l3 2.2'}/>
                <foreignObject x="-3.5" y="-9" width="7" height="7.2">
                  <button className="brass-lever-hit" aria-label={`Turnout ${index + 1} initially takes ${sw.branch === 'a' ? 'upper' : 'lower'} branch. Click to change.`} onClick={() => history.commit((current) => ({ ...current, switches: current.switches.map((item, itemIndex) => itemIndex === index ? { ...item, branch: item.branch === 'a' ? 'b' : 'a' } : item) }))} />
                </foreignObject>
              </g>
              {(['stem', 'a', 'b'] as SwitchPort[]).map((port) => {
                const id = switchPortId(index, port); const offset = switchOffsets[port]; const filled = occupied.has(id);
                return <circle key={port} className="rail-socket" data-filled={filled ? '' : undefined} cx={offset.x} cy={offset.y} r="1.7" onPointerDown={(event) => { event.stopPropagation(); if (!filled && !draftStart) { setDraftStart(id); setPointer(pointForPort(id)!); } }} />;
              })}
            </g>
          ))}

          {(() => {
            const p = pointForPort('in')!; const filled = occupied.has('in');
            return <circle className="rail-socket rail-socket--fixed" data-filled={filled ? '' : undefined} cx={p.x} cy={p.y} r="1.8" onPointerDown={() => { if (!filled && !draftStart) { setDraftStart('in'); setPointer(p); } }} />;
          })()}
          {puzzle.targets.map((target) => {
            const id = targetPortId(target.id); const p = pointForPort(id)!; const filled = occupied.has(id);
            return <circle key={id} className="rail-socket rail-socket--fixed" data-filled={filled ? '' : undefined} cx={p.x} cy={p.y} r="1.8" onPointerDown={() => { if (!filled && !draftStart) { setDraftStart(id); setPointer(p); } }} />;
          })}

          <g className="incoming-cut" transform="translate(7 92)">
            {puzzle.incoming.map((car, index) => <g key={car.id} className={`wagon wagon--${car.tone}`} transform={`translate(${index * 5.8} 0)`}><rect x="0" y="-2.6" width="5.1" height="4.3" rx="0.6"/><circle cx="1.2" cy="2" r="0.55"/><circle cx="4" cy="2" r="0.55"/><text x="2.55" y="0.25" textAnchor="middle">{car.mark.split('-')[1]}</text></g>)}
          </g>

          {currentCar && currentPoint ? <g className={`running-wagon wagon--${currentCar.tone}`} transform={`translate(${currentPoint.x} ${currentPoint.y})`}><rect x="-2.6" y="-1.7" width="5.2" height="3.4" rx="0.5"/><circle cx="-1.5" cy="2" r="0.5"/><circle cx="1.5" cy="2" r="0.5"/></g> : null}
        </svg>
      </div>
    </WorkbenchShell>
  );
}
