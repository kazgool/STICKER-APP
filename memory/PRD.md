# Kawaii Sticker Trader — Product Requirements Document

## Overview
A 2D casual mobile game built with React Native + Expo where players collect cute animal stickers and trade them with a rule-based AI opponent named "Neko". The vibe is "kawaii" — soft pastel colors, fluffy animals, bubbly card borders.

---

## Tech Stack
- **Frontend**: React Native, Expo Router (file-based routing), Expo SDK 54
- **Animations**: React Native Reanimated v4.1.7 (with `newArchEnabled: true`)
- **State**: Zustand v4.5.2 with Zustand persist middleware + AsyncStorage
- **Fonts**: Fredoka (display), Nunito (body) via @expo-google-fonts
- **No Backend**: Client-only, rule-based AI logic

---

## Core Screens

### 1. Home Screen (`app/index.tsx`)
- Kawaii gradient background (pink → lavender → mint)
- Floating animal emoji decorations (animated via Reanimated)
- Title: "Kawaii Sticker Trader"
- "Start Trading!" / "Continue Trading!" button
- Returns player stats (trade count, stickers collected, % complete) for returning players
- Reset game option

### 2. Trade Screen (`app/(tabs)/trade.tsx`)
Main gameplay loop:
- **AI Paw Zone**: Shows "Neko" paw icon, animated speech bubble, offered sticker card with rarity-colored value pill
- **Willingness Bar**: Animated 0→100 bar with colour gradient (pink → mint → bright green at 100%)
- **Trade Table**: Split view showing AI's offer vs player's staged bundle with Accept/Reject buttons
- **Inventory Scroll**: Horizontal strip of all player stickers, each with a "+" toggle button

### 3. Stickerdex (`app/(tabs)/stickerdex.tsx`)
Collection tracker:
- Progress bar (N/24 collected)
- Family filter chips: All / White Bears / Fluffy Pups / Kitties / Frogs
- 4-column grid showing all 24 stickers; locked stickers greyed with lock overlay

### 4. Skins (`app/(tabs)/skins.tsx`)
Cosmetic reward system:
- 2-column grid of 5 paw skin cards
- Tap to equip unlocked skins; locked skins show unlock condition

---

## Game Data (`src/data/stickers.ts`)

### 24 Stickers across 4 Families × 6 per family (C/C/U/U/R/L)
| ID | Family | Scenario | Rarity |
|----|--------|----------|--------|
| wb_1..wb_6 | White Bears | Blueberry → Cream Puff Cloud | C C U U R L |
| fp_1..fp_6 | Fluffy Pups | Donut → Rainbow Pancake | C C U U R L |
| kt_1..kt_6 | Kitties | Teacup → Star Cake | C C U U R L |
| fr_1..fr_6 | Frogs | Mushroom → Boba Cup | C C U U R L |

### Rarity Values
- Common = 1
- Uncommon = 3
- Rare = 9
- Legendary = 27

---

## AI Willingness Meter (`src/utils/tradeEngine.ts`)

```
base     = (playerOfferValue / aiOfferValue) × 100
bonus    = +10% if any player sticker shares family with AI's sticker
penalty  = −20% if single card offered AND playerValue < aiValue
final    = clamp(0, 100)
```

- **Accept button** is DISABLED unless willingness >= 100
- Labels: "No interest..." / "Not feeling it..." / "Hmm, maybe..." / "Getting warmer!" / "DEAL!"

---

## Paw Skins (`src/data/skins.ts`)

| ID | Name | Emoji | Unlock Condition |
|----|------|-------|-----------------|
| pink | Pink Paw | Paw | Default (always unlocked) |
| golden | Golden Paw | Star | 5 trades completed |
| crystal | Crystal Paw | Gem | Complete any full sticker family |
| rainbow | Rainbow Paw | Rainbow | 15 trades completed |
| galaxy | Galaxy Paw | Star2 | Collect all 4 Legendary stickers |

---

## State Management (`src/store/gameStore.ts`)
Persisted keys: `initialized`, `tradeCount`, `inventory`, `collectedIds`, `unlockedSkinIds`, `equippedSkinId`

Key actions: `initGame`, `startNewRound`, `addToPlayerOffer`, `removeFromPlayerOffer`, `acceptTrade`, `rejectTrade`, `equipSkin`, `clearNewUnlock`, `resetGame`

---

## Progression Design
- Round 1-5: AI offers Common stickers only
- Round 6-11: AI offers Uncommon stickers
- Round 12-17: AI offers Rare stickers
- Round 18+: AI offers Legendary stickers
- AI always offers uncollected stickers first (discovery mechanic)
- If inventory runs low after trade, guaranteed extras are added

---

## Current Status (v1.0 - MVP)
All core features implemented and tested:
- Home screen with kawaii animations
- Trade screen with all 3 zones (AI zone, Trade Table, Inventory Scroll)
- Willingness meter with math rules
- Multi-sticker bundling
- Accept/Reject trade with state update
- Stickerdex collection tracker
- Paw skins with unlock logic
- Local persistence (Zustand + AsyncStorage)
- Reanimated v4 animations throughout

---

## Backlog / Future Features
- P1: Unlock animation for new paw skins (celebratory particle effect)
- P2: expo-audio integration for sound effects (accept/reject/card flip)
- P2: Expand sticker catalog (more families, seasonal variants)
- P3: Persistent high score / milestone achievements tracker

---

## Known Issues / Tech Notes
- Web preview requires ~12 seconds to load due to large JS bundle (6.81 MB)
- babel-preset-expo in SDK 54 auto-adds react-native-worklets/plugin -- do NOT add manually
- Console deprecation warnings (non-blocking): shadow props and pointerEvents
