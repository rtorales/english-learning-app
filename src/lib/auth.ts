import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const DEV_FALLBACK_SECRET = 'local-dev-secret-change-in-production-32chars'

function resolveSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET

  // Sin esto, un deploy que se olvide de setear AUTH_SECRET quedaría firmando
  // sesiones con una clave que está publicada en el repo: cualquiera podría
  // falsificar el JWT de cualquier usuario.
  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      throw new Error('AUTH_SECRET es obligatoria en producción. Generá una con: openssl rand -base64 48')
    }
    if (secret === DEV_FALLBACK_SECRET) {
      throw new Error('AUTH_SECRET no puede ser el valor de ejemplo. Generá una con: openssl rand -base64 48')
    }
    if (secret.length < 32) {
      throw new Error('AUTH_SECRET debe tener al menos 32 caracteres.')
    }
  }

  return new TextEncoder().encode(secret ?? DEV_FALLBACK_SECRET)
}

const SECRET = resolveSecret()
const COOKIE_NAME = 'session'
const SESSION_DURATION = '7d'

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(SECRET)
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { userId: string }
  } catch {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
