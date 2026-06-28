import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/theme';
import { OUTER_PATH_COORDS, BOARD_SIZE, PLAYER_CONFIGS, PLAYER_COLORS, OUTER_RING_LENGTH, PLAYER_INNER_PATH } from '../engine/BoardLayout';
import { Pawn as PawnData, Player } from '../engine/GameEngine';
import { LegalMove } from '../engine/GameEngine';
import PawnToken from './PawnToken';
import CrossMark from './CrossMark';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOARD_MARGIN = 16;
// Cap board to 48% of screen height so the HUD/dice/status bars always fit
const BOARD_DIM = Math.min(SCREEN_WIDTH - BOARD_MARGIN * 2, SCREEN_HEIGHT * 0.48, 380);
const CELL = BOARD_DIM / BOARD_SIZE;

// Entry squares: middle of each outer edge, colored per player
// Red=bottom-middle, Blue=left-middle, Green=top-middle, Yellow=right-middle
const ENTRY_CELLS: Record<string, number> = {
  '4_2': 0, // Red
  '2_0': 1, // Blue
  '0_2': 2, // Green
  '2_4': 3, // Yellow
};

// Only the 4 cells directly adjacent to center get cowry circle decoration
const COWRY_CELLS = new Set(['1_2', '2_1', '2_3', '3_2']);

// THUMB RULE (never change): home pawns rest on middle square of their outer row/column
const HOME_QUADRANTS = [
  { row: 4, col: 2 }, // Red    — bottom-middle
  { row: 2, col: 0 }, // Blue   — left-middle
  { row: 0, col: 2 }, // Green  — top-middle
  { row: 2, col: 4 }, // Yellow — right-middle
];



// Diamond (45°) pawn arrangement — top, left, right, bottom
const P = CELL * 0.30; // pawn size
const C = CELL / 2 - P / 2; // center offset
const R = CELL * 0.26; // radius from center
const HOME_PAWN_OFFSETS = [
  { x: C,         y: C - R },  // top
  { x: C - R,     y: C },      // left
  { x: C + R,     y: C },      // right
  { x: C,         y: C + R },  // bottom
];

interface BoardProps {
  players: Player[];
  legalMoves: LegalMove[];
  selectedPawnId: number | null;
  currentPlayerIndex: number;
  onCellPress: (row: number, col: number) => void;
  onPawnPress: (pawnId: number, playerIndex: number) => void;
}

interface CellInfo {
  row: number;
  col: number;
  isOuter: boolean;
  outerIndex: number;
  isCorner: boolean;
  isCenter: boolean;
  isInner: boolean;
  entryPlayer: number | null;
}

