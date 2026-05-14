import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { PERSONAS, type PersonaId } from '../../hooks/usePersona'

interface SidebarProps {
  persona: PersonaId
  onPersona: (id: PersonaId) => void
}

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

const PERSONA_ICONS: Record<PersonaId, string> = {
  gm: '📊', cs: '🩺', svc: '🎧', mk: '📣',
}

export function Sidebar({ persona, onPersona }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="as-side">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <div className="nm">AirSure</div>
          <div className="sub">克立淨 · 數據中台</div>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)
          return (
            <div key={item.path}>
              {item.group && <div className="grp">{item.group}</div>}
              <a
                className={[isActive ? 'active' : '', item.core ? 'core' : ''].filter(Boolean).join(' ')}
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
          )
        })}
      </nav>

      <div className="persona">
        <div className="plbl">角色視角</div>
        <div className="row">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              className={`pbtn ${p.id === persona ? 'active' : ''}`}
              onClick={() => onPersona(p.id as PersonaId)}
            >
              <span className="pic">{PERSONA_ICONS[p.id as PersonaId]}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="me">
        <div className="av">陳</div>
        <div>
          <div className="nm">陳怡君</div>
          <div className="role">客服顧問 · 在線</div>
        </div>
      </div>
    </aside>
  )
}
