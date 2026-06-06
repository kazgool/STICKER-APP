export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
export type Family = 'White Bears' | 'Fluffy Pups' | 'Kitties' | 'Frogs';

export interface StickerDef {
  id: string;
  family: Family;
  scenario: string;
  rarity: Rarity;
  animalEmoji: string;
  scenarioEmoji: string;
}

export interface StickerInstance {
  instanceId: string;
  stickerId: string;
  family: Family;
  scenario: string;
  rarity: Rarity;
  animalEmoji: string;
  scenarioEmoji: string;
}

export const RARITY_VALUES: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 3,
  Rare: 9,
  Legendary: 27,
};

export const FAMILIES: Family[] = ['White Bears', 'Fluffy Pups', 'Kitties', 'Frogs'];

export const FAMILY_EMOJIS: Record<Family, string> = {
  'White Bears': '🐻',
  'Fluffy Pups': '🐶',
  'Kitties':     '🐱',
  'Frogs':       '🐸',
};

export const FAMILY_IDS: Record<Family, string[]> = {
  'White Bears': ['wb_1','wb_2','wb_3','wb_4','wb_5','wb_6'],
  'Fluffy Pups': ['fp_1','fp_2','fp_3','fp_4','fp_5','fp_6'],
  'Kitties':     ['kt_1','kt_2','kt_3','kt_4','kt_5','kt_6'],
  'Frogs':       ['fr_1','fr_2','fr_3','fr_4','fr_5','fr_6'],
};

export const ALL_STICKERS: StickerDef[] = [
  // ── WHITE BEARS ─────────────────────────────────────────────────
  { id: 'wb_1', family: 'White Bears', scenario: 'Sleeping in Blueberry Parfait', rarity: 'Common',    animalEmoji: '🐻', scenarioEmoji: '🫐' },
  { id: 'wb_2', family: 'White Bears', scenario: 'Holding a Tiny Teacup',         rarity: 'Common',    animalEmoji: '🐻', scenarioEmoji: '🍵' },
  { id: 'wb_3', family: 'White Bears', scenario: 'Riding a Strawberry Macaron',   rarity: 'Uncommon',  animalEmoji: '🐻', scenarioEmoji: '🍓' },
  { id: 'wb_4', family: 'White Bears', scenario: 'Bathing in Hot Cocoa',          rarity: 'Uncommon',  animalEmoji: '🐻', scenarioEmoji: '☕' },
  { id: 'wb_5', family: 'White Bears', scenario: 'Star Crown in Boba Tea',        rarity: 'Rare',      animalEmoji: '🐻', scenarioEmoji: '🧋' },
  { id: 'wb_6', family: 'White Bears', scenario: 'Flying on Cream Puff Cloud',    rarity: 'Legendary', animalEmoji: '🐻', scenarioEmoji: '☁️' },

  // ── FLUFFY PUPS ──────────────────────────────────────────────────
  { id: 'fp_1', family: 'Fluffy Pups', scenario: 'Sitting on a Glazed Donut',      rarity: 'Common',    animalEmoji: '🐶', scenarioEmoji: '🍩' },
  { id: 'fp_2', family: 'Fluffy Pups', scenario: 'Napping on a Croissant',          rarity: 'Common',    animalEmoji: '🐶', scenarioEmoji: '🥐' },
  { id: 'fp_3', family: 'Fluffy Pups', scenario: 'Surfing a Latte Wave',            rarity: 'Uncommon',  animalEmoji: '🐶', scenarioEmoji: '☕' },
  { id: 'fp_4', family: 'Fluffy Pups', scenario: 'Peeking from a Warm Mug',         rarity: 'Uncommon',  animalEmoji: '🐶', scenarioEmoji: '🫖' },
  { id: 'fp_5', family: 'Fluffy Pups', scenario: 'Angel Wings on Melon Slice',      rarity: 'Rare',      animalEmoji: '🐶', scenarioEmoji: '🍈' },
  { id: 'fp_6', family: 'Fluffy Pups', scenario: 'Crowned on Rainbow Pancake Stack',rarity: 'Legendary', animalEmoji: '🐶', scenarioEmoji: '🥞' },

  // ── KITTIES ──────────────────────────────────────────────────────
  { id: 'kt_1', family: 'Kitties', scenario: 'Curled Up in a Teacup',        rarity: 'Common',    animalEmoji: '🐱', scenarioEmoji: '🍵' },
  { id: 'kt_2', family: 'Kitties', scenario: 'Hugging a Giant Strawberry',   rarity: 'Common',    animalEmoji: '🐱', scenarioEmoji: '🍓' },
  { id: 'kt_3', family: 'Kitties', scenario: 'Sitting in a Cute Bento Box',  rarity: 'Uncommon',  animalEmoji: '🐱', scenarioEmoji: '🍱' },
  { id: 'kt_4', family: 'Kitties', scenario: 'Peeking from a Sunflower',     rarity: 'Uncommon',  animalEmoji: '🐱', scenarioEmoji: '🌻' },
  { id: 'kt_5', family: 'Kitties', scenario: 'Bathing in a Parfait Glass',   rarity: 'Rare',      animalEmoji: '🐱', scenarioEmoji: '🍨' },
  { id: 'kt_6', family: 'Kitties', scenario: 'Sleeping on a Giant Star Cake',rarity: 'Legendary', animalEmoji: '🐱', scenarioEmoji: '🎂' },

  // ── FROGS ────────────────────────────────────────────────────────
  { id: 'fr_1', family: 'Frogs', scenario: 'Sitting Under a Tiny Mushroom', rarity: 'Common',    animalEmoji: '🐸', scenarioEmoji: '🍄' },
  { id: 'fr_2', family: 'Frogs', scenario: 'Holding a Rainbow Umbrella',    rarity: 'Common',    animalEmoji: '🐸', scenarioEmoji: '🌂' },
  { id: 'fr_3', family: 'Frogs', scenario: 'Napping on a Lily Pad',         rarity: 'Uncommon',  animalEmoji: '🐸', scenarioEmoji: '🌿' },
  { id: 'fr_4', family: 'Frogs', scenario: 'Riding a Giant Blueberry',      rarity: 'Uncommon',  animalEmoji: '🐸', scenarioEmoji: '🫐' },
  { id: 'fr_5', family: 'Frogs', scenario: 'Cherry Hat on Cake Roll',       rarity: 'Rare',      animalEmoji: '🐸', scenarioEmoji: '🍒' },
  { id: 'fr_6', family: 'Frogs', scenario: 'In a Giant Boba Cup with Stars',rarity: 'Legendary', animalEmoji: '🐸', scenarioEmoji: '🧋' },
];
