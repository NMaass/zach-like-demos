import { useEffect, useMemo, useState } from 'react';
import { binderyDescriptor } from '../games/bindery/BinderyGame';
import { binderyPuzzles } from '../games/bindery/binderyData';
import { railDescriptor } from '../games/rail/RailGame';
import { railPuzzles } from '../games/rail/railData';
import { riggingDescriptor } from '../games/rigging/RiggingGame';
import { riggingPuzzles } from '../games/rigging/riggingData';
import { downloadNotebook } from '../core/persistence';
import type { GameEvaluation, GameId, PlaytestNotebook } from '../core/types';
import { EvaluationPanel } from './EvaluationPanel';
import { Icon } from './Icon';
import { Modal } from './Modal';

const descriptors = [railDescriptor, binderyDescriptor, riggingDescriptor] as const;
function RailIllustration() {
  return (
    <svg viewBox="0 0 520 300" aria-hidden="true" className="prototype-art prototype-art--rail">
      <defs>
        <linearGradient id="rail-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#59677a" />
          <stop offset="1" stopColor="#26303d" />
        </linearGradient>
        <pattern id="rail-noise" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r="1" fill="currentColor" opacity=".12" />
          <circle cx="14" cy="11" r=".8" fill="currentColor" opacity=".08" />
        </pattern>
      </defs>
      <rect width="520" height="300" rx="28" fill="url(#rail-sky)" />
      <path d="M0 218 96 174l102 22 101-67 109 35 112-41v177H0Z" fill="#1f2832" />
      <path d="M0 230 125 188l100 26 93-62 111 32 91-35" fill="none" stroke="#d0d7dc" strokeWidth="17" opacity=".2" />
      <g fill="none" stroke="#e4b65d" strokeLinecap="round">
        <path d="M20 245h208c66 0 73-105 139-105h133" strokeWidth="9" />
        <path d="M20 268h167c79 0 78-74 155-74h158" strokeWidth="9" />
        <path d="M278 202c32-17 42-62 90-62" strokeWidth="6" opacity=".8" />
      </g>
      <g stroke="#151b22" strokeWidth="5" opacity=".7">
        {Array.from({ length: 16 }, (_, index) => <path key={index} d={`M${28 + index * 30} ${236 + Math.sin(index / 2) * 6}v28`} />)}
      </g>
      <g transform="translate(63 208)">
        <rect width="90" height="35" rx="8" fill="#d9e0dd" />
        <rect x="12" y="-19" width="32" height="21" rx="4" fill="#d9e0dd" />
        <circle cx="22" cy="36" r="10" fill="#151b22" />
        <circle cx="70" cy="36" r="10" fill="#151b22" />
        <path d="M54 8h24" stroke="#27313c" strokeWidth="7" />
      </g>
      <g transform="translate(166 218)">
        {['#a94c41', '#d5c4a1', '#303c48'].map((fill, index) => (
          <g key={fill} transform={`translate(${index * 60} 0)`}>
            <rect width="50" height="28" rx="5" fill={fill} />
            <circle cx="12" cy="29" r="7" fill="#11161c" />
            <circle cx="39" cy="29" r="7" fill="#11161c" />
          </g>
        ))}
      </g>
      <rect width="520" height="300" rx="28" fill="url(#rail-noise)" />
      <g transform="translate(29 28)">
        <rect width="174" height="48" rx="8" fill="#f0c875" />
        <text x="18" y="31" fill="#1c232c" fontSize="20" fontWeight="800" letterSpacing="3">COLDWATER</text>
      </g>
    </svg>
  );
}

