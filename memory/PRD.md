# Kawaii Sticker Trader — Full Handoff Document
_Last updated: June 2025 — respond in English only_

---

## 1. App Overview

A **client-only casual mobile game** built with React Native + Expo. The player collects cute animal stickers and trades them with a rule-based AI opponent named **"Neko"**. The aesthetic is "kawaii" — soft pastel colours, fluffy animal emojis, bubbly card borders.

**No backend. No server. No database.** All state lives in Zustand + AsyncStorage (localStorage on web preview).

---

## 2. Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | Expo SDK 54, Expo Router v4 (file-based routing) |
| Language | TypeScript |
| UI | React Native 0.81.5 |
| Animations | React Native Reanimated v4.1.7 (`newArchEnabled: true`) |
| Gradients | expo-linear-gradient |
| State | Zustand v4.5.2 + persist middleware |
| Persistence | @react-native-async-storage/async-storage (localStorage polyfill on web) |
| Fonts | Fredoka 700 (display), Nunito 400/600/700 via @expo-google-fonts |
| Audio | expo-audio (yay / aww / pop SFX) |
| Shadows | RN 0.76+ `boxShadow` CSS strings (shadow* props fully migrated) |

**CRITICAL babel note:** Do NOT add `react-native-worklets/plugin` to `babel.config.js`. `babel-preset-expo` in SDK 54 adds it automatically — duplicating it breaks Reanimated animations.

---

## 3. Project File Structure

```
app/frontend/
├── app/
│   ├── _layout.tsx          # Root layout: font loading + AudioProvider wrap
│   ├── index.tsx            # Home screen (kawaii landing page)
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar: Trade | Stickerdex | Skins
│       ├── trade.tsx        # ★ MAIN GAME SCREEN — 3D Dished Depth UI
│       ├── stickerdex.tsx   # Collection tracker
│       └── skins.tsx        # Paw skin equip screen
└── src/
    ├── audio/
    │   └── AudioContext.tsx  # Global audio context (expo-audio)
    ├── components/
    │   ├── StickerCard.tsx   # Reusable card component (4 sizes, locked/selected states)
    │   ├── UnlockCelebration.tsx  # Confetti burst on skin unlock
    │   ├── AIPawZone.tsx     # LEGACY (not used in trade.tsx, kept for reference)
    │   ├── TradeTableZone.tsx  # LEGACY (not used in trade.tsx, kept for reference)
    │   └── WillingnessBar.tsx  # LEGACY (not used in trade.tsx, inline version used instead)
    ├── constants/
    │   └── theme.ts          # COLORS, SPACING, RADII, SHADOWS, PAW_SKIN_EMOJIS
    ├── data/
    │   ├── stickers.ts       # 24 sticker definitions + RARITY_VALUES
    │   └── skins.ts          # 5 paw skin definitions + unlock conditions
    ├── store/
    │   └── gameStore.ts      # Zustand store with persist middleware
    └── utils/
        └── tradeEngine.ts    # Trade logic: willingness calc, AI offer gen, value calc
```

---

## 4. Screen Details

### Home Screen (`index.tsx`)
- Kawaii gradient background: pink → lavender → mint
- Floating animal emoji decorations (Reanimated looping float animation)
- Title: "Kawaii Sticker Trader 🐾"
- Button: "Start Trading!" (new player) / "Continue Trading!" (returning player)
- Shows returning player stats: trade count, stickers collected, % complete
- "Reset Game" option at bottom

### Trade Screen (`trade.tsx`) ★ MAIN SCREEN
**3D "Dished Depth" design** — the entire screen sits on a quilted pink/lavender diamond tile background. All zone containers use a `DishWell` component (LinearGradient recessed look). Action buttons are raised "pillows".

**4-Zone strict layout (top to bottom):**

**Zone 0: Header**
- Title pill: "🐾 Sticker Trader" (raised LinearGradient pill badge)
- Right side: `🔄 {tradeCount}` and `📖 {collectedIds.length}/24` counter badges
- Unlock toast appears here when a new skin is earned

**Zone 1: Willingness Bar (DishWell)**
- Label "💕 Willingness" + percentage
- Recessed track channel (inner LinearGradient dark→light→dark)
- Animated fill bar: colour interpolates pink→peach→mint→bright green
- Status label: "😒 No interest..." / "🙁 Not feeling it..." / "🤔 Hmm, maybe..." / "😊 Getting warmer!" / "✨ DEAL! Tap Accept!"
- At 100%: bouncing 🎊 emoji + glow pulse animation

