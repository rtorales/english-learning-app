import { PlacementTest } from '@/components/placement/PlacementTest'

export default function PlacementPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-violet-400 mb-2">Test de Posicionamiento</h1>
          <p className="text-slate-400">
            Este test adaptativo determina tu nivel CEFR y personaliza tu ruta de aprendizaje.
          </p>
        </div>
        <PlacementTest />
      </div>
    </main>
  )
}
