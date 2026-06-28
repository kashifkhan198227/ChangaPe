import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';
import { PLAYER_COLORS, PLAYER_NAMES } from '../engine/BoardLayout';
import { GameState } from '../engine/GameEngine';
import AdBanner from '../components/AdBanner';

interface VictoryScreenProps {
  gameState: GameState;
  winnerIndex: number;
  onPlayAgain: () => void;
  onNewGame: () => void;
  onHome: () => void;
  onShop: () => void;
}

export default function VictoryScreen({
  gameState,
  winnerIndex,
  onPlayAgain,
  onNewGame,
  onHome,
  onShop,
}: VictoryScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(confettiAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  const winner = gameState.players[winnerIndex];
  const winnerColor = PLAYER_COLORS[winnerIndex];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        {/* Crown */}
        <Text style={styles.crown}>👑</Text>

        <View style={[styles.colorBanner, { backgroundColor: winnerColor + '33', borderColor: winnerColor }]}>
          <Text style={[styles.winnerLabel, { color: winnerColor }]}>
            {PLAYER_NAMES[winnerIndex]} WINS!
          </Text>
          {winner.isAI && (
            <Text style={styles.aiNote}>({winner.aiLevel} AI)</Text>
          )}
        </View>

        <Text style={styles.congratsText}>CHANGA PE!</Text>
        <Text style={styles.congratsSub}>Excellent Play!</Text>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {gameState.players.map(player => (
            <View key={player.index} style={styles.statRow}>
              <View style={[styles.dotSmall, { backgroundColor: PLAYER_COLORS[player.index] }]} />
              <Text style={styles.statName}>{PLAYER_NAMES[player.index]}</Text>
              <Text style={styles.statCaptures}>⚔ {player.captureCount}</Text>
              <Text style={styles.statFinished}>
                ✓ {player.pawns.filter(p => p.state === 'finished' || p.state === 'center').length}/4
              </Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onPlayAgain}>
            <Text style={styles.primaryBtnText}>PLAY AGAIN</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onNewGame}>
              <Text style={styles.secondaryBtnText}>New Setup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onHome}>
              <Text style={styles.secondaryBtnText}>🏠 Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      <AdBanner onShop={onShop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.lg,
  },
  crown: {
    fontSize: 56,
  },
  colorBanner: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    padding: SPACING.md,
    alignItems: 'center',
  },
  winnerLabel: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  aiNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  congratsText: {
    color: COLORS.gold,
    fontSize: 22,
    letterSpacing: 3,
  },
  congratsSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  statsGrid: {
    width: '100%',
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  statCaptures: {
    color: COLORS.warning,
    fontSize: 12,
    width: 40,
  },
  statFinished: {
    color: COLORS.success,
    fontSize: 12,
    width: 35,
  },
  buttons: {
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  primaryBtnText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