**Zone 1B: AI Offer Tray (DishWell)**
- Neko paw emoji + pink name tag gradient pill
- **Raised speech bubble** (white LinearGradient pillow with border + drop shadow)
- AI's offered stickers float above the tray (StickerCard with `floating` prop)
- Value pill (rarity-coloured) showing ⭐ total value

**Zone 2: Player Offer Drop Zone (DishWell `deep=true`, `flex:1`)**
- Label "YOUR OFFER" (tracked with ⭐ value / required)
- Empty state: "✨ Tap cards below to build your bundle"
- Filled state: row of selected StickerCards (tap any card to remove it from offer)
- Border turns red-ish when cards are added

**Zone 3: Action Bar (3 raised pillow buttons)**
- **Reject** (rose-pink gradient `['#FFFFFF','#FFE0EA']`): clears round, calls `rejectTrade()`
- **Haggle** (lavender gradient `['#F2EEFF','#D8D4FF']`): adds extra AI card via `addAICard()`
- **Accept** (mint green `['#C0F5DC','#44BB7A']` when ready, pearl gray when not): calls `acceptTrade()`
  - Accept button pulses/scales when `willingnessLevel >= 100`

**Zone 4: Card Fan (raised fabric ledge)**
- Pink fabric surface with dark-to-light gradient overlay at top ledge
- Fanned UNO-style hand: cards spread at ±10° angles with slight Y offset for arc
- Equipped paw skin emoji + "Your Hand" label + card count pill
- Tapping a card adds it to the player offer zone (calls `addToPlayerOffer`)
- Already-offered cards dim to 32% opacity

### Stickerdex (`stickerdex.tsx`)
- Progress bar: N/24 stickers collected
- Filter chips: All / White Bears / Fluffy Pups / Kitties / Frogs
- 4-column grid of all 24 StickerCards
- Collected: full colour; Locked: greyed with 🔒 overlay
- Family section headers

### Skins (`skins.tsx`)
- 2-column grid of 5 paw skin cards
- Shows name, emoji, unlock condition
- Unlocked skins: tappable to equip; shows "Equipped" badge if active
- Locked skins: shows condition text and 🔒

---

## 5. Game Data

### 24 Stickers (6 per family, C/C/U/U/R/L rarity progression)

| Family | IDs | Rarities |
|---|---|---|
| White Bears 🐻 | wb_1 → wb_6 | C, C, U, U, R, L |
| Fluffy Pups 🐶 | fp_1 → fp_6 | C, C, U, U, R, L |
| Kitties 🐱 | kt_1 → kt_6 | C, C, U, U, R, L |
| Frogs 🐸 | fr_1 → fr_6 | C, C, U, U, R, L |

**Rarity point values:** Common=1, Uncommon=3, Rare=9, Legendary=27

### 5 Paw Skins

| ID | Emoji | Unlock Condition |
|---|---|---|
| pink | 🐾 | Default — always unlocked |
| golden | ⭐ | 5 trades completed |
| crystal | 💎 | Complete any full sticker family (all 6 of one family) |
| rainbow | 🌈 | 15 trades completed |
| galaxy | 🌟 | Collect all 4 Legendary stickers (wb_6, fp_6, kt_6, fr_6) |

---

## 6. Game Logic

### AI Offer Generation (`tradeEngine.ts`)
```
tradeCount 0–5   → offers Common stickers
tradeCount 6–11  → offers Uncommon
tradeCount 12–17 → offers Rare
tradeCount 18+   → offers Legendary
```
AI always prefers to offer stickers the player hasn't collected yet (discovery mechanic). If all stickers in tier are collected, picks randomly from that tier.

### Willingness Meter Formula
```
base     = (playerOfferValue / aiOfferValue) × 100
bonus    = +10  if any player sticker shares Family with AI's offered sticker
penalty  = −20  if single card offered AND playerValue < aiValue
final    = clamp(0, 100)
```

- Accept button is **disabled** until `willingnessLevel >= 100`
- The `Accept` button pulses green when ready

