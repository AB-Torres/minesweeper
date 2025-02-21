import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import Cell from './Cell';
import { CellData, GameState } from '../types';
import { CELL_SIZE } from '../constants/game';

interface BoardProps {
  gameState: GameState;
  onCellPress: (row: number, col: number) => void;
  onCellLongPress: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onCellPress, onCellLongPress }) => {
  const { board } = gameState;

  return (
    <ScrollView 
      horizontal 
      contentContainerStyle={styles.scrollContainer}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      overScrollMode="never"
      bounces={false}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        overScrollMode="never"
        bounces={false}
      >
        <View style={styles.board}>
          {board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  onPress={() => onCellPress(rowIndex, colIndex)}
                  onLongPress={() => onCellLongPress(rowIndex, colIndex)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    padding: 10,
    ...Platform.select({
      android: {
        elevation: 4,
        backgroundColor: '#fff',
        borderRadius: 4,
      },
    }),
  },
  row: {
    flexDirection: 'row',
  },
});

export default Board; 