import { ALL_STICKERS, RARITY_VALUES, StickerDef, StickerInstance, Rarity, Family } from '../data/stickers';

const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const calcDefValue = (stickers: StickerDef[]): number =>
  stickers.reduce((sum, s) => sum + RARITY_VALUES[s.rarity], 0);

export const calcInstanceValue = (stickers: StickerInstance[]): number =>
  stickers.reduce((sum, s) => sum + RARITY_VALUES[s.rarity], 0);

export const isTradeBalanced = (
  playerOffer: StickerInstance[],
  aiOffer: StickerDef[]
): boolean =>
  playerOffer.length > 0 &&
  calcInstanceValue(playerOffer) === calcDefValue(aiOffer);

export const generateAIOffer = (
  tradeCount: number,
  collectedIds: string[]
): StickerDef[] => {
  let tier: Rarity;
  if (tradeCount < 6)       tier = 'Common';
  else if (tradeCount < 12) tier = 'Uncommon';
  else if (tradeCount < 18) tier = 'Rare';
  else                      tier = 'Legendary';

  const tierPool = ALL_STICKERS.filter(s => s.rarity === tier);
  const uncollected = tierPool.filter(s => !collectedIds.includes(s.id));
  const pool = uncollected.length > 0 ? uncollected : tierPool;

  return [randomFrom(pool)];
};

export const createInstance = (def: StickerDef): StickerInstance => ({
  instanceId: `${def.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  stickerId: def.id,
  family: def.family,
  scenario: def.scenario,
  rarity: def.rarity,
  animalEmoji: def.animalEmoji,
  scenarioEmoji: def.scenarioEmoji,
});

/**
 * Willingness Meter Math
 * base    = (playerValue / aiValue) * 100
 * bonus   = +10 if any player sticker shares Family with AI's sticker
 * penalty = -20 if single card offered AND playerValue < aiValue
 * final   = clamp(0, 100)
 */
export const computeWillingness = (
  playerOffer: StickerInstance[],
  aiOffer: StickerDef[]
): number => {
  if (playerOffer.length === 0 || aiOffer.length === 0) return 0;

  const playerVal = calcInstanceValue(playerOffer);
  const aiVal     = calcDefValue(aiOffer);
  if (aiVal === 0) return 100;

  let w = (playerVal / aiVal) * 100;

  // Family bonus: player has a sticker of same family as AI's offer
  const aiFamilies = new Set<string>(aiOffer.map(s => s.family));
  if (playerOffer.some(p => aiFamilies.has(p.family))) w += 10;

  // Penalty: single low-value card for a high-value offer
  if (playerOffer.length === 1 && playerVal < aiVal) w -= 20;

  return Math.max(0, Math.min(100, w));
};

export const getInitialInventory = (): StickerInstance[] => {
  const starterIds = ['wb_1', 'wb_1', 'wb_2', 'fp_1', 'fp_1', 'fp_2', 'kt_1', 'kt_2', 'fr_1', 'fr_2'];
  return starterIds.map(id => {
    const def = ALL_STICKERS.find(s => s.id === id)!;
    return createInstance(def);
  });
};
