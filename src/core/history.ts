import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initial: T, onCommit?: (value: T) => void) {
  const [history, setHistory] = useState<HistoryState<T>>({ past: [], present: initial, future: [] });
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onCommit?.(history.present);
  }, [history.present, onCommit]);

  const commit = useCallback((next: T | ((current: T) => T)) => {
    setHistory((current) => {
      const value = typeof next === 'function' ? (next as (state: T) => T)(current.present) : next;
      if (Object.is(value, current.present)) return current;
      return {
        past: [...current.past.slice(-79), current.present],
        present: value,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      const previous = current.past.at(-1);
      if (previous === undefined) return current;
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const next = current.future[0];
      if (next === undefined) return current;
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1),
      };
    });
  }, []);

  const replace = useCallback((value: T) => {
    setHistory({ past: [], present: value, future: [] });
  }, []);

  return useMemo(
    () => ({
      value: history.present,
      commit,
      undo,
      redo,
      replace,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      depth: history.past.length,
    }),
    [commit, history, redo, replace, undo],
  );
}
