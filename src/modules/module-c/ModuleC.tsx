import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  KANBAN_COLS,
  SLA_BUCKETS,
  TECH_LOAD,
  LIST_ROWS,
  OVERDUE_REASONS,
  SLA_LEVELS,
  HOT_ISSUES,
  IOT_CARDS,
  TECH_DETAIL,
  type Ticket,
} from '../../mocks/module-c'

// ── Sub-view: 看板 ─────────────────────────────────────────────────────────────
function BoardView() {
  return (
    <>
      <div className="c-workspace">
        <div className="c-sla-strip">
          <h4>SLA 到期分佈 <span className="csub">42 張未結案工單 · 點擊查看</span></h4>
          <div className="c-sla-grid">
            {SLA_BUCKETS.map((b, i) => (
              <div key={i} className={`sb ${b.cls}`}>
                <span className="tag">{b.tag}</span>
                <span className="lbl">{b.lbl}</span>
                <span className="num">{b.num}<span className="u">張</span></span>
                <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="c-tech">
          <h4>技術人員負載 · 今日 <span className="csub">18 人線上 / 24 人</span></h4>
          <div className="c-tech-list">
            {TECH_LOAD.map(t => (
              <div className="c-tech-r" key={t.av}>
                <div className={`av ${t.st}`}>{t.av}</div>
                <div className="nm">{t.nm}<div className="role">{t.role}</div></div>
                <div className="ld">
                  <div className="tr"><div className={`fi ${t.cls}`} style={{ width: `${t.load}%` }}></div></div>
                </div>
                <div className="v">{t.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="kanban">
        {KANBAN_COLS.map(c => (
          <div key={c.k} className="col">
            <div className={`h ${c.k === 'new' ? 'r' : ''}`}>
              <span>{c.h}</span>
              <span className="n">{c.n}</span>
            </div>
            {c.tickets.map((t: Ticket) => (
              <div key={t.id} className="ticket">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="id">{t.id}</span>
                  <span className={`pri ${t.pri}`}>{t.pri.toUpperCase()}</span>
                </div>
                <div className="nm">{t.nm}</div>
                <div className="meta">
                  <Icon name="home" size={11} />
                  <span>{t.addr}</span>
                </div>
                {t.sla && (
                  <span className={`sla-dot ${t.sla.cls}`}>
                    <span className="d"></span>
                    SLA {t.sla.mins < 60 ? `${t.sla.mins} 分` : `${Math.round(t.sla.mins / 60)} 小時`}
                    {t.sla.cls === 'r' ? ' · 緊迫' : t.sla.cls === 'y' ? ' · 注意' : ''}
                  </span>
                )}
                {t.prog > 0 && (
                  <div className="bar"><i style={{ width: `${t.prog}%` }}></i></div>
                )}
                <div className="meta" style={{ justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="av">{t.ag[0]}</span>{t.ag}
                  </span>
                  <span>{t.age}</span>
                </div>
              </div>
            ))}
            {c.k === 'new' && (
              <div className="ticket" style={{ borderStyle: 'dashed', alignItems: 'center', color: 'var(--as-mute)', textAlign: 'center', display: 'flex' }}>
                <Icon name="plus" size={14} />
                <span style={{ marginLeft: 6, fontSize: 12 }}>新增工單</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// ── Sub-view: 清單 ─────────────────────────────────────────────────────────────
function ListView() {
  return (
    <>
      <div className="fb">
        <span className="chip on">全部<span className="n">42</span></span>
        <span className="chip">P1 緊急<span className="n">5</span></span>
        <span className="chip">P2 一般<span className="n">22</span></span>
        <span className="chip">P3 低<span className="n">15</span></span>
        <span style={{ width: 1, height: 18, background: 'var(--as-line)' }}></span>
        <span className="chip">我負責<span className="n">8</span></span>
        <span className="chip">已逾期<span className="n">3</span></span>
        <span className="chip">本日截止<span className="n">14</span></span>
        <span className="sp"></span>
        <input className="search" placeholder="工單編號 / 場域 / 會員" />
      </div>
      <div className="dt-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: 28 }}><input type="checkbox" /></th>
              <th>工單編號</th>
              <th>優先級</th>
              <th>主旨</th>
              <th>場域 / 對象</th>
              <th>類別</th>
              <th>SLA 剩餘</th>
              <th>負責</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {LIST_ROWS.map(r => (
              <tr key={r.id}>
                <td><input type="checkbox" /></td>
                <td className="mono">{r.id}</td>
                <td><span className={`pri ${r.pri}`}>{r.pri.toUpperCase()}</span></td>
                <td>
                  <div className="dt-nm">{r.t}</div>
                  <div className="dt-sub">{r.age}</div>
                </td>
                <td>{r.site}</td>
                <td><span className="tt">{r.cat}</span></td>
                <td>
                  <span className={`pill ${r.slaCls}`}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: r.slaCls === 'r' ? 'var(--as-danger)' : r.slaCls === 'y' ? 'var(--as-warning)' : 'var(--as-success)', marginRight: 4, verticalAlign: 'middle' }}></span>
                    {r.sla}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--as-cdefg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>
                      {r.ag[0]}
                    </span>
                    {r.ag}
                  </div>
                </td>
                <td><span className={`pill ${r.stCls}`}>{r.st}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="rowbtn"><Icon name="eye" size={12} /></button>
                    <button className="rowbtn"><Icon name="phone" size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="dt-foot">
          <span>顯示 {LIST_ROWS.length} / 42 張未結案工單</span>
          <div className="pager">
            <button>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <span className="ell">…</span>
            <button>4</button>
            <button>›</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-view: SLA 達成 ─────────────────────────────────────────────────────────
function SlaView() {
  const SLA_HOURS = [99, 98, 97, 96, 95, 96, 97, 98, 97, 96, 95, 96, 97, 98, 99, 97, 96, 95, 94, 93, 95, 96, 97, 98]
  const xw = 22

  return (
    <>
      {/* 2x3 metric grid */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
        <div className="kpi green">
          <div className="lbl">SLA 達成率</div>
          <div className="val">96.4<span className="u">%</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+0.8 pp</span><Sparkline data={[93, 94, 94, 95, 95, 96, 96, 96, 96, 96]} color="var(--as-primary)" /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">逾期工單</div>
          <div className="val">3<span className="u">張</span></div>
          <div className="ft"><span className="delta dn">+1 vs 昨</span><Sparkline data={[1, 2, 1, 2, 2, 2, 3, 2, 3, 3]} color="var(--as-danger)" /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">平均解決時間</div>
          <div className="val">3.2<span className="u">小時</span></div>
          <div className="ft"><span className="delta up"><Icon name="down" size={11} />−18 分</span><Sparkline data={[4, 4, 3.8, 3.6, 3.5, 3.4, 3.3, 3.2, 3.2, 3.2]} color="var(--as-h)" /></div>
        </div>
        <div className="kpi purple">
          <div className="lbl">P1 達成率</div>
          <div className="val">88<span className="u">%</span></div>
          <div className="ft"><span className="delta dn"><Icon name="down" size={11} />−2 pp</span><Sparkline data={[92, 91, 90, 89, 88, 88, 87, 88, 88, 88]} color="var(--as-cdefg)" /></div>
        </div>
        <div className="kpi green">
          <div className="lbl">P2 達成率</div>
          <div className="val">97<span className="u">%</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+1 pp</span><Sparkline data={[94, 95, 95, 96, 96, 97, 97, 97, 97, 97]} color="var(--as-primary)" /></div>
        </div>
        <div className="kpi green">
          <div className="lbl">P3 達成率</div>
          <div className="val">99<span className="u">%</span></div>
          <div className="ft"><span className="delta up">持續達標</span><Sparkline data={[98, 98, 99, 99, 99, 99, 99, 99, 99, 99]} color="var(--as-primary)" /></div>
        </div>
      </div>

      {/* 24h SLA trend chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <div><h3>24 小時 SLA 趨勢</h3><div className="csub">每小時達成率 · 目標 ≥ 95%</div></div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--as-mute)' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 2, background: 'var(--as-primary)', marginRight: 6, verticalAlign: 'middle' }}></span>達成率</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 2, background: 'var(--as-danger)', marginRight: 6, verticalAlign: 'middle' }}></span>目標 95%</span>
          </div>
        </div>
        <svg viewBox="0 0 600 220" style={{ width: '100%', height: 240, display: 'block' }}>
          {[95, 96, 97, 98, 99, 100].map((g, i) => (
            <g key={g}>
              <line x1="36" y1={30 + i * 30} x2="588" y2={30 + i * 30} stroke="var(--as-line-2)" strokeDasharray="2 4" />
              <text x="30" y={34 + i * 30} fontSize="10" fill="var(--as-mute)" textAnchor="end" fontFamily="var(--f-mono)">{100 - i}%</text>
            </g>
          ))}
          <line x1="36" y1={180} x2="588" y2={180} stroke="var(--as-danger)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          {(() => {
            const yFn = (v: number) => 30 + (100 - v) / 5 * 150
            const pts = SLA_HOURS.map((v, i) => `${50 + i * xw},${yFn(v)}`).join(' ')
            return (
              <>
                <polygon points={`50,${yFn(0)} ${pts} ${50 + (SLA_HOURS.length - 1) * xw},${yFn(0)}`} fill="var(--as-primary)" opacity="0.08" />
                <polyline points={pts} fill="none" stroke="var(--as-primary)" strokeWidth="2" strokeLinejoin="round" />
                {SLA_HOURS.map((v, i) => (
                  <g key={i}>
                    {v < 95 && <circle cx={50 + i * xw} cy={yFn(v)} r="3.5" fill="var(--as-danger)" />}
                    {i % 4 === 0 && <text x={50 + i * xw} y={210} fontSize="10" fill="var(--as-mute)" textAnchor="middle" fontFamily="var(--f-mono)">{String(i).padStart(2, '0')}:00</text>}
                  </g>
                ))}
              </>
            )
          })()}
        </svg>
      </div>

      {/* two-col: 逾期原因 + SLA 分級 */}
      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="ch"><h3>逾期原因分析</h3><div className="csub">本月 28 筆逾期</div></div>
          <div className="qp-bars">
            {OVERDUE_REASONS.map((d, i) => (
              <div className="qpb" key={d.nm}>
                <div className={`rk ${i < 2 ? 'top' : ''}`}>{i + 1}</div>
                <div className="nm">{d.nm}</div>
                <div className="tr"><div className={`fi ${d.c}`} style={{ width: `${d.p / 40 * 100}%` }}></div></div>
                <div className="nn">{d.n}<span className="pct">{d.p}%</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch"><h3>SLA 分級達成率</h3><div className="csub">按工單類別 · 本月</div></div>
          <div className="bd">
            {SLA_LEVELS.map(sl => (
              <div className="bdr" key={sl.nm}>
                <div className="bd-nm">
                  {sl.nm}
                  <div className="bd-sub" style={{ color: sl.v >= 95 ? 'var(--as-success)' : 'var(--as-warning)' }}>
                    {sl.v >= 95 ? '✓ 達標' : '⚠ 未達'}
                  </div>
                </div>
                <div className="bd-tr"><div className="bd-fi" style={{ width: `${sl.v}%`, background: sl.clr }}></div></div>
                <div className="bd-v mono">{sl.v}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 問題分類熱點 Top 8 */}
      <div className="card">
        <div className="ch">
          <div><h3>問題分類熱點 Top 8</h3><div className="csub">本月工單 · 依異常代碼歸戶</div></div>
          <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>category · subType</span>
        </div>
        <div className="qhot">
          {(() => {
            const maxN = Math.max(...HOT_ISSUES.map(r => r.n))
            return HOT_ISSUES.map((r, i) => (
              <div className="qhot-r" key={i}>
                <div className="qhot-rk">#{i + 1}</div>
                <div className="qhot-nm">
                  <span className="qhot-cat">{r.cat}</span>
                  <span className="qhot-sep">·</span>
                  <span className="qhot-sub">{r.sub}</span>
                </div>
                <div className="qhot-tr"><div className="qhot-fi" style={{ width: `${r.n / maxN * 100}%` }}></div></div>
                <div className="qhot-n">{r.n}</div>
              </div>
            ))
          })()}
        </div>
      </div>
    </>
  )
}

// ── Sub-view: IoT + KPI 分流 ───────────────────────────────────────────────────
function IoTKpiView() {
  const urgencyLabel = (u: 'high' | 'mid' | 'low') =>
    u === 'high' ? '高緊急' : u === 'mid' ? '中' : '低'
  const urgencyCls = (u: 'high' | 'mid' | 'low') =>
    u === 'high' ? 'r' : u === 'mid' ? 'y' : 'g'
  const statusLabel = (s: 'pending' | 'dispatched' | 'resolved') =>
    s === 'pending' ? '待處理' : s === 'dispatched' ? '已派工' : '已解決'
  const statusCls = (s: 'pending' | 'dispatched' | 'resolved') =>
    s === 'pending' ? 'r' : s === 'dispatched' ? 'y' : 'g'

  return (
    <>
      {/* IoT 主動服務 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <div>
            <h3>IoT 主動服務</h3>
            <div className="csub">設備自動觸發 · 系統主動開單 · 5 筆待確認</div>
          </div>
          <button className="btn primary cdefg" style={{ fontSize: 12 }}>
            <Icon name="plus" size={13} />全部指派
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {IOT_CARDS.map(card => (
            <div key={card.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 16,
              padding: '14px 16px',
              border: '1px solid var(--as-line)',
              borderRadius: 8,
              background: card.urgency === 'high' ? 'rgba(220,38,38,0.03)' : '#fff',
              borderLeftWidth: 3,
              borderLeftColor: card.urgency === 'high' ? 'var(--as-danger)' : card.urgency === 'mid' ? 'var(--as-warning)' : 'var(--as-success)',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--as-mute)' }}>{card.id}</span>
                  <span className={`pill ${urgencyCls(card.urgency)}`}>{urgencyLabel(card.urgency)}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{card.device}</div>
                <div style={{ fontSize: 12, color: 'var(--as-mute)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="home" size={11} />{card.site}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--as-ink-2)', marginBottom: 4 }}>{card.trigger}</div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>觸發時間 · {card.since}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span className={`pill ${statusCls(card.status)}`}>{statusLabel(card.status)}</span>
                <button className="rowbtn"><Icon name="arrow" size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 顧問 KPI vs 客服 KPI */}
      <div className="two-col">
        <div className="card">
          <div className="ch">
            <div>
              <h3>顧問 KPI</h3>
              <div className="csub">本月績效 · 陳怡君顧問</div>
            </div>
            <span className={`pill g`}>達標</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {[
              { nm: '主動聯繫完成率', v: 87, tgt: 80, unit: '%', cls: 'g' },
              { nm: '客戶滿意度均值', v: 4.8, tgt: 4.5, unit: '/ 5.0', cls: 'g' },
              { nm: '挽回商機估值', v: 218, tgt: 200, unit: 'K', cls: 'g' },
              { nm: '工單首次解決率', v: 82, tgt: 85, unit: '%', cls: 'y' },
              { nm: '超時工單數', v: 3, tgt: 2, unit: '張', cls: 'r' },
            ].map(m => (
              <div key={m.nm} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--as-ink-2)' }}>{m.nm}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {m.v}{m.unit}
                    <span style={{ fontSize: 10, color: 'var(--as-mute)', fontWeight: 400, marginLeft: 4 }}>目標 {m.tgt}{m.unit}</span>
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (m.v / m.tgt) * 80)}%`,
                    height: '100%',
                    background: m.cls === 'g' ? 'var(--as-success)' : m.cls === 'y' ? 'var(--as-warning)' : 'var(--as-danger)',
                    borderRadius: 3,
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div>
              <h3>客服 KPI</h3>
              <div className="csub">本月整體 · 全客服團隊</div>
            </div>
            <span className={`pill y`}>部分達標</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {[
              { nm: 'SLA 整體達成率', v: 96.4, tgt: 95, unit: '%', cls: 'g' },
              { nm: '平均首次回應時間', v: 42, tgt: 60, unit: '分鐘', cls: 'g' },
              { nm: '工單日均處理量', v: 14.2, tgt: 12, unit: '張', cls: 'g' },
              { nm: '升級工單率', v: 8.4, tgt: 5, unit: '%', cls: 'r' },
              { nm: '客戶重複報修率', v: 12, tgt: 10, unit: '%', cls: 'y' },
            ].map(m => (
              <div key={m.nm} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--as-ink-2)' }}>{m.nm}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {m.v}{m.unit}
                    <span style={{ fontSize: 10, color: 'var(--as-mute)', fontWeight: 400, marginLeft: 4 }}>目標 {m.tgt}{m.unit}</span>
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (m.v / m.tgt) * 80)}%`,
                    height: '100%',
                    background: m.cls === 'g' ? 'var(--as-success)' : m.cls === 'y' ? 'var(--as-warning)' : 'var(--as-danger)',
                    borderRadius: 3,
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-view: 技術人員 ─────────────────────────────────────────────────────────
function TechView() {
  return (
    <>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi purple">
          <div className="lbl">技術團隊規模</div>
          <div className="val">18<span className="u">/ 24</span></div>
          <div className="ft"><span className="delta">75% 在線</span><Sparkline data={[14, 15, 16, 17, 18, 18, 18, 18, 18, 18]} color="var(--as-cdefg)" /></div>
        </div>
        <div className="kpi green">
          <div className="lbl">平均負載率</div>
          <div className="val">58<span className="u">%</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+4 pp</span><Sparkline data={[50, 52, 54, 55, 56, 57, 57, 58, 58, 58]} color="var(--as-primary)" /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">本週工時 (合計)</div>
          <div className="val">142<span className="u">小時</span></div>
          <div className="ft"><span className="delta">5 人逼近上限</span><Sparkline data={[120, 125, 128, 130, 135, 138, 140, 141, 142, 142]} color="var(--as-h)" /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">滿意度均值</div>
          <div className="val">4.8<span className="u">/ 5.0</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+0.1</span><Sparkline data={[4.5, 4.6, 4.6, 4.7, 4.7, 4.7, 4.8, 4.8, 4.8, 4.8]} color="var(--as-danger)" /></div>
        </div>
      </div>

      <div className="dt-wrap" style={{ marginTop: 16 }}>
        <table className="dt">
          <thead>
            <tr>
              <th>技術人員</th>
              <th>角色 · 區域</th>
              <th>技能</th>
              <th>進行中</th>
              <th>本週完成</th>
              <th>工時</th>
              <th>負載</th>
              <th>滿意度</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {TECH_DETAIL.map(t => (
              <tr key={t.av}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--as-cdefg)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, position: 'relative',
                    }}>
                      {t.av}
                      <span style={{
                        position: 'absolute', right: -1, bottom: -1,
                        width: 9, height: 9, borderRadius: '50%',
                        background: t.st === 'off' ? 'var(--as-mute-2)' : t.st === 'busy' ? 'var(--as-warning)' : 'var(--as-success)',
                        border: '1.5px solid #fff',
                      }}></span>
                    </div>
                    <div className="dt-nm">{t.nm}</div>
                  </div>
                </td>
                <td>
                  <div className="dt-nm" style={{ fontSize: 13 }}>{t.role}</div>
                  <div className="dt-sub">{t.area}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {t.skill.map(s => <span key={s} className="tt">{s}</span>)}
                  </div>
                </td>
                <td className="mono"><b>{t.on}</b></td>
                <td className="mono">{t.done}</td>
                <td className="mono">{t.hours} h</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${t.load}%`, height: '100%',
                        background: t.cls === 'r' ? 'var(--as-danger)' : t.cls === 'y' ? 'var(--as-warning)' : 'var(--as-success)',
                      }}></div>
                    </div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}>{t.load}%</span>
                  </div>
                </td>
                <td className="mono">{t.sat}<span style={{ color: '#F59E0B', marginLeft: 4 }}>★</span></td>
                <td><button className="rowbtn"><Icon name="cal" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ModuleC() {
  const [tab, setTab] = useState('iot-kpi')

  return (
    <PageShell
      tk="C"
      tkClass="cdefg"
      title="服務管理"
      sub="營運模組 · 工單 / 派工 / SLA"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出</button>
          <button className="btn primary cdefg"><Icon name="plus" size={14} />新增工單</button>
        </>
      }
      tabs={[
        { k: 'board',   l: '看板',         n: 42 },
        { k: 'list',    l: '清單' },
        { k: 'sla',     l: 'SLA 達成' },
        { k: 'iot-kpi', l: 'IoT + KPI 分流' },
        { k: 'tech',    l: '技術人員',     n: 18 },
      ]}
      activeTab={tab}
      onTab={setTab}
    >
      {/* KPI cards — always visible above tabs */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi purple">
          <div className="lbl">待處理工單</div>
          <div className="val">42<span className="u">張</span></div>
          <div className="ft"><span className="delta dn"><Icon name="down" size={11} />−6 vs 昨日</span><Sparkline data={[55, 52, 50, 48, 46, 45, 44, 43, 42, 42]} color="var(--as-cdefg)" /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">逾期工單</div>
          <div className="val">3<span className="u">張</span></div>
          <div className="ft"><span className="delta dn"><Icon name="up" size={11} />+1</span><Sparkline data={[1, 2, 1, 2, 2, 2, 3, 2, 3, 3]} color="var(--as-danger)" /></div>
        </div>
        <div className="kpi green">
          <div className="lbl">SLA 達成率</div>
          <div className="val">96.4<span className="u">%</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+0.8%</span><Sparkline data={[93, 94, 94, 95, 95, 96, 96, 96, 96, 96]} color="var(--as-primary)" /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">平均解決時間</div>
          <div className="val">3.2<span className="u">小時</span></div>
          <div className="ft"><span className="delta up"><Icon name="down" size={11} />−18 分</span><Sparkline data={[4, 4, 3.8, 3.6, 3.5, 3.4, 3.3, 3.2, 3.2, 3.2]} color="var(--as-h)" /></div>
        </div>
      </div>

      {/* Filter bar shown on board/list tabs */}
      {(tab === 'board' || tab === 'list') && (
        <div className="fb" style={{ marginTop: 16 }}>
          <span className="chip on">全部<span className="n">42</span></span>
          <span className="chip">P1 緊急<span className="n">5</span></span>
          <span className="chip">P2 一般<span className="n">22</span></span>
          <span className="chip">P3 低<span className="n">15</span></span>
          <span style={{ width: 1, height: 18, background: 'var(--as-line)' }}></span>
          <span className="chip">我負責的<span className="n">8</span></span>
          <span className="chip">我團隊<span className="n">23</span></span>
          <span className="sp"></span>
          <input className="search" placeholder="工單編號 / 場域 / 會員" />
        </div>
      )}

      {tab === 'board'   && <BoardView />}
      {tab === 'list'    && <ListView />}
      {tab === 'sla'     && <SlaView />}
      {tab === 'iot-kpi' && <IoTKpiView />}
      {tab === 'tech'    && <TechView />}
    </PageShell>
  )
}
