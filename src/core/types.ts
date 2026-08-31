export type GameId = 'rail' | 'bindery' | 'rigging';

export interface PuzzleBase {
  id: string;
  number: number;
  title: string;
  sender: string;
  date: string;
  story: string;
  instruction: string;
  metricLabel: string;
}

export interface Point {
  x: number;
  y: number;
}
