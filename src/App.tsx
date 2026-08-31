import { useEffect, useState } from 'react';
import { Launcher } from './components/Launcher';
import type { GameId } from './core/types';
import { RailGame } from './games/RailGame';
import { BinderyGame } from './games/BinderyGame';
import { RiggingGame } from './games/RiggingGame';

interface Route { game: GameId | null; puzzle: number }
const gameIds = new Set<GameId>(['rail','bindery','rigging']);

function readRoute(): Route {
  const [gameRaw,puzzleRaw] = window.location.hash.replace(/^#\/?/,'').split('/');
  if (!gameRaw || !gameIds.has(gameRaw as GameId)) return {game:null,puzzle:0};
  const number = Number(puzzleRaw || '1');
  return { game:gameRaw as GameId, puzzle:Number.isFinite(number)?Math.max(0,Math.min(9,Math.trunc(number)-1)):0 };
}

function navigate(game:GameId|null,puzzle=0) {
  window.location.hash = game ? `#/${game}/${puzzle+1}` : '#/';
}

export default function App() {
  const [route,setRoute]=useState<Route>(()=>readRoute());
  useEffect(()=>{const onHash=()=>setRoute(readRoute());window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash)},[]);
  if (!route.game) return <Launcher onOpen={(game)=>navigate(game,0)}/>;
  const common = { puzzleIndex:route.puzzle, onPuzzleIndexChange:(puzzle:number)=>navigate(route.game,puzzle), onBack:()=>navigate(null) };
  if (route.game==='rail') return <RailGame key={`rail-${route.puzzle}`} {...common}/>;
  if (route.game==='bindery') return <BinderyGame key={`bindery-${route.puzzle}`} {...common}/>;
  return <RiggingGame key={`rigging-${route.puzzle}`} {...common}/>;
}
