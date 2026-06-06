import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_STICKERS, StickerDef, StickerInstance, FAMILY_IDS } from '../data/stickers';
import {
  generateAIOffer,
  calcDefValue,
  calcInstanceValue,
  createInstance,
  getInitialInventory,
  computeWillingness,
} from '../utils/tradeEngine';

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const AI_MSG = {
  offering: [
    'Nyan~ I have something for you! ✨',
    'Hewwo! Want to trade? 🌸',
    'Ooh this one sparkles! 💫',
    'Trade with me? Pwease? 🥺',
    'I found this just for you! 🎀',
    'Come trade, come trade! ⭐',
  ],
  success: [
    'Yay!! So happy!! 🎉',
    'Uwu besties!! 💕',
    'The BEST trade!! ⭐',
    "You're amazing!! 🌟",
    'Nyahaha we both win!! 🎊',
  ],
  fail: [
    "Hmm... values don't match~ 🤔",
    "That's not quite fair, nya~ 🌸",
    'Try adding more stickers! ✨',
    'Not balanced yet~ 💭',
  ],
  reject: [
    'Oh noooo~ 😢',
    'Maybe next time~ 🥺',
    "I'll keep this one then! 💪",
    'Aww... okay then~ 🌸',
  ],
  haggle: [
    'Oh? You want MORE? 👀',
    'Fine, take another! 🎁',
    'Pushing your luck~ ✨',
    'More stickers? Okay okay! 🌸',
  ],
};

interface GameState {
  initialized: boolean;
  tradeCount: number;
  inventory: StickerInstance[];
  collectedIds: string[];
  unlockedSkinIds: string[];
  equippedSkinId: string;
  newlyUnlockedSkinId: string | null;

  // Current round
  aiOffer: StickerDef[];
  playerOffer: StickerInstance[];
  aiMessage: string;
  tradeStatus: 'idle' | 'accepted' | 'rejected' | 'fail';
  willingnessLevel: number; // 0–100

  // Actions
  initGame: () => void;
  startNewRound: () => void;
  addToPlayerOffer: (instance: StickerInstance) => void;
  removeFromPlayerOffer: (instanceId: string) => void;
  acceptTrade: () => boolean;
  rejectTrade: () => void;
  equipSkin: (skinId: string) => void;
  clearNewUnlock: () => void;
  addAICard: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      initialized: false,
      tradeCount: 0,
      inventory: [],
      collectedIds: [],
      unlockedSkinIds: ['pink'],
      equippedSkinId: 'pink',
      newlyUnlockedSkinId: null,
      aiOffer: [],
      playerOffer: [],
      aiMessage: 'Hewwo! Want to trade? 🌸',
      tradeStatus: 'idle',
      willingnessLevel: 0,

      initGame: () => {
        const inventory = getInitialInventory();
        const collectedIds = [...new Set(inventory.map(i => i.stickerId))];
        const aiOffer = generateAIOffer(0, collectedIds);
        set({
          initialized: true,
          tradeCount: 0,
          inventory,
          collectedIds,
          unlockedSkinIds: ['pink'],
          equippedSkinId: 'pink',
          newlyUnlockedSkinId: null,
          aiOffer,
          playerOffer: [],
          willingnessLevel: 0,
          aiMessage: rand(AI_MSG.offering),
          tradeStatus: 'idle',
        });
      },

      resetGame: () => {
        get().initGame();
      },

      startNewRound: () => {
        const { tradeCount, collectedIds } = get();
        set({
          aiOffer: generateAIOffer(tradeCount, collectedIds),
          playerOffer: [],
          willingnessLevel: 0,
          tradeStatus: 'idle',
          aiMessage: rand(AI_MSG.offering),
        });
      },

      addToPlayerOffer: (instance) => {
        const { playerOffer, aiOffer } = get();
        if (playerOffer.some(i => i.instanceId === instance.instanceId)) return;
        const newOffer = [...playerOffer, instance];
        set({
          playerOffer: newOffer,
          willingnessLevel: computeWillingness(newOffer, aiOffer),
          tradeStatus: 'idle',
        });
      },

