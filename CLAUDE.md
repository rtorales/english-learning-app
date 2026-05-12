# AprenderIngles — Memoria del Agente

## Propósito del Proyecto
Aplicación web de aprendizaje de inglés profesional (ESP — English for Specific Purposes) con evaluación adaptativa (CAT), repetición espaciada (FSRS), gamificación y mapa de aprendizaje visual. Escalable a mobile via Capacitor.

## Stack Tecnológico
| Capa | Tecnología | Notas |
|---|---|---|
| Framework | Next.js 16 (App Router) | src/ directory, TypeScript estricto |
| Estilos | Tailwind CSS v4 + shadcn/ui | Tema slate |
| Animaciones | Framer Motion | Solo en Client Components |
| Base de Datos | PostgreSQL via Supabase | Schema gestionado con Prisma |
| ORM | Prisma (nuevo formato) | prisma.config.ts + schema.prisma |
| Auth | Supabase Auth | SSR con @supabase/ssr |
| Algoritmo SRS | ts-fsrs | Modelo DSR (Dificultad, Estabilidad, Recuperabilidad) |
| Mobile | Capacitor | Wrapping web → iOS/Android |
| AI | Anthropic Claude API | Generación de ejercicios ESP por sector |

## ADVERTENCIAS CRÍTICAS DE NEXT.JS 16

### params es una Promise — SIEMPRE await
```tsx
// CORRECTO
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
// INCORRECTO — rompe en Next.js 16
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params // ERROR
}
```

### fetch NO está cacheado por defecto
```tsx
// Para cachear — usar directiva use cache
async function getData() {
  'use cache'
  return fetch('...').then(r => r.json())
}
// Sin use cache → fetches frescos en cada request
```

### Refresh de router desde Server Actions
```tsx
// CORRECTO — Next.js 16
import { refresh } from 'next/cache'
refresh()
// NO usar router.refresh() en Server Actions
```

### cookies() debe ser awaited
```tsx
const cookieStore = await cookies()
```

## Arquitectura de Directorios
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                        # Rutas protegidas (layout verifica auth)
│   │   ├── layout.tsx                # Middleware de auth
│   │   ├── dashboard/page.tsx        # Mapa de aprendizaje + XP + streaks
│   │   ├── placement/page.tsx        # Test CAT de posicionamiento
│   │   ├── learn/[moduleId]/page.tsx # Módulo activo
│   │   └── review/page.tsx           # Sesión de repaso SRS
│   └── api/
│       ├── srs/route.ts
│       └── placement/route.ts
├── components/
│   ├── ui/                           # shadcn/ui (generados)
│   ├── learning-map/
│   │   ├── LearningMap.tsx           # Client Component con Framer Motion
│   │   ├── MapNode.tsx
│   │   └── FogOverlay.tsx
│   ├── placement/
│   │   ├── PlacementTest.tsx         # Client Component
│   │   └── QuestionCard.tsx
│   ├── review/
│   │   ├── SRSCard.tsx               # Client Component
│   │   └── RatingButtons.tsx
│   └── dashboard/
│       ├── XPBar.tsx
│       ├── StreakCounter.tsx
│       └── MilestoneAlert.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient
│   │   └── server.ts                 # createServerClient (cookies)
│   ├── prisma.ts                     # Singleton PrismaClient
│   ├── srs-engine.ts                 # Motor FSRS con ts-fsrs
│   ├── cat-engine.ts                 # Evaluación Adaptativa
│   └── utils.ts                      # shadcn cn()
├── hooks/
│   ├── use-srs.ts
│   ├── use-placement.ts
│   └── use-progress.ts
├── types/index.ts
└── actions/
    ├── placement.ts                  # 'use server' — procesar test CAT
    ├── srs.ts                        # 'use server' — actualizar SRSItems
    └── progress.ts                   # 'use server' — XP y streaks
```

## Modelo de Datos Prisma
El cliente generado está en `src/generated/prisma` (no en node_modules).
Importar como: `import { PrismaClient } from '@/generated/prisma'`
Usar el singleton de `@/lib/prisma`.

## Algoritmo FSRS — ts-fsrs
- Librería: `ts-fsrs`
- `src/lib/srs-engine.ts` centraliza toda la lógica
- Ratings: Again(1), Hard(2), Good(3), Easy(4)
- Campos en SRSItem: difficulty (D), stability (S), retrievability (R), state, due, lapses, reps
- Retención objetivo: 90% por defecto

## Algoritmo CAT — Test de Posicionamiento
- Implementado en `src/lib/cat-engine.ts`
- Banco de preguntas clasificadas por nivel CEFR (A1→C2) y dificultad 1-10
- Ajusta dificultad dinámicamente: correcta → sube, incorrecta → baja
- Termina tras 20 preguntas o cuando la estimación converge (±0.5 niveles)
- Resultado: nivel CEFR string + sector profesional

## Variables de Entorno (.env)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
```

## Estándares de Código
- Componentes React funcionales, TypeScript estricto, nunca `any`
- Server Actions en `src/actions/` con `'use server'` al tope del archivo
- Validación con `zod` en el servidor antes de cualquier mutación
- Importar Prisma SOLO desde `@/lib/prisma` (singleton)
- Supabase server: `@/lib/supabase/server`; browser: `@/lib/supabase/client`
- Framer Motion: solo en Client Components (`'use client'`)
- No cachear datos de usuario con `use cache` (son dinámicos por sesión)
- Usar `use cache` solo para contenido estático (banco de preguntas, módulos)

## Sectores Profesionales
- `tech` — Ingeniería de Software / IT
- `business` — Gestión y Liderazgo Empresarial
- `data` — Ciencia de Datos / Analytics
- `engineering` — Ingeniería Industrial
- `healthcare` — Ciencias Médicas

## Gamificación
- XP por acción: lección completada (+50), revisión SRS (+10), racha diaria (+25), hito (+100)
- Streaks: calculadas por día UTC, protegidas con "streak freeze" si hay actividad
- Niveles del mapa: Misión → Punto de Control → Jefe (simulación real)
- Fog of war: áreas bloqueadas hasta nivel CEFR requerido
