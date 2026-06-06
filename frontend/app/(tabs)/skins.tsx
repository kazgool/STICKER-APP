import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useGameStore } from '../../src/store/gameStore';
import { ALL_SKINS, SkinDef } from '../../src/data/skins';
import { COLORS, SPACING, RADII, SHADOWS } from '../../src/constants/theme';

const SkinCard: React.FC<{ skin: SkinDef; isUnlocked: boolean; isEquipped: boolean; onEquip: () => void }> = ({
  skin, isUnlocked, isEquipped, onEquip,
}) => {
  const scale = useSharedValue(1);
  const cardAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (!isUnlocked) return;
    scale.value = withSpring(0.92, { damping: 10, stiffness: 300 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }, 120);
    onEquip();
  };

  return (
    <Animated.View style={[styles.cardWrap, cardAnim]}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: skin.bgColor },
          isEquipped && styles.cardEquipped,
          !isUnlocked && styles.cardLocked,
        ]}
        onPress={handlePress}
        activeOpacity={isUnlocked ? 0.8 : 1}
        disabled={!isUnlocked}
        testID={`skin-card-${skin.id}`}
      >
        {/* Lock overlay */}
        {!isUnlocked && <View style={styles.lockOverlay} />}

        {/* Emoji */}
        <Text style={styles.skinEmoji}>{isUnlocked ? skin.emoji : '🔒'}</Text>

        <Text style={[styles.skinName, { color: isUnlocked ? COLORS.textMain : COLORS.textMuted }]}>
          {skin.name}
        </Text>

        <Text style={styles.skinDesc}>{skin.description}</Text>

        {/* Status badge */}
        {isEquipped ? (
          <View style={[styles.badge, styles.badgeEquipped]}>
            <Text style={styles.badgeText}>✓ Equipped</Text>
          </View>
        ) : isUnlocked ? (
          <View style={[styles.badge, { backgroundColor: skin.accentColor }]}>
            <Text style={styles.badgeText}>Tap to equip</Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.badgeLocked]}>
            <Text style={[styles.badgeText, { color: COLORS.textMuted }]}>🔒 Locked</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SkinsScreen() {
  const { unlockedSkinIds, equippedSkinId, equipSkin, tradeCount, collectedIds } = useGameStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#FFE8F5', '#F5E8FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header} testID="skins-header">
        <Text style={styles.title}>✨ Paw Skins</Text>
        <Text style={styles.subtitle}>
          {unlockedSkinIds.length} / {ALL_SKINS.length} unlocked
        </Text>
      </View>

      {/* Unlock progress hints */}
      <View style={styles.hintsRow}>
        <View style={styles.hintChip}>
          <Text style={styles.hintText}>🔄 {tradeCount} trades</Text>
        </View>
        <View style={styles.hintChip}>
          <Text style={styles.hintText}>📖 {collectedIds.length}/24 stickers</Text>
        </View>
      </View>

      {/* Skin grid */}
      <FlatList
        data={ALL_SKINS}
        keyExtractor={s => s.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        testID="skins-grid"
        renderItem={({ item }) => (
          <SkinCard
            skin={item}
            isUnlocked={unlockedSkinIds.includes(item.id)}
            isEquipped={equippedSkinId === item.id}
            onEquip={() => equipSkin(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xs },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Fredoka_700Bold' },
  subtitle: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'Nunito_600SemiBold' },
  hintsRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  hintChip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  hintText: { fontSize: 11, color: COLORS.textMain, fontFamily: 'Nunito_700Bold' },
  grid: { paddingHorizontal: SPACING.sm, paddingBottom: SPACING.xl },
  cardWrap: { flex: 1, padding: SPACING.xs },
  card: {
    borderRadius: RADII.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.card,
    minHeight: 170,
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  cardEquipped: { borderColor: COLORS.primary, borderWidth: 3 },
  cardLocked: { opacity: 0.7 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: RADII.lg,
  },
  skinEmoji: { fontSize: 44, marginBottom: 4 },
  skinName: { fontSize: 15, fontWeight: '700', fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  skinDesc: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'Nunito_600SemiBold', textAlign: 'center', lineHeight: 16 },
  badge: {
    marginTop: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADII.pill,
    alignItems: 'center',
  },
  badgeEquipped: { backgroundColor: COLORS.secondary },
  badgeLocked: { backgroundColor: '#EEEEEE' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFF', fontFamily: 'Nunito_700Bold' },
});
