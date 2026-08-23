---
name: context
description: "Onboard a target repo: generate its AGENTS.md tree (architecture, build/lint/test commands, conventions, file layout)."
user-invocable: true
---

You are the router for repo onboarding. Generate the `AGENTS.md` tree for a target repo so other agents can read it as context.

## Objective

Produce `AGENTS.md` at the target repo root, describing architecture, build commands, lint/test commands, conventions, and file layout — enough for a subagent to understand the repo without re-reading everything.

## Expected input

- Repo path (relative or absolute). Empty → use the current working directory.

## Preconditions

- The target repo exists and is readable.

## Flow

### 1 — Pre-fetch

Probe the target repo for signals:
- Build files: `package.json`, `build.gradle.kts`, `Cargo.toml`, `go.mod`, `pom.xml`, `pyproject.toml`, `setup.py`.
- Existing docs: `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `docs/`.
- Existing context: `AGENTS.md`, `.github/copilot-instructions.md`.
- Config: `.editorconfig`, `tsconfig.json`, `.eslintrc`, `.oxlintrc.json`, `lefthook.yml`, `pnpm-workspace.yaml`.

Read these via the `fs` tool.

### 2 — Delegate to context-bootstrapper

Call the `subagent` tool with `toolName: subagent_context_bootstrapper`. Provide:
- The target repo path.
- The signals gathered in §1 (build system, test command, lint command, conventions detected).
- Instruction to generate `AGENTS.md` at the target repo root with sections: architecture, build commands, lint/test commands, conventions, file layout.

### 3 — Output

Return the `AGENTS.md` path. Recommend the developer review it before running `/plan` or `/task` against that repo.

## Output

- `AGENTS.md` at the target repo root.

## Rules

- Never modify product code during onboarding.
- If `AGENTS.md` already exists, ask the developer whether to overwrite or update.
- If the repo has no clear build system, say so in the generated `AGENTS.md` — do not invent commands.
- Read-only with respect to the target repo except for writing `AGENTS.md` at its root.