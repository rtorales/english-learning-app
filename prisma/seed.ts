import bcrypt from 'bcryptjs'
import { prisma } from './seed-client'

async function main() {
  console.log('🌱 Seeding database...')

  // Milestones
  const milestones = [
    { key: 'first_lesson', title: 'Primera lección', description: 'Completa tu primera lección', xpReward: 100 },
    { key: 'first_review', title: 'Primera revisión', description: 'Completa tu primera sesión SRS', xpReward: 50 },
    { key: 'streak_7', title: 'Semana perfecta', description: '7 días seguidos de estudio', xpReward: 200 },
    { key: 'level_b1', title: 'Nivel B1 alcanzado', description: 'Supera el nivel B1 en tu sector', xpReward: 300 },
    { key: 'vocab_100', title: '100 palabras dominadas', description: 'Domina 100 términos técnicos', xpReward: 200 },
  ]
  for (const m of milestones) {
    await prisma.milestone.upsert({ where: { key: m.key }, update: {}, create: m })
  }

  // Learning modules — Tech sector
  const techModules = await Promise.all([
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-a1-1' },
      update: {},
      create: {
        id: 'mod-tech-a1-1',
        title: 'Tech Basics: Hello World',
        description: 'Vocabulario esencial de tecnología para principiantes',
        cefrLevel: 'A1',
        sector: 'tech',
        exerciseType: 'vocabulary',
        orderIndex: 1,
        xpReward: 50,
        content: JSON.stringify({ type: 'vocabulary', words: ['computer', 'keyboard', 'screen', 'mouse', 'internet'] }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-a2-1' },
      update: {},
      create: {
        id: 'mod-tech-a2-1',
        title: 'Describing Software',
        description: 'Cómo describir aplicaciones y software',
        cefrLevel: 'A2',
        sector: 'tech',
        exerciseType: 'grammar',
        orderIndex: 2,
        xpReward: 50,
        content: JSON.stringify({ type: 'grammar', focus: 'present_simple_descriptions' }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-b1-1' },
      update: {},
      create: {
        id: 'mod-tech-b1-1',
        title: 'Code Review Communication',
        description: 'Expresiones para code reviews y pull requests',
        cefrLevel: 'B1',
        sector: 'tech',
        exerciseType: 'writing',
        orderIndex: 3,
        xpReward: 50,
        content: JSON.stringify({ type: 'writing', context: 'code_review' }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-b1-cp' },
      update: {},
      create: {
        id: 'mod-tech-b1-cp',
        title: 'Checkpoint: A2 → B1',
        description: 'Evaluación de competencias básicas en inglés técnico',
        cefrLevel: 'B1',
        sector: 'tech',
        exerciseType: 'reading',
        orderIndex: 4,
        xpReward: 75,
        isCheckpoint: true,
        content: JSON.stringify({ type: 'checkpoint', level: 'B1' }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-b2-1' },
      update: {},
      create: {
        id: 'mod-tech-b2-1',
        title: 'Agile & Scrum Vocabulary',
        description: 'Terminología de metodologías ágiles en inglés',
        cefrLevel: 'B2',
        sector: 'tech',
        exerciseType: 'vocabulary',
        orderIndex: 5,
        xpReward: 50,
        content: JSON.stringify({ type: 'vocabulary', words: ['sprint', 'backlog', 'retrospective', 'standup', 'velocity'] }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-b2-2' },
      update: {},
      create: {
        id: 'mod-tech-b2-2',
        title: 'Technical Presentations',
        description: 'Cómo presentar soluciones técnicas en inglés',
        cefrLevel: 'B2',
        sector: 'tech',
        exerciseType: 'speaking',
        orderIndex: 6,
        xpReward: 50,
        content: JSON.stringify({ type: 'speaking', context: 'technical_demo' }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-c1-1' },
      update: {},
      create: {
        id: 'mod-tech-c1-1',
        title: 'Architecture Decision Records',
        description: 'Redactar ADRs y documentación técnica avanzada',
        cefrLevel: 'C1',
        sector: 'tech',
        exerciseType: 'writing',
        orderIndex: 7,
        xpReward: 50,
        content: JSON.stringify({ type: 'writing', context: 'adr_documentation' }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-tech-c1-boss' },
      update: {},
      create: {
        id: 'mod-tech-c1-boss',
        title: '👑 Tech Lead Simulation',
        description: 'Simulación de reunión técnica con stakeholders internacionales',
        cefrLevel: 'C1',
        sector: 'tech',
        exerciseType: 'speaking',
        orderIndex: 8,
        xpReward: 200,
        isBoss: true,
        content: JSON.stringify({ type: 'boss', context: 'stakeholder_meeting' }),
      },
    }),
  ])

  // Business sector modules
  await Promise.all([
    prisma.learningModule.upsert({
      where: { id: 'mod-biz-a1-1' },
      update: {},
      create: {
        id: 'mod-biz-a1-1',
        title: 'Business Greetings',
        description: 'Saludos y presentaciones profesionales',
        cefrLevel: 'A1',
        sector: 'business',
        exerciseType: 'vocabulary',
        orderIndex: 1,
        xpReward: 50,
        content: JSON.stringify({ type: 'vocabulary', words: ['meeting', 'colleague', 'manager', 'report', 'deadline'] }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-biz-b1-1' },
      update: {},
      create: {
        id: 'mod-biz-b1-1',
        title: 'Business Emails',
        description: 'Redactar emails formales y seguimientos',
        cefrLevel: 'B1',
        sector: 'business',
        exerciseType: 'writing',
        orderIndex: 2,
        xpReward: 50,
        content: JSON.stringify({ type: 'writing', context: 'professional_email' }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-biz-b2-1' },
      update: {},
      create: {
        id: 'mod-biz-b2-1',
        title: 'Negotiation Language',
        description: 'Técnicas de negociación en inglés empresarial',
        cefrLevel: 'B2',
        sector: 'business',
        exerciseType: 'speaking',
        orderIndex: 3,
        xpReward: 50,
        content: JSON.stringify({ type: 'speaking', context: 'negotiation' }),
      },
    }),
  ])

  // Data sector modules
  await Promise.all([
    prisma.learningModule.upsert({
      where: { id: 'mod-data-a2-1' },
      update: {},
      create: {
        id: 'mod-data-a2-1',
        title: 'Data Basics Vocabulary',
        description: 'Términos fundamentales de ciencia de datos',
        cefrLevel: 'A2',
        sector: 'data',
        exerciseType: 'vocabulary',
        orderIndex: 1,
        xpReward: 50,
        content: JSON.stringify({ type: 'vocabulary', words: ['dataset', 'analysis', 'chart', 'trend', 'insight'] }),
      },
    }),
    prisma.learningModule.upsert({
      where: { id: 'mod-data-b1-1' },
      update: {},
      create: {
        id: 'mod-data-b1-1',
        title: 'Presenting Data Insights',
        description: 'Comunicar hallazgos de datos a stakeholders',
        cefrLevel: 'B1',
        sector: 'data',
        exerciseType: 'speaking',
        orderIndex: 2,
        xpReward: 50,
        content: JSON.stringify({ type: 'speaking', context: 'data_presentation' }),
      },
    }),
  ])

  // Test user
  const passwordHash = await bcrypt.hash('test1234', 10)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      passwordHash,
      name: 'Usuario Demo',
      cefrLevel: 'B1',
      sector: 'tech',
      xp: 350,
      level: 1,
      streakDays: 3,
      lastActivityAt: new Date(),
    },
  })

  // SRS items for test user (tech vocabulary)
  const srsVocab = [
    { front: 'refactor', back: 'Restructure code without changing behavior', context: 'We need to refactor this module before the sprint ends.' },
    { front: 'scalability', back: 'Ability to handle increased load', context: 'The new architecture improves horizontal scalability.' },
    { front: 'deployment', back: 'Process of releasing software to an environment', context: 'The CI/CD pipeline automates the deployment process.' },
    { front: 'repository', back: 'Storage location for code (e.g. Git repo)', context: 'Please push your changes to the main repository.' },
    { front: 'latency', back: 'Delay between request and response', context: 'We need to reduce API latency below 200ms.' },
    { front: 'middleware', back: 'Software that connects components or services', context: 'The authentication middleware checks every request.' },
    { front: 'throughput', back: 'Amount of data processed per unit of time', context: 'High throughput is critical for our streaming service.' },
    { front: 'abstraction', back: 'Hiding complexity behind a simpler interface', context: 'Good abstraction makes the codebase easier to maintain.' },
  ]

  for (const item of srsVocab) {
    await prisma.sRSItem.upsert({
      where: { id: `srs-${testUser.id}-${item.front}` },
      update: {},
      create: {
        id: `srs-${testUser.id}-${item.front}`,
        userId: testUser.id,
        ...item,
        sector: 'tech',
        state: 'New',
        due: new Date(),
      },
    })
  }

  // Mark first module as completed for test user
  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: testUser.id, moduleId: 'mod-tech-a1-1' } },
    update: {},
    create: {
      userId: testUser.id,
      moduleId: 'mod-tech-a1-1',
      completed: true,
      score: 85,
      xpEarned: 50,
      attempts: 1,
      completedAt: new Date(),
    },
  })

  console.log('✅ Seed complete!')
  console.log('   📧 Test user: test@test.com')
  console.log('   🔑 Password:  test1234')
  console.log(`   📚 Modules created: ${techModules.length} tech + 3 business + 2 data`)
  console.log(`   🃏 SRS items: ${srsVocab.length} vocabulary cards ready to review`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
