import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { useSettingsStore } from '../store/settingsStore';
import { AppSettings } from '../utils/storage';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { settings, updateSettings } = useSettingsStore();

  const toggle = (key: keyof AppSettings) => {
    updateSettings({ [key]: !settings[key] } as any);
  };

  const setAnimSpeed = (speed: AppSettings['animationSpeed']) => {
    updateSettings({ animationSpeed: speed });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Audio & Haptics">
          <SettingRow
            label="Sound Effects"
            icon="🔊"
            value={settings.soundEnabled}
            onToggle={() => toggle('soundEnabled')}
          />
          <SettingRow
            label="Vibration"
            icon="📳"
            value={settings.vibrationEnabled}
            onToggle={() => toggle('vibrationEnabled')}
          />
        </Section>

        <Section title="Animation">
          <View style={styles.speedRow}>
            <Text style={styles.rowLabel}>⚡ Speed</Text>
            <View style={styles.speedPills}>
              {(['slow', 'normal', 'fast'] as const).map(speed => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedPill,
                    settings.animationSpeed === speed && styles.speedPillActive,
                  ]}
                  onPress={() => setAnimSpeed(speed)}
                >
                  <Text
                    style={[
                      styles.speedText,
                      settings.animationSpeed === speed && styles.speedTextActive,
                    ]}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Section>

        <Section title="Default Rules">
          <RuleRow
            label="Extra turn on capture"
            value={settings.rules.allowExtraTurnOnCapture}
            onToggle={() =>
              updateSettings({
                rules: { ...settings.rules, allowExtraTurnOnCapture: !settings.rules.allowExtraTurnOnCapture },
              })
            }
          />
          <RuleRow
            label="Extra turn on 4 or 8"
            value={settings.rules.allowExtraTurnOn4or8}
            onToggle={() =>
              updateSettings({
                rules: { ...settings.rules, allowExtraTurnOn4or8: !settings.rules.allowExtraTurnOn4or8 },
              })
            }
          />
          <RuleRow
            label="3× Changa/Ashta forfeits turn"
            value={settings.rules.threeSpecialsForfeit}
            onToggle={() =>
              updateSettings({
                rules: { ...settings.rules, threeSpecialsForfeit: !settings.rules.threeSpecialsForfeit },
              })
            }
          />
          <RuleRow
            label="Exact roll to finish"
            value={settings.rules.exactRollToFinish}
            onToggle={() =>
              updateSettings({
                rules: { ...settings.rules, exactRollToFinish: !settings.rules.exactRollToFinish },
              })
            }
          />
          <RuleRow
            label="Inner path safe (circles only)"
            value={settings.rules.innerPathSafe}
            onToggle={() =>
              updateSettings({
                rules: { ...settings.rules, innerPathSafe: !settings.rules.innerPathSafe },
              })
            }
          />
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Settings are saved automatically</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingRow({
  label,
  icon,
  value,
  onToggle,
}: {
  label: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.textMuted, true: COLORS.primary }}
        thumbColor={value ? COLORS.gold : COLORS.textSecondary}
      />
    </View>
  );
}

function RuleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
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
  section: { gap: SPACING.sm },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceElevated,
    gap: SPACING.sm,
  },
  settingIcon: { fontSize: 18, width: 24 },
  rowLabel: { color: COLORS.textSecondary, fontSize: 14, flex: 1 },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  speedPills: { flexDirection: 'row', gap: SPACING.xs },
  speedPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    backgroundColor: COLORS.surfaceElevated,
  },
  speedPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.gold,
  },
  speedText: { color: COLORS.textMuted, fontSize: 12 },
  speedTextActive: { color: COLORS.gold },
  footer: { alignItems: 'center', paddingVertical: SPACING.lg },
  footerText: { color: COLORS.textMuted, fontSize: 11, letterSpacing: 1 },
});
