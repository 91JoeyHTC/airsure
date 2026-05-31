/* AirSure — Module E (會員經營) */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import { batchAttrs } from '../../components/ui/BatchAttrs'
import {
  MEMBER_KPIS,
  DAILY_CHANNELS,
  LIFECYCLE_STAGES,
  LIFECYCLE_FLOWS_FWD,
  LIFECYCLE_FLOWS_BACK,
  ACQ_SOURCES,
  OPS_SEGMENTS,
  MKT_SEGMENTS,
  OUTREACH_MEMBERS,
  OUTREACH_FILTERS,
  CHURN_TIERS,
  POINTS_BY_TIER,
} from '../../mocks/module-e'

// ─── Daily Operations Tab ────────────────────────────────────────────────────

function EDaily() {
  return (
    <>
      {/* 3-channel daily ops cards */}
      <div className="ed-channels" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }} {...batchAttrs('E.日常通道')}>
        {DAILY_CHANNELS.map(ch => (
          <div className="card" key={ch.k} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--as-line-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: ch.c + '18', color: ch.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ch.k === 'edm' ? 'msg' : ch.k === 'app' ? 'pulse' : 'phone'} size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--as-ink)' }}>{ch.nm}</div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>{ch.sub}</div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: ch.actual >= ch.target ? '#D1FAE5' : '#FEF3E2', color: ch.actual >= ch.target ? '#065F46' : '#92400E', fontWeight: 600 }}>
                {ch.actual >= ch.target ? '✓ 達標' : '·近標'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {ch.stats.map((s, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRight: i % 2 === 0 ? '1px solid var(--as-line-2)' : 'none', borderBottom: i < 2 ? '1px solid var(--as-line-2)' : 'none' }}>
                  <div style={{ fontSize: 10, color: 'var(--as-mute)', marginBottom: 2 }}>{s.l}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 15, color: 'var(--as-ink)' }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: s.good ? 'var(--as-success)' : 'var(--as-mute)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lifecycle Pipeline */}
      <div className="card" style={{ marginTop: 16 }} {...batchAttrs('E.總覽.Sankey')}>
        <div className="ch">
          <div>
            <h3>會員生命週期流向 · 本月</h3>
            <div className="csub">新會員 → 活躍 → 沉睡 → 流失預警 → 流失 / 挽回</div>
          </div>
        </div>

        {/* Forward flow arrows (above nodes) */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 680, position: 'relative' }}>
            {/* SVG for forward flows */}
            <svg viewBox="0 0 1000 70" style={{ width: '100%', height: 70, display: 'block' }}>
              <defs>
                {LIFECYCLE_FLOWS_FWD.map((f, i) => (
                  <marker key={i} id={`arr-f-${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={f.c} />
                  </marker>
                ))}
              </defs>
              {LIFECYCLE_FLOWS_FWD.map((f, i) => {
                const x1 = (f.from + 0.5) * (1000 / 5)
                const x2 = (f.to + 0.5) * (1000 / 5)
                const y = 62
                return (
                  <g key={i}>
                    <path
                      d={`M ${x1} ${y} C ${(x1 + x2) / 2} ${y - 38}, ${(x1 + x2) / 2} ${y - 38}, ${x2 - 12} ${y}`}
                      fill="none" stroke={f.c} strokeWidth="2"
                      strokeDasharray={f.risk ? '5 4' : 'none'}
                      markerEnd={`url(#arr-f-${i})`}
                    />
                    <g transform={`translate(${(x1 + x2) / 2}, 18)`}>
                      <rect x="-46" y="-13" width="92" height="34" rx="7" fill="#fff" stroke={f.c} strokeWidth="1.5" />
                      <text x="0" y="2" textAnchor="middle" fontSize="14" fontWeight="700" fill={f.c} fontFamily="var(--f-mono)">{f.n}</text>
                      <text x="0" y="15" textAnchor="middle" fontSize="9" fill="var(--as-mute)">{f.label} · {f.pct}%</text>
                    </g>
                  </g>
                )
              })}
            </svg>

            {/* Stage nodes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: '4px 8px' }}>
              {LIFECYCLE_STAGES.map(s => (
                <div key={s.k} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 8, background: s.c + '12', border: `1.5px solid ${s.c}30` }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.c, margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--as-ink)' }}>{s.l}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 18, color: s.c }}>{s.n.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>位</div>
                </div>
              ))}
            </div>

            {/* SVG for back flows */}
            <svg viewBox="0 0 1000 110" style={{ width: '100%', height: 100, display: 'block' }}>
              <defs>
                {LIFECYCLE_FLOWS_BACK.map((f, i) => (
                  <marker key={i} id={`arr-b-${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={f.c} />
                  </marker>
                ))}
              </defs>
              {LIFECYCLE_FLOWS_BACK.map((f, i) => {
                const x1 = (f.from + 0.5) * (1000 / 5)
                const x2 = (f.to + 0.5) * (1000 / 5)
                const y = 4
                const dy = 50 + i * 32
                return (
                  <g key={i}>
                    <path
                      d={`M ${x1} ${y} C ${x1} ${y + dy}, ${x2} ${y + dy}, ${x2 + 12} ${y}`}
                      fill="none" stroke={f.c} strokeWidth="2"
                      markerEnd={`url(#arr-b-${i})`}
                    />
                    <g transform={`translate(${(x1 + x2) / 2}, ${y + dy + 4})`}>
                      <rect x="-58" y="-13" width="116" height="26" rx="13" fill={f.c} fillOpacity="0.1" />
                      <rect x="-58" y="-13" width="116" height="26" rx="13" fill="none" stroke={f.c} strokeWidth="1" />
                      <text x="-22" y="4" textAnchor="middle" fontSize="13" fontWeight="700" fill={f.c} fontFamily="var(--f-mono)">{f.n}</text>
                      <text x="26" y="4" textAnchor="middle" fontSize="10" fill={f.c}>{f.label}</text>
                    </g>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Legend row */}
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--as-ink-2)', marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--as-line-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { c: '#16A34A', dash: false, l: '正向流動' },
            { c: '#D97706', dash: true,  l: '沉睡風險' },
            { c: '#DC2626', dash: true,  l: '積極介入' },
            { c: '#7C3AED', dash: false, l: '挽回成功' },
          ].map(leg => (
            <span key={leg.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={leg.c} strokeWidth="2" strokeDasharray={leg.dash ? '4 3' : undefined} /></svg>
              <span>{leg.l}</span>
            </span>
          ))}
          <span style={{ marginLeft: 'auto', color: 'var(--as-mute)' }}>★ 沉睡→流失預警 86 位需主動介入</span>
        </div>
      </div>

      {/* Acquisition source bar chart */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>新會員來源 · 本月 342 位</h3>
            <div className="csub">各渠道獲客貢獻</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {ACQ_SOURCES.map(s => (
            <div key={s.nm} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 120, fontSize: 12, color: 'var(--as-ink-2)', flexShrink: 0 }}>{s.nm}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--as-line-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${s.n / 98 * 100}%`, height: '100%', background: s.c, borderRadius: 4 }} />
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13, color: 'var(--as-ink)', width: 36, textAlign: 'right' }}>{s.n}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Segment Management Tab ──────────────────────────────────────────────────

function ESegments() {
  const [segGroup, setSegGroup] = useState<'ops' | 'mkt' | 'new'>('ops')
  const segments = segGroup === 'ops' ? OPS_SEGMENTS : MKT_SEGMENTS

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }} {...batchAttrs('E.分群管理')}>
        {[
          { k: 'ops', l: '營運分群' },
          { k: 'mkt', l: '行銷分群' },
          { k: 'new', l: '新建分群 +' },
        ].map(b => (
          <button
            key={b.k}
            className={`btn${segGroup === b.k ? ' primary cdefg' : ''}`}
            onClick={() => setSegGroup(b.k as 'ops' | 'mkt' | 'new')}
          >
            {b.l}
          </button>
        ))}
      </div>

      {segGroup !== 'new' && (
        <div className="seg-cards" style={{ marginTop: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {segments.map(s => (
            <div key={s.k} className={`sg ${s.cls}`}>
              <div className="hd">
                <div className="nm">{s.nm}</div>
                <div style={{ fontSize: 10, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>{s.rfm}</div>
              </div>
              <div className="cnt">
                <span className="v">{s.cnt}</span>
                <span className="p"> 位 · {s.pct}%</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--as-ink-2)', marginTop: 4 }}>{s.desc}</div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--as-line-2)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>建議: <b style={{ color: 'var(--as-cdefg)' }}>{s.act}</b></span>
                <span style={{ color: s.gr === 'up' ? 'var(--as-success)' : 'var(--as-danger)' }}>
                  {s.gr === 'up' ? '↗' : '↘'} {s.tail}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {segGroup === 'new' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginTop: 16 }}>
          {/* Condition builder */}
          <div className="card">
            <div className="ch"><h3>條件規則建立</h3><div className="csub">3 步驟建立動態分群</div></div>
            {[
              { n: 1, title: '分群名稱', content: (
                <input className="search" style={{ width: '100%', marginTop: 6 }} defaultValue="高價值休眠喚醒名單" />
              )},
              { n: 2, title: '條件規則 (符合全部條件)', content: (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    ['會員等級', '=', '高級會員'],
                    ['最近活躍', '>', '30 天'],
                    ['累積消費 LTV', '≥', 'NT$ 200,000'],
                    ['訂閱到期', '≤', '60 天'],
                  ].map(([fld, op, val], i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 10px', background: 'var(--as-bg)', borderRadius: 6, fontSize: 12 }}>
                      <span style={{ background: 'var(--as-cdefg)', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600 }}>{fld}</span>
                      <span style={{ color: 'var(--as-mute)' }}>{op}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{val}</span>
                      <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--as-mute)', cursor: 'pointer', fontSize: 14 }}>×</button>
                    </div>
                  ))}
                  <button className="btn" style={{ alignSelf: 'flex-start', marginTop: 4 }}>+ 新增條件</button>
                </div>
              )},
              { n: 3, title: '更新頻率', content: (
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {['即時', '每日 09:00', '每週一', '手動'].map((f, i) => (
                    <button key={f} className={`btn${i === 1 ? ' primary cdefg' : ''}`} style={{ fontSize: 11 }}>{f}</button>
                  ))}
                </div>
              )},
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--as-cdefg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{step.title}</div>
                  {step.content}
                </div>
              </div>
            ))}
          </div>

          {/* Real-time preview */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <div className="ch"><h3>即時預估</h3></div>
            <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 800, fontSize: 48, color: 'var(--as-cdefg)' }}>86</div>
              <div style={{ fontSize: 13, color: 'var(--as-ink-2)' }}>位會員 · 佔總會員 6.7%</div>
            </div>
            <div style={{ borderTop: '1px solid var(--as-line-2)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['平均 LTV', 'NT$ 312K'],
                ['月經常性收入', 'NT$ 184K'],
                ['預估挽回價值', <span style={{ color: 'var(--as-success)', fontWeight: 700 }}>NT$ 4.6M</span>],
                ['建議行動', '顧問致電 + 升級優惠'],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--as-mute)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v as React.ReactNode}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)' }}>
              <Icon name="sparkles" size={11} /> AI 建議:此名單與「沉睡金主」分群高度重疊 (78%) — 搭配個人化推薦獎勵，挽回率可達 <b>38%</b>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn" style={{ flex: 1 }}>儲存草稿</button>
              <button className="btn primary cdefg" style={{ flex: 1 }}>建立分群 →</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Outreach Tab ─────────────────────────────────────────────────────────────

function EOutreach({ onPickMember }: { onPickMember: (id: string) => void }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set(['M-008412', 'M-007738']))

  const toggleSel = (id: string) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const sevColor = (sev: string) => sev === 'high' ? 'var(--as-danger)' : sev === 'mid' ? 'var(--as-warning)' : 'var(--as-success)'
  const modColor = (m: string) => (m === 'A' || m === 'B') ? '#0E7A66' : 'var(--as-cdefg)'

  // P1 #6:SLA 逾期警示 — 統計即將逾期(< 24h) / 已逾期 兩數
  const urgentCount = OUTREACH_MEMBERS.filter(m => m.sla.cls === 'r' && !m.sla.overdue).length
  const overdueCount = OUTREACH_MEMBERS.filter(m => m.sla.overdue).length

  // 狀態膠囊配色
  const statusMeta = (s: string) =>
    s === 'pending'    ? { l: '未開始', bg: '#FEF3E2', fg: '#92400E' } :
    s === 'contacting' ? { l: '聯繫中', bg: '#DBEAFE', fg: '#1E40AF' } :
                         { l: '已完成', bg: '#DCFCE7', fg: '#166534' }

  return (
    <>
      {/* P1 #6:SLA 逾期 alert bar — 整頁頂部第一眼可辨 */}
      {(urgentCount + overdueCount) > 0 && (
        <div {...batchAttrs('E.主動聯繫')} style={{
          marginTop: 16, padding: '10px 14px',
          background: overdueCount > 0 ? '#FEE2E2' : '#FEF3E2',
          border: `1px solid ${overdueCount > 0 ? '#FCA5A5' : '#FCD34D'}`,
          borderLeft: `4px solid ${overdueCount > 0 ? 'var(--as-danger)' : 'var(--as-warning)'}`,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
        }}>
          <span style={{ fontSize: 18 }}>⚠</span>
          <span style={{ fontWeight: 700, color: overdueCount > 0 ? 'var(--as-danger)' : '#92400E' }}>
            {overdueCount > 0 && <>已逾期 <span style={{ fontFamily: 'var(--f-mono)' }}>{overdueCount}</span> 筆 · </>}
            {'即將逾期(< 24h) '}<span style={{ fontFamily: 'var(--f-mono)' }}>{urgentCount}</span> 筆
          </span>
          <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>· 請優先處理紅色標示列</span>
        </div>
      )}

      {/* Filter chips */}
      <div className="fb" style={{ marginTop: 16 }}>
        {OUTREACH_FILTERS.map(f => (
          <span key={f.k} className={`chip ${filter === f.k ? 'on' : ''}`} onClick={() => setFilter(f.k)}>
            {f.l}<span className="n">{f.n}</span>
          </span>
        ))}
        <span className="sp" />
        <input className="search" placeholder="會員名稱 / 編號" />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bulk-bar" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'var(--as-cdefg)', color: '#fff', borderRadius: 8, marginTop: 10, fontSize: 13 }}>
          <span className="n">{selected.size}</span> 位會員已選取
          <span className="sp" />
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>批次發送 LINE</button>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>排定撥打</button>
          <button style={{ background: '#fff', border: 'none', color: 'var(--as-cdefg)', padding: '4px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <Icon name="sparkles" size={11} /> 採納 AI 建議 →
          </button>
        </div>
      )}

      {/* Member table */}
      <div className="dt-wrap" style={{ marginTop: 12 }}>
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th style={{ width: 8 }}></th>
              <th>會員 / 編號</th>
              <th>觸發訊號</th>
              <th>SLA 緊迫度</th>
              <th>挽回估值</th>
              <th>負責人 / 狀態</th>
              <th>行動</th>
            </tr>
          </thead>
          <tbody>
            {OUTREACH_MEMBERS.map(m => (
              <tr
                key={m.id}
                onClick={() => onPickMember(m.id)}
                style={{
                  cursor: 'pointer',
                  background: m.sla.overdue ? '#FEF2F2' : selected.has(m.id) ? 'var(--as-bg)' : undefined,
                  borderLeft: m.sla.overdue ? '3px solid var(--as-danger)' : undefined,
                }}
              >
                <td onClick={e => e.stopPropagation()}>
                  <div
                    onClick={() => toggleSel(m.id)}
                    style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${selected.has(m.id) ? 'var(--as-cdefg)' : 'var(--as-line)'}`, background: selected.has(m.id) ? 'var(--as-cdefg)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, cursor: 'pointer' }}
                  >
                    {selected.has(m.id) && '✓'}
                  </div>
                </td>
                <td>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor(m.sev) }} />
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {m.nm}
                    <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px', borderRadius: 3, background: m.tier === 'g' ? '#FEF3E2' : 'var(--as-bg)', color: m.tier === 'g' ? '#92400E' : 'var(--as-mute)' }}>{m.lv}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--as-mute)' }}>{m.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--as-ink-2)', marginTop: 2 }}>{m.addr}</div>
                </td>
                <td>
                  <div style={{ fontSize: 11, color: 'var(--as-ink-2)', marginBottom: 4 }}>{m.reason}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {m.sig.slice(0, 3).map((s, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--as-bg)', border: '1px solid var(--as-line-2)' }}>
                        <span style={{ fontWeight: 700, color: modColor(s.m) }}>{s.m}</span>
                        <span style={{ color: 'var(--as-ink-2)' }}>{s.t}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 5,
                    background: m.sla.overdue ? 'var(--as-danger)' : m.sev === 'high' ? '#FEE2E2' : m.sev === 'mid' ? '#FFFBEB' : '#F0FDF4',
                    color: m.sla.overdue ? '#fff' : sevColor(m.sev),
                    fontWeight: 700,
                  }}>
                    {m.sla.overdue ? '⚠' : <Icon name="cal" size={10} />} {m.sla.txt}
                  </span>
                  <div style={{ fontSize: 10, color: 'var(--as-mute)', marginTop: 2 }}>最後聯繫 {m.last}</div>
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, color: 'var(--as-success)', fontSize: 13 }}>{m.recoverVal}</div>
                  <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>流失 {m.churn}%</div>
                </td>
                <td>
                  {(() => {
                    const sm = statusMeta(m.status)
                    return (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--as-ink)' }}>{m.owner}</div>
                        <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: sm.bg, color: sm.fg, fontWeight: 600 }}>
                          {sm.l}
                        </span>
                      </>
                    )
                  })()}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {m.actions.slice(0, 2).map((a, i) => (
                      <button key={i} className="btn" style={{ fontSize: 11, padding: '3px 8px' }}>{a}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', display: 'flex', justifyContent: 'space-between' }}>
        <span>顯示 {OUTREACH_MEMBERS.length} 位 / 共 37 位需主動聯繫會員</span>
        <span style={{ color: 'var(--as-cdefg)', cursor: 'pointer' }}>查看全部 37 位 →</span>
      </div>

      {/* P1 #7:包含關係說明 — 數字之間如何對得起來 */}
      <div style={{ marginTop: 10, padding: '10px 14px', background: '#F9FAFB', border: '1px solid var(--as-line-2)', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)', lineHeight: 1.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--as-ink)' }}>📐 數字關係</span>
          <span style={{ color: 'var(--as-mute)' }}>各 tab 與母體之間的包含關係(避免互打架)</span>
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--as-ink-2)' }}>
          主動聯繫 <b style={{ color: 'var(--as-cdefg)' }}>37 位</b> = 訂閱到期 15 + 設備異常 10 + 長期未活躍 8 + 推薦追蹤 4
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--as-ink-2)' }}>
          挽回估值 <b style={{ color: 'var(--as-success)' }}>NT$ 840K</b> = 顯示 {OUTREACH_MEMBERS.length} 位加總 650K + 其餘 27 位約 190K(平均 7.0K/位)
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--as-ink-2)' }}>
          流失預警 268 位 ⊃ 主動聯繫 37 位 ⊃ 高風險(流失 &gt; 60%) 23 位
        </div>
      </div>
    </>
  )
}

