import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { useSettingsStore } from '../store/settingsStore';
import {
  loadGameHistory,
  clearGameHistory,
  GameHistoryEntry,
} from '../utils/storage';
import { PLAYER_COLORS } from '../engine/BoardLayout';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const PLAYER_WIN_COUNTS = ['Red', 'Blue', 'Green', 'Yellow'];

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { stats, resetStats } = useSettingsStore();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);

  useEffect(() => {
    loadGameHistory().then(setHistory);
  }, []);

  const winRate = stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;

  // Count wins per color from history
  const colorWins: Record<string, number> = {};
  PLAYER_WIN_COUNTS.forEach(n => { colorWins[n] = 0; });
  history.forEach(g => {
    if (colorWins[g.winnerName] !== undefined) colorWins[g.winnerName]++;
  });

  const sortedColors = [...PLAYER_WIN_COUNTS].sort(
    (a, b) => colorWins[b] - colorWins[a]
  );

  const handleClear = () => {
    Alert.alert('Clear History', 'Delete all game records?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearGameHistory();
          await resetStats();
          setHistory([]);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>LEADERBOARD</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Personal stats bar */}
        <View style={styles.statsRow}>
          <StatChip label="Games" value={stats.totalGames} />
          <StatChip label="Win %" value={`${winRate}%`} highlight />
          <StatChip label="Captures" value={stats.totalCaptures} />
        </View>

        {/* Color leaderboard */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COLOR STANDINGS</Text>
            {sortedColors.map((name, rank) => {
              const playerIdx = PLAYER_WIN_COUNTS.indexOf(name);
              const wins = colorWins[name];
              const total = history.length;
              const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
              return (
                <View key={name} style={styles.standingRow}>
                  <Text style={[styles.rank, rank === 0 && styles.rankTop]}>
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                  </Text>
                  <View style={[styles.colorDot, { backgroundColor: PLAYER_COLORS[playerIdx] }]} />
                  <Text style={styles.standingName}>{name}</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { width: `${pct}%`, backgroundColor: PLAYER_COLORS[playerIdx] }]} />
                  </View>
                  <Text style={styles.standingWins}>{wins}W</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Game history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT GAMES</Text>
          {history.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyText}>No games yet.</Text>
              <Text style={styles.emptySubText}>Play a game to see your history here!</Text>
            </View>
          ) : (
            history.slice(0, 20).map(entry => (
              <HistoryRow key={entry.id} entry={entry} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatChip({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <View style={[styles.chip, highlight && styles.chipHighlight]}>
      <Text style={[styles.chipValue, highlight && styles.chipValueHighlight]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function HistoryRow({ entry }: { entry: GameHistoryEntry }) {
  const playerIdx = ['Red', 'Blue', 'Green', 'Yellow'].indexOf(entry.winnerName);
  const color = playerIdx >= 0 ? PLAYER_COLORS[playerIdx] : '#888';
  const date = new Date(entry.date).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
  });
  return (
    <View style={styles.historyRow}>
      <View style={[styles.winnerBadge, { backgroundColor: color + '33', borderColor: color }]}>
        <Text style={[styles.winnerText, { color }]}>
          {entry.winnerName}{entry.winnerIsAI ? ' AI' : ''}
        </Text>
      </View>
      <Text style={styles.historyDate}>{date}</Text>
      <Text style={styles.historyPlayers}>{entry.numPlayers}P</Text>
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
  clearText: { color: COLORS.error, fontSize: 13 },
  content: { padding: SPACING.lg, gap: SPACING.lg },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
  },
  chipHighlight: {
    borderColor: COLORS.gold,
  },
  chipValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  chipValueHighlight: {
    color: COLORS.gold,
  },
  chipLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },

  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
  },
  rank: {
    color: COLORS.textMuted,
    fontSize: 14,
    width: 28,
  },
  rankTop: {
    color: COLORS.gold,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  standingName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    width: 52,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    borderRadius: 3,
    minWidth: 2,
  },
  standingWins: {
    color: COLORS.textMuted,
    fontSize: 12,
    width: 28,
    textAlign: 'right',
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
  },
  winnerBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
  },
  winnerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    width: 55,
    textAlign: 'right',
  },
  historyPlayers: {
    color: COLORS.textMuted,
    fontSize: 11,
    width: 22,
    textAlign: 'right',
  },

  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
  emptySubText: { color: COLORS.textMuted, fontSize: 12 },
});
