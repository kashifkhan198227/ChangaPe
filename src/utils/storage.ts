import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SETTINGS: '@changape_settings',
  STATS: '@changape_stats',
  SAVED_GAME: '@changape_saved_game',
  GAME_HISTORY: '@changape_history',
  PURCHASES: '@changape_purchases',
};

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'traditional' | 'modern';
  language: 'en' | 'ur';
  rules: {
    allowExtraTurnOnCapture: boolean;
    allowExtraTurnOn4or8: boolean;
    threeSpecialsForfeit: boolean;
    exactRollToFinish: boolean;
    innerPathSafe: boolean;
    requireCaptureToEnterInner: boolean;
  };
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalCaptures: number;
  gamesVsAI: number;
  winsVsAI: number;
  lastPlayed: string | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  animationSpeed: 'normal',
  theme: 'traditional',
  language: 'en',
  rules: {
    allowExtraTurnOnCapture: true,
    allowExtraTurnOn4or8: true,
    threeSpecialsForfeit: true,
    exactRollToFinish: true,
    innerPathSafe: true,
    requireCaptureToEnterInner: true,
  },
};

export const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  totalCaptures: 0,
  gamesVsAI: 0,
  winsVsAI: 0,
  lastPlayed: null,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function loadStats(): Promise<GameStats> {
  try {
    const data = await AsyncStorage.getItem(KEYS.STATS);
    if (!data) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_STATS;
  }
}

export async function saveStats(stats: GameStats): Promise<void> {
  await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
}

export async function saveGame(gameState: unknown): Promise<void> {
  await AsyncStorage.setItem(KEYS.SAVED_GAME, JSON.stringify(gameState));
}

export async function loadSavedGame(): Promise<unknown | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SAVED_GAME);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function clearSavedGame(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SAVED_GAME);
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  numPlayers: number;
  winnerName: string;
  winnerIsAI: boolean;
  playerCaptures: number[]; // per-player capture counts
  duration: number; // seconds (0 if unknown)
}

const MAX_HISTORY = 50;

export async function loadGameHistory(): Promise<GameHistoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.GAME_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function appendGameHistory(entry: GameHistoryEntry): Promise<void> {
  const history = await loadGameHistory();
  history.unshift(entry); // newest first
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  await AsyncStorage.setItem(KEYS.GAME_HISTORY, JSON.stringify(history));
}

export async function clearGameHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.GAME_HISTORY);
}

// ── Purchases ─────────────────────────────────────────────────────────────────

export type PurchaseId =
  | 'auto_move'     // ₹49 — auto-pick best move when 30s timer expires
  | 'ai_pro'        // ₹49 — unlocks Medium & Hard AI
  | 'remove_ads'    // ₹99 — removes all ads
  | 'theme_royal'   // ₹29 — Royal dark-purple theme
  | 'theme_jade';   // ₹29 — Jade green theme

export interface PurchaseRecord {
  purchasedIds: PurchaseId[];
}

export const PURCHASE_CATALOG: Array<{
  id: PurchaseId;
  title: string;
  description: string;
  price: number; // INR
  icon: string;
}> = [
  { id: 'auto_move',   title: 'Auto-Move',      description: 'When your 30s timer runs out, the best move is played automatically instead of forfeiting your turn.', price: 49,  icon: '⚡' },
  { id: 'ai_pro',      title: 'AI Pro',          description: 'Unlock Medium and Hard AI opponents for a real challenge.', price: 49,  icon: '🤖' },
  { id: 'remove_ads',  title: 'Remove Ads',      description: 'Remove all banner ads from the game forever.', price: 99,  icon: '🚫' },
  { id: 'theme_royal', title: 'Royal Theme',     description: 'A regal dark-purple and gold board skin.', price: 29,  icon: '👑' },
  { id: 'theme_jade',  title: 'Jade Theme',      description: 'A serene green and ivory board skin.', price: 29,  icon: '💚' },
];

export async function loadPurchases(): Promise<PurchaseRecord> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PURCHASES);
    return data ? JSON.parse(data) : { purchasedIds: [] };
  } catch {
    return { purchasedIds: [] };
  }
}

export async function savePurchases(record: PurchaseRecord): Promise<void> {
  await AsyncStorage.setItem(KEYS.PURCHASES, JSON.stringify(record));
}
