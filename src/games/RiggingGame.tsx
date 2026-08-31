import { useMemo, useState } from 'react';
import { GameFrame, type RunState } from '../components/GameFrame';
import { riggingPuzzles } from '../data';
import { useHistory } from '../core/useHistory';

interface RiggingGameProps {
  puzzleIndex: number;
  onPuzzleIndexChange: (index: number) => void;
  onBack: () => void;
}

type SocketKind = 'hand' | 'dead' | 'fixed' | 'moving';
interface Socket { id: string; kind: SocketKind; x: number; y: number; label: string }

function segmentHitsRect(a: Socket, b: Socket, r: {x:number;y:number;w:number;h:number}) {
  const steps = 40;
  for (let i=0;i<=steps;i+=1) {
    const t=i/steps;
    const x=a.x+(b.x-a.x)*t;
    const y=a.y+(b.y-a.y)*t;
    if (x>r.x && x<r.x+r.w && y>r.y && y<r.y+r.h) return true;
  }
  return false;
}

export function RiggingGame({ puzzleIndex, onPuzzleIndexChange, onBack }: RiggingGameProps) {
  const puzzle = riggingPuzzles[puzzleIndex] ?? riggingPuzzles[0]!;
  const sockets = useMemo<Socket[]>(() => [
    { id:'HAND', kind:'hand', x:8, y:74, label:'HANDLINE' },
    ...puzzle.fixed.map((p) => ({...p, kind:'fixed' as const, label:p.id})),
    ...puzzle.moving.map((p) => ({...p, kind:'moving' as const, label:p.id})),
    { id:'DEAD', kind:'dead', x:92, y:15, label:'DEAD END' },
  ], [puzzle]);
  const socketMap = useMemo(() => new Map(sockets.map((s) => [s.id,s])), [sockets]);
  const history = useHistory<string[]>(['HAND']);
  const [runState,setRunState]=useState<RunState>('idle');
  const [status,setStatus]=useState('Click sheaves in the order the rope should pass through them.');

  const movingCount = history.state.filter((id) => socketMap.get(id)?.kind === 'moving').length;
  const parts = Math.max(1, movingCount * 2);
  const effort = Math.ceil(puzzle.load / parts);
  const handTravel = puzzle.requiredTravel * parts;
  const maxHandTravel = 110 + puzzleIndex * 16;

  const append = (id: string) => {
    if (runState === 'running') return;
    if (history.state[history.state.length-1] === id) return;
    if (id === 'HAND' && history.state.length > 1) return;
    if (history.state.includes('DEAD')) return;
    history.commit([...history.state,id]);
    setRunState('idle');
    setStatus(id === 'DEAD' ? 'Rope tied off. Test the purchase.' : 'Rope reeved. Continue to the dead end.');
  };

  const run = () => {
    const route = history.state.map((id) => socketMap.get(id)!).filter(Boolean);
    if (route[route.length-1]?.kind !== 'dead') { setRunState('failure'); setStatus('The rope is not tied off at the dead end.'); return; }
    if (movingCount === 0) { setRunState('failure'); setStatus('The batten is not supported by the purchase.'); return; }
    for (let i=1;i<route.length;i+=1) {
      if (puzzle.obstacles.some((rect) => segmentHitsRect(route[i-1]!,route[i]!,rect))) { setRunState('failure'); setStatus('A rope part bears against scenery or steel. Reeve around it.'); return; }
      if (route[i-1]!.kind === route[i]!.kind && ['fixed','moving'].includes(route[i]!.kind)) { setRunState('failure'); setStatus('Two sheaves on the same block do not add supporting parts. Alternate fixed and moving blocks.'); return; }
    }
    if (effort > puzzle.maxEffort) { setRunState('failure'); setStatus(`${effort} lb at the handline. The operator limit is ${puzzle.maxEffort} lb.`); return; }
    if (handTravel > maxHandTravel) { setRunState('failure'); setStatus(`${handTravel} ft of handline travel is too much for this loft. Use fewer supporting parts.`); return; }
    setRunState('running');
    setStatus('Loading the purchase…');
    window.setTimeout(() => { setRunState('success'); setStatus(`Safe. ${parts}:1 purchase, ${effort} lb hand effort, ${handTravel} ft handline travel.`); }, 650);
  };

  const routePoints = history.state.map((id) => socketMap.get(id)).filter((s): s is Socket => Boolean(s));
  const polyline = routePoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <GameFrame
      gameId="rigging"
      gameTitle="The Orpheum Fly Loft"
      workshop="Orpheum Theatre / Stage Department"
      puzzle={puzzle}
      puzzleIndex={puzzleIndex}
      runState={runState}
      status={status}
      metric={`${effort} lb · ${parts}:1`}
      onBack={onBack}
      onPuzzle={onPuzzleIndexChange}
      onRun={run}
      onUndo={() => { history.undo(); setRunState('idle'); }}
      onRedo={() => { history.redo(); setRunState('idle'); }}
      onReset={() => { history.reset(['HAND']); setRunState('idle'); setStatus('Rope pulled out.'); }}
      canUndo={history.canUndo}
      canRedo={history.canRedo}
      hint={puzzleIndex===0 ? <><strong>One material:</strong> rope. The hardware is already in the building. Each pass around the moving block adds support but also multiplies handline travel.</> : undefined}
    >
      <div className="rigging-section">
        <svg viewBox="0 0 100 100" role="img" aria-label="Theatre fly loft section">
          <defs><pattern id="rig-grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" className="rig-grid" fill="none"/></pattern></defs>
          <rect width="100" height="100" fill="url(#rig-grid)"/>
          <line className="gridiron" x1="18" y1="12" x2="94" y2="12"/>
          <text className="rig-label" x="18" y="9">GRIDIRON</text>
          <g className="batten"><line x1="31" y1="76" x2="88" y2="76"/><rect x="41" y="77" width="38" height="8" rx="1"/><text x="60" y="82" textAnchor="middle">{puzzle.title.toUpperCase()}</text></g>
          {puzzle.obstacles.map((r,index)=><g key={index} className="rig-obstacle"><rect x={r.x} y={r.y} width={r.w} height={r.h}/><path d={`M ${r.x} ${r.y} l ${r.w} ${r.h} M ${r.x+r.w} ${r.y} l ${-r.w} ${r.h}`}/></g>)}
          {polyline ? <polyline className="rope-shadow" points={polyline}/> : null}
          {polyline ? <polyline className={runState==='success'?'rope success':'rope'} points={polyline}/> : null}
          {sockets.map((socket) => (
            <g key={socket.id} className={`rig-socket ${socket.kind}`} onClick={() => append(socket.id)} tabIndex={0} role="button" aria-label={`Route rope through ${socket.label}`} onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();append(socket.id)}}}>
              {socket.kind==='fixed'||socket.kind==='moving' ? <><circle cx={socket.x} cy={socket.y} r="3.6"/><circle className="sheave" cx={socket.x} cy={socket.y} r="1.7"/></> : <circle cx={socket.x} cy={socket.y} r="2.2"/>}
              <text x={socket.x} y={socket.y + (socket.kind==='fixed'?-5.5:socket.kind==='moving'?6.8:-4)} textAnchor="middle">{socket.label}</text>
            </g>
          ))}
          <g className="rig-dimension"><line x1="5" y1="76" x2="5" y2="94"/><path d="M 3 77 L 5 74 L 7 77 M 3 93 L 5 96 L 7 93"/><text x="7" y="87">{puzzle.requiredTravel}′ TRAVEL</text></g>
        </svg>
        <div className="rig-readout">
          <div><span>LOAD</span><strong>{puzzle.load} lb</strong></div>
          <div><span>SUPPORTING PARTS</span><strong>{parts}</strong></div>
          <div><span>HAND EFFORT</span><strong className={effort<=puzzle.maxEffort?'good':'bad'}>{effort} lb</strong></div>
          <div><span>HANDLINE TRAVEL</span><strong className={handTravel<=maxHandTravel?'good':'bad'}>{handTravel} ft</strong></div>
        </div>
      </div>
    </GameFrame>
  );
}
