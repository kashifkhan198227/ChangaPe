import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { usePurchaseStore } from '../store/purchaseStore';

interface AdBannerProps {
  onShop?: () => void;
}

export default function AdBanner({ onShop }: AdBannerProps) {
  const { has } = usePurchaseStore();

  // Don't render if user removed ads
  if (has('remove_ads')) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.adLabel}>AD</Text>
      <Text style={styles.adText}>Support Changa Pe — remove ads for ₹99</Text>
      {onShop && (
        <TouchableOpacity onPress={onShop} style={styles.shopBtn}>
          <Text style={styles.shopBtnText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    gap: SPACING.sm,
  },
  adLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  adText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  shopBtnText: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: '700',
  },
});
