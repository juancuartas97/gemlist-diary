# Agent Collaboration Protocol

This repo is worked on by two coding agents:

- Claude: primary implementation agent
- Codex: fallback implementation agent and review agent

There is no direct agent-to-agent messaging channel. Coordination happens through git history, repo files, diffs, and this protocol.

## Goals

- Keep agent work traceable
- Prevent one agent from overwriting the other's changes
- Make Codex review Claude's work before or after merge, depending on urgency
- Keep the codebase readable without filling it with attribution noise

## Attribution Rules

Use attribution in places that stay useful:

- Codex commits must start with `codex:`
- Claude commits should start with `claude:` when possible
- Branch names should include the agent name when the branch is agent-owned
- Only add inline attribution comments for non-obvious logic or temporary handoff notes

Examples:

- `codex: tighten TreasureChestTab typing`
- `claude: add artists portal entry point`
- `codex/review-treasure-chest`
- `claude/festival-lineup-import`

Avoid adding comments like `created by Codex` on routine JSX, styling, or simple helpers. That reduces code quality.

## Ownership Model

- Claude is optimized for fast feature implementation
- Codex is optimized for review, hardening, bug finding, follow-up edits, and fallback implementation during Claude rate limits
- Either agent may implement features, but Codex should review Claude-authored code whenever practical

## Required Workflow

### 1. Before an agent edits

- Check `git status --short --branch`
- Check the current branch and recent commits
- Inspect existing uncommitted changes before modifying the same files

### 2. If Claude is implementing

- Claude should state the scope of the task in its first response
- Claude should keep changes focused to the requested feature or fix
- Claude should leave a short handoff summary listing:
  - files changed
  - behavior changed
  - tests run or not run
  - known risks or follow-ups

### 3. If Codex is implementing

- Codex uses `codex:` commit prefixes
- Codex should preserve Claude's in-flight changes unless explicitly asked to replace them
- Codex may add short `Codex:` comments only where rationale is needed for future maintenance

### 4. Review gate

When reviewing Claude's code, Codex should prioritize:

- correctness bugs
- regressions
- integration mismatches
- missing edge-case handling
- missing or insufficient tests
- type safety issues
- mobile layout regressions

Review output should list findings first with file and line references. If no findings are present, say that explicitly.

### 5. Merge policy

- Urgent fixes may merge first and be reviewed immediately after
- Larger Claude feature branches should be reviewed by Codex before merge when possible
- If Codex finds a defect after merge, Codex should patch it in a focused follow-up commit

## Handoff Format

Each agent should leave a short handoff in the final response using this structure:

### Summary

- what changed

### Files

- absolute or repo-relative paths changed

### Verification

- commands run
- or `not run`

### Risks

- remaining concerns
- or `none`

### Next

- optional follow-up step

## Current Codex Review Policy

For this repo, Codex will review Claude-authored changes with findings-first output. The latest merged Claude fix reviewed so far is:

- commit `2d808c6` on `src/components/tabs/TreasureChestTab.tsx`

Initial review result:

- no findings in that diff
- the fix is a minimal closing-tag repair with no apparent behavioral regression

## Prompt For Claude

Paste this into Claude at the start of a task or save it as project guidance:

```md
You are working in the `gemlist-diary` repo alongside Codex.

Follow this collaboration protocol:

1. You are the primary implementation agent. Codex is the fallback implementation and review agent.
2. Do not assume direct communication with Codex. Coordination happens through git history, diffs, handoff notes, and repo docs.
3. Keep changes narrowly scoped to the requested task.
4. Before editing, inspect the current git state and preserve any in-flight changes you did not make.
5. Prefer commit messages prefixed with `claude:`.
6. End every task with a short handoff containing:
   - Summary
   - Files changed
   - Verification run or not run
   - Risks / follow-ups
7. Expect Codex to review your code for bugs, regressions, typing issues, integration issues, and missing tests.
8. If you add non-obvious logic, leave a short rationale comment. Do not add attribution comments to routine code.
9. Preserve the repo's mobile-first design constraints and existing architecture.

If a task was already partially implemented by Codex, build on it rather than replacing it unless explicitly told to do so.
```

## Default Operating Agreement

- Claude builds first when available
- Codex reviews and hardens Claude changes
- Codex implements directly when Claude is unavailable or rate-limited
- Both agents use git history and concise handoff notes as the shared memory layer
