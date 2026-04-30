# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Opus Vault is an AI-powered D&D campaign lorekeeper for solo DM use. It stores campaign knowledge (characters, factions, locations, events, plotlines, items, notes) and uses Claude as a "Lorekeeper" AI to answer questions and suggest plotlines via RAG.

**Local-only, single campaign, no auth.**

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (also runs TypeScript check)
npm run lint         # ESLint
npm run db:push      # Push schema changes to SQLite (use during dev)
npm run db:generate  # Generate migration files (use for production)
npm run db:studio    # Open Drizzle Studio to inspect database
```

No test framework configured yet.

## Architecture

- **Next.js 16** App Router with React 19 and TypeScript (strict mode)
- **SQLite** via better-sqlite3 with Drizzle ORM. DB file: `opus-vault.db` in project root
- **TailwindCSS v4** with shadcn/ui components (new-york style, CSS variables)
- **React Query v5** for client-side server state
- **Dark mode by default** (`<html className="dark">`)

### Database

Schema lives in `src/lib/db/schema.ts`. Connection in `src/lib/db/index.ts` (WAL mode, foreign keys ON).

**`better-sqlite3` is synchronous** — DB calls do not use `await`. The `db` singleton is server-only; never import it into `"use client"` components. Access it from Server Components, Server Actions, or Route Handlers only.

Type exports live at the bottom of `schema.ts` — use `Character`, `NewCharacter`, etc. as the canonical types throughout the app.

Key patterns:
- UUIDs as text primary keys — callers must generate IDs (`crypto.randomUUID()`) before insert
- Timestamps stored as integers with `{ mode: "timestamp" }`
- Self-referencing FKs need `AnySQLiteColumn` return type annotation to avoid circular TS inference
- Relationship tables use `onDelete: "cascade"`
- Drizzle `relations()` defined alongside tables for query builder support

### Adding a new entity page

For each entity (e.g. `/characters`), the expected structure is:
- `src/app/[entity]/page.tsx` — list page (Server Component)
- `src/app/[entity]/[id]/page.tsx` — detail/edit page
- `src/app/api/[entity]/route.ts` — GET (list) and POST (create)
- `src/app/api/[entity]/[id]/route.ts` — GET, PATCH, DELETE by ID

Client components use React Query to fetch from those Route Handlers. Add the entity to the `navigationItems` array in `src/components/app-sidebar.tsx`.

### Layout

`src/app/layout.tsx` wraps everything in `Providers` (React Query) → `SidebarProvider` → `AppSidebar` + `SidebarInset`. All pages render inside the sidebar layout with a fixed header containing the sidebar toggle.

Navigation defined in `src/components/app-sidebar.tsx` — add new entity types to `navigationItems` there.

### Path aliases

`@/*` maps to `./src/*` (configured in tsconfig).

## Conventions

- **Files**: kebab-case (`app-sidebar.tsx`)
- **Components**: PascalCase, `"use client"` only when needed
- **DB columns**: snake_case, TS fields: camelCase (Drizzle handles mapping)
- **Styling**: use `cn()` from `@/lib/utils` to merge Tailwind classes
- **Icons**: lucide-react

## Environment Variables

`.env.local` (not committed):
```
ANTHROPIC_API_KEY=   # Required for Lorekeeper chat
DATABASE_PATH=       # Optional, defaults to ./opus-vault.db
```

## Implementation Plan

Full plan in `C:\Users\Juan Villegas\.claude\plans\pure-bouncing-island.md` (local to this machine).

- Phase 1: Foundation — COMPLETE
- Phase 2: Knowledge Base CRUD — next
- Phase 3: Markdown Import
- Phase 4: RAG (SQLite FTS5, not embeddings — keeping costs down)
- Phase 5: Lorekeeper Chat
- Phase 6: Plotline Suggestions
- Phase 7: Polish & Visualization