export default function Board({ players, legalMoves, selectedPawnId, currentPlayerIndex, onCellPress, onPawnPress }: BoardProps) {
  const cells = useMemo(() => buildCells(), []);

  const pawnPositions = useMemo(() => {
    const map = new Map<string, PawnData[]>();
    players.forEach(player => {
      const config = PLAYER_CONFIGS[player.index];
      player.pawns.forEach(pawn => {
        // Finished pawns are shown in the treasury strip — not on the board center
        if (pawn.state === 'finished') return;
        if (pawn.state !== 'active') return;
        let key: string;
        if (pawn.pathIndex < OUTER_RING_LENGTH) {
          key = `outer_${(config.outerPathStart + pawn.pathIndex) % OUTER_RING_LENGTH}`;
        } else {
          const coord = PLAYER_INNER_PATH[player.index]?.[pawn.pathIndex];
          if (!coord) { key = 'inner_unknown'; }
          else {
            // pathIndex 16 lands on the outer ring cell (e.g. Red's (4,2) = outer_10)
            // Use outer_N key when the coord is on the outer ring so rendering matches
            const outerIdx = OUTER_PATH_COORDS.findIndex(c => c.row === coord.row && c.col === coord.col);
            key = outerIdx >= 0 ? `outer_${outerIdx}` : `rc_${coord.row}_${coord.col}`;
          }
        }
        const arr = map.get(key) || [];
        arr.push(pawn);
        map.set(key, arr);
      });
    });
    return map;
  }, [players]);

  const legalTargetKeys = useMemo(() => {
    const keys = new Set<string>();
    const playerIdx = players[currentPlayerIndex].index;
    const config = PLAYER_CONFIGS[playerIdx];
    legalMoves.forEach(m => {
      let key: string;
      if (m.toPathIndex < OUTER_RING_LENGTH) {
        key = `outer_${(config.outerPathStart + m.toPathIndex) % OUTER_RING_LENGTH}`;
      } else {
        const coord = PLAYER_INNER_PATH[playerIdx]?.[m.toPathIndex];
        if (!coord) { key = 'inner_unknown'; }
        else {
          const outerIdx = OUTER_PATH_COORDS.findIndex(c => c.row === coord.row && c.col === coord.col);
          key = outerIdx >= 0 ? `outer_${outerIdx}` : `rc_${coord.row}_${coord.col}`;
        }
      }
      keys.add(key);
    });
    return keys;
  }, [legalMoves, players, currentPlayerIndex]);

  return (
    <View style={[styles.board, { width: BOARD_DIM, height: BOARD_DIM }]}>
      {cells.map((cell, idx) => {
        const cellKey = cell.isOuter
          ? `outer_${cell.outerIndex}`
          : `rc_${cell.row}_${cell.col}`;
        const isHighlighted = legalTargetKeys.has(cellKey);
        const pawnsHere = pawnPositions.get(cellKey) || [];

        const hasCowry = COWRY_CELLS.has(`${cell.row}_${cell.col}`);
        const isSafeOuter = cell.isOuter && [0,4,8,12].includes(cell.outerIndex);
        let bgColor = COLORS.outerSquare;
        if (cell.isCenter) bgColor = COLORS.centerSquare;
        else if (cell.isInner) bgColor = COLORS.innerPath;
        else if (isSafeOuter) bgColor = COLORS.safeSquare;

        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.cell,
              {
                left: cell.col * CELL,
                top: cell.row * CELL,
                width: CELL,
                height: CELL,
                backgroundColor: bgColor,
                borderColor: COLORS.boardLines,
                borderWidth: 0.5,
              },
              isSafeOuter && styles.safeCell,
              isHighlighted && styles.highlighted,
            ]}
            onPress={() => onCellPress(cell.row, cell.col)}
            activeOpacity={0.7}
          >
            {/* Cowry shell decoration on inner + cells */}
            {hasCowry && (
              <View style={styles.cowryShell} />
            )}

            {/* X on outer entry squares — use each player's color */}
            {cell.entryPlayer !== null && (
              <CrossMark size={CELL} color={PLAYER_COLORS[cell.entryPlayer]} thickness={2.5} />
            )}

            {/* X on center square */}
            {cell.isCenter && (
              <CrossMark size={CELL - 4} color={COLORS.gold} thickness={3} />
            )}


            {/* Active pawns — always same size P */}
            {pawnsHere.map((pawn, i) => (
              <PawnToken
                key={`${pawn.player}_${pawn.id}`}
                pawn={pawn}
                color={PLAYER_COLORS[pawn.player]}
                isSelected={selectedPawnId === pawn.id}
                onPress={() => onPawnPress(pawn.id, pawn.player)}
                size={P}
                offset={pawnsHere.length > 1 ? getMultiOffset(i, pawnsHere.length) : { x: 0, y: 0 }}
              />
            ))}
          </TouchableOpacity>
        );
      })}

      {/* Home pawns */}
      {players.map(player => {
        const homePawns = player.pawns.filter(p => p.state === 'home');
        if (homePawns.length === 0) return null;
        const q = HOME_QUADRANTS[player.index];
        const color = PLAYER_COLORS[player.index];
        const sz = P;

        return homePawns.map((pawn, i) => {
          const off = HOME_PAWN_OFFSETS[i];
          const isLegal = legalMoves.some(m => m.pawnId === pawn.id);
          return (
            <TouchableOpacity
              key={`home_${player.index}_${pawn.id}`}
              onPress={() => onPawnPress(pawn.id, player.index)}
              activeOpacity={0.8}
              style={[
                styles.homePawn,
                {
                  left: q.col * CELL + off.x,
                  top: q.row * CELL + off.y,
                  width: sz,
                  height: sz,
                  borderRadius: sz / 2,
                  backgroundColor: color,
                  borderWidth: isLegal ? 2.5 : 1.5,
                  borderColor: isLegal ? COLORS.gold : 'rgba(245,230,200,0.4)',
                },
              ]}
            >
              <View style={[styles.pawnShine, { width: sz * 0.35, height: sz * 0.35, borderRadius: sz * 0.175 }]} />
            </TouchableOpacity>
          );
        });
      })}

    </View>
  );
}

function buildCells(): CellInfo[] {
  const cells: CellInfo[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const isCenter = row === 2 && col === 2;
      const isOuter = row === 0 || row === 4 || col === 0 || col === 4;
      const isCorner = (row === 0 || row === 4) && (col === 0 || col === 4);
      const isInner = !isOuter && !isCenter;
      const outerIndex = isOuter ? OUTER_PATH_COORDS.findIndex(c => c.row === row && c.col === col) : -1;
      const key = `${row}_${col}`;
      const entryPlayer = ENTRY_CELLS[key] !== undefined ? ENTRY_CELLS[key] : null;
      cells.push({ row, col, isOuter, outerIndex, isCorner, isCenter, isInner, entryPlayer });
    }
  }
  return cells;
}

function getMultiOffset(index: number, total: number): { x: number; y: number } {
  if (total === 2) return [{ x: -CELL * 0.14, y: 0 }, { x: CELL * 0.14, y: 0 }][index];
  return [
    { x: -CELL * 0.14, y: -CELL * 0.14 },
    { x: CELL * 0.14, y: -CELL * 0.14 },
    { x: -CELL * 0.14, y: CELL * 0.14 },
    { x: CELL * 0.14, y: CELL * 0.14 },
  ][index] || { x: 0, y: 0 };
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: COLORS.boardBackground,
    borderWidth: 2,
    borderColor: COLORS.boardBorder,
    borderRadius: 3,
  },
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cowryShell: {
    width: CELL * 0.38,
    height: CELL * 0.38,
    borderRadius: CELL * 0.19,
    borderWidth: 2.5,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold + '22',
  },
  safeCell: {
    borderColor: COLORS.safeSquareBorder + '66',
    borderWidth: 1,
  },
  highlighted: {
    backgroundColor: COLORS.legalMove + '55',
    borderColor: COLORS.legalMove,
    borderWidth: 2,
  },
  homePawn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  pawnShine: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    position: 'absolute',
    top: '12%',
    left: '12%',
  },
});
