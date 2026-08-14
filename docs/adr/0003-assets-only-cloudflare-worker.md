# 3. Ship as an assets-only Cloudflare Worker

- Status: Accepted
- Date: 2026-08-14

## Context

The game must run on Cloudflare Workers. It has no accounts, no leaderboard and
no server-side state of any kind — every byte it needs is static, and every
score it keeps belongs to one browser.

Cloudflare offers several shapes for this: Workers with static assets, Workers
with a script in front of the assets, and Pages.

## Decision

`wrangler.jsonc` declares an `assets` directory and deliberately declares no
`main`. That produces an assets-only Worker: requests are served from
Cloudflare's edge storage without invoking any Worker code at all.

`not_found_handling` is `single-page-application`, so a deep link resolves to
`index.html` rather than a 404.

## Consequences

- Zero request-time compute, which means zero cold starts and no Worker
  invocations to pay for or reason about.
- No place for server-side code to accidentally appear later without an explicit
  decision to add a `main` entry.
- `npm run deploy` is the whole deployment story; CI does the same thing with
  `cloudflare/wrangler-action` once credentials are present.
- Cost: if the game ever wants a server-side anything, this record has to be
  superseded rather than quietly amended.

## Alternatives considered

**Cloudflare Pages.** Equivalent for static output and slightly simpler to point
at a repo, but Workers is where Cloudflare is putting its effort, and the
assets-only Worker keeps the door open to add a script later without moving
platforms.

**A Worker script that serves the assets.** Needed only when you want to rewrite
headers or routes in code. We do not, and a script would add a request-time hop
to every load.
