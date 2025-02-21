import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Componente que representa una celda individual del tablero
 * @param {Object} props
 * @param {Object} props.cell - Datos de la celda
 * @param {Function} props.onPress - Función a ejecutar al presionar la celda
 */
const Cell = ({ cell, onPress }) => {
  const getCellContent = () => {
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborMines === 0) return '';
    return cell.neighborMines;
  };

  const getCellStyle = () => {
    if (!cell.isRevealed) return styles.cellHidden;
    if (cell.isMine) return styles.cellMine;
    return styles.cellRevealed;
  };

  return (
    <TouchableOpacity 
      style={[styles.cell, getCellStyle()]} 
      onPress={onPress}
    >
      <Text style={styles.cellText}>{getCellContent()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellHidden: {
    backgroundColor: '#ccc',
  },
  cellRevealed: {
    backgroundColor: '#fff',
  },
  cellMine: {
    backgroundColor: '#ff0000',
  },
  cellText: {
    fontSize: 16,
  },
});

export default Cell; 