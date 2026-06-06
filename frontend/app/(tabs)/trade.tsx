import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useGameStore } from '../../src/store/gameStore';
import { StickerCard } from '../../src/components/StickerCard';
import { PAW_SKIN_EMOJIS, COLORS, SPACING, RADII, SHADOWS } from '../../src/constants/theme';
import { StickerInstance, StickerDef, RARITY_VALUES } from '../../src/data/stickers';
import { useAudio } from '../../src/audio/AudioContext';
import { UnlockCelebration } from '../../src/components/UnlockCelebration';

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 1  Willingness Bar  — 90 % width, centred, full Reanimated fills
// ─────────────────────────────────────────────────────────────────────────────
const WillingnessBarInline: React.FC<{ level: number }> = ({ level }) => {
  const animFlex   = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pawBounce  = useSharedValue(0);

  useEffect(() => {
    const target = Math.min(level, 100) / 100;
    animFlex.value = withSpring(target, { damping: 14, stiffness: 80 });

    if (level >= 100) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.5, { duration: 350 }), withTiming(0, { duration: 350 })),
        -1, true,
      );
      pawBounce.value = withRepeat(
        withSequence(withTiming(-4, { duration: 180 }), withTiming(0, { duration: 180 })),
        3, false,
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
      pawBounce.value   = withTiming(0, { duration: 200 });
    }
  }, [level]);

  const barAnim = useAnimatedStyle(() => ({
    flex: animFlex.value,
    backgroundColor: interpolateColor(
      animFlex.value,
      [0, 0.30, 0.65, 1.0],
      ['#FF9AA2', '#FFDAC1', '#B5EAD7', '#52C788'],
    ),
  }));
  const glowAnim = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const pawAnim  = useAnimatedStyle(() => ({ transform: [{ translateY: pawBounce.value }] }));

  const pct   = Math.round(Math.min(level, 100));
  const label =
    level <= 0   ? '😒 No interest...'    :
    level < 40   ? '🙁 Not feeling it...' :
    level < 70   ? '🤔 Hmm, maybe...'     :
    level < 100  ? '😊 Getting warmer!'   :
                   '✨ DEAL! Tap Accept!';
  const labelColor =
    level >= 100 ? '#2E7D32' :
    level >= 70  ? '#C07800' :
    level >= 40  ? '#B06020' : '#B03030';

  return (
    <View style={wb.container} testID="willingness-bar">
      <View style={wb.headerRow}>
        <Text style={wb.label}>💕 Willingness</Text>
        <Text style={[wb.pct, { color: labelColor }]}>{pct}%{level >= 100 ? ' 🎉' : ''}</Text>
      </View>

      <View style={wb.track}>
        <Animated.View style={[wb.fill, barAnim]} />
        <Animated.View style={[StyleSheet.absoluteFill, wb.glow, glowAnim]} />
      </View>

      <View style={wb.statusRow}>
        <Text style={[wb.status, { color: labelColor }]}>{label}</Text>
        <Animated.View style={pawAnim}>
          <Text style={wb.pawIcon}>{level >= 100 ? '🎊' : '🐾'}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const wb = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label:      { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, fontFamily: 'Nunito_700Bold' },
  pct:        { fontSize: 12, fontWeight: '800', fontFamily: 'Nunito_700Bold' },
  track:      { height: 12, backgroundColor: '#EEE', borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  fill:       { height: '100%', borderRadius: 6, minWidth: 6 },
  glow:       { backgroundColor: '#FFFFFF', borderRadius: 6 },
  statusRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  status:     { fontSize: 10, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
  pawIcon:    { fontSize: 14 },
});


// ─────────────────────────────────────────────────────────────────────────────
// ZONE 1B  AI Offer  — speech bubble + Neko's stickers
// ─────────────────────────────────────────────────────────────────────────────
const AIOfferZone: React.FC<{
  aiOffer:   StickerDef[];
  aiMessage: string;
}> = ({ aiOffer, aiMessage }) => {
  const bubbleScale = useSharedValue(0);
  const cardsSlide  = useSharedValue(-16);

  useEffect(() => {
    bubbleScale.value = 0;
    bubbleScale.value = withSpring(1, { damping: 13, stiffness: 120 });
    cardsSlide.value  = -16;
    cardsSlide.value  = withSpring(0, { damping: 12, stiffness: 100 });
  }, [aiOffer.length, aiMessage]);

  const bubbleAnim = useAnimatedStyle(() => ({ transform: [{ scale: bubbleScale.value }] }));
  const cardsAnim  = useAnimatedStyle(() => ({ transform: [{ translateY: cardsSlide.value }] }));

  const aiValue   = aiOffer.reduce((s, sk) => s + RARITY_VALUES[sk.rarity], 0);
  const topRarity = aiOffer.length > 0 ? aiOffer[0].rarity : 'Common';
  const rc        = COLORS.rarity[topRarity];

  return (
    <View style={aiS.container} testID="ai-offer-zone">

      {/* Paw + speech bubble */}
      <View style={aiS.topRow}>
        <View style={aiS.pawBlock}>
          <Text style={aiS.pawEmoji}>🐾</Text>
          <View style={aiS.nameTag}><Text style={aiS.nameText}>✨ Neko</Text></View>
        </View>

        <Animated.View style={[aiS.bubble, bubbleAnim]} testID="ai-speech-bubble">
          <View style={aiS.bubbleTail} />
          <Text style={aiS.bubbleText} numberOfLines={2}>{aiMessage}</Text>
        </Animated.View>
      </View>

      {/* AI's offered stickers */}
      <Animated.View style={[aiS.cardsRow, cardsAnim]} testID="ai-cards-row">
        {aiOffer.map((s, i) => (
          <StickerCard
            key={`${s.id}-${i}`}
            animalEmoji={s.animalEmoji}
            scenarioEmoji={s.scenarioEmoji}
            rarity={s.rarity}
            size="sm"
            floating
            floatDelay={i * 200}
            testID={`ai-sticker-${s.id}`}
          />
        ))}
        <View style={[aiS.valuePill, { backgroundColor: rc.bg, borderColor: rc.border }]}>
          <Text style={[aiS.valueText, { color: rc.text }]}>⭐ {aiValue}</Text>
        </View>
      </Animated.View>

    </View>
  );
};

const aiS = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADII.lg,
    padding: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.tertiary,
    ...SHADOWS.card,
  },
  topRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  pawBlock: { alignItems: 'center', gap: 2 },
  pawEmoji: { fontSize: 22 },
  nameTag:  {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADII.pill,
  },
  nameText: { color: '#FFF', fontSize: 10, fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  bubbleTail: {
    position: 'absolute',
    top: 8, left: -6,
    width: 10, height: 10,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 2, borderBottomWidth: 2,
    borderColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  bubbleText: { fontSize: 11, color: COLORS.textMain, fontFamily: 'Nunito_600SemiBold' },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    paddingTop: 2,
  },
  valuePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    ...SHADOWS.card,
  },
  valueText: { fontSize: 13, fontWeight: '800', fontFamily: 'Nunito_700Bold' },
});


