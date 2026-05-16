import type { Metadata } from 'next'
import { Inter_Tight, Manrope } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'aprendeInglés — Inglés Profesional Personalizado',
  description: 'Aprende inglés profesional con IA, repetición espaciada y gamificación adaptada a tu sector.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('ai-theme')?.value ?? 'light'

  return (
    <html
      lang="es"
      data-theme={theme}
      className={`${interTight.variable} ${manrope.variable} h-full`}
      style={{ fontFamily: 'var(--f-body)' }}
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
        {children}
      </body>
    </html>
  )
}
