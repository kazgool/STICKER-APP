export const COLORS = {
  bgPrimary: '#FFF5F8',
  bgSecondary: '#FFEEF6',
  surface: 'rgba(255,255,255,0.92)',
  primary: '#FFB7B2',
  primaryDark: '#FF8B84',
  secondary: '#B5EAD7',
  tertiary: '#C7CEEA',
  accent: '#FFDAC1',
  textMain: '#2D3436',
  textMuted: '#636E72',
  white: '#FFFFFF',
  overlay: 'rgba(255,240,248,0.6)',

  rarity: {
    Common:    { bg: '#EAF7EC', border: '#88CC88', text: '#3A6B3A', glow: '#A8D5A8', gradient: ['#EAF7EC','#C8EAC8'] as const },
    Uncommon:  { bg: '#E0F7FA', border: '#7CC7C7', text: '#2E6B6B', glow: '#7CC7C7', gradient: ['#E0F7FA','#B0E8E8'] as const },
    Rare:      { bg: '#EDE7F6', border: '#B48ECC', text: '#5A2A8A', glow: '#BA68C8', gradient: ['#EDE7F6','#D0BBE8'] as const },
    Legendary: { bg: '#FFF8E1', border: '#F0C050', text: '#C06000', glow: '#FFD54F', gradient: ['#FFF8E1','#FFE88A'] as const },
  },

  families: {
    'White Bears': '#EEF4FF',
    'Fluffy Pups': '#FFF3EC',
    'Kitties':     '#FFF0F8',
    'Frogs':       '#F0FFF4',
  },
};

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const RADII = { sm: 12, md: 20, lg: 28, xl: 36, pill: 9999 };

export const SHADOWS = {
  // RN 0.76+ boxShadow (replaces deprecated shadow* props)
  soft: {
    boxShadow: '0 4px 10px rgba(255,183,178,0.22)',
    elevation: 6,
  },
  float: {
    boxShadow: '0 8px 16px rgba(199,206,234,0.28)',
    elevation: 10,
  },
  card: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    elevation: 4,
  },
};

export const PAW_SKIN_EMOJIS: Record<string, string> = {
  pink:    '🐾',
  golden:  '⭐',
  crystal: '💎',
  rainbow: '🌈',
  galaxy:  '🌟',
};
