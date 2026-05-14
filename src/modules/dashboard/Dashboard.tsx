/* AirSure 數據中台 — P00 首頁總覽 Dashboard */
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  PERSONAS,
  KPIS_BY_PERSONA,
  AI_BY_PERSONA,
  CONTACT_LIST,
  FIELDS,
  MODULE_MAP,
} from '../../mocks/dashboard'
import type { PersonaId } from '../../hooks/usePersona'

interface DashboardProps {
  persona: PersonaId
  onPersona: (id: PersonaId) => void
}

function highlightAiMsg(msg: string): string {
  return msg.replace(
    /(訂閱即將到期的高價值會員 共 \d+ 位|尚未啟動續約流程|室內 PM2\.5 連續 \d+ 天超標|連續 \d+ 小時離線|邀請轉換率 [\d.]+%|銀級會員)/g,
    '<b>$1</b>'
  )
}

function highlightWhy(why: string): string {
  return why.replace(
    /(PM2\.5 超標|多次未開機|逾期 \d+ 天|逾期未回覆|3 次未成功)/g,
    '<span class="b">$1</span>'
  )
}

export function Dashboard({ persona, onPersona }: DashboardProps) {
  const navigate = useNavigate()
  const kpis = KPIS_BY_PERSONA[persona]
  const ai = AI_BY_PERSONA[persona]
  const currentPersona = PERSONAS.find((p) => p.id === persona)

  const abModules = MODULE_MAP.filter((m) => m.variant === 'ab')
  const cdefgModules = MODULE_MAP.filter((m) => m.variant === 'cdefg')
  const hModules = MODULE_MAP.filter((m) => m.variant === 'h')

  return (
    <div className="as-app">
      {/* Mobile bar */}
      <div className="as-mob-bar">
        <div className="brand">
          <div className="logo">A</div>
          <div>AirSure</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="iconbtn"
            style={{
              width: 32,
              height: 32,
              border: '1px solid var(--as-line)',
              background: '#fff',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Icon name="bell" size={16} />
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 6,
                height: 6,
                background: 'var(--as-danger)',
                borderRadius: '50%',
              }}
            />
          </button>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--as-cdefg)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            陳
          </div>
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
          <a className="active core" onClick={() => navigate('/')}>
            <span className="ic"><Icon name="home" /></span>
            首頁總覽
          </a>
          <div className="grp">雙核心</div>
          <a className="core" onClick={() => navigate('/module-a')}>
            <span className="ic"><Icon name="home" /></span>
            居家空氣場域
          </a>
          <a className="core" onClick={() => navigate('/module-b')}>
            <span className="ic"><Icon name="users" /></span>
            用戶 360° 視圖
          </a>
          <div className="grp">營運</div>
          <a onClick={() => navigate('/module-c')}>
            <span className="ic"><Icon name="headset" /></span>
            服務管理
            <span className="badge">12</span>
          </a>
          <a onClick={() => navigate('/module-d')}>
            <span className="ic"><Icon name="box" /></span>
            產品管理
          </a>
          <a onClick={() => navigate('/module-e')}>
            <span className="ic"><Icon name="star" /></span>
            會員經營
            <span className="badge">37</span>
          </a>
          <a onClick={() => navigate('/module-f')}>
            <span className="ic"><Icon name="chart" /></span>
            營收分析
          </a>
          <a onClick={() => navigate('/module-g')}>
            <span className="ic"><Icon name="bullhorn" /></span>
            行銷與健康證書
          </a>
          <div className="grp">智能</div>
          <a onClick={() => navigate('/module-h')}>
            <span className="ic"><Icon name="sparkles" /></span>
            營運決策中心
            <span className="badge mute">8</span>
          </a>
        </nav>

        <div className="persona">
          <div className="plbl">視角切換</div>
          <div className="row">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                className={`pbtn ${persona === p.id ? 'active' : ''}`}
                onClick={() => onPersona(p.id)}
                title={p.focus}
              >
                <span className="pic"><Icon name={p.icon} size={14} /></span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="me">
          <div className="av">陳</div>
          <div>
            <div className="nm">陳怡君</div>
            <div className="role">{currentPersona?.label} · 在線</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="as-main">
        <header className="as-header">
          <div className="crumbs">
            <span>克立淨數據中台</span>
            <span>›</span>
            <span className="cur">首頁總覽</span>
          </div>
          <div className="search">
            <span className="si"><Icon name="search" size={14} /></span>
            <input placeholder="搜尋會員、場域、設備、工單…" />
          </div>
          <div className="right">
            <button className="timepick">
              <Icon name="cal" size={14} />
              今日 · 2026/05/14
            </button>
            <button className="iconbtn"><Icon name="refresh" size={16} /></button>
            <button className="iconbtn">
              <Icon name="bell" size={16} />
              <span className="dot" />
            </button>
          </div>
        </header>

        <div className="as-page">
          <div className="ptitle">
            <div>
              <h1>早安，怡君 — 今日有 5 件需主動聯繫</h1>
              <div className="ptag">
                {currentPersona?.label}視角 · 數據時間 2026/05/14 09:42 自動更新
              </div>
            </div>
            <button className="pcta">
              <Icon name="star" size={14} />
              查看主動聯繫名單
            </button>
          </div>

          {/* Today's focus ribbon */}
          <div className="today-ribbon">
            <div className="tlbl">
              今日聚焦
              <span className="big">
                12<span className="u">場主動聯繫</span>
              </span>
            </div>
            <div className="tline">
              <div className="hr" style={{ left: '0%' }}>09:00</div>
              <div className="hr" style={{ left: '20%' }}>11:00</div>
              <div className="hr" style={{ left: '40%' }}>13:00</div>
              <div className="hr" style={{ left: '60%' }}>15:00</div>
              <div className="hr" style={{ left: '80%' }}>17:00</div>
              <div className="hr" style={{ right: 0 }}>19:00</div>
              <div className="evt" style={{ left: '4%', width: 92, background: 'var(--as-danger)' }}>
                ★ 陳先生 · 撥打
              </div>
              <div className="evt" style={{ left: '22%', width: 84, background: 'var(--as-h)' }}>
                李女士 · LINE
              </div>
              <div className="evt" style={{ left: '34%', width: 78, background: 'var(--as-cdefg)' }}>
                到府保養
              </div>
              <div
                className="evt"
                style={{ left: '52%', width: 96, background: 'var(--as-warning)', color: '#1A1410' }}
              >
                3 通 待撥
              </div>
              <div className="evt" style={{ left: '74%', width: 72, background: 'var(--as-primary)' }}>
                季度報告
              </div>
              <div className="now" style={{ left: '14%' }} />
            </div>
          </div>

          {/* AI banner */}
          <div className="as-ai-banner">
            <div className="ai-ic"><Icon name="sparkles" size={20} /></div>
            <div className="ai-cnt">
              <div className="ttl">{ai.ttl}</div>
              <div
                className="msg"
                dangerouslySetInnerHTML={{ __html: highlightAiMsg(ai.msg) }}
              />
            </div>
            <div className="ai-act">
              <button>稍後</button>
              <button className="primary">採納並指派 →</button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="kpi-row">
            {kpis.map((k) => (
              <div key={k.lbl} className={`kpi ${k.accent}`}>
                <div className="lbl">{k.lbl}</div>
                <div className="val">
                  {k.val}<span className="u">{k.u}</span>
                </div>
                <div className="ft">
                  <span className={`delta ${k.dir}`}>
                    {k.dir === 'up' && <Icon name="up" size={11} />}
                    {k.dir === 'dn' && <Icon name="down" size={11} />}
                    {k.delta}
                  </span>
                  <Sparkline
                    data={k.spark}
                    color={
                      k.accent === 'red'
                        ? 'var(--as-danger)'
                        : k.accent === 'orange'
                        ? 'var(--as-h)'
                        : k.accent === 'purple'
                        ? 'var(--as-cdefg)'
                        : 'var(--as-primary)'
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Module map */}
          <div className="modmap">
            <div className="hd">
              <div>
                <h3>八大模組總覽</h3>
                <div className="htag">環境與客戶雙核心 · 營運管理 · 智能決策中心</div>
              </div>
              <div className="htag">點擊任一模組進入詳情</div>
            </div>
            <div className="grid">
              {/* Left: A+B dual core */}
              <div className="core">
                <div className="ctitle">雙核心 · 場域 ↔ 用戶 數據樞紐</div>
                <div className="row">
                  {abModules.map((m) => (
                    <div
                      key={m.key}
                      className={`mod-card ${m.variant}`}
                      onClick={() => navigate(m.route)}
                    >
                      <div className="mc-h">
                        <span className="mc-key"><Icon name={m.icon} size={12} /></span>
                        <Icon name="arrow" size={14} />
                      </div>
                      <div className="mc-nm">{m.nm}</div>
                      <div className="mc-num">
                        {m.num}<span className="u">{m.u}</span>
                      </div>
                      {m.stat && <div className="mc-stat">{m.stat}</div>}
                      {m.spark && (
                        <div className="mc-spark">
                          {m.spark.map((h, i) => (
                            <span className="b" key={i} style={{ height: `${h * 1.5}px` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: C/D/E/F/G (indigo) + H (orange) */}
              <div className="right">
                <div className="grp cdefg">
                  {cdefgModules.map((m) => (
                    <div
                      key={m.key}
                      className={`mod-card ${m.variant}`}
                      onClick={() => navigate(m.route)}
                    >
                      <div className="mc-h">
                        <span className="mc-key"><Icon name={m.icon} size={12} /></span>
                      </div>
                      <div className="mc-nm">{m.nm}</div>
                      <div
                        className="mc-num"
                        style={m.numColor ? { color: m.numColor } : undefined}
                      >
                        {m.num}<span className="u">{m.u}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grp h">
                  {hModules.map((m) => (
                    <div
                      key={m.key}
                      className={`mod-card ${m.variant}`}
                      onClick={() => navigate(m.route)}
                    >
                      <div className="mc-h">
                        <span className="mc-key"><Icon name={m.icon} size={12} /></span>
                        <Icon name="arrow" size={14} />
                      </div>
                      <div className="mc-nm">{m.nm}</div>
                      <div className="mc-num">
                        {m.num}<span className="u">{m.u}</span>
                      </div>
                      {m.spark && (
                        <div className="mc-spark">
                          {m.spark.map((h, i) => (
                            <span className="b" key={i} style={{ height: `${h * 1.2}px` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dash grid: field table + contact list */}
          <div className="dash-grid">
            {/* Field table */}
            <div className="card">
              <div className="ch">
                <div>
                  <h3>場域空氣品質 — 即時狀態</h3>
                  <div className="csub">居家空氣場域 · TOP 異常排序</div>
                </div>
                <span className="clink">查看全部 1,284 →</span>
              </div>
              <table className="field-table">
                <thead>
                  <tr>
                    <th>場域</th>
                    <th className="hide-mob">設備</th>
                    <th>狀態</th>
                    <th>空氣品質</th>
                    <th className="hide-mob">關聯會員</th>
                  </tr>
                </thead>
                <tbody>
                  {FIELDS.map((f) => (
                    <tr key={f.id}>
                      <td className="nm-cell">
                        {f.nm}
                        <span className="sub">{f.id} · {f.loc}</span>
                      </td>
                      <td className="hide-mob">{f.dev}</td>
                      <td>
                        <span className="lamp">
                          <span className={`d ${f.lamp}`} />
                          {f.lamp === 'g' ? '正常' : f.lamp === 'y' ? '警示' : '異常'}
                        </span>
                      </td>
                      <td>
                        <div className="pct-bar">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                            <span>{f.q}</span>
                            <span style={{ color: 'var(--as-mute)' }}>/100</span>
                          </div>
                          <div className="tr">
                            <div
                              className={`fi ${f.qc === 'g' ? '' : f.qc}`}
                              style={{ width: `${f.q}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="hide-mob">{f.mem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact list */}
            <div className="card contact-card">
              <div className="ch">
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--as-warning)' }}>
                      <Icon name="star" size={16} />
                    </span>
                    需主動聯繫名單
                  </h3>
                  <div className="csub">會員經營 · 核心功能</div>
                </div>
              </div>
              <div className="ctags">
                <span className="ctag active">
                  全部<span className="n">37</span>
                </span>
                <span className="ctag">
                  高風險<span className="n">12</span>
                </span>
                <span className="ctag">
                  續約預警<span className="n">15</span>
                </span>
                <span className="ctag">
                  健康異常<span className="n">10</span>
                </span>
              </div>
              <div className="contact-list">
                {CONTACT_LIST.map((c) => (
                  <div className="row" key={c.cid}>
                    <div className={`pip ${c.pip}`} />
                    <div>
                      <div className="who">
                        {c.who}<span className="cid">{c.cid}</span>
                      </div>
                      <div
                        className="why"
                        dangerouslySetInnerHTML={{ __html: highlightWhy(c.why) }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <div className={`sla ${c.urgent ? 'urgent' : ''}`}>{c.sla}</div>
                      <div className="acts">
                        <button className="actbtn" title="撥打"><Icon name="phone" size={13} /></button>
                        <button className="actbtn" title="訊息"><Icon name="msg" size={13} /></button>
                        <button className="actbtn" title="檢視"><Icon name="eye" size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
