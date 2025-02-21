import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Modal, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Difficulty } from '../types';
import { COLORS } from '../constants/game';
import { useGameLogic } from '../hooks/useGameLogic';
import { usePlayer } from '../context/PlayerContext';
import { useGameSounds } from '../hooks/useGameSounds';
import Board from '../components/Board';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TutorialStep {
  title: string;
  description: string;
  position: { x: number; y: number };
}

const tutorialSteps: TutorialStep[] = [
  {
    title: '¡Bienvenido a Buscaminas!',
    description: 'Toca una celda para revelarla. El número indica cuántas minas hay alrededor.',
    position: { x: 0, y: 0 }
  },
  {
    title: 'Marcando Minas',
    description: 'Mantén presionada una celda para marcarla con una bandera si crees que hay una mina.',
    position: { x: 0, y: 0 }
  },
  {
    title: 'Contador de Banderas',
    description: 'Este número muestra cuántas banderas te quedan para marcar minas.',
    position: { x: 0, y: 0 }
  },
  {
    title: 'Tiempo',
    description: 'El cronómetro comenzará cuando reveles la primera celda.',
    position: { x: 0, y: 0 }
  }
];

const GameScreen = () => {
  const { difficulty } = useLocalSearchParams<{ difficulty: Difficulty }>();
  const { gameState, handleCellPress, handleCellLongPress, resetGame } = useGameLogic(difficulty);
  const { updateStats } = usePlayer();
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePress = async (row: number, col: number) => {
    if (Platform.OS === 'android') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Ignorar errores de háptica
      }
    }
    playSound('reveal');
    handleCellPress(row, col);
  };

  const handleLongPress = async (row: number, col: number) => {
    if (Platform.OS === 'android') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Ignorar errores de háptica
      }
    }
    playSound('flag');
    handleCellLongPress(row, col);
  };

  useEffect(() => {
    // Iniciar música de fondo cuando el componente se monta
    startBackgroundMusic();
    
    // Verificar si es la primera vez que se juega
    const checkFirstTime = async () => {
      try {
        const hasPlayedBefore = await AsyncStorage.getItem('hasPlayedBefore');
        if (!hasPlayedBefore) {
          setShowTutorial(true);
          await AsyncStorage.setItem('hasPlayedBefore', 'true');
        }
      } catch (error) {
        console.error('Error checking first time:', error);
      }
    };

    checkFirstTime();

    return () => {
      stopBackgroundMusic();
    };
  }, []);

  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      updateStats(difficulty, gameState.gameStatus === 'won', gameState.timeElapsed);
      if (Platform.OS === 'android') {
        try {
          Haptics.notificationAsync(
            gameState.gameStatus === 'won'
              ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Error
          );
        } catch (error) {
          // Ignorar errores de háptica
        }
      }
      // Detener música de fondo y reproducir sonido de victoria/derrota
      stopBackgroundMusic();
      playSound(gameState.gameStatus === 'won' ? 'win' : 'lose');
    }
  }, [gameState.gameStatus]);

  const handleReset = () => {
    playSound('click');
    resetGame();
    // Reiniciar música de fondo
    startBackgroundMusic();
  };

  const handleBack = () => {
    playSound('click');
    router.back();
  };

  const handleNextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const getVictoryStyle = () => {
    return {
      transform: [
        { scale: gameState.gameStatus === 'won' ? 1.2 : 1 },
        { translateY: gameState.gameStatus === 'won' ? -20 : 0 },
      ],
    };
  };

  const getExpandTransform = () => {
    return {
      transform: [
        { scale: tutorialStep === tutorialSteps.length - 1 ? 1.2 : 1 },
        { translateY: tutorialStep === tutorialSteps.length - 1 ? -20 : 0 },
      ],
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
      />
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleBack}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="flag" size={24} color={COLORS.secondary} />
              <Text style={styles.statText}>{gameState.flagsRemaining}</Text>
            </View>
            
            <View style={styles.stat}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.text} />
              <Text style={styles.statText}>{formatTime(gameState.timeElapsed)}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleReset}
          >
            <MaterialCommunityIcons 
              name={gameState.gameStatus === 'won' ? 'emoticon-happy' : 
                   gameState.gameStatus === 'lost' ? 'emoticon-dead' : 
                   'emoticon-neutral'} 
              size={24} 
              color={COLORS.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.boardContainer}>
          <Board
            gameState={gameState}
            onCellPress={handlePress}
            onCellLongPress={handleLongPress}
          />
        </View>

        {(gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && (
          <View style={styles.gameOverContainer}>
            <Animated.View style={[styles.gameOverContent, getVictoryStyle()]}>
              <MaterialCommunityIcons 
                name={gameState.gameStatus === 'won' ? 'trophy' : 'emoticon-dead'} 
                size={64} 
                color={gameState.gameStatus === 'won' ? COLORS.secondary : COLORS.mine} 
              />
              <Text style={[
                styles.gameOverText,
                { color: gameState.gameStatus === 'won' ? COLORS.secondary : COLORS.mine }
              ]}>
                {gameState.gameStatus === 'won' ? '¡Ganaste!' : '¡Perdiste!'}
              </Text>
              <Text style={styles.timeText}>
                Tiempo: {formatTime(gameState.timeElapsed)}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: COLORS.primary }]}
                  onPress={handleReset}
                >
                  <MaterialCommunityIcons name="refresh" size={24} color={COLORS.background} />
                  <Text style={styles.buttonText}>Jugar de nuevo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: COLORS.secondary }]}
                  onPress={handleBack}
                >
                  <MaterialCommunityIcons name="home" size={24} color={COLORS.background} />
                  <Text style={styles.buttonText}>Volver al menú</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}

        <Modal
          visible={showTutorial}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTutorial(false)}
        >
          <View style={styles.tutorialOverlay}>
            <Animated.View style={[styles.tutorialCard, getExpandTransform()]}>
              <MaterialCommunityIcons 
                name="lightbulb-on" 
                size={40} 
                color={COLORS.primary} 
                style={styles.tutorialIcon}
              />
              <Text style={styles.tutorialTitle}>{tutorialSteps[tutorialStep].title}</Text>
              <Text style={styles.tutorialDescription}>{tutorialSteps[tutorialStep].description}</Text>
              <TouchableOpacity 
                style={styles.tutorialButton}
                onPress={handleNextTutorialStep}
              >
                <Text style={styles.tutorialButtonText}>
                  {tutorialStep === tutorialSteps.length - 1 ? '¡Empezar a jugar!' : 'Siguiente'}
                </Text>
                <MaterialCommunityIcons 
                  name={tutorialStep === tutorialSteps.length - 1 ? 'play' : 'arrow-right'} 
                  size={20} 
                  color={COLORS.background} 
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.text}10`,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  iconButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    ...Platform.select({
      android: {
        elevation: 2,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 12,
    ...Platform.select({
      android: {
        elevation: 2,
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
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gameOverContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      },
    }),
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  timeText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  tutorialIcon: {
    marginBottom: 15,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  tutorialDescription: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  tutorialButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameScreen; 