import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LessonSession, type TranslateExercise } from '@/components/lesson/LessonSession'

const EXERCISE_BANK: Record<string, TranslateExercise[]> = {
  'mod-tech-a1-1': [
    {
      questionEs: '"La computadora no enciende."',
      answer: ['The', 'computer', "won't", 'start'],
      wordBank: ['The', 'computer', "won't", 'start', 'screen', 'keyboard', 'finish'],
      label: 'Tech Basics · L1',
      tip: '"Computer" es el término estándar. También se dice "PC" para desktop o "laptop" para portátil.',
    },
    {
      questionEs: '"Necesito un teclado nuevo."',
      answer: ['I', 'need', 'a', 'new', 'keyboard'],
      wordBank: ['I', 'need', 'a', 'new', 'keyboard', 'mouse', 'old', 'screen'],
      label: 'Tech Basics · L1',
    },
    {
      questionEs: '"La pantalla es muy grande."',
      answer: ['The', 'screen', 'is', 'very', 'big'],
      wordBank: ['The', 'screen', 'is', 'very', 'big', 'mouse', 'small', 'display'],
      label: 'Tech Basics · L1',
    },
    {
      questionEs: '"El mouse no funciona."',
      answer: ['The', 'mouse', "doesn't", 'work'],
      wordBank: ['The', 'mouse', "doesn't", 'work', 'keyboard', 'screen', 'run', 'start'],
      label: 'Tech Basics · L1',
      tip: '"Mouse" es invariable en inglés — se dice "the mouse" tanto en singular como coloquialmente.',
    },
    {
      questionEs: '"Necesitamos internet rápido."',
      answer: ['We', 'need', 'fast', 'internet'],
      wordBank: ['We', 'need', 'fast', 'internet', 'slow', 'computer', 'connection', 'have'],
      label: 'Tech Basics · L1',
    },
    {
      questionEs: '"Mi computadora es muy lenta."',
      answer: ['My', 'computer', 'is', 'very', 'slow'],
      wordBank: ['My', 'computer', 'is', 'very', 'slow', 'fast', 'screen', 'broken'],
      label: 'Tech Basics · L1',
    },
    {
      questionEs: '"La pantalla está rota."',
      answer: ['The', 'screen', 'is', 'broken'],
      wordBank: ['The', 'screen', 'is', 'broken', 'keyboard', 'fixed', 'display', 'cracked'],
      label: 'Tech Basics · L1',
    },
    {
      questionEs: '"Conectá el cable del teclado."',
      answer: ['Connect', 'the', 'keyboard', 'cable'],
      wordBank: ['Connect', 'the', 'keyboard', 'cable', 'mouse', 'screen', 'plug', 'cord'],
      label: 'Tech Basics · L1',
      tip: '"Connect" y "plug in" son intercambiables al hablar de cables. "Plug in the keyboard cable" también es correcto.',
    },
  ],

  'mod-tech-a2-1': [
    {
      questionEs: '"Esta aplicación funciona en la nube."',
      answer: ['This', 'app', 'runs', 'in', 'the', 'cloud'],
      wordBank: ['This', 'app', 'runs', 'in', 'the', 'cloud', 'server', 'offline'],
      label: 'Software · L2',
      tip: '"Cloud" en inglés técnico se refiere a servicios como AWS, Azure o Google Cloud.',
    },
    {
      questionEs: '"Este programa es fácil de usar."',
      answer: ['This', 'program', 'is', 'easy', 'to', 'use'],
      wordBank: ['This', 'program', 'is', 'easy', 'to', 'use', 'hard', 'run'],
      label: 'Software · L2',
    },
    {
      questionEs: '"El software no tiene errores."',
      answer: ['The', 'software', 'has', 'no', 'bugs'],
      wordBank: ['The', 'software', 'has', 'no', 'bugs', 'errors', 'problems', 'code'],
      label: 'Software · L2',
      tip: '"Bugs" es el término coloquial para errores en el código. "Errors" se usa en contextos más formales.',
    },
    {
      questionEs: '"La interfaz es muy intuitiva."',
      answer: ['The', 'interface', 'is', 'very', 'intuitive'],
      wordBank: ['The', 'interface', 'is', 'very', 'intuitive', 'confusing', 'design', 'screen'],
      label: 'Software · L2',
      tip: '"Interface" (UI) es el conjunto de elementos visuales con los que el usuario interactúa.',
    },
    {
      questionEs: '"Hay que actualizar la aplicación."',
      answer: ['We', 'need', 'to', 'update', 'the', 'app'],
      wordBank: ['We', 'need', 'to', 'update', 'the', 'app', 'install', 'delete', 'version'],
      label: 'Software · L2',
    },
    {
      questionEs: '"El sistema corre en segundo plano."',
      answer: ['The', 'system', 'runs', 'in', 'the', 'background'],
      wordBank: ['The', 'system', 'runs', 'in', 'the', 'background', 'foreground', 'process', 'memory'],
      label: 'Software · L2',
    },
    {
      questionEs: '"El software es de código abierto."',
      answer: ['The', 'software', 'is', 'open', 'source'],
      wordBank: ['The', 'software', 'is', 'open', 'source', 'closed', 'free', 'paid'],
      label: 'Software · L2',
      tip: '"Open source" significa que el código es público y cualquiera puede contribuir. Ejemplos: Linux, VS Code.',
    },
    {
      questionEs: '"¿Cuánta memoria usa este programa?"',
      answer: ['How', 'much', 'memory', 'does', 'this', 'program', 'use'],
      wordBank: ['How', 'much', 'memory', 'does', 'this', 'program', 'use', 'need', 'many', 'require'],
      label: 'Software · L2',
    },
  ],

  'mod-tech-b1-1': [
    {
      questionEs: '"Necesito revisar tus cambios antes del deploy."',
      answer: ['I', 'need', 'to', 'review', 'your', 'changes', 'before', 'the', 'deploy'],
      wordBank: ['I', 'need', 'to', 'review', 'your', 'changes', 'before', 'the', 'deploy', 'push', 'commit'],
      label: 'Code Reviews · L3',
      tip: '"Deploy" funciona como verbo y sustantivo en equipos técnicos: "to deploy the app" / "a clean deploy".',
    },
    {
      questionEs: '"¿Podés agregar más comentarios al código?"',
      answer: ['Can', 'you', 'add', 'more', 'comments', 'to', 'the', 'code'],
      wordBank: ['Can', 'you', 'add', 'more', 'comments', 'to', 'the', 'code', 'tests', 'docs'],
      label: 'Code Reviews · L3',
    },
    {
      questionEs: '"El pull request está listo para revisión."',
      answer: ['The', 'pull', 'request', 'is', 'ready', 'for', 'review'],
      wordBank: ['The', 'pull', 'request', 'is', 'ready', 'for', 'review', 'merge', 'branch'],
      label: 'Code Reviews · L3',
      tip: '"Pull request" (PR) se usa en GitHub/GitLab para proponer cambios. En GitLab también se llama "merge request".',
    },
    {
      questionEs: '"Encontré un bug en tu rama."',
      answer: ['I', 'found', 'a', 'bug', 'in', 'your', 'branch'],
      wordBank: ['I', 'found', 'a', 'bug', 'in', 'your', 'branch', 'commit', 'fix', 'error'],
      label: 'Code Reviews · L3',
    },
    {
      questionEs: '"Esta función es demasiado larga."',
      answer: ['This', 'function', 'is', 'too', 'long'],
      wordBank: ['This', 'function', 'is', 'too', 'long', 'short', 'complex', 'method', 'simple'],
      label: 'Code Reviews · L3',
      tip: 'En code reviews, "too long" suele ir acompañado de "consider splitting this into smaller functions".',
    },
    {
      questionEs: '"Necesitamos escribir pruebas unitarias."',
      answer: ['We', 'need', 'to', 'write', 'unit', 'tests'],
      wordBank: ['We', 'need', 'to', 'write', 'unit', 'tests', 'integration', 'add', 'run', 'fix'],
      label: 'Code Reviews · L3',
    },
    {
      questionEs: '"¿Podés resolver este conflicto de merge?"',
      answer: ['Can', 'you', 'resolve', 'this', 'merge', 'conflict'],
      wordBank: ['Can', 'you', 'resolve', 'this', 'merge', 'conflict', 'fix', 'branch', 'push', 'rebase'],
      label: 'Code Reviews · L3',
      tip: '"Merge conflict" ocurre cuando dos ramas modificaron el mismo bloque de código. Se resuelve editando el archivo manualmente.',
    },
    {
      questionEs: '"El código está bien documentado."',
      answer: ['The', 'code', 'is', 'well', 'documented'],
      wordBank: ['The', 'code', 'is', 'well', 'documented', 'tested', 'clean', 'readable', 'complex'],
      label: 'Code Reviews · L3',
    },
  ],

  'mod-tech-b1-cp': [
    {
      questionEs: '"Logramos completar el sprint sin errores críticos."',
      answer: ['We', 'managed', 'to', 'complete', 'the', 'sprint', 'without', 'critical', 'bugs'],
      wordBank: ['We', 'managed', 'to', 'complete', 'the', 'sprint', 'without', 'critical', 'bugs', 'failed', 'issues'],
      label: 'Checkpoint · B1',
      tip: '"Critical bugs" son errores que bloquean funcionalidad esencial. "Minor bugs" son detalles menores.',
    },
    {
      questionEs: '"El equipo superó los objetivos del sprint."',
      answer: ['The', 'team', 'exceeded', 'the', 'sprint', 'goals'],
      wordBank: ['The', 'team', 'exceeded', 'the', 'sprint', 'goals', 'missed', 'met', 'objectives', 'targets'],
      label: 'Checkpoint · B1',
    },
    {
      questionEs: '"Necesitamos hacer una retrospectiva."',
      answer: ['We', 'need', 'to', 'have', 'a', 'retrospective'],
      wordBank: ['We', 'need', 'to', 'have', 'a', 'retrospective', 'run', 'meeting', 'standup', 'review'],
      label: 'Checkpoint · B1',
    },
    {
      questionEs: '"¿Cuándo es la próxima reunión de equipo?"',
      answer: ['When', 'is', 'the', 'next', 'team', 'meeting'],
      wordBank: ['When', 'is', 'the', 'next', 'team', 'meeting', 'standup', 'sprint', 'call', 'last'],
      label: 'Checkpoint · B1',
    },
    {
      questionEs: '"Vamos a hacer pair programming hoy."',
      answer: ['We', 'are', 'going', 'to', 'do', 'pair', 'programming', 'today'],
      wordBank: ['We', 'are', 'going', 'to', 'do', 'pair', 'programming', 'today', 'mob', 'solo', 'tomorrow'],
      label: 'Checkpoint · B1',
      tip: '"Pair programming" es cuando dos personas programan juntas en una sola máquina. "Mob programming" es cuando lo hace todo el equipo.',
    },
    {
      questionEs: '"La release está programada para el viernes."',
      answer: ['The', 'release', 'is', 'scheduled', 'for', 'Friday'],
      wordBank: ['The', 'release', 'is', 'scheduled', 'for', 'Friday', 'Monday', 'planned', 'deploy', 'delayed'],
      label: 'Checkpoint · B1',
    },
    {
      questionEs: '"¿Quién es el owner de esta tarea?"',
      answer: ['Who', 'is', 'the', 'owner', 'of', 'this', 'task'],
      wordBank: ['Who', 'is', 'the', 'owner', 'of', 'this', 'task', 'ticket', 'story', 'responsible'],
      label: 'Checkpoint · B1',
    },
    {
      questionEs: '"Cerramos diez tickets este sprint."',
      answer: ['We', 'closed', 'ten', 'tickets', 'this', 'sprint'],
      wordBank: ['We', 'closed', 'ten', 'tickets', 'this', 'sprint', 'opened', 'five', 'issues', 'last'],
      label: 'Checkpoint · B1',
      tip: '"Ticket" y "issue" se usan indistintamente para tareas en Jira, Linear o GitHub Issues.',
    },
  ],

  'mod-tech-b2-1': [
    {
      questionEs: '"Vamos a hacer la retrospectiva después del sprint."',
      answer: ['We', 'are', 'going', 'to', 'have', 'the', 'retrospective', 'after', 'the', 'sprint'],
      wordBank: ['We', 'are', 'going', 'to', 'have', 'the', 'retrospective', 'after', 'the', 'sprint', 'review', 'before'],
      label: 'Agile · L5',
      tip: '"Retrospective" o "retro" es la reunión Scrum donde el equipo reflexiona sobre qué mejorar.',
    },
    {
      questionEs: '"El backlog tiene muchas tareas pendientes."',
      answer: ['The', 'backlog', 'has', 'many', 'pending', 'tasks'],
      wordBank: ['The', 'backlog', 'has', 'many', 'pending', 'tasks', 'few', 'completed', 'tickets'],
      label: 'Agile · L5',
    },
    {
      questionEs: '"La velocidad del equipo mejoró este sprint."',
      answer: ['The', "team's", 'velocity', 'improved', 'this', 'sprint'],
      wordBank: ['The', "team's", 'velocity', 'improved', 'this', 'sprint', 'dropped', 'last', 'performance'],
      label: 'Agile · L5',
      tip: '"Velocity" en Agile mide cuánto trabajo completó el equipo en un sprint, normalmente en story points.',
    },
    {
      questionEs: '"Tenemos el standup diario a las nueve."',
      answer: ['We', 'have', 'the', 'daily', 'standup', 'at', 'nine'],
      wordBank: ['We', 'have', 'the', 'daily', 'standup', 'at', 'nine', 'weekly', 'sync', 'ten'],
      label: 'Agile · L5',
      tip: '"Standup" o "daily" es la reunión breve de 15 minutos donde cada uno comparte progreso, bloqueos y plan del día.',
    },
    {
      questionEs: '"Necesitamos priorizar el backlog esta semana."',
      answer: ['We', 'need', 'to', 'prioritize', 'the', 'backlog', 'this', 'week'],
      wordBank: ['We', 'need', 'to', 'prioritize', 'the', 'backlog', 'this', 'week', 'refine', 'groom', 'next'],
      label: 'Agile · L5',
    },
    {
      questionEs: '"El sprint termina el próximo viernes."',
      answer: ['The', 'sprint', 'ends', 'next', 'Friday'],
      wordBank: ['The', 'sprint', 'ends', 'next', 'Friday', 'starts', 'Monday', 'last', 'release', 'demo'],
      label: 'Agile · L5',
    },
    {
      questionEs: '"¿Cuántos puntos tiene esta historia?"',
      answer: ['How', 'many', 'points', 'does', 'this', 'story', 'have'],
      wordBank: ['How', 'many', 'points', 'does', 'this', 'story', 'have', 'task', 'need', 'much'],
      label: 'Agile · L5',
      tip: '"Story points" son una unidad relativa de esfuerzo en Scrum. Equipos usan Fibonacci: 1, 2, 3, 5, 8, 13…',
    },
    {
      questionEs: '"El definition of done define cuándo algo está terminado."',
      answer: ['The', 'definition', 'of', 'done', 'defines', 'when', 'something', 'is', 'finished'],
      wordBank: ['The', 'definition', 'of', 'done', 'defines', 'when', 'something', 'is', 'finished', 'ready', 'complete'],
      label: 'Agile · L5',
      tip: '"Definition of Done" (DoD) es el conjunto de criterios acordados que una tarea debe cumplir para considerarse completa.',
    },
  ],
}

