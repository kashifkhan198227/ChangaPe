import { DiceValue, PLAYER_CONFIGS, rollCowry, isSafeSquare, OUTER_RING_LENGTH, PLAYER_INNER_CELL_KEY, COWRY_INNER_CELL_KEYS } from './BoardLayout';

export type PlayerIndex = 0 | 1 | 2 | 3;
export type PawnState = 'home' | 'active' | 'finished';

export interface Pawn {
  id: number;           // 0–3
  player: PlayerIndex;
  state: PawnState;
  pathIndex: number;    // -1 if home, 0–20 if active/finished
}

export interface Player {
  index: PlayerIndex;
  isAI: boolean;
  aiLevel: 'easy' | 'medium' | 'hard';
  pawns: Pawn[];
  captureCount: number;
  isActive: boolean;
}

export interface GameRules {
  allowExtraTurnOnCapture: boolean;
  allowExtraTurnOn4or8: boolean;
  threeSpecialsForfeit: boolean; // 3 combined rolls of 4 or 8 in one turn = forfeit
  exactRollToFinish: boolean;
  innerPathSafe: boolean;
  requireCaptureToEnterInner: boolean; // must kill at least one opponent before entering inner spiral
}

export const DEFAULT_RULES: GameRules = {
  allowExtraTurnOnCapture: true,
  allowExtraTurnOn4or8: true,
  threeSpecialsForfeit: true,
  exactRollToFinish: true,
  innerPathSafe: true,
  requireCaptureToEnterInner: true,
};

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: DiceValue | null;
  diceRolled: boolean;
  phase: 'rolling' | 'moving' | 'gameover';
  winner: PlayerIndex | null;
  extraTurn: boolean;
  consecutiveSpecials: number; // count of 4s+8s rolled this turn chain
  pendingRolls: number[];    // individual roll values still to be used this turn
  rules: GameRules;
  moveHistory: MoveRecord[];
  canUndo: boolean;
}

export interface MoveRecord {
  playerIndex: number;
  pawnId: number;
  fromPathIndex: number;
  toPathIndex: number;
  captured: boolean;
  capturedPlayer?: number;
  capturedPawnId?: number;
  capturedPawnPathIndex?: number; // BUG-1 fix: store where the captured pawn was
  diceValue: DiceValue;
}

export interface LegalMove {
  pawnId: number;
  fromPathIndex: number;
  toPathIndex: number;
  wouldCapture: boolean;
  capturedPlayer?: number;
  capturedPawnId?: number;
  wouldFinish: boolean;
}

// Full path length for each player: 16 outer squares + inner path squares + center
// Player travels 16 + (inner path length) steps total
// Inner path lengths vary; we model as absolute path index 0–20
// Steps: outer ring 0–15 (shared, shifted per player), inner 16–19, center 20

const FULL_PATH_LENGTH = 21; // indices 0–20

/**
 * Convert a player-relative step count (0 = entry point) to an absolute outer ring index.
 */
function playerStepToOuterIndex(player: PlayerIndex, step: number): number {
  const config = PLAYER_CONFIGS[player];
  return (config.outerPathStart + step) % OUTER_RING_LENGTH;
}

/**
 * Get the absolute board position key for a pawn at a given path index.
 * This is used for capture detection. Pawns on the same outer square can capture.
 */
function getPositionKey(player: PlayerIndex, pathIndex: number): string {
  if (pathIndex < OUTER_RING_LENGTH) {
    const outerIdx = playerStepToOuterIndex(player, pathIndex);
    return `outer_${outerIdx}`;
  }
  // Inner path: position is player-specific (no captures on inner path)
  return `inner_${player}_${pathIndex}`;
}

