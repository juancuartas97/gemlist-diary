// Types
export interface User {
  id: string;
  displayName: string;
  email: string;
}

export type GemType = 'Amethyst' | 'Emerald' | 'Sapphire' | 'Ruby';

export interface SetEntry {
  id: string;
  djName: string;
  venue: string;
  dateISO: string;
  notes: string;
  rating: number;
  gemType: GemType;
  createdAt: string;
}

export interface TasteProfile {
  topGenres: { name: string; weight: number }[];
}

export interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  genre: string;
  distance: string;
  image?: string;
}

// Storage keys
const KEYS = {
  USER: 'gemlist_user',
  SETS: 'gemlist_sets',
  TASTE: 'gemlist_taste',
  ONBOARDED: 'gemlist_onboarded',
};

// User functions
export const getUser = (): User | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const clearUser = (): void => {
  localStorage.removeItem(KEYS.USER);
};

// Set entries functions
export const getSets = (): SetEntry[] => {
  const data = localStorage.getItem(KEYS.SETS);
  return data ? JSON.parse(data) : [];
};

export const addSet = (entry: Omit<SetEntry, 'id' | 'createdAt'>): SetEntry => {
  const sets = getSets();
  const newSet: SetEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  sets.unshift(newSet);
  localStorage.setItem(KEYS.SETS, JSON.stringify(sets));
  return newSet;
};

export const deleteSet = (id: string): void => {
  const sets = getSets().filter(s => s.id !== id);
  localStorage.setItem(KEYS.SETS, JSON.stringify(sets));
};

// Taste profile functions
export const getTasteProfile = (): TasteProfile => {
  const data = localStorage.getItem(KEYS.TASTE);
  return data ? JSON.parse(data) : {
    topGenres: [
      { name: 'Techno', weight: 85 },
      { name: 'House', weight: 72 },
      { name: 'Drum & Bass', weight: 58 },
      { name: 'Ambient', weight: 45 },
      { name: 'Trance', weight: 32 },
    ],
  };
};

// Onboarding functions
export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(KEYS.ONBOARDED) === 'true';
};

export const completeOnboarding = (): void => {
  localStorage.setItem(KEYS.ONBOARDED, 'true');
};

// Mock events data
export const getMockEvents = (): Event[] => [
  {
    id: '1',
    name: 'Neon Underground',
    venue: 'Neon Grotto',
    date: '2025-01-04',
    genre: 'Techno',
    distance: '0.8 mi',
  },
  {
    id: '2',
    name: 'Bass Cathedral',
    venue: 'Warehouse 9',
    date: '2025-01-05',
    genre: 'Drum & Bass',
    distance: '1.2 mi',
  },
  {
    id: '3',
    name: 'House Sessions',
    venue: 'The Basement',
    date: '2025-01-06',
    genre: 'House',
    distance: '2.1 mi',
  },
  {
    id: '4',
    name: 'Trance Awakening',
    venue: 'Sky Lounge',
    date: '2025-01-10',
    genre: 'Trance',
    distance: '3.5 mi',
  },
  {
    id: '5',
    name: 'Ambient Dreams',
    venue: 'The Sphere',
    date: '2025-01-12',
    genre: 'Ambient',
    distance: '1.8 mi',
  },
];

// Gem color mapping
export const gemColors: Record<GemType, string> = {
  Amethyst: 'gem-purple',
  Emerald: 'gem-green',
  Sapphire: 'gem-blue',
  Ruby: 'gem-ruby',
};
