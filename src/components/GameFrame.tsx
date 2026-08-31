import type { ReactNode } from 'react';
import type { GameId, PuzzleBase } from '../core/types';
import { StableSwap } from './StableSwap';

export type RunState = 'idle' | 'running' | 'success' | 'failure';

interface GameFrameProps {
  gameId: GameId;
  gameTitle: string;
  workshop: string;
  puzzle: PuzzleBase;
  puzzleIndex: number;
  runState: RunState;
  status: string;
  metric: string;
  onBack: () => void;
  onPuzzle: (index: number) => void;
  onRun: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  children: ReactNode;
  hint?: ReactNode;
}

export function GameFrame(props: GameFrameProps) {
  const { puzzle } = props;
  return (
    <main className={`game-shell theme-${props.gameId}`}>
      <header className="game-topbar">
        <button className="quiet-button back-button" onClick={props.onBack} aria-label="Back to workshop trials">
          ← Workshop Trials
        </button>
        <div className="game-mark">
          <span className="game-kicker">{props.workshop}</span>
          <strong>{props.gameTitle}</strong>
        </div>
        <nav className="puzzle-strip" aria-label="Work orders">
          {Array.from({ length: 10 }, (_, index) => (
            <button
              key={index}
              className={index === props.puzzleIndex ? 'puzzle-dot active' : 'puzzle-dot'}
              aria-label={`Work order ${index + 1}`}
              aria-current={index === props.puzzleIndex ? 'page' : undefined}
              onClick={() => props.onPuzzle(index)}
            >
              {index + 1}
            </button>
          ))}
        </nav>
      </header>

      <section className="game-body">
        <aside className="job-ticket" aria-label="Work order">
          <div className="ticket-meta">
            <span>WORK ORDER {String(puzzle.number).padStart(2, '0')}</span>
            <span>{puzzle.date}</span>
          </div>
          <h1>{puzzle.title}</h1>
          <p className="ticket-from">From {puzzle.sender}</p>
          <p className="ticket-story">{puzzle.story}</p>
          <div className="ticket-rule">
            <span>THE JOB</span>
            <p>{puzzle.instruction}</p>
          </div>
          {props.hint ? <div className="ticket-hint">{props.hint}</div> : null}
          <div className="ticket-metric">
            <span>{puzzle.metricLabel}</span>
            <strong>{props.metric}</strong>
          </div>
        </aside>

        <section className="workbench" aria-label="Puzzle workbench">
          {props.children}
        </section>
      </section>

      <footer className="control-rail">
        <div className="control-cluster">
          <button className="quiet-button" onClick={props.onUndo} disabled={!props.canUndo}>Undo</button>
          <button className="quiet-button" onClick={props.onRedo} disabled={!props.canRedo}>Redo</button>
          <button className="quiet-button" onClick={props.onReset}>Clear</button>
        </div>
        <div className="status-track" aria-live="polite">
          <StableSwap
            active={props.runState}
            states={[
              { key: 'idle', content: props.status },
              { key: 'running', content: 'Running the mechanism…' },
              { key: 'success', content: props.status },
              { key: 'failure', content: props.status },
            ] as const}
          />
        </div>
        <button className="run-button" data-state={props.runState} onClick={props.onRun} disabled={props.runState === 'running'}>
          <StableSwap
            active={props.runState}
            states={[
              { key: 'idle', content: 'TEST' },
              { key: 'running', content: 'TESTING' },
              { key: 'success', content: 'RUN AGAIN' },
              { key: 'failure', content: 'TRY AGAIN' },
            ] as const}
          />
        </button>
      </footer>
    </main>
  );
}
