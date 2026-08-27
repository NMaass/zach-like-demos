export type GameId = 'rail' | 'folding' | 'rigging';

export interface ScoreRecord {
  primary: number;
  secondary: number;
  tertiary?: number;
}

export interface CompletionRecord {
  solvedAt: string;
  elapsedMs: number;
  attempts: number;
  undos: number;
  score: ScoreRecord;
}

export interface EvaluationRecord {
  buildFeel: number;
  clarity: number;
  depth: number;
  setting: number;
  notes: string;
  updatedAt: string;
}

export interface Notebook {
  completions: Partial<Record<GameId, Record<string, CompletionRecord>>>;
  evaluations: Partial<Record<GameId, EvaluationRecord>>;
}

export interface PuzzleMeta {
  id: string;
  title: string;
  date: string;
  sender: string;
  subject: string;
  memo: string;
  aside?: string;
}
