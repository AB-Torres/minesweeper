import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPLASH_SCREEN_DURATION } from '../constants/game';
import { router } from 'expo-router';

const SplashScreen: React.FC = () => {
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de carga
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: SPLASH_SCREEN_DURATION,
      useNativeDriver: true,
    }).start();

    // Navegar a la pantalla principal después de la duración del splash
    const timer = setTimeout(() => {
      router.replace('/home');
    }, SPLASH_SCREEN_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const mines = Array(5).fill(0); // 5 minas para la animación de carga
  const mineScale = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AB TORRES</Text>
      <Text style={styles.subtitle}>Coding</Text>
      
      <View style={styles.loadingContainer}>
        {mines.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.mine,
              {
                transform: [
                  {
                    scale: loadingProgress.interpolate({
                      inputRange: [0, 0.2 * index, 0.2 * (index + 1), 1],
                      outputRange: [0.3, 0.3, 1, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: COLORS.secondary,
    marginBottom: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  mine: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.mine,
    margin: 5,
  },
});

export default SplashScreen; 