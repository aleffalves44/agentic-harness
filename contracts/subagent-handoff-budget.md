# Subagent Handoff Budget

Constraints on context passed between router and subagents, to keep delegation efficient and parent context lean.

## Budget limits

| Surface | Limit |
|---|---|
| Subagent delegation prompt | ≤ 1500 chars |
| Subagent output (path + summary) returned to router | ≤ 200 bytes |
| Parallel pre-fetch batch in §1 of any command | single batch, all read-only calls |

## Rules

- **Pre-digest context**: the router injects pre-collected data (task text, `AGENTS.md` contents, existing artifact paths) in the delegation prompt. Never let the subagent re-fetch what the router already has.
- **Filesystem as handoff**: durable artifacts (SPEC.md, PLAN.md, SPIKE.md) flow via path. The next agent reads with the `fs` tool. Never paste the full body inline in the delegation prompt.
- **Output is a path + summary**: the subagent returns the artifact path and a one-line summary, never the full content. The router decides whether to read it.
- **Single parallel batch**: §1 pre-fetch in any command is one parallel batch of read-only calls. No cascading fetches.

## Why

Subagents start with a blank context. Every token in the delegation prompt is paid again on every step the child takes. Pasting a full SPEC.md (often 5-10KB) in the prompt burns context the child needs for its own work. Passing the path costs ~50 chars and the child reads only what it needs.

The 200-byte output limit forces the child to summarize. A child that returns "SPEC.md written at specs/features/X/SPEC.md, 3 RIGID + 2 FLEXIBLE requirements" is useful. One that returns the full SPEC.md body back to the router is noise the parent pays for.