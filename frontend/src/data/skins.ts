export interface SkinDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockType: 'default' | 'trades' | 'family' | 'legendaries';
  unlockValue?: number;
  accentColor: string;
  bgColor: string;
}

export const ALL_SKINS: SkinDef[] = [
  {
    id: 'pink',
    name: 'Pink Paw',
    emoji: '🐾',
    description: 'Your adorable starter paw! So cute!',
    unlockType: 'default',
    accentColor: '#FFB7B2',
    bgColor: '#FFF0F5',
  },
  {
    id: 'golden',
    name: 'Golden Paw',
    emoji: '⭐',
    description: 'Earned by completing 5 trades',
    unlockType: 'trades',
    unlockValue: 5,
    accentColor: '#FFD700',
    bgColor: '#FFFDE7',
  },
  {
    id: 'crystal',
    name: 'Crystal Paw',
    emoji: '💎',
    description: 'Earned by completing any sticker family',
    unlockType: 'family',
    accentColor: '#A8D8EA',
    bgColor: '#E3F2FD',
  },
  {
    id: 'rainbow',
    name: 'Rainbow Paw',
    emoji: '🌈',
    description: 'Earned by completing 15 trades',
    unlockType: 'trades',
    unlockValue: 15,
    accentColor: '#FF9AA2',
    bgColor: '#FFF0F5',
  },
  {
    id: 'galaxy',
    name: 'Galaxy Paw',
    emoji: '🌟',
    description: 'Earned by collecting all Legendary stickers',
    unlockType: 'legendaries',
    accentColor: '#9B89DC',
    bgColor: '#F3E5F5',
  },
];
