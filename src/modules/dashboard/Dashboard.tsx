/* AirSure 數據中台 — P00 首頁總覽 Dashboard */
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import { batchAttrs } from '../../components/ui/BatchAttrs'
import {
  PERSONAS,
  KPIS_BY_PERSONA,
  AI_BY_PERSONA,
  CONTACT_LIST,
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

export function Dashboard(_props: DashboardProps) {
  const navigate = useNavigate()
  // 首頁固定以「總經理視角」呈現,不再依 prop 切換(視角切換 UI 已隱藏)
  const persona: PersonaId = 'gm'
  const kpis = KPIS_BY_PERSONA[persona]
  const ai = AI_BY_PERSONA[persona]
  const currentPersona = PERSONAS.find((p) => p.id === persona)

  const abModules = MODULE_MAP.filter((m) => m.variant === 'ab')
  // cdefg / h 模組區塊已依 PDF 拿掉,只留雙核心

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

        {/* 視角切換已隱藏(2026-05-29 依 PDF 指示) · 首頁固定 GM 視角 */}

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
              <div className="ptag">
                {currentPersona?.label}視角 · 數據時間 2026/05/14 09:42 自動更新
              </div>
            </div>
            <button className="pcta">
              <Icon name="star" size={14} />
              查看主動聯繫名單
            </button>
          </div>

          {/* KPI cards — 已調整至首段(原位置在 AI banner 下方,2026-05-29 改到今日聚焦上方) */}
          {/* 卡數動態:gm 5 卡 / 其他角色 4 卡 */}
          <div className="kpi-row" style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)` }} {...batchAttrs('Dashboard.KPI')}>
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

          {/* Today's focus ribbon — 顧問行程
              · 3 列 1 顧問:偉仁(綠) / 銘哲(紫) / 易杰(橘)
              · 4 種服務類型:產品異常／維修 / 預約空氣檢測 / 預約定期保養 / 產品使用教學 */}
          <div
            className="today-ribbon"
            {...batchAttrs('Dashboard.今日聚焦時間帶')}
            style={{ alignItems: 'flex-start' }}
          >
            <div className="tlbl">
              今日顧問行程
              <span className="big">
                12<span className="u">場主動聯繫</span>
              </span>
            </div>
            {/* 取代原本 .tline 單列,改成 3 列顧問軌道 */}
            <div style={{ position: 'relative', paddingLeft: 52, paddingTop: 4 }}>
              {/* 時間軸刻度(共用) */}
              <div style={{ position: 'relative', height: 14, marginBottom: 6 }}>
                {[
                  { l: '0%', t: '09:00' },
                  { l: '20%', t: '11:00' },
                  { l: '40%', t: '13:00' },
                  { l: '60%', t: '15:00' },
                  { l: '80%', t: '17:00' },
                  { l: '100%', t: '19:00' },
                ].map(h => (
                  <div
                    key={h.t}
                    style={{
                      position: 'absolute',
                      left: h.l === '100%' ? undefined : h.l,
                      right: h.l === '100%' ? 0 : undefined,
                      top: 0,
                      fontSize: 10,
                      color: 'var(--as-mute)',
                      fontFamily: 'var(--f-mono)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {h.t}
                  </div>
                ))}
              </div>

              {/* 3 條顧問軌道 */}
              {[
                {
                  name: '偉仁',
                  color: 'var(--as-primary)',
                  events: [
                    { left: '0%',  width: 132, label: '★ 產品異常／維修', title: '偉仁 · 09:30 · 產品異常／維修' },
                    { left: '56%', width: 110, label: '產品使用教學',     title: '偉仁 · 15:00 · 產品使用教學' },
                  ],
                },
                {
                  name: '銘哲',
                  color: 'var(--as-cdefg)',
                  events: [
                    { left: '20%', width: 110, label: '預約空氣檢測', title: '銘哲 · 11:20 · 預約空氣檢測' },
                    { left: '78%', width: 110, label: '預約定期保養', title: '銘哲 · 17:00 · 預約定期保養' },
                  ],
                },
                {
                  name: '易杰',
                  color: 'var(--as-h)',
                  events: [
                    { left: '38%', width: 110, label: '預約定期保養', title: '易杰 · 13:00 · 預約定期保養' },
                  ],
                },
              ].map((c, idx) => (
                <div
                  key={c.name}
                  style={{
                    position: 'relative',
                    height: 22,
                    marginBottom: idx < 2 ? 6 : 0,
                  }}
                >
                  {/* 顧問名(左側固定欄) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -52,
                      top: 4,
                      width: 44,
                      fontSize: 11,
                      fontWeight: 700,
                      color: c.color,
                    }}
                  >
                    {c.name}
                  </div>
                  {/* 軌道底 */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'var(--as-bg)',
                      borderRadius: 6,
                    }}
                  />
                  {/* 該顧問的行程 */}
                  {c.events.map((ev, j) => (
                    <div
                      key={j}
                      style={{
                        position: 'absolute',
                        left: ev.left,
                        top: 3,
                        width: ev.width,
                        height: 16,
                        borderRadius: 8,
                        padding: '0 8px',
                        fontSize: 10,
                        color: '#fff',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        background: c.color,
                      }}
                      title={ev.title}
                    >
                      {ev.label}
                    </div>
                  ))}
                </div>
              ))}

              {/* 「現在」垂直線(跨 3 列) */}
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(52px + 14%)',
                  top: 20,
                  bottom: 0,
                  width: 1,
                  background: 'var(--as-danger)',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: -16,
                    fontSize: 9,
                    color: 'var(--as-danger)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  現在
                </span>
              </div>
            </div>
          </div>

          {/* AI banner */}
          <div className="as-ai-banner" {...batchAttrs('Dashboard.AI 建議橫幅')}>
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

          {/* 重要資訊(原八大模組總覽)— 2026-05-29 依 PDF 改名 + 只留雙核心 + 整列佔滿寬 */}
          <div className="modmap" {...batchAttrs('Dashboard.八大模組總覽')}>
            <div className="hd">
              <div>
                <h3>重要資訊</h3>
                <div className="htag">環境與客戶雙核心 · 場域 ↔ 用戶 數據樞紐</div>
              </div>
              <div className="htag">點擊任一模組進入詳情</div>
            </div>
            {/* 單欄佔滿;移除右側 C-H 模組區塊(依 PDF 指示) */}
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
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
            </div>
          </div>

          {/* 主動聯繫名單(原 dash-grid 雙欄,2026-05-29 依 PDF 拿掉場域空品表,改成單欄佔滿全寬) */}
          <div className="dash-grid" style={{ gridTemplateColumns: '1fr' }}>
            {/* Contact list (full-width) */}
            <div className="card contact-card" {...batchAttrs('Dashboard.需主動聯繫名單')}>
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
                {CONTACT_LIST.map((c) => {
                  // Row 點擊 → 跳 Module B 個人 360°(沿用 Module E → B 既有 state pattern)
                  const goPersona = () => navigate('/module-b', { state: { gotoIndividual: true, memberId: c.cid } })
                  // 電話 icon → tel: 協定觸發 ICT/系統撥號
                  const dial = (e: React.MouseEvent) => {
                    e.stopPropagation()
                    window.location.href = `tel:${c.phone.replace(/[^+\d]/g, '')}`
                  }
                  // 其他按鈕也跳個人 360°(訊息/檢視),阻止冒泡避免重複觸發
                  const goPersonaBtn = (e: React.MouseEvent) => {
                    e.stopPropagation()
                    goPersona()
                  }
                  return (
                    <div
                      className="row"
                      key={c.cid}
                      onClick={goPersona}
                      style={{ cursor: 'pointer' }}
                      title={`查看 ${c.who} 的個人 360° 視圖${c.star ? '(主示範)' : ''}`}
                    >
                      <div className={`pip ${c.pip}`} />
                      <div>
                        <div className="who">
                          {c.star && (
                            <span
                              title="個人 360° 主示範客戶"
                              style={{
                                display: 'inline-block',
                                color: 'var(--as-warning)',
                                marginRight: 4,
                                fontSize: 12,
                              }}
                            >
                              ★
                            </span>
                          )}
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
                          <button className="actbtn" title={`撥打 ${c.phone}`} onClick={dial}><Icon name="phone" size={13} /></button>
                          <button className="actbtn" title="訊息" onClick={goPersonaBtn}><Icon name="msg" size={13} /></button>
                          <button className="actbtn" title="檢視個人 360°" onClick={goPersonaBtn}><Icon name="eye" size={13} /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