// ─────────────────────────────────────────────────────────────────────────────
// ZONE 2  Player Offer Drop Zone  — flex:1, tap card to remove
// ─────────────────────────────────────────────────────────────────────────────
const PlayerOfferZone: React.FC<{
  playerOffer:  StickerInstance[];
  playerValue:  number;
  aiValue:      number;
  isReady:      boolean;
  onRemove:     (instanceId: string) => void;
}> = ({ playerOffer, playerValue, aiValue, isReady, onRemove }) => {
  const hasCards = playerOffer.length > 0;

  return (
    <View
      style={[z2.container, { borderColor: hasCards ? COLORS.primary : 'rgba(255,183,178,0.45)' }]}
      testID="player-offer-zone"
    >
      {/* Label */}
      <View style={z2.labelRow}>
        <Text style={z2.label}>YOUR OFFER</Text>
        {hasCards && (
          <Text style={[z2.valueTxt, { color: isReady ? '#2E7D32' : COLORS.textMuted }]}>
            ⭐ {playerValue}{isReady ? ' ✓' : ` / ${aiValue} needed`}
          </Text>
        )}
      </View>

      {/* Content */}
      {!hasCards ? (
        <View style={z2.emptyZone} testID="trade-drop-zone">
          <Text style={z2.emptyText}>✨ Tap cards below to build your bundle</Text>
        </View>
      ) : (
        <View style={z2.cardsRow}>
          {playerOffer.map(inst => (
            <Pressable
              key={inst.instanceId}
              onPress={() => onRemove(inst.instanceId)}
              testID={`offer-remove-${inst.instanceId}`}
            >
              <StickerCard
                animalEmoji={inst.animalEmoji}
                scenarioEmoji={inst.scenarioEmoji}
                rarity={inst.rarity}
                size="sm"
                isSelected
                testID={`offer-sticker-${inst.instanceId}`}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const z2 = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: RADII.lg,
    borderWidth: 2,
    padding: SPACING.sm,
    justifyContent: 'center',
    minHeight: 80,
    ...SHADOWS.card,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label:   {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    fontFamily: 'Nunito_700Bold', letterSpacing: 1.2,
  },
  valueTxt: { fontSize: 11, fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  emptyZone: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  emptyText: {
    color: COLORS.textMuted, fontSize: 11,
    fontFamily: 'Nunito_600SemiBold', textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


// ─────────────────────────────────────────────────────────────────────────────
// ZONE 3  Action Bar  — always visible, three evenly-spaced buttons
//          [ X ] Reject  |  [ + ] Haggle  |  [ ▶ ] Accept
// ─────────────────────────────────────────────────────────────────────────────
const ActionBar: React.FC<{
  onReject:  () => void;
  onHaggle:  () => void;
  onAccept:  () => void;
  isReady:   boolean;
}> = ({ onReject, onHaggle, onAccept, isReady }) => {
  const acceptScale = useSharedValue(1);

  useEffect(() => {
    if (isReady) {
      acceptScale.value = withRepeat(
        withSequence(
          withSpring(1.08, { damping: 5,  stiffness: 200 }),
          withSpring(1,    { damping: 8,  stiffness: 160 }),
        ),
        -1, true,
      );
    } else {
      acceptScale.value = withTiming(1, { duration: 200 });
    }
  }, [isReady]);

  const acceptAnim = useAnimatedStyle(() => ({ transform: [{ scale: acceptScale.value }] }));

  return (
    <View style={z3.container} testID="trade-action-bar">

      {/* [ X ] Reject / Restart */}
      <TouchableOpacity
        style={[z3.btn, z3.rejectBtn]}
        onPress={onReject}
        activeOpacity={0.7}
        testID="trade-reject-button"
      >
        <Text style={z3.rejectSym}>✕</Text>
        <Text style={[z3.btnLbl, { color: '#FF8B84' }]}>Reject</Text>
      </TouchableOpacity>

      {/* [ + ] Haggle / Demand More */}
      <TouchableOpacity
        style={[z3.btn, z3.haggleBtn]}
        onPress={onHaggle}
        activeOpacity={0.7}
        testID="trade-haggle-button"
      >
        <Text style={z3.haggleSym}>+</Text>
        <Text style={[z3.btnLbl, { color: '#5C6AC4' }]}>Haggle</Text>
      </TouchableOpacity>

      {/* [ ▶ ] Accept / Deal */}
      <Animated.View style={[{ flex: 1 }, acceptAnim]}>
        <TouchableOpacity
          style={[
            z3.acceptInner,
            { backgroundColor: isReady ? '#52C788' : '#E0E0E0' },
          ]}
          onPress={onAccept}
          activeOpacity={0.75}
          testID="trade-accept-button"
        >
          <Text style={[z3.acceptSym, { color: isReady ? '#FFF' : '#AAAAAA' }]}>▶</Text>
          <Text style={[z3.btnLbl, { color: isReady ? '#FFF' : '#AAAAAA' }]}>
            {isReady ? 'DEAL!' : 'Accept'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
};

const z3 = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  btn: {
    flex: 1,
    height: 58,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  rejectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  haggleBtn: {
    backgroundColor: COLORS.tertiary,
    borderWidth: 2,
    borderColor: '#A0AADD',
    ...SHADOWS.soft,
  },
  acceptInner: {
    height: 58,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...SHADOWS.soft,
  },
  rejectSym:  { fontSize: 20, fontWeight: '900', color: '#FF8B84', lineHeight: 24 },
  haggleSym:  { fontSize: 24, fontWeight: '900', color: '#5C6AC4', lineHeight: 28 },
  acceptSym:  { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  btnLbl: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Nunito_700Bold',
  },
});


// ─────────────────────────────────────────────────────────────────────────────
// ZONE 4  UNO-Style Card Fan  — physically overlapping, fanned out like a hand
// ─────────────────────────────────────────────────────────────────────────────
const CARD_W    = 78;   // sm card pixel width
const CARD_H    = 78;   // sm card pixel height
const MAX_ANGLE = 10;   // ± degrees of sweep

const computeFanPositions = (n: number, containerW: number) => {
  if (n === 0) return [];
  if (n === 1) return [{ x: (containerW - CARD_W) / 2, y: 0, rotation: 0 }];

  const maxStep = 48;
  const step    = Math.min(maxStep, (containerW - CARD_W) / (n - 1));
  const totalW  = (n - 1) * step + CARD_W;
  const startX  = Math.max(0, (containerW - totalW) / 2);

  return Array.from({ length: n }, (_, i) => {
    const t        = i / (n - 1);                      // 0 → 1
    const rotation = -MAX_ANGLE + t * MAX_ANGLE * 2;   // -10 → +10
    const y        = Math.abs(rotation) * 0.8;         // edge cards dip slightly
    return { x: startX + i * step, y, rotation };
  });
};

// Individual fan card with fade animation when offered
const FanCardItem: React.FC<{
  instance:  StickerInstance;
  isOffered: boolean;
  x:         number;
  y:         number;
  rotation:  number;
  zIndex:    number;
  onTap:     (inst: StickerInstance) => void;
}> = ({ instance, isOffered, x, y, rotation, zIndex, onTap }) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(isOffered ? 0.32 : 1, { duration: 220 });
  }, [isOffered]);

  const fadeAnim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        fanS.cardWrapper,
        { left: x, top: y, zIndex, transform: [{ rotate: `${rotation}deg` }] },
        fadeAnim,
      ]}
    >
      <StickerCard
        animalEmoji={instance.animalEmoji}
        scenarioEmoji={instance.scenarioEmoji}
        rarity={instance.rarity}
        size="sm"
        onPress={isOffered ? undefined : () => onTap(instance)}
        testID={`fan-card-${instance.instanceId}`}
      />
    </Animated.View>
  );
};

const FAN_H = CARD_H + Math.ceil(MAX_ANGLE * 0.8) + 22; // ~108 px

const CardFan: React.FC<{
  inventory:         StickerInstance[];
  playerOffer:       StickerInstance[];
  onCardTap:         (inst: StickerInstance) => void;
  containerWidth:    number;
  equippedSkinEmoji: string;
}> = ({ inventory, playerOffer, onCardTap, containerWidth, equippedSkinEmoji }) => {
  const offeredIds = new Set(playerOffer.map(i => i.instanceId));
  const positions  = computeFanPositions(inventory.length, containerWidth);

  return (
    <View style={fanS.zone} testID="card-fan-zone">

      {/* Label row */}
      <View style={fanS.labelRow}>
        <Text style={fanS.paw}>{equippedSkinEmoji}</Text>
        <Text style={fanS.label}>Your Hand</Text>
        <View style={fanS.countPill}>
          <Text style={fanS.countTxt}>{inventory.length}</Text>
        </View>
      </View>

      {/* Fan container — absolutely positioned cards */}
      <View style={[fanS.fan, { height: FAN_H }]}>
        {inventory.map((inst, i) => (
          <FanCardItem
            key={inst.instanceId}
            instance={inst}
            isOffered={offeredIds.has(inst.instanceId)}
            x={positions[i]?.x ?? 0}
            y={positions[i]?.y ?? 0}
            rotation={positions[i]?.rotation ?? 0}
            zIndex={i + 1}
            onTap={onCardTap}
          />
        ))}
        {inventory.length === 0 && (
          <View style={fanS.emptyHand}>
            <Text style={fanS.emptyTxt}>No stickers! Reject to get fresh ones 🌸</Text>
          </View>
        )}
      </View>

    </View>
  );
};

const fanS = StyleSheet.create({
  zone: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius:  RADII.lg,
    borderTopRightRadius: RADII.lg,
    borderTopWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  labelRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs, gap: SPACING.xs },
  paw:       { fontSize: 16 },
  label:     { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Nunito_700Bold' },
  countPill: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADII.pill },
  countTxt:  { fontSize: 11, fontWeight: '800', color: '#FFF', fontFamily: 'Nunito_700Bold' },
  fan:       { position: 'relative', width: '100%', overflow: 'visible' },
  cardWrapper: { position: 'absolute' },
  emptyHand: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  emptyTxt:  { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_600SemiBold', textAlign: 'center' },
});


// ─────────────────────────────────────────────────────────────────────────────
// MAIN TRADE SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function TradeScreen() {
  const {
    initialized, initGame, startNewRound,
    aiOffer, playerOffer, aiMessage, tradeStatus, willingnessLevel,
    inventory, equippedSkinId, tradeCount, collectedIds,
    addToPlayerOffer, removeFromPlayerOffer,
    acceptTrade, rejectTrade, addAICard,
    newlyUnlockedSkinId, clearNewUnlock,
  } = useGameStore();

  const { playYay, playAww, playPop } = useAudio();
  const { width: screenWidth } = useWindowDimensions();
  const fanContainerWidth      = screenWidth - SPACING.md * 2;

  const roundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Bootstrap ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized)          initGame();
    else if (aiOffer.length === 0) startNewRound();
  }, [initialized]);

  // ── Auto-advance after accepted / rejected ─────────────────────────
  useEffect(() => {
    if (tradeStatus === 'accepted' || tradeStatus === 'rejected') {
      roundTimer.current = setTimeout(() => startNewRound(), 2000);
    }
    return () => { if (roundTimer.current) clearTimeout(roundTimer.current); };
  }, [tradeStatus]);

  // ── Auto-dismiss unlock badge ──────────────────────────────────────
  useEffect(() => {
    if (newlyUnlockedSkinId) {
      const t = setTimeout(() => clearNewUnlock(), 3500);
      return () => clearTimeout(t);
    }
  }, [newlyUnlockedSkinId]);

  const skinEmoji   = PAW_SKIN_EMOJIS[equippedSkinId] ?? '🐾';
  const aiValue     = aiOffer.reduce((s, sk) => s + RARITY_VALUES[sk.rarity], 0);
  const playerValue = playerOffer.reduce((s, sk) => s + RARITY_VALUES[sk.rarity], 0);
  const isReady     = willingnessLevel >= 100;

  // ── Sound-wrapped action handlers ─────────────────────────────────
  const handleAccept = () => {
    const ok = acceptTrade();
    if (ok) playYay();
  };

  const handleReject = () => {
    rejectTrade();
    playAww();
  };

  const handleCardTap = (inst: StickerInstance) => {
    addToPlayerOffer(inst);
    playPop();
  };

  const handleRemoveFromOffer = (instanceId: string) => {
    removeFromPlayerOffer(instanceId);
    playPop();
  };

  return (
    <SafeAreaView style={sc.safe} edges={['top']}>
      {/* Pastel gradient background */}
      <LinearGradient
        colors={['#FFE8F5', '#EBE8FF', '#E8FFF5']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <View style={sc.header} testID="trade-screen-header">
        <Text style={sc.title}>🐾 Sticker Trader</Text>
        <View style={sc.stats}>
          <View style={sc.badge}><Text style={sc.badgeTxt}>🔄 {tradeCount}</Text></View>
          <View style={sc.badge}><Text style={sc.badgeTxt}>📖 {collectedIds.length}/24</Text></View>
        </View>
      </View>

      {/* ── UNLOCK TOAST ───────────────────────────────────────────── */}
      {newlyUnlockedSkinId != null && (
        <View style={sc.toast} testID="unlock-toast">
          <Text style={sc.toastTxt}>
            🎉 New Paw Unlocked: {PAW_SKIN_EMOJIS[newlyUnlockedSkinId]}!
          </Text>
        </View>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 1 — Willingness Bar (90 % width, Reanimated)            */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <WillingnessBarInline level={willingnessLevel} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 1B — AI Offer container                                  */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AIOfferZone aiOffer={aiOffer} aiMessage={aiMessage} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 2 — "Your Offer" drop zone (flex:1)                     */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <PlayerOfferZone
        playerOffer={playerOffer}
        playerValue={playerValue}
        aiValue={aiValue}
        isReady={isReady}
        onRemove={handleRemoveFromOffer}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 3 — Action Bar  [X] [+] [▶]  always visible             */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <ActionBar
        onReject={handleReject}
        onHaggle={addAICard}
        onAccept={handleAccept}
        isReady={isReady}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 4 — UNO Card Fan  (overlapping, fanned, no scroll view)  */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <CardFan
        inventory={inventory}
        playerOffer={playerOffer}
        onCardTap={handleCardTap}
        containerWidth={fanContainerWidth}
        equippedSkinEmoji={skinEmoji}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* CONFETTI CELEBRATION — full-screen overlay, pointer-events off */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {newlyUnlockedSkinId != null && (
        <UnlockCelebration skinId={newlyUnlockedSkinId} />
      )}

    </SafeAreaView>
  );
}

// ─── Screen-level styles ──────────────────────────────────────────────────────
const sc = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  title:   { fontSize: 18, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Fredoka_700Bold' },
  stats:   { flexDirection: 'row', gap: SPACING.xs },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  badgeTxt: { fontSize: 12, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Nunito_700Bold' },
  toast: {
    marginHorizontal: SPACING.md,
    marginBottom: 4,
    backgroundColor: '#FFF9C4',
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: '#FFD54F',
    ...SHADOWS.soft,
  },
  toastTxt: {
    fontSize: 13, fontWeight: '700', color: '#C06000',
    fontFamily: 'Nunito_700Bold', textAlign: 'center',
  },
});
