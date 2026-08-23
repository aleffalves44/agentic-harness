# Artifact Storage Convention

Pipeline-generated artifacts (SPEC.md, PLAN.md, SPIKE.md, contracts) are local scaffolding — not included in PR commits.

## Paths

`[slug]` is derived once per pipeline (kebab-case, lowercase, ≤ 6 tokens from the task summary) and persisted in pipeline context.

`[artifacts_root]` is resolved once by the router at pipeline start. Order:
1. Env `HARNESS_ARTIFACTS_ROOT` if set and non-empty.
2. Otherwise the default `specs`.

The value MAY be relative (joined to the target repo root — the default `specs` gives `specs/features/[slug]/`) or absolute (used verbatim — lets a developer store artifacts outside the repo).

## Canonical paths

| Producer | Path | Purpose |
|---|---|---|
| specifier | `[artifacts_root]/features/[slug]/SPEC.md` | Formal spec (GEARS: RIGID + FLEXIBLE) |
| planner | `[artifacts_root]/features/[slug]/PLAN.md` | Phased plan |
| planner (conditional) | `[artifacts_root]/features/[slug]/{openapi.yaml,service.proto,asyncapi.yaml}` | Formal contracts when SPEC RIGID declares API surface |
| spike-researcher | `[artifacts_root]/spikes/[slug]/SPIKE.md` | Discovery + recommendation |
| spike-researcher (epic) | `[artifacts_root]/spikes/[slug]/EPIC-BREAKDOWN.md` | Atomic stories with ACs |

## Rules

- Committing agents (`build`, `bug-fixer`) MUST NOT stage any path under `[artifacts_root]/features/` or `[artifacts_root]/spikes/`.
- `pr-opener` MUST NOT reference paths under `[artifacts_root]/` in the PR body.
- Files under `[artifacts_root]/` remain in the working tree for the developer to inspect or commit manually outside the pipeline.
- A `.gitignore` entry for `[artifacts_root]/features/` and `[artifacts_root]/spikes/` is acceptable but not required — the contract is enforced at staging time.

## Why

SPEC/PLAN/VALIDATION are working artifacts. They duplicate the task, regenerate per pipeline invocation, and add review noise without changing repo behavior. The PR conveys what changed in the product, not what the pipeline produced to plan the change.