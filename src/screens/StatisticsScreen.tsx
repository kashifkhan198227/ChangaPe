import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { useSettingsStore } from '../store/settingsStore';

interface StatisticsScreenProps {
  onBack: () => void;
}

export default function StatisticsScreen({ onBack }: StatisticsScreenProps) {
  const { stats, resetStats } = useSettingsStore();

  const winRate = stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;
  const aiWinRate = stats.gamesVsAI > 0
    ? Math.round((stats.winsVsAI / stats.gamesVsAI) * 100)
    : 0;

  const handleReset = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to clear all statistics?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetStats },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>STATISTICS</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Win rate circle */}
        <View style={styles.winRateCard}>
          <View style={styles.bigCircle}>
            <Text style={styles.bigPercent}>{winRate}%</Text>
            <Text style={styles.bigLabel}>Win Rate</Text>
          </View>
          <View style={styles.winDetails}>
            <StatItem label="Total Games" value={stats.totalGames} />
            <StatItem label="Wins" value={stats.wins} color={COLORS.success} />
            <StatItem label="Losses" value={stats.losses} color={COLORS.error} />
          </View>
        </View>

        {/* Detailed stats */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Captures" value={stats.totalCaptures} icon="⚔" />
          <StatCard title="vs AI Games" value={stats.gamesVsAI} icon="🤖" />
          <StatCard title="vs AI Wins" value={stats.winsVsAI} icon="🏆" />
          <StatCard title="AI Win Rate" value={`${aiWinRate}%`} icon="📊" />
        </View>

        {stats.lastPlayed && (
          <View style={styles.lastPlayed}>
            <Text style={styles.lastPlayedLabel}>Last Played</Text>
            <Text style={styles.lastPlayedDate}>
              {new Date(stats.lastPlayed).toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}

        {stats.totalGames === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No games played yet.</Text>
            <Text style={styles.emptySubText}>Start a game to see your statistics here!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statItemLabel}>{label}</Text>
      <Text style={[styles.statItemValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statCardIcon}>{icon}</Text>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceElevated,
  },
  backBtn: { padding: SPACING.xs },
  backText: { color: COLORS.gold, fontSize: 14 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  resetText: { color: COLORS.error, fontSize: 13 },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  winRateCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
  },
  bigCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
  },
  bigPercent: { color: COLORS.gold, fontSize: 24, fontWeight: 'bold' },
  bigLabel: { color: COLORS.textMuted, fontSize: 10, letterSpacing: 1 },
  winDetails: { flex: 1, gap: SPACING.sm },
  statItem: { flexDirection: 'row', justifyContent: 'space-between' },
  statItemLabel: { color: COLORS.textSecondary, fontSize: 13 },
  statItemValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
  },
  statCardIcon: { fontSize: 22 },
  statCardValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold' },
  statCardTitle: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },
  lastPlayed: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastPlayedLabel: { color: COLORS.textMuted, fontSize: 12 },
  lastPlayedDate: { color: COLORS.textSecondary, fontSize: 13 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
  emptySubText: { color: COLORS.textMuted, fontSize: 13 },
});
