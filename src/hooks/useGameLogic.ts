import { useState, useEffect, useCallback } from 'react';
import { GameState, CellData, Difficulty, GameConfig } from '../types';
import { DIFFICULTY_CONFIG } from '../constants/game';

export const useGameLogic = (difficulty: Difficulty) => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    gameStatus: 'playing',
    flagsRemaining: 0,
    timeElapsed: 0,
    difficulty,
  });

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isFirstMove, setIsFirstMove] = useState(true);

  const config = DIFFICULTY_CONFIG[difficulty];

  const createEmptyBoard = (config: GameConfig): CellData[][] => {
    const board: CellData[][] = [];
    for (let row = 0; row < config.rows; row++) {
      board[row] = [];
      for (let col = 0; col < config.cols; col++) {
        board[row][col] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
          row,
          col,
        };
      }
    }
    return board;
  };

  const placeMines = (board: CellData[][], firstRow: number, firstCol: number) => {
    const { rows, cols, mines } = config;
    let minesPlaced = 0;

    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      // Evitar colocar mina en la primera celda revelada o sus alrededores
      if (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) {
        continue;
      }

      if (!board[row][col].isMine) {
        board[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular números de minas vecinas
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!board[row][col].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (row + i >= 0 && row + i < rows && col + j >= 0 && col + j < cols) {
                if (board[row + i][col + j].isMine) count++;
              }
            }
          }
          board[row][col].neighborMines = count;
        }
      }
    }

    return board;
  };

  const revealCell = (row: number, col: number, board: CellData[][]) => {
    if (
      row < 0 ||
      row >= config.rows ||
      col < 0 ||
      col >= config.cols ||
      board[row][col].isRevealed ||
      board[row][col].isFlagged
    ) {
      return board;
    }

    board[row][col].isRevealed = true;

    if (board[row][col].neighborMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          revealCell(row + i, col + j, board);
        }
      }
    }

    return board;
  };

  const checkWinCondition = (board: CellData[][]): boolean => {
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const cell = board[row][col];
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  const handleCellPress = (row: number, col: number) => {
    if (gameState.gameStatus !== 'playing' || gameState.board[row][col].isFlagged) {
      return;
    }

    let newBoard = [...gameState.board.map(row => [...row])];

    if (isFirstMove) {
      newBoard = placeMines(newBoard, row, col);
      setIsFirstMove(false);
      startTimer();
    }

    if (newBoard[row][col].isMine) {
      // Revelar todas las minas
      newBoard = newBoard.map(row =>
        row.map(cell => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed,
        }))
      );
      stopTimer();
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        gameStatus: 'lost',
      }));
      return;
    }

    newBoard = revealCell(row, col, newBoard);

    if (checkWinCondition(newBoard)) {
      stopTimer();
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        gameStatus: 'won',
      }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      board: newBoard,
    }));
  };

  const handleCellLongPress = (row: number, col: number) => {
    if (gameState.gameStatus !== 'playing' || gameState.board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...gameState.board.map(row => [...row])];
    const cell = newBoard[row][col];

    if (!cell.isFlagged && gameState.flagsRemaining <= 0) {
      return;
    }

    cell.isFlagged = !cell.isFlagged;
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      flagsRemaining: prev.flagsRemaining + (cell.isFlagged ? -1 : 1),
    }));
  };

  const startTimer = () => {
    if (!timer) {
      const newTimer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
      setTimer(newTimer);
    }
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const resetGame = () => {
    stopTimer();
    setIsFirstMove(true);
    setGameState({
      board: createEmptyBoard(config),
      gameStatus: 'playing',
      flagsRemaining: config.mines,
      timeElapsed: 0,
      difficulty,
    });
  };

  useEffect(() => {
    resetGame();
    return () => stopTimer();
  }, [difficulty]);

  return {
    gameState,
    handleCellPress,
    handleCellLongPress,
    resetGame,
  };
}; 