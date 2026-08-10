import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--ink)',
      fontFamily: 'var(--f-body)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -160, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)', opacity: 0.45, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--card-ring) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)', opacity: 0.4, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <header style={{ display: 'flex', alignItems: 'center', padding: '22px 56px' }}>
          <Logo />
          <nav style={{ marginLeft: 56, display: 'flex', gap: 28 }}>
            {['Cómo funciona', 'Ciencia detrás', 'Sectores'].map(l => (
              <span key={l} style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500, cursor: 'default' }}>{l}</span>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center',
              height: 36, padding: '0 14px', borderRadius: 12,
              background: 'transparent', color: 'var(--ink-2)',
              fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 13,
              textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '-0.01em',
            }}>
              Iniciar sesión
            </Link>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center',
              height: 36, padding: '0 16px', borderRadius: 12,
              background: 'var(--primary)', color: 'var(--primary-ink)',
              fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 13,
              textDecoration: 'none', boxShadow: '0 4px 0 var(--primary-2)',
              textTransform: 'uppercase', letterSpacing: '-0.01em',
            }}>
              Empezar
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 60,
          padding: '32px 56px 24px', alignItems: 'center', maxWidth: 1280, margin: '0 auto',
        }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px 6px 8px',
              background: 'var(--primary-tint)',
              border: '1px solid color-mix(in oklab, var(--primary) 20%, transparent)',
              borderRadius: 999,
              fontSize: 12, fontWeight: 700, color: 'var(--primary-2)',
              marginBottom: 22,
            }}>
              <SparklesIcon />
              INGLÉS PROFESIONAL CON IA · CEFR A1 → C2
            </div>

            <h1 style={{
              fontFamily: 'var(--f-sans)',
              fontSize: 60, fontWeight: 700,
              lineHeight: 1.02, letterSpacing: '-0.035em',
              color: 'var(--ink)',
              margin: '0 0 22px',
            }}>
              Aprendé inglés{' '}
              <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontWeight: 500, color: 'var(--primary)' }}>
                con propósito
              </span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 480, fontWeight: 400 }}>
              Un camino adaptativo hecho para tu sector profesional. Repetición espaciada con FSRS, ludificación moderada y vocabulario que{' '}
              <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>vas a usar en tu próxima reunión</strong>.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 64, padding: '0 28px', borderRadius: 14,
                background: 'var(--primary)', color: 'var(--primary-ink)',
                fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 17,
                textDecoration: 'none', boxShadow: '0 4px 0 var(--primary-2)',
                textTransform: 'uppercase', letterSpacing: '-0.01em',
              }}>
                Empezar gratis <ArrowRightIcon />
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 64, padding: '0 28px', borderRadius: 14,
                background: 'var(--card)', color: 'var(--ink)',
                fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 17,
                textDecoration: 'none', boxShadow: '0 4px 0 var(--line)',
                border: '2px solid var(--line)',
                textTransform: 'uppercase', letterSpacing: '-0.01em',
              }}>
                <PlayIcon /> Ver demo (2 min)
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 28, color: 'var(--ink-3)', fontSize: 13, fontWeight: 500 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckIcon color="var(--sage)" /> Sin tarjeta
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckIcon color="var(--sage)" /> Test inicial en 8 min
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckIcon color="var(--sage)" /> Cancelás cuando quieras
              </span>
            </div>
          </div>

          {/* Right — preview card stack */}
          <div style={{ position: 'relative', height: 540 }}>
            {/* Back card */}
            <div style={{
              position: 'absolute', top: 8, right: -10, width: 280,
              background: 'var(--card)', borderRadius: 18,
              border: '1px solid var(--card-ring)',
              boxShadow: '0 2px 6px rgba(58,47,74,0.07), 0 8px 24px rgba(58,47,74,0.06)',
              padding: 18,
              transform: 'rotate(4deg)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Sector profesional</div>
              {[
                { icon: '🔧', label: 'Software / IT', active: true },
                { icon: '📊', label: 'Datos & Analytics' },
                { icon: '🌐', label: 'Negocios' },
              ].map((s, k) => (
                <div key={k} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12,
                  background: s.active ? 'var(--primary-tint)' : 'transparent',
                  marginBottom: 4,
                }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: s.active ? 'var(--primary-2)' : 'var(--ink-2)' }}>{s.label}</span>
                  {s.active && <CheckIcon color="var(--primary-2)" style={{ marginLeft: 'auto' }} />}
                </div>
              ))}
            </div>

            {/* Front card */}
            <div style={{
              position: 'absolute', top: 60, left: 0, width: 380,
              background: 'var(--card)', borderRadius: 22,
              border: '1px solid var(--card-ring)',
              boxShadow: '0 8px 24px rgba(58,47,74,0.10), 0 30px 60px rgba(58,47,74,0.08)',
              padding: 22,
              transform: 'rotate(-3deg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Pill bg="var(--primary-soft)" fg="var(--primary-2)" icon="📘">Lección 12 · B1</Pill>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>3/10</span>
              </div>
              <ProgressBar value={3} max={10} height={6} />

              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Traducí esta frase</div>
                <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, fontFamily: 'var(--f-sans)' }}>
                  &ldquo;Vamos a <span style={{ background: 'var(--accent-soft)', borderRadius: 6, padding: '1px 5px', color: 'var(--accent-ink)' }}>deploy</span> los cambios después del code review.&rdquo;
                </p>
              </div>

              <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {["We'll", "deploy", "the", "changes", "after", "the", "code", "review"].map((w, i) => (
                  <span key={i} style={{
                    padding: '8px 12px',
                    background: 'var(--bg-soft)',
                    borderRadius: 10,
                    fontSize: 14, fontWeight: 600, color: 'var(--ink)',
                    border: '1px solid var(--card-ring)',
                    boxShadow: '0 2px 0 var(--card-ring)',
                  }}>{w}</span>
                ))}
              </div>
            </div>

            {/* Floating stat chip */}
            <div style={{
              position: 'absolute', bottom: 20, right: 30,
              background: 'var(--card)', borderRadius: 16,
              border: '1px solid var(--card-ring)',
              boxShadow: '0 2px 6px rgba(58,47,74,0.07), 0 8px 24px rgba(58,47,74,0.06)',
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'color-mix(in oklab, var(--coral) 16%, transparent)',
                color: 'var(--coral)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FlameIcon />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>17 días</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features strip */}
        <div style={{
          padding: '24px 56px 36px',
          maxWidth: 1280, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
        }}>
          {[
            { icon: '🔁', t: 'Algoritmo FSRS', d: 'Repaso espaciado con 30% menos revisiones que SM-2. Ciencia de la memoria aplicada.' },
            { icon: '🎯', t: 'Test CAT adaptativo', d: 'Tu nivel CEFR exacto en 8-14 preguntas. Se adapta a cada respuesta.' },
            { icon: '✨', t: 'Contenido por sector', d: 'Vocabulario de Software, Datos, Negocios y más. Palabras que usás en tu trabajo.' },
          ].map((f, i) => (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid var(--card-ring)',
              borderRadius: 18, padding: '18px 20px',
              boxShadow: '0 1px 0 rgba(58,47,74,0.04)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-0.01em' }}>{f.t}</div>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{f.d}</p>
            </div>
          ))}
        </div>

        {/* Footer trust strip */}
        <div style={{
          padding: '18px 56px',
          borderTop: '1px solid var(--card-ring)',
          display: 'flex', alignItems: 'center', gap: 36,
          fontSize: 13, color: 'var(--ink-3)', fontWeight: 500,
          maxWidth: 1280, margin: '0 auto',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>Construido sobre</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <RotateIcon /> FSRS (–30% revisiones vs SM-2)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <TargetIcon /> CAT — test adaptativo CEFR
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <SparklesIcon /> Contenido por sector profesional
          </span>
        </div>
      </div>
    </main>
  )
}

