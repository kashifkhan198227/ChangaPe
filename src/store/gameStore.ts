import { create } from 'zustand';
import {
  GameState,
  createInitialGameState,
  performRoll,
  applyMove,
  undoLastMove,
  skipTurn,
  LegalMove,
  computeLegalMoves,
  GameRules,
  DEFAULT_RULES,
} from '../engine/GameEngine';
import { getAIMove } from '../engine/AIPlayer';
import { saveGame, loadSavedGame, clearSavedGame } from '../utils/storage';

export type SetupPlayer = {
  index: number;
  type: 'human' | 'easy' | 'medium' | 'hard' | 'none';
};

interface GameStore {
  gameState: GameState | null;
  selectedPawnId: number | null;
  legalMoves: LegalMove[];
  isAnimating: boolean;
  hasSavedGame: boolean;
  activeRollIndex: number;
  _aiTimeouts: ReturnType<typeof setTimeout>[]; // BUG-6: track for cancellation

  // Actions
  cancelAI: () => void; // BUG-6: cancel all pending AI timeouts
  startGame: (numPlayers: 2 | 3 | 4, players: SetupPlayer[], rules?: GameRules) => void;
  rollDice: () => void;
  selectPawn: (pawnId: number) => void;
  selectRoll: (index: number) => void;
  makeMove: (move: LegalMove) => void;
  undoMove: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  saveCurrentGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  resetGame: () => void;
  forfeitTurn: () => void;
  triggerAIMove: () => void;
  setAnimating: (val: boolean) => void;
  checkSavedGame: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  selectedPawnId: null,
  legalMoves: [],
  isAnimating: false,
  hasSavedGame: false,
  activeRollIndex: 0,
  _aiTimeouts: [],

  cancelAI: () => {
    get()._aiTimeouts.forEach(id => clearTimeout(id));
    set({ _aiTimeouts: [], isAnimating: false });
  },

  startGame: (numPlayers, players, rules = DEFAULT_RULES) => {
    const aiMap: Record<number, 'easy' | 'medium' | 'hard' | 'human'> = {};
    players.forEach(p => {
      if (p.type === 'none') return;
      aiMap[p.index] = p.type === 'human' ? 'human' : p.type;
    });

    const state = createInitialGameState(numPlayers, aiMap, rules);
    set({ gameState: state, selectedPawnId: null, legalMoves: [] });
  },

  rollDice: () => {
    const { gameState, isAnimating } = get();
    if (!gameState || isAnimating) return;
    if (gameState.phase !== 'rolling') return;

    const newState = performRoll(gameState);
    const legal = newState.phase === 'moving' ? computeLegalMoves(newState) : [];
    set({ gameState: newState, legalMoves: legal, selectedPawnId: null, activeRollIndex: 0 });
  },

  selectPawn: (pawnId: number) => {
    const { legalMoves } = get();
    const movesForPawn = legalMoves.filter(m => m.pawnId === pawnId);
    if (movesForPawn.length === 0) return;
    set({ selectedPawnId: pawnId });
  },

  selectRoll: (index: number) => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'moving') return;
    const rolls = gameState.pendingRolls;
    if (index < 0 || index >= rolls.length) return;

    // Swap selected roll to front so computeLegalMoves uses it
    const reordered = [...rolls];
    [reordered[0], reordered[index]] = [reordered[index], reordered[0]];
    const newState = { ...gameState, pendingRolls: reordered };
    const legal = computeLegalMoves({ ...newState, phase: 'moving' });
    set({ gameState: newState, legalMoves: legal, selectedPawnId: null, activeRollIndex: 0 });
  },

  makeMove: (move: LegalMove) => {
    const { gameState, isAnimating } = get();
    if (!gameState || isAnimating) return;

    const newState = applyMove(gameState, move);
    const legal = newState.phase === 'moving' ? computeLegalMoves(newState) : [];
    set({ gameState: newState, legalMoves: legal, selectedPawnId: null, activeRollIndex: 0 });
  },

  undoMove: () => {
    const { gameState } = get();
    if (!gameState) return;
    const newState = undoLastMove(gameState);
    if (!newState) return;
    const legal = newState.phase === 'moving' ? computeLegalMoves(newState) : [];
    set({ gameState: newState, legalMoves: legal, selectedPawnId: null });
  },

  pauseGame: () => {
    // State persists; navigation handles the pause screen
  },

  resumeGame: () => {
    // Resume from saved or current state
  },

  saveCurrentGame: async () => {
    const { gameState } = get();
    if (!gameState) return;
    await saveGame(gameState);
    set({ hasSavedGame: true });
  },

  loadGame: async () => {
    const saved = await loadSavedGame();
    if (!saved) return false;
    const state = saved as GameState;
    const legal = state.phase === 'moving' ? computeLegalMoves(state) : [];
    set({ gameState: state, legalMoves: legal, selectedPawnId: null });
    return true;
  },

  resetGame: () => {
    set({ gameState: null, selectedPawnId: null, legalMoves: [], isAnimating: false, activeRollIndex: 0 });
    clearSavedGame();
  },

  forfeitTurn: () => {
    const { gameState } = get();
    if (!gameState) return;
    const newState = skipTurn(gameState); // BUG-2: use engine's skipTurn
    set({ gameState: newState, legalMoves: [], selectedPawnId: null });
  },

  triggerAIMove: () => {
    const { gameState, isAnimating } = get();
    if (!gameState || isAnimating) return;
    if (gameState.phase === 'gameover') return;

    const currentPlayer = gameState.players.find(p => p.index === gameState.currentPlayerIndex)!;
    if (!currentPlayer.isAI) return;

    set({ isAnimating: true });

    const scheduleAI = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      set(s => ({ _aiTimeouts: [...s._aiTimeouts, id] }));
    };

    if (gameState.phase === 'rolling') {
      scheduleAI(() => {
        const state = get().gameState;
        if (!state || state.phase === 'gameover') { set({ isAnimating: false }); return; }
        const rolled = performRoll(state);
        const legal = rolled.phase === 'moving' ? computeLegalMoves(rolled) : [];
        set(s => ({ gameState: rolled, legalMoves: legal, isAnimating: false, _aiTimeouts: s._aiTimeouts.slice(1) }));

        const nextPlayer = rolled.players.find(p => p.index === rolled.currentPlayerIndex)!;
        if (nextPlayer.isAI && rolled.phase !== 'gameover') {
          scheduleAI(() => get().triggerAIMove(), 900);
        }
      }, 900);

    } else if (gameState.phase === 'moving') {
      const move = getAIMove(gameState, currentPlayer.aiLevel);
      if (!move) { set({ isAnimating: false }); return; }

      scheduleAI(() => {
        const state = get().gameState;
        if (!state || state.phase === 'gameover') { set({ isAnimating: false }); return; }
        const newState = applyMove(state, move);
        const legal = newState.phase === 'moving' ? computeLegalMoves(newState) : [];
        set(s => ({ gameState: newState, legalMoves: legal, selectedPawnId: null, isAnimating: false, _aiTimeouts: s._aiTimeouts.slice(1) }));

        const nextPlayer = newState.players.find(p => p.index === newState.currentPlayerIndex)!;
        if (nextPlayer.isAI && newState.phase !== 'gameover') {
          scheduleAI(() => get().triggerAIMove(), 900);
        }
      }, 900);
    } else {
      set({ isAnimating: false });
    }
  },

  setAnimating: (val) => set({ isAnimating: val }),

  checkSavedGame: async () => {
    const saved = await loadSavedGame();
    set({ hasSavedGame: !!saved });
  },
}));
