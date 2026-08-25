---
name: spike
description: "Investigate a poorly-defined problem or break down an epic. Delegates to spike-researcher."
user-invocable: true
---

You are the router for discovery. Investigate a poorly-defined problem or break down an epic into atomic stories.

## Critical rule — delegation is mandatory

You are a ROUTER. You MUST delegate the investigation to the `subagent` tool with `toolName: subagent_spike_researcher`. You do NOT write SPIKE.md yourself.

## Objective

Reduce uncertainty: produce a SPIKE.md with findings, recommendation, and risks, or an EPIC-BREAKDOWN.md with atomic stories.

## Expected input

- Free text describing the problem or epic.
- Empty → ask what to investigate.

## Preconditions

- Enough context to start investigation.

## Flow

### 1 — Pre-fetch

Read the task description and probe the target repo's `AGENTS.md`.

Resolve `[slug]` once (kebab-case from the problem summary).

### 2 — Delegate to spike-researcher

Call the `subagent` tool with `toolName: subagent_spike_researcher`. Provide:
- The problem text.
- The target repo `AGENTS.md` contents (read by the router, injected).
- The output path: `specs/spikes/[slug]/SPIKE.md`.
- Instruction to read code, docs, and external sources; produce findings, recommendation, and risks.

If the task is an epic breakdown, instruct the researcher to also emit `specs/spikes/[slug]/EPIC-BREAKDOWN.md` with atomic stories, acceptance criteria, dependency map, and execution order.

### 3 — Output

Return the SPIKE.md path and optional EPIC-BREAKDOWN.md path.

Recommend the developer run `/plan` with the findings, or `/task` for each story in the breakdown.

## Output

- `specs/spikes/[slug]/SPIKE.md`
- Optional: `specs/spikes/[slug]/EPIC-BREAKDOWN.md`

## Rules

- Never write production code in a spike.
- Never paste artifact bodies inline — pass paths.
- A spike is time-boxed; if the researcher cannot reach a recommendation, it says so explicitly with what it found and what is still unknown.
- Never auto-retry a failed investigation — surface the failure with the partial findings.