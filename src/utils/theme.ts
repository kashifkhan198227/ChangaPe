// LockiVault-inspired dark purple theme for Changa Pe

export const COLORS = {
  // Board — black background, white grid
  boardBackground: '#000000',
  boardBorder: '#ffffff',
  boardLines: '#ffffff',
  outerSquare: '#000000',      // all cells black — grid lines are the visual separator
  outerSquareAlt: '#000000',
  safeSquare: '#000000',
  safeSquareBorder: '#ffffff',
  centerSquare: '#000000',     // center also black; white X marks it
  centerBorder: '#ffffff',
  innerPath: '#000000',

  // Players — vivid distinct colors that pop on dark background
  playerRed: '#EF4444',
  playerRedLight: '#F87171',
  playerBlue: '#3B82F6',
  playerBlueLight: '#60A5FA',
  playerGreen: '#10B981',
  playerGreenLight: '#34D399',
  playerYellow: '#F59E0B',
  playerYellowLight: '#FCD34D',

  // UI
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  secondary: '#6D28D9',
  accent: '#A78BFA',
  background: '#000000',
  surface: '#111111',
  surfaceElevated: '#1A1A1A',
  card: '#1A1A1A',

  // Text
  textPrimary: '#F1F0FF',      // TextPrimary
  textSecondary: '#9B8EC4',    // TextSecondary
  textMuted: '#5A5480',        // TextMuted
  textDark: '#0A0A1A',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Highlights
  legalMove: '#10B981',        // Success green
  selectedPawn: '#8B5CF6',     // Brand purple
  highlight: 'rgba(139,92,246,0.4)',

  // Decorative
  gold: '#F59E0B',
  goldDark: '#D97706',
  copper: '#A78BFA',
  ivory: '#F1F0FF',
  saffron: '#F59E0B',
  mehendi: '#10B981',
};

export const FONTS = {
  heading: 'serif',
  body: 'sans-serif',
  mono: 'monospace',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
};
