# Commit Trailer Contract

Every commit produced by a subagent in this harness MUST include the trailer block below.

## Required trailer block

Appended verbatim to every commit message, after the conventional-commit body, one blank line between:

```
Co-Authored-By: AI <noreply@local>
AI-Assisted: yes
AI-Harness: agentic-harness
```

All three trailers are mandatory; none may be omitted, renamed, or altered.

## Resolving placeholders

- `Co-Authored-By` email: `noreply@local` by default. Adapt to your organization's AI attribution email if your git host renders co-author avatars from it.
- `AI-Harness`: fixed `agentic-harness`. Do not change per-command.

## Rewrite flows

On `--amend`, rebase, or squash: re-emit the trailer if dropped. Squash-merge preserves `Co-Authored-By` on most git hosts, so a trailer on the final commit is sufficient; emit on every commit so non-squash merges also propagate.

## Applies to

Every subagent that creates commits: `build`, `bug-fixer`, and any future committing agent. Does not apply to commits authored manually by the developer outside the pipeline.