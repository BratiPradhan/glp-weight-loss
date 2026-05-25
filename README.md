# GLP-1 Eligibility Screening

A 15-screen conditional eligibility form for GLP-1 weight-loss medication
screening. Built as a monorepo with NestJS + Next.js + a framework-free
shared package.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5, Zustand,
  TanStack Query, react-hook-form, Zod, Tailwind 4, shadcn/ui (Radix)
- **Backend:** NestJS 11, Prisma 7, PostgreSQL 15
- **Shared:** TypeScript, Zod, AJV
- **Testing:** Vitest (shared, web), Jest (api), Playwright (E2E)
- **CI:** GitHub Actions
- **Tooling:** pnpm workspaces, Docker Compose

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:up                                    # start Postgres
pnpm --filter @glp1/api prisma migrate deploy # run migrations
pnpm --filter @glp1/shared build              # build shared (required once)

# In separate terminals:
pnpm --filter @glp1/shared build:watch        # rebuild shared on change
pnpm --filter @glp1/api dev                   # api on :3001
pnpm --filter @glp1/web dev                   # web on :3000
```

Open http://localhost:3000.

## Running Tests

```bash
# Unit tests (fast, no servers needed)
pnpm --filter @glp1/shared test               # 29 tests, ~92% coverage on evaluator
pnpm --filter @glp1/api test                  # 15 tests with mocked repo

# E2E tests (requires api + web running)
pnpm --filter @glp1/web exec playwright test  # 4 specs

# Coverage report on the evaluator
pnpm --filter @glp1/shared test:coverage
```

## Architecture

Three packages, each with a single responsibility:

- **`packages/shared`** — the form schema, branching engine, eligibility
  evaluator, and Zod validation. Pure functions, no framework dependencies.
  The evaluator is callable from tests without spinning up Next or Nest.
- **`apps/api`** — NestJS server with Controller → Service → Repository →
  Prisma layers. Endpoints orchestrate the engine and persist sessions.
- **`apps/web`** — Next.js App Router. JSON-driven form renderer + Zustand
  for client state + React Query for server state + react-hook-form + Zod
  for per-screen validation.

See [WRITEUP.md](./WRITEUP.md) for design decisions, trade-offs, and
ambiguity resolutions.

## Project Structure

```
apps/
  api/             NestJS backend
  web/             Next.js frontend
packages/
  shared/          form schema, evaluator, validation (framework-free)
.github/workflows/ CI
docker-compose.yml Postgres
```
