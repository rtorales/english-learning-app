# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check without emitting

# Database (SQLite local mode via @libsql/client + @prisma/adapter-libsql)
npx prisma generate                  # Regenerate client after schema changes
npx prisma migrate dev --name <name> # Create and apply a migration
npx tsx prisma/seed.ts               # Seed test data (test@test.com / test1234)
npx prisma studio                    # Visual DB browser
```

Run `npx prisma migrate dev --name init` then `npx tsx prisma/seed.ts` on first run. No `.env` changes needed — SQLite file is at `prisma/dev.db`.

## Architecture

```
src/
├── app/
│   ├── (auth)/login/          # Public auth pages
│   ├── (app)/                 # Protected group — layout.tsx redirects to /login if no session
│   │   ├── dashboard/         # Learning map + XP + streak header
│   │   ├── placement/         # CAT placement test
│   │   └── review/            # FSRS review session
│   └── api/srs/ api/placement/ # Route handlers (scaffolded, not yet implemented)
├── actions/                   # Server Actions ('use server' files)
│   ├── srs.ts                 # submitSRSReview — schedules next review via FSRS
│   ├── placement.ts           # submitPlacementTest — saves result, redirects to /dashboard
│   └── progress.ts            # completeModule — awards XP, updates streak
├── lib/
│   ├── srs-engine.ts          # FSRS wrapper: prismaItemToCard, scheduleReview, getDueSRSItems
│   ├── cat-engine.ts          # CAT logic: session state, difficulty adjustment, CEFR estimation
│   ├── prisma.ts              # Singleton PrismaClient with PrismaLibSql adapter (SQLite)
│   └── auth.ts                # JWT session: createSessionToken, getSession, set/clearSessionCookie
├── components/
│   ├── learning-map/          # LearningMap.tsx (Framer Motion nodes), MapNode.tsx
│   ├── placement/             # PlacementTest.tsx (client state machine), sample-questions.ts
│   ├── review/                # SRSReviewSession.tsx (flip card + 4-rating buttons)
│   └── dashboard/             # XPBar.tsx, StreakCounter.tsx
└── types/index.ts             # Shared types: CEFRLevel, SRSRating, MapNode, CATResult, XP constants
```

## Critical: Prisma v7 import paths

The generated client is in `src/generated/prisma/` (not `node_modules`). There is **no index file** — import from specific files:

```ts
import { PrismaClient, type SRSItem, type LearningModule } from '@/generated/prisma/client'
import type { CEFRLevel, SRSState } from '@/generated/prisma/enums'
```

Never import from `@/generated/prisma` (directory) — it will fail with TS2307.  
Always use the singleton: `import { prisma } from '@/lib/prisma'`

The `PrismaClient` constructor **requires** a driver adapter (Prisma v7 breaking change).  
`PrismaLibSql` from `@prisma/adapter-libsql` is a **factory** — pass a config object, not a pre-created client:
```ts
import { PrismaLibSql } from '@prisma/adapter-libsql'
// CORRECT: pass config — it calls createClient internally
const adapter = new PrismaLibSql({ url: 'file:/absolute/path/to/dev.db' })
// WRONG: do not call createClient yourself and pass the result
```
Always use an **absolute path** for the SQLite file URL — relative paths cause `URL_INVALID` errors.

After any schema change: `npx prisma generate` then `npx prisma migrate dev`.

## Critical: Next.js 16 breaking changes

**`params` is a Promise — always `await` it:**
```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

**`cookies()` must be awaited:**
```ts
const cookieStore = await cookies()
```

**`fetch` is not cached by default.** Use `'use cache'` directive on functions that fetch static content (module definitions, question banks). Never cache per-user data.

**Refresh after Server Action mutations:**
```ts
import { refresh } from 'next/cache'  // not router.refresh()
refresh()
```

## Data flow

1. **Auth**: custom JWT via `jose`. `src/lib/auth.ts` signs/verifies a session cookie. `getSession()` is called in every Server Component and Server Action.
2. **Auth guard**: `src/app/(app)/layout.tsx` — calls `getSession()`, redirects to `/login` if null.
3. **User record**: `User.id` is the Prisma primary key (cuid). All queries use `session.userId` directly — no Supabase.
4. **FSRS cycle**: `SRSItem` rows store the full FSRS state (difficulty D, stability S, due date). `prismaItemToCard()` reconstructs the `ts-fsrs` `Card` object; after `f.next(card, now, grade)` the result is written back via Server Action.
5. **CAT test**: stateless on the server — `CATSession` lives in client component state, submitted in full via `submitPlacementTest`. The `sample-questions.ts` bank is the only question source for now.
6. **XP/streaks**: `completeModule` uses a DB transaction to atomically update `UserProgress` + `User.xp` + `User.streakDays`.

## Key types

`SRSRating` = `1 | 2 | 3 | 4` (Again / Hard / Good / Easy) — maps directly to `ts-fsrs` `Grade`.  
`CEFRLevel` = `'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'` — Prisma enum, ordering via `CEFR_ORDER` in `types/index.ts`.  
`ProfessionalSector` = `'tech' | 'business' | 'data' | 'engineering' | 'healthcare'`.

## Gamification constants

Defined in `types/index.ts` as `XP_PER_ACTION`: lesson=50, srsReview=10, streak=25, milestone=100, checkpoint=75, boss=200.  
Level threshold: 500 XP per level (used in `XPBar.tsx`).  
Map unlock rule: a module unlocks when `CEFR_ORDER[module.cefrLevel] <= CEFR_ORDER[user.cefrLevel] + 1`.
