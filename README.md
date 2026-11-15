# make.fun — Find your next build

A small, framework-free public explorer for make.fun. Discover bounties, inspect rewards and rules, follow results, and explore the builders behind each entry.

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/metawo14/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/metawo14/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Competition: https://make.fun/bounty/makefun-frontend-01

## Run

Requires Node 22.18 or newer. No dependencies and no build step.

```sh
node serve.ts
# Open http://localhost:8080
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Explore

- `#/`: searchable, sortable bounty board, six results per page.
- `#/bounty/{slug}`: challenge, rules, rewards, deadline and leaderboard link.
- `#/bounty/{slug}/leaderboard`: phase and metric controls; explicit held placements.
- `#/profile/{handle}`: public links, competition record, solutions and neighbouring ranks.

## Performance

Native ES modules and system fonts; no framework, remote code, analytics or font downloads. GET requests use a shared in-memory cache, a 30-second freshness window, conditional ETag revalidation and in-flight deduplication. Search, filters, pagination and leaderboard controls update their local content without rebuilding the page shell. All API requests are read-only and omit credentials.

## Accessibility

Semantic landmarks, a skip link, visible keyboard focus, live loading announcements, route focus management and narrow-screen layouts. API text is escaped before display and external profile links allow only HTTP(S). Entry windows follow deadlines, even when the API still reports an open status.

## Build status

The source is implemented, but live browser verification and screenshots are unfinished: this build environment denies socket operations, including localhost. Starter screenshots have been removed. `shots.json` is empty until genuine captures are available; this is not a submission-ready screenshot set. The kit check also requires permission to spawn Git.
