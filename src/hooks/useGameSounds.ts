import { useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface SoundConfig {
  file: any;
  volume: number;
  duration?: number; // duración en milisegundos
}

const SOUND_CONFIGS: Record<string, SoundConfig> = {
  reveal: {
    file: Platform.select({
      web: null,
      default: require('../../assets/sounds/click.mp3')
    }),
    volume: 0.1,
    duration: 100
  },
  flag: {
    file: Platform.select({
      web: null,
      default: require('../../assets/sounds/click.mp3')
    }),
    volume: 0.1,
    duration: 150
  },
  win: {
    file: Platform.select({
      web: null,
      default: require('../../assets/sounds/victory.mp3')
    }),
    volume: 1.0,
    duration: 3000
  },
  lose: {
    file: Platform.select({
      web: null,
      default: require('../../assets/sounds/achievement.mp3')
    }),
    volume: 0.8,
    duration: 2000
  },
  levelup: {
    file: Platform.select({
      web: null,
      default: require('../../assets/sounds/levelup.mp3')
    }),
    volume: 0.7,
    duration: 1500
  },
  click: {
    file: Platform.select({
      web: null,
      default: require('../../assets/sounds/click.mp3')
    }),
    volume: 0.2,
    duration: 50
  }
};

export const useGameSounds = () => {
  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const activeSounds = useRef<Audio.Sound[]>([]);
  const isAudioEnabled = useRef<boolean>(false);
  const isAudioInitialized = useRef<boolean>(false);

  const initAudio = useCallback(async () => {
    if (isAudioInitialized.current) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: 1,
        interruptionModeIOS: 1,
      });
      isAudioEnabled.current = true;
      isAudioInitialized.current = true;
      
      // Iniciar música de fondo después de la inicialización
      startBackgroundMusic();
    } catch (error) {
      console.error('Error initializing audio:', error);
      isAudioEnabled.current = false;
      isAudioInitialized.current = false;
    }
  }, []);

  const loadSound = useCallback(async (name: string) => {
    if (!isAudioEnabled.current || Platform.OS === 'web') return null;
    
    try {
      const config = SOUND_CONFIGS[name];
      if (!config || !config.file) return null;

      const sound = new Audio.Sound();
      await sound.loadAsync(config.file, { volume: config.volume });
      return sound;
    } catch (error) {
      console.error(`Error loading sound ${name}:`, error);
      return null;
    }
  }, []);

  const cleanupSound = useCallback(async (sound: Audio.Sound) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        activeSounds.current = activeSounds.current.filter(s => s !== sound);
      }
    } catch (error) {
      console.error('Error cleaning up sound:', error);
    }
  }, []);

  const playSound = useCallback(async (name: string) => {
    if (!isAudioEnabled.current || Platform.OS === 'web') return;

    try {
      const sound = await loadSound(name);
      if (!sound) return;

      activeSounds.current.push(sound);
      await sound.playAsync();

      const config = SOUND_CONFIGS[name];
      if (config.duration) {
        setTimeout(async () => {
          try {
            await sound.stopAsync();
            await cleanupSound(sound);
          } catch (error) {
            console.error('Error stopping sound:', error);
          }
        }, config.duration);
      } else {
        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            await cleanupSound(sound);
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [loadSound, cleanupSound]);

  const startBackgroundMusic = useCallback(async () => {
    if (!isAudioEnabled.current || Platform.OS === 'web' || !isAudioInitialized.current) return;

    try {
      if (backgroundMusic.current) {
        const status = await backgroundMusic.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) return; // Ya está reproduciendo
        
        await backgroundMusic.current.stopAsync();
        await backgroundMusic.current.unloadAsync();
      }

      const sound = new Audio.Sound();
      await sound.loadAsync(require('../../assets/sounds/background.mp3'), {
        isLooping: true,
        shouldPlay: true,
        volume: 0.5,
        progressUpdateIntervalMillis: 1000,
        positionMillis: 0,
        shouldCorrectPitch: true,
        pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
      });

      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          try {
            await sound.replayAsync();
          } catch (error) {
            console.error('Error replaying background music:', error);
          }
        }
      });

      await sound.playAsync();
      backgroundMusic.current = sound;
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }, []);

  const stopBackgroundMusic = useCallback(async () => {
    try {
      if (backgroundMusic.current) {
        await backgroundMusic.current.stopAsync();
        await backgroundMusic.current.unloadAsync();
        backgroundMusic.current = null;
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      await initAudio();
    };
    
    setupAudio();
    
    return () => {
      stopBackgroundMusic();
      activeSounds.current.forEach(sound => {
        try {
          sound.stopAsync();
          sound.unloadAsync();
        } catch (error) {
          console.error('Error cleaning up sound:', error);
        }
      });
      activeSounds.current = [];
      isAudioInitialized.current = false;
    };
  }, []);

  return {
    playSound,
    startBackgroundMusic,
    stopBackgroundMusic,
  };
}; 