      removeFromPlayerOffer: (instanceId) => {
        const { playerOffer, aiOffer } = get();
        const newOffer = playerOffer.filter(i => i.instanceId !== instanceId);
        set({
          playerOffer: newOffer,
          willingnessLevel: computeWillingness(newOffer, aiOffer),
          tradeStatus: 'idle',
        });
      },

      acceptTrade: () => {
        const { aiOffer, playerOffer, inventory, collectedIds, tradeCount, unlockedSkinIds } = get();
        const aiVal = calcDefValue(aiOffer);
        const playerVal = calcInstanceValue(playerOffer);

        // Gate: willingness must reach 100
        if (get().willingnessLevel < 100 || playerOffer.length === 0) {
          set({ aiMessage: rand(AI_MSG.fail), tradeStatus: 'fail' });
          return false;
        }

        const offeredIds = new Set(playerOffer.map(i => i.instanceId));
        const newInventory = inventory.filter(i => !offeredIds.has(i.instanceId));
        const gained = aiOffer.map(def => createInstance(def));
        const finalInventory = [...newInventory, ...gained];

        // Safety net: ensure player always has stickers
        if (finalInventory.length < 3) {
          const extras = getInitialInventory().slice(0, 4);
          finalInventory.push(...extras);
        }

        const newCollectedIds = [...new Set([...collectedIds, ...aiOffer.map(s => s.id)])];
        const newTradeCount = tradeCount + 1;

        // Check unlocks
        const newUnlocks: string[] = [];
        if (newTradeCount >= 5  && !unlockedSkinIds.includes('golden'))  newUnlocks.push('golden');
        if (newTradeCount >= 15 && !unlockedSkinIds.includes('rainbow')) newUnlocks.push('rainbow');
        const hasFamily = Object.values(FAMILY_IDS).some(ids => ids.every(id => newCollectedIds.includes(id)));
        if (hasFamily && !unlockedSkinIds.includes('crystal')) newUnlocks.push('crystal');
        const legendaries = ['wb_6','fp_6','kt_6','fr_6'];
        if (legendaries.every(id => newCollectedIds.includes(id)) && !unlockedSkinIds.includes('galaxy')) newUnlocks.push('galaxy');

        set({
          inventory: finalInventory,
          collectedIds: newCollectedIds,
          tradeCount: newTradeCount,
          playerOffer: [],
          willingnessLevel: 0,
          tradeStatus: 'accepted',
          aiMessage: rand(AI_MSG.success),
          unlockedSkinIds: [...unlockedSkinIds, ...newUnlocks],
          newlyUnlockedSkinId: newUnlocks.length > 0 ? newUnlocks[0] : null,
        });
        return true;
      },

      rejectTrade: () => {
        set({ playerOffer: [], willingnessLevel: 0, tradeStatus: 'rejected', aiMessage: rand(AI_MSG.reject) });
      },

      equipSkin: (skinId) => {
        const { unlockedSkinIds } = get();
        if (unlockedSkinIds.includes(skinId)) set({ equippedSkinId: skinId });
      },

      clearNewUnlock: () => set({ newlyUnlockedSkinId: null }),

      addAICard: () => {
        const { aiOffer, playerOffer } = get();
        const existingIds = new Set(aiOffer.map(s => s.id));
        const available = ALL_STICKERS.filter(s => !existingIds.has(s.id));
        const pool = available.length > 0 ? available : ALL_STICKERS;
        const extra = pool[Math.floor(Math.random() * pool.length)];
        const newAIOffer = [...aiOffer, extra];
        set({
          aiOffer: newAIOffer,
          willingnessLevel: computeWillingness(playerOffer, newAIOffer),
          aiMessage: rand(AI_MSG.haggle),
        });
      },
    }),
    {
      name: 'kawaii-sticker-game-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        initialized: s.initialized,
        tradeCount: s.tradeCount,
        inventory: s.inventory,
        collectedIds: s.collectedIds,
        unlockedSkinIds: s.unlockedSkinIds,
        equippedSkinId: s.equippedSkinId,
      }),
    }
  )
);
