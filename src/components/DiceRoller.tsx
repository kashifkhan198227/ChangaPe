import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { DiceValue } from '../engine/BoardLayout';

interface DiceRollerProps {
  diceValue: DiceValue | null;
  canRoll: boolean;
  onRoll: () => void;
  extraTurn: boolean;
}

const SEED_PATTERNS: Record<number, boolean[]> = {
  1: [true,  false, false, false],
  2: [true,  true,  false, false],
  3: [true,  true,  true,  false],
  4: [false, false, false, false],
  8: [true,  true,  true,  true],
};

const DICE_NAMES: Record<number, string> = {
  1: 'Pe', 2: 'Do', 3: 'Teen', 4: 'Changa + Pe', 8: 'Ashta + Pe',
};

function ImliSeed({ white }: { white: boolean }) {
  return (
    <View style={[styles.seed, white ? styles.seedWhite : styles.seedBlack]}>
      {white && <View style={styles.seedInnerLine} />}
    </View>
  );
}

export default function DiceRoller({ diceValue, canRoll, onRoll, extraTurn }: DiceRollerProps) {
  const throwAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (diceValue !== null) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.12, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [diceValue]);

  const handleRoll = () => {
    if (!canRoll) return;
    // Shake left-right 3 times, then throw arc
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 40, useNativeDriver: true }),
      // Then throw upward
      Animated.timing(throwAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(throwAnim, { toValue: 0, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start();
    setTimeout(onRoll, 260); // fire after shake completes
  };

  const handY = throwAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const handRotate = throwAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-20deg', '0deg'] });
  const handX = shakeAnim;

  const pattern  = diceValue !== null ? SEED_PATTERNS[diceValue] : null;
  const diceName = diceValue !== null ? DICE_NAMES[diceValue] : null;
  const isSpecial = diceValue === 4 || diceValue === 8;

  return (
    <View style={styles.row}>
      {/* Seed result — compact strip */}
      <View style={[styles.resultStrip, isSpecial && styles.resultStripSpecial]}>
        <View style={styles.seedRow}>
          {(pattern ?? [false, false, false, false]).map((white, i) => (
            <ImliSeed key={i} white={white} />
          ))}
        </View>
        {diceName ? (
          <Text style={[styles.diceName, isSpecial && styles.diceNameSpecial]}>{diceName}</Text>
        ) : (
          <Text style={styles.placeholderText}>—</Text>
        )}
      </View>

      {/* Throw button */}
      <View style={styles.throwCol}>
        {extraTurn && (
          <View style={styles.extraBadge}>
            <Text style={styles.extraText}>+1</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleRoll} disabled={!canRoll} activeOpacity={0.75}>
          <Animated.View
            style={[
              styles.throwBtn,
              !canRoll && styles.throwBtnDisabled,
              { transform: [{ translateX: handX }, { translateY: handY }, { rotate: handRotate }, { scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.handIcon}>🤚</Text>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.tapLabel}>{canRoll ? 'THROW' : ''}</Text>
      </View>
    </View>
  );
}

const SEED_W = 18;
const SEED_H = 26;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  resultStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#1E1E2E',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: '#444',
    flex: 1,
  },
  resultStripSpecial: {
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  seedRow: {
    flexDirection: 'row',
    gap: 4,
  },
  seed: {
    width: SEED_W,
    height: SEED_H,
    borderRadius: SEED_W / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  seedBlack: {
    backgroundColor: '#1A1008',
    borderWidth: 1,
    borderColor: '#3D2800',
  },
  seedWhite: {
    backgroundColor: '#F5F0E8',
    borderWidth: 1,
    borderColor: '#C8B89A',
  },
  seedInnerLine: {
    width: 1.5,
    height: SEED_H * 0.5,
    backgroundColor: '#C8B89A',
    borderRadius: 1,
    opacity: 0.7,
  },
  diceName: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  diceNameSpecial: {
    color: COLORS.gold,
  },
  placeholderText: {
    color: '#555',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  throwCol: {
    alignItems: 'center',
    gap: 2,
  },
  throwBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  throwBtnDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  handIcon: {
    fontSize: 28,
  },
  tapLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  extraBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginBottom: 2,
  },
  extraText: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
