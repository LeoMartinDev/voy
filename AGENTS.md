# AGENTS.md - AI Coding Assistant Guide

**Updated:** 2026-02-18
**Stack:** TanStack Start (React SSR) + SearXNG + SQLite + Drizzle ORM

---

## COMMANDS

```bash
# Development
bun dev                    # Start dev server on port 3000
bun build                  # Production build
bun preview                # Preview production build

# Testing (Vitest via Bun)
bun test                   # Run all tests (vitest run)
bun vitest run                                                      # Run all tests (explicit)
bun vitest run src/server/application/services/user-settings-service.test.ts  # Run single test file
bun vitest run --testNamePattern="getUserSettings"                  # Run tests matching pattern
bun vitest watch                                                    # Watch mode

# Linting & Formatting (Biome)
bun biome check src/                  # Check for issues
bun biome check --write src/          # Auto-fix safe issues
bun biome format --write src/         # Format code
bun biome check src/ --linter-enabled=false  # Format only, no lint

# Database (Drizzle)
bun db:generate            # Generate migrations from schema changes
bun db:migrate             # Apply pending migrations
bun db:studio              # Open Drizzle Studio (GUI)
bun db:reset               # Reset database (WARNING: destroys data)

# Type checking
bunx tsc --noEmit          # Run TypeScript type check
```

IMPORTANT: never use npm, npx, yarn or pnpm. Always use bun or bunx.

---

## CODE STYLE

### Formatting (Biome enforced)

- **Indentation:** Tabs
- **Quotes:** Double quotes for strings
- **Imports:** Auto-organized on save (Biome `organizeImports: on`)
- **Excluded from linting:** `src/routeTree.gen.ts`, `src/styles.css`

### TypeScript Conventions

```typescript
// Use `import type` for type-only imports
import type { SearchInput } from "@/server/domain/ports/search-engine.port";
import { searchEngine } from "./adapter"; // runtime import

// Path alias: @/ maps to ./src/
import { auth } from "@/server/infrastructure/auth";
import { SearchBar } from "@/client/components/search-bar";

// Strict mode enabled: noImplicitAny, strictNullChecks, etc.
// Avoid: as any, @ts-ignore, @ts-expect-error
```

### Naming Conventions

| Element             | Convention      | Example                            |
| ------------------- | --------------- | ---------------------------------- |
| Components          | PascalCase      | `SearchBar`, `ThemeProvider`       |
| Functions/variables | camelCase       | `getSetupStatus`, `searchQuery`    |
| Constants           | SCREAMING_SNAKE | `MAX_RESULTS`                      |
| Files (components)  | kebab-case      | `search-bar.tsx`                   |
| Files (utilities)   | kebab-case      | `setup.ts`                         |
| Types/interfaces    | PascalCase      | `SearchInput`, `SearchEngine`      |
| Database tables     | snake_case      | `user_settings`, `instance_config` |

### React Patterns

```tsx
// "use client" directive for client components (TanStack Start convention)
"use client";

// Props interface at top of file
interface SearchBarProps {
  variant?: "home" | "compact";
  initialQuery?: string;
}

// Destructure props with defaults
export function SearchBar({
  variant = "home",
  initialQuery = "",
}: SearchBarProps) {
  // Hooks at top
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  // Early returns for guards
  if (!query) return null;

  return (
    // JSX with Tailwind classes
    <div className="flex items-center gap-2">{/* ... */}</div>
  );
}
```

### Error Handling

```typescript
// API routes: Return JSON responses with status codes
if (!session) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  });
}

// Server functions: Throw descriptive errors
if (setupCompleted) {
  throw new Error("Setup already completed");
}

// Use Zod for validation
const searchSchema = z.object({
  query: z.string().min(1),
  category: z.enum(SearchCategory).optional(),
});
```

---

## ARCHITECTURE

The server follows **Clean Architecture** with three explicit layers wired by a DI container.

### Server Code

```
src/server/
├── domain/                 # Core business logic (no external dependencies)
│   ├── ports/              # Interface contracts
│   │   ├── search-engine.port.ts
│   │   ├── ai-summary.port.ts
│   │   ├── cache.port.ts
│   │   ├── instance-config-repository.port.ts
│   │   └── user-settings-repository.port.ts
│   └── value-objects/      # Immutable domain types
│       ├── search.vo.ts
│       └── settings.vo.ts
├── application/            # Use cases and services (orchestrates domain)
│   ├── services/           # Stateful orchestration (cache + repository)
│   │   ├── user-settings-service.ts
│   │   └── instance-config-service.ts
│   └── usecases/           # Business logic entry points
│       ├── search.ts
│       ├── suggest.ts
│       ├── generate-ai-summary.ts
│       ├── get-user-settings.ts
│       ├── save-user-settings.ts
│       ├── get-instance-config.ts
│       └── save-instance-config.ts
├── infrastructure/         # External implementations
│   ├── auth/               # Authentication (better-auth)
│   │   ├── index.ts        # Server-side auth config
│   │   ├── server.ts       # Auth server helpers
│   │   └── client.ts       # Client-side auth client
│   ├── http/searxng/       # SearXNG search adapter
│   ├── ai/                 # AI summary adapter (Mistral)
│   ├── cache/              # In-memory cache adapter
│   ├── persistence/        # Drizzle ORM + SQLite
│   │   ├── drizzle/
│   │   │   ├── connection.ts
│   │   │   └── schema.ts   # DB schema
│   │   └── repositories/   # Drizzle repository implementations
│   ├── functions/          # TanStack Start server functions
│   │   ├── search.ts
│   │   ├── ai-summary.ts
│   │   ├── setup.ts
│   │   ├── user-settings.ts
│   │   └── instance-config.ts
│   └── utils/
├── container.ts            # Dependency injection (wires all layers)
├── env.ts                  # Environment variable validation
└── config.ts               # App configuration
```

