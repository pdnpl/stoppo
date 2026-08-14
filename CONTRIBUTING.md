# Contributing

## Getting set up

```bash
npm install
npm run dev
```

Node 24 (see `.nvmrc`). Everything else is a dev dependency.

## The flow

`main` is protected. Changes arrive through a pull request that passes CI —
formatting, lint, types, tests and a production build. No approval is required,
because the organisation runs on a single account; the CI gate is what actually
holds the line. See
[ADR 11](docs/adr/0011-enforced-prs-on-a-public-repo.md).

```bash
git switch -c feat/short-description
# work
npm run format && npm run lint && npm test && npm run build
git push -u origin HEAD
gh pr create --fill
```

Branch names: `feat/`, `fix/`, `docs/`, `chore/`. Commits follow
[Conventional Commits](https://www.conventionalcommits.org/), because the
subject line is the only summary most changes ever get.

## Before you touch the timing

Anything under `src/engine/` or the flash handling in `src/main.ts` changes what
the number on screen means. Two things to hold on to:

- **The zero point is the vsync that presented the flash**, not the moment we
  asked for it. If a change makes the flash paint outside a frame callback, or
  makes the presentation timestamp anything other than the following frame's,
  the measurement is no longer honest. `tests/engine.test.ts` is there to catch
  exactly that.
- **The flash must reach full brightness on its first frame.** A CSS transition
  on the way in ramps the luminance over a hundred milliseconds and turns the
  score into a guess. The `is-on` class carries `transition: none` on purpose.

The pull request template asks for a timing-impact note. "None" is a perfectly
good answer — say it out loud rather than leaving it blank.

## Animation rules

Animate `transform` and `opacity` only. Anything else pulls the main thread into
painting at the moment the game most needs it free to notice a finger landing.

## Testing

Logic lives in `src/game/` with no DOM anywhere near it, so it is testable in
plain Node. The browser half is testable too — `tests/engine.test.ts` drives the
engine against a fake display it cranks by hand, one vsync at a time.

If a change is not covered by either, that is a signal the logic is in the wrong
file rather than a reason to skip the test.

## Decisions

If a change settles something a future reader would otherwise re-open, add a
record to `docs/adr/`. Records are immutable — supersede, do not edit.
