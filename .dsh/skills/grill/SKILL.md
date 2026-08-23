---
name: grill
description: "Stress-test a plan, design, or decision with calibrated questions. One question at a time, recommended answers provided."
user-invocable: true
---

Calibrated grilling session for stress-testing a plan, design, idea, or decision before implementation.

## When to run

- After `/plan` produces a SPEC.md with `[NEEDS CLARIFICATION]` markers.
- Before delegating to a writing agent, when the plan has unresolved ambiguity.
- When the developer says "grill me" or wants a plan probed.

## Flow

1. **Assess** — read the SPEC.md / plan / decision document. Classify the topic's knowledge depth (shallow, moderate, deep) and the developer's likely confidence.

2. **Calibrate pressure** — ask the developer the desired pressure level (gentle, standard, adversarial). Default: standard.

3. **One question at a time** — ask a single, specific question that exposes a weakness in the plan. Provide 2-3 recommended answers based on best practice, marked with "(Recommended)" on the strongest one.

4. **Record the answer** — note the developer's answer. If it reveals a gap, update the SPEC.md's `[NEEDS CLARIFICATION]` marker to resolved with the decision.

5. **Continue or stop** — continue until either:
   - All `[NEEDS CLARIFICATION]` markers are resolved.
   - The developer says stop.
   - You hit a question you cannot answer with evidence — say so explicitly and stop.

## Output

- Updated SPEC.md with resolved clarifications (in-place edit).
- A summary of decisions made during the session, appended to the SPEC.md under `## Grill decisions`.

## Rules

- One question at a time. Never a list.
- Every question has recommended answers; never leave the developer without a default.
- If the plan has no weaknesses, say so — do not invent questions.
- Questions target the load-bearing assumptions: what if this is wrong? what evidence supports this? what is the cost of being wrong here?
- Never grill for ceremony — each question must expose a real risk, not test knowledge for its own sake.