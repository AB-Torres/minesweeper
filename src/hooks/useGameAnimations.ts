import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

export const useGameAnimations = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const victoryAnim = useRef(new Animated.Value(0)).current;

  const createPulseAnimation = useCallback(() => {
    return Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
    ]);
  }, [scaleAnim]);

  const createRotateAnimation = useCallback(() => {
    return Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.bounce,
    });
  }, [rotateAnim]);

  const createShakeAnimation = useCallback(() => {
    return Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
    ]);
  }, [shakeAnim]);

  const createExpandAnimation = useCallback(() => {
    expandAnim.setValue(0);
    return Animated.timing(expandAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    });
  }, [expandAnim]);

  const createVictoryAnimation = useCallback(() => {
    victoryAnim.setValue(0);
    return Animated.loop(
      Animated.sequence([
        Animated.timing(victoryAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
        Animated.timing(victoryAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
      ])
    );
  }, [victoryAnim]);

  const pulseCell = useCallback(() => {
    scaleAnim.setValue(1);
    createPulseAnimation().start();
  }, [createPulseAnimation]);

  const rotateFlag = useCallback(() => {
    rotateAnim.setValue(0);
    createRotateAnimation().start();
  }, [createRotateAnimation]);

  const shakeMine = useCallback(() => {
    shakeAnim.setValue(0);
    createShakeAnimation().start();
  }, [createShakeAnimation]);

  const expandCell = useCallback(() => {
    createExpandAnimation().start();
  }, [createExpandAnimation]);

  const startVictoryAnimation = useCallback(() => {
    createVictoryAnimation().start();
  }, [createVictoryAnimation]);

  const stopVictoryAnimation = useCallback(() => {
    victoryAnim.stopAnimation();
    victoryAnim.setValue(0);
  }, [victoryAnim]);

  const getScaleTransform = useCallback(() => {
    return {
      transform: [{ scale: scaleAnim }],
    };
  }, [scaleAnim]);

  const getRotateTransform = useCallback(() => {
    return {
      transform: [
        {
          rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    };
  }, [rotateAnim]);

  const getShakeTransform = useCallback(() => {
    return {
      transform: [{ translateX: shakeAnim }],
    };
  }, [shakeAnim]);

  const getExpandTransform = useCallback(() => {
    return {
      transform: [
        { scale: expandAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        })},
        { 
          rotate: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['45deg', '0deg'],
          }),
        },
      ],
      opacity: expandAnim,
    };
  }, [expandAnim]);

  const getVictoryStyle = useCallback(() => {
    return {
      transform: [
        { scale: victoryAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.2, 1],
        })},
      ],
      opacity: victoryAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.7, 1],
      }),
    };
  }, [victoryAnim]);

  return {
    pulseCell,
    rotateFlag,
    shakeMine,
    expandCell,
    startVictoryAnimation,
    stopVictoryAnimation,
    getScaleTransform,
    getRotateTransform,
    getShakeTransform,
    getExpandTransform,
    getVictoryStyle,
  };
}; 