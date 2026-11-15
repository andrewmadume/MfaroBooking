# Validation — 13 November 2026

## Branding update — 15 November 2026

- `npm test`: **33 passed, 0 failed**.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**, including the new `/signin` and `/register` routes.
- HTTP smoke checks: sign-in page, create-account page and original logo asset all returned **200**.
- Browser verification: supplied logo renders on both account-entry pages and in the logged-in workspace. Account-entry links successfully complete the local development sign-in flow.
- The image file is copied byte-for-byte, without modification. SHA-256: `fba308a0faf894b83675f730f851332025a756839890d1eddd52623abbbc7a6b`.
- GitHub is the source-code destination requested for this update; a repository upload does not itself deploy the Worker or D1 database.

## Original core-release checks

- `npm test`: **33 tests passed, 0 failed**.
- `npm run typecheck`: **passed**.
- Sites production Worker build: **passed**.
- Local D1 migration: **14 SQL statements applied successfully**.
- Local browser: signed into the development demo, opened the six-workspace selector, created a booking from live availability, and observed the confirmation, deposit amount and private management link.
- Desktop and mobile dashboard layouts inspected. A mobile DOM check reported equal viewport/document widths (375 px), with no whole-page horizontal overflow. Screenshots are supplied alongside the source folder.
- The final automated suite includes complete new-business creation → staff/resource/service setup → online publication → booking → token-authenticated guest rescheduling.

Server tests execute the real API route source against an in-memory SQLite implementation of D1. They do not constitute a production penetration test or distributed load test. Browser coverage is a local smoke check, not exhaustive coverage of all roles and devices. The browser became unavailable after the app runtime restarted, so the final customer booking-page visual check could not be completed.

## Publication state

The Site has been registered privately as `appgprj_6af6eca4af988191b3a18e3c40251738`, but no version has been deployed. Source synchronization failed to connect to `git.chatgpt-team.site:443`. A subsequent request for network access was interrupted. There is **no verified live deployment**.

Resume deployment with the same project ID in `.openai/hosting.json`; do not create another Site. Obtain a fresh source repository credential, run the Sites source-sync/package helper, and deploy the resulting pushed commit and matching archive privately. No credentials are stored in the source package.

For remaining product scope and integration requirements, see README.md.
