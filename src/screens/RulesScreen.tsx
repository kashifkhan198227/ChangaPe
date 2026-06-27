import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';

interface RulesScreenProps {
  onBack: () => void;
}

const RULES = [
  {
    title: 'Board',
    icon: '🎯',
    rules: [
      '5×5 square board with 25 squares total.',
      'Four corner squares and the center are safe zones (highlighted in green/gold).',
      'Each player controls 4 pawns.',
    ],
  },
  {
    title: 'Starting',
    icon: '🎲',
    rules: [
      'Roll 1 to bring a pawn from home onto the board.',
      'Players start from their assigned corner and move counter-clockwise.',
      'Rolling 4 or 8 grants an extra roll.',
    ],
  },
  {
    title: 'Cowry Dice',
    icon: '🐚',
    rules: [
      'Four cowry shells are thrown each turn.',
      'Values: 1 (one open), 2 (two open), 3 (three open), 4 (four open), 8 (all closed).',
      'Higher values are rarer — 4 and 8 are special bonus rolls.',
    ],
  },
  {
    title: 'Movement',
    icon: '🔄',
    rules: [
      'Pawns move counter-clockwise along the outer ring.',
      'After completing the outer ring, pawns turn inward toward the center.',
      'An exact roll is needed to reach the center and finish.',
    ],
  },
  {
    title: 'Capturing',
    icon: '⚔',
    rules: [
      'Landing on an opponent\'s pawn captures it and sends it back home.',
      'Capturing grants an extra turn.',
      'Pawns on safe squares (corners, center) cannot be captured.',
    ],
  },
  {
    title: 'Special Rules',
    icon: '⚠',
    rules: [
      'Rolling 4 three times in a row forfeits your turn.',
      'Rolling 8 three times in a row forfeits your turn.',
      'Inner path is safe only on circle squares by default.',
      'Toggle "Inner path safe" OFF to allow captures everywhere on inner path.',
      'The player who gets all 4 pawns to the center wins.',
    ],
  },
];

export default function RulesScreen({ onBack }: RulesScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>RULES</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Changa Pe (چنگا پے) is a traditional South Asian board game. Players race their four
          pawns from home to the center of the board, capturing opponents along the way.
        </Text>

        {RULES.map((section, i) => (
          <View key={i} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.rules.map((rule, j) => (
              <View key={j} style={styles.ruleItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Strategy Tips</Text>
          <Text style={styles.tipText}>
            Keep pawns on safe squares when possible. Don't bunch all pawns together.
            Prioritize capturing when ahead. Use the extra turn wisely after a 4 or 8.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  intro: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  section: {
    gap: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  bullet: {
    color: COLORS.copper,
    fontSize: 14,
  },
  ruleText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  tipBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.saffron,
    gap: SPACING.sm,
  },
  tipTitle: {
    color: COLORS.saffron,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
