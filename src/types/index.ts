export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number | null;
}

export interface PlayerData {
  nickname: string;
  stats: {
    [key in Difficulty]: PlayerStats;
  };
}

export interface CellData {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  row: number;
  col: number;
}

export interface GameState {
  board: CellData[][];
  gameStatus: 'playing' | 'won' | 'lost';
  flagsRemaining: number;
  timeElapsed: number;
  difficulty: Difficulty;
}

export interface CellProps {
  cell: CellData;
  onPress: () => void;
}

export interface MinesweeperProps {
  rows?: number;
  cols?: number;
  mines?: number;
} 