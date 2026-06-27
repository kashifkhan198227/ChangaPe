import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Pawn } from '../engine/GameEngine';

interface PawnTokenProps {
  pawn: Pawn;
  color: string;
  isSelected: boolean;
  onPress: () => void;
  size: number;
  offset: { x: number; y: number };
}

export default function PawnToken({ pawn, color, isSelected, onPress, size, offset }: PawnTokenProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
      glowAnim.stopAnimation();
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
      Animated.timing(glowAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    }
  }, [isSelected]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.3)', '#FFD700'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ translateX: offset.x }, { translateY: offset.y }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pawn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            borderWidth: isSelected ? 2.5 : 1.5,
            borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Inner highlight */}
        <View
          style={[
            styles.highlight,
            { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  highlight: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    position: 'absolute',
    top: '15%',
    left: '15%',
  },
});
