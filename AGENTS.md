# AGENTS.md

Runtime behavior contracts for agents and skills in this project.

## Architecture

### Core invariants

- **Skills are thin routers** — `/task`, `/plan`, `/spike`, `/pr`, `/context` normalize input, validate, and instruct the model to delegate to the right subagent via the `subagent` tool. Never contain implementation logic.
- **Subagents are isolated** — each child has its own session, persona, and tool filter. Does not inherit parent conversation. Pre-digest context into the delegation prompt; never let the child re-fetch.
- **Filesystem as handoff surface** — durable artifacts (SPEC.md, PLAN.md, SPIKE.md) flow via path; the next agent reads with the `fs` tool. Never paste body inline.
- **Architecture is source of truth over task text** — when task text conflicts with target repo architecture, follow the architecture. Surface the conflict as a `QUESTION` annotation; never silently bend code.
- **Explicit input/output** — every flow step declares input and output artifacts.
- **Trust but verify** — after each subagent delegation, check expected artifacts on disk.

### Agent delegation principles

| # | Principle | Rule |
|---|---|---|
| 1 | Pre-digest context | Inject pre-collected data in the delegation prompt. Never let the child re-fetch. |
| 2 | Explicit input/output | Every step declares input and output artifacts. |
| 3 | Filesystem as handoff | Durable artifacts flow via path. Never paste body inline. |
| 4 | Error recovery | No auto-retry. Critical steps include explicit recovery clauses. |
| 5 | Dynamic content at the end | Stable prefix (role, workflow, rules) first; dynamic (task, slug) last. Maximizes cache hits. |
| 6 | Tool calls, not text | Agents writing files use the `fs` tool. If tool calls appear as text, the router writes them itself. |

### Subagent taxonomy

Subagents are declared in `cordis.yml` as `tool-subagent-<name>` entries, each with a `persona` and `toolFilter`. The model invokes them via the `subagent` tool.

| Agent | Tool name | Persona | Role |
|---|---|---|---|
| specifier | `subagent_specifier` | Formal spec author | GEARS/SPEC format, RIGID + FLEXIBLE |
| planner | `subagent_planner` | Phased planner | Decomposes SPEC into PLAN.md with phases |
| build | `subagent_build` | Coding agent | Test-first, runs tests, commits |
| bug-fixer | `subagent_bug_fixer` | Diagnostic engineer | Root cause → spec → fix |
| reviewer | `subagent_reviewer` | Code reviewer | Last gate before PR |
| pr-opener | `subagent_pr_opener` | PR opener | Opens PR with conventional body |
| spike-researcher | `subagent_spike_researcher` | Discovery agent | Investigates, recommends |
| context-bootstrapper | `subagent_context_bootstrapper` | Onboarding agent | Generates AGENTS.md tree |

### Commit trailer contract

Every commit produced by a subagent MUST include the trailer block:

```
Co-Authored-By: AI <noreply@local>
AI-Assisted: yes
AI-Harness: agentic-harness
```

All three trailers are mandatory. Adapt the email to your organization if needed.

### Artifact storage convention

`[slug]` is derived once per pipeline from the task summary (kebab-case, lowercase, ≤ 6 tokens) and persisted in pipeline context.

| Producer | Path | Purpose |
|---|---|---|
| specifier | `specs/features/[slug]/SPEC.md` | Formal spec |
| planner | `specs/features/[slug]/PLAN.md` | Phased plan |
| spike-researcher | `specs/spikes/[slug]/SPIKE.md` | Discovery + recommendation |

Artifacts under `specs/` are local scaffolding — NOT included in PR commits.

### AI annotation contract

Author agents surface annotations about design decisions, deferred work, ambiguities — never as inline code comments. Annotations live in the PR description.

| Kind | When to emit |
|---|---|
| `NOTE` | Non-obvious invariant, hidden coupling |
| `TODO` | Work intentionally deferred |
| `QUESTION` | Decision needs human review (blocks PR) |
| `DECISION` | Design trade-off future readers might revisit |

## Output tone

- Direct and objective. Start with content — no preamble.
- No praise or affirmations. Begin with substance.
- If something is wrong: say so clearly. Do not soften.
- Technical disagreements: express with arguments.
- No unnecessary hedging when there is a clear answer.
- Do not restate what was said before responding.
- Improvement suggestions: always evaluate a better approach if one exists.