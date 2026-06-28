import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, SPACING } from '../utils/theme';
import { useGameStore } from '../store/gameStore';
import { usePurchaseStore } from '../store/purchaseStore';
import Board from '../components/Board';
import DiceRoller from '../components/DiceRoller';
import PlayerHUD from '../components/PlayerHUD';
import { LegalMove, Player } from '../engine/GameEngine';
import { PLAYER_NAMES, PLAYER_COLORS } from '../engine/BoardLayout';

const ROLL_NAMES: Record<number, string> = {
  1: 'Pe', 2: 'Do', 3: 'Teen', 4: 'Changa', 8: 'Ashta',
};

interface BoardScreenProps {
  onPause: () => void;
  onVictory: (winnerIndex: number) => void;
  onShop: () => void;
}

export default function BoardScreen({ onPause, onVictory, onShop }: BoardScreenProps) {
  const { has: hasPurchase } = usePurchaseStore();
  const hasAutoMove = hasPurchase('auto_move');
  const {
    gameState,
    selectedPawnId,
    legalMoves,
    activeRollIndex,
    rollDice,
    selectPawn,
    selectRoll,
    makeMove,
    undoMove,
    triggerAIMove,
    saveCurrentGame,
    cancelAI,
  } = useGameStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // BUG-6: cancel AI timeouts when component unmounts
  useEffect(() => { return () => { cancelAI(); }; }, []);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setSecondsLeft(null);
  };

  useEffect(() => {
    if (!gameState) return;
    if (gameState.phase === 'gameover' && gameState.winner !== null) {
      clearTimer();
      onVictory(gameState.winner);
      return;
    }
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI && gameState.phase !== 'gameover') {
      clearTimer();
      triggerAIMove();
      return;
    }
    // 30s auto-roll timer: if human hasn't thrown the dice yet
    if (gameState.phase === 'rolling' && !currentPlayer.isAI) {
      clearTimer();
      let secs = 30;
      setSecondsLeft(secs);
      intervalRef.current = setInterval(() => {
        secs -= 1;
        setSecondsLeft(secs);
        if (secs <= 0) clearTimer();
      }, 1000);
      timerRef.current = setTimeout(() => {
        clearTimer();
        const s = useGameStore.getState();
        if (s.gameState?.phase === 'rolling') s.rollDice();
      }, 30000);
      return () => clearTimer();
    }
    // Auto-move if only one legal move for human player
    if (gameState.phase === 'moving' && !currentPlayer.isAI && legalMoves.length === 1) {
      const timer = setTimeout(() => makeMove(legalMoves[0]), 300);
      return () => clearTimeout(timer);
    }
    // 30s forfeit timer for human with multiple choices
    if (gameState.phase === 'moving' && !currentPlayer.isAI && legalMoves.length > 1) {
      clearTimer();
      let secs = 30;
      setSecondsLeft(secs);
      intervalRef.current = setInterval(() => {
        secs -= 1;
        setSecondsLeft(secs);
        if (secs <= 0) clearTimer();
      }, 1000);
      timerRef.current = setTimeout(() => {
        clearTimer();
        const state = useGameStore.getState();
        if (hasAutoMove) {
          // Auto-Move (premium): play best available move instead of forfeiting
          const best = state.legalMoves[0];
          if (best) state.makeMove(best);
        } else {
          Alert.alert(
            'Time Up!',
            'Your turn was forfeited.\n\nTip: Unlock Auto-Move (₹49) to auto-play the best move instead.',
            [
              { text: 'OK' },
              { text: 'Unlock', onPress: onShop },
            ]
          );
          state.forfeitTurn();
        }
      }, 30000);
      return () => clearTimer();
    }
    clearTimer();
  }, [gameState?.currentPlayerIndex, gameState?.phase, gameState?.extraTurn, legalMoves.length]);

  const handlePawnPress = useCallback(
    (pawnId: number, playerIndex: number) => {
      if (!gameState) return;
      if (gameState.phase !== 'moving') return;
      if (playerIndex !== gameState.currentPlayerIndex) return;
      if (gameState.players[playerIndex].isAI) return;

      const movesForPawn = legalMoves.filter(m => m.pawnId === pawnId);
      if (movesForPawn.length === 1) {
        makeMove(movesForPawn[0]);
      } else if (movesForPawn.length > 1) {
        selectPawn(pawnId);
      }
    },
    [gameState, legalMoves, makeMove, selectPawn]
  );

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!gameState || selectedPawnId === null) return;
      const move = legalMoves.find(
        m =>
          m.pawnId === selectedPawnId &&
          moveTargetsCell(m, row, col, gameState.currentPlayerIndex)
      );
      if (move) makeMove(move);
    },
    [gameState, selectedPawnId, legalMoves, makeMove]
  );

  const handlePause = async () => {
    await saveCurrentGame();
    onPause();
  };

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const canRoll = gameState.phase === 'rolling' && !currentPlayer.isAI;
  const canUndo = gameState.canUndo && gameState.phase === 'moving' && !currentPlayer.isAI;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handlePause} style={styles.iconBtn}>
          <Text style={styles.iconText}>⏸</Text>
        </TouchableOpacity>
        <View style={styles.turnLabel}>
          <View style={styles.turnDot} />
          <Text style={styles.turnText}>
            {PLAYER_NAMES[currentPlayer.index]}'s Turn
            {currentPlayer.isAI ? ` (${currentPlayer.aiLevel} AI)` : ''}
          </Text>
        </View>
        <View style={styles.rightBtns}>
          {secondsLeft !== null && (
            <View style={[styles.timerBadge, secondsLeft <= 10 && styles.timerUrgent]}>
              <Text style={styles.timerText}>{secondsLeft}s</Text>
            </View>
          )}
          {canUndo ? (
            <TouchableOpacity onPress={undoMove} style={styles.iconBtn}>
              <Text style={styles.iconText}>↩</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>
      </View>

      {/* Player HUD */}
      <View style={styles.hudContainer}>
        <PlayerHUD
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
        />
      </View>

      {/* Board + treasury strips */}
      <View style={styles.boardContainer}>
        {/* Top strip — Green (index 2) treasury */}
        <TreasuryStrip players={gameState.players} playerIndex={2} horizontal />
        <View style={styles.boardRow}>
          {/* Left strip — Blue (index 1) treasury */}
          <TreasuryStrip players={gameState.players} playerIndex={1} horizontal={false} />
          <Board
            players={gameState.players}
            legalMoves={legalMoves}
            selectedPawnId={selectedPawnId}
            currentPlayerIndex={gameState.currentPlayerIndex}
            onCellPress={handleCellPress}
            onPawnPress={handlePawnPress}
          />
          {/* Right strip — Yellow (index 3) treasury */}
          <TreasuryStrip players={gameState.players} playerIndex={3} horizontal={false} />
        </View>
        {/* Bottom strip — Red (index 0) treasury */}
        <TreasuryStrip players={gameState.players} playerIndex={0} horizontal />
      </View>

      {/* Dice roller */}
      <View style={styles.diceArea}>
        <DiceRoller
          diceValue={gameState.diceValue}
          canRoll={canRoll}
          onRoll={rollDice}
          extraTurn={gameState.extraTurn}
        />
      </View>

      {/* Pending roll chips — tap to select which roll to play */}
      {gameState.pendingRolls.length > 0 && gameState.phase === 'moving' && !currentPlayer.isAI && (
        <View style={styles.rollChipsRow}>
          {gameState.pendingRolls.map((v, i) => {
            const isActive = i === 0; // after selectRoll, chosen roll is always at index 0
            return (
              <TouchableOpacity
                key={i}
                onPress={() => selectRoll(i)}
                style={[styles.rollChip, isActive && styles.rollChipActive]}
              >
                <Text style={[styles.rollChipText, isActive && styles.rollChipTextActive]}>
                  {ROLL_NAMES[v] ?? v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Rolling phase pending label */}
      {gameState.pendingRolls.length > 0 && gameState.phase === 'rolling' && (
        <View style={styles.accumulatedBar}>
          <Text style={styles.accumulatedText}>
            {gameState.pendingRolls.map(v => ROLL_NAMES[v] ?? v).join('  •  ')}  •  roll again!
          </Text>
        </View>
      )}

      {/* Status message */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {gameState.phase === 'rolling' && !currentPlayer.isAI && (gameState.pendingRolls.length > 0 ? 'Changa / Ashta! Roll again' : 'Tap the dice to roll')}
          {gameState.phase === 'rolling' && currentPlayer.isAI && 'AI is thinking...'}
          {gameState.phase === 'moving' && !currentPlayer.isAI && 'Tap a roll chip, then tap a pawn'}
          {gameState.phase === 'moving' && currentPlayer.isAI && 'AI is moving...'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

import { PLAYER_CONFIGS, OUTER_RING_LENGTH, OUTER_PATH_COORDS, PLAYER_INNER_PATH } from '../engine/BoardLayout';

// Treasury strip shows 4 finish boxes for a given player (filled = finished pawn)
function TreasuryStrip({
  players,
  playerIndex,
  horizontal,
}: {
  players: Player[];
  playerIndex: number;
  horizontal: boolean;
}) {
  const player = players.find(p => p.index === playerIndex);
  // Only render if this player is in the game
  if (!player) return null;
  const finishedCount = player.pawns.filter(p => p.state === 'finished').length;
  const color = PLAYER_COLORS[playerIndex];
  const BOX = 16;
  const GAP = 3;
  const containerStyle: any = horizontal
    ? { flexDirection: 'row', justifyContent: 'center', gap: GAP, paddingVertical: 4 }
    : { flexDirection: 'column', justifyContent: 'center', gap: GAP, paddingHorizontal: 4 };
  return (
    <View style={containerStyle}>
      {[0, 1, 2, 3].map(i => (
        <View
          key={i}
          style={{
            width: BOX,
            height: BOX,
            borderRadius: BOX / 2,
            borderWidth: 1.5,
            borderColor: color,
            backgroundColor: i < finishedCount ? color : 'transparent',
          }}
        />
      ))}
    </View>
  );
}

function moveTargetsCell(
  move: LegalMove,
  row: number,
  col: number,
  playerIndex: number
): boolean {
  if (move.toPathIndex < OUTER_RING_LENGTH) {
    const config = PLAYER_CONFIGS[playerIndex];
    const outerIdx = (config.outerPathStart + move.toPathIndex) % OUTER_RING_LENGTH;
    const coord = OUTER_PATH_COORDS[outerIdx];
    return coord.row === row && coord.col === col;
  }
  // Inner path
  const coord = PLAYER_INNER_PATH[playerIndex]?.[move.toPathIndex];
  return coord ? coord.row === row && coord.col === col : false;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  rightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timerBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  timerUrgent: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '22',
  },
  timerText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  iconText: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  turnLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  turnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  hudContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  boardContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diceArea: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statusBar: {
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  accumulatedBar: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  accumulatedText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rollChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  rollChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    backgroundColor: COLORS.surface,
  },
  rollChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.primary,
  },
  rollChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  rollChipTextActive: {
    color: COLORS.gold,
  },
});
