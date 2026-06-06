/**
 * AudioContext.tsx
 * Centralised sound management for Kawaii Sticker Trader.
 * Preloads 3 local .wav files via expo-audio and exposes
 * playYay / playAww / playPop through React Context.
 */

import React, { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import { useAudioPlayer } from 'expo-audio';

// ── Asset references (resolved by Metro bundler at build time) ─────
const YAY_SOUND = require('../../assets/sounds/yay.wav');
const AWW_SOUND = require('../../assets/sounds/aww.wav');
const POP_SOUND = require('../../assets/sounds/pop.wav');

// ── Context type ──────────────────────────────────────────────────
type AudioContextType = {
  playYay: () => void;
  playAww: () => void;
  playPop: () => void;
};

const AudioCtx = createContext<AudioContextType>({
  playYay: () => {},
  playAww: () => {},
  playPop: () => {},
});

// ── Safe play helper — always restarts from position 0 ────────────
const safePlay = (player: ReturnType<typeof useAudioPlayer>): void => {
  try {
    // Seek back to beginning so rapid re-triggers work correctly
    player.seekTo(0);
    player.play();
  } catch (err) {
    console.warn('[Audio] playback error:', err);
  }
};

// ── Provider ──────────────────────────────────────────────────────
export const AudioProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // useAudioPlayer ties each player's lifecycle to this provider.
  // Players are created once at app start and reused for zero overhead.
  const yayPlayer = useAudioPlayer(YAY_SOUND);
  const awwPlayer = useAudioPlayer(AWW_SOUND);
  const popPlayer = useAudioPlayer(POP_SOUND);

  const value = useMemo<AudioContextType>(
    () => ({
      playYay: () => safePlay(yayPlayer),
      playAww: () => safePlay(awwPlayer),
      playPop: () => safePlay(popPlayer),
    }),
    [yayPlayer, awwPlayer, popPlayer],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
};

// ── Consumer hook ─────────────────────────────────────────────────
export const useAudio = (): AudioContextType => useContext(AudioCtx);
