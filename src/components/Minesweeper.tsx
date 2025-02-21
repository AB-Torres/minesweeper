import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Cell from './Cell';
import { MinesweeperProps, CellData } from '../types';

const Minesweeper: React.FC<MinesweeperProps> = ({ 
  rows = 8, 
  cols = 8, 
  mines = 10 
}) => {
  const [board, setBoard] = useState<CellData[][]>([]);
  // ... resto del código igual
};

// ... estilos igual

export default Minesweeper; 