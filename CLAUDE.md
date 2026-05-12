# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check without emitting

# Database
npx prisma generate                  # Regenerate client after schema changes
npx prisma migrate dev --name <name> # Create and apply a migration
npx prisma studio                    # Visual DB browser
```

Before running for the first time, fill in `.env` (template already exists) and run `npx prisma migrate dev`.

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
│   ├── prisma.ts              # Singleton PrismaClient with PrismaPg adapter
│   └── supabase/{client,server}.ts  # Browser vs SSR Supabase clients
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

The `PrismaClient` constructor **requires** a driver adapter (Prisma v7 breaking change):
```ts
import { PrismaPg } from '@prisma/adapter-pg'
new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
```

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

1. **Auth guard**: `src/app/(app)/layout.tsx` — calls `supabase.auth.getUser()`, redirects to `/login` if null.
2. **User record**: Supabase Auth UID stored as `User.supabaseId`. All Prisma queries resolve the internal `User.id` from `supabaseId` first.
3. **FSRS cycle**: `SRSItem` rows store the full FSRS state (difficulty D, stability S, due date). `prismaItemToCard()` reconstructs the `ts-fsrs` `Card` object; after `f.next(card, now, grade)` the result is written back via Server Action.
4. **CAT test**: stateless on the server — `CATSession` lives in client component state, submitted in full via `submitPlacementTest`. The `sample-questions.ts` bank is the only question source for now.
5. **XP/streaks**: `completeModule` uses a DB transaction to atomically update `UserProgress` + `User.xp` + `User.streakDays`.

## Key types

`SRSRating` = `1 | 2 | 3 | 4` (Again / Hard / Good / Easy) — maps directly to `ts-fsrs` `Grade`.  
`CEFRLevel` = `'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'` — Prisma enum, ordering via `CEFR_ORDER` in `types/index.ts`.  
`ProfessionalSector` = `'tech' | 'business' | 'data' | 'engineering' | 'healthcare'`.

## Gamification constants

Defined in `types/index.ts` as `XP_PER_ACTION`: lesson=50, srsReview=10, streak=25, milestone=100, checkpoint=75, boss=200.  
Level threshold: 500 XP per level (used in `XPBar.tsx`).  
Map unlock rule: a module unlocks when `CEFR_ORDER[module.cefrLevel] <= CEFR_ORDER[user.cefrLevel] + 1`.