export function computeLegalMoves(state: GameState): LegalMove[] {
  if (!state.diceRolled || state.diceValue === null) return [];
  if (state.phase !== 'moving') return [];

  const player = state.players[state.currentPlayerIndex];
  // Use first pending roll value for current move
  const dice = state.pendingRolls.length > 0 ? state.pendingRolls[0] : (state.diceValue as number);
  const moves: LegalMove[] = [];

  for (const pawn of player.pawns) {
    if (pawn.state === 'finished') continue;

    if (pawn.state === 'home') {
      // Pe (1) enters a pawn and moves it 1 step past the cross (pathIndex 1)
      // The cross square (pathIndex 0) is the safe waiting area — entry lands at pathIndex 1
      if (dice === 1) {
        const captureInfo = findCapture(state, player.index, 1);
        moves.push({
          pawnId: pawn.id,
          fromPathIndex: -1,
          toPathIndex: 1,
          wouldCapture: captureInfo !== null && !captureInfo.isSafe,
          capturedPlayer: captureInfo?.playerIndex,
          capturedPawnId: captureInfo?.pawnId,
          wouldFinish: false,
        });
      }
      continue;
    }

    // Active pawn
    const newPathIndex = pawn.pathIndex + dice;
    const FINISH_INDEX = 24; // center = end of inner spiral

    // Rule 1: must kill at least one opponent before entering inner path
    const wouldEnterInner = pawn.pathIndex < OUTER_RING_LENGTH && newPathIndex >= OUTER_RING_LENGTH;
    if (wouldEnterInner && state.rules.requireCaptureToEnterInner && player.captureCount === 0) {
      // Exception: waive only when ALL opponent pawns are in inner path or finished
      // (home pawns and outer pawns still count as "not yet in inner")
      const allOpponentsInInnerOrDone = state.players.every(p =>
        p.index === player.index ||
        p.pawns.every(pw =>
          pw.state === 'finished' ||
          (pw.state === 'active' && pw.pathIndex >= OUTER_RING_LENGTH)
        )
      );
      if (!allOpponentsInInnerOrDone) {
        // Pawn loops back around the outer ring
        const wrappedIndex = newPathIndex - OUTER_RING_LENGTH;
        const ci = findCapture(state, player.index, wrappedIndex);
        moves.push({
          pawnId: pawn.id, fromPathIndex: pawn.pathIndex, toPathIndex: wrappedIndex,
          wouldCapture: ci !== null && !isSafeSquare(wrappedIndex),
          capturedPlayer: ci?.playerIndex, capturedPawnId: ci?.pawnId, wouldFinish: false,
        });
        continue;
      }
    }

    // Rule 2: on inner path, overshoot center → pawn cannot move (must roll exact)
    const alreadyInner = pawn.pathIndex >= OUTER_RING_LENGTH;
    if (alreadyInner && state.rules.exactRollToFinish && newPathIndex > FINISH_INDEX) {
      continue; // no legal move — pawn stays; player must roll exact Pe(1) to finish
    }

    if (!alreadyInner && state.rules.exactRollToFinish && newPathIndex > FINISH_INDEX) continue;

    const targetPathIndex = Math.min(newPathIndex, FINISH_INDEX);
    const wouldFinish = targetPathIndex === FINISH_INDEX;
    const captureInfo = wouldFinish ? null : findCapture(state, player.index, targetPathIndex);

    moves.push({
      pawnId: pawn.id,
      fromPathIndex: pawn.pathIndex,
      toPathIndex: targetPathIndex,
      // Use captureInfo.isSafe (includes stacking protection) not just square-level safety
      wouldCapture: captureInfo !== null && !captureInfo.isSafe,
      capturedPlayer: captureInfo?.playerIndex,
      capturedPawnId: captureInfo?.pawnId,
      wouldFinish,
    });
  }

  return moves;
}

interface CaptureInfo {
  playerIndex: number;
  pawnId: number;
  isSafe: boolean;
}

// Re-alias for local readability
const INNER_CELL_KEY = PLAYER_INNER_CELL_KEY;
const COWRY_CELL_KEYS = COWRY_INNER_CELL_KEYS;

function findCapture(
  state: GameState,
  movingPlayer: PlayerIndex,
  targetPathIndex: number
): CaptureInfo | null {
  if (targetPathIndex >= OUTER_RING_LENGTH) {
    // Inner path: cowry circle cells are safe (when rule on); center always safe
    if (targetPathIndex === 24) return null;
    const cellKey = INNER_CELL_KEY[movingPlayer]?.[targetPathIndex];
    const isCowry = cellKey ? COWRY_CELL_KEYS.has(cellKey) : false;
    if (state.rules.innerPathSafe && isCowry) return null;

    // Find opponents on same physical inner cell
    for (const otherPlayer of state.players) {
      if (otherPlayer.index === movingPlayer) continue;
      const pawnsHere = otherPlayer.pawns.filter(p => {
        if (p.state !== 'active' || p.pathIndex < OUTER_RING_LENGTH) return false;
        return INNER_CELL_KEY[otherPlayer.index]?.[p.pathIndex] === cellKey;
      });
      if (pawnsHere.length === 0) continue;
      // Stacking: 2+ pawns from any combination on same cell = safe
      const totalOnCell = state.players.flatMap(pl =>
        pl.pawns.filter(p =>
          p.state === 'active' &&
          p.pathIndex >= OUTER_RING_LENGTH &&
          INNER_CELL_KEY[pl.index]?.[p.pathIndex] === cellKey
        )
      ).length;
      return { playerIndex: otherPlayer.index, pawnId: pawnsHere[0].id, isSafe: totalOnCell >= 2 };
    }
    return null;
  }

  // Outer ring
  const movingConfig = PLAYER_CONFIGS[movingPlayer];
  const targetOuterIdx = (movingConfig.outerPathStart + targetPathIndex) % OUTER_RING_LENGTH;

  // Count total pawns on target outer cell (all players) for stacking protection
  let totalPawnsOnTarget = 0;
  for (const anyPlayer of state.players) {
    const config = PLAYER_CONFIGS[anyPlayer.index];
    for (const p of anyPlayer.pawns) {
      if (p.state !== 'active' || p.pathIndex >= OUTER_RING_LENGTH) continue;
      if ((config.outerPathStart + p.pathIndex) % OUTER_RING_LENGTH === targetOuterIdx) {
        totalPawnsOnTarget++;
      }
    }
  }

  for (const otherPlayer of state.players) {
    if (otherPlayer.index === movingPlayer) continue;
    const otherConfig = PLAYER_CONFIGS[otherPlayer.index];
    const pawnsOnTarget = otherPlayer.pawns.filter(p => {
      if (p.state !== 'active' || p.pathIndex >= OUTER_RING_LENGTH) return false;
      return (otherConfig.outerPathStart + p.pathIndex) % OUTER_RING_LENGTH === targetOuterIdx;
    });
    if (pawnsOnTarget.length === 0) continue;
    const isSafe = isSafeSquare(targetPathIndex) || totalPawnsOnTarget >= 2;
    return { playerIndex: otherPlayer.index, pawnId: pawnsOnTarget[0].id, isSafe };
  }
  return null;
}

