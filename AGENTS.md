# AGENTS.md - AI Coding Assistant Guide

**Updated:** 2026-03-02  
**Stack:** TanStack Start (React SSR) + TanStack Router + SearXNG + SQLite + Drizzle ORM

---

## Core Rules

- Use Bun tooling only (`bun` / `bunx`), never `npm`, `npx`, `yarn`, or `pnpm`.
- Prefer functional patterns:
  - never use classes
  - use named arguments (object params) instead of positional params
  - use manual dependency injection (pass dependencies explicitly)
- Use Context7 whenever library/API documentation is needed.

---

## Commands

```bash
# App lifecycle
bun dev                    # Vite dev server (0.0.0.0)
bun build                  # Production build
bun preview                # Preview production build
bun start                  # Start server.ts

# Testing (Vitest via Bun)
bun test                   # Run all tests
bun test --watch           # Watch mode
bun test search.test.ts    # Run one test file

# Quality
bun typecheck              # TypeScript type check (no emit)
bun check                  # Biome check
bun lint                   # Biome lint
bun format                 # Biome format

# Database (Drizzle)
bun db:generate            # Generate migrations
bun db:migrate             # Apply migrations
bun db:push                # Push schema
bun db:pull                # Pull schema
bun db:studio              # Open Drizzle Studio
bun db:reset               # Reset local database
```

---

## Tech Stack

- Framework: TanStack Start + React 19 + TypeScript
- Routing/data: TanStack Router + TanStack Query
- Styling/UI: Tailwind CSS v4 + Radix-based UI + `class-variance-authority`
- Database: SQLite + Drizzle ORM / Drizzle Kit
- Auth: Better Auth
- Build/dev: Vite (run through Bun scripts)
- Quality tooling: Biome + TypeScript + Vitest + Testing Library

---

## Coding Guidelines

- Keep components and utilities small and composable.
- Prefer pure functions and explicit data flow.
- Inject side-effectful dependencies (DB clients, APIs, config, logger) through parameters/factories.
- Avoid hidden globals for business logic.
- Keep route modules focused on route concerns; extract reusable logic to dedicated modules/hooks.

---

## Notes For AI Agents

- Check existing patterns in nearby files before introducing new abstractions.
- Make minimal, scoped changes unless a refactor is explicitly requested.
- If docs are needed, resolve and fetch them via Context7 before implementation decisions.
