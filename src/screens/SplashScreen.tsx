import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }).start(onFinish);
      }, 1500);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      {/* Decorative border */}
      <View style={styles.decorBorderOuter}>
        <View style={styles.decorBorderInner}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Game logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.urduAccent}>چنگا پے</Text>
              <Text style={styles.title}>CHANGA PE</Text>
              <View style={styles.divider} />
              <Text style={styles.subtitle}>Traditional South Asian Board Game</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.decorRow, { opacity: fadeAnim }]}>
            {['🔴', '🔵', '🟢', '🟡'].map((dot, i) => (
              <Text key={i} style={styles.playerDot}>{dot}</Text>
            ))}
          </Animated.View>
        </View>
      </View>

      <Animated.Text style={[styles.loading, { opacity: fadeAnim }]}>
        Loading...
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorBorderOuter: {
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 16,
    padding: 4,
  },
  decorBorderInner: {
    borderWidth: 1,
    borderColor: COLORS.copper,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    gap: 24,
    backgroundColor: COLORS.surface,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  urduAccent: {
    color: COLORS.gold,
    fontSize: 28,
    letterSpacing: 2,
    fontWeight: '300',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 6,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  divider: {
    width: 100,
    height: 1.5,
    backgroundColor: COLORS.gold,
    marginVertical: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  decorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playerDot: {
    fontSize: 20,
  },
  loading: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 48,
    textTransform: 'uppercase',
  },
});
