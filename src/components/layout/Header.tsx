import { useState, useRef, useEffect } from 'react'
import { Icon } from '../ui/Icon'

interface HeaderProps {
  title: string
  breadcrumb?: string
}

// 預設區間選項(對應 PDF「日期區間」需求)
const RANGE_PRESETS = [
  { k: 'today',   l: '今日',     d: '2026/05/14' },
  { k: 'yesterday', l: '昨日',   d: '2026/05/13' },
  { k: '7d',      l: '近 7 天',  d: '2026/05/08–14' },
  { k: '30d',     l: '近 30 天', d: '2026/04/15–05/14' },
  { k: 'mtd',     l: '本月',     d: '2026/05/01–14' },
  { k: 'qtd',     l: '本季',     d: '2026/04/01–05/14' },
  { k: 'ytd',     l: '本年',     d: '2026/01/01–05/14' },
  { k: 'custom',  l: '自訂區間…', d: '' },
] as const

type RangeKey = typeof RANGE_PRESETS[number]['k']
const STORAGE_KEY = 'as.date-range'

export function Header({ title, breadcrumb }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<RangeKey>(() => {
    if (typeof window === 'undefined') return 'today'
    try {
      const v = window.localStorage.getItem(STORAGE_KEY) as RangeKey | null
      return v && RANGE_PRESETS.some(p => p.k === v) ? v : 'today'
    } catch {
      return 'today'
    }
  })
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, range) } catch {}
  }, [range])

  // outside click to close
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const current = RANGE_PRESETS.find(p => p.k === range) ?? RANGE_PRESETS[0]

  return (
    <header className="as-header">
      <div className="crumbs">
        <span>克立淨數據中台</span>
        {breadcrumb && <><span>›</span><span>{breadcrumb}</span></>}
        <span>›</span>
        <span className="cur">{title}</span>
      </div>
      <div className="search">
        <span className="si"><Icon name="search" size={14} /></span>
        <input placeholder="搜尋會員、場域、設備、工單…" />
      </div>
      <div className="right">
        <div ref={wrapRef} style={{ position: 'relative' }}>
          <button className="timepick" onClick={() => setOpen(v => !v)}>
            <Icon name="cal" size={14} />
            {current.l}{current.d && ` · ${current.d}`}
          </button>
          {open && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                minWidth: 200,
                background: '#fff',
                border: '1px solid var(--as-line)',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                padding: 6,
                zIndex: 50,
              }}
            >
              {RANGE_PRESETS.map(p => {
                const active = p.k === range
                return (
                  <button
                    key={p.k}
                    onClick={() => { setRange(p.k); setOpen(false) }}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '8px 10px',
                      border: 'none',
                      background: active ? 'var(--as-primary-tint)' : 'transparent',
                      color: active ? 'var(--as-primary)' : 'var(--as-ink)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      textAlign: 'left',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <span>{p.l}</span>
                    {p.d && (
                      <span style={{ fontSize: 11, color: active ? 'var(--as-primary)' : 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>
                        {p.d}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <button className="iconbtn">
          <Icon name="refresh" size={16} />
        </button>
        <button className="iconbtn">
          <Icon name="bell" size={16} />
          <span className="dot" />
        </button>
      </div>
    </header>
  )
}
