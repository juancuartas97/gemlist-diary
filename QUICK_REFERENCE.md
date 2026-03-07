# GemList Diary - Quick Reference Guide

## Project Location
```
/sessions/festive-hopeful-clarke/tmp-repo
```

## Quick Start
```bash
cd /sessions/festive-hopeful-clarke/tmp-repo
npm install
npm run dev        # Start dev server on http://localhost:8080
npm run build      # Build for production
npm run lint       # Run ESLint
```

## Key Files at a Glance

### Entry Points
- **main.tsx** - App initialization
- **App.tsx** - Router & provider setup
- **pages/AppShell.tsx** - Main app container with bottom tab navigation

### Core Pages
- `/pages/Index.tsx` - Route guard/redirect logic
- `/pages/Auth.tsx` - Login/signup
- `/pages/Onboarding.tsx` - First-time user flow
- `/pages/AppShell.tsx` - Main app (Home/Chest/Profile tabs)
- `/pages/SettingsPage.tsx` - User settings
- `/pages/ArtistsPortal.tsx` - DJ/Artist portal

### Main Tab Components
- `/components/tabs/HomeTab.tsx` - Dashboard
- `/components/tabs/TreasureChestTab.tsx` - Gem collection (skeuomorphic chest)
- `/components/tabs/ProfileTab.tsx` - User profile
- `/components/tabs/TasteMapTab.tsx` - Taste visualization
- `/components/tabs/EventsTab.tsx` - Event listing
- `/components/tabs/CollectTab.tsx` - Collection interface

### Key Components
- `/components/treasure/` - All gem/treasure related (15+ components)
- `/components/achievements/` - Achievement system (4 components)
- `/components/goals/` - Goals/quests (4 components)
- `/components/ui/` - shadcn/ui library (50+ base components)

### Data & Logic
- `/hooks/useAuth.tsx` - Authentication
- `/hooks/useGemData.ts` - Gem data fetching
- `/hooks/useUserGoals.ts` - Goals management
- `/hooks/useAchievements.ts` - Achievement tracking
- `/integrations/supabase/` - Supabase setup & types
- `/lib/storage.ts` - Local storage utilities
- `/lib/mockData.ts` - Mock data

### Styling
- `/src/index.css` - Global styles, theme colors, animations
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.js` - PostCSS setup

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | React 18, TypeScript 5, Vite 5 |
| Routing | React Router v6 |
| UI Library | shadcn/ui (50+ components) |
| Styling | Tailwind CSS 3, CSS animations |
| State Management | React Query, Context API |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Forms | React Hook Form + Zod validation |
| Animations | Framer Motion, CSS keyframes |
| Icons | Lucide React |
| Charts | Recharts |

## Key Concepts

### Gems
- Represent favorite DJ sets/performances
- Have properties: rarity, color, DNA attributes
- Can be collected individually or from festival lineups
- Display in skeuomorphic "treasure chest"

### Gamification
- Achievements with enamel pins
- Goals with countdown timers
- Progress tracking

### Taste Mapping
- 2D visualization of musical taste
- Facet-based rating system
- Geographic distribution

### Aesthetic
- Cyberpunk-luxury theme
- Dark mode only (hsl(150 40% 8%) background)
- Neon accents with glass morphism
- Space Grotesk typography
- Gem color palette

## Design System

### Colors
```
Primary (Green):    hsl(145 75% 55%)
Secondary (Purple): hsl(280 95% 50%)
Accent (Pink):      hsl(330 85% 60%)
Gems: 9 color variations
```

### Key Classes
```css
.glass-card       /* Frosted glass effect */
.glass-button     /* Glass button style */
.neon-text        /* Glowing text */
.wood-grain       /* Wood texture (CSS) */
.chest-*          /* Treasure chest components */
.animate-float    /* Floating animation */
.animate-pulse-glow /* Pulsing glow */
```

## Component Architecture

### Container Components
- `AppShell` - Main app wrapper with tabs
- `HomeTab`, `TreasureChestTab`, `ProfileTab` - Tab content

### Feature Components
- Treasure system (15+ components)
- Achievement system (4 components)
- Goals system (4 components)
- Modals (AddGem, AddEvent, Festival, Detail views)

### UI Components
- shadcn/ui base components (50+)
- Custom wrappers (GemIcon, GemBadge, etc.)

### Utility Components
- FloatingParticles - Background effect
- ThemeColorPicker - Theme customization
- AutocompleteInput - Search input

## Important Hooks

| Hook | Purpose |
|------|---------|
| `useAuth()` | Get user, login/logout, auth state |
| `useGemData()` | Fetch/manage gems |
| `useUserGoals()` | Get/create/update goals |
| `useAchievements()` | Achievement tracking |
| `useRarityCalculator()` | Calculate gem rarity |
| `useGemDNA()` | Get gem properties |
| `useEventSeries()` | Event management |
| `useGeolocation()` | Geographic data |
| `use-toast()` | Toast notifications |

## Routes

```
/ (Index)
  └─ Redirects based on auth state
    ├─ /onboarding (if new user)
    ├─ /auth (if not authenticated)
    └─ /app (if authenticated)

/app (AppShell - Main App)
  ├─ Home tab
  ├─ Treasure Chest tab
  └─ Profile tab

/settings (SettingsPage)
/artists (ArtistsPortal)
/* (NotFound)
```

## Key Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| `index.css` | 600+ | All global styles, animations, chest design |
| `tailwind.config.ts` | 100+ | Theme config, colors, animations |
| `AppShell.tsx` | 150+ | Main app layout with tabs |
| `useGemData.ts` | 250+ | Gem data fetching logic |
| `useAuth.tsx` | 120+ | Auth context and logic |

## Asset Files

**Festival Pins** (in `/src/assets/pins/`):
- coachella.png
- tomorrowland.png
- lost-lands.png
- lollapalooza.png
- ultra.png
- electric-forest.png
- factory-town.png
- berghain.png
- edc-vegas.png

## Development Patterns

### State Management Pattern
```typescript
// Custom hook with React Query
const useGemData = () => {
  const query = useQuery({
    queryKey: ['gems'],
    queryFn: fetchGemsFromSupabase
  });
  return { gems: query.data, loading: query.isPending };
};
```

### Component Pattern (Controlled Modal)
```typescript
<Modal open={open} onOpenChange={setOpen}>
  {/* modal content */}
</Modal>
```

### Form Pattern
```typescript
const form = useForm({ resolver: zodResolver(schema) });
<Form {...form}>
  <FormField name="field" ... />
</Form>
```

## Environment Variables (.env)
Contains Supabase configuration:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- VITE_* variables (available in browser)

## Production Build
```bash
npm run build        # Creates dist/ folder
npm run preview      # Preview production build locally
```

## Important Notes

1. **Mobile-first**: Max width 420px (iPhone aspect)
2. **Dark mode only**: No light theme implementation
3. **TypeScript strict**: Full type coverage required
4. **Lovable integration**: Component tagger plugin for Lovable platform
5. **Skeuomorphic design**: Treasure chest theme heavily CSS-based
6. **Animations**: Mix of CSS keyframes and Framer Motion

## Additional Resources

- `.lovable/plan.md` - Detailed design specification for treasure chest redesign
- `PROJECT_SUMMARY.txt` - Comprehensive project documentation (this directory)
- GitHub: https://github.com/juancuartas97/gemlist-diary.git

---

**Last Updated**: 2026-03-05
**Summary File**: /sessions/festive-hopeful-clarke/tmp-repo/PROJECT_SUMMARY.txt