// ─── Churn Prediction Tab ─────────────────────────────────────────────────────

function EChurn({ onPickMember }: { onPickMember: (id: string) => void }) {
  return (
    <>
      {/* P1 #8:模型版本與更新日 — 政府評審常問 retrain 頻率 */}
      <div {...batchAttrs('E.流失預測')} style={{
        marginTop: 16, padding: '8px 14px',
        background: '#F5F3FF', border: '1px solid #DDD6FE', borderLeft: '3px solid var(--as-cdefg)',
        borderRadius: 6,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="sparkles" size={12} />
          <span style={{ fontWeight: 700, color: 'var(--as-cdefg)' }}>流失預測模型</span>
        </span>
        <span style={{ color: 'var(--as-ink-2)' }}>版本 <b className="mono">v3.2</b></span>
        <span style={{ color: 'var(--as-ink-2)' }}>最後更新 <b className="mono">2026/05/01</b></span>
        <span style={{ color: 'var(--as-ink-2)' }}>retrain 頻率 <b>每月</b></span>
        <span style={{ color: 'var(--as-ink-2)' }}>訓練樣本 <b className="mono">8,420</b> 位 · <b className="mono">36</b> 月歷史</span>
        <span style={{ marginLeft: 'auto', color: 'var(--as-mute)' }}>下次 retrain 2026/06/01</span>
      </div>

      {/* Model performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
        {[
          { lbl: 'AUC-ROC', val: '0.87', u: '/ 1.00', sub: '較 v3.1 +0.04', pct: 87 },
          { lbl: 'Precision', val: '82', u: '%', sub: '100 預警 → 82 真實', pct: 82 },
          { lbl: 'Recall', val: '76', u: '%', sub: '100 流失 → 76 被預警', pct: 76 },
          { lbl: '挽回 ROI', val: '5.4', u: '×', sub: '每投入 NT$1 挽回 NT$5.4', pct: 90 },
        ].map(m => (
          <div className="card" key={m.lbl}>
            <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 4 }}>{m.lbl}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 800, fontSize: 26, color: 'var(--as-ink)' }}>
              {m.val}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--as-mute)', marginLeft: 2 }}>{m.u}</span>
            </div>
            <div style={{ height: 4, background: 'var(--as-line-2)', borderRadius: 2, overflow: 'hidden', margin: '8px 0 4px' }}>
              <div style={{ width: `${m.pct}%`, height: '100%', background: 'var(--as-cdefg)' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Risk tiers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        {CHURN_TIERS.map(tier => (
          <div className="card" key={tier.label} style={{ borderTop: `3px solid ${tier.c}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: tier.c }}>{tier.label}</div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>流失機率 {tier.pctRange}</div>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 800, fontSize: 32, color: tier.c }}>{tier.count}</div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tier.members.map(mem => (
                <div
                  key={mem.id}
                  onClick={() => onPickMember(mem.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--as-bg)', borderRadius: 6, cursor: 'pointer' }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tier.c, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{mem.nm} <span className="mono" style={{ fontSize: 10, color: 'var(--as-mute)' }}>{mem.id}</span></div>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mem.reason}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13, color: tier.c, flexShrink: 0 }}>{mem.pct}%</div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: 'var(--as-mute)', textAlign: 'center', padding: '4px 0' }}>
                還有 {tier.count - tier.members.length} 位 · 查看全部 →
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What-if scenarios */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div><h3>What-If 情境模擬 · AI 推估</h3><div className="csub">不同介入策略對下季的影響</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          {[
            { cls: 'win', lbl: 'AI 推薦', nm: '為 37 位高風險會員派工 + 致電', desc: '依照主動聯繫名單,本週完成所有派工與顧問致電。', pred: 'NT$ 218K', predLbl: '預估挽回', delta: '−22%', deltaLbl: '流失降幅', conf: '87%', go: '立即執行 →' },
            { cls: '', lbl: '保守方案', nm: '僅處理 12 位高風險 (24h SLA)', desc: '優先處理迫近流失的 12 位 · 其餘維持監測。', pred: 'NT$ 96K', predLbl: '預估挽回', delta: '−9%', deltaLbl: '流失降幅', conf: '82%', go: '考慮 →' },
            { cls: 'warn', lbl: '不介入', nm: '依現況推進 · 月底評估', desc: '不主動聯繫,讓自然續訂機制運作。', pred: 'NT$ 0', predLbl: '挽回', delta: '+4%', deltaLbl: '流失升幅', conf: '74%', go: '對照組 →' },
          ].map(s => (
            <div key={s.lbl} style={{ padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${s.cls === 'win' ? 'var(--as-success)' : s.cls === 'warn' ? 'var(--as-danger)' : 'var(--as-line)'}`, background: s.cls === 'win' ? '#F0FDF4' : s.cls === 'warn' ? '#FFF5F5' : '#fff' }}>
              <div style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: s.cls === 'win' ? 'var(--as-success)' : s.cls === 'warn' ? 'var(--as-danger)' : 'var(--as-line-2)', color: s.cls ? '#fff' : 'var(--as-ink)', display: 'inline-block', fontWeight: 600, marginBottom: 6 }}>{s.lbl}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--as-ink)', marginBottom: 4 }}>{s.nm}</div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 10 }}>{s.desc}</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 800, fontSize: 16, color: s.cls === 'win' ? 'var(--as-success)' : s.cls === 'warn' ? 'var(--as-danger)' : 'var(--as-ink)' }}>{s.pred}</div>
                  <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{s.predLbl}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 800, fontSize: 16, color: s.cls === 'win' ? 'var(--as-success)' : s.cls === 'warn' ? 'var(--as-danger)' : 'var(--as-ink)' }}>{s.delta}</div>
                  <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{s.deltaLbl}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--as-line-2)', paddingTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>信心 {s.conf}</span>
                <span style={{ fontSize: 12, color: s.cls === 'win' ? 'var(--as-success)' : s.cls === 'warn' ? 'var(--as-danger)' : 'var(--as-cdefg)', fontWeight: 600, cursor: 'pointer' }}>{s.go}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Points Management Tab ────────────────────────────────────────────────────

function EPoints({ onPickMember }: { onPickMember: (id: string) => void }) {
  return (
    <>
      <div className="card" style={{ marginTop: 16 }} {...batchAttrs('E.積點管理')}>
        <div className="ch">
          <div><h3>積點系統 · 等級分布</h3><div className="csub">5 個會員等級 · 累積 / 兌換動態</div></div>
          <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>共 5,882 位</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {POINTS_BY_TIER.map(p => (
            <div key={p.tier} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, padding: '3px 8px', borderRadius: 5, border: `1.5px solid ${p.c}40`, background: p.c + '18', color: p.c, fontWeight: 700, fontSize: 12, textAlign: 'center', flexShrink: 0 }}>{p.tier}</div>
              <div style={{ width: 56, fontFamily: 'var(--f-mono)', fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{p.cnt.toLocaleString()}<span style={{ fontSize: 10, color: 'var(--as-mute)', marginLeft: 2 }}>位</span></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span>累積 {p.avg.toLocaleString()} 點</span>
                  <span style={{ color: p.c }}>已用 {p.used.toLocaleString()} ({Math.round(p.used / p.avg * 100)}%)</span>
                </div>
                <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${p.used / p.avg * 100}%`, height: '100%', background: p.c }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', display: 'flex', justifyContent: 'space-between' }}>
          <span>本月發放 <b style={{ color: 'var(--as-ink)' }}>184,200</b> · 兌換 <b style={{ color: 'var(--as-ink)' }}>96,400</b></span>
          <span>兌換率 <b style={{ color: 'var(--as-success)' }}>52.3%</b> (健康)</span>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch"><h3>積點發放與兌換趨勢</h3><div className="csub">近 6 個月</div></div>
          <svg viewBox="0 0 480 160" style={{ width: '100%', height: 170, display: 'block' }}>
            {[0, 50000, 100000, 150000, 200000].map((g, i) => (
              <g key={g}>
                <line x1="48" y1={140 - i * 30} x2="470" y2={140 - i * 30} stroke="var(--as-line-2)" strokeDasharray="2 4" />
                <text x="42" y={144 - i * 30} fontSize="9" fill="var(--as-mute)" textAnchor="end" fontFamily="var(--f-mono)">{g / 1000}k</text>
              </g>
            ))}
            {[142, 156, 168, 172, 180, 184].map((issued, i) => {
              const redeemed = [68, 74, 80, 86, 90, 96][i]
              const x = 60 + i * 70
              const y0 = 140
              const scale = 130 / 200
              return (
                <g key={i}>
                  <rect x={x - 10} y={y0 - issued * scale} width="12" height={issued * scale} fill="#4F46E5" rx="2" />
                  <rect x={x + 2} y={y0 - redeemed * scale} width="12" height={redeemed * scale} fill="#0E7A66" rx="2" />
                  <text x={x + 1} y={154} fontSize="9" fill="var(--as-mute)" textAnchor="middle" fontFamily="var(--f-mono)">{['12', '01', '02', '03', '04', '05'][i]}</text>
                </g>
              )
            })}
          </svg>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--as-ink-2)', marginTop: 6 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#4F46E5', verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }} />發放 (千點)</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#0E7A66', verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }} />兌換 (千點)</span>
          </div>
        </div>

        <div className="card">
          <div className="ch"><h3>本月積點兌換排行</h3><div className="csub">前 5 位高積點會員</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {[
              // 排行對齊 MEMBER_MASTER:#1 改劉建國(Diamond·活躍·流失 4%),避免高流失客當積點冠軍(解 #4)
              { rk: 1, nm: '劉建國', id: 'M-003355', pts: 28400, used: 12000, tier: '#A855F7' },
              { rk: 2, nm: '吳承翰', id: 'M-005208', pts: 21600, used: 8400,  tier: '#B45309' },
              { rk: 3, nm: '黃慧君', id: 'M-004119', pts: 19800, used: 6200,  tier: '#B45309' },
              { rk: 4, nm: '林雅琪', id: 'M-010055', pts: 16200, used: 4800,  tier: '#4F46E5' },
              { rk: 5, nm: '王婉真', id: 'M-009880', pts: 14000, used: 5200,  tier: '#0E7A66' },
            ].map(a => (
              <div
                key={a.id}
                onClick={() => onPickMember(a.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 6px', borderRadius: 4 }}
              >
                <div style={{ width: 20, fontFamily: 'var(--f-mono)', fontWeight: 700, color: a.rk <= 3 ? '#B45309' : 'var(--as-mute)', fontSize: 12 }}>#{a.rk}</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.tier + '18', border: `1.5px solid ${a.tier}`, color: a.tier, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{a.nm[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.nm} <span className="mono" style={{ fontSize: 10, color: 'var(--as-mute)' }}>{a.id}</span></div>
                  <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>本月使用 {a.used.toLocaleString()} 點</div>
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13 }}>{a.pts.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}


// ─── Module E Root ────────────────────────────────────────────────────────────

export function ModuleE() {
  // 預設 tab 改成「主動聯繫名單」(P1 #9):進頁第一眼看到「今天要處理什麼」
  const [tab, setTab] = useState('outreach')

  // 2026-05-28:會員 360° 已整合進 Module B 的「個人 360° 視圖」
  // Module E 內各表格 row 點擊 → 跳 /module-b 並用 router state 帶會員 ID
  const navigate = useNavigate()
  const openMemberById = (id: string) => {
    navigate('/module-b', { state: { gotoIndividual: true, memberId: id } })
  }

  return (
    <PageShell
      tk="E"
      tkClass="cdefg"
      title="會員經營"
      sub="營運模組 · 生命週期 / 聯繫 / 預測"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出</button>
          <button className="btn primary cdefg"><Icon name="sparkles" size={14} />主動聯繫</button>
        </>
      }
      tabs={[
        // 依「module-e-tab命名與順序調整.md」:依工作動線(從洞察到行動)排
        { k: 'daily',    l: '總覽',          n: null },   // 改名:日常經營 → 總覽
        { k: 'outreach', l: '主動聯繫名單',  n: 37 },
        { k: 'churn',    l: '流失預測',      n: 267 },
        { k: 'segments', l: '分群管理',      n: null },
        { k: 'points',   l: '積點管理',      n: null },
      ]}
      activeTab={tab}
      onTab={setTab}
    >
      {/* KPI 4 卡只在「總覽」顯示;其他 tab 各自有對應 hero/alert/工具列(依用戶要求 2026-05-28) */}
      {tab === 'daily' && (
        <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }} {...batchAttrs('E.母體 8420 / 挽回 840K')}>
          {MEMBER_KPIS.map(kpi => (
            <div key={kpi.lbl} className={`kpi ${kpi.accent}`}>
              <div className="lbl">{kpi.lbl}</div>
              <div className="val">{kpi.val}<span className="u">{kpi.u}</span></div>
              <div className="ft">
                <span className={`delta ${kpi.dir}`}>
                  {kpi.dir === 'up' && <Icon name="up" size={11} />}
                  {kpi.dir === 'dn' && <Icon name="down" size={11} />}
                  {kpi.delta}
                </span>
                <Sparkline data={kpi.spark} color="var(--as-cdefg)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'daily'    && <EDaily />}
      {tab === 'segments' && <ESegments />}
      {tab === 'outreach' && <EOutreach onPickMember={openMemberById} />}
      {tab === 'churn'    && <EChurn onPickMember={openMemberById} />}
      {tab === 'points'   && <EPoints onPickMember={openMemberById} />}
    </PageShell>
  )
}
