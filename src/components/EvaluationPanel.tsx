import { useMemo, useState, type ChangeEvent } from 'react';
import type { GameDescriptor, GameEvaluation } from '../core/types';
import { Icon } from './Icon';
import { Modal } from './Modal';

const dimensions = [
  ['buildFeel', 'Build feel', 'How satisfying is it to manipulate and iterate?'],
  ['clarity', 'Clarity', 'How quickly do the rules become legible?'],
  ['depth', 'Depth', 'How much room seems available for harder puzzles?'],
  ['setting', 'Setting', 'Does the fiction make the work feel worthwhile?'],
] as const;

function Rating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="rating" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          className="rating__button"
          type="button"
          aria-label={`${score} out of 5`}
          aria-pressed={score === value}
          onClick={() => onChange(score)}
        >
          <Icon name="star" />
        </button>
      ))}
    </div>
  );
}

export function EvaluationPanel({
  game,
  value,
  onSave,
  triggerClassName,
}: {
  game: GameDescriptor;
  value: GameEvaluation | undefined;
  onSave: (evaluation: Omit<GameEvaluation, 'updatedAt'>) => void;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const initial = useMemo(
    () => ({
      buildFeel: value?.buildFeel ?? 0,
      clarity: value?.clarity ?? 0,
      depth: value?.depth ?? 0,
      setting: value?.setting ?? 0,
      notes: value?.notes ?? '',
    }),
    [value],
  );
  const [draft, setDraft] = useState(initial);

  const show = () => {
    setDraft(initial);
    setOpen(true);
  };

  const save = () => {
    onSave(draft);
    setOpen(false);
  };

  return (
    <>
      <button className={triggerClassName ?? 'button button--quiet'} type="button" onClick={show}>
        <Icon name="star" />
        {value ? 'Edit expert notes' : 'Rate this prototype'}
      </button>
      <Modal open={open} title={`Expert review · ${game.title}`} onClose={() => setOpen(false)}>
        <p className="modal__lede">
          Record the impression this prototype leaves after play. Notes remain in this browser until exported.
        </p>
        <div className="evaluation-grid">
          {dimensions.map(([key, label, description]) => (
            <section className="evaluation-row" key={key}>
              <div>
                <h3>{label}</h3>
                <p>{description}</p>
              </div>
              <Rating
                label={label}
                value={draft[key]}
                onChange={(score) => setDraft((current) => ({ ...current, [key]: score }))}
              />
            </section>
          ))}
        </div>
        <label className="field">
          <span>Observations</span>
          <textarea
            value={draft.notes}
            rows={6}
            placeholder="Where did the interaction sing? Where did it fight you? What puzzle spaces seem promising?"
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDraft((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>
        <footer className="modal__actions">
          <button className="button button--quiet" type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={save}
            disabled={dimensions.some(([key]) => draft[key] === 0)}
          >
            <Icon name="check" />
            Save review
          </button>
        </footer>
      </Modal>
    </>
  );
}
