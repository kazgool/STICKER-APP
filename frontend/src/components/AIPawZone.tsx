import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { StickerDef, RARITY_VALUES } from '../data/stickers';
import { StickerCard } from './StickerCard';
import { WillingnessBar } from './WillingnessBar';
import { COLORS, SHADOWS, RADII, SPACING } from '../constants/theme';

interface Props {
  aiOffer: StickerDef[];
  aiMessage: string;
  willingnessLevel: number;
}

export const AIPawZone: React.FC<Props> = ({ aiOffer, aiMessage, willingnessLevel }) => {
  const pawY        = useSharedValue(-100);
  const bubbleScale = useSharedValue(0);

  useEffect(() => {
    pawY.value        = withSpring(0, { damping: 11, stiffness: 80, mass: 0.9 });
    bubbleScale.value = withSpring(1, { damping: 13, stiffness: 120 });
  }, [aiOffer]);

  useEffect(() => {
    bubbleScale.value = 0;
    bubbleScale.value = withSpring(1, { damping: 13, stiffness: 120 });
  }, [aiMessage]);

  const pawAnim    = useAnimatedStyle(() => ({ transform: [{ translateY: pawY.value }] }));
  const bubbleAnim = useAnimatedStyle(() => ({ transform: [{ scale: bubbleScale.value }] }));

  const aiValue   = aiOffer.reduce((s, stk) => s + RARITY_VALUES[stk.rarity], 0);
  const topRarity = aiOffer.length > 0 ? aiOffer[0].rarity : 'Common';
  const rc        = COLORS.rarity[topRarity];

  return (
    <View style={styles.container} testID="ai-paw-zone">
      {/* AI header + speech bubble */}
      <View style={styles.topRow}>
        {/* Paw + name */}
        <Animated.View style={[styles.pawBlock, pawAnim]}>
          <Text style={styles.pawEmoji}>🐾</Text>
          <View style={styles.nameTag}>
            <Text style={styles.nameText}>✨ Neko</Text>
          </View>
        </Animated.View>

        {/* Speech bubble */}
        <Animated.View style={[styles.bubble, bubbleAnim]} testID="ai-speech-bubble">
          <View style={styles.bubbleTail} />
          <Text style={styles.bubbleText} numberOfLines={2}>{aiMessage}</Text>
        </Animated.View>
      </View>

      {/* Offered stickers row */}
      <View style={styles.offeredRow} testID="ai-offered-row">
        {aiOffer.map((s, i) => (
          <StickerCard
            key={s.id}
            animalEmoji={s.animalEmoji}
            scenarioEmoji={s.scenarioEmoji}
            rarity={s.rarity}
            size="lg"
            floating
            floatDelay={i * 300}
            testID={`ai-sticker-${s.id}`}
          />
        ))}
        <View style={[styles.valuePill, { backgroundColor: rc.bg, borderColor: rc.border }]}>
          <Text style={[styles.valueText, { color: rc.text }]}>⭐ {aiValue}</Text>
        </View>
      </View>

      {/* Willingness Bar */}
      <WillingnessBar level={willingnessLevel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.xs,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pawBlock: { alignItems: 'center', gap: 2 },
  pawEmoji: { fontSize: 28 },
  nameTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADII.pill,
    ...SHADOWS.soft,
  },
  nameText: { color: '#FFF', fontSize: 12, fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  bubbleTail: {
    position: 'absolute',
    top: 10,
    left: -7,
    width: 12,
    height: 12,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
  bubbleText: { fontSize: 12, color: COLORS.textMain, fontFamily: 'Nunito_600SemiBold' },
  offeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  valuePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    ...SHADOWS.card,
  },
  valueText: { fontSize: 14, fontWeight: '800', fontFamily: 'Nunito_700Bold' },
});
