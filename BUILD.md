# Changa Pe — Build Instructions

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For Android: Android Studio + Android SDK
- For iOS (Mac only): Xcode 14+
- Expo Go app on your device (for quick testing)

## Development

### Install dependencies
```bash
npm install
```

### Start development server
```bash
npx expo start
```
Scan the QR code with Expo Go on your phone.

### Run on Android emulator
```bash
npx expo run:android
```

### Run on iOS simulator (Mac only)
```bash
npx expo run:ios
```

## Production Build

### Android APK (EAS Build)
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### Android AAB (Play Store)
```bash
eas build --platform android --profile production
```

### iOS (App Store)
```bash
eas build --platform ios --profile production
```

## Project Structure

```
ChangaPe/
├── App.tsx                     # Root navigator (screen state machine)
├── src/
│   ├── engine/
│   │   ├── BoardLayout.ts      # 5×5 board paths, safe squares, dice
│   │   ├── GameEngine.ts       # All game rules, move validation, turn logic
│   │   └── AIPlayer.ts         # Easy/Medium/Hard AI
│   ├── store/
│   │   ├── gameStore.ts        # Zustand game state + AI orchestration
│   │   └── settingsStore.ts    # Settings + statistics persistence
│   ├── screens/                # All 11 screens from spec
│   ├── components/             # Board, PawnToken, DiceRoller, PlayerHUD
│   └── utils/
│       ├── storage.ts          # AsyncStorage wrappers
│       └── theme.ts            # Traditional Indian color palette
└── babel.config.js             # Reanimated plugin
```

## Key Design Decisions

- **Framework**: Expo (React Native) — cross-platform, offline-first, great animation support
- **State**: Zustand — lightweight, no boilerplate, works perfectly for game state
- **Storage**: AsyncStorage — local only, no backend, no login
- **Board rendering**: Pure React Native (View/StyleSheet) — no game engine needed for a board game
- **Animations**: React Native Animated API — pawn selection pulse, dice shake

## Rule Implementation Notes

- Cowry dice probabilities: 1≈25%, 2≈37.5%, 3≈25%, 4≈6.25%, 8≈6.25%
- Path: 16 outer squares (counter-clockwise) → inner path → center (pos 20)
- Each player's outer path starts at their assigned corner
- Captures detected by mapping player-relative path index to absolute outer ring index
- Inner path squares are player-specific (no captures there)
- Safe squares: outer corners (indices 0,4,8,12) and center
