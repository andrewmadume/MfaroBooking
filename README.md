# MfaroBooking

<img src="public/brand/mfarobooking-logo.png" alt="MfaroBooking" width="320" />

Every booking. Perfectly managed.

A working first release of the multi-industry booking platform described in MfaroBooking.txt. It includes persistent server-side workflows and six fictional business workspaces. It is a foundation for the full specification, with the outstanding modules listed below.

Source repository: https://github.com/andrewmadume/MfaroBooking

## Branding and account entry

The official supplied logo is included unchanged at `public/brand/mfarobooking-logo.png`. A shared `Brand` component displays it on the sign-in (`/signin`) and create-account (`/register`) pages, loading screens, logged-in sidebar, mobile workspace header, public booking page and guest portal. The image keeps its original aspect ratio and has accessible alternative text. It is also cached as a public static asset.

Unauthenticated workspace visitors see the branded sign-in page. Both account-entry pages use the existing ChatGPT authentication flow. The first successful sign-in creates the workspace account; this release does not add a separate email/password authentication provider.

GitHub hosts the source code. Running the complete application still requires a Worker runtime, D1 database binding and trusted authentication integration as described below; GitHub Pages alone cannot run its server-side booking engine.

## Run locally

Requires Node.js 24 and npm. From this directory:

```powershell
npm ci
npm run build
npm run db:local
npm run dev
```

`db:local` applies the initial migration to the local D1 database. Run it once for a fresh database. Open the Local URL printed by the development server, then click **Sign in with ChatGPT**. The supplied Sites starter simulates sign-in as `seedy@sites.test` on loopback in development only. There is no demo password. Production builds exclude that sign-in simulator.

Select any of the six businesses with the sidebar workspace selector. Local and hosted databases are separate. Hosted demo data is created when the signed-in account first opens the application; the browser test booking is local only.

If package downloads time out on Windows, set `$env:NODE_OPTIONS='--dns-result-order=ipv4first --no-network-family-autoselection'` before `npm ci`.

## First real workspace

1. Go to Settings → Create a business and complete the three-step setup.
2. Add staff and resources, then services with the assigned staff and resource.
3. Review business hours, time zone, currency, deposit, tax and cancellation policies in Settings.
4. Enable **Accept online bookings**, then open the booking page.
5. Choose an available time, enter customer details and confirm. Keep the private management link to view, reschedule or cancel the booking.

The hosted Site starts owner-private. The booking-page journey is implemented, but customers outside the Site's access policy cannot visit it. Opening access for a real customer rollout requires an explicit audience/deployment decision. Do not expose the development server to the internet: production identity depends on Sites' trusted authentication headers.

## Implemented

- React/TypeScript responsive interface, Mfaro palette, collapsible navigation, mobile menu, search, light/dark appearance, modal focus handling and keyboard controls.
- Workspace creation and six independently seeded industries: salon, medical/dental, tutoring, accommodation, vehicle services and consulting.
- ChatGPT sign-in and sign-out, server-enforced owner/manager/receptionist/staff memberships, tenant isolation and branch restrictions on operational data.
- Persistent customer, staff, service and resource creation and editing. Duplicate customer-email detection. New online bookings create or reuse customer profiles.
- Appointment durations and cleanup buffers, assigned staff/resources, capacity-limited sessions, operating hours, minimum notice, advance limits and time-zone-aware availability.
- Exclusive accommodation units, nightly prices, minimum stays, occupancy limits, maintenance status, check-in and check-out statuses. Arrival is inclusive and departure exclusive.
- Atomic reservation creation with an inventory check in the write statement; customer profile, hashed management token, notification previews and audit entry commit in the same D1 transaction.
- Idempotent creation keys, signed sandbox payment webhook events, exact integer money values, payments, deposits, balances and refunds with transactional balance guards.
- Booking tables, day/week/rolling-month/agenda calendar views, status and staff filters, form-based rescheduling, CSV exports, printable schedules and ICS export.
- Customer booking pages, expiring private booking links, self-service rescheduling and cancellation subject to policy, downloadable booking statements.
- Vehicle job-status boards, vehicle intake fields, hotel housekeeping status controls, class/service capacity cards, guardian and meeting-preference fields.
- Workspace reports derived from persisted records with metric definitions in the interface. Currencies are never combined; currency changes are blocked after bookings exist.
- Consent-aware notification previews. Manual due-preview processing and a Worker scheduled handler are included. No simulated message is labelled as delivered.
- PWA manifest and service worker. Only public static identity assets are cached; private pages, records, availability and confirmations always use the network.

## Architecture

The Sites Vinext starter supplies the React/Next.js-compatible application and Cloudflare Worker build. Drizzle defines the SQLite schema and generates migrations. Runtime queries use prepared D1 statements, including conditional writes where SQL-level concurrency control is important. D1 `batch()` provides atomic multi-statement operations.

