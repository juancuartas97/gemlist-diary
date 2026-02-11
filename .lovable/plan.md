
# Fill Mock Account with In-Memory Test Data

## Problem
Mock mode uses a fake user ID with no real Supabase JWT, so all RLS-protected queries return empty results. The UI appears blank.

## Solution
Create a centralized mock data file and update all data-fetching hooks to return this mock data when `isMockMode` is true, bypassing Supabase entirely.

## Steps

### 1. Create `src/lib/mockData.ts`
A single file containing realistic test data for all hooks:
- **21 mock gems** spanning all 5 rarity tiers (mythic, legendary, rare, uncommon, common), multiple genres (Techno, House, Trance, DnB, Dubstep, etc.), various DJs (Skrillex, Carl Cox, Charlotte de Witte, etc.), venues (Berghain, Fabric, Warehouse Project, etc.), with facet ratings, gem DNA strings, mint numbers, and modifiers (G, Q).
- **Mock achievements** (unlocked): "First Gem", "Artist Devotee" for Skrillex, "Venue Regular" for Berghain, "Genre Explorer", etc. with appropriate tiers (bronze, silver, gold).
- **Mock goals**: 1 holy grail artist, 1 target event, 1 holy grail venue -- some active, one completed.
- **Mock taste profile** with genre weights derived from the gems.

### 2. Update `src/hooks/useGemData.ts` - `useUserGems`
Add an early return when `isMockMode` is true:
- Import `useAuth` and check `isMockMode`
- If true, return the mock gems array immediately with `loading: false`
- No Supabase calls made

### 3. Update `src/hooks/useAchievements.ts` - `useUnlockedAchievements`
- When `isMockMode` is true, return mock unlocked achievements directly
- Same pattern for `useUserAchievements` and `useAchievementDefinitions`

### 4. Update `src/hooks/useUserGoals.ts` - `useActiveGoals`, `useTargetEvents`, `useAllGoals`
- When `isMockMode` is true, return mock goals data
- Mutations (create/delete goal) will show toasts but won't persist

### 5. Expose `isMockMode` more broadly
- The hooks already have access to `useAuth()`, so they can check `isMockMode` internally

## What the user will see
After tapping the logo 5 times on the login screen:
- **Home tab**: Greeting as "Dev", 21 gems total, top genre %, last mined gem, recent gems grid, venue/artist counts
- **Treasure Chest**: All 21 gems on glass shelves, filterable by genre/artist/venue, sortable by date/rarity/artist
- **Profile**: Enamel pin badges for unlocked achievements, taste map data, stats
- **Goals**: Active quests with ghost gems

## Technical Details
- All mock data lives in one file for easy editing
- No database or migration changes needed
- Hooks detect mock mode via `useAuth().isMockMode` and short-circuit before any Supabase call
- React Query hooks will use `initialData` or `queryFn` override pattern to return mock data
