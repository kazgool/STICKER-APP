import React, { useEffect, useRef, useMemo } from 'react';
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
import { PAW_SKIN_EMOJIS, COLORS, SPACING, RADII } from '../../src/constants/theme';
import { StickerInstance, StickerDef, RARITY_VALUES } from '../../src/data/stickers';
import { useAudio } from '../../src/audio/AudioContext';
import { UnlockCelebration } from '../../src/components/UnlockCelebration';

// ─────────────────────────────────────────────────────────────────────────────
//  QUILTED BACKGROUND  — soft pink / lavender diamond tile pattern
// ─────────────────────────────────────────────────────────────────────────────
const DIA_S  = 30;                           // square side (px) before 45° rotation
const DIA_SX = DIA_S * Math.SQRT2;           // ≈42.4 px  horizontal centre-to-centre
const DIA_SY = DIA_S * Math.SQRT2 * 0.5;    // ≈21.2 px  vertical   centre-to-centre

const QuiltBackground = React.memo(function QuiltBackground() {
  const { width, height } = useWindowDimensions();

  const cells = useMemo(() => {
    const out: Array<{ k: string; x: number; y: number; pink: boolean }> = [];
    const cols = Math.ceil(width  / DIA_SX) + 2;
    const rows = Math.ceil(height / DIA_SY) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          k:    `${r}-${c}`,
          x:    c * DIA_SX + (r % 2 === 1 ? DIA_SX / 2 : 0) - DIA_SX,
          y:    r * DIA_SY - DIA_SY,
          pink: (r + c) % 2 === 0,
        });
      }
    }
    return out;
  }, [width, height]);

  return (
    <View style={qb.root}>
      {cells.map(({ k, x, y, pink }) => (
        <View
          key={k}
          style={[qb.cell, {
            left:            x - DIA_S / 2,
            top:             y - DIA_S / 2,
            backgroundColor: pink ? '#FFD0EC' : '#EDD0FF',
          }]}
        />
      ))}
    </View>
  );
});

const qb = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFECF7',
    overflow:        'hidden',
    pointerEvents:   'none',
  },
  cell: {
    position:     'absolute',
    width:        DIA_S,
    height:       DIA_S,
    borderRadius: 3,
    borderWidth:  2,
    borderColor:  'rgba(255,255,255,0.90)',
    transform:    [{ rotate: '45deg' }],
  },
});


// ─────────────────────────────────────────────────────────────────────────────
//  DISH WELL  — reusable recessed tray container
// ─────────────────────────────────────────────────────────────────────────────
const WELL_COLORS      = ['rgba(155,75,135,0.10)', 'rgba(255,255,255,0.84)', 'rgba(155,75,135,0.07)'] as const;
const WELL_DEEP_COLORS = ['rgba(155,75,135,0.15)', 'rgba(255,255,255,0.76)', 'rgba(155,75,135,0.11)'] as const;

