import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Rarity } from '../data/stickers';
import { COLORS, SHADOWS, RADII } from '../constants/theme';

interface Props {
  animalEmoji: string;
  scenarioEmoji: string;
  rarity: Rarity;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  isLocked?: boolean;
  onPress?: () => void;
  floating?: boolean;
  floatDelay?: number;
  testID?: string;
}

const SIZES = {
  xs: { card: 62,  animal: 24, scenario: 14, pad: 5 },
  sm: { card: 78,  animal: 30, scenario: 17, pad: 7 },
  md: { card: 94,  animal: 38, scenario: 21, pad: 9 },
  lg: { card: 112, animal: 46, scenario: 25, pad: 11 },
};

export const StickerCard: React.FC<Props> = ({
  animalEmoji,
  scenarioEmoji,
  rarity,
  size = 'md',
  isSelected = false,
  isLocked = false,
  onPress,
  floating = false,
  floatDelay = 0,
  testID,
}) => {
  const cfg = SIZES[size];
  const rc  = COLORS.rarity[rarity];

  const floatY  = useSharedValue(0);
  const scale   = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 120 });
    if (floating && !isLocked) {
      floatY.value = withDelay(
        floatDelay,
        withRepeat(withTiming(-5, { duration: 1800 + floatDelay * 0.2 }), -1, true)
      );
    }
  }, []);

  const containerAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: scale.value }],
  }));

  const handleIn  = () => { if (onPress) scale.value = withSpring(0.88, { damping: 10, stiffness: 220 }); };
  const handleOut = () => { if (onPress) scale.value = withSpring(1,    { damping: 10, stiffness: 220 }); };

  const borderColor = isSelected ? COLORS.primary : '#FFFFFF';

  return (
    <Animated.View style={containerAnim} testID={testID}>
      <Pressable onPress={onPress} onPressIn={handleIn} onPressOut={handleOut} disabled={!onPress}>
        <View style={[
          styles.bubble,
          { width: cfg.card, height: cfg.card, borderColor, borderWidth: isSelected ? 4 : 3.5 },
          SHADOWS.soft,
        ]}>
          {isLocked ? (
            <View style={[styles.inner, styles.lockedBg, { padding: cfg.pad }]}>
              <Text style={[styles.lockedEmoji, { fontSize: cfg.animal }]}>{animalEmoji}</Text>
              <Text style={[styles.lockedEmoji, { fontSize: cfg.scenario, marginTop: -3 }]}>{scenarioEmoji}</Text>
              <View style={styles.lockOverlay}>
                <Text style={{ fontSize: cfg.animal * 0.5 }}>🔒</Text>
              </View>
            </View>
          ) : (
            <LinearGradient colors={rc.gradient} style={[styles.inner, { padding: cfg.pad }]}>
              <Text style={{ fontSize: cfg.animal }}>{animalEmoji}</Text>
              <Text style={{ fontSize: cfg.scenario, marginTop: -3 }}>{scenarioEmoji}</Text>
            </LinearGradient>
          )}

          {/* Rarity corner dot */}
          {!isLocked && (
            <View style={[styles.rarityDot, { backgroundColor: rc.border }]} />
          )}
          {/* Selected check */}
          {isSelected && (
            <View style={styles.checkBadge} testID={`selected-badge-${testID}`}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    borderRadius: RADII.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  inner: {
    flex: 1,
    width: '100%',
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lockedBg: { backgroundColor: '#E8E8E8' },
  lockedEmoji: { opacity: 0.25 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: RADII.sm,
  },
  rarityDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkText: { fontSize: 10, color: '#FFF', fontWeight: '900' },
});
