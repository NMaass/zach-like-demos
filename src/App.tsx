import { useCallback, useEffect, useState } from 'react';
import { Launcher } from './components/Launcher';
import { FoldingGame } from './games/folding/FoldingGame';
import { RailGame } from './games/rail/RailGame';
import { RiggingGame } from './games/rigging/RiggingGame';
import { useNotebook } from './core/storage';
import type { CompletionRecord, GameId } from './core/types';

interface Route {
  game: GameId | null;
  puzzle: number;
}

const gameIds = new Set<GameId>(['rail', 'folding', 'rigging']);

function readRoute(): Route {
  const [rawGame, rawPuzzle] = window.location.hash.replace(/^#\/?/, '').split('/');
  if (!rawGame || !gameIds.has(rawGame as GameId)) return { game: null, puzzle: 0 };
  const parsed = Number(rawPuzzle ?? '1');
  const puzzle = Number.isFinite(parsed) ? Math.max(0, Math.min(9, Math.trunc(parsed) - 1)) : 0;
  return { game: rawGame as GameId, puzzle };
}

function navigate(game: GameId | null, puzzle = 0, replace = false) {
  const hash = game ? `#/${game}/${puzzle + 1}` : '#/';
  if (replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = hash;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => readRoute());
  const { notebook, recordCompletion, saveEvaluation } = useNotebook();

  useEffect(() => {
    const handler = () => setRoute(readRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const complete = useCallback(
    (game: GameId, puzzleId: string, completion: CompletionRecord) => recordCompletion(game, puzzleId, completion),
    [recordCompletion],
  );

  if (!route.game) {
    return (
      <Launcher
        notebook={notebook}
        onOpen={(game) => navigate(game, 0)}
        onSaveEvaluation={saveEvaluation}
      />
    );
  }

  const common = {
    puzzleIndex: route.puzzle,
    onPuzzleIndexChange: (index: number) => navigate(route.game, index, true),
    onBack: () => navigate(null),
    notebook,
  };

  if (route.game === 'rail') {
    return <RailGame {...common} onComplete={(game, puzzleId, completion) => complete(game, puzzleId, completion)} />;
  }
  if (route.game === 'folding') {
    return <FoldingGame {...common} onComplete={(game, puzzleId, completion) => complete(game, puzzleId, completion)} />;
  }
  return <RiggingGame {...common} onComplete={(game, puzzleId, completion) => complete(game, puzzleId, completion)} />;
}
