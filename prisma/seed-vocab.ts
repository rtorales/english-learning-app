/**
 * Seed vocabulary cards for the test user across 5 decks.
 * Run: npx tsx prisma/seed-vocab.ts
 */
import path from 'path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client'

const dbAbsPath = path.resolve(process.cwd(), 'prisma', 'dev.db').split(path.sep).join('/')
const adapter = new PrismaLibSql({ url: 'file:' + dbAbsPath })
const prisma = new PrismaClient({ adapter })

// ─── Card definitions ───────────────────────────────────────────────────────

const TECH_VOCAB = [
  { front: 'pull request',        back: 'Solicitud para fusionar ramas de código',           context: 'Please open a pull request when your feature is ready for review.' },
  { front: 'merge conflict',      back: 'Conflicto al unir cambios incompatibles',            context: 'We have a merge conflict in the config file — can you fix it?' },
  { front: 'refactor',            back: 'Reestructurar código sin cambiar su comportamiento', context: 'We should refactor this module before adding new features.' },
  { front: 'deployment',          back: 'Publicación de software en un entorno',              context: 'The CI/CD pipeline automates the deployment to production.' },
  { front: 'scalability',         back: 'Capacidad de manejar mayor carga sin degradarse',   context: 'Horizontal scalability lets us add more servers as demand grows.' },
  { front: 'latency',             back: 'Tiempo de espera entre solicitud y respuesta',       context: 'We need to reduce API latency below 200ms for a better UX.' },
  { front: 'middleware',          back: 'Software que conecta componentes o servicios',       context: 'The authentication middleware validates every incoming request.' },
  { front: 'throughput',          back: 'Cantidad de datos procesados por unidad de tiempo',  context: 'High throughput is critical for our real-time streaming service.' },
  { front: 'abstraction',         back: 'Ocultar complejidad detrás de una interfaz simple', context: 'Good abstraction makes the codebase easier to understand.' },
  { front: 'dependency injection',back: 'Patrón para proveer dependencias externamente',      context: 'We use dependency injection to make services easier to test.' },
  { front: 'race condition',      back: 'Error por ejecución concurrente en orden incorrecto',context: 'The race condition only appears under heavy load in production.' },
  { front: 'idempotent',          back: 'Operación cuyo resultado no cambia si se repite',   context: 'DELETE requests should be idempotent — calling it twice is safe.' },
  { front: 'payload',             back: 'Datos enviados en el cuerpo de una solicitud',      context: 'Make sure the request payload doesn\'t exceed 10MB.' },
  { front: 'rate limiting',       back: 'Restricción de la cantidad de solicitudes por tiempo',context: 'Rate limiting protects our API from abuse and DDoS attacks.' },
  { front: 'technical debt',      back: 'Costo futuro de soluciones rápidas pero deficientes',context: 'We\'re spending two sprints paying down technical debt.' },
  { front: 'regression',          back: 'Error que reaparece después de haber sido corregido', context: 'The latest release introduced a regression in the login flow.' },
  { front: 'caching',             back: 'Almacenamiento temporal de datos para acceso rápido',context: 'Caching the database results reduced response time by 80%.' },
  { front: 'webhook',             back: 'Llamada HTTP disparada automáticamente por un evento',context: 'We set up a webhook to notify Slack when a build fails.' },
  { front: 'monorepo',            back: 'Repositorio único para múltiples proyectos o paquetes',context: 'Moving to a monorepo simplified our dependency management.' },
  { front: 'observability',       back: 'Capacidad de entender el estado interno de un sistema',context: 'Good observability means logs, metrics, and traces all in one place.' },
]