const DishWell: React.FC<{
  children: React.ReactNode;
  style?:   object;
  deep?:    boolean;
  testID?:  string;
}> = ({ children, style, deep = false, testID }) => (
  <View style={[dw.outer, style]} testID={testID}>
    <LinearGradient
      colors={deep ? WELL_DEEP_COLORS : WELL_COLORS}
      locations={[0, 0.44, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={dw.gradient}
    >
      {children}
      {/* Simulated inset shadows at top and bottom edges */}
      <View style={[dw.inset, dw.insetTop]}  />
      <View style={[dw.inset, dw.insetBot]}  />
    </LinearGradient>
  </View>
);

const dw = StyleSheet.create({
  outer: {
    borderRadius:  RADII.lg,
    borderWidth:   1.5,
    borderColor:   'rgba(200,110,175,0.30)',
    shadowColor:   '#C070A0',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius:  4,
    elevation:     2,
  },
  gradient: {
    borderRadius: RADII.lg - 2,
    overflow:     'hidden',
  },
  inset:    { position: 'absolute', left: 0, right: 0, pointerEvents: 'none' },
  insetTop: { top: 0, height: 9,  backgroundColor: 'rgba(120,50,100,0.08)' },
  insetBot: { bottom: 0, height: 6, backgroundColor: 'rgba(120,50,100,0.05)' },
});


// ─────────────────────────────────────────────────────────────────────────────
//  ZONE 1  Willingness Bar — recessed track channel inside a DishWell
// ─────────────────────────────────────────────────────────────────────────────
const WillingnessBarInline: React.FC<{ level: number }> = ({ level }) => {
  const animFlex    = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pawBounce   = useSharedValue(0);

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
    level >= 100 ? '#2E7D32' : level >= 70 ? '#C07800' : level >= 40 ? '#B06020' : '#B03030';

  return (
    <DishWell style={wb.wrapper} testID="willingness-bar">
      <View style={wb.pad}>
        <View style={wb.headerRow}>
          <Text style={wb.label}>💕 Willingness</Text>
          <Text style={[wb.pct, { color: labelColor }]}>{pct}%{level >= 100 ? ' 🎉' : ''}</Text>
        </View>

        {/* Recessed track channel */}
        <View style={wb.trackShell}>
          <LinearGradient
            colors={['rgba(90,30,70,0.12)', '#E4D8F0', 'rgba(90,30,70,0.06)']}
            locations={[0, 0.25, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={wb.trackGrad}
          >
            <Animated.View style={[wb.fill, barAnim]} />
            <Animated.View style={[StyleSheet.absoluteFill, wb.glow, glowAnim]} />
          </LinearGradient>
        </View>

        <View style={wb.statusRow}>
          <Text style={[wb.status, { color: labelColor }]}>{label}</Text>
          <Animated.View style={pawAnim}>
            <Text style={wb.pawIcon}>{level >= 100 ? '🎊' : '🐾'}</Text>
          </Animated.View>
        </View>
      </View>
    </DishWell>
  );
};

const wb = StyleSheet.create({
  wrapper:    { marginHorizontal: SPACING.md, marginTop: SPACING.xs },
  pad:        { paddingHorizontal: SPACING.sm, paddingVertical: 8 },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label:      { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, fontFamily: 'Nunito_700Bold' },
  pct:        { fontSize: 12, fontWeight: '800', fontFamily: 'Nunito_700Bold' },
  trackShell: {
    borderRadius:  7,
    borderWidth:   1,
    borderColor:   'rgba(160,80,140,0.22)',
    overflow:      'hidden',
    shadowColor:   '#A06080',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius:  2,
    elevation:     1,
  },
  trackGrad:  { height: 14, borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  fill:       { height: '100%', borderRadius: 6, minWidth: 6 },
  glow:       { backgroundColor: '#FFFFFF', borderRadius: 6 },
  statusRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  status:     { fontSize: 10, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
  pawIcon:    { fontSize: 14 },
});


// ─────────────────────────────────────────────────────────────────────────────
//  ZONE 1B  AI Offer Zone — tray with raised speech bubble
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
    <DishWell style={aiS.wrapper} testID="ai-offer-zone">
      <View style={aiS.pad}>
        {/* ── Neko paw + raised speech bubble ── */}
        <View style={aiS.topRow}>
          <View style={aiS.pawBlock}>
            <Text style={aiS.pawEmoji}>🐾</Text>
            <LinearGradient colors={['#FFB7B2', '#FF8484']} style={aiS.nameTag}>
              <Text style={aiS.nameText}>✨ Neko</Text>
            </LinearGradient>
          </View>

          {/* Raised pillow bubble */}
          <Animated.View style={[aiS.bubbleShell, bubbleAnim]} testID="ai-speech-bubble">
            <LinearGradient
              colors={['rgba(255,255,255,0.98)', '#FFF4F9']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={aiS.bubbleGrad}
            >
              <View style={aiS.bubbleTail} />
              <Text style={aiS.bubbleText} numberOfLines={2}>{aiMessage}</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* ── AI stickers floating above tray ── */}
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
    </DishWell>
  );
};

const aiS = StyleSheet.create({
  wrapper: { marginHorizontal: SPACING.md, marginTop: SPACING.sm },
  pad:     { padding: SPACING.sm },
  topRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  pawBlock: { alignItems: 'center', gap: 3 },
  pawEmoji: { fontSize: 22 },
  nameTag:  {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
    borderRadius:      RADII.pill,
    shadowColor:       '#E07090',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.28,
    shadowRadius:      4,
    elevation:         3,
  },
  nameText: { color: '#FFF', fontSize: 10, fontWeight: '700', fontFamily: 'Nunito_700Bold' },

  // Raised speech bubble (pillow look)
  bubbleShell: {
    flex:         1,
    borderRadius: RADII.md,
    borderWidth:  2,
    borderColor:  'rgba(255,183,178,0.65)',
    shadowColor:  '#D07090',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius:  7,
    elevation:     5,
    overflow:      'hidden',
  },
  bubbleGrad: {
    flex:             1,
    borderRadius:     RADII.md - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical:  6,
    overflow:         'hidden',
  },
  bubbleTail: {
    position:          'absolute',
    top:               8,
    left:              -6,
    width:             10,
    height:            10,
    backgroundColor:   '#FFFBFD',
    borderLeftWidth:   2,
    borderBottomWidth: 2,
    borderColor:       'rgba(255,183,178,0.65)',
    transform:         [{ rotate: '45deg' }],
  },
  bubbleText: { fontSize: 11, color: COLORS.textMain, fontFamily: 'Nunito_600SemiBold' },

  cardsRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.sm,
    flexWrap:       'wrap',
    paddingTop:     4,
  },
  valuePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   4,
    borderRadius:      RADII.pill,
    borderWidth:       1.5,
    shadowColor:       '#C090B0',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.18,
    shadowRadius:      4,
    elevation:         3,
  },
  valueText: { fontSize: 13, fontWeight: '800', fontFamily: 'Nunito_700Bold' },
});


// ─────────────────────────────────────────────────────────────────────────────
//  ZONE 2  Player Offer Drop Zone — deep dish well
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
    <DishWell
      style={[
        z2.wrapper,
        { borderColor: hasCards ? 'rgba(255,140,130,0.55)' : 'rgba(200,110,175,0.28)' },
      ]}
      deep
      testID="player-offer-zone"
    >
      <View style={z2.pad}>
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
            <Text style={z2.emptyIcon}>✨</Text>
            <Text style={z2.emptyText}>Tap cards below to build your bundle</Text>
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
    </DishWell>
  );
};

