import { useCallback, useEffect, useState } from 'react';
import type { GameEvaluation, GameId, PlaytestNotebook } from './types';

const NOTEBOOK_KEY = 'workshop-trials:notebook:v1';
const STATE_PREFIX = 'workshop-trials:puzzle-state:v1:';
const SETTINGS_KEY = 'workshop-trials:settings:v1';

const emptyNotebook: PlaytestNotebook = { completions: {}, evaluations: {} };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadNotebook(): PlaytestNotebook {
  return safeParse(localStorage.getItem(NOTEBOOK_KEY), emptyNotebook);
}

export function saveNotebook(notebook: PlaytestNotebook): void {
  localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(notebook));
  window.dispatchEvent(new CustomEvent('workshop-notebook-change'));
}

export function useNotebook() {
  const [notebook, setNotebook] = useState<PlaytestNotebook>(() => loadNotebook());

  useEffect(() => {
    const refresh = () => setNotebook(loadNotebook());
    window.addEventListener('storage', refresh);
    window.addEventListener('workshop-notebook-change', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('workshop-notebook-change', refresh);
    };
  }, []);

  const update = useCallback((recipe: (current: PlaytestNotebook) => PlaytestNotebook) => {
    const next = recipe(loadNotebook());
    saveNotebook(next);
    setNotebook(next);
  }, []);

  const setEvaluation = useCallback(
    (gameId: GameId, evaluation: Omit<GameEvaluation, 'updatedAt'>) => {
      update((current) => ({
        ...current,
        evaluations: {
          ...current.evaluations,
          [gameId]: { ...evaluation, updatedAt: new Date().toISOString() },
        },
      }));
    },
    [update],
  );

  return { notebook, update, setEvaluation };
}

export function usePersistentPuzzleState<T>(key: string, initial: () => T) {
  const storageKey = `${STATE_PREFIX}${key}`;
  const [state, setState] = useState<T>(() => safeParse(localStorage.getItem(storageKey), initial()));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const clear = useCallback(() => {
    const next = initial();
    localStorage.removeItem(storageKey);
    setState(next);
  }, [initial, storageKey]);

  return [state, setState, clear] as const;
}

interface Settings {
  sound: boolean;
  seenIntro: boolean;
}

const defaultSettings: Settings = { sound: true, seenIntro: false };

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    safeParse(localStorage.getItem(SETTINGS_KEY), defaultSettings),
  );

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, update };
}

export function downloadNotebook(notebook: PlaytestNotebook): void {
  const payload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      product: 'Workshop Trials',
      ...notebook,
    },
    null,
    2,
  );
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `workshop-trials-playtest-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
