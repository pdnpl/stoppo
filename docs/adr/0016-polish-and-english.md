# 16. Ship in Polish and English

- Status: Accepted
- Date: 2026-08-15

## Context

The game was written in English throughout. Its first players are Polish, and
the interface carries more than labels: the wait state has to be unambiguous,
the burnt-round rule has to be understood before it bites, and the grade word is
the part that tells a player whether `311 ms` was any good
([ADR 14](0014-a-meter-because-milliseconds-mean-nothing.md)). None of that
survives being read in a second language under time pressure.

## Decision

Two locales, English and Polish, behind a `Copy` interface in `src/i18n/copy.ts`
that holds **every** string the game says, including the sentences read out to
assistive technology. Strings that carry a value are functions, so word order
stays the translator's decision rather than being assembled from fragments.

The initial locale comes from `navigator.languages`; a choice made in the PL/EN
switch is stored and always beats the browser, because someone who switched
meant it. `document.documentElement.lang` follows.

Mode names are translated too — Refleks, Odliczanie, Trening — rather than kept
as English brand words. A player choosing between three modes is reading, not
recognising a logo.

Repository language is unchanged: code, comments, commits and these records stay
in English.

## Consequences

- A test asserts both dictionaries have identical shape, that nothing is blank,
  and that every value-carrying sentence actually contains its value — so a key
  added in one language and forgotten in the other fails CI rather than shipping
  as an empty line.
- `verdictView` takes the copy as an argument, which keeps it pure and made
  testing both languages trivial.
- Adding a third locale is one object literal and one button.
- Cost: every new string is now two strings, and an English-only contributor
  cannot finish a change alone. Acceptable for a two-language game with one
  maintainer; it would need a real translation workflow at ten.

## Alternatives considered

**A translation library.** `i18next` and friends bring plurals, interpolation
and lazy loading, and would roughly double a 4 kB bundle to solve problems this
game does not have.

**Polish only.** The game is on a public URL with no explanation of itself; the
English fallback costs one object.

**Keys with `{placeholder}` interpolation.** The usual approach, and worse here:
functions give the same result with type checking and no parser.
