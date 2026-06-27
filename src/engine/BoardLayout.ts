/**
 * Changa Pe board layout
 * 5×5 grid with counter-clockwise outer ring path, then inner path to center.
 *
 * Positions 0–15: outer ring counter-clockwise
 * Positions 16–19: inner path (corners to center)
 * Position 20: center (finish)
 *
 * Grid coordinates (row, col) for rendering
 */

export const BOARD_SIZE = 5;
export const TOTAL_PATH_LENGTH = 25; // 0-24: outer 0-15, inner spiral 16-23, center 24
export const OUTER_RING_LENGTH = 16;

export interface GridCoord {
  row: number;
  col: number;
}

/**
 * The counter-clockwise outer path starts at each player's entry point.
 * Player colors: 0=Red(bottom-right), 1=Blue(bottom-left), 2=Green(top-left), 3=Yellow(top-right)
 *
 * The outer ring has 16 squares (corners + edges, 5×5 perimeter = 16 unique squares).
 * Each player's home entry is one of the 4 sides.
 */

// Full outer perimeter in counter-clockwise order starting from (0,0)=top-left
// going: top row L→R, right col T→B, bottom row R→L, left col B→T
// Counter-clockwise from top-left: top-left→bottom-left→bottom-right→top-right→top-left
// Actually counter-clockwise (when viewed from above):
// top row right-to-left, left col top-to-bottom, bottom row left-to-right, right col bottom-to-top

export const OUTER_PATH_COORDS: GridCoord[] = [
  { row: 0, col: 4 }, // 0  top-right
  { row: 0, col: 3 }, // 1
  { row: 0, col: 2 }, // 2  top-center
  { row: 0, col: 1 }, // 3
  { row: 0, col: 0 }, // 4  top-left
  { row: 1, col: 0 }, // 5
  { row: 2, col: 0 }, // 6  left-center
  { row: 3, col: 0 }, // 7
  { row: 4, col: 0 }, // 8  bottom-left
  { row: 4, col: 1 }, // 9
  { row: 4, col: 2 }, // 10 bottom-center
  { row: 4, col: 3 }, // 11
  { row: 4, col: 4 }, // 12 bottom-right
  { row: 3, col: 4 }, // 13
  { row: 2, col: 4 }, // 14 right-center
  { row: 1, col: 4 }, // 15
];

// Inner path: from each edge-center into the center square
// Each player enters the inner path from a different edge
export const INNER_PATH_COORDS: GridCoord[] = [
  { row: 1, col: 3 }, // 16 - inner top-right
  { row: 1, col: 1 }, // 17 - inner top-left  (not used for all players)
  { row: 2, col: 3 }, // 18 - inner right
  { row: 3, col: 3 }, // 19 - inner bottom-right
  { row: 2, col: 2 }, // 20 - CENTER
];

// Safe squares: player-relative path indices 0,4,8,12 (every 4th step from entry = cross squares)
// This works for all players since all start at middle-edge cross squares
export const SAFE_OUTER_INDICES = new Set([0, 4, 8, 12]);

// Inner spiral: cowry circle cells are at pathIndex 17,19,21,23 for all players
export const SAFE_INNER_INDICES = new Set([17, 19, 21, 23]);

// Player entry points on the outer path (index into OUTER_PATH_COORDS)
// and their inner path entry (which outer index connects to inner)
export interface PlayerPathConfig {
  entryOuterIndex: number;     // must roll 1 to place pawn here
  outerPathStart: number;      // index in OUTER_PATH_COORDS where player starts
  innerEntry: number;          // outer path index where player turns inward
  innerPath: number[];         // indices into INNER_PATH_COORDS (in order)
}

// Player 0: Red    - enters at bottom-middle (4,2) = outer index 10
// Player 1: Blue   - enters at left-middle   (2,0) = outer index 6
// Player 2: Green  - enters at top-middle    (0,2) = outer index 2
// Player 3: Yellow - enters at right-middle  (2,4) = outer index 14
// All move counter-clockwise. Safe squares at player-relative steps 0,4,8,12 (the 4 cross squares).
export const PLAYER_CONFIGS: PlayerPathConfig[] = [
  // Red: 10→11→12→13→14→15→0→1→2→3→4→5→6→7→8→9 → inner
  { entryOuterIndex: 10, outerPathStart: 10, innerEntry: 9, innerPath: [16, 20] },
  // Blue: 6→7→8→9→10→11→12→13→14→15→0→1→2→3→4→5 → inner
  { entryOuterIndex: 6, outerPathStart: 6, innerEntry: 5, innerPath: [16, 20] },
  // Green: 2→3→4→5→6→7→8→9→10→11→12→13→14→15→0→1 → inner
  { entryOuterIndex: 2, outerPathStart: 2, innerEntry: 1, innerPath: [16, 20] },
  // Yellow: 14→15→0→1→2→3→4→5→6→7→8→9→10→11→12→13 → inner
  { entryOuterIndex: 14, outerPathStart: 14, innerEntry: 13, innerPath: [16, 20] },
];

export const PLAYER_COLORS = ['#C0392B', '#2980B9', '#27AE60', '#F39C12'];
export const PLAYER_LIGHT_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F'];
export const PLAYER_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];

// Cowry dice possible values
export const DICE_VALUES = [1, 2, 3, 4, 8] as const;
export type DiceValue = typeof DICE_VALUES[number];

export function rollCowry(): DiceValue {
  const rand = Math.random();
  // Approximate cowry probabilities: 1≈25%, 2≈37.5%, 3≈25%, 4≈6.25%, 8≈6.25%
  if (rand < 0.25) return 1;
  if (rand < 0.625) return 2;
  if (rand < 0.875) return 3;
  if (rand < 0.9375) return 4;
  return 8;
}

export function isSafeSquare(pathIndex: number): boolean {
  if (pathIndex < OUTER_RING_LENGTH) return SAFE_OUTER_INDICES.has(pathIndex);
  // Inner spiral: cowry cells at 17,19,21,23 are safe; center (24) always safe
  return SAFE_INNER_INDICES.has(pathIndex) || pathIndex === 24;
}
