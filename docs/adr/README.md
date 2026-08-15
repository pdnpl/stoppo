# Architecture decision records

Every decision that would be expensive to reverse, or that a future reader would
otherwise re-litigate, is written down here. The format is
[MADR](https://adr.github.io/madr/)-flavoured: context, the decision, what it
costs us, and what we turned down.

Records are immutable. When a decision changes, add a new record and mark the
old one superseded.

| #                                                         | Decision                                               | Status                                                        |
| --------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| [0001](0001-record-decisions-in-adrs.md)                  | Record architecture decisions in ADRs                  | Accepted                                                      |
| [0002](0002-vanilla-typescript-on-vite.md)                | Vanilla TypeScript on Vite, no UI framework            | Accepted                                                      |
| [0003](0003-assets-only-cloudflare-worker.md)             | Ship as an assets-only Cloudflare Worker               | Accepted                                                      |
| [0004](0004-measure-from-presented-vsync.md)              | Measure from the vsync that presented the flash        | Accepted                                                      |
| [0005](0005-trust-input-event-timestamps.md)              | Trust input event timestamps over handler time         | Accepted                                                      |
| [0006](0006-three-player-chosen-modes.md)                 | Three player-chosen modes: Reflex, Count, Lock         | Accepted                                                      |
| [0007](0007-early-press-burns-the-round.md)               | An early press burns the round                         | Accepted                                                      |
| [0008](0008-neon-void-and-a-flat-flash.md)                | Neon Void, and a deliberately flat flash               | Amended by [0012](0012-flash-a-disc-not-the-screen.md)        |
| [0009](0009-no-backend-local-records.md)                  | No backend; records live in localStorage               | Accepted                                                      |
| [0010](0010-retry-under-the-finger.md)                    | The retry target appears under the finger              | Amended by [0015](0015-retry-follows-the-hand-sideways.md)    |
| [0011](0011-enforced-prs-on-a-public-repo.md)             | Enforced pull requests on a public repository          | Accepted                                                      |
| [0012](0012-flash-a-disc-not-the-screen.md)               | Flash a disc, not the whole screen                     | Accepted                                                      |
| [0013](0013-say-wait-out-loud.md)                         | Say "wait" out loud, never show a clock while counting | Amended by [0020](0020-the-interval-is-a-number-again.md)     |
| [0014](0014-a-meter-because-milliseconds-mean-nothing.md) | A quality meter, because "ms" means nothing            | Amended by [0018](0018-the-record-ring-replaces-the-meter.md) |
| [0015](0015-retry-follows-the-hand-sideways.md)           | The retry control follows the hand sideways only       | Amended by [0019](0019-one-centred-control-band.md)           |
| [0016](0016-polish-and-english.md)                        | Ship in Polish and English                             | Accepted                                                      |
| [0017](0017-the-mode-card-is-the-start-button.md)         | The mode card is the start button                      | Accepted                                                      |
| [0018](0018-the-record-ring-replaces-the-meter.md)        | The record ring replaces the quality meter             | Accepted                                                      |
| [0019](0019-one-centred-control-band.md)                  | One centred control band along the bottom of the stage | Accepted                                                      |
| [0020](0020-the-interval-is-a-number-again.md)            | The interval is a number again, under a clear wait     | Accepted                                                      |
| [0021](0021-seconds-not-milliseconds.md)                  | Say seconds, not milliseconds                          | Accepted                                                      |
