import { create } from 'zustand';
import {
  AppSettings,
  GameStats,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
} from '../utils/storage';

interface SettingsStore {
  settings: AppSettings;
  stats: GameStats;
  loaded: boolean;

  loadAll: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  recordGameResult: (won: boolean, captures: number, vsAI: boolean) => Promise<void>;
  resetStats: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
  loaded: false,

  loadAll: async () => {
    const [settings, stats] = await Promise.all([loadSettings(), loadStats()]);
    set({ settings, stats, loaded: true });
  },

  updateSettings: async (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    await saveSettings(newSettings);
  },

  recordGameResult: async (won, captures, vsAI) => {
    const stats = get().stats;
    const newStats: GameStats = {
      ...stats,
      totalGames: stats.totalGames + 1,
      wins: stats.wins + (won ? 1 : 0),
      losses: stats.losses + (won ? 0 : 1),
      totalCaptures: stats.totalCaptures + captures,
      gamesVsAI: stats.gamesVsAI + (vsAI ? 1 : 0),
      winsVsAI: stats.winsVsAI + (vsAI && won ? 1 : 0),
      lastPlayed: new Date().toISOString(),
    };
    set({ stats: newStats });
    await saveStats(newStats);
  },

  resetStats: async () => {
    set({ stats: DEFAULT_STATS });
    await saveStats(DEFAULT_STATS);
  },
}));
