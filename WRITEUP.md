# Write-Up

## Trade-offs

1. **Built shared package over source-direct workspace consumption.**
   Initially tried having `apps/api` and `apps/web` import shared's TypeScript
   source directly. Node 24's strict ESM resolution at the Nest boundary made
   this brittle. Reverted to publishing shared to `dist/` via `tsc -p
tsconfig.build.json`. Trade-off: extra build step (mitigated by
   `build:watch` in dev). Win: clean module boundary, no per-consumer
   transpilation surprises.

2. **Jest in api, Vitest elsewhere.** Nest defaults to Jest. Switching it
   to Vitest is possible but its own can of worms with decorator metadata.
   Kept Jest in api (with ESM mode) and Vitest in shared + web. Pragmatic
   over uniform.

3. **Server is source of truth, localStorage only stores sessionId.**
   Considered persisting answers locally for offline resume. Chose to keep
   localStorage minimal (just `sessionId`) and trust the server response
   for hydration. Simpler model, no sync conflicts, but requires the api
   to be reachable on refresh.

## AI tool usage

Used Claude as a design and pair partner across all four phases. Specifically:

- **Architecture design** — talked through state management, validation
  strategy, and the engine/evaluator separation before writing any code.
  This conversation surfaced the spec ambiguities listed below.

## Build approach

Built inside-out across four phases:

**Phase 1 — Shared package.** Form schema as typed JSON with branch rules modeled as data, plus pure `getNextScreen` (engine) and `evaluateEligibility` (evaluator) functions. Deliberately separate: engine handles navigation, evaluator handles final outcome. Both framework-free, both 100% callable from tests. 29 Vitest tests, ~92% branch coverage.

**Phase 2 — NestJS API.** Three-layer architecture (Controller → Service → Repository → Prisma) so the repo is mockable without deep-mocking Prisma. Single `ZodValidationPipe` reuses schemas from shared. Service traverses past computed screens (BMI) server-side so the frontend only sees user-input screens. 15 Jest tests with mocked repository.

**Phase 3 — Next.js 15 frontend.** Single `ScreenRenderer` driven by JSON, not 15 hand-written screens. State split across four surfaces: react-hook-form (active screen), Zustand with `persist` (cross-screen, sessionId-only to localStorage), TanStack Query (server cache), Postgres (truth). Refresh restoration via a `<StoreHydrator>` that manually triggers `persist.rehydrate()` before children render — avoids a race against the auto-start mutation. Accessibility wired throughout (labels, aria-describedby, role="alert", data-testid).

**Phase 4 — Tests + CI.** Four Playwright specs (happy path, mid-flow refresh, terminal state, BP conflict edge case). GitHub Actions runs Vitest + Jest + Playwright on every PR with Postgres as a service container.
