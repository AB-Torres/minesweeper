import { Difficulty, GameConfig } from '../types';

export const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  easy: {
    rows: 9,
    cols: 9,
    mines: 10
  },
  medium: {
    rows: 16,
    cols: 16,
    mines: 40
  },
  hard: {
    rows: 24,
    cols: 24,
    mines: 99
  }
};

export const SPLASH_SCREEN_DURATION = 7000; // 7 segundos

export const CELL_SIZE = 30; // tamaño en pixels de cada celda

export const COLORS = {
  primary: '#2196F3',
  secondary: '#FFC107',
  background: '#FFFFFF',
  text: '#000000',
  mine: '#FF0000',
  revealed: '#E0E0E0',
  hidden: '#BDBDBD',
  numbers: {
    1: '#0000FF', // Azul
    2: '#008000', // Verde
    3: '#FF0000', // Rojo
    4: '#000080', // Azul marino
    5: '#800000', // Marrón
    6: '#008080', // Cyan
    7: '#000000', // Negro
    8: '#808080'  // Gris
  }
};

export const DEFAULT_NICKNAME_PREFIX = 'Jugador';
export const MAX_NICKNAME_LENGTH = 15; 