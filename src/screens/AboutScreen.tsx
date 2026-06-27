import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ABOUT</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎯</Text>
          </View>
          <Text style={styles.appName}>CHANGA PE</Text>
          <Text style={styles.urduName}>چنگا پے</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About the Game</Text>
          <Text style={styles.cardText}>
            Changa Pe is a traditional South Asian board game that has been played for
            centuries across Pakistan, India, and surrounding regions. It is similar to
            Pachisi and Chaupar, using cowry shells as dice.{'\n\n'}
            This digital version faithfully recreates the traditional rules while providing
            a modern, polished experience for 2-4 players — including single-player mode
            with an AI opponent.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          {[
            '2, 3, or 4 player support',
            'Single-player vs AI (Easy, Medium, Hard)',
            'Local multiplayer on one device',
            'Traditional cowry dice simulation',
            'Configurable rule variations',
            'Full offline play — no internet required',
            'Save and resume games',
            'Statistics tracking',
          ].map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Technical</Text>
          <Text style={styles.cardText}>
            Built with React Native (Expo) · TypeScript · Zustand · AsyncStorage{'\n'}
            Fully offline · No backend · No login · No data collection
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤ for the love of traditional games</Text>
          <Text style={styles.footerSub}>چنگا پے — The Game of Kings</Text>
        </View>
      </ScrollView>
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
  content: { padding: SPACING.lg, gap: SPACING.lg },
  logoSection: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  urduName: { color: COLORS.gold, fontSize: 20, letterSpacing: 2 },
  version: { color: COLORS.textMuted, fontSize: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
  },
  cardTitle: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  featureCheck: { color: COLORS.success, fontSize: 13, marginTop: 1 },
  featureText: { color: COLORS.textSecondary, fontSize: 13, flex: 1 },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  footerText: { color: COLORS.textSecondary, fontSize: 13, fontStyle: 'italic' },
  footerSub: { color: COLORS.textMuted, fontSize: 11 },
});
