import { useState } from 'react';
import type { EvaluationRecord, GameId, Notebook } from '../core/types';
import { downloadNotebook } from '../core/storage';
import { EvaluationPanel } from './EvaluationPanel';

const games: { id: GameId; number: string; title: string; kicker: string; question: string; rule: string }[] = [
  { id: 'rail', number: 'TRIAL I', title: 'Coldwater Junction', kicker: 'automatic classification yard · 1912', question: 'Can one alternating turnout become a language for sorting whole trains?', rule: 'Place the machines. Join their sockets with rail. Set the starting cams. That is the entire vocabulary.' },
  { id: 'folding', number: 'TRIAL II', title: 'Bellweather Folding Room', kicker: 'commercial print shop · 1927', question: 'Can folding alone support a satisfying open-ended construction game?', rule: 'There is no tool palette. Take an outside edge of the printed sheet and fold it to a panel line.' },
  { id: 'rigging', number: 'TRIAL III', title: 'Orpheum Fly Loft', kicker: 'hemp stage house · 1908', question: 'Can reeving one rope through blocks create expressive engineering puzzles?', rule: 'Take the live end. Pass it through any available block. Finish at the hand line. Nothing else.' },
];

function Preview({ game }: { game: GameId }) {
  if (game === 'rail') return (
    <svg viewBox="0 0 420 258" role="img" aria-label="A small automatic railway classification yard">
      <defs><pattern id="lp-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#28443c" strokeWidth=".45" opacity=".4"/></pattern></defs>
      <rect width="420" height="258" fill="#17221f"/><rect width="420" height="258" fill="url(#lp-grid)"/>
      <path d="M22 132 C90 132 95 73 154 73 M154 73 C218 73 222 45 324 45 M154 73 C220 73 220 113 324 113 M22 132 C94 132 96 184 158 184 M158 184 C225 184 231 213 324 213" fill="none" stroke="#8fb0a3" strokeWidth="7" opacity=".18"/>
      <path d="M22 132 C90 132 95 73 154 73 M154 73 C218 73 222 45 324 45 M154 73 C220 73 220 113 324 113 M22 132 C94 132 96 184 158 184 M158 184 C225 184 231 213 324 213" fill="none" stroke="#aecfc1" strokeWidth="1.4"/>
      <g fill="#263a34" stroke="#b5cdbf"><circle cx="154" cy="73" r="12"/><circle cx="158" cy="184" r="12"/></g>
      <g stroke="#d2a257" strokeWidth="2"><path d="M149 78l11-11"/><path d="M153 179l11 11"/></g>
      <g><rect x="43" y="117" width="39" height="22" rx="2" fill="#904a37"/><rect x="85" y="117" width="39" height="22" rx="2" fill="#527b70"/></g>
      <g fill="#9bb2a8" fontFamily="DM Mono, monospace" fontSize="9"><text x="332" y="49">POST</text><text x="332" y="117">MARKET</text><text x="332" y="217">MILL</text></g>
    </svg>
  );
  if (game === 'folding') return (
    <svg viewBox="0 0 420 258" role="img" aria-label="A folded printed street map">
      <rect width="420" height="258" fill="#504735"/>
      <g transform="translate(62 43) rotate(-4 145 78)">
        <rect x="0" y="0" width="286" height="156" rx="2" fill="#e7d6ad" stroke="#8e7655"/>
        <path d="M71.5 0V156M143 0V156M214.5 0V156M0 78H286" stroke="#927c5d" strokeWidth="1" strokeDasharray="4 3"/>
        <path d="M18 38 C56 13 94 58 128 36 S201 18 267 46 M25 119 C75 95 103 132 145 94 S221 93 267 123 M40 19V137M183 10V145" fill="none" stroke="#793d31" strokeWidth="2" opacity=".72"/>
        <circle cx="57" cy="112" r="7" fill="#8e3e2c"/><text x="70" y="116" fontFamily="DM Mono, monospace" fontSize="8" fill="#5a4635">BELLWEATHER</text>
      </g>
      <path d="M359 67 C389 96 380 146 344 167" fill="none" stroke="#d4a76c" strokeWidth="2"/><path d="M347 155l-4 13 14-4" fill="none" stroke="#d4a76c" strokeWidth="2"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 420 258" role="img" aria-label="A hand-reeved theatrical pulley system">
      <rect width="420" height="258" fill="#171a1c"/>
      <g stroke="#434b4d" strokeWidth=".6"><path d="M26 31H394"/><path d="M85 31v24M180 31v24M276 31v24"/></g>
      <g fill="#292e30" stroke="#cfb88f" strokeWidth="1.2"><circle cx="85" cy="65" r="14"/><circle cx="180" cy="65" r="14"/><circle cx="276" cy="65" r="14"/><circle cx="135" cy="164" r="16"/><circle cx="230" cy="164" r="16"/></g>
      <path d="M38 35 L135 164 L85 65 L230 164 L276 65 L373 224" fill="none" stroke="#d4c092" strokeWidth="2.2"/>
      <rect x="92" y="193" width="176" height="25" rx="2" fill="#513d37" stroke="#b7786d"/><text x="180" y="210" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="9" fill="#d6b1a7">ACT II GARDEN</text>
    </svg>
  );
}