const PHRASAL_VERBS = [
  { front: 'roll out',    back: 'Implementar / desplegar gradualmente',           context: 'We\'ll roll out the new feature to 10% of users first.' },
  { front: 'scale up',    back: 'Aumentar la capacidad o tamaño de algo',         context: 'We need to scale up our infrastructure before the launch.' },
  { front: 'fall back',   back: 'Volver a una opción anterior o de respaldo',     context: 'If the primary server fails, we fall back to the secondary one.' },
  { front: 'spin up',     back: 'Iniciar o activar (un servidor, entorno, etc.)', context: 'I\'ll spin up a new Docker container for testing.' },
  { front: 'kick off',    back: 'Iniciar / arrancar (un proyecto, reunión)',       context: 'Let\'s kick off the sprint planning at 9am.' },
  { front: 'wrap up',     back: 'Concluir / terminar algo',                       context: 'Can we wrap up this discussion before the standup ends?' },
  { front: 'dig into',    back: 'Investigar o analizar en profundidad',            context: 'We need to dig into the logs to find the root cause.' },
  { front: 'hand off',    back: 'Transferir responsabilidad a otra persona',      context: 'I\'ll hand off the ticket to the backend team.' },
  { front: 'opt in',      back: 'Elegir participar voluntariamente',               context: 'Users must opt in to receive marketing emails.' },
  { front: 'opt out',     back: 'Elegir no participar / desactivar algo',         context: 'You can opt out of telemetry in the settings menu.' },
  { front: 'set up',      back: 'Configurar / instalar / preparar',               context: 'Let me set up the dev environment before the meeting.' },
  { front: 'break down',  back: 'Descomponer en partes / analizar',               context: 'Let\'s break down this epic into smaller user stories.' },
  { front: 'run into',    back: 'Encontrarse con un problema inesperado',         context: 'We ran into a blocking issue with the third-party API.' },
  { front: 'point out',   back: 'Señalar / indicar algo',                         context: 'The reviewer pointed out a potential security vulnerability.' },
  { front: 'put together',back: 'Armar / crear / preparar algo',                  context: 'Can you put together a summary for the stakeholder meeting?' },
]

const EXPRESIONES = [
  { front: 'to be on the same page',        back: 'Estar de acuerdo / tener el mismo entendimiento', context: 'Before we proceed, let\'s make sure we\'re all on the same page.' },
  { front: 'take it offline',               back: 'Discutir algo fuera de la reunión actual',         context: 'This is getting complex — let\'s take it offline.' },
  { front: 'move the needle',               back: 'Generar un impacto medible / hacer avanzar algo',  context: 'What changes will actually move the needle on user retention?' },
  { front: 'bandwidth',                     back: 'Disponibilidad / capacidad de una persona',        context: 'I don\'t have the bandwidth to take on another project right now.' },
  { front: 'circle back',                   back: 'Volver a tratar un tema más tarde',                context: 'I\'ll circle back with you once I\'ve checked with the team.' },
  { front: 'low-hanging fruit',             back: 'Tarea fácil con buen resultado',                   context: 'Let\'s start with the low-hanging fruit — quick wins first.' },
  { front: 'deep dive',                     back: 'Análisis profundo de un tema',                     context: 'We need to do a deep dive into the performance metrics.' },
  { front: 'heads up',                      back: 'Aviso previo / advertencia informal',              context: 'Just a heads up — the deploy will cause 5 minutes of downtime.' },
  { front: 'to be a bottleneck',            back: 'Ser el cuello de botella / el punto lento',       context: 'The single database server is becoming a bottleneck.' },
  { front: 'going forward',                 back: 'De ahora en adelante / en el futuro',              context: 'Going forward, all PRs need at least two approvals.' },
  { front: 'align on',                      back: 'Ponerse de acuerdo sobre algo',                    context: 'We need to align on the API contract before building.' },
  { front: 'to have a blocker',             back: 'Tener un impedimento que frena el trabajo',       context: 'I have a blocker — the API credentials aren\'t working.' },
  { front: 'at the end of the day',         back: 'En definitiva / lo más importante es...',         context: 'At the end of the day, the user experience is what matters.' },
  { front: 'reach out',                     back: 'Contactar a alguien',                             context: 'Feel free to reach out if you have any questions.' },
  { front: 'leverage',                      back: 'Aprovechar / sacar provecho de algo',             context: 'We can leverage our existing infrastructure for this.' },
]