### Trade Resolution
- **Accept (success):** swaps inventories, increments `tradeCount`, updates `collectedIds`, checks all 4 skin unlock conditions, fires confetti if new skin unlocked, auto-advances to next round after 2s
- **Reject:** clears player offer, generates a new round after 2s
- **Haggle:** adds a random extra sticker to the AI's offer (willingnessLevel recalculates)
- **Safety net:** if inventory drops below 3 cards after a trade, 4 starter stickers are added

### Initial Inventory (New Player)
10 stickers: 2×wb_1, wb_2, 2×fp_1, fp_2, kt_1, kt_2, fr_1, fr_2

---

## 7. State Management (`gameStore.ts`)

**Persisted keys (AsyncStorage key: `kawaii-sticker-game-v1`):**
`initialized`, `tradeCount`, `inventory`, `collectedIds`, `unlockedSkinIds`, `equippedSkinId`

**NOT persisted (transient per session):**
`aiOffer`, `playerOffer`, `aiMessage`, `tradeStatus`, `willingnessLevel`, `newlyUnlockedSkinId`

**Key Actions:**
| Action | Description |
|---|---|
| `initGame()` | Full fresh start — sets initial 10-card inventory, first AI offer, resets all progress |
| `startNewRound()` | Generates new AI offer based on current tradeCount + collectedIds |
| `addToPlayerOffer(instance)` | Adds card to player bundle, recalculates willingness |
| `removeFromPlayerOffer(instanceId)` | Removes card from bundle, recalculates willingness |
| `acceptTrade()` | Executes trade, updates state, checks skin unlocks. Returns `boolean` |
| `rejectTrade()` | Clears player offer, sets rejected status |
| `addAICard()` | Adds random extra card to AI offer (Haggle), recalculates willingness |
| `equipSkin(skinId)` | Equips a skin if it's unlocked |
| `clearNewUnlock()` | Dismisses the confetti/toast (called 3.5s after unlock) |
| `resetGame()` | Alias for `initGame()` |

**Hydration pattern (IMPORTANT):**
The `trade.tsx` useEffect uses `useGameStore.persist.onFinishHydration()` + `hasHydrated()` guard. This prevents a race condition where `initGame()` would fire before AsyncStorage loads saved data. Always use this pattern when accessing persisted state on mount.

---

## 8. Component Reference

### `StickerCard`
```typescript
<StickerCard
  animalEmoji="🐻"
  scenarioEmoji="🫐"
  rarity="Common"          // 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
  size="sm"                // 'xs'(62px) | 'sm'(78px) | 'md'(94px) | 'lg'(112px)
  isSelected={false}       // shows pink border + ✓ badge
  isLocked={false}         // shows greyed + 🔒 overlay
  onPress={() => {}}       // optional; enables press-in scale animation
  floating={true}          // enables looping float animation (-5px)
  floatDelay={200}         // delay stagger for multiple floating cards
  testID="my-card"
/>
```

### `DishWell` (defined inline in trade.tsx)
Reusable recessed-well container component. Uses LinearGradient (dark-edges→light-centre) + thin inset shadow strips at top/bottom edge.
```typescript
<DishWell
  style={myExtraStyles}  // merged with outer shadow View
  deep={false}           // true = deeper/darker recessed look (player offer zone uses this)
  testID="my-zone"
>
  {children}
</DishWell>
```

### `UnlockCelebration`
```typescript
<UnlockCelebration skinId={newlyUnlockedSkinId} />
```
Full-screen absolute overlay (pointerEvents: 'none') that fires:
- 20 animated confetti pieces flying outward from centre
- A glowing ring pulse
- Auto-dismissed by parent via `clearNewUnlock()` after 3.5s

### `AudioContext`
```typescript
const { playYay, playAww, playPop } = useAudio();
// playYay() → "yay" sound (successful trade)
// playAww() → "aww" sound (reject)
// playPop() → "pop" sound (card flip / add to offer)
```
Files: `assets/sounds/yay.wav`, `aww.wav`, `pop.wav`

---

## 9. Styling System

