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
│   ├── page.tsx                   # Public landing page (redirects to /dashboard if session)
│   ├── layout.tsx                 # Root: loads fonts (Inter Tight, Manrope), sets data-theme from 'ai-theme' cookie
│   ├── globals.css                # ALL design tokens (CSS custom props), Tailwind, base reset
│   ├── (auth)/login/              # Public login/register pages (no sidebar)
│   └── (app)/                     # Protected group — layout.tsx checks session, renders AppSidebar + topbar
│       ├── dashboard/             # Hero lesson card + mini-stats + weekly chart + LearningMap
│       ├── learn/[moduleId]/      # Full-screen lesson overlay (translate exercises, calls completeModule)
│       ├── profile/               # Stats page: mini-stats grid, CEFR progress bars, achievements, milestones
│       ├── placement/             # CAT placement test (sector → adaptive questions → CEFR result)
│       └── review/                # SRS flip-card session (FSRS 4-rating buttons)
├── actions/                       # Server Actions ('use server')
│   ├── srs.ts                     # submitSRSReview — schedules next review via FSRS, awards XP
│   ├── placement.ts               # submitPlacementTest — saves result, redirects to /dashboard
│   ├── progress.ts                # completeModule — awards XP, updates streak (DB transaction)
│   ├── auth.ts                    # loginAction, logoutAction, registerAction
│   └── theme.ts                   # setThemeAction — writes 'ai-theme' cookie
├── lib/
│   ├── srs-engine.ts              # FSRS wrapper: prismaItemToCard, scheduleReview, getDueSRSItems
│   ├── cat-engine.ts              # CAT logic: session state, selectNextDifficulty, estimateCEFRLevel
│   ├── prisma.ts                  # Singleton PrismaClient with PrismaLibSql adapter (SQLite)
│   └── auth.ts                    # JWT session via jose: createSessionToken, getSession, set/clearSessionCookie
├── components/
│   ├── AppSidebar.tsx             # Sidebar: Logo, Nav (5 links), daily goal progress, user row + logout
│   ├── ThemeToggle.tsx            # Light/dark toggle, calls setThemeAction
│   ├── learning-map/              # LearningMap.tsx (Framer Motion serpentine), MapNode.tsx
│   ├── lesson/
│   │   └── LessonSession.tsx      # Client: translate exercise state machine (word bank → slots → check)
│   ├── placement/                 # PlacementTest.tsx (client state machine), sample-questions.ts
│   ├── review/                    # SRSReviewSession.tsx (flip card + 4-rating buttons)
│   └── dashboard/                 # XPBar.tsx, StreakCounter.tsx
└── types/index.ts                 # CEFRLevel, SRSRating, MapNode, CATResult, XP_PER_ACTION, CEFR_ORDER
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

**`fetch` is not cached by default.** Use `'use cache'` directive on functions that fetch static content. Never cache per-user data.

**Refresh after Server Action mutations:**
```ts
import { revalidatePath } from 'next/cache'  // not router.refresh()
revalidatePath('/dashboard')
```

## Design system

All CSS custom properties are in `src/app/globals.css`. Theme switching uses `data-theme="dark"` on `<html>` — set by reading the `ai-theme` cookie in `src/app/layout.tsx`. Key tokens:

- `--primary` / `--primary-2` / `--primary-tint` — lavender (#8b6db5 family)
- `--accent` / `--accent-2` / `--accent-tint` — amber (#e8b961 family)
- `--sage` / `--sage-soft` — green (#9bc998 family)
- `--coral` — red-orange for streaks/errors
- `--f-sans` / `--f-body` / `--f-display` / `--f-mono` — font stack vars
- `--sh-1` through `--sh-3`, `--sh-glow` — box shadow scale

Inline styles are used throughout (no Tailwind in page/component logic). `color-mix(in oklab, ...)` is used for tints — requires modern browsers.

## Lesson overlay pattern

`/learn/[moduleId]` sits inside the `(app)` layout (which renders `AppSidebar`), but the lesson page renders a full-screen overlay via `position: fixed; inset: 0; z-index: 100` in `LessonSession.tsx`. This bypasses the sidebar without a separate route group.

Exercise content is defined in a static `EXERCISE_BANK` map in `src/app/(app)/learn/[moduleId]/page.tsx`, keyed by moduleId. Falls back to `DEFAULT_EXERCISES` for modules not in the bank.

## Data flow

1. **Auth**: custom JWT via `jose`. `src/lib/auth.ts` signs/verifies a `session` cookie. `getSession()` is called in every Server Component and Server Action. `src/lib/supabase/` files exist but are unused — auth is entirely JWT-based.
2. **Auth guard**: `src/app/(app)/layout.tsx` calls `getSession()`, redirects to `/login` if null.
3. **User record**: `User.id` is the Prisma primary key (cuid). All queries use `session.userId` directly.
4. **FSRS cycle**: `SRSItem` rows store full FSRS state (D, S, due date). `prismaItemToCard()` reconstructs the `ts-fsrs` `Card`; after `f.next(card, now, grade)` the result is written back via `submitSRSReview`.
5. **CAT test**: stateless on server — `CATSession` lives in `PlacementTest.tsx` client state, submitted in full via `submitPlacementTest`. Question bank is `sample-questions.ts`.
6. **XP/streaks**: `completeModule` uses a DB transaction to atomically update `UserProgress` + `User.xp` + `User.streakDays`. Also called from lesson completion in `LessonSession`.

## Key types

`SRSRating` = `1 | 2 | 3 | 4` (Again / Hard / Good / Easy) — maps directly to `ts-fsrs` `Grade`.  
`CEFRLevel` = `'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'` — Prisma enum, ordering via `CEFR_ORDER`.  
`ProfessionalSector` = `'tech' | 'business' | 'data' | 'engineering' | 'healthcare'`.

## Gamification constants

Defined in `types/index.ts` as `XP_PER_ACTION`: lesson=50, srsReview=10, streak=25, milestone=100, checkpoint=75, boss=200.  
Level threshold: 500 XP per level (used in `XPBar.tsx`).  
Map unlock rule: a module unlocks when `CEFR_ORDER[module.cefrLevel] <= CEFR_ORDER[user.cefrLevel] + 1`.
