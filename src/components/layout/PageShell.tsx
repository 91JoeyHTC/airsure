import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { Header } from './Header'
import { AssistantFAB } from '../ai/AssistantFAB'
import { BatchModeToggle } from '../ui/BatchModeToggle'

interface Tab {
  k: string
  l: string
  n?: number | null
}

interface PageShellProps {
  tk: string
  tkClass?: string
  title: string
  sub: string
  actions?: React.ReactNode
  tabs?: Tab[]
  activeTab?: string
  onTab?: (k: string) => void
  children: React.ReactNode
  showFAB?: boolean
}

export function PageShell({
  tk,
  tkClass = '',
  title,
  sub,
  actions,
  tabs,
  activeTab,
  onTab,
  children,
  showFAB = true,
}: PageShellProps) {
  const navigate = useNavigate()

  const NAV_ITEMS = [
    { path: '/',         label: '首頁總覽',       icon: 'home',     group: null,     badge: null, core: false },
    { path: '/module-a', label: '居家空氣場域',    icon: 'wind',     group: '雙核心', badge: null, core: true },
    { path: '/module-b', label: '用戶 360° 視圖',  icon: 'users',    group: null,     badge: null, core: true },
    { path: '/module-c', label: '服務管理',        icon: 'headset',  group: '營運',   badge: '12', core: false },
    { path: '/module-d', label: '產品管理',        icon: 'box',      group: null,     badge: null, core: false },
    { path: '/module-e', label: '會員經營',        icon: 'star',     group: null,     badge: '37', core: false },
    { path: '/module-f', label: '營收分析',        icon: 'chart',    group: null,     badge: null, core: false },
    { path: '/module-g', label: '行銷與健康證書',  icon: 'bullhorn', group: null,     badge: null, core: false },
    { path: '/module-h', label: '營運決策中心',    icon: 'sparkles', group: '智能',   badge: '8',  core: false },
  ]

  return (
    <div className="as-app">
      {/* Mobile bar */}
      <div className="as-mob-bar">
        <div className="brand">
          <div className="logo">A</div>
          <div>AirSure</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ width: 32, height: 32, border: '1px solid var(--as-line)', background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bell" size={16} />
          </button>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--as-cdefg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>陳</div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="as-side">
        <div className="brand">
          <div className="logo">A</div>
          <div>
            <div className="nm">AirSure</div>
            <div className="sub">克立淨 · 數據中台</div>
          </div>
        </div>
        <nav className="nav">
          {NAV_ITEMS.map(item => (
            <div key={item.path}>
              {item.group && <div className="grp">{item.group}</div>}
              <a
                className={[item.path === `/module-${tk.toLowerCase()}` ? (item.core ? 'active core' : 'active') : (item.core ? 'core' : '')].filter(Boolean).join(' ')}
                onClick={() => navigate(item.path)}
                style={{ cursor: 'pointer' }}
              >
                <span className="ic"><Icon name={item.icon} /></span>
                {item.label}
                {item.badge && (
                  <span className={item.path === '/module-h' ? 'badge mute' : 'badge'}>
                    {item.badge}
                  </span>
                )}
              </a>
            </div>
          ))}
        </nav>
        <div className="me">
          <div className="av">陳</div>
          <div>
            <div className="nm">陳怡君</div>
            <div className="role">客服顧問 · 在線</div>
          </div>
        </div>
      </aside>

      <main className="as-main">
        <Header title={title} />
        <div className="mp">
          <div className="ph">
            <div>
              <span className={`tk ${tkClass}`}>模組 {tk} · {sub}</span>
              <h1>{title}</h1>
            </div>
            <div className="acts" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <BatchModeToggle />
              {actions}
            </div>
          </div>

          {tabs && (
            <div className="tabs">
              {tabs.map(t => (
                <div
                  key={t.k}
                  className={`tab ${t.k === activeTab ? 'active' : ''}`}
                  onClick={() => onTab?.(t.k)}
                >
                  {t.l}
                  {t.n != null && <span className="n">{t.n}</span>}
                </div>
              ))}
            </div>
          )}

          {children}
        </div>

        {showFAB && <AssistantFAB context={`模組 ${tk} · ${title}`} />}
      </main>
    </div>
  )
}
