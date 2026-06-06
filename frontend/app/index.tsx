import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withDelay,
} from 'react-native-reanimated';
import { useGameStore } from '../src/store/gameStore';
import { COLORS, SHADOWS, RADII, SPACING } from '../src/constants/theme';

interface FloatProps { emoji: string; top?: number; bottom?: number; left?: number; right?: number; size?: number; delay?: number }

const FloatEmoji: React.FC<FloatProps> = ({ emoji, size = 30, delay = 0, ...pos }) => {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withTiming(-9, { duration: 1900 + delay * 0.1 }), -1, true));
  }, []);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.floatEmoji, pos, anim]}>
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { initialized, tradeCount, collectedIds, initGame } = useGameStore();

  const titleY   = useSharedValue(40);
  const titleOp  = useSharedValue(0);
  const btnScale = useSharedValue(0.85);

  useEffect(() => {
    titleY.value  = withSpring(0,  { damping: 12, stiffness: 80 });
    titleOp.value = withTiming(1,  { duration: 700 });
    btnScale.value= withDelay(400, withSpring(1, { damping: 10, stiffness: 120 }));
  }, []);

  const titleAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOp.value,
  }));
  const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handlePlay = () => {
    if (!initialized) initGame();
    router.replace('/(tabs)/trade');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient colors={['#FFE8F5', '#EAE8FF', '#E8FFF5']} style={StyleSheet.absoluteFill} />

      {/* Floating decorations */}
      <FloatEmoji emoji="🐻" top={80}  left={24}  size={36} delay={0}   />
      <FloatEmoji emoji="🐶" top={100} right={28} size={30} delay={500} />
      <FloatEmoji emoji="🍓" top={220} left={55}  size={24} delay={800} />
      <FloatEmoji emoji="🧋" top={180} right={70} size={26} delay={300} />
      <FloatEmoji emoji="🐱" bottom={220} left={35} size={32} delay={600} />
      <FloatEmoji emoji="🐸" bottom={200} right={40} size={28} delay={1100} />
      <FloatEmoji emoji="✨" top={290} left={100} size={20} delay={200} />
      <FloatEmoji emoji="🌸" top={250} right={90} size={20} delay={900} />
      <FloatEmoji emoji="🍩" bottom={320} left={70} size={22} delay={400} />
      <FloatEmoji emoji="🫐" bottom={300} right={60} size={22} delay={700} />

      <View style={styles.content}>
        {/* Title */}
        <Animated.View style={[styles.titleBlock, titleAnim]}>
          <View style={styles.titlePill}>
            <Text style={styles.titlePillText}>🎀 kawaii game</Text>
          </View>
          <Text style={styles.title}>Kawaii{'\n'}Sticker Trader</Text>
          <Text style={styles.subtitle}>Collect, bundle & haggle cute stickers!</Text>
        </Animated.View>

        {/* Stats pill (returning player) */}
        {initialized && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statVal}>{tradeCount}</Text>
              <Text style={styles.statLbl}>Trades</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statVal}>{collectedIds.length}</Text>
              <Text style={styles.statLbl}>Collected</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statVal}>{Math.round((collectedIds.length / 24) * 100)}%</Text>
              <Text style={styles.statLbl}>Complete</Text>
            </View>
          </View>
        )}

        {/* Play button */}
        <Animated.View style={btnAnim}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={handlePlay}
            activeOpacity={0.82}
            testID="home-play-button"
          >
            <Text style={styles.playBtnText}>
              {initialized ? '🐾  Continue Trading!' : '🐾  Start Trading!'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {initialized && (
          <TouchableOpacity
            onPress={initGame}
            style={styles.resetLink}
            testID="home-reset-button"
          >
            <Text style={styles.resetText}>↺ Reset game</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  floatEmoji: { position: 'absolute' },
  titleBlock: { alignItems: 'center', marginBottom: SPACING.xl },
  titlePill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADII.pill,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  titlePillText: { fontSize: 13, color: '#FFF', fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  title: {
    fontSize: 46,
    fontWeight: '700',
    fontFamily: 'Fredoka_700Bold',
    color: COLORS.textMain,
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: SPACING.sm,
  },
  subtitle: { fontSize: 15, color: COLORS.textMuted, fontFamily: 'Nunito_600SemiBold', textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  statChip: { alignItems: 'center', paddingHorizontal: SPACING.md },
  statVal: { fontSize: 22, fontWeight: '700', color: COLORS.primaryDark, fontFamily: 'Fredoka_700Bold' },
  statLbl: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'Nunito_600SemiBold' },
  statDivider: { width: 1.5, height: 28, backgroundColor: COLORS.primary, opacity: 0.4 },
  playBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: RADII.pill,
    ...SHADOWS.float,
    marginBottom: SPACING.md,
  },
  playBtnText: { fontSize: 18, fontWeight: '800', color: '#FFF', fontFamily: 'Fredoka_700Bold' },
  resetLink: { padding: SPACING.sm },
  resetText: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'Nunito_600SemiBold' },
});