const BUSINESS_ENGLISH = [
  { front: 'follow up',             back: 'Dar seguimiento a algo pendiente',                context: 'I\'ll follow up with the client after the demo.' },
  { front: 'stakeholder',           back: 'Parte interesada / persona con interés en el proyecto', context: 'We need stakeholder sign-off before moving to production.' },
  { front: 'deliverable',           back: 'Entregable / resultado concreto del proyecto',    context: 'The main deliverable for this sprint is the new dashboard.' },
  { front: 'scope creep',           back: 'Expansión no planificada del alcance del proyecto',context: 'We need to avoid scope creep — stick to what was agreed.' },
  { front: 'actionable',            back: 'Concreto / que se puede actuar sobre ello',       context: 'The feedback should be specific and actionable.' },
  { front: 'ballpark figure',       back: 'Estimación aproximada',                           context: 'Can you give me a ballpark figure for the development cost?' },
  { front: 'bandwidth (capacity)',  back: 'Capacidad disponible del equipo',                 context: 'We don\'t have the bandwidth for that feature this quarter.' },
  { front: 'due diligence',         back: 'Investigación o revisión cuidadosa antes de decidir', context: 'We performed due diligence before selecting the vendor.' },
  { front: 'KPI',                   back: 'Indicador clave de rendimiento (Key Performance Indicator)', context: 'Our main KPI for this quarter is reducing churn rate.' },
  { front: 'ROI',                   back: 'Retorno sobre la inversión (Return on Investment)', context: 'The project showed a positive ROI within six months.' },
  { front: 'milestone',             back: 'Hito / punto clave del proyecto',                 context: 'Launching the beta version is our next major milestone.' },
  { front: 'sign off',              back: 'Dar la aprobación final a algo',                  context: 'The product manager needs to sign off on the design.' },
  { front: 'pain point',            back: 'Problema recurrente o frustración del usuario',   context: 'Slow load times are a major pain point for our users.' },
  { front: 'to be proactive',       back: 'Anticiparse a los problemas sin esperar instrucciones', context: 'Be proactive — don\'t wait for bugs to reach production.' },
  { front: 'onboard',               back: 'Incorporar / integrar a alguien nuevo',           context: 'It takes two weeks to onboard a new developer on this project.' },
]

const MIS_PALABRAS = [
  { front: 'acknowledge',   back: 'Reconocer / confirmar que se recibió algo',     context: 'Please acknowledge receipt of this email.' },
  { front: 'clarify',       back: 'Aclarar / explicar mejor',                      context: 'Could you clarify what you mean by "performance issues"?' },
  { front: 'straightforward',back: 'Sencillo / directo / sin complicaciones',      context: 'The setup is pretty straightforward — just follow the docs.' },
  { front: 'workaround',    back: 'Solución temporal / alternativa al problema',   context: 'We found a workaround while we wait for the official fix.' },
  { front: 'breakdown',     back: 'Desglose / análisis detallado',                 context: 'Can you send me a breakdown of the project costs?' },
  { front: 'brief',         back: 'Resumen breve / sesión informativa / conciso',  context: 'Give me a brief summary of what happened in the meeting.' },
  { front: 'on track',      back: 'En curso / cumpliendo el plan',                 context: 'The project is on track to launch next Friday.' },
  { front: 'trade-off',     back: 'Compensación entre dos opciones / pros y contras', context: 'There\'s a trade-off between speed and code quality.' },
  { front: 'to be swamped', back: 'Estar muy ocupado / desbordado de trabajo',    context: 'I\'m swamped this week — can we meet next Monday instead?' },
  { front: 'gut feeling',   back: 'Intuición / presentimiento',                    context: 'My gut feeling says we\'re underestimating the complexity.' },
]

// ─── SRS state distribution for realistic demo data ─────────────────────────

type CardState = 'New' | 'Learning' | 'Review' | 'Relearning'

interface StateConfig {
  state: CardState
  stability: number
  retrievability: number
  reps: number
  lapses: number
  daysOffset: number // negative = due in the past, positive = due in future
}