### Dependency Injection Container (`container.ts`)

The container is a lazy singleton that wires together all layers:

```typescript
// Access the container in server functions
const container = await getContainer();
const result = await container.usecases.search({ query, category });

// Container shape
interface Container {
  infrastructure: { searchEngine, userSettingsRepository, instanceConfigRepository, ... };
  services:       { userSettings, instanceConfig };
  usecases:       { search, suggest, getUserSettings, saveUserSettings, getInstanceConfig, saveInstanceConfig, generateSummary };
}

// Reset in tests
import { resetContainer } from "@/server/container";
resetContainer();
```

### Client Code

```
src/client/
├── components/         # React components
│   ├── ui/             # shadcn/ui components
│   ├── search-bar.tsx
│   ├── search-logo.tsx
│   ├── login-form.tsx
│   ├── keyboard-hints.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── user-dropdown.tsx
├── hooks/              # React hooks
│   ├── use-search.ts
│   ├── use-ai-summary.ts
│   ├── use-suggestions.ts
│   ├── use-link-target.ts
│   └── use-mobile.ts
└── utils.ts            # Client-side utilities (cn, etc.)
```

### Routes (TanStack Start file-based)

```
src/routes/
├── __root.tsx               # Root layout
├── _authed.tsx              # Auth guard (layout route, no URL segment)
├── _authed/
│   ├── index.tsx            # Protected home page
│   ├── search/
│   │   ├── index.tsx
│   │   └── -components/    # ai-summary, search-filters, results/
│   └── settings/
│       ├── index.tsx
│       ├── appearance.tsx, ai.tsx, search.tsx, server.tsx, privacy.tsx, about.tsx
│       └── -components/    # Per-page settings sections + sidebar
├── api/
│   ├── health.ts
│   ├── search.ts
│   ├── suggest.ts
│   └── auth/$.ts           # better-auth wildcard handler
├── login.tsx
├── opensearch.ts
└── setup/
    ├── setup.tsx
    └── -components/        # admin-step, safe-search-step
```

**Named Arguments Pattern (MANDATORY):**

```typescript
// Port: Use object parameters, not positional
export interface SearchEngine {
  search: (args: SearchInput) => Promise<SearchResult>;
  // NOT: search(query: string, category: string)
}

// Factory: Destructure dependencies
export const makeSearchUsecase =
  ({ searchEngine }: { searchEngine: SearchEngine }) =>
  ({ query, category }: SearchInput) =>
    searchEngine.search({ query, category });
```

---

## ANTI-PATTERNS (NEVER DO)

- Edit `src/routeTree.gen.ts` (auto-generated)
- Style via `src/styles.css` directly (use Tailwind classes)
- Create adapters without implementing the port interface
- Bypass `_authed` for protected pages
- Use positional arguments in server code (always use named objects)
- Suppress types with `as any`, `@ts-ignore`, `@ts-expect-error`
- Empty catch blocks: `catch (e) {}`
- Import infrastructure directly in use cases (go through ports)
- Instantiate dependencies manually — use `getContainer()` instead

---

## KEY FILES

| Purpose              | File                                                      |
| -------------------- | --------------------------------------------------------- |
| Auth config (server) | `src/server/infrastructure/auth/index.ts`                 |
| Auth client          | `src/server/infrastructure/auth/client.ts`                |
| DB schema            | `src/server/infrastructure/persistence/drizzle/schema.ts` |
| DI container         | `src/server/container.ts`                                 |
| Router setup         | `src/router.tsx`                                          |
| Root layout          | `src/routes/__root.tsx`                                   |
| Setup wizard         | `src/server/infrastructure/functions/setup.ts`            |
| Search port          | `src/server/domain/ports/search-engine.port.ts`           |
| Vite config          | `vite.config.ts`                                          |
| Vitest config        | `vitest.config.ts`                                        |
| Lint config          | `biome.json`                                              |
| TS config            | `tsconfig.json`                                           |
| Server entry         | `server.ts`                                               |

---

## NOTES

- **Bun runtime** - Use `bun` not `npm`/`yarn`
- **React 19** with babel-plugin-react-compiler (optimizes re-renders)
- **SQLite** database at `dev.db` in project root
- **Setup wizard** blocks access until admin account created
- **No CI/CD** - Manual deployments
- **Test runner:** Vitest (configured in `vitest.config.ts`), invoked via `bun test`