function BinderyIllustration() {
  return (
    <svg viewBox="0 0 520 300" aria-hidden="true" className="prototype-art prototype-art--bindery">
      <defs>
        <linearGradient id="desk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#70493a" />
          <stop offset="1" stopColor="#3f2924" />
        </linearGradient>
        <filter id="paper-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodOpacity=".25" />
        </filter>
      </defs>
      <rect width="520" height="300" rx="28" fill="url(#desk)" />
      <g opacity=".16" stroke="#f5e6cf" strokeWidth="2">
        {Array.from({ length: 11 }, (_, index) => <path key={index} d={`M0 ${18 + index * 29}c90-18 160 22 250 0s180 15 270-4`} />)}
      </g>
      <g transform="translate(104 50) rotate(-5 160 100)" filter="url(#paper-shadow)">
        <rect width="310" height="205" rx="8" fill="#efe4ca" />
        <path d="M155 0v205M0 102.5h310" stroke="#b8a88b" strokeDasharray="8 7" strokeWidth="2" />
        <g fill="#9c3f3d" fontFamily="Georgia, serif" textAnchor="middle">
          <text x="78" y="60" fontSize="42">1</text>
          <text x="233" y="60" fontSize="42">4</text>
          <text x="78" y="164" fontSize="42">2</text>
          <text x="233" y="164" fontSize="42">3</text>
        </g>
        <path d="M24 24h262M24 181h262" stroke="#3e5143" strokeWidth="3" />
      </g>
      <g transform="translate(46 49) rotate(18)">
        <path d="M0 0h20v160H0z" fill="#b49a72" />
        <path d="M4 0v160M12 0v160" stroke="#7b664c" strokeWidth="2" />
      </g>
      <g transform="translate(415 45) rotate(18)">
        <circle cx="26" cy="24" r="20" fill="none" stroke="#b9c1b6" strokeWidth="9" />
        <circle cx="26" cy="84" r="20" fill="none" stroke="#b9c1b6" strokeWidth="9" />
        <path d="m38 39 41 102M38 69 79-8" stroke="#d1d7d0" strokeWidth="8" strokeLinecap="round" />
      </g>
      <rect x="30" y="24" width="198" height="48" rx="6" fill="#31483b" />
      <text x="48" y="55" fill="#f3e5c6" fontSize="19" fontWeight="700" letterSpacing="2">BELLWEATHER BINDERY</text>
    </svg>
  );
}

