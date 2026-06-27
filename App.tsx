import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGameStore, SetupPlayer } from './src/store/gameStore';
import { useSettingsStore } from './src/store/settingsStore';
import { GameRules } from './src/engine/GameEngine';
import { COLORS } from './src/utils/theme';

import HomeScreen from './src/screens/HomeScreen';
import GameSetupScreen from './src/screens/GameSetupScreen';
import BoardScreen from './src/screens/BoardScreen';
import PauseScreen from './src/screens/PauseScreen';
import VictoryScreen from './src/screens/VictoryScreen';
import RulesScreen from './src/screens/RulesScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';

type Screen =
  | 'home'
  | 'setup'
  | 'board'
  | 'rules'
  | 'statistics'
  | 'settings'
  | 'about'
  | 'victory';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [pauseVisible, setPauseVisible] = useState(false);
  const [victoryWinner, setVictoryWinner] = useState<number | null>(null);
  const [lastSetup, setLastSetup] = useState<{
    numPlayers: 2 | 3 | 4;
    players: SetupPlayer[];
    rules: GameRules;
  } | null>(null);

  const { gameState, hasSavedGame, startGame, loadGame, resetGame, checkSavedGame } = useGameStore();
  const { loadAll, recordGameResult } = useSettingsStore();

  useEffect(() => {
    loadAll();
    checkSavedGame();
  }, []);

  const handleResumeGame = async () => {
    const ok = await loadGame();
    if (ok) setScreen('board');
  };

  const handleStartGame = (numPlayers: 2 | 3 | 4, players: SetupPlayer[], rules: GameRules) => {
    setLastSetup({ numPlayers, players, rules });
    startGame(numPlayers, players, rules);
    setScreen('board');
  };

  const handleVictory = (winnerIndex: number) => {
    setVictoryWinner(winnerIndex);
    const hasAI = gameState?.players.some(p => p.isAI) ?? false;
    const humanPlayer = gameState?.players.find(p => !p.isAI);
    const humanWon = humanPlayer?.index === winnerIndex;
    const captures = humanPlayer?.captureCount ?? 0;
    recordGameResult(humanWon, captures, hasAI);
    setScreen('victory');
  };

  const handlePlayAgain = () => {
    if (lastSetup) {
      startGame(lastSetup.numPlayers, lastSetup.players, lastSetup.rules);
      setScreen('board');
    } else {
      setScreen('setup');
    }
  };

  const goHome = () => {
    resetGame();
    setScreen('home');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            hasSavedGame={hasSavedGame}
            onNewGame={() => setScreen('setup')}
            onResumeGame={handleResumeGame}
            onRules={() => setScreen('rules')}
            onStatistics={() => setScreen('statistics')}
            onSettings={() => setScreen('settings')}
            onAbout={() => setScreen('about')}
          />
        );

      case 'setup':
        return (
          <GameSetupScreen
            onStart={handleStartGame}
            onBack={() => setScreen('home')}
          />
        );

      case 'board':
        return (
          <>
            <BoardScreen onPause={() => setPauseVisible(true)} onVictory={handleVictory} />
            <PauseScreen
              visible={pauseVisible}
              onResume={() => setPauseVisible(false)}
              onQuit={() => { setPauseVisible(false); goHome(); }}
              onRules={() => { setPauseVisible(false); setScreen('rules'); }}
              onSettings={() => { setPauseVisible(false); setScreen('settings'); }}
            />
          </>
        );

      case 'victory':
        if (!gameState || victoryWinner === null) return null;
        return (
          <VictoryScreen
            gameState={gameState}
            winnerIndex={victoryWinner}
            onPlayAgain={handlePlayAgain}
            onNewGame={() => setScreen('setup')}
            onHome={goHome}
          />
        );

      case 'rules':
        return <RulesScreen onBack={() => setScreen(pauseVisible ? 'board' : 'home')} />;

      case 'statistics':
        return <StatisticsScreen onBack={() => setScreen('home')} />;

      case 'settings':
        return <SettingsScreen onBack={() => setScreen(pauseVisible ? 'board' : 'home')} />;

      case 'about':
        return <AboutScreen onBack={() => setScreen('home')} />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.root}>{renderScreen()}</View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
