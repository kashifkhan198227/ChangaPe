import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

interface HomeScreenProps {
  hasSavedGame: boolean;
  onNewGame: () => void;
  onResumeGame: () => void;
  onRules: () => void;
  onStatistics: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
  onAbout: () => void;
}

export default function HomeScreen({
  hasSavedGame,
  onNewGame,
  onResumeGame,
  onRules,
  onStatistics,
  onLeaderboard,
  onSettings,
  onAbout,
}: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.urduTitle}>چنگا پے</Text>
        <Text style={styles.title}>CHANGA PE</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>The Game of Kings & Strategy</Text>
      </View>

      {/* Decorative board mini-preview */}
      <View style={styles.boardPreview}>
        {[0, 1, 2, 3, 4].map(row => (
          <View key={row} style={styles.boardRow}>
            {[0, 1, 2, 3, 4].map(col => (
              <View
                key={col}
                style={[
                  styles.boardCell,
                  (row === 0 || row === 4 || col === 0 || col === 4) && styles.outerCell,
                  row === 2 && col === 2 && styles.centerCell,
                  (row === 0 && (col === 0 || col === 4)) && styles.cornerCell,
                  (row === 4 && (col === 0 || col === 4)) && styles.cornerCell,
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Menu buttons */}
      <View style={styles.menu}>
        <MenuButton label="▶  NEW GAME" onPress={onNewGame} primary />
        {hasSavedGame && (
          <MenuButton label="⟳  RESUME GAME" onPress={onResumeGame} />
        )}
        <MenuButton label="📖  RULES" onPress={onRules} />
        <MenuButton label="📊  STATISTICS" onPress={onStatistics} />
        <MenuButton label="🏆  LEADERBOARD" onPress={onLeaderboard} />
        <MenuButton label="⚙  SETTINGS" onPress={onSettings} />
        <MenuButton label="ℹ  ABOUT" onPress={onAbout} />
      </View>

      <Text style={styles.footer}>Offline · No Login Required</Text>
    </View>
  );
}

function MenuButton({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, primary && styles.primaryButton]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, primary && styles.primaryButtonText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  urduTitle: {
    color: COLORS.gold,
    fontSize: 22,
    letterSpacing: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  divider: {
    width: 80,
    height: 1,
    backgroundColor: COLORS.gold,
    marginVertical: 4,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  boardPreview: {
    gap: 2,
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  boardRow: {
    flexDirection: 'row',
    gap: 2,
  },
  boardCell: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.innerPath,
    borderRadius: 1,
  },
  outerCell: {
    backgroundColor: COLORS.outerSquare,
    borderWidth: 0.5,
    borderColor: COLORS.boardLines,
  },
  centerCell: {
    backgroundColor: COLORS.centerSquare,
  },
  cornerCell: {
    backgroundColor: COLORS.safeSquare,
  },
  menu: {
    width: '100%',
    gap: SPACING.sm,
    maxWidth: 300,
  },
  button: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.gold,
    borderWidth: 2,
    ...SHADOWS.md,
  },
  buttonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  primaryButtonText: {
    color: COLORS.gold,
    fontSize: 16,
  },
  footer: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
