# GemList — Notion Workspace Guide

This file documents how the GemList Notion workspace is structured and how Claude + Codex use it to coordinate design, product, and engineering work.

**Workspace root:** [💎 GemList](https://www.notion.so/2cd41e66ad62801b9753c76096f2504a)

---

## Workspace Structure

```
💎 GemList
├── 📋 Product
│   ├── GemList — V1 Product Documentation
│   ├── Onboarding Flow
│   ├── ❓ Open Questions for PM
│   ├── 📝 Changelog
│   ├── 🗂️ Feature PRDs
│   └── 💰 Product North Star — Data Monetization Strategy
│
├── 🎨 Design
│   ├── 🎨 Design System v0.1
│   └── 🎨 Design Reviews
│       ├── [feedback content — inline on page]
│       ├── Mine a Gem — Flow Spec
│       ├── Treasure Chest — Screen Spec
│       └── Gem Detail — Screen Spec
│
├── ⚙️ Engineering
│   └── [empty — ADRs and tech docs will land here]
│
├── 🗺️ Roadmap
│   └── [empty — milestone planning will land here]
│
└── 🎨 Design Exports — HTML Prototypes
    └── [index of local HTML prototype files]
```

---

## Section-by-Section Reference

### 📋 Product
**URL:** https://www.notion.so/31a41e66ad628180a191f1552d97546f

Product requirements, decisions, and open questions.

| Page | Purpose | URL |
|---|---|---|
| V1 Product Documentation | Full V1 spec — features, user stories, requirements | https://www.notion.so/2cb41e66ad628023908de445924f19df |
| Onboarding Flow | First-run UX spec | https://www.notion.so/ccafde5e7bd64885a72179d689e41ceb |
| Open Questions for PM | Unresolved product decisions that block design or eng | https://www.notion.so/31941e66ad6281a2a63af7dc76c94ad2 |
| Changelog | Running log of shipped changes | https://www.notion.so/31a41e66ad628139bdf0cea847a6dbcd |
| Feature PRDs | Individual feature specs | https://www.notion.so/31a41e66ad628188be42c193d7051370 |
| Data Monetization Strategy | Product north star and revenue model | https://www.notion.so/31a41e66ad6281d3b6faf4c4737ff6de |

---

### 🎨 Design
**URL:** https://www.notion.so/31a41e66ad6281cba774ff4ab32430be

Visual language, component system, prototypes, and design feedback.

#### Design System v0.1
**URL:** https://www.notion.so/31941e66ad6281fdb897ca4c08289692

Canonical source for design tokens and component patterns. If there is a conflict between the Notion design system doc and the code in `src/index.css`, treat the code as ground truth (it was updated more recently).

Key tokens (from `src/index.css`):
- `--primary: hsl(145, 75%, 55%)` — emerald green
- `--secondary: hsl(280, 95%, 50%)` — purple
- Background: `linear-gradient(135deg, hsl(150,40%,8%), hsl(280,40%,8%), hsl(150,40%,6%))`
- Glass system: `hsl(150, 30%, 12%, 0.55)` + `blur(44px) saturate(185%)`
- 12 gem color tokens (`--gem-green`, `--gem-purple`, `--gem-blue`, etc.)
- Rarity tiers: common → uncommon → rare → legendary → mythic
- Typography: Syne (display/headings, `font-display` class) + Inter (body)

---

#### 🎨 Design Reviews
**URL:** https://www.notion.so/31a41e66ad62806b8aece6ba6e00c9b3

**How this section works:** Juan posts design feedback here (screenshots + numbered notes). Claude reads the notes, implements the changes in the repo, then commits. The implementation history lives in git; the feedback source of truth lives here.

**Currently on this page (inline — not sub-pages):**

> **Home Screen Design Feedback — 3/5/26**
> 1. Your Vibe section needs more depth — make bars glow, add info icon explaining how vibe is generated
> 2. Freshly Mined gems should open in a larger card when tapped
> 3. Top genre card should match the color of its genre; ensure even alignment/weighting; link all cards
> 4. Chest icon is cut off at the bottom
> 5. Mine button should float above the profile tab with user-repositionable left/right position
> 6. Gem cards are too crowded — simplify, show details only on open
>
> **Status: ✅ Implemented** in commit `f96c960`

**Sub-pages (design specs created by Claude, reviewed by Juan, handed to Codex for implementation):**

| Page | Screens | Status | URL |
|---|---|---|---|
| Mine a Gem — Flow Spec | 9 screens | ✅ Spec complete, awaiting Juan's review | https://www.notion.so/31b41e66ad6281108709f1483b9a8baf |
| Treasure Chest — Screen Spec | 6 screens | ✅ Spec complete, awaiting Juan's review | https://www.notion.so/31b41e66ad62819c90c2cbbb4a05477c |
| Gem Detail — Screen Spec | 7 screens | ✅ Spec complete, awaiting Juan's review | https://www.notion.so/31b41e66ad62810fb655c0f48eeae228 |

Each spec page contains:
- Screen-by-screen breakdown with design rationale
- Component notes for engineering
- **Open Questions** section — these must be answered by Juan before implementing

---

### 🎨 Design Exports — HTML Prototypes
**URL:** https://www.notion.so/31a41e66ad62817aa3d3db553b8f1dd8

Index of interactive HTML prototypes. These files live on Juan's machine at `GemList/design-exports/` and are **not tracked in the git repo**. The Notion page documents what each file contains.

| File | Description | Size |
|---|---|---|
| `GemCard-Design-System.html` | All 5 rarity tiers, gem SVG cuts, glass cards, facet dots, compact/full modes | ~58KB |
| `GemList-App-Screen.html` | Full app screen mockup — nav tabs, chest grid, achievement pins | ~44KB |
| `GemList-Style-Guide.html` | Typography, color tokens, glass variants, animation tokens | ~72KB |
| `mine-a-gem.html` | 9-screen interactive prototype for the Mine a Gem flow | ~69KB |
| `treasure-chest.html` | 6-screen interactive prototype for the Treasure Chest view | ~47KB |
| `gem-detail.html` | 7-screen interactive prototype for Gem Detail (view, edit, delete, edge cases) | ~64KB |

To view: open any file directly in a browser. Use arrow keys or the step-dot nav to advance screens.

---

### ⚙️ Engineering
**URL:** https://www.notion.so/31a41e66ad6281a0beb6fbf02725f470

Currently empty. Architecture Decision Records (ADRs), runbooks, and integration notes will land here. When Claude or Codex makes a significant architectural decision, document it here.

---

### 🗺️ Roadmap
**URL:** https://www.notion.so/31a41e66ad628143b79ae2e3609fcecf

Currently empty. Milestone planning and prioritization will land here.

---

## How We Use Notion — Workflow

### Design feedback → implementation loop

```
Juan posts feedback in 🎨 Design Reviews
        ↓
Claude reads the page (notion-fetch tool)
        ↓
Claude implements changes in repo
        ↓
Claude commits with prefix `claude:` and notes which Notion feedback item was addressed
        ↓
Codex reviews the diff for correctness, regressions, typing issues
```

### Design → engineering handoff loop

```
Claude builds HTML prototype in design-exports/
        ↓
Claude creates Notion spec page under 🎨 Design Reviews
  (screen-by-screen breakdown + open questions)
        ↓
Juan reviews prototype + answers open questions
        ↓
Codex or Claude implements in React, referencing the spec page
        ↓
Link the commit(s) back to the spec page in HANDOFF.md
```

### Open questions protocol

Every design spec page has an **Open Questions** section. These are blockers for implementation. Neither Claude nor Codex should implement a feature that has unresolved open questions in its spec — flag it in `HANDOFF.md` instead and wait for Juan.

---

## Quick-Access URLs

| Section | URL |
|---|---|
| Workspace root | https://www.notion.so/2cd41e66ad62801b9753c76096f2504a |
| Product | https://www.notion.so/31a41e66ad628180a191f1552d97546f |
| Design | https://www.notion.so/31a41e66ad6281cba774ff4ab32430be |
| Design Reviews | https://www.notion.so/31a41e66ad62806b8aece6ba6e00c9b3 |
| Design System v0.1 | https://www.notion.so/31941e66ad6281fdb897ca4c08289692 |
| Mine a Gem spec | https://www.notion.so/31b41e66ad6281108709f1483b9a8baf |
| Treasure Chest spec | https://www.notion.so/31b41e66ad62819c90c2cbbb4a05477c |
| Gem Detail spec | https://www.notion.so/31b41e66ad62810fb655c0f48eeae228 |
| Engineering | https://www.notion.so/31a41e66ad6281a0beb6fbf02725f470 |
| Roadmap | https://www.notion.so/31a41e66ad628143b79ae2e3609fcecf |
| HTML Prototypes index | https://www.notion.so/31a41e66ad62817aa3d3db553b8f1dd8 |

---

## Notes for Codex

- **Read Notion pages before implementing any feature** that has a corresponding spec. Use the URLs above.
- Notion is the source of truth for *what* to build. The repo is the source of truth for *how it's currently built*.
- If you encounter a Notion spec with open questions that haven't been answered, do not implement that feature — add a note in `HANDOFF.md` and move on to the next task.
- The design system tokens in `src/index.css` may be more up-to-date than the Design System v0.1 Notion page. When in doubt, check the CSS.
- When you implement something from a spec, append an entry to `HANDOFF.md` noting which spec page you used.
