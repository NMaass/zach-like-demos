import type { CompletionRecord, GameEvaluation, GameId, PlaytestNotebook } from './types';

export interface PrototypeGameProps {
  puzzleIndex: number;
  onPuzzleIndexChange: (index: number) => void;
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  notebook: PlaytestNotebook;
  onComplete: (gameId: GameId, puzzleId: string, completion: CompletionRecord) => void;
  evaluation: GameEvaluation | undefined;
  onSaveEvaluation: (evaluation: Omit<GameEvaluation, 'updatedAt'>) => void;
}
