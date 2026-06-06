import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Rarity } from '../data/stickers';
import { COLORS } from '../constants/theme';

interface Props {
  rarity: Rarity;
  compact?: boolean;
  showValue?: boolean;
  value?: number;
}

const RARITY_LABELS: Record<Rarity, string> = {
  Common: 'Common',
  Uncommon: 'Uncommon',
  Rare: 'Rare',
  Legendary: 'Legendary ✨',
};

export const RarityBadge: React.FC<Props> = ({ rarity, compact = false, showValue, value }) => {
  const rc = COLORS.rarity[rarity];
  return (
    <View style={[styles.badge, { backgroundColor: rc.bg, borderColor: rc.border }, compact && styles.compact]}>
      <Text style={[styles.text, { color: rc.text }, compact && styles.compactText]}>
        {compact ? rarity[0] : RARITY_LABELS[rarity]}
        {showValue && value !== undefined ? `  ⭐${value}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1.5,
    alignSelf: 'center',
  },
  compact: { paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, fontFamily: 'Nunito_700Bold' },
  compactText: { fontSize: 8 },
});
