import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';
import { usePurchaseStore } from '../store/purchaseStore';
import { PURCHASE_CATALOG, PurchaseId } from '../utils/storage';

interface ShopScreenProps {
  onBack: () => void;
}

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const { purchasedIds, purchase, restore } = usePurchaseStore();
  const [busy, setBusy] = useState<PurchaseId | null>(null);

  const handleBuy = async (id: PurchaseId, title: string, price: number) => {
    Alert.alert(
      `Buy ${title}`,
      `Purchase ${title} for ₹${price}?\n\n(Tap OK to confirm — real payment coming soon)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay ₹${price}`,
          onPress: async () => {
            setBusy(id);
            const ok = await purchase(id);
            setBusy(null);
            if (ok) {
              Alert.alert('Purchased!', `${title} is now unlocked. Enjoy!`);
            } else {
              Alert.alert('Failed', 'Purchase could not be completed. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    await restore();
    Alert.alert('Restored', 'Your previous purchases have been restored.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SHOP</Text>
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sub}>One-time purchases · No subscriptions · No ads during gameplay</Text>

        {PURCHASE_CATALOG.map(item => {
          const owned = purchasedIds.has(item.id);
          const loading = busy === item.id;
          return (
            <View key={item.id} style={[styles.card, owned && styles.cardOwned]}>
              <View style={styles.cardLeft}>
                <Text style={styles.icon}>{item.icon}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
              </View>
              {owned ? (
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedText}>✓ Owned</Text>
                </View>
              ) : loading ? (
                <ActivityIndicator color={COLORS.gold} />
              ) : (
                <TouchableOpacity
                  style={styles.buyBtn}
                  onPress={() => handleBuy(item.id, item.title, item.price)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buyPrice}>₹{item.price}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            All purchases are one-time and stored on this device. Use "Restore" to recover purchases
            after reinstalling. Real payment integration (Google Play Billing / UPI) coming soon.
          </Text>
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
  restoreText: { color: COLORS.textMuted, fontSize: 12 },
  content: { padding: SPACING.lg, gap: SPACING.md },
  sub: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  cardOwned: {
    borderColor: COLORS.gold + '66',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING.sm,
  },
  icon: { fontSize: 28, marginTop: 2 },
  cardText: { flex: 1, gap: 3 },
  itemTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  itemDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.gold,
    minWidth: 64,
    alignItems: 'center',
  },
  buyPrice: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  ownedBadge: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.success + '22',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  ownedText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },
  note: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceElevated,
  },
  noteText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});
