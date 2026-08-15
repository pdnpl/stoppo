# 18. The record ring replaces the quality meter

- Status: Accepted
- Date: 2026-08-15
- Amends: [ADR 14](0014-a-meter-because-milliseconds-mean-nothing.md)

## Context

ADR 14 replaced a bare millisecond count with a bar that filled by quality, on a
fixed scale — full at 120ms, empty at 500ms. It was meant to answer "was that
good?" for someone who has never met a millisecond.

It did not. The playtest verdict was blunt: _I do not understand this, let alone
a child._ The reason is that the bar is a scale, and the scale is invisible. A
bar three-quarters full only means something if you know what full means, and
nothing on screen says. The player asked instead for the comparison that
actually matters to them: **was this better or worse than my own record?**

Bar variants were mocked up — two bars side by side, one bar with a record
marker, a signed difference, stars — and then a set of circular ones. The
circular disc-in-ring won on a property none of the bars had: it does not
present a scale at all.

## Decision

**The ring is your record. The disc is this round. Fitting inside means you beat
it.**

- Disc radius is `score / previousBest` of the ring radius, clamped to
  `[0.7, 1.5]` so a wild round stays on screen and the number printed inside
  still fits the disc.
- Inside the ring the disc is cyan and the ring dims to grey — the record has
  been replaced. Outside, the disc is amber and the ring stays cyan — the record
  is still standing.
- The comparison is always against the record **as it stood before this round**.
  Read it after submitting and a new best would be measured against itself, so
  every record would report a tie.
- The first round in a mode has no ring to draw, so it draws none, and says so.
- The score is printed inside the disc; one line underneath says which side of
  the record it landed on and by how much.
- Burnt rounds still get no circle: nothing was measured. The headline grows
  instead, because for those rounds it is the whole message.

## Consequences

- No scale to learn. The question is "did it fit", which anyone who has posted a
  letter can answer.
- The comparison is personal, so it stays meaningful whether the player runs
  180ms or 400ms.
- `recordView` is pure and covers every branch — first round, better, worse,
  tie, clamped extremes, and a nonsense stored record.
- The disc animates its `r` between rounds, which is a compositor-friendly
  change on a settled screen, well away from any measurement.
- Cost: magnitude is coarse. A 5ms improvement is a barely visible change in
  radius. The line underneath carries the exact number, which is the right split
  — the picture answers _which way_, the text answers _by how much_.

## Alternatives considered

**Two bars, yours against the record.** The best of the bar family and still a
length comparison on an implied axis.

**A dial with a needle.** Familiar from cars and readable, but it is the most
elements of any option and needs an absolute range, which is the scale problem
again.

**A ring gauge with a notch at the record.** The bar-with-a-marker idea bent
into a circle, and it inherits exactly the confusion that started this.

**Stars.** Delightful and child-friendly, but it answers "how good" in the
abstract instead of "better than last time", which is what was asked for.
