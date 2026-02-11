import type { UserGem, Genre, DJ, Venue, FacetRatings } from '@/hooks/useGemData';
import type { UserAchievement, Achievement } from '@/hooks/useAchievements';
import type { UserGoal } from '@/hooks/useUserGoals';

const MOCK_USER_ID = 'mock-user-dev-123';

// ── Genres ──
const genres: Record<string, Genre> = {
  techno: { id: 'g-techno', name: 'Techno', parent_genre_id: null, color_hex: '#8B5CF6' },
  house: { id: 'g-house', name: 'House', parent_genre_id: null, color_hex: '#F59E0B' },
  trance: { id: 'g-trance', name: 'Trance', parent_genre_id: null, color_hex: '#06B6D4' },
  dnb: { id: 'g-dnb', name: 'Drum & Bass', parent_genre_id: null, color_hex: '#EF4444' },
  dubstep: { id: 'g-dubstep', name: 'Dubstep', parent_genre_id: null, color_hex: '#10B981' },
  melodicTechno: { id: 'g-melodic', name: 'Melodic Techno', parent_genre_id: 'g-techno', color_hex: '#A78BFA' },
  deepHouse: { id: 'g-deep', name: 'Deep House', parent_genre_id: 'g-house', color_hex: '#FBBF24' },
  psytrance: { id: 'g-psy', name: 'Psytrance', parent_genre_id: 'g-trance', color_hex: '#22D3EE' },
};

// ── DJs ──
const djs: Record<string, DJ> = {
  skrillex: { id: 'dj-skrillex', stage_name: 'Skrillex', primary_genre_id: 'g-dubstep', home_city: 'Los Angeles', genre: genres.dubstep },
  carlCox: { id: 'dj-carlcox', stage_name: 'Carl Cox', primary_genre_id: 'g-techno', home_city: 'Melbourne', genre: genres.techno },
  charlotte: { id: 'dj-charlotte', stage_name: 'Charlotte de Witte', primary_genre_id: 'g-techno', home_city: 'Brussels', genre: genres.techno },
  fisher: { id: 'dj-fisher', stage_name: 'FISHER', primary_genre_id: 'g-house', home_city: 'Gold Coast', genre: genres.house },
  bonobo: { id: 'dj-bonobo', stage_name: 'Bonobo', primary_genre_id: 'g-deep', home_city: 'London', genre: genres.deepHouse },
  amelieLens: { id: 'dj-amelie', stage_name: 'Amelie Lens', primary_genre_id: 'g-techno', home_city: 'Antwerp', genre: genres.techno },
  subfocus: { id: 'dj-subfocus', stage_name: 'Sub Focus', primary_genre_id: 'g-dnb', home_city: 'London', genre: genres.dnb },
  above: { id: 'dj-abgt', stage_name: 'Above & Beyond', primary_genre_id: 'g-trance', home_city: 'London', genre: genres.trance },
  boris: { id: 'dj-boris', stage_name: 'Boris Brejcha', primary_genre_id: 'g-melodic', home_city: 'Frankfurt', genre: genres.melodicTechno },
  excision: { id: 'dj-excision', stage_name: 'Excision', primary_genre_id: 'g-dubstep', home_city: 'Kelowna', genre: genres.dubstep },
  nora: { id: 'dj-nora', stage_name: 'Nora En Pure', primary_genre_id: 'g-deep', home_city: 'Zurich', genre: genres.deepHouse },
  infected: { id: 'dj-infected', stage_name: 'Infected Mushroom', primary_genre_id: 'g-psy', home_city: 'Haifa', genre: genres.psytrance },
};

// ── Venues ──
const venues: Record<string, Venue> = {
  berghain: { id: 'v-berghain', name: 'Berghain', venue_type: 'club', city: 'Berlin', state: null, country: 'Germany' },
  fabric: { id: 'v-fabric', name: 'Fabric', venue_type: 'club', city: 'London', state: null, country: 'UK' },
  warehouse: { id: 'v-warehouse', name: 'Warehouse Project', venue_type: 'warehouse', city: 'Manchester', state: null, country: 'UK' },
  printworks: { id: 'v-printworks', name: 'Printworks', venue_type: 'warehouse', city: 'London', state: null, country: 'UK' },
  redrocks: { id: 'v-redrocks', name: 'Red Rocks', venue_type: 'outdoor', city: 'Morrison', state: 'CO', country: 'USA' },
  tomorrowland: { id: 'v-tmrw', name: 'Tomorrowland Grounds', venue_type: 'festival', city: 'Boom', state: null, country: 'Belgium' },
  edc: { id: 'v-edc', name: 'Las Vegas Motor Speedway', venue_type: 'festival', city: 'Las Vegas', state: 'NV', country: 'USA' },
  shelter: { id: 'v-shelter', name: 'Shelter', venue_type: 'club', city: 'Amsterdam', state: null, country: 'Netherlands' },
  space: { id: 'v-space', name: 'Space Ibiza', venue_type: 'club', city: 'Ibiza', state: null, country: 'Spain' },
};