export function Launcher({ notebook, onOpen, onSaveEvaluation }: {
  notebook: Notebook;
  onOpen: (game: GameId) => void;
  onSaveEvaluation: (game: GameId, evaluation: Omit<EvaluationRecord, 'updatedAt'>) => void;
}) {
  const [evaluating, setEvaluating] = useState<GameId | null>(null);
  return (
    <main className="launcher">
      <div className="launcher__inner">
        <header className="launcher__masthead">
          <div>
            <div className="launcher__kicker">THREE QUESTIONS · THIRTY WORK ORDERS</div>
            <h1 className="launcher__title">Workshop Trials</h1>
          </div>
          <p className="launcher__dek">Each prototype is built around <strong>one physical idea</strong>. Solve the assigned job. Then rebuild it because the first thing you made bothers you. The test is whether touching the system itself makes you want another problem.</p>
        </header>
        <div className="launcher__rule" />
        <section className="prototype-grid" aria-label="Three prototype workbenches">
          {games.map((game) => {
            const complete = Object.keys(notebook.completions[game.id] ?? {}).length;
            return (
              <button className={`prototype-card prototype-card--${game.id}`} key={game.id} onClick={() => onOpen(game.id)}>
                <div className="prototype-card__art"><Preview game={game.id}/></div>
                <div className="prototype-card__body">
                  <div className="prototype-card__number"><span>{game.number}</span><span>{complete}/10 COMPLETE</span></div>
                  <h2>{game.title}</h2>
                  <p className="prototype-card__verb">{game.kicker}</p>
                  <p>{game.question} {game.rule}</p>
                </div>
                <div className="prototype-card__progress" aria-label={`${complete} of ten completed`}>
                  {Array.from({ length: 10 }, (_, index) => <i key={index} data-complete={index < complete ? '' : undefined}/>) }
                </div>
              </button>
            );
          })}
        </section>
        <footer className="launcher__footer">
          <div className="launcher__thesis">NO ACCOUNTS · NO TELEMETRY · PROGRESS STAYS IN THIS BROWSER · DIRECT ROUTES: #/rail/1 · #/folding/1 · #/rigging/1</div>
          <div style={{display:'flex', gap:8}}>
            <button className="launcher__expert" onClick={() => setEvaluating('rail')}>Expert notebook</button>
            <button className="launcher__expert" onClick={() => downloadNotebook(notebook)}>Export JSON</button>
          </div>
        </footer>
        {evaluating ? (
          <div className="expert-drawer">
            <div className="expert-drawer__header">
              <h2>Expert evaluation</h2>
              <div style={{display:'flex', gap:8}}>
                {games.map((game) => <button key={game.id} onClick={() => setEvaluating(game.id)}>{game.number}</button>)}
              </div>
            </div>
            <EvaluationPanel game={evaluating} initial={notebook.evaluations[evaluating]} onSave={onSaveEvaluation} onClose={() => setEvaluating(null)} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
