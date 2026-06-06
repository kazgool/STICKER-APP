import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';
import { ALL_STICKERS, FAMILIES, FAMILY_EMOJIS, Family } from '../../src/data/stickers';
import { StickerCard } from '../../src/components/StickerCard';
import { RarityBadge } from '../../src/components/RarityBadge';
import { COLORS, SPACING, RADII, SHADOWS } from '../../src/constants/theme';

const CHIPS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: '🌟 All' },
  ...FAMILIES.map(f => ({ key: f, label: `${FAMILY_EMOJIS[f]} ${f}` })),
];

export default function StickerdexScreen() {
  const { collectedIds } = useGameStore();
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = filter === 'ALL'
    ? ALL_STICKERS
    : ALL_STICKERS.filter(s => s.family === filter);

  const collectedCount = collectedIds.length;
  const pct = Math.round((collectedCount / 24) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#FFE8F5', '#EBE8FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header} testID="stickerdex-header">
        <Text style={styles.title}>📖 Stickerdex</Text>
        <Text style={styles.subtitle}>{collectedCount} / 24 collected</Text>
        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
        </View>
      </View>

      {/* Family filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
        testID="family-filter-chips"
      >
        {CHIPS.map(chip => (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, filter === chip.key && styles.chipActive]}
            onPress={() => setFilter(chip.key)}
            testID={`filter-chip-${chip.key}`}
          >
            <Text style={[styles.chipText, filter === chip.key && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        testID="stickerdex-grid"
        renderItem={({ item }) => {
          const isCollected = collectedIds.includes(item.id);
          return (
            <View style={styles.cell} testID={`dex-cell-${item.id}`}>
              <View style={isCollected ? undefined : styles.lockedWrapper}>
                <StickerCard
                  animalEmoji={item.animalEmoji}
                  scenarioEmoji={item.scenarioEmoji}
                  rarity={item.rarity}
                  size="sm"
                  isLocked={!isCollected}
                  testID={`dex-sticker-${item.id}`}
                />
              </View>
              <Text style={styles.cellLabel} numberOfLines={1}>
                {isCollected ? item.scenario.split(' ').slice(0, 2).join(' ') : '???'}
              </Text>
              <RarityBadge rarity={item.rarity} compact />
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No stickers to show</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.sm },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Fredoka_700Bold' },
  subtitle: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'Nunito_600SemiBold', marginBottom: 6 },
  progressBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  chipScroll: { flexGrow: 0, marginBottom: 4 },
  chipRow: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingVertical: SPACING.xs },
  chip: {
    height: 36,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.primaryDark, fontFamily: 'Nunito_700Bold', flexShrink: 0 },
  chipTextActive: { color: '#FFF' },
  grid: { paddingHorizontal: SPACING.sm, paddingBottom: SPACING.xl },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: 2,
    gap: 3,
  },
  lockedWrapper: { opacity: 0.35 },
  cellLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    width: 76,
  },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
});