### theme.ts constants
```typescript
COLORS.bgPrimary       // '#FFF5F8'
COLORS.primary         // '#FFB7B2' (soft pink)
COLORS.rarity.Common   // { bg, border, text, glow, gradient }
COLORS.families        // per-family pastel bg colours

SPACING   // { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 }
RADII     // { sm:12, md:20, lg:28, xl:36, pill:9999 }

SHADOWS.soft   // { boxShadow: '0 4px 10px rgba(255,183,178,0.22)', elevation: 6 }
SHADOWS.float  // { boxShadow: '0 8px 16px rgba(199,206,234,0.28)', elevation: 10 }
SHADOWS.card   // { boxShadow: '0 2px 8px rgba(0,0,0,0.08)', elevation: 4 }

PAW_SKIN_EMOJIS  // { pink:'🐾', golden:'⭐', crystal:'💎', rainbow:'🌈', galaxy:'🌟' }
```

### Shadow System
- All shadows use RN 0.76+ `boxShadow` CSS string format (deprecated `shadow*` props fully removed)
- `elevation` kept alongside for Android z-ordering
- Format: `'0 {offsetY}px {blurRadius}px rgba(r,g,b,opacity)'`

### Quilt Background (trade.tsx)
`QuiltBackground` is a `React.memo` component defined in `trade.tsx`. It renders a grid of ~350–450 diamond tiles (30×30px squares rotated 45°) in alternating pink `#FFD0EC` and lavender `#EDD0FF` with white `rgba(255,255,255,0.90)` 2px borders. Uses `useMemo` to pre-compute positions for performance.

---

## 10. Audio Setup

`AudioContext.tsx` wraps the entire app (loaded in `_layout.tsx`). It pre-loads three `expo-audio` sound objects and exposes `useAudio()` hook. Sounds are in `/assets/sounds/` directory.

---

## 11. Navigation

`app/(tabs)/_layout.tsx` sets up the bottom tab bar:
- **Trade** (🃏 icon) → `trade.tsx`
- **Stickerdex** (📖 icon) → `stickerdex.tsx`
- **Skins** (🐾 icon) → `skins.tsx`

Tab bar is styled with kawaii pastel colours and the active tint uses the player's equipped paw skin emoji.

---

## 12. TestIDs Reference (for testing agent)

| testID | Element |
|---|---|
| `trade-screen-header` | Header row on trade screen |
| `willingness-bar` | DishWell container for willingness bar |
| `ai-offer-zone` | DishWell container for AI's offered stickers |
| `ai-speech-bubble` | Animated speech bubble |
| `ai-cards-row` | Row of AI sticker cards |
| `ai-sticker-{id}` | Individual AI sticker card (e.g. `ai-sticker-wb_1`) |
| `player-offer-zone` | DishWell container for player's offer |
| `trade-drop-zone` | Empty state view inside player offer zone |
| `offer-remove-{instanceId}` | Pressable to remove card from offer |
| `offer-sticker-{instanceId}` | Sticker card in offer zone |
| `trade-action-bar` | Container for 3 action buttons |
| `trade-reject-button` | Reject TouchableOpacity |
| `trade-haggle-button` | Haggle TouchableOpacity |
| `trade-accept-button` | Accept TouchableOpacity |
| `card-fan-zone` | Bottom fan container |
| `fan-card-{instanceId}` | Individual card in the fan |
| `unlock-toast` | Yellow toast banner on skin unlock |
| `selected-badge-{testID}` | ✓ badge on selected StickerCard |

---

## 13. Completed Work (Full Session History)

### Phase 1 — MVP Core (Early sessions)
- [x] Project scaffold with Expo Router, Zustand, Reanimated
- [x] 24 sticker data definitions (`stickers.ts`)
- [x] 5 paw skin definitions (`skins.ts`)
- [x] Trade engine logic (`tradeEngine.ts`)
- [x] Zustand game store with full persist setup (`gameStore.ts`)
- [x] Home screen with kawaii animations
- [x] Trade screen (original 2D flat layout)
- [x] Stickerdex screen
- [x] Skins screen with equip mechanic
- [x] Fixed Reanimated blank-screen bug (duplicate worklets plugin in babel.config.js)

### Phase 2 — Gameplay Polish
- [x] Rewrote `trade.tsx` into strict 4-zone layout (top-to-bottom, no floating zones)
- [x] Multi-sticker bundling (player can tap multiple cards to bundle for one trade)
- [x] Multi-card AI offer via Haggle button (`addAICard`)
- [x] All 11/11 trade screen tests passed

