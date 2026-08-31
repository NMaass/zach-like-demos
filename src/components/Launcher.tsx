import type { ReactNode } from 'react';
import type { GameId } from '../core/types';

interface LauncherProps { onOpen: (game: GameId) => void }

function RailPreview() {
  return <svg viewBox="0 0 300 150" aria-hidden="true"><path className="preview-grid" d="M0 25H300M0 50H300M0 75H300M0 100H300M0 125H300M25 0V150M50 0V150M75 0V150M100 0V150M125 0V150M150 0V150M175 0V150M200 0V150M225 0V150M250 0V150M275 0V150"/><g className="preview-track"><path d="M0 80H94L146 42H300"/><path d="M94 80L156 116H300"/></g><g className="preview-car"><rect x="44" y="70" width="34" height="18" rx="3"/><circle cx="53" cy="90" r="3"/><circle cx="69" cy="90" r="3"/></g></svg>;
}
function BinderyPreview() {
  return <div className="preview-bindery"><div className="preview-sheet"><span>8</span><span>1</span><span>6</span><span>3</span></div><div className="preview-fold-arrow">←</div></div>;
}
function RiggingPreview() {
  return <svg viewBox="0 0 300 150" aria-hidden="true"><line className="preview-gridiron" x1="30" y1="25" x2="270" y2="25"/><circle className="preview-pulley" cx="92" cy="45" r="13"/><circle className="preview-pulley moving" cx="166" cy="105" r="13"/><circle className="preview-pulley" cx="236" cy="45" r="13"/><polyline className="preview-rope" points="25,125 92,45 166,105 236,45 275,25"/><rect className="preview-load" x="124" y="124" width="84" height="12"/></svg>;
}

const trials: { id:GameId; number:string; title:string; shop:string; premise:string; rule:string; tone:string; preview:ReactNode }[] = [
  { id:'rail', number:'01', title:'Coldwater Junction', shop:'1937 · Erie & Western civil engineering office', premise:'Design a classification yard directly on the survey sheet, then watch the tower route a real freight cut through it.', rule:'YOU PLACE: RAIL', tone:'Spatial routing · shared infrastructure · compactness', preview:<RailPreview/> },
  { id:'bindery', number:'02', title:'Bellweather Bindery', shop:'1925 · commercial folding room', premise:'Take an imposed press sheet and discover the fold sequence that turns it into the approved signature.', rule:'YOU DO: FOLD', tone:'State transformation · sequence · physical intuition', preview:<BinderyPreview/> },
  { id:'rigging', number:'03', title:'The Orpheum Fly Loft', shop:'1956 · theatre stage department', premise:'Reeve one rope through hardware already in the loft. Mechanical advantage and travel emerge from the path you choose.', rule:'YOU PLACE: ROPE', tone:'Mechanical advantage · path planning · elegance', preview:<RiggingPreview/> },
];

export function Launcher({ onOpen }: LauncherProps) {
  return (
    <main className="launcher">
      <header className="launcher-head">
        <div><span className="eyebrow">WORKSHOP TRIALS / REVISION B</span><h1>Three mechanisms.<br/>One question.</h1></div>
        <p>Does the act of building feel good enough to deserve a full game? Each trial has one construction vocabulary and ten work orders. No inventories, research trees, currencies, or auxiliary systems.</p>
      </header>
      <section className="trial-list">
        {trials.map((trial)=><button className={`trial-row trial-${trial.id}`} key={trial.id} onClick={()=>onOpen(trial.id)}>
          <div className="trial-number">{trial.number}</div>
          <div className="trial-copy"><span>{trial.shop}</span><h2>{trial.title}</h2><p>{trial.premise}</p><div className="trial-rule">{trial.rule}</div><small>{trial.tone}</small></div>
          <div className="trial-preview">{trial.preview}</div>
          <div className="trial-enter">OPEN<br/>WORK ORDERS →</div>
        </button>)}
      </section>
      <footer className="launcher-foot"><span>Built for expert comparative playtesting</span><span>Progress is deliberately disposable · use the browser back button or ← Workshop Trials</span></footer>
    </main>
  );
}
