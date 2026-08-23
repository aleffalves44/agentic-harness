# Artifact Scanning Contract

Before invoking any subagent, the router rescans accumulated context for external URLs and injects fresh extracts.

## What to scan

At every delegating step, scan:
- The task description.
- Previous subagent outputs.
- Any URLs the developer or previous agents surfaced.

For each URL found, fetch fresh content via the `web` tool (if available) and inject the extract into the next subagent's delegation prompt.

## Rules

- **Rescan at every step**, not just §1. A subagent may surface a URL in its output that the next step needs.
- **Inject extracts, not URLs** — the subagent starts blank; giving it a URL means it re-fetches (costs context, may fail offline). Pre-digest the extract and inject.
- **Read-only** — scanning never writes to external systems. Web fetch is read-only.
- **Skip when no URLs** — if no external URLs are present in accumulated context, scanning is a no-op. Do not invent fetches.

## Applies to

Every command that delegates: `/task`, `/plan`, `/spike`, `/pr`. Not applicable to `/context` (it reads the local repo, not external platforms).