### Phase 3 — Milestone Celebrations & Audio
- [x] `UnlockCelebration.tsx` — Reanimated confetti burst (20 pieces + ring pulse) on skin unlock
- [x] `AudioContext.tsx` + `expo-audio` — yay/aww/pop sound effects
- [x] Confetti fires correctly on skin unlock trigger

### Phase 4 — 3D "Dished Depth" UI Redesign (User-approved)
User explicitly requested and approved a "top-down 3D" visual style:
- [x] Soft pink/lavender diamond **QuiltBackground** (React.memo, ~400 tiles, useMemo positions)
- [x] **DishWell** reusable component — recessed tray using LinearGradient (dark-edges→light-centre) + inset shadow strips
- [x] **Raised pillow buttons** — LinearGradient gradient for 3 action buttons
- [x] **AI speech bubble** — raised white pillow with tail, border, drop shadow
- [x] **Card Fan ledge** — raised fabric surface with dark-to-light gradient overlay
- [x] All 10/10 visual + functional tests passed

### Phase 5 — Persistence & Shadow Cleanup (Latest)
- [x] **Hydration race condition fixed**: Replaced `useEffect([initialized])` with `useGameStore.persist.onFinishHydration()` + `hasHydrated()` guard. Progress (tradeCount, inventory, collectedIds, skins) now correctly survives app reloads.
- [x] **`boxShadow` migration**: All `shadow*` prop groups removed from `trade.tsx` (11 instances) and `theme.ts` SHADOWS (3 constants). Now use RN 0.76+ CSS `boxShadow` strings. Zero deprecated shadow warnings in console.
- [x] All 7/7 persistence + shadow tests passed

---

## 14. Known Issues / Tech Notes

- **Web preview load time**: ~12 seconds due to large JS bundle (6.81MB). Use `waitForLoadState('networkidle')` + extra delay in automated tests before interacting.
- **Legacy components** (`AIPawZone.tsx`, `TradeTableZone.tsx`, `WillingnessBar.tsx`): These are NOT imported in `trade.tsx` and are unused. They were from an earlier architecture. Keep them or delete them — they have no functional impact.
- `pointerEvents` as a style prop (not component prop) is the correct approach for RN 0.76+ — `pointerEvents: 'none'` in `StyleSheet.create()` is correct and used throughout.
- `babel.config.js` must NOT include `react-native-worklets/plugin` (SDK 54 adds it automatically).

---

## 15. Pending / Future Tasks

### P2 — Sticker Catalog Expansion
Add more sticker families, scenarios, and rarities to `stickers.ts`. Currently 24 stickers (4 families × 6 each). User wants more content once core UI is polished.

### P3 — Persist current `aiOffer` (optional)
Currently `aiOffer` is regenerated fresh on each reload (not persisted). Could persist it so the exact mid-session offer is restored. Low priority.

### P3 — Sticker Catalog Expansion
- Add seasonal variant stickers
- Add more animal families
- Add special event stickers

### Refactoring Opportunities (Low Priority)
- Delete unused legacy components: `AIPawZone.tsx`, `TradeTableZone.tsx`, `WillingnessBar.tsx`
- Move inline `DishWell` component from `trade.tsx` to `src/components/DishWell.tsx` for reuse in other screens
- Move inline `QuiltBackground` component to `src/components/QuiltBackground.tsx`

---

## 16. Environment & Running

- Frontend dev server: Expo Metro bundler on port 3000
- Backend: FastAPI on port 8001 (UNUSED — this is a client-only game)
- MongoDB: running locally (UNUSED)
- Web preview: `http://localhost:3000`
- Expo Go QR: shown in terminal for native device testing

**Service commands:**
```bash
sudo supervisorctl restart expo    # restart frontend
sudo supervisorctl restart backend # restart backend (not needed for this app)
```

**Env vars (DO NOT MODIFY):**
- `frontend/.env`: `EXPO_PACKAGER_PROXY_URL`, `EXPO_PACKAGER_HOSTNAME`

---

## 17. User Communication Style Notes

- User communicates in English
- User approves mockups/previews before full implementation ("Yes. Lets try it. Proceed.")
- User prefers concise responses, not verbose explanations
- User asks for short plan confirmations before major changes
- For visual changes, user wants to see a preview first when possible
