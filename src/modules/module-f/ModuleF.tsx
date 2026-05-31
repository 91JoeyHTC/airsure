import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import { batchAttrs } from '../../components/ui/BatchAttrs'
import {
  REVENUE_KPIS,
  CUSTOMER_SOURCES,
  REFERRAL_FUNNEL,
  SUB_PLANS,
  RENEWAL_FUNNEL,
  SALES_CHANNELS,
  SEGMENT_LTVS,
  TOP_CUSTOMERS,
  GOALS,
} from '../../mocks/module-f'

// ── Sub-view: 客戶類型 ─────────────────────────────────────────────────────────
function CustomerTypeView() {
  const maxFunnelN = REFERRAL_FUNNEL[0].n

  return (
    <>
      {/* 4 large customer-type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }} {...batchAttrs('F.客戶類型')}>
        {CUSTOMER_SOURCES.map(src => (
          <div key={src.k} className="card" style={{ borderTop: `3px solid ${src.clr}`, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                background: src.tint, color: src.clr,
                padding: '2px 8px', borderRadius: 20,
              }}>
                {src.nm}
              </span>
              {src.flagship && (
                <span style={{ fontSize: 10, color: src.clr }}>★ 核心</span>
              )}
              {src.isLead && (
                <span style={{ fontSize: 10, color: src.clr }}>潛力</span>
              )}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--as-ink)', marginBottom: 2 }}>
              {src.isLead ? `預估 NT$ ${src.rev}M` : `NT$ ${src.rev}M`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--as-mute)', marginBottom: 10 }}>
              {src.isLead ? `${src.custs.toLocaleString()} qualified leads` : `${src.custs.toLocaleString()} 人`}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--as-ink-2)' }}>
                佔比 {src.pct}%
              </span>
              {!src.isLead && (
                <span style={{ fontSize: 12, fontWeight: 600, color: src.dir === 'up' ? 'var(--as-success)' : 'var(--as-danger)' }}>
                  {src.dir === 'up' ? '↑' : '↓'} +{src.yoy}% YoY
                </span>
              )}
            </div>
            <Sparkline data={[src.mom, src.mom * 1.1, src.mom * 0.9, src.rev * 0.8, src.rev * 0.85, src.rev * 0.9, src.rev * 0.95, src.rev]} color={src.clr} />
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--as-ink-2)', lineHeight: 1.4 }}>
              {src.sig}
            </div>
          </div>
        ))}
      </div>

      {/* 推薦轉換漏斗 */}
      <div className="card" {...batchAttrs('F.推薦轉換漏斗')}>
        <div className="ch">
          <div>
            <h3>推薦轉換漏斗</h3>
            <div className="csub">健康證書社交分享 · 全渠道轉換路徑</div>
          </div>
          <span className="chip">本月累計</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, padding: '12px 0' }}>
          {REFERRAL_FUNNEL.map((step, i) => {
            const barW = Math.max(10, (step.n / maxFunnelN) * 100)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {i > 0 && (
                  <div style={{ position: 'absolute', left: 0, top: 24, fontSize: 18, color: 'var(--as-mute)' }}>›</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: step.c, marginBottom: 4 }}>
                  {step.n.toLocaleString()}
                </div>
                {step.pct !== 100 && (
                  <div style={{ fontSize: 10, color: 'var(--as-mute)', marginBottom: 6 }}>
                    {step.pct}%
                  </div>
                )}
                <div style={{
                  width: `${barW}%`, height: 36,
                  background: step.c, borderRadius: 4, opacity: 0.85,
                  minWidth: 32,
                }}></div>
                <div style={{ fontSize: 11, color: 'var(--as-ink-2)', marginTop: 8, textAlign: 'center' }}>
                  {step.lbl}
                </div>
                {step.note && (
                  <div style={{ fontSize: 10, color: 'var(--as-mute)', textAlign: 'center', marginTop: 2 }}>
                    {step.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Sub-view: 訂閱結構 ─────────────────────────────────────────────────────────
function SubscriptionView() {
  const totalPlans = SUB_PLANS.reduce((s, p) => s + p.count, 0)

  return (
    <>
      {/* Subscription plan breakdown */}
      <div className="card" style={{ marginBottom: 16 }} {...batchAttrs('F.訂閱結構')}>
        <div className="ch">
          <div><h3>訂閱方案分佈</h3><div className="csub">共 {totalPlans.toLocaleString()} 位訂閱用戶</div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
          {SUB_PLANS.map(plan => {
            const pct = Math.round((plan.count / totalPlans) * 100)
            return (
              <div key={plan.nm}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: 'var(--as-ink)' }}>{plan.nm}</span>
                  <span style={{ color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>
                    {plan.count.toLocaleString()} 位 · {plan.px} · {pct}%
                  </span>
                </div>
                <div style={{ height: 10, background: 'var(--as-line-2)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: plan.c, borderRadius: 5 }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 90天續約漏斗 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <div><h3>90 天續約漏斗</h3><div className="csub">整體續約率 71.9%</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: '12px 0' }}>
          {RENEWAL_FUNNEL.map((step, i) => {
            const h = Math.max(20, step.pct * 1.4)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: step.c, marginBottom: 4 }}>{step.n.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: 'var(--as-mute)', marginBottom: 6 }}>{step.pct}%</div>
                <div style={{ width: '80%', height: h, background: step.c, borderRadius: 4, opacity: 0.85 }}></div>
                <div style={{ fontSize: 11, marginTop: 8, textAlign: 'center', color: 'var(--as-ink-2)' }}>{step.lbl}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Plan comparison table */}
      <div className="card">
        <div className="ch"><h3>方案比較</h3></div>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th>方案</th>
                <th>人數</th>
                <th>定價</th>
                <th>佔比</th>
                <th>佔總 ARR</th>
              </tr>
            </thead>
            <tbody>
              {SUB_PLANS.map(plan => {
                const pct = Math.round((plan.count / totalPlans) * 100)
                return (
                  <tr key={plan.nm}>
                    <td><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: plan.c, marginRight: 8 }}></span>{plan.nm}</td>
                    <td className="mono">{plan.count.toLocaleString()}</td>
                    <td className="mono">{plan.px}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--as-line-2)', borderRadius: 3 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: plan.c, borderRadius: 3 }}></div>
                        </div>
                        <span className="mono" style={{ fontSize: 12, minWidth: 32 }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="mono">{Math.round(pct * 0.9)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ── Sub-view: 通路與客群 ───────────────────────────────────────────────────────
function ChannelView() {
  const maxRev = Math.max(...SALES_CHANNELS.map(c => c.rev))

  return (
    <>
      {/* Sales channel bar chart */}
      <div className="card" style={{ marginBottom: 16 }} {...batchAttrs('F.通路與客群')}>
        <div className="ch">
          <div><h3>銷售通路績效</h3><div className="csub">本月營收 (萬元) · 6 個通路</div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
          {SALES_CHANNELS.map(ch => (
            <div key={ch.nm}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={ch.icon} size={13} />
                  <span style={{ fontWeight: 600 }}>{ch.nm}</span>
                </span>
                <span style={{ color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>
                  NT$ {ch.rev}M · 轉換率 {ch.convRate}% ·
                  <span style={{ color: ch.mom >= 0 ? 'var(--as-success)' : 'var(--as-danger)', marginLeft: 4 }}>
                    {ch.mom >= 0 ? '+' : ''}{ch.mom}% MoM
                  </span>
                </span>
              </div>
              <div style={{ height: 10, background: 'var(--as-line-2)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${(ch.rev / maxRev) * 100}%`, height: '100%', background: ch.c, borderRadius: 5 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer segment LTV */}
      <div className="card">
        <div className="ch">
          <div><h3>客群 LTV 分析</h3><div className="csub">按客群分類 · 終身價值</div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
          {SEGMENT_LTVS.map(seg => (
            <div key={seg.nm}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--as-ink)' }}>{seg.nm}</span>
                <span style={{ color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>
                  LTV {seg.ltv} · 佔收入 {seg.revPct} · 佔比 {seg.pct}
                </span>
              </div>
              <div style={{ height: 10, background: 'var(--as-line-2)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: seg.pct, height: '100%', background: seg.c, borderRadius: 5 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Sub-view: Top客戶 ─────────────────────────────────────────────────────────
function TopCustomerView() {
  const tierLabel = (tier: string) => {
    switch (tier) {
      case 'corporate': return '法人'
      case 'medical': return '醫療'
      case 'premium': return '高級'
      default: return '標準'
    }
  }
  const tierClr = (tier: string) => {
    switch (tier) {
      case 'corporate': return '#4F46E5'
      case 'medical': return '#0E7A66'
      case 'premium': return '#D97706'
      default: return '#9CA3AF'
    }
  }

  return (
    <div className="card" {...batchAttrs('F.Top客戶')}>
      <div className="ch">
        <div><h3>Top 客戶排名</h3><div className="csub">依 LTV 排序 · 顯示前 10 名</div></div>
        <input className="search" placeholder="搜尋客戶..." />
      </div>
      <div className="dt-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>#</th>
              <th>客戶名稱</th>
              <th>類型</th>
              <th>場域</th>
              <th>設備數</th>
              <th>LTV</th>
              <th>本年度</th>
              <th>訂閱狀態</th>
              <th>最後聯繫</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {TOP_CUSTOMERS.slice(0, 10).map(c => (
              <tr key={c.rank} style={{ background: c.alert ? 'rgba(220,38,38,0.02)' : undefined }}>
                <td className="mono" style={{ fontWeight: 700 }}>{c.rank}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: tierClr(c.tier) + '20',
                      color: tierClr(c.tier),
                      padding: '1px 6px', borderRadius: 10,
                    }}>
                      {tierLabel(c.tier)}
                    </span>
                    <span style={{ fontWeight: 600 }}>{c.nm}</span>
                    {c.alert && <span style={{ fontSize: 10, color: 'var(--as-danger)' }}>⚠</span>}
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--as-mute)' }}>{c.type}</td>
                <td className="mono">{c.sites}</td>
                <td className="mono">{c.devices}</td>
                <td className="mono" style={{ fontWeight: 600 }}>
                  NT$ {(c.ltv / 10000).toFixed(0)}萬
                </td>
                <td className="mono">
                  NT$ {(c.thisYear / 10000).toFixed(1)}萬
                </td>
                <td>
                  <span className={`pill ${c.alert ? 'r' : 'g'}`}>{c.subStatus}</span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--as-mute)' }}>{c.lastContact}</td>
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
          <span>顯示 10 / {TOP_CUSTOMERS.length} 位客戶</span>
        </div>
      </div>
    </div>
  )
}

// ── Sub-view: 目標達成 ─────────────────────────────────────────────────────────
function GoalView() {
  const clrMap: Record<string, string> = {
    g: 'var(--as-success)',
    y: 'var(--as-warning)',
    r: 'var(--as-danger)',
    mute: 'var(--as-mute)',
  }

  return (
    <div className="card" {...batchAttrs('F.目標達成')}>
      <div className="ch">
        <div><h3>本月目標達成</h3><div className="csub">5 項關鍵指標 · 即時追蹤</div></div>
        <span className="chip">Q2 2026</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '8px 0' }}>
        {GOALS.map(g => (
          <div key={g.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{g.label}</span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--f-mono)' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: clrMap[g.cls] }}>
                  {g.current}{g.unit}
                </span>
                <span style={{ fontSize: 12, color: 'var(--as-mute)', marginLeft: 6 }}>
                  / 目標 {g.target}{g.unit}
                </span>
              </div>
            </div>
            <div style={{ height: 12, background: 'var(--as-line-2)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${g.pct}%`, height: '100%',
                background: clrMap[g.cls],
                borderRadius: 6,
                transition: 'width 0.4s ease',
              }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--as-mute)', marginTop: 4 }}>
              <span style={{ color: clrMap[g.cls], fontWeight: 600 }}>{g.pct}% 達成</span>
              <span>目標 100%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ModuleF() {
  const [tab, setTab] = useState('customer-type')

  return (
    <PageShell
      tk="F"
      tkClass="cdefg"
      title="營收分析"
      sub="營運模組 · 客戶類型 / 訂閱 / 通路"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出報告</button>
          <button className="btn primary cdefg"><Icon name="target" size={14} />設定目標</button>
        </>
      }
      tabs={[
        { k: 'customer-type', l: '客戶類型' },
        { k: 'subscription',  l: '訂閱結構' },
        { k: 'channel',       l: '通路與客群' },
        { k: 'top-customer',  l: 'Top客戶' },
        { k: 'goal',          l: '目標達成' },
      ]}
      activeTab={tab}
      onTab={setTab}
    >
      {/* KPI cards */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }} {...batchAttrs('F.KPI')}>
        {REVENUE_KPIS.map(k => (
          <div key={k.lbl} className={`kpi ${k.accent}`}>
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}<span className="u">{k.u}</span></div>
            <div className="ft">
              <span className={`delta ${k.dir === 'up' ? 'up' : 'dn'}`}>
                <Icon name={k.dir === 'up' ? 'up' : 'down'} size={11} />{k.delta}
              </span>
              <Sparkline data={k.spark} color={`var(--as-${k.accent === 'purple' ? 'cdefg' : k.accent === 'orange' ? 'h' : 'primary'})`} />
            </div>
          </div>
        ))}
      </div>

      {tab === 'customer-type' && <CustomerTypeView />}
      {tab === 'subscription'  && <SubscriptionView />}
      {tab === 'channel'       && <ChannelView />}
      {tab === 'top-customer'  && <TopCustomerView />}
      {tab === 'goal'          && <GoalView />}
    </PageShell>
  )
}
