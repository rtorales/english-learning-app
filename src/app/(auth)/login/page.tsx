import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <p className="text-3xl mb-2">🌐</p>
          <CardTitle className="text-violet-400">AprenderIngles</CardTitle>
          <p className="text-sm text-slate-400">Inglés profesional personalizado</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