function RiggingIllustration() {
  return (
    <svg viewBox="0 0 520 300" aria-hidden="true" className="prototype-art prototype-art--rigging">
      <defs>
        <linearGradient id="stage-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#25242c" />
          <stop offset="1" stopColor="#111217" />
        </linearGradient>
        <radialGradient id="stage-glow" cx="50%" cy="70%" r="55%">
          <stop offset="0" stopColor="#d6a75e" stopOpacity=".48" />
          <stop offset="1" stopColor="#d6a75e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="520" height="300" rx="28" fill="url(#stage-dark)" />
      <rect width="520" height="300" rx="28" fill="url(#stage-glow)" />
      <g stroke="#7a6756" strokeWidth="8">
        <path d="M36 55h448M36 112h448M36 169h448" />
        <path d="M70 30v176M450 30v176" />
      </g>
      <g fill="none" stroke="#d2b074" strokeWidth="5">
        <path d="M112 52v172M248 52v118M373 52v151" />
      </g>
      <g transform="translate(95 71)">
        <circle cx="17" cy="17" r="14" fill="#c89e5b" stroke="#f3d99d" strokeWidth="5" />
        <path d="M17 32v31" stroke="#c89e5b" strokeWidth="6" />
      </g>
      <g transform="translate(231 72)">
        <circle cx="17" cy="17" r="14" fill="#c89e5b" stroke="#f3d99d" strokeWidth="5" />
        <circle cx="17" cy="56" r="14" fill="#c89e5b" stroke="#f3d99d" strokeWidth="5" />
      </g>
      <g transform="translate(356 72)">
        <circle cx="17" cy="17" r="14" fill="#c89e5b" stroke="#f3d99d" strokeWidth="5" />
        <circle cx="17" cy="56" r="14" fill="#c89e5b" stroke="#f3d99d" strokeWidth="5" />
        <circle cx="17" cy="95" r="14" fill="#c89e5b" stroke="#f3d99d" strokeWidth="5" />
      </g>
      <path d="M70 216h380v70H70z" fill="#6c2732" />
      <path d="M70 216c55 35 94 35 126 0 46 35 89 35 128 0 45 35 86 35 126 0" fill="#8d3542" />
      <path d="M159 216v-44h202v44" fill="#d2bf91" stroke="#e8d6ab" strokeWidth="4" />
      <text x="260" y="199" textAnchor="middle" fill="#3b2b26" fontSize="19" fontWeight="800" letterSpacing="4">ORPHEUM</text>
    </svg>
  );
}

function PrototypeIllustration({ id }: { id: GameId }) {
  if (id === 'rail') return <RailIllustration />;
  if (id === 'bindery') return <BinderyIllustration />;
  return <RiggingIllustration />;
}

function ScoreSummary({ notebook }: { notebook: PlaytestNotebook }) {
  const evaluations = descriptors
    .map((game) => ({ game, evaluation: notebook.evaluations[game.id] }))
    .filter((entry) => entry.evaluation);
  if (evaluations.length === 0) return null;
  return (
    <section className="review-summary" aria-labelledby="review-summary-title">
      <div>
        <span className="eyebrow">Expert notebook</span>
        <h2 id="review-summary-title">Current impressions</h2>
      </div>
      <div className="review-summary__scores">
        {evaluations.map(({ game, evaluation }) => (
          <div key={game.id}>
            <strong>{game.title}</strong>
            <span className="stable-number">{evaluation ? ((evaluation.buildFeel + evaluation.clarity + evaluation.depth + evaluation.setting) / 4).toFixed(1) : '—'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Launcher({
  notebook,
  seenIntro,
  onMarkIntroSeen,
  onOpenGame,
  onSaveEvaluation,
}: {
  notebook: PlaytestNotebook;
  seenIntro: boolean;
  onMarkIntroSeen: () => void;
  onOpenGame: (gameId: GameId, puzzleIndex: number) => void;
  onSaveEvaluation: (gameId: GameId, value: Omit<GameEvaluation, 'updatedAt'>) => void;
}) {
  const [aboutOpen, setAboutOpen] = useState(!seenIntro);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const game = descriptors[Number(event.key) - 1];
      if (game) onOpenGame(game.id, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenGame]);

  const totalComplete = useMemo(
    () => descriptors.reduce((sum, game) => sum + Object.keys(notebook.completions[game.id] ?? {}).length, 0),
    [notebook.completions],
  );

  const closeIntro = () => {
    setAboutOpen(false);
    onMarkIntroSeen();
  };

  return (
    <main className="launcher" id="main-content">
      <header className="launcher-header">
        <div className="launcher-wordmark">
          <span className="launcher-wordmark__seal"><Icon name="sparkles" /></span>
          <div>
            <span className="eyebrow">Three playable design studies</span>
            <strong>Workshop Trials</strong>
          </div>
        </div>
        <nav className="launcher-actions" aria-label="Launcher actions">
          <button className="button button--quiet" type="button" onClick={() => setAboutOpen(true)}>
            <Icon name="circle-help" /> Playtest protocol
          </button>
          <button className="button button--quiet" type="button" onClick={() => downloadNotebook(notebook)}>
            <Icon name="download" /> Export notes
          </button>
        </nav>
      </header>

      <section className="launcher-hero">
        <div className="launcher-hero__copy">
          <span className="eyebrow">Vertical slice collection · build 0.1</span>
          <h1>Can physical work produce the next great open-ended puzzle system?</h1>
          <p>
            Each prototype has ten compact work orders, a tiny physical vocabulary, persistent local progress, and a dedicated expert review form. Judge the manipulation before the puzzle count.
          </p>
          <div className="launcher-hero__meta">
            <div><strong className="stable-number">{totalComplete}</strong><span>of 30 solved</span></div>
            <div><strong>Local only</strong><span>No accounts or telemetry</span></div>
            <div><strong>Desktop first</strong><span>Mouse + keyboard</span></div>
          </div>
        </div>
        <div className="launcher-hero__diagram" aria-hidden="true">
          <span className="diagram-node diagram-node--one"><Icon name="train" /></span>
          <span className="diagram-node diagram-node--two"><Icon name="book" /></span>
          <span className="diagram-node diagram-node--three"><Icon name="weight" /></span>
          <svg viewBox="0 0 460 260"><path d="M66 180C130 40 250 42 385 158M64 184c115 38 206 39 321-22M229 55v145" /></svg>
          <strong>Small tools.<br />Large solution spaces.</strong>
        </div>
      </section>

      <section className="prototype-grid" aria-label="Prototype selection">
        {descriptors.map((game, index) => {
          const completed = notebook.completions[game.id] ?? {};
          const completionCount = Object.keys(completed).length;
          const puzzleIds = game.id === 'rail'
            ? railPuzzles.map((puzzle) => puzzle.id)
            : game.id === 'bindery'
              ? binderyPuzzles.map((puzzle) => puzzle.id)
              : riggingPuzzles.map((puzzle) => puzzle.id);
          const firstUnsolved = puzzleIds.findIndex((puzzleId) => !completed[puzzleId]);
          const nextPuzzle = firstUnsolved === -1 ? 0 : firstUnsolved;
          const evaluation = notebook.evaluations[game.id];
          return (
            <article className={`prototype-card prototype-card--${game.id}`} key={game.id}>
              <div className="prototype-card__art"><PrototypeIllustration id={game.id} /></div>
              <div className="prototype-card__body">
                <div className="prototype-card__index"><span>0{index + 1}</span><kbd>{index + 1}</kbd></div>
                <span className="eyebrow">{game.year} · {game.location}</span>
                <h2>{game.title}</h2>
                <p className="prototype-card__subtitle">{game.subtitle}</p>
                <p>{game.summary}</p>
                <div className="prototype-card__progress">
                  <div><span style={{ width: `${completionCount * 10}%` }} /></div>
                  <strong className="stable-number">{completionCount}/10</strong>
                </div>
                <div className="prototype-card__actions">
                  <button className="button button--primary" type="button" onClick={() => onOpenGame(game.id, nextPuzzle)}>
                    {completionCount === 0 ? 'Begin prototype' : completionCount === 10 ? 'Revisit workshop' : 'Continue work'}
                    <Icon name="arrow-right" />
                  </button>
                  <EvaluationPanel
                    game={game}
                    value={evaluation}
                    onSave={(value) => onSaveEvaluation(game.id, value)}
                    triggerClassName="button button--icon-only"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <ScoreSummary notebook={notebook} />

      <footer className="launcher-footer">
        <p>Built as a comparative instrument: identical shell, distinct mechanics, thirty authored commissions.</p>
        <span>Progress and expert notes live in browser storage.</span>
      </footer>

      <Modal open={aboutOpen} title="How to evaluate these prototypes" onClose={closeIntro} className="protocol-modal">
        <div className="protocol-intro">
          <p>
            These are not content-complete games. They are polished vertical slices intended to answer one question: <strong>does the core act of constructing a solution feel legible, expressive, and worth deepening?</strong>
          </p>
        </div>
        <ol className="protocol-steps">
          <li><span>1</span><div><strong>Play at least three orders</strong><p>The first teaches vocabulary. The second tests transfer. The third begins to reveal depth.</p></div></li>
          <li><span>2</span><div><strong>Watch your hands, not your score</strong><p>Note misclicks, hesitation, unwanted movement, and whether revision feels safer than restarting.</p></div></li>
          <li><span>3</span><div><strong>Rate the system, then write</strong><p>Use the star button on any prototype. Export the notebook when the session ends.</p></div></li>
        </ol>
        <div className="protocol-principles">
          <span><Icon name="check" /> Deterministic rules</span>
          <span><Icon name="check" /> Tiny toolsets</span>
          <span><Icon name="check" /> Open-ended construction</span>
          <span><Icon name="check" /> Believable work orders</span>
        </div>
        <footer className="modal__actions">
          <button className="button button--primary" type="button" onClick={closeIntro}>
            Enter the workshops <Icon name="arrow-right" />
          </button>
        </footer>
      </Modal>
    </main>
  );
}
