import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'AprenderIngles — Inglés Profesional Personalizado',
  description: 'Aprende inglés profesional con IA, repetición espaciada y gamificación adaptada a tu sector.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-50">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
