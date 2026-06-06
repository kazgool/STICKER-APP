/**
 * UnlockCelebration.tsx
 * Full-screen confetti burst overlay — triggered when a new paw skin unlocks.
 * 20 emoji particles burst from the centre of the screen using Reanimated.
 * Pointer events are disabled so the overlay never blocks touch input.
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// ── Constants ─────────────────────────────────────────────────────
const EMOJIS = ['✨', '🎊', '🌟', '⭐', '💫', '🎉', '🐾', '🎀', '🌸', '💕'];
const N = 20; // particle count

interface ParticleCfg {
  emoji:    string;
  fontSize: number;
  vx:       number; // final x offset in px
  vy:       number; // peak y offset in px (negative = upward in RN coords)
  delay:    number; // stagger delay in ms
}

// ── Individual confetti particle — hooks called per component instance ──
const ConfettiParticle: React.FC<{
  cfg:     ParticleCfg;
  originX: number;
  originY: number;
}> = ({ cfg, originX, originY }) => {
  const tx      = useSharedValue(0);
  const ty      = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale   = useSharedValue(0);
  const rot     = useSharedValue(0);

  useEffect(() => {
    const d = cfg.delay;

    // ① Appear
    opacity.value = withDelay(d, withTiming(1, { duration: 80 }));
    scale.value   = withDelay(d, withSpring(1, { damping: 5, stiffness: 320 }));

    // ② Travel outward then arc down (gravity simulation)
    tx.value = withDelay(d,
      withTiming(cfg.vx, { duration: 1300, easing: Easing.out(Easing.cubic) }),
    );
    ty.value = withDelay(d,
      withSequence(
        withTiming(cfg.vy,       { duration: 650, easing: Easing.out(Easing.quad) }),
        withTiming(cfg.vy + 110, { duration: 650, easing: Easing.in(Easing.quad) }),
      ),
    );

    // ③ Spin
    rot.value = withDelay(d,
      withTiming(cfg.vx > 0 ? 540 : -540, { duration: 1300 }),
    );

    // ④ Fade & shrink out
    opacity.value = withDelay(d + 720, withTiming(0, { duration: 580 }));
    scale.value   = withDelay(d + 880, withTiming(0, { duration: 420 }));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[s.particle, { left: originX, top: originY }, anim]}>
      <Text style={{ fontSize: cfg.fontSize }}>{cfg.emoji}</Text>
    </Animated.View>
  );
};

// ── Expanding ring flash at the burst origin ──────────────────────
const BurstRing: React.FC<{ originX: number; originY: number }> = ({ originX, originY }) => {
  const scale   = useSharedValue(0.2);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    scale.value   = withSpring(4, { damping: 7, stiffness: 100 });
    opacity.value = withTiming(0, { duration: 700 });
  }, []);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity:   opacity.value,
  }));

  return (
    <Animated.View
      style={[s.burstRing, { left: originX - 22, top: originY - 22 }, anim]}
    />
  );
};

// ── Main export ───────────────────────────────────────────────────
export const UnlockCelebration: React.FC<{ skinId: string }> = ({ skinId }) => {
  const { width, height } = useWindowDimensions();

  // Compute particle configs once per skin unlock (deterministic pseudo-random)
  const particles = useMemo<ParticleCfg[]>(() => {
    return Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2;                   // evenly fanned
      const dist  = 70 + (i % 3) * 55;                       // 70 / 125 / 180 px
      const jit   = ((i * 17) % 32) - 16;                    // deterministic jitter
      return {
        emoji:    EMOJIS[i % EMOJIS.length],
        fontSize: 18 + (i % 4) * 5,                          // 18 / 23 / 28 / 33 px
        vx:       Math.cos(angle) * dist + jit,
        vy:       Math.sin(angle) * dist - 55 + jit,         // slight upward bias
        delay:    (i % 5) * 38,                              // 0–152 ms stagger
      };
    });
  }, [skinId]);

  // Burst origin — vertically centred on the AI offer zone area
  const originX = width  / 2 - 16;
  const originY = height * 0.35;

  return (
    <View style={[StyleSheet.absoluteFill, s.overlay]}>
      <BurstRing originX={originX} originY={originY} />
      {particles.map((cfg, i) => (
        <ConfettiParticle
          key={`${skinId}-${i}`}
          cfg={cfg}
          originX={originX}
          originY={originY}
        />
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  overlay:   {
    zIndex: 9999,
    // Disable pointer events so overlay never blocks the game UI
    pointerEvents: 'none',
  },
  particle:  { position: 'absolute' },
  burstRing: {
    position:        'absolute',
    width:           44,
    height:          44,
    borderRadius:    22,
    borderWidth:     3,
    borderColor:     '#FF9AA2',
    backgroundColor: 'transparent',
  },
});
