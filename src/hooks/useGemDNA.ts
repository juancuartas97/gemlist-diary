// Gem DNA parsing and utilities

export interface GemDNA {
  artistCode: string;    // "SKRLX"
  venueCode: string;     // "BRGHN"
  dateCode: string;      // "0126" (MMYY)
  rarityCode: string;    // "L" (Legendary)
  mintNumber: number;    // 42
  modifiers: string[];   // ["G", "Q"]
  fullDNA: string;       // "SKRLX-BRGHN-0126-L-0042-G/Q"
}

export interface ModifierInfo {
  code: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

export const MODIFIERS: Record<string, ModifierInfo> = {
  G: {
    code: 'G',
    name: 'Genesis',
    description: 'First 100 to mine this gem',
    emoji: '⚡',
    color: '#f59e0b', // amber
  },
  Q: {
    code: 'Q',
    name: 'Quest',
    description: 'Completed a personal goal',
    emoji: '🎯',
    color: '#8b5cf6', // purple
  },
  I: {
    code: 'I',
    name: 'Ironman',
    description: 'Stayed for the entire set',
    emoji: '💪',
    color: '#ef4444', // red
  },
};

export const RARITY_CODES: Record<string, { tier: string; label: string; emoji: string; color: string }> = {
  M: { tier: 'mythic', label: 'Mythic', emoji: '🔴', color: '#ef4444' },
  L: { tier: 'legendary', label: 'Legendary', emoji: '🟠', color: '#f97316' },
  R: { tier: 'rare', label: 'Rare', emoji: '🟣', color: '#a855f7' },
  U: { tier: 'uncommon', label: 'Uncommon', emoji: '🔷', color: '#3b82f6' },
  C: { tier: 'common', label: 'Common', emoji: '💎', color: '#6b7280' },
};

/**
 * Parse a Gem DNA string into its components
 * Format: ARTIST-VENUE-DATE-RARITY-MINT#-MODIFIERS
 * Example: SKRLX-BRGHN-0126-L-0042-G/Q
 */
export function parseGemDNA(dna: string | null | undefined): GemDNA | null {
  if (!dna) return null;
  
  const parts = dna.split('-');
  if (parts.length < 5) return null;
  
  const artistCode = parts[0];
  const venueCode = parts[1];
  const dateCode = parts[2];
  const rarityCode = parts[3];
  const mintNumber = parseInt(parts[4], 10);
  
  // Modifiers are optional and come after the mint number
  const modifiers = parts.length > 5 ? parts[5].split('/') : [];
  
  return {
    artistCode,
    venueCode,
    dateCode,
    rarityCode,
    mintNumber,
    modifiers,
    fullDNA: dna,
  };
}

/**
 * Format the date code (MMYY) into a readable format
 */
export function formatDateCode(dateCode: string): string {
  if (dateCode.length !== 4) return dateCode;
  
  const month = parseInt(dateCode.substring(0, 2), 10);
  const year = parseInt(dateCode.substring(2, 4), 10);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[month - 1] || 'Unknown';
  
  return `${monthName} '${year}`;
}

/**
 * Get rarity info from code
 */
export function getRarityFromCode(code: string) {
  return RARITY_CODES[code] || RARITY_CODES.C;
}

/**
 * Get modifier info from code
 */
export function getModifierInfo(code: string): ModifierInfo | null {
  return MODIFIERS[code] || null;
}

/**
 * Get all modifier infos from an array of codes
 */
export function getModifierInfos(modifiers: string[]): ModifierInfo[] {
  return modifiers
    .map(code => MODIFIERS[code])
    .filter((info): info is ModifierInfo => info !== undefined);
}