export function applyMove(state: GameState, move: LegalMove): GameState {
  const newState = deepClone(state);
  const player = newState.players[newState.currentPlayerIndex];
  const pawn = player.pawns.find(p => p.id === move.pawnId)!;

  const record: MoveRecord = {
    playerIndex: player.index,
    pawnId: pawn.id,
    fromPathIndex: pawn.pathIndex,
    toPathIndex: move.toPathIndex,
    captured: move.wouldCapture,
    capturedPlayer: move.capturedPlayer,
    capturedPawnId: move.capturedPawnId,
    diceValue: state.diceValue!,
  };

  // Move pawn
  pawn.pathIndex = move.toPathIndex;
  if (pawn.state === 'home') pawn.state = 'active';
  if (move.wouldFinish) pawn.state = 'finished';

  // Handle capture
  let captured = false;
  if (move.wouldCapture && move.capturedPlayer !== undefined && move.capturedPawnId !== undefined) {
    const capturedPlayerObj = newState.players.find(p => p.index === move.capturedPlayer)!;
    const capturedPawn = capturedPlayerObj.pawns.find(p => p.id === move.capturedPawnId)!;
    record.capturedPawnPathIndex = capturedPawn.pathIndex; // BUG-1 fix
    capturedPawn.state = 'home';
    capturedPawn.pathIndex = -1;
    player.captureCount++;
    captured = true;
  }

  // Track history
  newState.moveHistory.push(record);
  newState.canUndo = true;

  // Check win
  if (player.pawns.every(p => p.state === 'finished')) {
    newState.phase = 'gameover';
    newState.winner = player.index as PlayerIndex;
    return newState;
  }

  // Consume the pending roll used for this move
  newState.pendingRolls = newState.pendingRolls.slice(1);

  // Capture or finish grants a bonus roll added to the pending queue
  if (state.rules.allowExtraTurnOnCapture && captured) {
    newState.extraTurn = true;
    newState.pendingRolls = [];   // start a fresh extra turn
    newState.phase = 'rolling';
    newState.diceRolled = false;
    newState.diceValue = null;
    return newState;
  }
  if (move.wouldFinish) {
    newState.extraTurn = true;
    newState.pendingRolls = [];   // start a fresh extra turn
    newState.phase = 'rolling';
    newState.diceRolled = false;
    newState.diceValue = null;
    return newState;
  }

  // More pending rolls to use this turn?
  if (newState.pendingRolls.length > 0) {
    const legal = computeLegalMoves({ ...newState, phase: 'moving' });
    if (legal.length > 0) {
      newState.phase = 'moving';
      return newState;
    }
    // No moves for remaining rolls — skip them
    newState.pendingRolls = [];
  }

  advanceTurn(newState);

  return newState;
}

// Traditional turn order: Red(0) → Yellow(3) → Green(2) → Blue(1)
// For 2-player: Red(bottom) vs Green(top) so they face each other across the board
const TURN_ORDER: Record<number, number[]> = {
  2: [0, 2],
  3: [0, 3, 2],
  4: [0, 3, 2, 1],
};

