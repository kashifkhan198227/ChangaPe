// Changa Pe — warm traditional mahogany board theme

export const COLORS = {
  // ── Board ──────────────────────────────────────────────────────────────────
  boardBackground: '#2C1208',     // dark mahogany wood
  boardBorder: '#C8962A',         // gold border
  boardLines: '#7A5918',          // dark-gold grid lines (cell borders)
  outerSquare: '#3D1A0A',         // medium mahogany
  outerSquareAlt: '#341408',
  safeSquare: '#18321A',          // dark forest-green safe squares
  safeSquareBorder: '#4CAF50',
  centerSquare: '#1A0C05',        // deepest mahogany center
  centerBorder: '#C8962A',
  innerPath: '#291208',           // slightly darker inner ring

  // ── Players ────────────────────────────────────────────────────────────────
  playerRed: '#E53935',
  playerRedLight: '#EF5350',
  playerBlue: '#1E88E5',
  playerBlueLight: '#42A5F5',
  playerGreen: '#43A047',
  playerGreenLight: '#66BB6A',
  playerYellow: '#FDD835',
  playerYellowLight: '#FFEE58',

  // ── UI chrome ──────────────────────────────────────────────────────────────
  primary: '#C8962A',             // gold/amber — main interactive colour
  primaryLight: '#D4AF3A',
  secondary: '#7A1A1A',           // deep crimson accent
  accent: '#D4A017',
  background: '#0D0705',          // near-black warm (screen background)
  surface: '#1C1007',             // dark walnut card
  surfaceElevated: '#2A1A0A',     // lighter walnut for sub-cards / dividers
  card: '#2A1A0A',

  // ── Text ───────────────────────────────────────────────────────────────────
  textPrimary: '#F5E6C8',         // parchment / ivory
  textSecondary: '#C8A96E',       // warm tan
  textMuted: '#7A6040',           // subdued tan
  textDark: '#1C0D05',

  // ── Status ─────────────────────────────────────────────────────────────────
  success: '#43A047',
  warning: '#FDD835',
  error: '#E53935',
  info: '#1E88E5',

  // ── Highlights ─────────────────────────────────────────────────────────────
  legalMove: '#4CAF50',           // bright green for legal-move cell tint
  selectedPawn: '#C8962A',        // gold ring on selected pawn
  highlight: 'rgba(200,150,42,0.4)',

  // ── Decorative ─────────────────────────────────────────────────────────────
  gold: '#D4A017',
  goldDark: '#B8860B',
  copper: '#C87533',
  ivory: '#F5E6C8',
  saffron: '#F59E0B',
  mehendi: '#43A047',
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
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
};
