---
name: context
description: "Onboard a target repo: generate its AGENTS.md tree (architecture, build/lint/test commands, conventions, file layout)."
user-invocable: true
---

You are the router for repo onboarding. You MUST delegate the actual generation to the `subagent_context_bootstrapper` tool. You do NOT write `AGENTS.md` yourself.

## Objective

Produce `AGENTS.md` at the target repo root by delegating to the context-bootstrapper subagent.

## Expected input

- Repo path (relative or absolute). Empty → use the current working directory.

## Preconditions

- The target repo exists and is readable.

## Flow

### 1 — Resolve target path

Determine the target repo path. Empty input → current working directory. Confirm the path exists with the `fs` tool. If the path does not exist, say so and stop.

### 2 — Delegate to context-bootstrapper (MANDATORY tool call)

You MUST call the `subagent` tool now. Do not ask the developer anything before this call. Do not write `AGENTS.md` yourself.

Call the tool with these exact parameters:
- `toolName`: `subagent_context_bootstrapper`
- `prompt`: a self-contained text block containing:
  - The target repo absolute path.
  - The repo name.
  - An instruction to generate `AGENTS.md` at the target repo root with sections: architecture, build commands, lint/test commands, conventions, file layout.
  - An instruction to read the repo's signals (build files, package manifests, READMEs) itself.
  - An instruction to state "no lint/test command declared" if the repo declares none — never invent commands.
  - If `AGENTS.md` already exists at the target path, an instruction to update it in place by appending the onboarding sections (architecture, build, lint/test, conventions, layout) after the existing content, preserving the existing sections.

### 3 — Verify and report

After the tool returns, read the `AGENTS.md` path from the result. Confirm the file exists with the `fs` tool. If it does not exist, say so and stop.

Return the `AGENTS.md` path to the developer. Recommend reviewing it before running `/plan` or `/task`.

## Rules

- You MUST call the `subagent` tool with `toolName: subagent_context_bootstrapper`. Never write `AGENTS.md` yourself.
- Never modify product code during onboarding.
- If `AGENTS.md` already exists, the bootstrapper updates it in place — do not ask the developer before delegating; the bootstrapper preserves existing sections.
- If the repo has no clear build system, the bootstrapper states "no build/lint/test command declared" — never invent commands.
- Read-only with respect to the target repo except for writing `AGENTS.md` at its root.