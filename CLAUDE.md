# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit

# Database (PostgreSQL via @prisma/adapter-pg)
npm run db:generate  # Regenerate client after schema changes
npm run db:migrate   # Create and apply a migration (dev)
npm run db:deploy    # Apply pending migrations (production — never generates or resets)
npm run db:studio    # Visual DB browser
npm run seed         # Modules, milestones, demo user (test@test.com / test1234)
npm run seed:vocab   # 75 vocabulary cards across 5 decks
```

First run: `cp .env.example .env`, set `DATABASE_URL` to any Postgres, then
`npm run db:migrate && npm run seed`.

Local Postgres if you don't have one:
```bash
docker run -d --name english-app-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=english_app postgres:16
```

Deploy instructions (InsForge / Vercel) live in `docs/DEPLOY-INSFORGE.md`.

## Architecture

```
src/
├── app/
│   ├── page.tsx                   # Public landing page (redirects to /dashboard if session)
│   ├── layout.tsx                 # Root: loads fonts (Inter Tight, Manrope, Fraunces), sets data-theme from 'ai-theme' cookie
│   ├── globals.css                # ALL design tokens (CSS custom props), Tailwind, base reset
│   ├── (auth)/login/              # Public login/register pages (no sidebar)
│   └── (app)/                     # Protected group — layout.tsx checks session, renders AppSidebar + topbar
│       ├── dashboard/             # Hero lesson card + mini-stats + weekly chart + LearningMap
│       ├── map/                   # Full learning map with CEFR section progress
│       ├── learn/[moduleId]/      # Full-screen lesson overlay (translate exercises, calls completeModule)
│       ├── vocabulary/            # User's own SRS cards, grouped by deck (create/delete)
│       ├── analytics/             # StudySession history, accuracy by CEFR level
│       ├── profile/               # Stats page: mini-stats grid, CEFR progress bars, achievements, milestones
│       ├── placement/             # CAT placement test (sector → adaptive questions → CEFR result)
│       └── review/                # SRS flip-card session (FSRS 4-rating buttons)
├── actions/                       # Server Actions ('use server')
│   ├── srs.ts                     # submitSRSReview — schedules next review via FSRS, awards XP
│   ├── placement.ts               # submitPlacementTest — saves result, redirects to /dashboard
│   ├── progress.ts                # completeModule — awards XP, updates streak (DB transaction)
│   ├── vocabulary.ts              # createVocabCard, deleteVocabCard, recordStudySession
│   ├── auth.ts                    # loginAction, logoutAction, registerAction
│   └── theme.ts                   # setThemeAction — writes 'ai-theme' cookie
├── lib/
│   ├── srs-engine.ts              # FSRS wrapper: prismaItemToCard, scheduleReview, getDueSRSItems
│   ├── cat-engine.ts              # CAT logic: session state, selectNextDifficulty, estimateCEFRLevel
│   ├── session-timer.ts           # useSessionTimer — keeps Date.now() out of render (React Compiler purity)
│   ├── prisma.ts                  # Singleton PrismaClient with PrismaPg adapter (PostgreSQL)
│   └── auth.ts                    # JWT session via jose: createSessionToken, getSession, set/clearSessionCookie
├── components/
│   ├── AppSidebar.tsx             # Sidebar: Logo, Nav (7 links), daily goal progress, user row + logout
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

The `PrismaClient` constructor **requires** a driver adapter (Prisma v7 breaking change):
```ts
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
new PrismaClient({ adapter })
```

The datasource **URL no longer belongs in `schema.prisma`** — Prisma 7 rejects it there
(`P1012`). It lives in `prisma.config.ts`, which loads `.env` explicitly via
`process.loadEnvFile()` because Prisma 7 dropped implicit dotenv loading.

Seed scripts run outside Next, so they import the shared client from
`prisma/seed-client.ts` rather than constructing their own.

After any schema change: `npm run db:generate` then `npm run db:migrate`.

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

1. **Auth**: custom JWT via `jose`. `src/lib/auth.ts` signs/verifies a `session` cookie. `getSession()` is called in every Server Component and Server Action. `AUTH_SECRET` is mandatory in production — `resolveSecret()` throws at startup if it is missing, too short, or still the dev placeholder.
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
