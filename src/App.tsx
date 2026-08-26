import { useCallback, useEffect, useState } from 'react';
import { Launcher } from './components/Launcher';
import { BinderyGame } from './games/bindery/BinderyGame';
import { RailGame } from './games/rail/RailGame';
import { RiggingGame } from './games/rigging/RiggingGame';
import { useNotebook, useSettings } from './core/persistence';
import type { CompletionRecord, GameEvaluation, GameId } from './core/types';

interface AppRoute {
  gameId: GameId | null;
  puzzleIndex: number;
}

const gameIds = new Set<GameId>(['rail', 'bindery', 'rigging']);

function parseRoute(): AppRoute {
  const [rawGameId, rawPuzzle] = window.location.hash.replace(/^#\/?/, '').split('/');
  if (!rawGameId || !gameIds.has(rawGameId as GameId)) {
    return { gameId: null, puzzleIndex: 0 };
  }

  const requestedPuzzle = Number(rawPuzzle ?? '1');
  const puzzleIndex = Number.isFinite(requestedPuzzle)
    ? Math.max(0, Math.min(9, Math.trunc(requestedPuzzle) - 1))
    : 0;
  return { gameId: rawGameId as GameId, puzzleIndex };
}

function setRoute(gameId: GameId | null, puzzleIndex = 0, replace = false): void {
  const hash = gameId ? `#/${gameId}/${puzzleIndex + 1}` : '#/';
  if (replace) {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export default function App() {
  const [route, setCurrentRoute] = useState<AppRoute>(() => parseRoute());
  const { notebook, update: updateNotebook, setEvaluation } = useNotebook();
  const { settings, update: updateSettings } = useSettings();

  useEffect(() => {
    const onHashChange = () => setCurrentRoute(parseRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openGame = useCallback((gameId: GameId, puzzleIndex: number) => {
    setRoute(gameId, puzzleIndex);
  }, []);

  const selectPuzzle = useCallback(
    (puzzleIndex: number) => {
      if (!route.gameId) return;
      setRoute(route.gameId, puzzleIndex, true);
    },
    [route.gameId],
  );

  const completePuzzle = useCallback(
    (gameId: GameId, puzzleId: string, completion: CompletionRecord) => {
      updateNotebook((current) => ({
        ...current,
        completions: {
          ...current.completions,
          [gameId]: {
            ...(current.completions[gameId] ?? {}),
            [puzzleId]: completion,
          },
        },
      }));
    },
    [updateNotebook],
  );

  const saveEvaluation = useCallback(
    (gameId: GameId, evaluation: Omit<GameEvaluation, 'updatedAt'>) => {
      setEvaluation(gameId, evaluation);
    },
    [setEvaluation],
  );

  if (!route.gameId) {
    return (
      <Launcher
        notebook={notebook}
        seenIntro={settings.seenIntro}
        onMarkIntroSeen={() => updateSettings({ seenIntro: true })}
        onOpenGame={openGame}
        onSaveEvaluation={saveEvaluation}
      />
    );
  }

  const commonProps = {
    puzzleIndex: route.puzzleIndex,
    onPuzzleIndexChange: selectPuzzle,
    onBack: () => setRoute(null),
    soundEnabled: settings.sound,
    onToggleSound: () => updateSettings({ sound: !settings.sound }),
    notebook,
    onComplete: completePuzzle,
    evaluation: notebook.evaluations[route.gameId],
    onSaveEvaluation: (evaluation: Omit<GameEvaluation, 'updatedAt'>) =>
      saveEvaluation(route.gameId as GameId, evaluation),
  };

  if (route.gameId === 'rail') return <RailGame {...commonProps} />;
  if (route.gameId === 'bindery') return <BinderyGame {...commonProps} />;
  return <RiggingGame {...commonProps} />;
}
