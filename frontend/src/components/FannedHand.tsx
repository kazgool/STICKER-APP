import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  LayoutAnimation,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { StickerInstance, RARITY_VALUES, Rarity } from '../data/stickers';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, RADII } from '../constants/theme';

/* ─── Constants ─────────────────────────────────────────────── */
const CARD_W   = 78;
const CARD_H   = 78;
const MAX_ANGLE = 12;   // max rotation degrees at edges
const ARC_AMP   = 18;   // pixels edges rise above center
const H_PAD     = 24;   // horizontal padding on container

/* ─── Individual fan card ────────────────────────────────────── */
interface FanCardProps {
  instance: StickerInstance;
  left: number;
  arcBottom: number;
  rotation: number;
  zIndex: number;
  onPlay: (inst: StickerInstance) => void;
}

const FanCard: React.FC<FanCardProps> = ({
  instance, left, arcBottom, rotation, zIndex, onPlay,
}) => {
  const liftY  = useSharedValue(0);
  const scale  = useSharedValue(1);
  const opac   = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: liftY.value },
      { rotate: `${rotation}deg` },
      { scale: scale.value },
    ],
    opacity: opac.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(1.12, { damping: 8, stiffness: 360 });
    liftY.value  = withSpring(-10, { damping: 10, stiffness: 300 });
  };

  const handlePress = () => {
    /* Pop up and fly away, then trigger state */
    scale.value = withSpring(1.25, { damping: 6, stiffness: 350 });
    liftY.value  = withTiming(-140, { duration: 230 }, (done) => {
      if (done) {
        runOnJS(LayoutAnimation.configureNext)(LayoutAnimation.Presets.spring);
        runOnJS(onPlay)(instance);
      }
    });
    opac.value  = withTiming(0, { duration: 210 });
  };

  const rc = COLORS.rarity[instance.rarity];

  return (
    <Animated.View
      style={[styles.fanCard, { left, bottom: arcBottom, zIndex }, anim]}
      testID={`hand-card-${instance.instanceId}`}
    >
      <Pressable onPress={handlePress} onPressIn={handlePressIn}>
        {/* White bubble border */}
        <View style={[styles.cardBubble, SHADOWS.soft]}>
          <LinearGradient colors={rc.gradient} style={styles.cardInner}>
            <Text style={styles.animalEmoji}>{instance.animalEmoji}</Text>
            <Text style={styles.scenarioEmoji}>{instance.scenarioEmoji}</Text>
          </LinearGradient>
          {/* Rarity corner dot */}
          <View style={[styles.rarityDot, { backgroundColor: rc.border }]} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

/* ─── Main FannedHand component ──────────────────────────────── */
interface Props {
  handCards: StickerInstance[];
  equippedSkinEmoji: string;
}

export const FannedHand: React.FC<Props> = ({ handCards, equippedSkinEmoji }) => {
  const { width: screenW } = useWindowDimensions();
  const availW = screenW - H_PAD;

  const N = handCards.length;

  /* Adaptive step: spread nicely for few cards, overlap for many */
  const step = N > 1
    ? Math.min(52, (availW - CARD_W) / (N - 1))
    : 0;

  const fanW   = CARD_W + (N - 1) * step;
  const startX = (availW - fanW) / 2;

  const getCardLayout = (i: number) => {
    const norm     = N > 1 ? (i / (N - 1)) * 2 - 1 : 0;   // -1 … +1
    const rotation = norm * MAX_ANGLE;
    const arcBottom = Math.abs(norm) * ARC_AMP;
    const left     = startX + i * step;
    /* Centre cards sit on top; edge cards underneath */
    const zIndex   = Math.min(i, N - 1 - i) + 1;
    return { rotation, arcBottom, left, zIndex };
  };

  return (
    <View style={styles.container} testID="fanned-hand">
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.pawEmoji}>{equippedSkinEmoji}</Text>
        <Text style={styles.headerLabel}>Your Hand</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{N}</Text>
        </View>
      </View>

      {/* Fan area */}
      <View style={styles.fanArea}>
        {N === 0 ? (
          <View style={styles.emptyHand} testID="empty-hand-message">
            <Text style={styles.emptyText}>All stickers on the table! 🐾</Text>
          </View>
        ) : (
          handCards.map((inst, i) => {
            const layout = getCardLayout(i);
            return (
              <FanCard
                key={inst.instanceId}
                instance={inst}
                {...layout}
                onPlay={(card) => {
                  /* onPlay triggers addToPlayerOffer — passed up through trade.tsx */
                  (FannedHand as any).__onPlay?.(card);
                }}
              />
            );
          })
        )}
      </View>

      {N > 0 && (
        <Text style={styles.tapHint}>Tap a sticker to place it on the table ↑</Text>
      )}
    </View>
  );
};

/* Helper: attach play handler from outside (avoids prop drilling through static ref) */
FannedHand.displayName = 'FannedHand';

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingHorizontal: H_PAD / 2,
    backgroundColor: 'rgba(255,240,250,0.92)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2.5,
    borderColor: COLORS.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  pawEmoji: { fontSize: 18 },
  headerLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    fontFamily: 'Nunito_700Bold',
  },
  countPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    fontFamily: 'Nunito_700Bold',
  },
  fanArea: {
    height: CARD_H + ARC_AMP + 18,
    position: 'relative',
  },
  fanCard: {
    position: 'absolute',
  },
  cardBubble: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalEmoji: { fontSize: 32 },
  scenarioEmoji: { fontSize: 18, marginTop: -3 },
  rarityDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  emptyHand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: 'Nunito_600SemiBold',
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'Nunito_600SemiBold',
    paddingBottom: 6,
    marginTop: 4,
  },
});
