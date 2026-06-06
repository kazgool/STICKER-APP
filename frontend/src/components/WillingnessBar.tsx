import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADII, SHADOWS } from '../constants/theme';

interface Props {
  level: number; // 0–100
}

export const WillingnessBar: React.FC<Props> = ({ level }) => {
  const animFlex  = useSharedValue(0);   // 0.0 → 1.0
  const pawBounce = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    const target = Math.min(level, 100) / 100;
    animFlex.value = withSpring(target, { damping: 14, stiffness: 80 });

    if (level >= 100) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.6, { duration: 350 }), withTiming(0, { duration: 350 })),
        -1, true
      );
      pawBounce.value = withRepeat(
        withSequence(withTiming(-5, { duration: 180 }), withTiming(0, { duration: 180 })),
        3, false
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
      pawBounce.value   = withTiming(0, { duration: 200 });
    }
  }, [level]);

  // Smooth colour transitions: pink → peach → mint → bright mint
  const barAnim = useAnimatedStyle(() => ({
    flex: animFlex.value,
    backgroundColor: interpolateColor(
      animFlex.value,
      [0, 0.30, 0.65, 1.0],
      ['#FF9AA2', '#FFDAC1', '#B5EAD7', '#52C788']
    ),
  }));

  const glowAnim = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const pawAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: pawBounce.value }],
  }));

  const pct   = Math.round(Math.min(level, 100));
  const label =
    level <= 0  ? '😒 No interest...'    :
    level < 40  ? '🙁 Not feeling it...' :
    level < 70  ? '🤔 Hmm, maybe...'     :
    level < 100 ? '😊 Getting warmer!'   :
                  '✨ DEAL! Tap Accept!';

  const labelColor =
    level >= 100 ? '#2E7D32' :
    level >= 70  ? '#C07800' :
    level >= 40  ? '#B06020' : '#B03030';

  return (
    <View style={styles.container} testID="willingness-bar">
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>💕 Willingness</Text>
        <Text style={[styles.pctText, { color: labelColor }]}>
          {pct}%{level >= 100 ? ' 🎉' : ''}
        </Text>
      </View>

      {/* Animated bar */}
      <View style={styles.track}>
        {/* Filled portion */}
        <Animated.View style={[styles.fill, barAnim]} />
        {/* Glow overlay at 100% */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.glowOverlay, glowAnim]} />
      </View>

      {/* Status row */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusText, { color: labelColor }]}>{label}</Text>
        <Animated.View style={pawAnim}>
          <Text style={styles.pawIcon}>{level >= 100 ? '🎊' : '🐾'}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontFamily: 'Nunito_700Bold',
  },
  pctText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Nunito_700Bold',
  },
  track: {
    height: 12,
    backgroundColor: '#EEE',
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    minWidth: 6,
  },
  glowOverlay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  pawIcon: { fontSize: 14 },
});
