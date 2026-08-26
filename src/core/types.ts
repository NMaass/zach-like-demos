export type GameId = 'rail' | 'bindery' | 'rigging';

export interface PuzzleStory {
  id: string;
  number: number;
  title: string;
  client: string;
  date: string;
  brief: string;
  note: string;
  completion: string;
  hint: string;
}

export interface CompletionRecord {
  completedAt: string;
  elapsedSeconds: number;
  primaryMetric: number;
  secondaryMetric: number;
}

export interface GameEvaluation {
  buildFeel: number;
  clarity: number;
  depth: number;
  setting: number;
  notes: string;
  updatedAt: string;
}

export interface PlaytestNotebook {
  completions: Partial<Record<GameId, Record<string, CompletionRecord>>>;
  evaluations: Partial<Record<GameId, GameEvaluation>>;
}

export interface GameDescriptor {
  id: GameId;
  title: string;
  subtitle: string;
  year: string;
  location: string;
  summary: string;
  accent: string;
  metricLabels: readonly [string, string];
}