// ── Helper ──
const makeGem = (
  i: number,
  dj: DJ,
  genre: Genre,
  venue: Venue,
  date: string,
  rarity: { score: number; tier: string },
  opts: { genesis?: boolean; dna?: string; mint?: number; mods?: string[]; rated?: boolean; facets?: FacetRatings; note?: string } = {}
): UserGem => ({
  id: `gem-mock-${String(i).padStart(3, '0')}`,
  user_id: MOCK_USER_ID,
  dj_id: dj.id,
  primary_genre_id: genre.id,
  event_date: date,
  collected_at: `${date}T23:00:00Z`,
  is_rated: opts.rated ?? true,
  facet_ratings: opts.facets ?? { sound_quality: 8, energy: 7, performance: 9, crowd: 7 },
  private_note: opts.note ?? null,
  venue_id: venue.id,
  event_id: null,
  edition_id: null,
  rarity_score: rarity.score,
  rarity_tier: rarity.tier,
  is_genesis_mint: opts.genesis ?? false,
  gem_dna: opts.dna ?? null,
  mint_number: opts.mint ?? i,
  modifiers: opts.mods ?? [],
  dj,
  genre,
  venue,
});

// ── 21 Mock Gems ──
export const mockGems: UserGem[] = [
  // Mythic (1)
  makeGem(1, djs.charlotte, genres.techno, venues.berghain, '2024-12-31',
    { score: 98, tier: 'mythic' },
    { genesis: true, dna: 'CHRLT-BRGHN-2412-M-0001-G/Q', mint: 1, mods: ['G', 'Q'], facets: { sound_quality: 10, energy: 10, performance: 10, crowd: 9 }, note: 'NYE set that changed my life. Berghain at its absolute peak.' }),

  // Legendary (3)
  makeGem(2, djs.carlCox, genres.techno, venues.space, '2024-08-15',
    { score: 88, tier: 'legendary' },
    { genesis: true, dna: 'CRLCX-SPACE-2408-L-0002-G', mint: 2, mods: ['G'], facets: { sound_quality: 9, energy: 9, performance: 10, crowd: 8 }, note: 'Oh yes oh yes!' }),
  makeGem(3, djs.skrillex, genres.dubstep, venues.redrocks, '2024-07-04',
    { score: 85, tier: 'legendary' },
    { dna: 'SKRLX-RDRCK-2407-L-0003', mint: 3, mods: [], facets: { sound_quality: 9, energy: 10, performance: 9, crowd: 9 } }),
  makeGem(4, djs.amelieLens, genres.techno, venues.printworks, '2024-10-19',
    { score: 82, tier: 'legendary' },
    { dna: 'AMLIE-PRNTW-2410-L-0004-Q', mint: 4, mods: ['Q'], facets: { sound_quality: 10, energy: 9, performance: 9, crowd: 8 } }),

  // Rare (5)
  makeGem(5, djs.above, genres.trance, venues.redrocks, '2024-09-21',
    { score: 72, tier: 'rare' },
    { dna: 'ABVBY-RDRCK-2409-R-0005', mint: 5, facets: { sound_quality: 8, energy: 8, performance: 9, crowd: 9 } }),
  makeGem(6, djs.boris, genres.melodicTechno, venues.tomorrowland, '2024-07-20',
    { score: 70, tier: 'rare' },
    { dna: 'BRSBB-TMRWL-2407-R-0006', mint: 6, facets: { sound_quality: 8, energy: 9, performance: 8, crowd: 8 } }),
  makeGem(7, djs.fisher, genres.house, venues.edc, '2024-05-18',
    { score: 68, tier: 'rare' },
    { dna: 'FISHR-EDCLV-2405-R-0007', mint: 7, facets: { sound_quality: 7, energy: 9, performance: 8, crowd: 9 } }),
  makeGem(8, djs.skrillex, genres.dubstep, venues.edc, '2024-05-19',
    { score: 66, tier: 'rare' },
    { dna: 'SKRLX-EDCLV-2405-R-0008-Q', mint: 8, mods: ['Q'], facets: { sound_quality: 8, energy: 10, performance: 8, crowd: 8 } }),
  makeGem(9, djs.subfocus, genres.dnb, venues.warehouse, '2024-11-02',
    { score: 65, tier: 'rare' },
    { dna: 'SBFCS-WRHSP-2411-R-0009', mint: 9, facets: { sound_quality: 8, energy: 9, performance: 8, crowd: 7 } }),

  // Uncommon (6)
  makeGem(10, djs.bonobo, genres.deepHouse, venues.printworks, '2024-03-16',
    { score: 55, tier: 'uncommon' },
    { dna: 'BONBO-PRNTW-2403-U-0010', mint: 10, facets: { sound_quality: 9, energy: 6, performance: 8, crowd: 7 } }),
  makeGem(11, djs.nora, genres.deepHouse, venues.shelter, '2024-06-08',
    { score: 52, tier: 'uncommon' },
    { dna: 'NORAP-SHLTR-2406-U-0011', mint: 11, facets: { sound_quality: 8, energy: 7, performance: 8, crowd: 7 } }),
  makeGem(12, djs.charlotte, genres.techno, venues.printworks, '2024-04-27',
    { score: 50, tier: 'uncommon' },
    { dna: 'CHRLT-PRNTW-2404-U-0012', mint: 12, facets: { sound_quality: 9, energy: 8, performance: 8, crowd: 7 } }),
  makeGem(13, djs.carlCox, genres.techno, venues.tomorrowland, '2024-07-21',
    { score: 48, tier: 'uncommon' },
    { dna: 'CRLCX-TMRWL-2407-U-0013', mint: 13, facets: { sound_quality: 8, energy: 8, performance: 9, crowd: 8 } }),
  makeGem(14, djs.infected, genres.psytrance, venues.tomorrowland, '2024-07-19',
    { score: 46, tier: 'uncommon' },
    { dna: 'INFMS-TMRWL-2407-U-0014', mint: 14, facets: { sound_quality: 7, energy: 9, performance: 8, crowd: 7 } }),
  makeGem(15, djs.excision, genres.dubstep, venues.edc, '2024-05-17',
    { score: 44, tier: 'uncommon' },
    { dna: 'EXCSN-EDCLV-2405-U-0015', mint: 15, facets: { sound_quality: 8, energy: 10, performance: 7, crowd: 8 } }),

  // Common (6)
  makeGem(16, djs.fisher, genres.house, venues.fabric, '2024-02-10',
    { score: 30, tier: 'common' },
    { dna: 'FISHR-FABRC-2402-C-0016', mint: 16, facets: { sound_quality: 7, energy: 8, performance: 7, crowd: 7 } }),
  makeGem(17, djs.subfocus, genres.dnb, venues.fabric, '2024-01-20',
    { score: 28, tier: 'common' },
    { dna: 'SBFCS-FABRC-2401-C-0017', mint: 17, facets: { sound_quality: 7, energy: 8, performance: 7, crowd: 6 } }),
  makeGem(18, djs.amelieLens, genres.techno, venues.berghain, '2024-06-14',
    { score: 26, tier: 'common' },
    { dna: 'AMLIE-BRGHN-2406-C-0018', mint: 18, facets: { sound_quality: 9, energy: 8, performance: 7, crowd: 6 } }),
  makeGem(19, djs.bonobo, genres.deepHouse, venues.redrocks, '2024-08-03',
    { score: 24, tier: 'common' },
    { dna: 'BONBO-RDRCK-2408-C-0019', mint: 19, facets: { sound_quality: 8, energy: 6, performance: 7, crowd: 7 } }),
  makeGem(20, djs.nora, genres.deepHouse, venues.tomorrowland, '2024-07-22',
    { score: 22, tier: 'common' },
    { rated: false, dna: 'NORAP-TMRWL-2407-C-0020', mint: 20, facets: { sound_quality: null, energy: null, performance: null, crowd: null } }),
  makeGem(21, djs.boris, genres.melodicTechno, venues.shelter, '2024-09-07',
    { score: 20, tier: 'common' },
    { rated: false, dna: 'BRSBB-SHLTR-2409-C-0021', mint: 21, facets: { sound_quality: null, energy: null, performance: null, crowd: null } }),
];

