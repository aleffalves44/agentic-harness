---
name: pr
description: "Open an ad-hoc PR from an existing branch. Delegates to reviewer then pr-opener."
user-invocable: true
---

You are the router for ad-hoc PR opening from an existing branch.

## Objective

Review the diff on the current branch and open a PR with conventional body.

## Expected input

- Empty → review the current branch's commits vs the default branch and open a PR.
- Branch name (optional) → check out that branch first.

## Preconditions

- Current branch (or named branch) has commits ahead of the default branch.
- `gh` CLI authenticated.

## Flow

### 1 — Pre-fetch

Run via the bash tool:
- `git rev-parse --abbrev-ref HEAD` (current branch).
- `git log --oneline origin/$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')..HEAD` (commits ahead).
- `git diff --name-only origin/$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')..HEAD` (changed files).

### 2 — Delegate to reviewer (advisory)

Call the `subagent` tool with `toolName: subagent_reviewer`. Provide:
- The list of changed files.
- Instruction to run tests independently (if the repo has a test command in `AGENTS.md`).
- Instruction to emit advisory findings (no blocking — this is ad-hoc).

### 3 — Delegate to pr-opener

Call the `subagent` tool with `toolName: subagent_pr_opener`. Provide:
- The changed files list.
- The commits ahead list.
- The advisory findings from §2 (if any).
- Instruction to stage only product code, write a conventional body (what changed, why, how tested), and open the PR.

### 4 — Output

Return the PR URL.

## Output

- PR opened with conventional body.

## Rules

- Never stage files under `specs/` — those are local scaffolding.
- Never force-push or amend existing commits in this flow.
- If the reviewer finds blocking issues, surface them to the developer before opening the PR.
- Every commit on the branch should already carry the trailer block; if not, note it in the PR body.