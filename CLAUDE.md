# CLAUDE.md — GemList Persistent Context
Read this file at the start of every session. This is the single source of truth for how this codebase works and how to build in it.
---
## What This App Is
**GemList** is a personal logging platform for live DJ sets. Users collect "Gems" representing sets they attended. The core metaphor is a Treasure Chest that fills up over time into a personal archive of live music history.
This is a **mobile-first PWA** (max-width: 420px). Design every screen as if it's a phone.
---
## Tech Stack
| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + custom CSS variables |
| UI Components | shadcn/ui (Radix UI primitives) |
| Backend | Supabase (auth + postgres + realtime) |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Routing | React Router DOM v6 |
| Icons | Lucide React |
---
## Project Structure
```
src/
├── components/
│   ├── ui/           # shadcn primitives — DO NOT modify these directly
│   ├── tabs/         # Full tab views (HomeTab, TreasureChestTab, ProfileTab, etc.)
│   ├── treasure/     # Gem-related modals and UI (AddGemModal, GemDetailModal, etc.)
│   ├── achievements/ # Achievement system components
│   ├── goals/        # Goal tracking components
│   └── icons/        # Custom SVG icons
├── pages/
│   ├── AppShell.tsx  # Main authenticated shell with bottom nav + floating pickaxe button
│   ├── Auth.tsx      # Login/signup
│   ├── Onboarding.tsx
│   ├── SettingsPage.tsx
│   └── Index.tsx     # Landing/splash
├── hooks/
│   ├── useAuth.tsx   # Auth context + mock mode
│   ├── useGemData.ts # All Supabase data fetching (gems, DJs, venues, events, genres)
│   └── ...           # Other feature hooks
├── integrations/supabase/  # Auto-generated Supabase client + types
└── lib/
    └── mockData.ts   # Mock gems for development without auth
```
---
## Routing
```
/             → Index (splash/landing)
/onboarding   → Onboarding flow
/auth         → Login / Sign up
/app          → AppShell (requires auth)
/settings     → Settings page
/artists      → Artists portal
```
AppShell handles tab state internally (`home` | `treasure` | `profile`). Tabs are NOT separate routes.
---
## Design System
### Colors (CSS variables — always use these, never hardcode hex)
```css
--primary: 145 75% 55%        /* Gem green — main CTA color */
--secondary: 280 95% 50%      /* Purple */
--accent: 330 85% 60%         /* Pink */
--background: 150 40% 8%      /* Deep dark green-black */
--card: 150 30% 12%           /* Slightly lighter card surface */
--muted: 150 20% 18%          /* Muted backgrounds */
--muted-foreground: 150 15% 60%
/* Gem palette — genre colors */
--gem-green: 145 75% 55%
--gem-purple: 280 95% 50%
--gem-pink: 330 85% 60%
--gem-blue: 217 91% 60%
--gem-ruby: 0 85% 55%
--gem-amber: 38 92% 50%
```
### Typography
- Font: **Space Grotesk** (Google Fonts) — only font used
- Weights: 300, 400, 500, 600, 700
### Reusable CSS Classes (defined in index.css — USE THESE)
```css
.glass-card       /* Frosted glass card: bg-card/60 + backdrop-blur + border */
.glass-button     /* Lighter glass for buttons */
.neon-text        /* Green glow text shadow */
.neon-text-secondary  /* Purple glow text shadow */
```
### Shadows / Glows
```ts
shadow-neon     /* Primary color glow */
shadow-neon-lg  /* Larger primary glow */
shadow-glass    /* Subtle glass depth */
```
### Animations (Tailwind)
```
animate-float       /* Gentle float up/down — use on hero gem visuals */
animate-pulse-glow  /* Opacity pulse — use on loading states */
animate-spin-slow   /* 20s slow rotation */
animate-shimmer     /* Horizontal shimmer sweep */
```
### Border Radius
- `--radius: 1rem` — default rounded-lg
- Use `rounded-2xl` for cards, `rounded-xl` for buttons, `rounded-full` for pills/badges
---
## Data Model (Supabase)
### Core Tables
**`user_gems`** — the central table
```ts
{
id, user_id, dj_id, primary_genre_id,
event_date, collected_at,
is_rated: boolean,
facet_ratings: { sound_quality, energy, performance, crowd } | null,
private_note: string | null,
venue_id: string | null,
event_id, edition_id,
rarity_score, rarity_tier,
is_genesis_mint: boolean,
gem_dna: string | null,
mint_number: number | null,
modifiers: string[] | null
}
```
**`djs`** — artists / performers
```ts
{ id, stage_name, primary_genre_id, home_city }
```
**`venues`** — physical locations
```ts
{ id, name, venue_type, city, state, country }
```
**`genres`** — genre taxonomy (hierarchical)
```ts
{ id, name, parent_genre_id, color_hex }
```
**`events`** — shows/festivals
```ts
{ id, title, start_at, end_at, venue_id, primary_genre_id, headliner_dj_id, source, status }
```
### Hooks Pattern
All data lives in `src/hooks/useGemData.ts`. Always fetch through hooks, never call Supabase directly from components.
```ts
// Reading
const { gems, loading, refetch } = useUserGems(userId);
const { genres, loading } = useGenres();
const { djs, loading } = useDJSearch(query);  // debounced 150ms
// Writing (async functions, not hooks)
await addUserGem({ user_id, dj_id, primary_genre_id, event_date, ... })
await addDJ(stageName, genreId)
await addVenue(name, venueType, city, country)
await addEvent({ title, start_at, ... })
```
### Mock Mode
`useAuth()` exposes `isMockMode`. When true, use `mockGems` from `src/lib/mockData.ts` instead of hitting Supabase. Always guard Supabase calls with `if (isMockMode) return mockData`.
---
## Key UI Patterns
### Bottom Navigation
Fixed bottom bar with 3 tabs: Home | Chest | Profile. Defined in AppShell. Do not add more tabs without discussion.
### Floating Action Button
Green circle with pickaxe icon, `fixed bottom-24 right-4`. This opens the CollectionModeChooser. Never move or restyle this button.
### Modals
Use shadcn `<Dialog>` for all modals. Keep modal content scrollable for long forms. Always use `glass-card` styling inside modal content areas.
### Forms
- Always use React Hook Form + Zod for validation
- Never use raw `<form>` elements
- Autocomplete inputs use `AutocompleteInput.tsx` — use this component for DJ, venue, event search fields
---
## Rules — What NOT To Do
1. **Do not modify `/src/components/ui/`** — these are auto-generated shadcn components. Override via className props only.
2. **Do not add new npm packages without checking if the functionality already exists.** Framer Motion handles all animation needs. Radix covers all UI primitives.
3. **Do not hardcode colors.** Always use `hsl(var(--token))` or Tailwind classes that reference design tokens.
4. **Do not create new global state.** Use TanStack Query for server state. Use local `useState` for UI state. No Redux, no Zustand, no Context unless it's auth-related.
5. **Do not add server-side logic.** This is a client-side app backed by Supabase. All business logic lives in hooks or utility functions in `src/lib/`.
6. **Do not over-engineer.** Build the simplest thing that works. A `useState` is almost always better than a state machine. A hook is almost always better than a context.
7. **Do not create separate CSS files.** Style with Tailwind classes. Use `index.css` only for global utility classes that can't be done inline.
---
## What's Been Built (V1 Status)
| Feature | Status |
|---|---|
| Auth (email + SSO) | ✅ Done |
| Onboarding flow | ✅ Done |
| Add Gem modal | ✅ Done |
| Treasure Chest grid | ✅ Done |
| Gem detail modal | ✅ Done |
| Facet ratings (sliders) | ✅ Done |
| Private notes | ✅ Done |
| Genre system | ✅ Done |
| Festival lineup modal | ✅ Done |
| DJ / venue autocomplete | ✅ Done |
| Achievements system | ✅ Done |
| Goals system | ✅ Done |
| Rarity / Gem DNA | ✅ Done |
| Taste Map (galaxy) | ✅ Done |
| Profile + stats | ✅ Done |
| Settings page | ✅ Done |
---
## How To Work In This Codebase
1. **New feature?** Start by identifying which tab or page it lives in
2. **New UI component?** Put it in the most specific subfolder (`treasure/`, `achievements/`, etc.)
3. **New data?** Add the fetch to `useGemData.ts` as a hook, add the write as an exported async function
4. **New page/route?** Add it in `App.tsx` and create the file in `src/pages/`
5. **After every change:** Check that the mobile layout (420px max) still looks correct
