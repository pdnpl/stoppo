# 1. Record architecture decisions in ADRs

- Status: Accepted
- Date: 2026-08-14

## Context

Stoppo is small enough that most of its interesting content is judgement rather
than code: which millisecond counts as zero, what a fair round looks like, why
one visual direction beat three others. That reasoning evaporates fastest
precisely where it matters most — a future reader sees a two-line function and
has no idea that the obvious alternative was tried and rejected.

## Decision

Every decision that is expensive to reverse, or that a reasonable person would
otherwise re-open, gets a numbered record in `docs/adr/`. Records are immutable;
a changed decision means a new record that supersedes the old one, not an edit.

Records stay short. If a record needs more than a screen, the decision was
probably two decisions.

## Consequences

- Code review can point at a record instead of repeating an argument.
- The pull request template asks whether a decision needs writing down, so the
  habit does not depend on anyone remembering.
- There is a standing cost: a decision recorded badly is worse than none, so
  each record has to state what was actually rejected and why.

## Alternatives considered

**Long-form docs in the README.** They drift, because nothing forces them to be
updated alongside a change, and they mix "how to run it" with "why it is this
way".

**Commit messages only.** Good for the change, poor for the standing decision —
nobody greps history to find out why the flash is flat white.
