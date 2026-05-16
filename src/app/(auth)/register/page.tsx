import { RegisterForm } from './RegisterForm'

export default function RegisterPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-12%', left: '-8%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 11%, transparent) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-6%',
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, color-mix(in oklab, var(--sage) 12%, transparent) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        background: 'var(--card)',
        border: '1px solid var(--card-ring)',
        borderRadius: 24,
        boxShadow: 'var(--sh-3)',
        padding: '40px 36px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, marginBottom: 16,
            boxShadow: '0 4px 0 var(--primary-2)',
          }}>
            🚀
          </div>
          <h1 style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 500, fontStyle: 'italic',
            fontSize: 28, letterSpacing: '-0.02em',
            color: 'var(--ink)', margin: '0 0 6px',
          }}>
            Crear cuenta
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>
            Comienza tu ruta de inglés profesional
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  )
}
