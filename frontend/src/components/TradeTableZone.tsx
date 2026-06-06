import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StickerDef, StickerInstance, RARITY_VALUES } from '../data/stickers';
import { StickerCard } from './StickerCard';
import { COLORS, SPACING, RADII, SHADOWS } from '../constants/theme';

interface Props {
  aiOffer: StickerDef[];
  playerOffer: StickerInstance[];
  willingnessLevel: number;
  onRemoveFromOffer: (instanceId: string) => void;
  onAccept: () => void;
  onReject: () => void;
  tradeStatus: string;
}

export const TradeTableZone: React.FC<Props> = ({
  aiOffer,
  playerOffer,
  willingnessLevel,
  onRemoveFromOffer,
  onAccept,
  onReject,
  tradeStatus,
}) => {
  const aiValue     = aiOffer.reduce((s, sk) => s + RARITY_VALUES[sk.rarity], 0);
  const playerValue = playerOffer.reduce((s, sk) => s + RARITY_VALUES[sk.rarity], 0);
  const isReady     = willingnessLevel >= 100;

  // Accept button glow when ready
  const acceptGlow  = useSharedValue(1);
  useEffect(() => {
    if (isReady) {
      acceptGlow.value = withRepeat(
        withSequence(withSpring(1.06, { damping: 5, stiffness: 200 }), withSpring(1, { damping: 8, stiffness: 160 })),
        -1, true
      );
    } else {
      acceptGlow.value = withTiming(1, { duration: 200 });
    }
  }, [isReady]);

  const acceptAnim = useAnimatedStyle(() => ({ transform: [{ scale: acceptGlow.value }] }));

  const handleRemove = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    onRemoveFromOffer(id);
  };

  // Accept button colors
  const acceptBg   = isReady ? '#52C788' : '#D8D8D8';
  const acceptText = isReady ? '#FFFFFF'  : '#AAAAAA';

  return (
    <View style={styles.container} testID="trade-table-zone">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🐾 Trade Table</Text>
      </View>

      {/* AI Offer */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>NEKO OFFERS</Text>
          <View style={[styles.valueBadge, { backgroundColor: COLORS.rarity[aiOffer[0]?.rarity ?? 'Common'].bg }]}>
            <Text style={styles.valueBadgeText}>⭐ {aiValue}</Text>
          </View>
        </View>
        <View style={styles.stickerRow}>
          {aiOffer.map(s => (
            <StickerCard
              key={s.id}
              animalEmoji={s.animalEmoji}
              scenarioEmoji={s.scenarioEmoji}
              rarity={s.rarity}
              size="sm"
              testID={`table-ai-sticker-${s.id}`}
            />
          ))}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Player Offer */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>YOUR BUNDLE</Text>
          <Text style={[styles.playerVal, { color: isReady ? '#2E7D32' : COLORS.textMuted }]}>
            ⭐ {playerValue}{isReady ? ' ✓' : ` / ${aiValue} needed`}
          </Text>
        </View>

        {playerOffer.length === 0 ? (
          <View style={styles.emptyZone} testID="trade-drop-zone">
            <Text style={styles.emptyText}>⬆ Tap [ + ] below to bundle stickers</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offeredScroll}
          >
            {playerOffer.map(inst => (
              <View key={inst.instanceId} style={styles.offeredItem}>
                <StickerCard
                  animalEmoji={inst.animalEmoji}
                  scenarioEmoji={inst.scenarioEmoji}
                  rarity={inst.rarity}
                  size="sm"
                  onPress={() => handleRemove(inst.instanceId)}
                  testID={`table-player-sticker-${inst.instanceId}`}
                />
                <Text style={styles.tapHint}>tap ✕</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionRow} testID="trade-action-buttons">
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={onReject}
          activeOpacity={0.7}
          testID="trade-reject-button"
        >
          <Text style={styles.rejectText}>💔 Reject</Text>
        </TouchableOpacity>

        <Animated.View style={[{ flex: 1.4 }, acceptAnim]}>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: acceptBg }]}
            onPress={onAccept}
            disabled={!isReady}
            activeOpacity={isReady ? 0.75 : 1}
            testID="trade-accept-button"
          >
            <Text style={[styles.acceptText, { color: acceptText }]}>
              {isReady ? '✨ DEAL!' : '▶ Accept'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: RADII.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    overflow: 'hidden',
    ...SHADOWS.float,
  },
  header: { backgroundColor: COLORS.secondary, paddingVertical: 6, alignItems: 'center' },
  headerText: { fontSize: 13, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Nunito_700Bold', letterSpacing: 0.5 },
  section: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, fontFamily: 'Nunito_700Bold', letterSpacing: 1.2, textTransform: 'uppercase' },
  stickerRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  valueBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADII.pill, borderWidth: 1.5, borderColor: '#DDD' },
  valueBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.textMain },
  divider: { height: 1.5, backgroundColor: COLORS.secondary, marginHorizontal: SPACING.md },
  playerVal: { fontSize: 11, fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  emptyZone: { height: 62, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: RADII.md, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  offeredScroll: { paddingVertical: 2, gap: SPACING.sm },
  offeredItem: { alignItems: 'center', gap: 2 },
  tapHint: { fontSize: 8, color: COLORS.textMuted, fontFamily: 'Nunito_400Regular' },
  actionRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, paddingTop: 6, gap: SPACING.sm },
  rejectBtn: { flex: 1, paddingVertical: 11, borderRadius: RADII.pill, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#DDD', alignItems: 'center' },
  rejectText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, fontFamily: 'Nunito_700Bold' },
  acceptBtn: { paddingVertical: 11, borderRadius: RADII.pill, alignItems: 'center', ...SHADOWS.soft },
  acceptText: { fontSize: 14, fontWeight: '800', fontFamily: 'Nunito_700Bold' },
});
