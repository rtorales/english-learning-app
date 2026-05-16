'use client'

import { useState, useTransition } from 'react'
import { registerAction } from '@/actions/auth'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [focusedField, setFocusedField] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await registerAction({ name, email, password })
      if (result?.error) setError(result.error)
    })
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    boxSizing: 'border-box',
    background: 'var(--bg-soft)',
    border: `1.5px solid ${focusedField === field ? 'var(--primary)' : 'var(--card-ring)'}`,
    borderRadius: 12,
    fontSize: 15,
    color: 'var(--ink)',
    fontFamily: 'var(--f-body)',
    outline: 'none',
    transition: 'border-color 140ms ease',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ink-2)',
    marginBottom: 6,
    fontFamily: 'var(--f-sans)',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Nombre</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
          required
          minLength={2}
          style={inputStyle('name')}
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          required
          style={inputStyle('email')}
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label style={labelStyle}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          required
          minLength={6}
          style={inputStyle('password')}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {error && (
        <p style={{ fontSize: 13, color: 'var(--coral)', fontWeight: 600, margin: 0 }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          width: '100%', height: 50, marginTop: 4,
          background: 'var(--primary)', color: 'var(--primary-ink)',
          border: 'none', borderRadius: 14,
          fontFamily: 'var(--f-sans)', fontWeight: 800, fontSize: 15,
          textTransform: 'uppercase', letterSpacing: '-0.01em',
          boxShadow: isPending ? '0 1px 0 var(--primary-2)' : '0 4px 0 var(--primary-2)',
          transform: isPending ? 'translateY(3px)' : undefined,
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.75 : 1,
          transition: 'transform 90ms ease, box-shadow 90ms ease, opacity 140ms',
        }}
        onMouseDown={e => {
          if (!isPending) {
            e.currentTarget.style.transform = 'translateY(3px)'
            e.currentTarget.style.boxShadow = '0 1px 0 var(--primary-2)'
          }
        }}
        onMouseUp={e => {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = '0 4px 0 var(--primary-2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = '0 4px 0 var(--primary-2)'
        }}
      >
        {isPending ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
        ¿Ya tienes cuenta?{' '}
        <a
          href="/login"
          style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
        >
          Iniciar sesión
        </a>
      </p>
    </form>
  )
}