// ── Mock Achievements ──
const ach = (slug: string, cat: string, name: string, tier: number, color: string, emoji: string, threshold: number): Achievement => ({
  id: `ach-${slug}`,
  slug,
  category: cat as Achievement['category'],
  name,
  description: null,
  tier,
  threshold,
  threshold_percent: null,
  icon_emoji: emoji,
  color_tier: color as Achievement['color_tier'],
});

export const mockUnlockedAchievements: UserAchievement[] = [
  {
    id: 'ua-1', user_id: MOCK_USER_ID, achievement_id: 'ach-first-gem',
    reference_id: null, reference_name: null, current_count: 1, unlocked_at: '2024-01-20T20:00:00Z',
    achievement: ach('first-gem', 'special', 'First Gem', 1, 'bronze', '💎', 1),
  },
  {
    id: 'ua-2', user_id: MOCK_USER_ID, achievement_id: 'ach-artist-devotee-skrillex',
    reference_id: 'dj-skrillex', reference_name: 'Skrillex', current_count: 2, unlocked_at: '2024-05-19T23:00:00Z',
    achievement: ach('artist-devotee', 'artist_mastery', 'Artist Devotee', 1, 'bronze', '🎧', 2),
  },
  {
    id: 'ua-3', user_id: MOCK_USER_ID, achievement_id: 'ach-venue-regular-berghain',
    reference_id: 'v-berghain', reference_name: 'Berghain', current_count: 2, unlocked_at: '2024-12-31T23:30:00Z',
    achievement: ach('venue-regular', 'venue_loyalty', 'Venue Regular', 1, 'silver', '🏛️', 2),
  },
  {
    id: 'ua-4', user_id: MOCK_USER_ID, achievement_id: 'ach-genre-explorer',
    reference_id: null, reference_name: null, current_count: 6, unlocked_at: '2024-07-20T22:00:00Z',
    achievement: ach('genre-explorer', 'genre_dedication', 'Genre Explorer', 2, 'gold', '🌈', 5),
  },
  {
    id: 'ua-5', user_id: MOCK_USER_ID, achievement_id: 'ach-collector-10',
    reference_id: null, reference_name: null, current_count: 10, unlocked_at: '2024-06-14T23:00:00Z',
    achievement: ach('collector-10', 'special', 'Gem Hoarder', 1, 'silver', '🗃️', 10),
  },
  {
    id: 'ua-6', user_id: MOCK_USER_ID, achievement_id: 'ach-collector-20',
    reference_id: null, reference_name: null, current_count: 21, unlocked_at: '2024-12-31T23:30:00Z',
    achievement: ach('collector-20', 'special', 'Treasure Hunter', 2, 'gold', '🏆', 20),
  },
];

