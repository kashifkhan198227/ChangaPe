import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';
import { PLAYER_COLORS, PLAYER_NAMES } from '../engine/BoardLayout';
import { GameRules, DEFAULT_RULES } from '../engine/GameEngine';
import { SetupPlayer } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { usePurchaseStore } from '../store/purchaseStore';

type PlayerType = 'human' | 'easy' | 'medium' | 'hard' | 'none';

interface GameSetupScreenProps {
  onStart: (numPlayers: 2 | 3 | 4, players: SetupPlayer[], rules: GameRules) => void;
  onBack: () => void;
  onShop: () => void;
}

const PLAYER_TYPE_LABELS: Record<PlayerType, string> = {
  human: '👤 Human',
  easy: '🤖 Easy AI',
  medium: '🤖 Medium AI',
  hard: '🤖 Hard AI',
  none: '✗ Disabled',
};

const PLAYER_TYPES: PlayerType[] = ['human', 'easy', 'medium', 'hard', 'none'];
const PRO_TYPES: PlayerType[] = ['medium', 'hard'];

// Slot position → board player index (determines color & facing)
// 2-player: Red(bottom) vs Green(top) so they face each other across the board
const SETUP_ORDER: Record<2 | 3 | 4, number[]> = {
  2: [0, 2],
  3: [0, 3, 2],
  4: [0, 3, 2, 1],
};

export default function GameSetupScreen({ onStart, onBack, onShop }: GameSetupScreenProps) {
  const { settings } = useSettingsStore();
  const { has } = usePurchaseStore();
  const hasAIPro = has('ai_pro');

  const [numPlayers, setNumPlayers] = useState<2 | 3 | 4>(2);
  const [playerTypes, setPlayerTypes] = useState<PlayerType[]>(['human', 'easy', 'none', 'none']);
  const [rules, setRules] = useState<GameRules>({ ...DEFAULT_RULES, ...settings.rules });

  const cyclePlayerType = (index: number) => {
    const current = playerTypes[index];
    // Build list of types the user can actually pick right now
    const available = PLAYER_TYPES.filter(t => {
      if (index >= numPlayers) return true; // inactive slot: all types valid
      if (t === 'none') return false;       // active slot: can't disable
      if (PRO_TYPES.includes(t)) return hasAIPro; // Pro types only if unlocked
      return true;
    });
    const currentIdx = available.indexOf(current);
    const nextIdx = (currentIdx + 1) % available.length;
    const updated = [...playerTypes];
    updated[index] = available[nextIdx];
    setPlayerTypes(updated);
  };

  const handleNumPlayersChange = (n: 2 | 3 | 4) => {
    setNumPlayers(n);
    const updated = [...playerTypes];
    for (let i = 0; i < 4; i++) {
      if (i >= n) updated[i] = 'none';
      else if (updated[i] === 'none') updated[i] = i === 0 ? 'human' : 'easy';
    }
    setPlayerTypes(updated);
  };

  const toggleRule = (key: keyof GameRules) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStart = () => {
    const order = SETUP_ORDER[numPlayers];
    const players: SetupPlayer[] = order.map((playerIdx, slot) => ({
      index: playerIdx,
      type: playerTypes[slot],
    }));
    onStart(numPlayers, players, rules);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GAME SETUP</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Number of Players */}
        <Section title="Number of Players">
          <View style={styles.pillRow}>
            {([2, 3, 4] as const).map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.pill, numPlayers === n && styles.pillActive]}
                onPress={() => handleNumPlayersChange(n)}
              >
                <Text style={[styles.pillText, numPlayers === n && styles.pillTextActive]}>
                  {n} Players
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Player configuration */}
        <Section title="Players">
          {SETUP_ORDER[numPlayers].map((playerIdx, slot) => (
            <View key={slot} style={styles.playerRow}>
              <View style={[styles.colorBadge, { backgroundColor: PLAYER_COLORS[playerIdx] }]} />
              <Text style={styles.playerName}>{PLAYER_NAMES[playerIdx]}</Text>
              <TouchableOpacity
                style={[styles.typeButton, PRO_TYPES.includes(playerTypes[slot]) && !hasAIPro && styles.typeButtonLocked]}
                onPress={() => cyclePlayerType(slot)}
              >
                {PRO_TYPES.includes(playerTypes[slot]) && !hasAIPro && (
                  <Text style={styles.lockIcon}>🔒</Text>
                )}
                <Text style={styles.typeText}>{PLAYER_TYPE_LABELS[playerTypes[slot]]}</Text>
              </TouchableOpacity>
            </View>
          ))}
          {!hasAIPro && (
            <TouchableOpacity onPress={onShop} style={styles.proHint}>
              <Text style={styles.proHintText}>🔒 Tap to unlock Medium & Hard AI</Text>
            </TouchableOpacity>
          )}
        </Section>

        {/* Rules */}
        <Section title="Rule Variations">
          <RuleToggle
            label="Extra turn on capture"
            value={rules.allowExtraTurnOnCapture}
            onToggle={() => toggleRule('allowExtraTurnOnCapture')}
          />
          <RuleToggle
            label="Extra turn on 4 or 8"
            value={rules.allowExtraTurnOn4or8}
            onToggle={() => toggleRule('allowExtraTurnOn4or8')}
          />
          <RuleToggle
            label="3× Changa/Ashta forfeits turn"
            value={rules.threeSpecialsForfeit}
            onToggle={() => toggleRule('threeSpecialsForfeit')}
          />
          <RuleToggle
            label="Exact roll to finish"
            value={rules.exactRollToFinish}
            onToggle={() => toggleRule('exactRollToFinish')}
          />
          <RuleToggle
            label="Inner path safe (circles only)"
            value={rules.innerPathSafe}
            onToggle={() => toggleRule('innerPathSafe')}
          />
        </Section>
      </ScrollView>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startText}>START GAME</Text>
      </TouchableOpacity>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function RuleToggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.ruleRow}>
      <Text style={styles.ruleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.textMuted, true: COLORS.primary }}
        thumbColor={value ? COLORS.gold : COLORS.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceElevated,
    gap: SPACING.md,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  backText: {
    color: COLORS.gold,
    fontSize: 14,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pill: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.gold,
  },
  pillText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.textDark,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
  },
  colorBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playerName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  typeButton: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeButtonLocked: {
    borderColor: COLORS.warning + '88',
  },
  lockIcon: { fontSize: 11 },
  proHint: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  proHintText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  typeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceElevated,
  },
  ruleLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  startButton: {
    margin: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.lg,
  },
  startText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
