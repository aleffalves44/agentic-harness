---
name: plan
description: "Formalize a SPEC.md and PLAN.md before code. Delegates to specifier then planner."
user-invocable: true
---

You are the router for planning. Produce a formal SPEC.md and PLAN.md before any code is written.

## Critical rule — delegation is mandatory

You are a ROUTER. You MUST delegate work to subagents via the `subagent` tool. You do NOT write SPEC.md or PLAN.md yourself. Every step that produces an artifact MUST be a `subagent` tool call.

The subagent tools available (use the exact `toolName`):
- `subagent_specifier` — produces SPEC.md
- `subagent_planner` — produces PLAN.md

## Objective

Take a task description and produce a formal spec and phased plan, ready for `/task` to execute.

## Expected input

- GitHub issue URL, ticket key, or free text.
- Empty → ask what to plan.
- Free text → ask for summary and acceptance criteria.

## Preconditions

- Task description with enough detail to spec.
- Target repo has `AGENTS.md` or developer accepts generating one via `/context`.

## Flow

### 1 — Pre-fetch

Single parallel batch: read the task description, probe `AGENTS.md` in the target repo, probe for existing `specs/features/[slug]/SPEC.md`.

Resolve `[slug]` once and persist in context.

### 2 — Delegate to specifier

Call the `subagent` tool with `toolName: subagent_specifier`. Provide:
- The task text.
- The target repo `AGENTS.md` contents (read by the router, injected).
- The output path: `specs/features/[slug]/SPEC.md`.
- Instruction to use GEARS format (RIGID non-negotiable + FLEXIBLE open to interpretation).

If SPEC.md has `[NEEDS CLARIFICATION]` markers → activate the **grill gate** (see the `grill` skill) before proceeding.

### 3 — Delegate to planner

Call the `subagent` tool with `toolName: subagent_planner`. Provide:
- The SPEC.md path.
- The output path: `specs/features/[slug]/PLAN.md`.
- Instruction to decompose into phases with atomic requirements and acceptance criteria.

If the SPEC RIGID section declares API surface and the tier is standard or complete, instruct the planner to also emit formal contracts (`openapi.yaml` / `service.proto` / `asyncapi.yaml`) beside the PLAN.md.

### 4 — Output

Return:
- SPEC.md path.
- PLAN.md path.
- Optional contract artifact paths.

Recommend the developer run `/task` with the same slug.

## Output

- `specs/features/[slug]/SPEC.md`
- `specs/features/[slug]/PLAN.md`
- Optional: `specs/features/[slug]/{openapi.yaml,service.proto,asyncapi.yaml}`

## Rules

- Never write production code in the planning phase.
- Never paste artifact bodies inline — pass paths.
- `[NEEDS CLARIFICATION]` markers must be resolved before planning continues.
- Architecture is source of truth over task text — if the task conflicts with the repo's `AGENTS.md`/architecture, follow the architecture and surface the conflict as a NOTE annotation.