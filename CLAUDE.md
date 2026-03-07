# CLAUDE.md

Read this file at the start of every session.

## Role In This Repo

You are the primary implementation agent for `gemlist-diary`.
Codex is the fallback implementation agent and the review agent.

There is no direct Claude-to-Codex communication channel. Coordination happens through:

- git history
- diffs
- handoff notes
- [AGENT_COLLABORATION.md](/Users/juancuartas/Documents/GitHub/gemlist-diary/AGENT_COLLABORATION.md)

## Collaboration Rules

1. Before editing, inspect git state and preserve any in-flight changes you did not make.
2. Keep changes narrowly scoped to the requested task.
3. Prefer commit messages prefixed with `claude:`.
4. End each task with a short handoff containing:
   - Summary
   - Files changed
   - Verification run or not run
   - Risks or follow-ups
5. Expect Codex to review your changes for:
   - bugs
   - regressions
   - typing issues
   - integration issues
   - missing tests
   - mobile layout regressions
6. If Codex already partially implemented a task, build on that work rather than replacing it unless explicitly told otherwise.
7. Do not add attribution comments to routine code. Add brief rationale comments only for non-obvious logic.

## Product Context

GemList is a personal logging platform for live DJ sets.
Users collect "Gems" representing sets they attended.
The core metaphor is a Treasure Chest that fills up over time into a personal archive of live music history.

This is a mobile-first PWA. Design every screen as if it is used on a phone first.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase
- TanStack React Query
- React Hook Form
- Zod
- Framer Motion
- React Router DOM

## Important Structure

```text
src/
  components/
    ui/           # shadcn primitives; do not edit directly
    tabs/         # major tab views
    treasure/     # gem-related modals and UI
    achievements/ # achievements UI
    goals/        # goal tracking UI
  pages/
    AppShell.tsx
    Auth.tsx
    Onboarding.tsx
    SettingsPage.tsx
    Index.tsx
  hooks/
    useAuth.tsx
    useGemData.ts
  integrations/supabase/
  lib/
    mockData.ts
```

## Routing

- `/` -> splash / landing
- `/onboarding` -> onboarding flow
- `/auth` -> login / sign up
- `/app` -> authenticated app shell
- `/settings` -> settings page
- `/artists` -> artists portal

App shell handles tab state internally. Tabs are not separate routes.

## Working Rules

1. Do not modify `src/components/ui/` directly.
2. Do not add packages unless the existing stack cannot handle the requirement.
3. Do not hardcode colors when existing design tokens or Tailwind tokens already cover the need.
4. Do not introduce new global state unless it is clearly justified.
5. Fetch app data through `src/hooks/useGemData.ts` patterns rather than direct component-level Supabase calls.
6. Use React Hook Form plus Zod for forms.
7. Keep modal content scrollable and consistent with the app's glass styling.
8. Validate mobile layout after UI changes.

## Practical Workflow

1. Identify the page or tab that owns the feature.
2. Put new UI in the most specific folder available.
3. Put new data access in `src/hooks/useGemData.ts` or adjacent hook utilities.
4. Keep edits focused and easy to review.
5. Leave a clean handoff for Codex and the user at the end.
