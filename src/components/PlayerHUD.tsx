import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { Player } from '../engine/GameEngine';
import { PLAYER_COLORS, PLAYER_NAMES } from '../engine/BoardLayout';

interface PlayerHUDProps {
  players: Player[];
  currentPlayerIndex: number;
}

export default function PlayerHUD({ players, currentPlayerIndex }: PlayerHUDProps) {
  return (
    <View style={styles.container}>
      {players.map(player => {
        const isCurrent = player.index === currentPlayerIndex;
        const finishedCount = player.pawns.filter(p => p.state === 'finished').length;
        const homeCount = player.pawns.filter(p => p.state === 'home').length;
        const activeCount = player.pawns.filter(p => p.state === 'active').length;

        return (
          <View
            key={player.index}
            style={[
              styles.playerCard,
              isCurrent && styles.activeCard,
              { borderColor: PLAYER_COLORS[player.index] },
            ]}
          >
            <View style={[styles.colorDot, { backgroundColor: PLAYER_COLORS[player.index] }]} />
            <View style={styles.info}>
              <Text style={[styles.name, isCurrent && styles.activeName]}>
                {PLAYER_NAMES[player.index]}
                {player.isAI ? ` (${player.aiLevel})` : ''}
              </Text>
              <View style={styles.stats}>
                <Text style={styles.statText}>🏠{homeCount}</Text>
                <Text style={styles.statText}>▶{activeCount}</Text>
                <Text style={styles.statText}>✓{finishedCount}</Text>
                {player.captureCount > 0 && (
                  <Text style={styles.captureText}>⚔{player.captureCount}</Text>
                )}
              </View>
            </View>
            {isCurrent && <View style={styles.turnIndicator} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'center',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    padding: SPACING.xs,
    gap: SPACING.xs,
    minWidth: 80,
    opacity: 0.7,
  },
  activeCard: {
    opacity: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeName: {
    color: COLORS.textPrimary,
  },
  stats: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  statText: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  captureText: {
    color: COLORS.warning,
    fontSize: 9,
    fontWeight: 'bold',
  },
  turnIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
});