const STATE_CONFIGS: StateConfig[] = [
  // Mostly New (just added)
  { state: 'New',        stability: 0,    retrievability: 1.0, reps: 0, lapses: 0, daysOffset: 0 },
  { state: 'New',        stability: 0,    retrievability: 1.0, reps: 0, lapses: 0, daysOffset: 0 },
  // Learning (seen 1-2 times)
  { state: 'Learning',   stability: 0.5,  retrievability: 0.9, reps: 1, lapses: 0, daysOffset: 0 },
  { state: 'Learning',   stability: 1,    retrievability: 0.85,reps: 2, lapses: 1, daysOffset: -1 },
  // Review (stable, scheduled)
  { state: 'Review',     stability: 4,    retrievability: 0.9, reps: 4, lapses: 0, daysOffset: 0 },
  { state: 'Review',     stability: 8,    retrievability: 0.95,reps: 6, lapses: 0, daysOffset: 3 },
  { state: 'Review',     stability: 15,   retrievability: 0.88,reps: 8, lapses: 1, daysOffset: -2 },
  { state: 'Review',     stability: 30,   retrievability: 0.92,reps: 10,lapses: 0, daysOffset: 7 },
  // Relearning (failed review)
  { state: 'Relearning', stability: 1.5,  retrievability: 0.7, reps: 5, lapses: 2, daysOffset: 0 },
  { state: 'Relearning', stability: 2,    retrievability: 0.65,reps: 7, lapses: 3, daysOffset: -1 },
]

function pickState(idx: number): StateConfig {
  return STATE_CONFIGS[idx % STATE_CONFIGS.length]
}

function dueDate(daysOffset: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const email = process.argv[2] ?? 'test@test.com'
  console.log(`🃏 Seeding vocabulary cards for ${email}...\n`)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`❌ No se encontró el usuario "${email}". Verificá que el email sea correcto.`)
    process.exit(1)
  }

  const decks: { name: string; cards: typeof TECH_VOCAB }[] = [
    { name: 'Tech vocab',       cards: TECH_VOCAB },
    { name: 'Phrasal verbs',    cards: PHRASAL_VERBS },
    { name: 'Expresiones',      cards: EXPRESIONES },
    { name: 'Business English', cards: BUSINESS_ENGLISH },
    { name: 'Mis palabras',     cards: MIS_PALABRAS },
  ]

  let total = 0

  for (const deck of decks) {
    let created = 0
    let skipped = 0

    for (let i = 0; i < deck.cards.length; i++) {
      const card = deck.cards[i]
      const sc = pickState(i)
      const due = dueDate(sc.daysOffset)
      const slugId = `vocab-${user.id}-${deck.name.replace(/\s/g, '-')}-${i}`

      const existing = await prisma.sRSItem.findFirst({
        where: { userId: user.id, front: card.front, deckName: deck.name },
      })

      if (existing) { skipped++; continue }

      await prisma.sRSItem.create({
        data: {
          id: slugId,
          userId: user.id,
          front: card.front,
          back: card.back,
          context: card.context,
          deckName: deck.name,
          sector: 'tech',
          state: sc.state,
          stability: sc.stability,
          retrievability: sc.retrievability,
          difficulty: 5.0 + (Math.random() * 2 - 1), // 4.0-6.0
          reps: sc.reps,
          lapses: sc.lapses,
          due,
          lastReviewAt: sc.reps > 0 ? new Date(Date.now() - 86400000 * 2) : null,
          nextReviewAt: sc.daysOffset > 0 ? due : null,
        },
      })
      created++
      total++
    }

    console.log(`  📚 ${deck.name.padEnd(20)} ${created} nuevas  ${skipped > 0 ? `(${skipped} ya existían)` : ''}`)
  }

  // Summary
  const allItems = await prisma.sRSItem.findMany({ where: { userId: user.id } })
  const byState: Record<string, number> = { New: 0, Learning: 0, Review: 0, Relearning: 0 }
  const dueNow = allItems.filter(i => new Date(i.due) <= new Date())
  for (const i of allItems) byState[i.state] = (byState[i.state] ?? 0) + 1

  console.log(`\n✅ ${total} tarjetas creadas exitosamente`)
  console.log(`\n📊 Estado actual del usuario:`)
  console.log(`   Total tarjetas: ${allItems.length}`)
  console.log(`   Para repasar HOY: ${dueNow.length}`)
  console.log(`   ├─ Nuevas:       ${byState.New}`)
  console.log(`   ├─ Aprendiendo:  ${byState.Learning}`)
  console.log(`   ├─ Repaso:       ${byState.Review}`)
  console.log(`   └─ Reforzando:   ${byState.Relearning}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
