import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

interface PauseScreenProps {
  visible: boolean;
  onResume: () => void;
  onQuit: () => void;
  onRules: () => void;
  onSettings: () => void;
}

export default function PauseScreen({
  visible,
  onResume,
  onQuit,
  onRules,
  onSettings,
}: PauseScreenProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.title}>PAUSED</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Game has been saved</Text>

          <View style={styles.buttons}>
            <PauseButton label="▶  RESUME" onPress={onResume} primary />
            <PauseButton label="📖  RULES" onPress={onRules} />
            <PauseButton label="⚙  SETTINGS" onPress={onSettings} />
            <PauseButton label="🏠  QUIT TO MENU" onPress={onQuit} danger />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PauseButton({
  label,
  onPress,
  primary,
  danger,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary && styles.primaryButton,
        danger && styles.dangerButton,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          primary && styles.primaryText,
          danger && styles.dangerText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: 280,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.gold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },
  buttons: {
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  button: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.gold,
  },
  dangerButton: {
    borderColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  primaryText: {
    color: COLORS.gold,
  },
  dangerText: {
    color: COLORS.error,
  },
});
