import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { GameDescriptor, PuzzleStory } from '../core/types';
import { EvaluationPanel } from './EvaluationPanel';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { StableText } from './StableSwap';

export type TestState = 'idle' | 'running' | 'success' | 'failure';

interface GameShellProps {
  game: GameDescriptor;
  puzzles: readonly PuzzleStory[];
  puzzleIndex: number;
  completedPuzzleIds: ReadonlySet<string>;
  onSelectPuzzle: (index: number) => void;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onTest: () => void;
  testState: TestState;
  statusMessage: string;
  metricOne: string;
  metricTwo: string;
  tools: ReactNode;
  board: ReactNode;
  inspector?: ReactNode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  evaluation: Parameters<typeof EvaluationPanel>[0]['value'];
  onSaveEvaluation: Parameters<typeof EvaluationPanel>[0]['onSave'];
  help: ReactNode;
}

export function GameShell({
  game,
  puzzles,
  puzzleIndex,
  completedPuzzleIds,
  onSelectPuzzle,
  onBack,
  onPrevious,
  onNext,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onTest,
  testState,
  statusMessage,
  metricOne,
  metricTwo,
  tools,
  board,
  inspector,
  soundEnabled,
  onToggleSound,
  evaluation,
  onSaveEvaluation,
  help,
}: GameShellProps) {
  const puzzle = puzzles[puzzleIndex];
  const [briefOpen, setBriefOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobilePuzzlesOpen, setMobilePuzzlesOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) onRedo();
        else onUndo();
      }
      if (event.key === 'Escape') {
        setBriefOpen(false);
        setHelpOpen(false);
        setMobilePuzzlesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRedo, onUndo]);

  const testLabels = useMemo(() => ['Test solution', 'Testing…', 'Accepted', 'Revise'] as const, []);
  const testLabel =
    testState === 'idle'
      ? testLabels[0]
      : testState === 'running'
        ? testLabels[1]
        : testState === 'success'
          ? testLabels[2]
          : testLabels[3];

  if (!puzzle) return null;

  return (
    <div className={`game game--${game.id}`} data-game={game.id}>
      <header className="game-topbar" data-testid="game-topbar">
        <div className="game-topbar__left">
          <button className="icon-button icon-button--back" type="button" onClick={onBack} aria-label="Back to launcher">
            <Icon name="arrow-left" />
          </button>
          <div className="game-mark" aria-hidden="true">
            {game.id === 'rail' ? <Icon name="train" /> : game.id === 'bindery' ? <Icon name="book" /> : <Icon name="weight" />}
          </div>
          <div className="game-title-block">
            <span className="eyebrow">{game.year} · {game.location}</span>
            <strong>{game.title}</strong>
          </div>
        </div>
        <div className="game-topbar__center" data-testid="puzzle-title-anchor">
          <button className="puzzle-stepper__button" type="button" onClick={onPrevious} disabled={puzzleIndex === 0} aria-label="Previous puzzle">
            <Icon name="chevron-up" />
          </button>
          <button className="puzzle-stepper" type="button" onClick={() => setMobilePuzzlesOpen(true)}>
            <span className="stable-number">{String(puzzle.number).padStart(2, '0')} / 10</span>
            <span>{puzzle.title}</span>
            <Icon name="chevron-down" />
          </button>
          <button className="puzzle-stepper__button" type="button" onClick={onNext} disabled={puzzleIndex === puzzles.length - 1} aria-label="Next puzzle">
            <Icon name="chevron-down" />
          </button>
        </div>
        <div className="game-topbar__right">
          <button className="icon-button" type="button" onClick={() => setBriefOpen(true)} aria-label="Open work order">
            <Icon name="eye" />
          </button>
          <button className="icon-button" type="button" onClick={() => setHelpOpen(true)} aria-label="Open controls">
            <Icon name="circle-help" />
          </button>
          <button className="icon-button" type="button" onClick={onToggleSound} aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}>
            <Icon name={soundEnabled ? 'speaker' : 'speaker-off'} />
          </button>
        </div>
      </header>

      <aside className="puzzle-rail" aria-label="Puzzle list" data-testid="puzzle-rail">
        <div className="puzzle-rail__heading">
          <span>Work orders</span>
          <strong>{completedPuzzleIds.size}/10</strong>
        </div>
        <ol>
          {puzzles.map((item, index) => {
            const selected = index === puzzleIndex;
            const complete = completedPuzzleIds.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="puzzle-ticket"
                  aria-current={selected ? 'step' : undefined}
                  onClick={() => onSelectPuzzle(index)}
                >
                  <span className="puzzle-ticket__number stable-number">{String(item.number).padStart(2, '0')}</span>
                  <span className="puzzle-ticket__copy">
                    <strong>{item.title}</strong>
                    <small>{item.client}</small>
                  </span>
                  <span className="puzzle-ticket__status" aria-label={complete ? 'Completed' : 'Not completed'}>
                    {complete ? <Icon name="check" /> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <EvaluationPanel game={game} value={evaluation} onSave={onSaveEvaluation} triggerClassName="puzzle-rail__review" />
      </aside>

      <main className="workspace">
        <section className="workspace__brief" aria-label="Current work order" data-testid="brief-anchor">
          <div className="work-order-card">
            <span className="work-order-card__date">{puzzle.date}</span>
            <span className="work-order-card__client">{puzzle.client}</span>
            <h1>{puzzle.title}</h1>
            <p>{puzzle.brief}</p>
            <button className="text-button" type="button" onClick={() => setBriefOpen(true)}>
              Read the full order <Icon name="arrow-right" />
            </button>
          </div>
        </section>

        <section className="workspace__board" aria-label={`${game.title} workbench`} data-testid="game-board-anchor">
          {board}
        </section>

        <aside className="workspace__tools" aria-label="Tools" data-testid="tool-panel-anchor">
          <div className="tool-panel">
            <div className="tool-panel__heading">
              <span>Tool chest</span>
              <span className="tool-panel__shortcut">1–9</span>
            </div>
            {tools}
          </div>
          {inspector ? <div className="inspector-panel">{inspector}</div> : null}
        </aside>
      </main>

      <footer className="command-bar" data-testid="command-bar-anchor">
        <div className="command-bar__history">
          <button className="command-button" type="button" onClick={onUndo} disabled={!canUndo}>
            <Icon name="undo" /> Undo
          </button>
          <button className="command-button" type="button" onClick={onRedo} disabled={!canRedo}>
            <Icon name="redo" /> Redo
          </button>
          <button className="command-button" type="button" onClick={onReset}>
            <Icon name="reset" /> Reset
          </button>
        </div>
        <div className="command-bar__status" aria-live="polite">
          <span className={`status-lamp status-lamp--${testState}`} />
          <StableText
            value={statusMessage}
            candidates={[
              'Ready for inspection.',
              'Testing the full sequence…',
              'Work order accepted.',
              'The foreman found a problem.',
            ]}
          />
        </div>
        <dl className="command-bar__metrics">
          <div>
            <dt>{game.metricLabels[0]}</dt>
            <dd className="stable-number">{metricOne}</dd>
          </div>
          <div>
            <dt>{game.metricLabels[1]}</dt>
            <dd className="stable-number">{metricTwo}</dd>
          </div>
        </dl>
        <button className="test-button" type="button" onClick={onTest} disabled={testState === 'running'}>
          <Icon name={testState === 'running' ? 'pause' : testState === 'success' ? 'check' : 'play'} />
          <StableText value={testLabel} candidates={testLabels} />
        </button>
      </footer>

      <Modal open={briefOpen} title={`Work order ${String(puzzle.number).padStart(2, '0')}`} onClose={() => setBriefOpen(false)} className="story-modal">
        <article className="story-sheet">
          <header>
            <span>{puzzle.date}</span>
            <span>{puzzle.client}</span>
          </header>
          <h2>{puzzle.title}</h2>
          <p>{puzzle.brief}</p>
          <blockquote>{puzzle.note}</blockquote>
          <div className="story-sheet__hint">
            <Icon name="sparkles" />
            <div>
              <strong>Foreman’s hint</strong>
              <p>{puzzle.hint}</p>
            </div>
          </div>
        </article>
      </Modal>

      <Modal open={helpOpen} title={`${game.title} controls`} onClose={() => setHelpOpen(false)}>
        {help}
      </Modal>

      <Modal open={mobilePuzzlesOpen} title="Choose a work order" onClose={() => setMobilePuzzlesOpen(false)} className="puzzle-picker-modal">
        <div className="puzzle-picker-grid">
          {puzzles.map((item, index) => (
            <button
              className="puzzle-picker-card"
              type="button"
              key={item.id}
              aria-current={index === puzzleIndex ? 'step' : undefined}
              onClick={() => {
                onSelectPuzzle(index);
                setMobilePuzzlesOpen(false);
              }}
            >
              <span className="stable-number">{String(item.number).padStart(2, '0')}</span>
              <strong>{item.title}</strong>
              <small>{item.client}</small>
              {completedPuzzleIds.has(item.id) ? <Icon name="check" /> : null}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
