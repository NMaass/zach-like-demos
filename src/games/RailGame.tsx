import { useEffect, useMemo, useRef, useState } from 'react';
import { GameFrame, type RunState } from '../components/GameFrame';
import { railPuzzles } from '../data';
import type { Point } from '../core/types';
import { useHistory } from '../core/useHistory';

interface RailGameProps {
  puzzleIndex: number;
  onPuzzleIndexChange: (index: number) => void;
  onBack: () => void;
}

type Edge = [number, number, number, number];

const eq = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const nodeKey = (p: Point) => `${p.x},${p.y}`;
const edgeKey = (edge: Edge) => {
  const a = `${edge[0]},${edge[1]}`;
  const b = `${edge[2]},${edge[3]}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
};

function segmentsCross(a: Edge, b: Edge): boolean {
  const p1 = { x: a[0], y: a[1] };
  const p2 = { x: a[2], y: a[3] };
  const p3 = { x: b[0], y: b[1] };
  const p4 = { x: b[2], y: b[3] };
  if ([p1, p2].some((p) => [p3, p4].some((q) => eq(p, q)))) return false;
  const orient = (p: Point, q: Point, r: Point) => Math.sign((q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y));
  return orient(p1, p2, p3) !== orient(p1, p2, p4) && orient(p3, p4, p1) !== orient(p3, p4, p2);
}

function shortestPath(edges: Edge[], start: Point, end: Point): Point[] | null {
  const adjacency = new Map<string, Point[]>();
  for (const edge of edges) {
    const a = { x: edge[0], y: edge[1] };
    const b = { x: edge[2], y: edge[3] };
    adjacency.set(nodeKey(a), [...(adjacency.get(nodeKey(a)) ?? []), b]);
    adjacency.set(nodeKey(b), [...(adjacency.get(nodeKey(b)) ?? []), a]);
  }
  const queue: Point[][] = [[start]];
  const seen = new Set([nodeKey(start)]);
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1]!;
    if (eq(last, end)) return path;
    for (const next of adjacency.get(nodeKey(last)) ?? []) {
      if (seen.has(nodeKey(next))) continue;
      seen.add(nodeKey(next));
      queue.push([...path, next]);
    }
  }
  return null;
}

function useCompletionSound(success: boolean) {
  useEffect(() => {
    if (!success) return;
    const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    [0, 0.09, 0.18].forEach((delay, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = [330, 440, 660][index]!;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.11);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.12);
    });
  }, [success]);
}

export function RailGame({ puzzleIndex, onPuzzleIndexChange, onBack }: RailGameProps) {
  const puzzle = railPuzzles[puzzleIndex] ?? railPuzzles[0]!;
  const history = useHistory<Edge[]>([]);
  const [drawingFrom, setDrawingFrom] = useState<Point | null>(null);
  const [runState, setRunState] = useState<RunState>('idle');
  const [status, setStatus] = useState('Drag from pin to pin to lay rail. Click a rail to lift it.');
  const [active, setActive] = useState<{ car: number; path: Point[]; step: number } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const blocked = useMemo(() => new Set(puzzle.blocked.map(([x, y]) => `${x},${y}`)), [puzzle]);
  const scaleX = 100 / (puzzle.cols + 1);
  const scaleY = 100 / (puzzle.rows + 1);
  const screen = (p: Point) => ({ x: (p.x + 1) * scaleX, y: (p.y + 1) * scaleY });

  const addEdge = (from: Point, to: Point) => {
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    if (dx > 1 || dy > 1 || dx + dy === 0) return;
    if (blocked.has(nodeKey(from)) || blocked.has(nodeKey(to))) return;
    const edge: Edge = [from.x, from.y, to.x, to.y];
    const key = edgeKey(edge);
    if (history.state.some((item) => edgeKey(item) === key)) return;
    const degree = (point: Point) => history.state.reduce((count, item) => {
      const a = { x: item[0], y: item[1] };
      const b = { x: item[2], y: item[3] };
      return count + (eq(point, a) || eq(point, b) ? 1 : 0);
    }, 0);
    if (degree(from) >= 3 || degree(to) >= 3) {
      setStatus('That pin already carries a three-way turnout. Start the next branch from another pin.');
      return;
    }
    if (history.state.some((item) => segmentsCross(item, edge))) {
      setStatus('That would require a crossing frog. Use a junction or go around.');
      return;
    }
    history.commit([...history.state, edge]);
    setRunState('idle');
    setStatus('Rail set. Keep drawing, or test the yard.');
  };

  const removeEdge = (edge: Edge) => {
    history.commit(history.state.filter((item) => edgeKey(item) !== edgeKey(edge)));
    setRunState('idle');
    setStatus('Rail lifted.');
  };

  const run = () => {
    if (timer.current) window.clearTimeout(timer.current);
    const paths = puzzle.cars.map((car) => {
      const exit = puzzle.exits.find((item) => item.id === car.destination)!;
      return shortestPath(history.state, { x: puzzle.entry[0], y: puzzle.entry[1] }, { x: exit.at[0], y: exit.at[1] });
    });
    const failed = paths.findIndex((path) => path === null);
    if (failed >= 0) {
      setRunState('failure');
      setStatus(`${puzzle.cars[failed]!.label} has no physical route to its consignee.`);
      setActive(null);
      return;
    }
    setRunState('running');
    setStatus('Tower routing the cut…');
    let car = 0;
    let step = 0;
    const tick = () => {
      const path = paths[car]!;
      setActive({ car, path, step });
      if (step < path.length - 1) {
        step += 1;
        timer.current = window.setTimeout(tick, 180);
        return;
      }
      if (car < paths.length - 1) {
        car += 1;
        step = 0;
        timer.current = window.setTimeout(tick, 280);
        return;
      }
      timer.current = window.setTimeout(() => {
        setActive(null);
        setRunState('success');
        setStatus(`Accepted. ${history.state.length} rail lengths laid.`);
      }, 280);
    };
    tick();
  };

  useCompletionSound(runState === 'success');

  const activePosition = active ? screen(active.path[active.step]!) : null;

  return (
    <GameFrame
      gameId="rail"
      gameTitle="Coldwater Junction"
      workshop="Erie & Western / Civil Engineering Office"
      puzzle={puzzle}
      puzzleIndex={puzzleIndex}
      runState={runState}
      status={status}
      metric={`${history.state.length} lengths`}
      onBack={onBack}
      onPuzzle={onPuzzleIndexChange}
      onRun={run}
      onUndo={() => { history.undo(); setRunState('idle'); }}
      onRedo={() => { history.redo(); setRunState('idle'); }}
      onReset={() => { history.reset([]); setRunState('idle'); setStatus('Plan cleared.'); }}
      canUndo={history.canUndo}
      canRedo={history.canRedo}
      hint={puzzleIndex === 0 ? <><strong>No palette.</strong> Rail is the only thing you place. Junctions are just places where rail meets.</> : undefined}
    >
      <div className="rail-plan">
        <svg viewBox="0 0 100 100" role="img" aria-label="Railway survey plan" onPointerUp={() => setDrawingFrom(null)} onPointerLeave={() => setDrawingFrom(null)}>
          <defs>
            <pattern id="rail-grid" width={scaleX} height={scaleY} patternUnits="userSpaceOnUse">
              <path d={`M ${scaleX} 0 L 0 0 0 ${scaleY}`} className="survey-grid" fill="none" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#rail-grid)" />
          {puzzle.blocked.map(([x, y]) => {
            const p = screen({ x, y });
            return <g key={`${x}-${y}`} className="rail-obstruction"><rect x={p.x - scaleX * .42} y={p.y - scaleY * .42} width={scaleX * .84} height={scaleY * .84} rx=".7" /><path d={`M ${p.x-scaleX*.32} ${p.y-scaleY*.32} L ${p.x+scaleX*.32} ${p.y+scaleY*.32} M ${p.x+scaleX*.32} ${p.y-scaleY*.32} L ${p.x-scaleX*.32} ${p.y+scaleY*.32}`} /></g>;
          })}
          {history.state.map((edge) => {
            const a = screen({ x: edge[0], y: edge[1] });
            const b = screen({ x: edge[2], y: edge[3] });
            return (
              <g key={edgeKey(edge)} className="track-segment" onClick={() => removeEdge(edge)}>
                <line className="track-hit" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <line className="track-bed" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <line className="track-rail a" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <line className="track-rail b" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              </g>
            );
          })}
          {Array.from({ length: puzzle.rows }, (_, y) => Array.from({ length: puzzle.cols }, (_, x) => ({ x, y }))).flat().filter((p) => !blocked.has(nodeKey(p))).map((p) => {
            const s = screen(p);
            return (
              <circle
                key={nodeKey(p)}
                className={drawingFrom && eq(drawingFrom, p) ? 'survey-pin active' : 'survey-pin'}
                cx={s.x}
                cy={s.y}
                r="1.25"
                onPointerDown={() => setDrawingFrom(p)}
                onPointerEnter={() => { if (drawingFrom && !eq(drawingFrom, p)) { addEdge(drawingFrom, p); setDrawingFrom(p); } }}
                onPointerUp={() => setDrawingFrom(null)}
              />
            );
          })}
          {(() => { const p = screen({ x:puzzle.entry[0], y:puzzle.entry[1] }); return <g className="rail-terminal entry"><line x1="0" y1={p.y} x2={p.x} y2={p.y}/><text x="1.5" y={p.y-2}>INBOUND</text></g>; })()}
          {puzzle.exits.map((exit) => { const p = screen({ x:exit.at[0], y:exit.at[1] }); return <g key={exit.id} className="rail-terminal exit"><line x1={p.x} y1={p.y} x2="100" y2={p.y}/><circle cx={p.x} cy={p.y} r="2.1" style={{fill:exit.color}}/><text x="98.5" y={p.y-2} textAnchor="end">{exit.label}</text></g>; })}
          {activePosition ? <g className="moving-car" transform={`translate(${activePosition.x} ${activePosition.y})`}><rect x="-3.7" y="-2.2" width="7.4" height="4.4" rx="1" style={{fill:puzzle.cars[active!.car]!.color}}/><text x="0" y=".8" textAnchor="middle">{puzzle.cars[active!.car]!.label.slice(0,4)}</text></g> : null}
        </svg>
        <div className="car-manifest" aria-label="Inbound consist">
          <span>INBOUND CUT</span>
          <div>{puzzle.cars.map((car) => <b key={car.id} style={{'--car':car.color} as React.CSSProperties}>{car.label}</b>)}</div>
        </div>
      </div>
    </GameFrame>
  );
}
