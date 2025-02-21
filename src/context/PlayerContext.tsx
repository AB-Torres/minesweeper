import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerData, Difficulty, PlayerStats } from '../types';
import { DEFAULT_NICKNAME_PREFIX } from '../constants/game';

interface PlayerContextType {
  playerData: PlayerData | null;
  setNickname: (nickname: string) => Promise<void>;
  updateStats: (difficulty: Difficulty, won: boolean, time?: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: null,
};

const defaultPlayerData: PlayerData = {
  nickname: '',
  stats: {
    easy: { ...defaultStats },
    medium: { ...defaultStats },
    hard: { ...defaultStats },
  },
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('playerData');
      if (savedData) {
        setPlayerData(JSON.parse(savedData));
      } else {
        // Generar nickname por defecto
        const randomNum = Math.floor(Math.random() * 1000);
        const defaultData = {
          ...defaultPlayerData,
          nickname: `${DEFAULT_NICKNAME_PREFIX}${randomNum}`,
        };
        await AsyncStorage.setItem('playerData', JSON.stringify(defaultData));
        setPlayerData(defaultData);
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    }
  };

  const setNickname = async (nickname: string) => {
    try {
      const newData = {
        ...playerData!,
        nickname,
      };
      await AsyncStorage.setItem('playerData', JSON.stringify(newData));
      setPlayerData(newData);
    } catch (error) {
      console.error('Error saving nickname:', error);
    }
  };

  const updateStats = async (difficulty: Difficulty, won: boolean, time?: number) => {
    if (!playerData) return;

    try {
      const newStats = {
        ...playerData.stats[difficulty],
        gamesPlayed: playerData.stats[difficulty].gamesPlayed + 1,
        gamesWon: playerData.stats[difficulty].gamesWon + (won ? 1 : 0),
      };

      if (won && time) {
        if (!newStats.bestTime || time < newStats.bestTime) {
          newStats.bestTime = time;
        }
      }

      const newData = {
        ...playerData,
        stats: {
          ...playerData.stats,
          [difficulty]: newStats,
        },
      };

      await AsyncStorage.setItem('playerData', JSON.stringify(newData));
      setPlayerData(newData);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  return (
    <PlayerContext.Provider value={{ playerData, setNickname, updateStats }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}; 