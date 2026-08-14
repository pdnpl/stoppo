# 11. Enforced pull requests on a public repository

- Status: Accepted
- Date: 2026-08-14

## Context

The brief asks for enforced pull request rules with autonomous review and merge.
Two constraints shape what is actually possible:

- The `pdnpl` organisation is on GitHub's free plan, where rulesets and branch
  protection are only enforced on **public** repositories. On a private free-plan
  repo the rules exist but do not bite.
- GitHub does not let an author approve their own pull request. With a single
  operating account, a rule requiring one approval would deadlock every change.

## Decision

The repository is **public**, and `main` is protected by a ruleset that:

- requires changes to arrive through a pull request,
- requires the `check` status check to pass before merge,
- requires the branch to be up to date with `main`,
- blocks force pushes and deletion,
- requires **zero** approvals.

The gate that actually holds the line is CI, not a human rubber stamp:
formatting, lint, types, the full test suite and a production build all have to
pass on the merge commit.

## Consequences

- Nothing reaches `main` without green CI, which for this project means the
  timing rules are re-proved on every change.
- The history stays reviewable: every change has a pull request with a
  description and a diff.
- Requiring zero approvals is an honest reflection of a one-account
  organisation, not a loophole. Adding a second maintainer should be followed by
  raising it to one.
- The repository being public is a consequence of the plan, not a preference. It
  contains no secrets; deployment credentials live in GitHub Actions secrets and
  never in the tree.

## Alternatives considered

**Private repo with rules configured but unenforced.** Looks the same in the
settings UI and stops nothing. Worse than having no rule, because it invites
false confidence.

**Requiring one approval.** Deadlocks immediately with a single account. Correct
the moment there are two people.

**Committing straight to `main`.** Faster, and throws away the CI gate that
makes autonomous changes safe to make in the first place.
