# aprendeInglés

Plataforma de inglés profesional que adapta el contenido al sector laboral de cada persona. Combina un **test de nivelación adaptativo (CAT)** para ubicar el nivel CEFR, un **motor de repetición espaciada (FSRS)** para fijar vocabulario técnico, y un mapa de progresión gamificado.

La idea de fondo: alguien que trabaja en software no necesita el mismo inglés que alguien de salud. El test detecta nivel *y* sector, y a partir de ahí la ruta de aprendizaje cambia.

> **Demo:** `test@test.com` / `test1234`

---

## Qué tiene

| Módulo | Qué hace |
|---|---|
| **Test de nivelación** | Test adaptativo computarizado: elige cada pregunta según el desempeño acumulado y corta cuando la estimación se estabiliza (8–14 preguntas en vez de 40 fijas). Devuelve nivel CEFR A1–C2 + sector. |
| **Repaso SRS** | Tarjetas con [FSRS](https://github.com/open-spaced-repetition/ts-fsrs) — el algoritmo que reemplazó a SM-2 en Anki. Guarda dificultad, estabilidad y fecha de vencimiento por tarjeta; 4 botones de calificación. |
| **Mapa de aprendizaje** | Progresión serpenteante con nodos, checkpoints y bosses. Un módulo se desbloquea cuando está a lo sumo un nivel CEFR por encima del actual. |
| **Lecciones** | Ejercicios de traducción con banco de palabras: se arma la frase arrastrando fichas y se valida contra la respuesta. |
| **Vocabulario** | ABM de tarjetas propias, organizadas en mazos. |
| **Analytics y perfil** | Historial de sesiones, precisión por nivel CEFR, XP, rachas y logros. |

Gamificación: XP por acción (lección 50, repaso 10, racha 25, checkpoint 75, boss 200), niveles cada 500 XP y rachas diarias calculadas de forma transaccional.

---

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack)
- **React 19** con React Compiler
- **PostgreSQL** vía **Prisma 7** con driver adapter (`@prisma/adapter-pg`)
- **Autenticación propia**: JWT firmado con `jose` + `bcryptjs`, en cookie `httpOnly`
- **ts-fsrs** para la programación de repasos
- **Framer Motion** para las transiciones del mapa y las tarjetas
- **Zod** para validar toda entrada que llega a un Server Action

Sin librería de estado global ni capa de API: las páginas leen de Postgres como Server Components y las mutaciones van por Server Actions.

---

## Arquitectura

```
src/
├── app/
│   ├── page.tsx              # Landing pública
│   ├── layout.tsx            # Fuentes (next/font) + tema desde cookie
│   ├── globals.css           # Todos los design tokens
│   ├── (auth)/               # Login y registro, sin sidebar
│   └── (app)/                # Grupo protegido: valida sesión y monta el sidebar
│       ├── dashboard/  map/  learn/[moduleId]/
│       ├── review/     vocabulary/
│       └── placement/  profile/  analytics/
├── actions/                  # Server Actions ('use server') — única vía de escritura
├── lib/
│   ├── srs-engine.ts         # Wrapper de FSRS: Card <-> fila de Prisma
│   ├── cat-engine.ts         # Selección de dificultad y estimación de CEFR
│   ├── session-timer.ts      # Hook de cronómetro (mantiene el reloj fuera del render)
│   ├── prisma.ts             # Singleton de PrismaClient con adapter de Postgres
│   └── auth.ts               # Firma/verificación de JWT y manejo de cookie
└── components/               # UI por dominio: learning-map, lesson, review, placement
```

**Decisiones que vale la pena mencionar**

- *Autenticación propia en vez de un proveedor.* El modelo de sesión es una sola cookie `httpOnly` con un JWT de 7 días. `getSession()` se llama en cada Server Component y cada Server Action; el layout del grupo `(app)` corta el acceso antes de renderizar.
- *El estado del test CAT vive en el cliente.* El servidor no guarda sesiones parciales: `PlacementTest.tsx` mantiene el estado y lo envía entero al terminar. Menos superficie de estado, aunque implica que recargar pierde el test en curso.
- *XP y rachas en una transacción.* `completeModule` actualiza progreso, XP y racha en un único `$transaction` para que no queden estados intermedios.
- *El reloj vive fuera del render.* `useSessionTimer` encapsula las lecturas de `Date.now()`, lo que mantiene los componentes puros e idempotentes bajo React Compiler.

---

## Correr en local

Requisitos: Node 20+ y un Postgres.

```bash
git clone https://github.com/rtorales/english-learning-app.git
cd english-learning-app
npm install

cp .env.example .env      # y completá DATABASE_URL y AUTH_SECRET
```

Si no tenés un Postgres a mano:

```bash
docker run -d --name english-app-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=english_app postgres:16
```

Después:

```bash
npm run db:migrate        # aplica las migraciones
npm run seed              # módulos, milestones y usuario demo
npm run seed:vocab        # 75 tarjetas de vocabulario en 5 mazos (opcional)
npm run dev               # http://localhost:3000
```

Entrá con `test@test.com` / `test1234`.

### Scripts

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build de producción y arranque |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Crea y aplica una migración |
| `npm run db:deploy` | Aplica migraciones pendientes (producción) |
| `npm run db:studio` | Prisma Studio |
| `npm run seed` / `npm run seed:vocab` | Datos de prueba |

---

## Deploy

La app corre en cualquier host con soporte de SSR. Las instrucciones para publicarla con **InsForge** (Postgres gestionado + deploy del frontend) están en **[docs/DEPLOY-INSFORGE.md](docs/DEPLOY-INSFORGE.md)**.

Variables de entorno necesarias:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | sí | Cadena de conexión a Postgres |
| `AUTH_SECRET` | sí en producción | Clave para firmar los JWT de sesión, mínimo 32 caracteres. La app no arranca en producción sin ella. |
| `DATABASE_POOL_MAX` | no | Conexiones máximas por instancia (default 5) |

---

## Estado actual

Lo que funciona de punta a punta: registro y login, test de nivelación, mapa, lecciones, repasos SRS con reprogramación real, ABM de vocabulario, XP, rachas y analytics.

Limitaciones conocidas, para ser honesto sobre el alcance:

- **Contenido desparejo.** Hay 13 módulos sembrados: 8 de `tech`, 3 de `business`, 2 de `data`. Los sectores `engineering` y `healthcare` todavía no tienen módulos, así que el mapa queda vacío si se elige uno de esos.
- **Ejercicios de traducción curados para 5 módulos.** El resto usa un set genérico de respaldo (`DEFAULT_EXERCISES`).
- **Sin tests automatizados.** `cat-engine` y `srs-engine` son lógica pura y serían el primer lugar donde agregarlos.
- **El banco de preguntas del CAT es estático** (20 preguntas en `sample-questions.ts`), suficiente para el corte adaptativo pero repetitivo si se rinde el test varias veces.
