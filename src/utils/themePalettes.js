
export const BUSINESS_TYPES = {
  CAFE: 'cafe',
  RESTAURANT: 'restaurant',
  BAR: 'bar',
  FAST_FOOD: 'fast_food',
  BAKERY: 'bakery',
  PIZZERIA: 'pizzeria',
  SUSHI: 'sushi',
  BURGER: 'burger',
  VEGAN: 'vegan',
  ICE_CREAM: 'ice_cream'
};

export const THEME_PALETTES = {
  [BUSINESS_TYPES.CAFE]: {
    name: 'Cozy Coffee',
    primary: '#432818', // Deep Espresso
    secondary: '#99582A', // Caramel
    accent: '#FFE6A7', // Cream
    background: '#FFFBF2',
    fontFamily: "'Lora', serif"
  },
  [BUSINESS_TYPES.RESTAURANT]: { // Fine dining default
    name: 'Elegant Dining',
    primary: '#0C0C0C', // Obsidian
    secondary: '#C5A059', // Muted Gold
    accent: '#F3F4F6', // Marble White
    background: '#FFFFFF',
    fontFamily: "'Playfair Display', serif"
  },
  [BUSINESS_TYPES.BAR]: {
    name: 'Nightlife',
    primary: '#0F172A', // Midnight Navy
    secondary: '#6366F1', // Electric Indigo
    accent: '#F43F5E', // Neon Rose
    background: '#020617',
    fontFamily: "'Montserrat', sans-serif"
  },
  [BUSINESS_TYPES.FAST_FOOD]: {
    name: 'Quick & Bold',
    primary: '#D90429', // Vivid Red
    secondary: '#FFB703', // Mango Yellow
    accent: '#2B2D42', // Cool Black
    background: '#FEF2F2',
    fontFamily: "'Poppins', sans-serif"
  },
  [BUSINESS_TYPES.BAKERY]: {
    name: 'Sweet Pastry',
    primary: '#BE185D', // Berry Pink
    secondary: '#FBCFE8', // Cotton Candy
    accent: '#F59E0B', // Golden Crust
    background: '#FFF5F7',
    fontFamily: "'Merriweather', serif"
  },
  [BUSINESS_TYPES.PIZZERIA]: {
    name: 'Italian Rustico',
    primary: '#991B1B', // Marinara Red
    secondary: '#15803D', // Basil Green
    accent: '#FEF3C7', // Dough
    background: '#FAFAF9',
    fontFamily: "'Roboto', sans-serif"
  },
  [BUSINESS_TYPES.SUSHI]: {
    name: 'Zen Fresh',
    primary: '#111827', // Nori Black
    secondary: '#F87171', // Salmon
    accent: '#34D399', // Wasabi
    background: '#F9FAFB',
    fontFamily: "'Open Sans', sans-serif"
  },
  [BUSINESS_TYPES.BURGER]: {
    name: 'Grill Master',
    primary: '#451A03', // BBQ Smoke
    secondary: '#D97706', // Cheddar
    accent: '#78350F', // Wood
    background: '#FFFBEB',
    fontFamily: "'Raleway', sans-serif"
  },
  [BUSINESS_TYPES.VEGAN]: {
    name: 'Pure Earth',
    primary: '#14532D', // Forest Green
    secondary: '#4ADE80', // Fresh Sprout
    accent: '#FEF08A', // Sun
    background: '#F0FDF4',
    fontFamily: "'Raleway', sans-serif"
  },
  [BUSINESS_TYPES.ICE_CREAM]: {
    name: 'Cool Treats',
    primary: '#0EA5E9', // Sky Blue
    secondary: '#F472B6', // Bubblegum
    accent: '#FEF9C3', // Vanilla
    background: '#F0F9FF',
    fontFamily: "'Poppins', sans-serif"
  }
};

const KEYWORD_MAPPING = {
  'coffee': BUSINESS_TYPES.CAFE,
  'cafeteria': BUSINESS_TYPES.CAFE,
  'pub': BUSINESS_TYPES.BAR,
  'club': BUSINESS_TYPES.BAR,
  'drink': BUSINESS_TYPES.BAR,
  'breakfast': BUSINESS_TYPES.BAKERY,
  'dessert': BUSINESS_TYPES.BAKERY,
  'pasta': BUSINESS_TYPES.PIZZERIA,
  'pizza': BUSINESS_TYPES.PIZZERIA,
  'japanese': BUSINESS_TYPES.SUSHI,
  'asian': BUSINESS_TYPES.SUSHI,
  'hamburger': BUSINESS_TYPES.BURGER,
  'vegetarian': BUSINESS_TYPES.VEGAN,
  'healthy': BUSINESS_TYPES.VEGAN,
  'salad': BUSINESS_TYPES.VEGAN,
  'gelato': BUSINESS_TYPES.ICE_CREAM,
  'sorbet': BUSINESS_TYPES.ICE_CREAM
};

export const DEFAULT_PALETTE = {
  name: 'Modern Standard',
  primary: '#1a1a1a',
  secondary: '#4a5568',
  accent: '#3182ce',
  background: '#ffffff',
  fontFamily: 'poppins'
};

export function getPaletteByBusinessType(type) {
  if (!type) return DEFAULT_PALETTE;
  
  // Normalize input
  const normalizedType = String(type).toLowerCase().trim().replace(/\s+/g, '_');
  
  // Direct match
  if (THEME_PALETTES[normalizedType]) {
    return THEME_PALETTES[normalizedType];
  }

  // Check keywords
  for (const [keyword, mappedType] of Object.entries(KEYWORD_MAPPING)) {
     if (normalizedType.includes(keyword)) {
       return THEME_PALETTES[mappedType];
     }
  }
  
  // Partial match (e.g. "sushi_place" -> "sushi")
  for (const key in THEME_PALETTES) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return THEME_PALETTES[key];
    }
  }
  
  return DEFAULT_PALETTE;
}
