import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { StickerInstance, RARITY_VALUES } from '../data/stickers';
import { StickerCard } from './StickerCard';
import { COLORS, SPACING, RADII, SHADOWS } from '../constants/theme';

interface Props {
  inventory: StickerInstance[];
  playerOffer: StickerInstance[];
  onAddToTrade: (instance: StickerInstance) => void;
  onRemoveFromTrade: (instanceId: string) => void;
  equippedSkinEmoji: string;
}

const InventoryItem: React.FC<{
  instance: StickerInstance;
  isOffered: boolean;
  onAdd: () => void;
  onRemove: () => void;
}> = ({ instance, isOffered, onAdd, onRemove }) => {
  const btnScale = useSharedValue(1);

  const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handlePress = () => {
    btnScale.value = withSpring(0.85, { damping: 8, stiffness: 300 });
    setTimeout(() => { btnScale.value = withSpring(1, { damping: 8, stiffness: 200 }); }, 120);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    if (isOffered) onRemove();
    else onAdd();
  };

  return (
    <View style={styles.itemWrap} testID={`inventory-item-${instance.instanceId}`}>
      <StickerCard
        animalEmoji={instance.animalEmoji}
        scenarioEmoji={instance.scenarioEmoji}
        rarity={instance.rarity}
        size="md"
        isSelected={isOffered}
        testID={`inventory-sticker-${instance.instanceId}`}
      />
      <Animated.View style={btnAnim}>
        <TouchableOpacity
          style={[styles.addBtn, isOffered && styles.addBtnActive]}
          onPress={handlePress}
          activeOpacity={0.7}
          testID={`add-to-trade-btn-${instance.instanceId}`}
        >
          <Text style={[styles.addBtnText, isOffered && styles.addBtnTextActive]}>
            {isOffered ? '✓' : '+'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.rarityDot}>
        {instance.rarity === 'Legendary' ? '✨' :
         instance.rarity === 'Rare'      ? '💜' :
         instance.rarity === 'Uncommon'  ? '💙' : '💚'}
      </Text>
    </View>
  );
};

export const InventoryScroll: React.FC<Props> = ({
  inventory,
  playerOffer,
  onAddToTrade,
  onRemoveFromTrade,
  equippedSkinEmoji,
}) => {
  const offeredIds = new Set(playerOffer.map(i => i.instanceId));
  const totalValue = inventory.reduce((s, i) => s + RARITY_VALUES[i.rarity], 0);

  return (
    <View style={styles.container} testID="inventory-horizontal-scroller">
      <View style={styles.headerRow}>
        <Text style={styles.pawEmoji}>{equippedSkinEmoji}</Text>
        <Text style={styles.headerText}>Your Stickers</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{inventory.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        testID="inventory-scroll-view"
      >
        {inventory.map(inst => (
          <InventoryItem
            key={inst.instanceId}
            instance={inst}
            isOffered={offeredIds.has(inst.instanceId)}
            onAdd={() => onAddToTrade(inst)}
            onRemove={() => onRemoveFromTrade(inst.instanceId)}
          />
        ))}
        {inventory.length === 0 && (
          <View style={styles.emptyMsg}>
            <Text style={styles.emptyText}>No stickers! Reject the AI offer to get a fresh start. 🌸</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius: RADII.lg,
    borderTopRightRadius: RADII.lg,
    borderTopWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  pawEmoji: { fontSize: 18 },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    fontFamily: 'Nunito_700Bold',
  },
  countPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.pill,
  },
  countText: { fontSize: 12, fontWeight: '800', color: '#FFF', fontFamily: 'Nunito_700Bold' },
  scroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  itemWrap: {
    alignItems: 'center',
    gap: 4,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  addBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  addBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
    lineHeight: 22,
  },
  addBtnTextActive: { color: '#FFFFFF' },
  rarityDot: { fontSize: 10 },
  emptyMsg: { justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emptyText: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
});
