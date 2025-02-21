import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, Animated, View } from 'react-native';
import { CellData } from '../types';
import { COLORS, CELL_SIZE } from '../constants/game';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGameAnimations } from '../hooks/useGameAnimations';

interface CellProps {
  cell: CellData;
  onPress: () => void;
  onLongPress: () => void;
}

const Cell: React.FC<CellProps> = ({ cell, onPress, onLongPress }) => {
  const {
    pulseCell,
    rotateFlag,
    shakeMine,
    expandCell,
    getScaleTransform,
    getRotateTransform,
    getShakeTransform,
    getExpandTransform,
  } = useGameAnimations();

  useEffect(() => {
    if (cell.isRevealed) {
      expandCell();
      if (cell.isMine) {
        shakeMine();
      }
    }
  }, [cell.isRevealed]);

  const getCellContent = () => {
    if (cell.isFlagged) {
      return (
        <Animated.View style={[styles.cellContent, getRotateTransform()]}>
          <MaterialCommunityIcons 
            name="flag" 
            size={CELL_SIZE * 0.6} 
            color={COLORS.secondary} 
          />
        </Animated.View>
      );
    }
    
    if (!cell.isRevealed) {
      return null;
    }

    if (cell.isMine) {
      return (
        <Animated.View style={[styles.cellContent, getShakeTransform()]}>
          <MaterialCommunityIcons 
            name="mine" 
            size={CELL_SIZE * 0.6} 
            color={COLORS.mine} 
          />
        </Animated.View>
      );
    }

    if (cell.neighborMines > 0) {
      return (
        <Animated.Text 
          style={[
            styles.number,
            { color: COLORS.numbers[cell.neighborMines as 1|2|3|4|5|6|7|8] },
            getScaleTransform(),
          ]}
        >
          {cell.neighborMines}
        </Animated.Text>
      );
    }

    return null;
  };

  const handlePress = () => {
    if (!cell.isRevealed && !cell.isFlagged) {
      pulseCell();
    }
    onPress();
  };

  const handleLongPress = () => {
    if (!cell.isRevealed) {
      rotateFlag();
    }
    onLongPress();
  };

  return (
    <Animated.View style={[
      styles.cellContainer,
      cell.isRevealed && getExpandTransform(),
    ]}>
      <TouchableOpacity
        style={[
          styles.cell,
          cell.isRevealed ? styles.revealed : styles.hidden,
          cell.isMine && cell.isRevealed && styles.mine,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={200}
        pressRetentionOffset={{ top: 5, left: 5, bottom: 5, right: 5 }}
      >
        {!cell.isRevealed && (
          <View style={styles.highlight} />
        )}
        {getCellContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 1,
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      },
    }),
  },
  hidden: {
    backgroundColor: COLORS.hidden,
    borderWidth: 1,
    borderColor: `${COLORS.text}20`,
  },
  revealed: {
    backgroundColor: COLORS.revealed,
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowColor: 'transparent',
      },
      web: {
        boxShadow: 'none',
      },
    }),
  },
  mine: {
    backgroundColor: `${COLORS.mine}20`,
  },
  cellContent: {
    position: 'absolute',
  },
  number: {
    fontSize: CELL_SIZE * 0.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});

export default Cell; 