/* ---- Components ---- */
function Logo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: 33, height: 33, borderRadius: 10,
        background: 'var(--primary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5 4c4 0 7 2 7 6 0-4 3-6 7-6v12c-4 0-7 2-7 6 0-4-3-6-7-6z" fill="#fff"/>
          <path d="M12 10v10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        </svg>
      </div>
      <span style={{ fontFamily: 'var(--f-sans)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
        aprende<span style={{ color: 'var(--primary)' }}>inglés</span>
      </span>
    </div>
  )
}

function Pill({ bg, fg, icon, children }: { bg: string; fg: string; icon?: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, background: bg, color: fg, fontSize: 12, fontWeight: 700 }}>
      {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
      {children}
    </span>
  )
}

function ProgressBar({ value, max, height = 8 }: { value: number; max: number; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ height, background: 'var(--bg-soft)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 999, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '2px 2px auto', height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.35),transparent)', borderRadius: 999 }} />
      </div>
    </div>
  )
}

function SparklesIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>
}
function ArrowRightIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
}
function PlayIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l14 8-14 8z" fill="currentColor"/></svg>
}
function CheckIcon({ color, style }: { color?: string; style?: React.CSSProperties }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color ?? 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M4 12l5 5L20 6"/></svg>
}
function FlameIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14c0-3 3.5-4 3.5-9 3 2 7 5 7 10a7 7 0 0 1-14 0c0-2 1-3.5 2-4.5 0 1.5.7 2.5 1.5 3.5z"/></svg>
}
function RotateIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>
}
function TargetIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>
}