function advanceTurn(state: GameState): void {
  state.consecutiveSpecials = 0;
  state.extraTurn = false;
  state.diceRolled = false;
  state.diceValue = null;
  state.pendingRolls = [];
  state.phase = 'rolling';

  const order = TURN_ORDER[state.players.length] ?? state.players.map(p => p.index);
  const currentPos = order.indexOf(state.currentPlayerIndex);
  let attempts = 0;
  let next: number;
  do {
    const nextPos = (currentPos + 1 + attempts) % order.length;
    next = order[nextPos];
    attempts++;
  } while (
    state.players.find(p => p.index === next)?.pawns.every(p => p.state === 'finished') &&
    attempts < order.length
  );
  state.currentPlayerIndex = next;
}

export function skipTurn(state: GameState): GameState {
  const newState = deepClone(state);
  advanceTurn(newState);
  return newState;
}

export function performRoll(state: GameState): GameState {
  const newState = deepClone(state);
  const dice = rollCowry();
  newState.diceValue = dice;
  newState.diceRolled = true;

  // Track combined 4+8 rolls this turn chain
  if (dice === 4 || dice === 8) {
    newState.consecutiveSpecials++;
  } else {
    newState.consecutiveSpecials = 0; // non-special resets the chain
  }

  const rules = newState.rules;
  if (rules.threeSpecialsForfeit && newState.consecutiveSpecials >= 3) {
    newState.consecutiveSpecials = 0;
    newState.pendingRolls = [];
    advanceTurn(newState);
    return newState;
  }

  const isBonusRoll = rules.allowExtraTurnOn4or8 && (dice === 4 || dice === 8);
  // Changa/Ashta adds two separate moves: the dice value + a free Pe (1)
  newState.pendingRolls = isBonusRoll
    ? [...newState.pendingRolls, dice, 1]
    : [...newState.pendingRolls, dice];

  if (isBonusRoll) {
    // Stay in rolling phase — must roll again, collect more values
    newState.phase = 'rolling';
    newState.diceRolled = false;
    return newState;
  }

  // Done rolling — go to moving phase, player uses pending rolls one by one
  const legal = computeLegalMoves({ ...newState, phase: 'moving' });
  if (legal.length === 0) {
    newState.pendingRolls = [];
    advanceTurn(newState);
  } else {
    newState.phase = 'moving';
  }

  return newState;
}

export function undoLastMove(state: GameState): GameState | null {
  if (!state.canUndo || state.moveHistory.length === 0) return null;
  const newState = deepClone(state);
  const last = newState.moveHistory.pop()!;

  const player = newState.players.find(p => p.index === last.playerIndex)!;
  const pawn = player.pawns.find(p => p.id === last.pawnId)!;

  pawn.pathIndex = last.fromPathIndex;
  pawn.state = last.fromPathIndex === -1 ? 'home' : 'active';

  if (last.captured && last.capturedPlayer !== undefined && last.capturedPawnId !== undefined) {
    const capturedPlayer = newState.players.find(p => p.index === last.capturedPlayer)!;
    const capturedPawn = capturedPlayer.pawns.find(p => p.id === last.capturedPawnId)!;
    capturedPawn.state = 'active';
    capturedPawn.pathIndex = last.capturedPawnPathIndex ?? last.toPathIndex; // BUG-1 fix
    player.captureCount = Math.max(0, player.captureCount - 1);
  }

  newState.currentPlayerIndex = last.playerIndex;
  newState.diceValue = last.diceValue;
  newState.diceRolled = true;
  newState.phase = 'moving';
  newState.pendingRolls = [last.diceValue as number];
  newState.canUndo = newState.moveHistory.length > 0;
  newState.winner = null;

  return newState;
}

export function createInitialGameState(
  numPlayers: 2 | 3 | 4,
  aiPlayers: Record<number, 'easy' | 'medium' | 'hard' | 'human'>,
  rules: GameRules = DEFAULT_RULES
): GameState {
  // Use TURN_ORDER to determine which player indices (positions on board) participate
  const order = TURN_ORDER[numPlayers] ?? [0, 1, 2, 3].slice(0, numPlayers);
  const players: Player[] = [];
  for (const idx of order) {
    const aiLevel = aiPlayers[idx] ?? 'human';
    players.push({
      index: idx as PlayerIndex,
      isAI: aiLevel !== 'human',
      aiLevel: aiLevel !== 'human' ? aiLevel : 'easy',
      captureCount: 0,
      isActive: idx === order[0],
      pawns: [0, 1, 2, 3].map(id => ({
        id,
        player: idx as PlayerIndex,
        state: 'home',
        pathIndex: -1,
      })),
    });
  }

  return {
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    diceRolled: false,
    phase: 'rolling',
    winner: null,
    extraTurn: false,
    consecutiveSpecials: 0,
    pendingRolls: [],
    rules,
    moveHistory: [],
    canUndo: false,
  };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
