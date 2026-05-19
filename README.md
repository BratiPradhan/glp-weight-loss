# GLP-1 Eligibility Screening

A 15-screen conditional eligibility form for GLP-1 weight-loss medication screening.

## Stack

- Next.js 15 (App Router), React 19, TypeScript 5
- NestJS 11, Prisma 6, PostgreSQL 15
- Vitest 4, Playwright
- pnpm workspaces, Docker Compose

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:up
# (more steps coming as phases land)
```

## Architecture

_TBD — coming in Phase 1_

## Running Tests

_TBD_

## Project Structure

apps/
web/ Next.js frontend
api/ NestJS backend
packages/
shared/ Form schema, evaluator, validation (framework-free)