// ── Mock Goals ──
export const mockGoals: UserGoal[] = [
  {
    id: 'goal-1', user_id: MOCK_USER_ID, goal_type: 'holy_grail_artist',
    reference_id: 'dj-carlcox', reference_name: 'Carl Cox (5 gems)',
    target_date: null, completed_at: null, completed_gem_id: null, created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'goal-2', user_id: MOCK_USER_ID, goal_type: 'target_event',
    reference_id: null, reference_name: 'Awakenings 2025',
    target_date: '2025-07-12', completed_at: null, completed_gem_id: null, created_at: '2024-11-15T14:00:00Z',
  },
  {
    id: 'goal-3', user_id: MOCK_USER_ID, goal_type: 'holy_grail_venue',
    reference_id: 'v-berghain', reference_name: 'Berghain (visited)',
    target_date: null, completed_at: '2024-12-31T23:30:00Z', completed_gem_id: 'gem-mock-001', created_at: '2024-06-01T08:00:00Z',
  },
];

export const mockActiveGoals = mockGoals.filter(g => !g.completed_at);
export const mockTargetEvents = mockGoals.filter(g => g.goal_type === 'target_event' && !g.completed_at);

// ── Mock Taste Profile ──
export const mockTasteProfile = {
  id: 'tp-mock',
  user_id: MOCK_USER_ID,
  genre_weights: {
    'Techno': 0.33,
    'Dubstep': 0.19,
    'House': 0.14,
    'Deep House': 0.14,
    'Trance': 0.05,
    'Drum & Bass': 0.05,
    'Melodic Techno': 0.05,
    'Psytrance': 0.05,
  },
  top_artists: [
    { name: 'Charlotte de Witte', count: 2 },
    { name: 'Carl Cox', count: 2 },
    { name: 'Skrillex', count: 2 },
    { name: 'FISHER', count: 2 },
    { name: 'Bonobo', count: 2 },
  ],
  updated_at: '2024-12-31T23:59:00Z',
};