const z2 = StyleSheet.create({
  wrapper: {
    flex:             1,
    marginHorizontal: SPACING.md,
    marginTop:        SPACING.sm,
    minHeight:        80,
  },
  pad: {
    flex:           1,
    padding:        SPACING.sm,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   6,
  },
  label: {
    fontSize:      10,
    fontWeight:    '700',
    color:         COLORS.textMuted,
    fontFamily:    'Nunito_700Bold',
    letterSpacing: 1.2,
  },
  valueTxt:  { fontSize: 11, fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  emptyZone: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 4 },
  emptyIcon: { fontSize: 18 },
  emptyText: {
    color:      COLORS.textMuted,
    fontSize:   11,
    fontFamily: 'Nunito_600SemiBold',
    textAlign:  'center',
  },
  cardsRow: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            SPACING.sm,
    alignItems:     'center',
    justifyContent: 'center',
  },
});


// ─────────────────────────────────────────────────────────────────────────────
//  ZONE 3  Action Bar — three raised "pillow" buttons
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
          withSpring(1.08, { damping: 5, stiffness: 200 }),
          withSpring(1,    { damping: 8, stiffness: 160 }),
        ),
        -1, true,
      );
    } else {
      acceptScale.value = withTiming(1, { duration: 200 });
    }
  }, [isReady]);

  const acceptAnim = useAnimatedStyle(() => ({ transform: [{ scale: acceptScale.value }] }));

  return (
    <View style={z3.row} testID="trade-action-bar">

      {/* Reject — rose-pink pillow */}
      <View style={z3.slot}>
        <TouchableOpacity
          style={z3.pillowShell}
          onPress={onReject}
          activeOpacity={0.72}
          testID="trade-reject-button"
        >
          <LinearGradient
            colors={['#FFFFFF', '#FFE0EA']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={z3.pillowGrad}
          >
            <Text style={z3.rejectSym}>✕</Text>
            <Text style={[z3.lbl, { color: '#D95070' }]}>Reject</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Haggle — lavender pillow */}
      <View style={z3.slot}>
        <TouchableOpacity
          style={z3.pillowShell}
          onPress={onHaggle}
          activeOpacity={0.72}
          testID="trade-haggle-button"
        >
          <LinearGradient
            colors={['#F2EEFF', '#D8D4FF']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={z3.pillowGrad}
          >
            <Text style={z3.haggleSym}>+</Text>
            <Text style={[z3.lbl, { color: '#5055C4' }]}>Haggle</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Accept — mint (ready) or pearl (not ready) pillow */}
      <View style={z3.slot}>
        <Animated.View style={[{ flex: 1 }, acceptAnim]}>
          <TouchableOpacity
            style={z3.pillowShell}
            onPress={onAccept}
            activeOpacity={0.75}
            testID="trade-accept-button"
          >
            <LinearGradient
              colors={isReady ? ['#C0F5DC', '#44BB7A'] : ['#F2F2F2', '#DCDCDC']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={z3.pillowGrad}
            >
              <Text style={[z3.acceptSym, { color: isReady ? '#145230' : '#AAAAAA' }]}>
                {isReady ? '✨' : '▶'}
              </Text>
              <Text style={[z3.lbl, {
                color:      isReady ? '#145230' : '#AAAAAA',
                fontWeight: isReady ? '800' : '600',
              }]}>
                {isReady ? 'DEAL!' : 'Accept'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

    </View>
  );
};

const z3 = StyleSheet.create({
  row: {
    flexDirection:    'row',
    marginHorizontal: SPACING.md,
    marginTop:        SPACING.sm,
    gap:              SPACING.sm,
    alignItems:       'stretch',
  },
  slot: { flex: 1 },
  pillowShell: {
    flex:          1,
    borderRadius:  RADII.md,
    shadowColor:   '#C070A8',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius:  8,
    elevation:     7,
    overflow:      'hidden',
  },
  pillowGrad: {
    height:         56,
    borderRadius:   RADII.md,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            2,
    overflow:       'hidden',
  },
  rejectSym: { fontSize: 20, fontWeight: '900', color: '#D95070', lineHeight: 24 },
  haggleSym: { fontSize: 24, fontWeight: '900', color: '#5055C4', lineHeight: 28 },
  acceptSym: { fontSize: 18, fontWeight: '900', lineHeight: 22 },
  lbl: {
    fontSize:   10,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
});


// ─────────────────────────────────────────────────────────────────────────────
//  ZONE 4  Card Fan — UNO-style fanned hand on a raised fabric ledge
// ─────────────────────────────────────────────────────────────────────────────
const CARD_W    = 78;
const CARD_H    = 78;
const MAX_ANGLE = 10;

const computeFanPositions = (n: number, containerW: number) => {
  if (n === 0) return [];
  if (n === 1) return [{ x: (containerW - CARD_W) / 2, y: 0, rotation: 0 }];
  const maxStep = 48;
  const step    = Math.min(maxStep, (containerW - CARD_W) / (n - 1));
  const totalW  = (n - 1) * step + CARD_W;
  const startX  = Math.max(0, (containerW - totalW) / 2);
  return Array.from({ length: n }, (_, i) => {
    const t        = i / (n - 1);
    const rotation = -MAX_ANGLE + t * MAX_ANGLE * 2;
    const y        = Math.abs(rotation) * 0.8;
    return { x: startX + i * step, y, rotation };
  });
};

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
        fanS.cardWrap,
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

const FAN_H = CARD_H + Math.ceil(MAX_ANGLE * 0.8) + 22;

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
      {/* Raised ledge gradient — dark top edge fading to pink-white surface */}
      <LinearGradient
        colors={['rgba(200,100,165,0.22)', 'rgba(255,228,245,0.95)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.25 }}
        style={[StyleSheet.absoluteFill, { borderTopLeftRadius: RADII.lg, borderTopRightRadius: RADII.lg }]}
        pointerEvents="none"
      />

      {/* Label row */}
      <View style={fanS.labelRow}>
        <Text style={fanS.paw}>{equippedSkinEmoji}</Text>
        <Text style={fanS.label}>Your Hand</Text>
        <LinearGradient colors={['#FFB7B2', '#FF8484']} style={fanS.countPill}>
          <Text style={fanS.countTxt}>{inventory.length}</Text>
        </LinearGradient>
      </View>

      {/* Fan */}
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
    marginTop:            SPACING.sm,
    paddingHorizontal:    SPACING.md,
    paddingTop:           SPACING.sm,
    paddingBottom:        SPACING.md,
    backgroundColor:      '#FFE4F5',
    borderTopLeftRadius:  RADII.lg,
    borderTopRightRadius: RADII.lg,
    borderTopWidth:       2,
    borderColor:          'rgba(255,183,178,0.70)',
    shadowColor:          '#C070A8',
    shadowOffset:         { width: 0, height: -3 },
    shadowOpacity:        0.15,
    shadowRadius:         8,
    elevation:            6,
    overflow:             'hidden',
  },
  labelRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs, gap: SPACING.xs, zIndex: 2 },
  paw:       { fontSize: 16 },
  label:     { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Nunito_700Bold' },
  countPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
    borderRadius:      RADII.pill,
    shadowColor:       '#E07090',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.25,
    shadowRadius:      4,
    elevation:         4,
  },
  countTxt:  { fontSize: 11, fontWeight: '800', color: '#FFF', fontFamily: 'Nunito_700Bold' },
  fan:       { position: 'relative', width: '100%', overflow: 'visible', zIndex: 2 },
  cardWrap:  { position: 'absolute' },
  emptyHand: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  emptyTxt:  { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_600SemiBold', textAlign: 'center' },
});


// ─────────────────────────────────────────────────────────────────────────────
//  MAIN TRADE SCREEN
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
  const fanContainerWidth = screenWidth - SPACING.md * 2;
  const roundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized)              initGame();
    else if (aiOffer.length === 0) startNewRound();
  }, [initialized]);

  // ── Auto-advance after trade resolves ─────────────────────────────────────
  useEffect(() => {
    if (tradeStatus === 'accepted' || tradeStatus === 'rejected') {
      roundTimer.current = setTimeout(() => startNewRound(), 2000);
    }
    return () => { if (roundTimer.current) clearTimeout(roundTimer.current); };
  }, [tradeStatus]);

  // ── Auto-dismiss unlock badge ──────────────────────────────────────────────
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

  const handleAccept          = () => { if (acceptTrade()) playYay(); };
  const handleReject          = () => { rejectTrade(); playAww(); };
  const handleCardTap         = (inst: StickerInstance) => { addToPlayerOffer(inst); playPop(); };
  const handleRemoveFromOffer = (id: string) => { removeFromPlayerOffer(id); playPop(); };

  return (
    <SafeAreaView style={sc.safe} edges={['top']}>
      {/* ── 1. QUILTED DIAMOND BACKGROUND ─────────────────────── */}
      <QuiltBackground />

      {/* ── 2. HEADER — raised pill badges ────────────────────── */}
      <View style={sc.header} testID="trade-screen-header">
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,228,245,0.90)']}
          style={sc.titlePill}
        >
          <Text style={sc.title}>🐾 Sticker Trader</Text>
        </LinearGradient>
        <View style={sc.stats}>
          <LinearGradient colors={['rgba(255,255,255,0.96)', '#FFE0EA']} style={sc.badge}>
            <Text style={sc.badgeTxt}>🔄 {tradeCount}</Text>
          </LinearGradient>
          <LinearGradient colors={['rgba(255,255,255,0.96)', '#EEE4FF']} style={sc.badge}>
            <Text style={sc.badgeTxt}>📖 {collectedIds.length}/24</Text>
          </LinearGradient>
        </View>
      </View>

      {/* ── UNLOCK TOAST ───────────────────────────────────────── */}
      {newlyUnlockedSkinId != null && (
        <View style={sc.toast} testID="unlock-toast">
          <Text style={sc.toastTxt}>
            🎉 New Paw Unlocked: {PAW_SKIN_EMOJIS[newlyUnlockedSkinId]}!
          </Text>
        </View>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 1 — Willingness Bar                                  */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <WillingnessBarInline level={willingnessLevel} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 1B — AI Offer tray                                   */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AIOfferZone aiOffer={aiOffer} aiMessage={aiMessage} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 2 — Player Offer drop zone (flex:1)                  */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <PlayerOfferZone
        playerOffer={playerOffer}
        playerValue={playerValue}
        aiValue={aiValue}
        isReady={isReady}
        onRemove={handleRemoveFromOffer}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 3 — Action Bar  [✕ Reject] [+ Haggle] [▶ Accept]    */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <ActionBar
        onReject={handleReject}
        onHaggle={addAICard}
        onAccept={handleAccept}
        isReady={isReady}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ZONE 4 — Card Fan (fanned hand at bottom)                 */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <CardFan
        inventory={inventory}
        playerOffer={playerOffer}
        onCardTap={handleCardTap}
        containerWidth={fanContainerWidth}
        equippedSkinEmoji={skinEmoji}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* CONFETTI OVERLAY (pointer-events: none via style)         */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    justifyContent:    'space-between',
    gap:               SPACING.sm,
  },
  titlePill: {
    flex:              1,
    borderRadius:      RADII.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical:   6,
    borderWidth:       1.5,
    borderColor:       'rgba(255,183,178,0.50)',
    shadowColor:       '#D080A8',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.18,
    shadowRadius:      6,
    elevation:         4,
    overflow:          'hidden',
  },
  title: {
    fontSize:   16,
    fontWeight: '700',
    color:      COLORS.textMain,
    fontFamily: 'Fredoka_700Bold',
  },
  stats: { flexDirection: 'row', gap: SPACING.xs },
  badge: {
    borderRadius:      RADII.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   4,
    borderWidth:       1.5,
    borderColor:       'rgba(255,183,178,0.45)',
    shadowColor:       '#D080A8',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.16,
    shadowRadius:      5,
    elevation:         3,
    overflow:          'hidden',
  },
  badgeTxt: { fontSize: 11, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Nunito_700Bold' },
  toast: {
    marginHorizontal:  SPACING.md,
    marginBottom:      4,
    backgroundColor:   '#FFF9C4',
    borderRadius:      RADII.md,
    paddingVertical:   SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth:       2,
    borderColor:       '#FFD54F',
    shadowColor:       '#C09000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.18,
    shadowRadius:      6,
    elevation:         4,
  },
  toastTxt: {
    fontSize:   13,
    fontWeight: '700',
    color:      '#C06000',
    fontFamily: 'Nunito_700Bold',
    textAlign:  'center',
  },
});
