import { useCallback, useEffect, useState } from 'react';
import type { GameId, Notebook, EvaluationRecord, CompletionRecord } from './types';

const NOTEBOOK_KEY = 'workshop-trials:notebook:v2';
const SETTINGS_KEY = 'workshop-trials:settings:v2';

const emptyNotebook: Notebook = { completions: {}, evaluations: {} };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useNotebook() {
  const [notebook, setNotebook] = useState<Notebook>(() => readJson(NOTEBOOK_KEY, emptyNotebook));
  useEffect(() => localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(notebook)), [notebook]);

  const recordCompletion = useCallback((game: GameId, puzzleId: string, completion: CompletionRecord) => {
    setNotebook((current) => ({
      ...current,
      completions: {
        ...current.completions,
        [game]: { ...(current.completions[game] ?? {}), [puzzleId]: completion },
      },
    }));
  }, []);

  const saveEvaluation = useCallback((game: GameId, evaluation: Omit<EvaluationRecord, 'updatedAt'>) => {
    setNotebook((current) => ({
      ...current,
      evaluations: {
        ...current.evaluations,
        [game]: { ...evaluation, updatedAt: new Date().toISOString() },
      },
    }));
  }, []);

  return { notebook, recordCompletion, saveEvaluation };
}

interface Settings { sound: boolean; seenIntro: boolean }
const defaultSettings: Settings = { sound: true, seenIntro: false };

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => readJson(SETTINGS_KEY, defaultSettings));
  useEffect(() => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)), [settings]);
  return {
    settings,
    update: (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch })),
  };
}

export function downloadNotebook(notebook: Notebook): void {
  const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `workshop-trials-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
