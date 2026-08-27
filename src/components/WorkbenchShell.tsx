import type { ReactNode } from 'react';
import type { PuzzleMeta } from '../core/types';

export type Theme = 'rail' | 'folding' | 'rigging';

export function WorkbenchShell({
  theme,
  gameTitle,
  gameSubtitle,
  puzzle,
  puzzleIndex,
  total,
  completed,
  onSelectPuzzle,
  onBack,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  action,
  actionLabel,
  actionDisabled,
  shortcutHint,
  side,
  children,
}: {
  theme: Theme;
  gameTitle: string;
  gameSubtitle: string;
  puzzle: PuzzleMeta;
  puzzleIndex: number;
  total: number;
  completed: Set<number>;
  onSelectPuzzle: (index: number) => void;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  action?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  shortcutHint: string;
  side: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`workbench theme-${theme}`}>
      <header className="workbench-bar" data-stable-anchor="topbar">
        <button className="brand-back" onClick={onBack} aria-label="Back to the three prototypes">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>Workshop Trials</span>
        </button>
        <div className="game-heading">
          <span className="game-heading__title">{gameTitle}</span>
          <span className="game-heading__subtitle">{gameSubtitle}</span>
        </div>
        <nav className="job-strip" aria-label="Work orders">
          {Array.from({ length: total }, (_, index) => (
            <button
              key={index}
              className="job-tab"
              data-current={index === puzzleIndex ? '' : undefined}
              data-complete={completed.has(index) ? '' : undefined}
              aria-current={index === puzzleIndex ? 'page' : undefined}
              aria-label={`Open work order ${index + 1}`}
              onClick={() => onSelectPuzzle(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </nav>
      </header>

      <div className="workbench-grid">
        <aside className="job-ticket" aria-label="Work order" data-stable-anchor="ticket">
          <div className="ticket-stamp">WORK ORDER {String(puzzleIndex + 1).padStart(2, '0')}</div>
          <div className="ticket-date">{puzzle.date}</div>
          <h1>{puzzle.title}</h1>
          <dl className="ticket-fields">
            <div><dt>FROM</dt><dd>{puzzle.sender}</dd></div>
            <div><dt>RE</dt><dd>{puzzle.subject}</dd></div>
          </dl>
          <p className="ticket-memo">{puzzle.memo}</p>
          {puzzle.aside ? <p className="ticket-aside">{puzzle.aside}</p> : <div className="ticket-aside ticket-aside--empty" aria-hidden="true" />}
          <div className="ticket-number">{puzzle.id.toUpperCase().replace(/-/g, ' · ')}</div>
        </aside>

        <main className="work-surface" data-stable-anchor="surface">
          {children}
        </main>

        <aside className="spec-rail" data-stable-anchor="spec">
          {side}
        </aside>
      </div>

      <footer className="workbench-controls" data-stable-anchor="controls">
        <div className="shortcut-copy">{shortcutHint}</div>
        <div className="control-cluster" role="group" aria-label="Edit controls">
          <button onClick={onUndo} disabled={!canUndo} title="Undo (⌘/Ctrl Z)">Undo</button>
          <button onClick={onRedo} disabled={!canRedo} title="Redo (⇧⌘/Ctrl Z)">Redo</button>
          <button onClick={onReset}>Start over</button>
        </div>
        <div className="action-slot">
          {action && actionLabel ? (
            <button className="primary-action" onClick={action} disabled={actionDisabled}>{actionLabel}</button>
          ) : (
            <span className="live-action-label">changes apply immediately</span>
          )}
        </div>
      </footer>
    </div>
  );
}