const DEFAULT_EXERCISES: TranslateExercise[] = [
  {
    questionEs: '"Tenemos una reunión de equipo hoy."',
    answer: ['We', 'have', 'a', 'team', 'meeting', 'today'],
    wordBank: ['We', 'have', 'a', 'team', 'meeting', 'today', 'call', 'sprint', 'tomorrow'],
    label: 'General · Ejercicio',
    tip: '"Meeting" es el término más común. "Call" suele referirse a videollamadas o llamadas telefónicas.',
  },
  {
    questionEs: '"El proyecto tiene un plazo ajustado."',
    answer: ['The', 'project', 'has', 'a', 'tight', 'deadline'],
    wordBank: ['The', 'project', 'has', 'a', 'tight', 'deadline', 'long', 'date', 'schedule'],
    label: 'General · Ejercicio',
  },
  {
    questionEs: '"Necesitamos mejorar la documentación."',
    answer: ['We', 'need', 'to', 'improve', 'the', 'documentation'],
    wordBank: ['We', 'need', 'to', 'improve', 'the', 'documentation', 'write', 'update', 'code'],
    label: 'General · Ejercicio',
    tip: '"Documentation" incluye README, wikis, comentarios de código y especificaciones de API.',
  },
  {
    questionEs: '"¿Podés enviarme el informe hoy?"',
    answer: ['Can', 'you', 'send', 'me', 'the', 'report', 'today'],
    wordBank: ['Can', 'you', 'send', 'me', 'the', 'report', 'today', 'tomorrow', 'file', 'share'],
    label: 'General · Ejercicio',
  },
  {
    questionEs: '"El cliente espera una respuesta rápida."',
    answer: ['The', 'client', 'expects', 'a', 'quick', 'response'],
    wordBank: ['The', 'client', 'expects', 'a', 'quick', 'response', 'slow', 'answer', 'customer', 'update'],
    label: 'General · Ejercicio',
  },
  {
    questionEs: '"La presentación es a las dos de la tarde."',
    answer: ['The', 'presentation', 'is', 'at', 'two', 'PM'],
    wordBank: ['The', 'presentation', 'is', 'at', 'two', 'PM', 'AM', 'demo', 'three', 'meeting'],
    label: 'General · Ejercicio',
  },
  {
    questionEs: '"Hay que revisar el presupuesto del proyecto."',
    answer: ['We', 'need', 'to', 'review', 'the', 'project', 'budget'],
    wordBank: ['We', 'need', 'to', 'review', 'the', 'project', 'budget', 'cost', 'plan', 'scope'],
    label: 'General · Ejercicio',
  },
  {
    questionEs: '"¿Cuándo termina el proyecto?"',
    answer: ['When', 'does', 'the', 'project', 'end'],
    wordBank: ['When', 'does', 'the', 'project', 'end', 'start', 'finish', 'deadline', 'begin'],
    label: 'General · Ejercicio',
  },
]

export default async function LessonPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const [module, user] = await Promise.all([
    prisma.learningModule.findUnique({ where: { id: moduleId } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { streakDays: true, xp: true } }),
  ])

  if (!module) notFound()
  if (!user) redirect('/login')

  const exercises = EXERCISE_BANK[moduleId] ?? DEFAULT_EXERCISES

  return (
    <LessonSession
      moduleId={moduleId}
      moduleTitle={module.title}
      exercises={exercises}
      xpReward={module.xpReward}
      streakDays={user.streakDays}
    />
  )
}
