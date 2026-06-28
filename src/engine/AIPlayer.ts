import { GameState, LegalMove, computeLegalMoves, PlayerIndex } from './GameEngine';
import { PLAYER_CONFIGS, OUTER_RING_LENGTH } from './BoardLayout';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export function getAIMove(state: GameState, difficulty: AIDifficulty): LegalMove | null {
  const moves = computeLegalMoves(state);
  if (moves.length === 0) return null;

  switch (difficulty) {
    case 'easy': return easyAI(moves);
    case 'medium': return mediumAI(moves, state);
    case 'hard': return hardAI(moves, state);
    default: return easyAI(moves);
  }
}

function easyAI(moves: LegalMove[]): LegalMove {
  return moves[Math.floor(Math.random() * moves.length)];
}

function mediumAI(moves: LegalMove[], state: GameState): LegalMove {
  // Priority: capture > enter safe square > any active move > enter from home
  const captures = moves.filter(m => m.wouldCapture);
  if (captures.length > 0) return captures[Math.floor(Math.random() * captures.length)];

  const safeMovers = moves.filter(m => m.fromPathIndex !== -1 && isSafeTarget(m.toPathIndex));
  if (safeMovers.length > 0) return safeMovers[Math.floor(Math.random() * safeMovers.length)];

  const activeMovers = moves.filter(m => m.fromPathIndex !== -1);
  if (activeMovers.length > 0) return activeMovers[Math.floor(Math.random() * activeMovers.length)];

  return moves[0];
}

function hardAI(moves: LegalMove[], state: GameState): LegalMove {
  // Score each move
  const scored = moves.map(m => ({ move: m, score: scoreMove(m, state) }));
  scored.sort((a, b) => b.score - a.score);
  // Pick top move with slight randomness to avoid pure determinism
  const topScore = scored[0].score;
  const topMoves = scored.filter(s => s.score >= topScore - 5);
  return topMoves[Math.floor(Math.random() * Math.min(topMoves.length, 2))].move;
}

function scoreMove(move: LegalMove, state: GameState): number {
  let score = 0;
  const player = state.players.find(p => p.index === state.currentPlayerIndex)!;

  // Finishing a pawn is highest priority
  if (move.wouldFinish) score += 200;

  // Capture opponent
  if (move.wouldCapture) score += 100;

  // Landing on a safe square
  if (isSafeTarget(move.toPathIndex)) score += 30;

  // Prefer moving active pawns further along the path
  if (move.fromPathIndex !== -1) {
    score += move.toPathIndex * 2;
  }

  // Entering a pawn from home (low priority unless nothing else)
  if (move.fromPathIndex === -1) score += 10;

  // Avoid moving to squares threatened by opponents
  const playerIdx = player.index as PlayerIndex;
  if (isSquareThreatened(move.toPathIndex, playerIdx, state)) score -= 40;

  return score;
}

function isSafeTarget(pathIndex: number): boolean {
  // Outer ring corners (every 4 steps from 0) or center
  if (pathIndex === 20) return true;
  if (pathIndex < OUTER_RING_LENGTH && pathIndex % 4 === 0) return true;
  return false;
}

function isSquareThreatened(pathIndex: number, playerIdx: PlayerIndex, state: GameState): boolean {
  if (pathIndex >= OUTER_RING_LENGTH) return false; // inner path is safe
  if (isSafeTarget(pathIndex)) return false;

  const myConfig = PLAYER_CONFIGS[playerIdx];
  const myOuterIdx = (myConfig.outerPathStart + pathIndex) % OUTER_RING_LENGTH;

  for (const other of state.players) {
    if (other.index === playerIdx) continue;
    const otherConfig = PLAYER_CONFIGS[other.index];
    for (const pawn of other.pawns) {
      if (pawn.state !== 'active') continue;
      if (pawn.pathIndex >= OUTER_RING_LENGTH) continue;
      // Check if opponent could reach myOuterIdx in 1–4 moves
      const otherOuterIdx = (otherConfig.outerPathStart + pawn.pathIndex) % OUTER_RING_LENGTH;
      const distToMe = (myOuterIdx - otherOuterIdx + OUTER_RING_LENGTH) % OUTER_RING_LENGTH;
      if (distToMe >= 1 && distToMe <= 4) return true;
    }
  }
  return false;
}
