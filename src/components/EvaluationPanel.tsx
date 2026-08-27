import { useEffect, useState } from 'react';
import type { EvaluationRecord, GameId } from '../core/types';

const fields: { key: keyof Pick<EvaluationRecord, 'buildFeel' | 'clarity' | 'depth' | 'setting'>; label: string }[] = [
  { key: 'buildFeel', label: 'BUILD FEEL' },
  { key: 'clarity', label: 'PREDICTABILITY' },
  { key: 'depth', label: 'PROMISED DEPTH' },
  { key: 'setting', label: 'SETTING FIT' },
];

export function EvaluationPanel({ game, initial, onSave, onClose }: {
  game: GameId;
  initial?: EvaluationRecord;
  onSave: (game: GameId, evaluation: Omit<EvaluationRecord, 'updatedAt'>) => void;
  onClose: () => void;
}) {
  const fresh = () => ({ buildFeel: initial?.buildFeel ?? 3, clarity: initial?.clarity ?? 3, depth: initial?.depth ?? 3, setting: initial?.setting ?? 3, notes: initial?.notes ?? '' });
  const [values, setValues] = useState(fresh);
  useEffect(() => setValues(fresh()), [game, initial]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="evaluation-panel">
      <h3>{game === 'rail' ? 'Coldwater Junction' : game === 'folding' ? 'Bellweather Folding Room' : 'Orpheum Fly Loft'}</h3>
      {fields.map((field) => (
        <label key={field.key} className="evaluation-row">
          <span>{field.label}</span>
          <input type="range" min="1" max="5" step="1" value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: Number(event.target.value) }))}/>
          <output>{values[field.key]}</output>
        </label>
      ))}
      <textarea aria-label="Expert observations" placeholder="What did the system invite you to try? Where did the interface get between you and the idea? What optimization did you want to chase?" value={values.notes} onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}/>
      <div className="evaluation-panel__actions">
        <button onClick={onClose}>Close</button>
        <button onClick={() => { onSave(game, values); onClose(); }}>Save notes</button>
      </div>
    </div>
  );
}
