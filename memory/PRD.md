# Kawaii Sticker Trader — PRD

## Original Problem Statement
A 2D casual mobile game built with React Native + Expo. Players collect cute animal stickers 
(White Bears, Fluffy Pups, Kitties, Frogs) in cozy food scenarios and trade them with an AI opponent ("Neko") 
based on rarity and value. Kawaii/pastel aesthetic throughout.

## Architecture & Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Navigation | Expo Router (file-based) | Modern, type-safe, tab-aware |
| State | Zustand v4 + AsyncStorage persist | Lightweight, persisted local state |
| Animations | react-native-reanimated 4.x | 60fps spring/repeat animations |
| Fonts | @expo-google-fonts/fredoka + nunito | Kawaii rounded typography |
| Gradients | expo-linear-gradient | Rarity card backgrounds |

## Folder Structure
```
frontend/
├── app/
│   ├── _layout.tsx           ← Font loading, SafeArea, GestureHandler root
│   ├── index.tsx             ← Home/splash screen
│   └── (tabs)/
│       ├── _layout.tsx       ← Tab navigator (Trade / Stickerdex / Skins)
│       ├── trade.tsx         ← Main game screen
│       ├── stickerdex.tsx    ← Collection book
│       └── skins.tsx         ← Paw skin cosmetics
└── src/
    ├── constants/theme.ts    ← Design tokens (colors, spacing, radii, shadows)
    ├── data/stickers.ts      ← 24 sticker definitions + StickerDef/StickerInstance types
    ├── data/skins.ts         ← 5 paw skin definitions
    ├── store/gameStore.ts    ← Zustand store (all game state + actions)
    ├── utils/tradeEngine.ts  ← Trade math: calcValue, generateAIOffer, computeWillingness
    └── components/
        ├── StickerCard.tsx       ← Bubbly sticker card (all sizes, locked/selected states)
        ├── RarityBadge.tsx       ← Rarity pill badge
        ├── AIPawZone.tsx         ← AI section (paw animation + speech bubble + WillingnessBar)
        ├── WillingnessBar.tsx    ← Animated haggle meter (0–100%, color transitions)
        ├── TradeTableZone.tsx    ← Trade table (AI side + player bundle + accept/reject)
        └── InventoryScroll.tsx   ← Horizontal inventory with [+] add-to-trade buttons
```

## Core Game Data
- **24 Stickers**: 4 families × 6 rarities (2 Common, 2 Uncommon, 1 Rare, 1 Legendary)
- **Rarity Values**: Common=1, Uncommon=3, Rare=9, Legendary=27
- **AI Scaling**: Trades 0–5=Common, 6–11=Uncommon, 12–17=Rare, 18+=Legendary

## Willingness Meter Math
```
base     = (playerOfferValue / aiOfferValue) × 100
bonus    = +10 if any player sticker shares Family with AI's sticker  
penalty  = −20 if player offers exactly 1 card AND playerValue < aiValue
final    = clamp(0, 100, base + bonus − penalty)
ACCEPT   = only enabled when final ≥ 100
```

## Paw Skin Unlock Conditions
| Skin | Condition |
|---|---|
| Pink Paw | Default (always unlocked) |
| Golden Paw | Complete 5 trades |
| Crystal Paw | Complete any full sticker family |
| Rainbow Paw | Complete 15 trades |
| Galaxy Paw | Collect all 4 Legendary stickers |

## What's Been Implemented (as of 2026-06-06)
- ✅ Full game loop: AI offer → player bundles stickers → willingness meter → accept/reject
- ✅ Animated WillingnessBar with colour interpolation (pink→peach→mint→green)
- ✅ Multi-sticker bundling: player can add N stickers to match high-value AI offers
- ✅ StickerCard component with bubbly white border + rarity gradient backgrounds
- ✅ AIPawZone with spring paw animation + speech bubble
- ✅ Inventory horizontal scroll with [+] / [✓] per-sticker add/remove buttons
- ✅ Stickerdex collection grid with family filter chips + locked silhouettes
- ✅ Paw skin unlock & equip system
- ✅ AsyncStorage persistence (trade count, inventory, collected IDs, unlocked skins)
- ✅ Family completion + trade milestone unlock detection
- ✅ Kawaii home screen with Fredoka/Nunito fonts + floating emoji decorations
- ✅ zustand ESM fix (patched package.json to remove .mjs import conditions)

## Known Issues / Non-blocking
- `shadow*` style props produce web deprecation warnings (→ should use `boxShadow`)
- `props.pointerEvents` deprecation (→ should use `style.pointerEvents`)

## Prioritized Backlog
### P0 — Next session
- [ ] Fix shadow* → boxShadow for web
- [ ] Add sticker detail view on tap in Stickerdex (scenario text + rarity info)

### P1 — Phase 2
- [ ] Haptic feedback on trade accept/reject (expo-haptics)
- [ ] Particle/confetti effect on legendary sticker trade
- [ ] "Pack opening" daily bonus mechanic (give player 3 random Commons/day)
- [ ] AI personality dialogue expansion (more messages per rarity tier)

### P2 — Phase 3
- [ ] Backend + user accounts (save progress across devices)
- [ ] Real illustrated sticker art (replace emoji with actual kawaii illustrations)
- [ ] Sound effects (cute SFX for trade accept, reject, unlock)
- [ ] Leaderboard (most trades, most legendaries collected)
