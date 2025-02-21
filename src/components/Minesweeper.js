import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Cell from './Cell';

/**
 * Componente principal del juego Buscaminas
 * @param {Object} props
 * @param {number} props.rows - Número de filas del tablero
 * @param {number} props.cols - Número de columnas del tablero
 * @param {number} props.mines - Número de minas en el tablero
 */
const Minesweeper = ({ rows = 8, cols = 8, mines = 10 }) => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    // Crear tablero vacío
    let newBoard = Array(rows).fill().map(() => 
      Array(cols).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Colocar minas aleatoriamente
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);
      
      if (!newBoard[randomRow][randomCol].isMine) {
        newBoard[randomRow][randomCol].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular números vecinos
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          // Verificar las 8 celdas vecinas
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (i + di >= 0 && i + di < rows && j + dj >= 0 && j + dj < cols) {
                if (newBoard[i + di][j + dj].isMine) count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
  };

  const handleCellPress = (row, col) => {
    if (gameOver || board[row][col].isFlagged) return;

    if (board[row][col].isMine) {
      // Juego terminado
      revealAll();
      setGameOver(true);
      Alert.alert('Game Over', '¡Has perdido!');
      return;
    }

    revealCell(row, col);
  };

  const revealCell = (row, col) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    
    const newBoard = [...board];
    if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) return;
    
    newBoard[row][col].isRevealed = true;
    
    if (newBoard[row][col].neighborMines === 0) {
      // Revelar celdas vecinas si no hay minas cercanas
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          revealCell(row + i, col + j);
        }
      }
    }
    
    setBoard(newBoard);
  };

  const revealAll = () => {
    const newBoard = board.map(row =>
      row.map(cell => ({ ...cell, isRevealed: true }))
    );
    setBoard(newBoard);
  };

  return (
    <View style={styles.container}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onPress={() => handleCellPress(rowIndex, colIndex)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});

export default Minesweeper; 