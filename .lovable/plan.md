

# Skeuomorphic Treasure Chest Redesign

## Overview
Transform the Treasure Chest tab into a visually immersive skeuomorphic treasure chest. The tab icon becomes a chest icon, and the page itself is redesigned to look like a physical treasure chest with a wooden body, metal hardware, a lock/key motif, and gems visible inside.

## Changes

### 1. Tab Icon -- Replace Gem with Chest
In `AppShell.tsx`, replace the `Gem` lucide icon with a custom `TreasureChestIcon` SVG component that depicts a small treasure chest silhouette (lid, body, clasp). This gives the bottom nav a distinctive look.

### 2. New Component: `TreasureChestIcon`
Create `src/components/icons/TreasureChestIcon.tsx` -- a small SVG icon component (24x24) depicting a treasure chest outline suitable for the tab bar. Styled with `currentColor` so it inherits active/inactive tab colors.

### 3. Redesign TreasureChestTab Page Layout
Restructure the page into three visual zones that together form a chest:

**A. The Lid (top)**
- The existing trophy-lid with festival enamel pins becomes the **chest lid**
- Styled with dark wood grain texture (CSS gradients), gold metal corners/hinges, and a subtle curved top
- The enamel pins sit on the inner lid like stickers on a suitcase
- A decorative gold hinge strip connects the lid to the body

**B. The Lock & Key Strip (middle divider)**
- Between lid and body, a decorative metal strip with a centered lock/keyhole motif
- The lock is a CSS-rendered padlock silhouette in gold/brass
- A small key icon sits beside it (from lucide `KeyRound`)
- Filter/sort controls are integrated into this strip as small metallic buttons, like hardware on the chest

**C. The Body (main area with gems)**
- The glass shelves are wrapped in a container styled as the **inside of the chest**
- Dark velvet-textured background (deep purple/crimson radial gradient with subtle fabric noise)
- The existing GlassShelf components sit inside as display trays
- Side walls visible as subtle wooden panels with metal corner brackets
- The "Mine a Gem" button sits at the bottom as a brass plate

### 4. CSS Additions in `index.css`
New styles for:
- `.chest-lid` -- wood grain via repeating linear gradients, rounded top corners, gold border accents
- `.chest-hinge` -- metallic strip connecting lid to body
- `.chest-lock` -- centered padlock with keyhole cutout, brass gradient
- `.chest-body` -- velvet interior background, wooden side borders, metal corner brackets
- `.chest-corner-bracket` -- gold/brass corner decorations on the chest body
- `.wood-grain` -- reusable wood texture using layered CSS gradients (dark walnut tone to match the cyberpunk-luxury theme)

### 5. Empty State
When the chest has no gems, show a dark interior with a single soft glow in the center and text: "Your chest awaits its first gem..." with the keyhole icon subtly glowing.

## Visual Structure (top to bottom)

```text
+------------------------------------------+
|  ~~~~ Curved Chest Lid (wood grain) ~~~~ |
|  [Pin] [Pin] [Pin] [Pin] ... (scrollable)|
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
+====== Gold Hinge Strip ==================+
|   [Filter]  [Lock Icon]  [Sort]          |
+====== Metal Divider =====================+
|                                          |
|   +------+   +------+   +------+        |
|   | Gem  |   | Gem  |   |Clstr |   <-- Velvet interior
|   +------+   +------+   +------+        |
|                                          |
|   +------+   +------+   +------+        |
|   | Gem  |   | Gem  |   | Gem  |        |
|   +------+   +------+   +------+        |
|                                          |
|          [ Mine a Gem ]                  |
|  ~~~~~~~~ Wooden Floor ~~~~~~~~~~~~~~~~~ |
+------------------------------------------+
```

## Technical Details

- **Files to create**: `src/components/icons/TreasureChestIcon.tsx`
- **Files to modify**: `src/pages/AppShell.tsx` (tab icon swap), `src/components/tabs/TreasureChestTab.tsx` (layout restructure), `src/index.css` (new chest styles)
- **No new dependencies** -- all textures are CSS gradients and SVG
- **Existing components preserved** -- `GlassShelf`, `CrystalGem`, `EnamelPin`, `GemCluster` all remain unchanged; only their container/wrapper changes
- **Dark wood palette**: `#1a1008`, `#2d1a0e`, `#3d2816` -- warm walnut tones that complement the existing cyberpunk-luxury theme
- **Metal accents**: Gold/brass gradients using amber/yellow HSL values already in the design system (`--gem-amber`)