`businesses` and `members` define tenant ownership and access. `records` holds validated typed business entities. `bookings`, `payments`, `delivery`, `events` and `limits` hold operational records. Every private data-access path scopes by workspace and checks membership. Staff see assigned bookings; restricted managers see their branch. No secret provider keys are sent to the browser.

Appointment instants are UTC epoch milliseconds and are displayed in the business time zone. Availability is generated for the requested local calendar date, including time-zone and daylight-saving offsets. Accommodation uses UTC midnight markers for **date-only nights**, rather than elapsed local-midnight durations, so a DST night does not become a fractional stay. The room calendar should display those markers as dates.

Reservation retries require a UUID key generated with `crypto.randomUUID()`. A management token is derived from that private key and the random booking identifier, allowing a retry to reproduce the confirmation. Only its SHA-256 hash is kept in the token record. Private management URLs use a fragment and send the token in a request header; they expire seven days after the original stay/appointment ends. Idempotency keys are not included in workspace API responses.

## Environment and deployment

Sites provisions the `DB` D1 binding from `.openai/hosting.json` and applies the committed Drizzle migration during publication. No database password or external API key is required for the demo.

Optional runtime secret:

| Name | Purpose |
| --- | --- |
| `SANDBOX_WEBHOOK_SECRET` | HMAC-SHA256 secret for the sandbox-only webhook adapter. Store server-side in Sites environment settings or local `.dev.vars`, never in source. |

Without this secret, `/api/webhook` returns an explicit 503 configuration error. The manual sandbox card flow remains available. Cash and bank-transfer entries are records of external payments; they do not move money.

The sandbox event endpoint is `POST /api/webhook?business=<workspace-id>`. Its body contains `id`, `booking`, integer `amount` in minor units, and `method` (`Sandbox card` or `Refund`). Sign the exact raw JSON body with HMAC-SHA256 over `<timestamp-ms>.<body>`. Send `x-mfaro-signature: <timestamp-ms>.<hex-digest>`. Signatures expire after five minutes; event IDs are deduplicated. This is not a Stripe, PayFast or bank integration.

`lib/integrations.ts` separates signature verification, transactional payment recording and reminder preview processing. The Worker `scheduled()` handler can process reminder previews when a hosting scheduler invokes it. An automatic cron trigger is **not provisioned** by this release; use the Notifications screen for manual processing. Live email/SMS/WhatsApp delivery needs a real adapter, provider credentials, delivery acknowledgements and a configured scheduler.

To build a deployable Worker locally, run `npm run build`. Publication uses the Sites source-sync/package workflow documented by the installed Sites skill; a generic Node server host cannot run this D1-bound build unchanged.

## Validation

```powershell
npm test
npm run typecheck
npm run build
```

The test suite exercises production route handlers against an in-memory SQLite implementation of the D1 API. It covers tenant and branch isolation, role restrictions, public data minimisation, booking creation and replay, competing exclusive requests, group capacity and overlapping sessions, accommodation boundaries, occupancy, maintenance, cancellation, rescheduling, financial balances, refunds, signed event deduplication, notification-preview idempotency, and onboarding through publication and guest rescheduling. Engine tests cover exact money parsing, time zones, daylight saving and policy boundaries.

The concurrency tests interleave requests through the real route handler and SQL predicates; they are not a distributed production load test. Browser verification covered desktop/mobile layouts and creating a booking through the local UI.

## Remaining specification scope

This release does **not** implement the whole source document. Outstanding work includes:

- Dedicated email/password login, email verification and password-reset flows; platform-admin subscriptions/plans and platform configuration. Hosted identity is currently delegated to ChatGPT.
- Full seven-stage onboarding, multi-branch creation/switching, staff shifts, breaks/leave, arbitrary blocked-time intervals, skill matching, add-on combinations and multi-resource services.
- Recurring series, waitlists, walk-in queues, approval workflows, temporary holds and drag-and-drop calendar interaction. The current month view is a rolling 28-day period.
- Rate overrides, room types containing multiple units, extras, child/adult pricing and live channel synchronisation. Unit status is editable; there is no housekeeping task-assignment system.
- Class rosters, attendance and package balances; vehicle quote approvals, detailed repair job cards and collection tracking; consultant retainers and separate restricted clinical/intake or consultation-note workflows.
- CSV import, customer archival/restoration, file uploads, retention/deletion administration and an account-based customer portal listing all reservations. Guests manage one booking per secure link.
- Provider-backed online checkout, actual refunds, discounts, formal numbered tax invoices and PDF receipts. Downloaded statements are plain-text records.
- Live notifications, template editing, provider retry/backoff and a provisioned recurring scheduler. The included delivery adapter is preview-only.
- A resource-row accommodation occupancy grid, complete utilisation/occupancy/ADR reports, separate report end-date/branch controls and two-way calendar synchronisation. ICS is one-way export.
- Broader browser, accessibility, penetration and distributed load testing before a production rollout. No medical-regulatory compliance claim is made.

Use fictional demo data while evaluating. The private initial deployment is suitable for reviewing the implemented workflows and deciding which outstanding modules to develop next.
