import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../../src/store/gameStore';
import { AIPawZone } from '../../src/components/AIPawZone';
import { TradeTableZone } from '../../src/components/TradeTableZone';
import { InventoryScroll } from '../../src/components/InventoryScroll';
import { PAW_SKIN_EMOJIS, COLORS, SPACING, RADII, SHADOWS } from '../../src/constants/theme';

export default function TradeScreen() {
  const {
    initialized, initGame, startNewRound,
    aiOffer, playerOffer, aiMessage, tradeStatus, willingnessLevel,
    inventory, equippedSkinId, tradeCount, collectedIds,
    addToPlayerOffer, removeFromPlayerOffer, acceptTrade, rejectTrade,
    newlyUnlockedSkinId, clearNewUnlock,
  } = useGameStore();

  const roundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bootstrap
  useEffect(() => {
    if (!initialized) initGame();
    else if (aiOffer.length === 0) startNewRound();
  }, [initialized]);

  // Auto-advance after accepted/rejected
  useEffect(() => {
    if (tradeStatus === 'accepted' || tradeStatus === 'rejected') {
      roundTimer.current = setTimeout(() => startNewRound(), 2000);
    }
    return () => { if (roundTimer.current) clearTimeout(roundTimer.current); };
  }, [tradeStatus]);

  // Auto-dismiss new unlock badge
  useEffect(() => {
    if (newlyUnlockedSkinId) {
      const t = setTimeout(() => clearNewUnlock(), 3500);
      return () => clearTimeout(t);
    }
  }, [newlyUnlockedSkinId]);

  const skinEmoji = PAW_SKIN_EMOJIS[equippedSkinId] ?? '🐾';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#FFE8F5', '#EBE8FF', '#E8FFF5']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header} testID="trade-screen-header">
        <Text style={styles.headerTitle}>🐾 Sticker Trader</Text>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>🔄 {tradeCount}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>📖 {collectedIds.length}/24</Text>
          </View>
        </View>
      </View>

      {/* Newly unlocked skin toast */}
      {newlyUnlockedSkinId != null && (
        <View style={styles.unlockToast} testID="unlock-toast">
          <Text style={styles.unlockText}>
            🎉 New Paw Unlocked: {PAW_SKIN_EMOJIS[newlyUnlockedSkinId]}!
          </Text>
        </View>
      )}

      {/* AI Zone (includes willingness bar) */}
      <AIPawZone
        aiOffer={aiOffer}
        aiMessage={aiMessage}
        willingnessLevel={willingnessLevel}
      />

      {/* Trade Table */}
      <TradeTableZone
        aiOffer={aiOffer}
        playerOffer={playerOffer}
        willingnessLevel={willingnessLevel}
        onAccept={acceptTrade}
        onReject={rejectTrade}
        onRemoveFromOffer={removeFromPlayerOffer}
        tradeStatus={tradeStatus}
      />

      {/* Inventory */}
      <InventoryScroll
        inventory={inventory}
        playerOffer={playerOffer}
        onAddToTrade={addToPlayerOffer}
        onRemoveFromTrade={removeFromPlayerOffer}
        equippedSkinEmoji={skinEmoji}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    fontFamily: 'Fredoka_700Bold',
  },
  headerStats: { flexDirection: 'row', gap: SPACING.xs },
  statBadge: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  statText: { fontSize: 12, fontWeight: '700', color: COLORS.textMain, fontFamily: 'Nunito_700Bold' },
  unlockToast: {
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
  unlockText: { fontSize: 13, fontWeight: '700', color: '#C06000', fontFamily: 'Nunito_700Bold', textAlign: 'center' },
});
