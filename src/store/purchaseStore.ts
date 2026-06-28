import { create } from 'zustand';
import { PurchaseId, PurchaseRecord, loadPurchases, savePurchases } from '../utils/storage';

interface PurchaseStore {
  purchasedIds: Set<PurchaseId>;
  loaded: boolean;

  load: () => Promise<void>;
  has: (id: PurchaseId) => boolean;
  // In production this would call expo-in-app-purchases / react-native-iap.
  // For now it's a mock that always succeeds and persists to AsyncStorage.
  purchase: (id: PurchaseId) => Promise<boolean>;
  // Dev-only helper: restore from storage (simulate restore purchases)
  restore: () => Promise<void>;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchasedIds: new Set(),
  loaded: false,

  load: async () => {
    const record = await loadPurchases();
    set({ purchasedIds: new Set(record.purchasedIds), loaded: true });
  },

  has: (id) => get().purchasedIds.has(id),

  purchase: async (id) => {
    try {
      // TODO: replace with real IAP call (expo-in-app-purchases or react-native-iap)
      const current = get().purchasedIds;
      const updated = new Set(current);
      updated.add(id);
      const record: PurchaseRecord = { purchasedIds: [...updated] };
      await savePurchases(record);
      set({ purchasedIds: updated });
      return true;
    } catch {
      return false;
    }
  },

  restore: async () => {
    await get().load();
  },
}));
