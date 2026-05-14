import { useEffect, useState } from 'react'
import { PALETTES, SIDEBARS } from '../../tokens/palettes'
import { useTweaks } from '../../hooks/useTweaks'

const TWEAK_DEFAULTS = {
  palette: PALETTES[0],
  sidebar: SIDEBARS[0],
}

export function TweaksPanel() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [open, setOpen] = useState(false)

  const [primary, cdefg, h] = (t.palette as string[]) || PALETTES[0]

  useEffect(() => {
    const r = document.documentElement.style
    r.setProperty('--as-primary', primary)
    r.setProperty('--as-primary-hover', primary)
    r.setProperty('--as-ab', primary)
    r.setProperty('--as-cdefg', cdefg)
    r.setProperty('--as-cdefg-ink', cdefg)
    r.setProperty('--as-h', h)
    r.setProperty('--as-h-ink', h)
    r.setProperty('--as-sidebar', t.sidebar as string)
    r.setProperty('--as-sidebar-text', t.sidebar === '#FFFFFF' ? '#111827' : '#E5E7EB')
    r.setProperty('--as-sidebar-mute', t.sidebar === '#FFFFFF' ? '#6B7280' : '#9CA3AF')
    r.setProperty('--as-sidebar-active', t.sidebar === '#FFFFFF' ? '#F3F4F6' : '#374151')
  }, [primary, cdefg, h, t.sidebar])

  return (
    <>
      {/* Toggle tab */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          top: '50%',
          right: open ? 220 : 0,
          transform: 'translateY(-50%)',
          background: '#1F2937',
          color: '#E5E7EB',
          padding: '10px 8px',
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          zIndex: 300,
          writingMode: 'vertical-rl',
          transition: 'right 0.25s',
        }}
      >
        TWEAKS
      </div>

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: open ? 0 : -220,
        width: 220,
        height: '100vh',
        background: '#fff',
        borderLeft: '1px solid var(--as-line)',
        boxShadow: 'var(--sh-lg)',
        zIndex: 290,
        transition: 'right 0.25s',
        overflowY: 'auto',
        padding: '18px 16px',
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Tweaks · 配色
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            主色組
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PALETTES.map((p, i) => {
              const active = JSON.stringify(p) === JSON.stringify(t.palette)
              return (
                <button
                  key={i}
                  onClick={() => setTweak('palette', p)}
                  style={{
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                    padding: '6px 8px',
                    border: `1.5px solid ${active ? 'var(--as-ink)' : 'var(--as-line)'}`,
                    borderRadius: 6,
                    background: active ? 'var(--as-bg)' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {p.map((c, j) => (
                    <div key={j} style={{ width: 20, height: 20, borderRadius: 4, background: c }} />
                  ))}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            側欄底色
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {SIDEBARS.map((s, i) => {
              const active = s === t.sidebar
              return (
                <button
                  key={i}
                  onClick={() => setTweak('sidebar', s)}
                  style={{
                    width: 32, height: 32,
                    borderRadius: 6,
                    background: s,
                    border: `2px solid ${active ? 'var(--as-primary)' : 'var(--as-line)'}`,
                    cursor: 'pointer',
                    boxShadow: s === '#FFFFFF' ? 'inset 0 0 0 1px var(--as-line)' : 'none',
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
