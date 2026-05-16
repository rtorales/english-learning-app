'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSessionToken, setSessionCookie, clearSessionCookie } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function loginAction(input: z.infer<typeof loginSchema>) {
  const { email, password } = loginSchema.parse(input)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'Email o contraseña incorrectos' }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { error: 'Email o contraseña incorrectos' }

  const token = await createSessionToken(user.id)
  await setSessionCookie(token)
  redirect('/dashboard')
}

export async function registerAction(input: z.infer<typeof registerSchema>) {
  const { name, email, password } = registerSchema.parse(input)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'Ya existe una cuenta con ese email' }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  })

  const token = await createSessionToken(user.id)
  await setSessionCookie(token)
  redirect('/placement')
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect('/login')
}
