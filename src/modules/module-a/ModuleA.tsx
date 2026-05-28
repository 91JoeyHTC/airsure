import { useState, Fragment } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  FIELDS_A_FULL,
  FIELD_DELTAS,
  REGION_HEALTH,
  SITE_TYPES,
  AIR_QUALITY_DIST,
  HUMIDITY_DIST,
  AHI_TREND,
  SITE_TREND,
  SEGMENTS_A,
  CONSUMABLE_CATS,
  URGENT_DEVICES,
  CATEGORIES,
  CATEGORY_DIST,
  DISPOSITION_ROLLUP,
  DISPOSITION_META,
  TODAY_POWER_ON,
  DHI_ATTRIBUTION,
  INDOOR_OUTDOOR,
  UPSELL_POOL,
  CATEGORY_FLOWS,
  CATEGORY_FLOW_SUMMARY,
  FIELD_OUTDOOR_PM25,
  URGENT_DEVICE_TO_FIELD,
  FIELD_DETAIL_WANG,
  type CatId,
  type FieldRecord,
  type FieldDetail,
} from '../../mocks/module-a'

/* ── helpers ─────────────────────────────────────────── */
type ToneKey = 'i' | 'n' | 'w' | 'r'
interface Tone { cls: ToneKey; lbl: string; clr: string; bg: string }

function tone(pct: number): Tone {
  if (pct < 20) return { cls: 'i', lbl: '立即處理', clr: 'var(--as-danger)', bg: '#FEE4E2' }
  if (pct < 30) return { cls: 'n', lbl: '近期處理', clr: 'var(--as-warning)', bg: '#FEF0C7' }
  if (pct < 50) return { cls: 'w', lbl: '持續觀察', clr: '#4F46E5', bg: '#EEF0FF' }
  return { cls: 'r', lbl: '更換備料', clr: 'var(--as-mute)', bg: '#F3F4F6' }
}

/* ── 整體層 ─────────────────────────────────────────── */
type HeatDim = 'health' | 'type' | 'gap'

function AOverview({ onJump, onOpenDetail }: { onJump: () => void; onOpenDetail: (fid: string) => void }) {
  const [heatDim, setHeatDim] = useState<HeatDim>('health')

  const catMeta = (id: CatId) => CATEGORIES.find((c) => c.id === id)!
  const okRow = DISPOSITION_ROLLUP.find((d) => d.key === 'ok')!
  const attnRow = DISPOSITION_ROLLUP.find((d) => d.key === 'attention')!
  const warnRow = DISPOSITION_ROLLUP.find((d) => d.key === 'warning')!

  const heatLegend: Record<HeatDim, { lbls: { c: string; t: string }[]; tip: string }> = {
    health: {
      lbls: [
        { c: 'var(--as-success)', t: '≥ 85 良好' },
        { c: 'var(--as-warning)', t: '75–84 普通' },
        { c: 'var(--as-danger)', t: '< 75 需關注' },
      ],
      tip: '本月 7 日平均健康度分數',
    },
    type: {
      lbls: [
        { c: 'var(--as-success)', t: '警告 < 2%' },
        { c: 'var(--as-warning)', t: '2–4%' },
        { c: 'var(--as-danger)', t: '> 4% 警告偏高' },
      ],
      tip: '警告處理(類型⑥ 雙重介入型)占該區比例 · 找出地區性風險聚落',
    },
    gap: {
      lbls: [
        { c: 'var(--as-success)', t: '≥ 60% 高貢獻' },
        { c: 'var(--as-warning)', t: '50–60%' },
        { c: 'var(--as-danger)', t: '< 50% 低貢獻' },
      ],
      tip: '室內外落差 — 機器擋掉的 PM2.5 比例(待接環境部 API,目前為示意)',
    },
  }

  return (
    <>
      {/* KPI 卡 */}
      <div className="kpi-row">
        {/* ① 使用中場域 */}
        <div className="kpi green">
          <div className="lbl">使用中場域</div>
          <div className="val">1,284<span className="u">處</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+12 MoM</span>
            <Sparkline data={SITE_TREND.slice(-8)} color="var(--as-primary)" />
          </div>
        </div>

        {/* ② 連網裝置 — 副標改開機率 */}
        <div className="kpi purple">
          <div className="lbl">連網裝置 · 今日開機率</div>
          <div className="val">4,832<span className="u">台</span></div>
          <div className="ft">
            <span className="delta up">
              <Icon name="zap" size={11} />
              {TODAY_POWER_ON.pct}% 開機 · {TODAY_POWER_ON.active.toLocaleString()} 台
            </span>
            <Sparkline data={[83.2, 84.1, 85.4, 86.2, 86.8, 87.1, 87.4, 87.5]} color="var(--as-cdefg)" />
          </div>
        </div>

        {/* ③ 平均 DHI — 加機器貢獻歸因 */}
        <div className="kpi orange">
          <div className="lbl">今日平均 DHI</div>
          <div className="val">82<span className="u">分</span></div>
          <div className="ft">
            <span className="delta up">
              <Icon name="up" size={11} />機器貢獻 +{DHI_ATTRIBUTION.contributedBy} 分
            </span>
            <Sparkline data={AHI_TREND} color="var(--as-warning)" />
          </div>
        </div>

        {/* ④ 六大類型處置分布(取代「需注意場域 42」) */}
        <div className="kpi red">
          <div className="lbl">類型處置分布</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--as-danger)', lineHeight: 1 }}>{warnRow.n}</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>戶需警告處理({warnRow.pct}%)</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 10, background: 'var(--as-line-2)' }}>
            <div style={{ width: `${okRow.pct}%`, background: 'var(--as-success)' }} title={`OK ${okRow.n} 戶`}></div>
            <div style={{ width: `${attnRow.pct}%`, background: 'var(--as-warning)' }} title={`建議處理 ${attnRow.n} 戶`}></div>
            <div style={{ width: `${warnRow.pct}%`, background: 'var(--as-danger)' }} title={`警告處理 ${warnRow.n} 戶`}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--as-ink-2)', marginTop: 6, fontFamily: 'var(--f-mono)' }}>
            <span><span style={{ color: 'var(--as-success)' }}>●</span> OK {okRow.n}</span>
            <span><span style={{ color: 'var(--as-warning)' }}>●</span> 建議 {attnRow.n}</span>
            <span><span style={{ color: 'var(--as-danger)' }}>●</span> 警告 {warnRow.n}</span>
          </div>
        </div>
      </div>

      {/* 六大類型分布 + 類型流動(Phase 1.5) */}
      <div className="two-col" style={{ marginTop: 16 }}>
        {/* 六大類型分布 */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>六大類型分布</h3>
              <div className="csub">方案 C 業務端代號 · 全 1,284 場域 · 直接對應派工優先級</div>
            </div>
            <span style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--as-mute)' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-success)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>OK</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-warning)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>建議</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-danger)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>警告</span>
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {CATEGORY_DIST.map((d) => {
              const meta = catMeta(d.id)
              const disp = DISPOSITION_META[meta.disposition]
              const barPct = Math.min(100, d.pct * 3)
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 6, background: meta.bg,
                    color: meta.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>{d.id}</div>
                  <div style={{ width: 100, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--as-ink)', lineHeight: 1.2 }}>{meta.code}</div>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{meta.identity}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ height: 8, background: 'var(--as-line-2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${barPct}%`, height: '100%', background: meta.color }}></div>
                    </div>
                  </div>
                  <div style={{ width: 72, textAlign: 'right', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{d.n}</span>
                    <span style={{ fontSize: 10, color: 'var(--as-mute)', marginLeft: 4 }}>{d.pct}%</span>
                  </div>
                  <span className={`pill ${disp.pill}`} style={{ flexShrink: 0 }}>{disp.label}</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.6 }}>
            <b style={{ color: 'var(--as-ink-2)' }}>派工解讀:</b>
            OK 類({okRow.n} 戶)維持證書節奏 · 建議類({attnRow.n} 戶)推 CS 系列定向 upsell · 警告類({warnRow.n} 戶)CS 一體機優先介入
          </div>
        </div>

        {/* 類型流動 */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>類型流動 · 本月遷移</h3>
              <div className="csub">每週類型快照 · 已累積 {CATEGORY_FLOW_SUMMARY.snapshotWeeks} 週</div>
            </div>
            <span className="pill g" style={{ background: '#E0F2FE', borderColor: '#7DD3FC', color: '#075985' }}>Phase 1.5</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8, marginBottom: 12 }}>
            <div style={{ padding: 10, background: 'var(--as-success-tint)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>本月改善</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--as-success)', marginTop: 2 }}>▲ {CATEGORY_FLOW_SUMMARY.improved}</div>
            </div>
            <div style={{ padding: 10, background: 'var(--as-danger-tint)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>本月惡化</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--as-danger)', marginTop: 2 }}>▼ {CATEGORY_FLOW_SUMMARY.worsened}</div>
            </div>
            <div style={{ padding: 10, background: 'var(--as-bg)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>淨變動</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--as-ink)', marginTop: 2 }}>
                {CATEGORY_FLOW_SUMMARY.net > 0 ? '+' : ''}{CATEGORY_FLOW_SUMMARY.net}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {CATEGORY_FLOWS.map((flow, i) => {
              const from = catMeta(flow.from)
              const to = catMeta(flow.to)
              const isUp = flow.dir === 'up'
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                  background: isUp ? 'var(--as-success-tint)' : 'var(--as-danger-tint)',
                  borderRadius: 6, fontSize: 11,
                }}>
                  <span style={{ width: 18, height: 18, borderRadius: 4, background: from.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{from.id}</span>
                  <span style={{ color: 'var(--as-ink-2)', minWidth: 0 }}>{from.code}</span>
                  <Icon name="arrow" size={11} />
                  <span style={{ width: 18, height: 18, borderRadius: 4, background: to.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{to.id}</span>
                  <span style={{ color: 'var(--as-ink-2)' }}>{to.code}</span>
                  <span style={{ flex: 1 }}></span>
                  <span className="mono" style={{ fontWeight: 600, color: isUp ? 'var(--as-success)' : 'var(--as-danger)' }}>
                    {isUp ? '▲' : '▼'} {flow.n} 戶
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* upsell 機會池 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>upsell 機會池 · 對應 CS 系列產品訴求</h3>
            <div className="csub">把「分類」變成「營收」 — 三類目標族群 · 共 238 戶</div>
          </div>
          <button className="btn" onClick={onJump}><Icon name="arrow" size={13} />下鑽至分群</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
          {UPSELL_POOL.map((slot) => {
            const meta = catMeta(slot.catId)
            return (
              <div key={slot.catId} style={{
                padding: 14, border: `1px solid ${meta.color}40`,
                background: meta.bg, borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: meta.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{meta.id}</span>
                  <b style={{ fontSize: 13, color: meta.color }}>{slot.code}</b>
                  <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>· {slot.persona}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: meta.color, lineHeight: 1, marginBottom: 8 }}>
                  {slot.n}<span style={{ fontSize: 11, color: 'var(--as-mute)', fontWeight: 400, marginLeft: 4 }}>戶</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--as-ink-2)', marginBottom: 8, lineHeight: 1.5 }}>
                  <b>{slot.product}</b><br />
                  <span style={{ color: 'var(--as-mute)' }}>{slot.pitch}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--as-mute)', borderTop: '1px dashed var(--as-line)', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{slot.ltvHint}</span>
                  <button className="btn" style={{ padding: '2px 8px', fontSize: 10, height: 'auto' }}>名單匯出</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 健康度 Top 5 + 需關注 + 區域熱圖 */}
      <div className="rank-grid" style={{ marginTop: 16 }}>
        {/* Top 5 */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>健康度 Top 5</h3>
              <div className="csub">過去 7 天平均 · 含類型代號與日均開機時數</div>
            </div>
            <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>平均 81.4</span>
          </div>
          <div className="rank">
            {[...FIELDS_A_FULL].sort((a, b) => b.q - a.q).slice(0, 5).map((f, i) => {
              const dlt = FIELD_DELTAS[f.id] ?? 0
              const dCls = dlt > 0 ? '' : dlt < 0 ? 'dn' : 'flat'
              const dStr = dlt > 0 ? `▲ ${dlt}` : dlt < 0 ? `▼ ${Math.abs(dlt)}` : '— 0'
              const meta = catMeta(f.cat)
              return (
                <div className="rk" key={f.id} style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>
                  <div className={`rk-rk ${i < 3 ? 'gold' : ''}`}>{i + 1}</div>
                  <div className="rk-nm">
                    {f.customerName}
                    {f.tier === 'g' && <span style={{ marginLeft: 6, fontSize: 10, color: '#B45309' }}>★</span>}
                    <div className="rk-sub">
                      <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 10, fontWeight: 600, marginRight: 6 }}>{meta.id} {meta.code}</span>
                      <span className="mono" style={{ marginRight: 6 }}>{f.customerId}</span>
                      日均 {f.hrs}h
                    </div>
                  </div>
                  <div className="rk-bar">
                    <div className="rk-tr">
                      <div className="rk-fi" style={{ width: `${f.q}%` }}></div>
                    </div>
                  </div>
                  <div className="rk-v">
                    {f.q}<span className="u">/100</span>
                    <span className={`dlt ${dCls}`}>{dStr}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 需關注(類型代號 + 日均開機時數) */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>需關注 · 健康度 &lt; 75</h3>
              <div className="csub">類型代號 + 時數一眼分辨「沒在用 vs 用了還是差」</div>
            </div>
            <span className="csub" style={{ color: 'var(--as-danger)', fontWeight: 600 }}>● 23 個場域</span>
          </div>
          <div className="rank">
            {[...FIELDS_A_FULL].sort((a, b) => a.q - b.q).slice(0, 4).map((f) => {
              const dlt = FIELD_DELTAS[f.id] ?? 0
              const dCls = dlt > 0 ? '' : dlt < 0 ? 'dn' : 'flat'
              const dStr = dlt > 0 ? `▲ ${dlt}` : dlt < 0 ? `▼ ${Math.abs(dlt)}` : '— 0'
              const meta = catMeta(f.cat)
              const lowUse = f.hrs < 8
              return (
                <div className="rk" key={f.id} style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>
                  <div className="rk-rk r">!</div>
                  <div className="rk-nm">
                    {f.customerName}
                    {f.tier === 'g' && <span style={{ marginLeft: 6, fontSize: 10, color: '#B45309' }}>★</span>}
                    <div className="rk-sub">
                      <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 8, background: meta.bg, color: meta.color, fontSize: 10, fontWeight: 600, marginRight: 6 }}>{meta.id} {meta.code}</span>
                      <span className="mono" style={{ marginRight: 6 }}>{f.customerId}</span>
                      日均 {f.hrs}h
                      {lowUse && <span style={{ color: 'var(--as-warning)', fontWeight: 600, marginLeft: 6 }}>· 低使用</span>}
                    </div>
                  </div>
                  <div className="rk-bar">
                    <div className="rk-tr">
                      <div className={`rk-fi ${f.q < 60 ? 'r' : 'y'}`} style={{ width: `${f.q}%` }}></div>
                    </div>
                  </div>
                  <div className="rk-v">
                    {f.q}<span className="u">/100</span>
                    <span className={`dlt ${dCls}`}>{dStr}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 區域分佈 — 三維度切換 */}
        <div className="card span-2">
          <div className="ch">
            <div>
              <h3>區域分佈 — 三維度熱圖</h3>
              <div className="csub">{heatLegend[heatDim].tip}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--as-mute)' }}>
                {heatLegend[heatDim].lbls.map((l) => (
                  <span key={l.t}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, background: l.c, borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
                    {l.t}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 2, padding: 2, background: 'var(--as-bg)', borderRadius: 6 }}>
                {(['health', 'type', 'gap'] as HeatDim[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setHeatDim(d)}
                    style={{
                      padding: '4px 10px', fontSize: 11, border: 0, cursor: 'pointer',
                      borderRadius: 4,
                      background: heatDim === d ? '#fff' : 'transparent',
                      boxShadow: heatDim === d ? '0 0 0 1px var(--as-line)' : 'none',
                      color: heatDim === d ? 'var(--as-ink)' : 'var(--as-mute)',
                      fontWeight: heatDim === d ? 600 : 400,
                    }}
                  >
                    {d === 'health' ? '健康度' : d === 'type' ? '類型佔比' : '室內外落差'}
                    {d === 'gap' && (
                      <span style={{ fontSize: 9, marginLeft: 4, color: 'var(--as-mute)' }}>待接入</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="region-heat">
            {REGION_HEALTH.map((x) => {
              let cls: 'g' | 'y' | 'r' = 'g'
              let mainVal = ''
              let subVal = ''
              let dimCls = ''
              if (heatDim === 'health') {
                cls = x.q >= 85 ? 'g' : x.q >= 75 ? 'y' : 'r'
                mainVal = `${x.q}`
                const dStr = x.dlt > 0 ? `▲${x.dlt}` : x.dlt < 0 ? `▼${Math.abs(x.dlt)}` : '— 0'
                dimCls = x.dlt > 0 ? 'up' : x.dlt < 0 ? 'dn' : ''
                subVal = dStr
              } else if (heatDim === 'type') {
                cls = x.warnPct < 2 ? 'g' : x.warnPct < 4 ? 'y' : 'r'
                mainVal = `${x.warnPct.toFixed(1)}%`
                subVal = `建議 ${x.attnPct}%`
              } else {
                cls = x.blockedPct >= 60 ? 'g' : x.blockedPct >= 50 ? 'y' : 'r'
                mainVal = `${x.blockedPct}%`
                subVal = '示意'
              }
              return (
                <div className={`heat ${cls}`} key={x.r} style={{ opacity: heatDim === 'gap' ? 0.85 : 1 }}>
                  <div className="hr">{x.r}</div>
                  <div className="hv">{mainVal}</div>
                  <div className="hn">{x.n} 場域 <span className={`dlt ${dimCls}`}>{subVal}</span></div>
                </div>
              )
            })}
          </div>
          {heatDim === 'gap' && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="globe" size={14} />
              <span>{INDOOR_OUTDOOR.source} · 接通後此維度顯示真實環境部測站對照(室內 {INDOOR_OUTDOOR.indoorPM25} vs 室外 {INDOOR_OUTDOOR.outdoorPM25})</span>
            </div>
          )}
        </div>
      </div>

      {/* 場域明細表(加六大類型欄、室外 PM2.5 欄、日均 hrs 欄) */}
      <div className="dt-wrap" style={{ marginTop: 16 }}>
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" /></th>
              <th>場域</th>
              <th>客戶編號</th>
              <th>類型</th>
              <th>六大類型</th>
              <th>坪數</th>
              <th>設備</th>
              <th>狀態</th>
              <th>PM2.5</th>
              <th>室外 PM2.5</th>
              <th>日均</th>
              <th>會員等級</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {FIELDS_A_FULL.map((f) => {
              const meta = catMeta(f.cat)
              const outdoor = FIELD_OUTDOOR_PM25[f.id]
              return (
                <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="dt-nm">{f.customerName}</div>
                    <div className="dt-sub">{f.nm} · {f.addr}</div>
                  </td>
                  <td className="mono mute">{f.customerId}</td>
                  <td><span className="tt">{f.type}</span></td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: meta.bg, color: meta.color, fontWeight: 600,
                    }}>
                      <span style={{ fontFamily: 'var(--f-mono)' }}>{meta.id}</span>
                      <span>{meta.code}</span>
                    </span>
                  </td>
                  <td>{f.sz}</td>
                  <td>{f.dev}</td>
                  <td>
                    <span className="lamp">
                      <span className={`d ${f.lamp}`}></span>
                      {f.lamp === 'g' ? '正常' : f.lamp === 'y' ? '警示' : '異常'}
                    </span>
                  </td>
                  <td><span className={`pill ${f.pm > 50 ? 'r' : f.pm > 25 ? 'y' : 'g'}`}>{f.pm}</span></td>
                  <td>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>{outdoor}</span>
                    <span style={{ fontSize: 9, color: 'var(--as-mute)', marginLeft: 4 }}>待接入</span>
                  </td>
                  <td className="mono">{f.hrs}<span style={{ color: 'var(--as-mute)' }}>h</span></td>
                  <td>
                    {f.tier === 'g'
                      ? <span className="pill" style={{ background: '#FEF3C7', borderColor: '#FCD34D', color: '#B45309', fontWeight: 600 }}>★ 高級</span>
                      : <span className="pill">一般</span>}
                  </td>
                  <td>
                    <button className="rowbtn" onClick={(e) => { e.stopPropagation(); onOpenDetail(f.id) }}>
                      <Icon name="arrow" size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="dt-foot">
          <span>顯示 9 / 1,284 筆 · 點任一列 → 切到個人層場域詳情 · 「室外 PM2.5」待環境部 API 接通</span>
          <div className="pager">
            <button>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <span className="ell">…</span>
            <button>143</button>
            <button>›</button>
          </div>
        </div>
      </div>

      {/* 下鑽至分群層(加六大類型副標) */}
      <div className="ov-jump" style={{ marginTop: 16 }}>
        <div className="ov-jh"><b>↘ 下鑽至分群層</b> · 從整體統計切入到具體分群</div>
        <div className="ov-jb">
          <button className="ov-jc" onClick={onJump}><span>耗材壽命分群</span><i>立即/近期/觀察/充足 · 預測下次更換</i></button>
          <button className="ov-jc" onClick={onJump}><span>使用強度分群</span><i>呼應①②高活躍 · 重度 / 中度 / 輕度</i></button>
          <button className="ov-jc" onClick={onJump}><span>水箱頻率分群</span><i>類型 ④⑥ 視角 · 除濕需求 高 / 中 / 低</i></button>
        </div>
      </div>
    </>
  )
}

/* ── 分群層 ─────────────────────────────────────────── */
/** 把 FIELDS_A_FULL 的每筆對應到 SEGMENTS_A[segIndex] 的第幾個 group。 */
function fieldGroupIndex(segIndex: number, f: FieldRecord): number {
  if (segIndex === 0) {
    // 耗材剩餘壽命:立即 < 20% / 近期 20–30% / 觀察 30–50% / 充足 ≥ 50%
    if (f.minPct < 20) return 0
    if (f.minPct < 30) return 1
    if (f.minPct < 50) return 2
    return 3
  }
  if (segIndex === 1) {
    // 使用強度: 重度 ≥ 15h / 中度 8–15 / 輕度 < 8
    if (f.hrs >= 15) return 0
    if (f.hrs >= 8) return 1
    return 2
  }
  if (segIndex === 2) {
    // 水箱頻率 ≈ 由六大類型推導:④/⑥ 除濕需求高;⑤ 除濕需求低;其餘一般
    if (f.cat === '4' || f.cat === '6') return 0
    if (f.cat === '5') return 2
    return 1
  }
  return 0
}

function ASegments({ onOpenDetail }: { onOpenDetail: (fid: string) => void }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const catMeta = (id: CatId) => CATEGORIES.find((c) => c.id === id)!

  return (
    <>
      <div className="seg-banner">
        <div className="sb-lv">★ 分群層</div>
        <div className="sb-tx">
          <h3>四軸交叉分群 · 12,481 設備 / 1,284 場域</h3>
          <div className="sb-sub">v4 規格 A.5 · 點任一分群 row 即展開該條件下的場域清單</div>
        </div>
        <div className="sb-ac">
          <button className="btn"><Icon name="download" size={13} />分群名單匯出</button>
        </div>
      </div>

      {/* 統一 2×3 grid(一排兩個):空氣品質 / 濕度控制 / 分群卡 × 3 / 場域類型分佈(右下) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>
        {/* 空氣品質(PM2.5) */}
        <div className="card">
          <div className="ch">
            <div>
              <h3><Icon name="wind" size={14} /> 空氣品質</h3>
              <div className="csub">PM2.5 · 4 級分布 · 全部 1,284 場域</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>
              {(AIR_QUALITY_DIST[0].pct + AIR_QUALITY_DIST[1].pct).toFixed(1)}% 達優/良好
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {AIR_QUALITY_DIST.map((d) => {
              const cats = d.catIds.map((id) => CATEGORIES.find((c) => c.id === id)!).filter(Boolean)
              return (
                <div key={d.lvl} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 28, borderRadius: 6, background: d.bg,
                    color: d.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{d.lvl}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--as-ink-2)' }}>{d.range}</span>
                      <span className="mono" style={{ fontWeight: 600 }}>
                        {d.n.toLocaleString()}
                        <span style={{ color: 'var(--as-mute)', fontWeight: 400, marginLeft: 4 }}>({d.pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 3 }}></div>
                    </div>
                    {cats.length > 0 && (
                      <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {cats.map((m) => (
                          <span key={m.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: 9, padding: '1px 6px', borderRadius: 8,
                            background: m.bg, color: m.color, fontWeight: 600,
                          }}>{m.id} {m.code}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 濕度控制 */}
        <div className="card">
          <div className="ch">
            <div>
              <h3><Icon name="drop" size={14} /> 濕度控制</h3>
              <div className="csub">相對濕度 · 4 級分布 · 全部 1,284 場域</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>
              {HUMIDITY_DIST[1].pct.toFixed(1)}% 處於舒適區
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {HUMIDITY_DIST.map((d) => {
              const cats = d.catIds.map((id) => CATEGORIES.find((c) => c.id === id)!).filter(Boolean)
              return (
                <div key={d.lvl} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 28, borderRadius: 6, background: d.bg,
                    color: d.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{d.lvl}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--as-ink-2)' }}>{d.range}</span>
                      <span className="mono" style={{ fontWeight: 600 }}>
                        {d.n.toLocaleString()}
                        <span style={{ color: 'var(--as-mute)', fontWeight: 400, marginLeft: 4 }}>({d.pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 3 }}></div>
                    </div>
                    {cats.length > 0 && (
                      <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {cats.map((m) => (
                          <span key={m.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: 9, padding: '1px 6px', borderRadius: 8,
                            background: m.bg, color: m.color, fontWeight: 600,
                          }}>{m.id} {m.code}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {SEGMENTS_A.map((s, si) => (
          <div className="seg-card" key={s.title}>
            <div className="sg-h">
              <div>
                <div className="sg-axis">{s.axis}</div>
                <h3>{s.title}</h3>
                <div className="sg-sub">{s.sub}</div>
              </div>
              <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>{s.groups.length} 群</span>
            </div>
            <div className="sg-stack">
              {s.groups.map((g) => (
                <div key={g.lbl} style={{ width: `${g.pct}%`, background: g.c, height: '100%' }}></div>
              ))}
            </div>
            <div className="sg-legend">
              {s.groups.map((g) => (
                <span key={g.lbl}><span className="d" style={{ background: g.c }}></span>{g.pct}%</span>
              ))}
            </div>
            <div className="sg-rows">
              {s.groups.map((g, gi) => {
                const key = `${si}-${gi}`
                const expanded = expandedKey === key
                const matched = FIELDS_A_FULL.filter((f) => fieldGroupIndex(si, f) === gi)
                return (
                  <Fragment key={g.lbl}>
                    <div
                      className="sg-r"
                      style={{ cursor: 'pointer', background: expanded ? g.c + '0A' : undefined }}
                      onClick={() => setExpandedKey(expanded ? null : key)}
                    >
                      <div className="sg-pct" style={{ background: g.c + '18', color: g.c, borderColor: g.c + '50' }}>{g.lbl}</div>
                      <div className="sg-info">
                        <div className="sg-traits">{g.traits}</div>
                        <div className="sg-action"><Icon name="arrow" size={10} />{g.action}</div>
                      </div>
                      <div className="sg-num">
                        <div className="v mono">{g.n.toLocaleString()}</div>
                        <div className="l">設備</div>
                      </div>
                      <button
                        className="rowbtn"
                        onClick={(e) => { e.stopPropagation(); setExpandedKey(expanded ? null : key) }}
                        style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        <Icon name="chevR" size={12} />
                      </button>
                    </div>
                    {expanded && (
                      <div style={{
                        padding: '10px 12px 12px',
                        background: g.c + '08',
                        borderLeft: `3px solid ${g.c}`,
                        marginLeft: 4,
                        marginRight: 4,
                        marginBottom: 4,
                        borderRadius: '0 6px 6px 0',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>
                            <Icon name="layers" size={11} /> 該條件下示範場域 · {matched.length} / 全體 {g.n.toLocaleString()} 台
                          </div>
                          <button className="btn" style={{ fontSize: 10, padding: '3px 8px' }}>
                            <Icon name="download" size={10} />匯出本群名單
                          </button>
                        </div>
                        {matched.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {matched.map((f) => {
                              const m = catMeta(f.cat)
                              return (
                                <div
                                  key={f.id}
                                  onClick={(e) => { e.stopPropagation(); onOpenDetail(f.id) }}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.4fr 0.7fr 0.55fr 0.45fr 0.35fr 0.4fr 24px',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 10px',
                                    background: '#fff',
                                    borderRadius: 6,
                                    border: '1px solid var(--as-line-2)',
                                    cursor: 'pointer',
                                    fontSize: 11,
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--as-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {f.customerName}
                                      {f.tier === 'g' && <span style={{ marginLeft: 6, fontSize: 9, color: '#B45309' }}>★</span>}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{f.nm} · {f.addr}</div>
                                  </div>
                                  <span className="mono" style={{ color: 'var(--as-mute)', fontSize: 10 }}>{f.customerId}</span>
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontSize: 10, padding: '2px 6px', borderRadius: 8,
                                    background: m.bg, color: m.color, fontWeight: 600,
                                    justifySelf: 'start',
                                  }}>{m.id} {m.code}</span>
                                  {si === 0 ? (
                                    <span
                                      className={`pill ${f.minPct < 20 ? 'r' : f.minPct < 30 ? 'y' : f.minPct < 50 ? '' : 'g'}`}
                                      style={{ justifySelf: 'start', fontFamily: 'var(--f-mono)' }}
                                      title={`最低耗材殘量 ${f.minPct}% · 預估 ${f.predictedDays} 天後需更換`}
                                    >
                                      {f.minPct}% / {f.predictedDays}d
                                    </span>
                                  ) : (
                                    <span className={`pill ${f.q >= 85 ? 'g' : f.q >= 75 ? 'y' : 'r'}`} style={{ justifySelf: 'start' }}>
                                      DHI {f.q}
                                    </span>
                                  )}
                                  <span className="mono" style={{ color: 'var(--as-mute)' }}>{f.hrs}h</span>
                                  <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>{f.tier === 'g' ? '★ 高級' : '一般'}</span>
                                  <Icon name="arrow" size={11} />
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div style={{ padding: 12, background: '#fff', borderRadius: 6, border: '1px dashed var(--as-line-2)', fontSize: 11, color: 'var(--as-mute)', textAlign: 'center' }}>
                            目前示範資料(9 筆)無此分群場域 · 實際 {g.n.toLocaleString()} 台
                          </div>
                        )}
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        ))}

        {/* 場域類型分佈 — 右下(grid 第 6 格) */}
        <div className="seg-card">
          <div className="sg-h">
            <div>
              <div className="sg-axis">類型</div>
              <h3>場域類型分佈</h3>
              <div className="sg-sub">依場域性質分類 · {SITE_TYPES.reduce((a, s) => a + s.n, 0).toLocaleString()} 場域</div>
            </div>
            <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>{SITE_TYPES.length} 類</span>
          </div>
          <div className="sg-stack">
            {SITE_TYPES.map((s) => {
              const total = SITE_TYPES.reduce((a, x) => a + x.n, 0)
              const pct = Math.round((s.n / total) * 1000) / 10
              return <div key={s.nm} style={{ width: `${pct}%`, background: s.c, height: '100%' }}></div>
            })}
          </div>
          <div className="sg-legend">
            {SITE_TYPES.map((s) => {
              const total = SITE_TYPES.reduce((a, x) => a + x.n, 0)
              const pct = Math.round((s.n / total) * 100)
              return <span key={s.nm}><span className="d" style={{ background: s.c }}></span>{pct}%</span>
            })}
          </div>
          <div className="sg-rows">
            {SITE_TYPES.map((s) => {
              return (
                <div className="sg-r" key={s.nm}>
                  <div className="sg-pct" style={{ background: s.c + '18', color: s.c, borderColor: s.c + '50' }}>{s.nm}</div>
                  <div className="sg-info">
                    <div className="sg-traits">{s.nm === '居家' ? '個人/家庭場域 · 高敏家庭為主' : s.nm === '辦公' ? '上班時段運轉 · 中度使用' : s.nm === '醫療' ? '無菌需求 · 長時運轉' : '營業場所 · 開店時段運轉'}</div>
                    <div className="sg-action"><Icon name="arrow" size={10} />{s.nm === '居家' ? '健康證書 + 訂閱推薦' : s.nm === '辦公' ? 'B2B 服務合約' : s.nm === '醫療' ? '保固延長 + 多機部署' : '商用方案推薦'}</div>
                  </div>
                  <div className="sg-num">
                    <div className="v mono">{s.n.toLocaleString()}</div>
                    <div className="l">場域</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── 個人層 (場域詳情 + 場域清單 + 耗材 + 水箱) ─────────── */
type APersonalSub = 'detail' | 'list' | 'consumable' | 'tank'

function APersonal({
  subTab,
  setSubTab,
  currentFieldId,
  setCurrentFieldId,
  onJumpOverview,
  onJumpSegments,
}: {
  subTab: APersonalSub
  setSubTab: (s: APersonalSub) => void
  currentFieldId: string
  setCurrentFieldId: (fid: string) => void
  onJumpOverview: () => void
  onJumpSegments: () => void
}) {
  const openDetail = (fid: string) => {
    setCurrentFieldId(fid)
    setSubTab('detail')
  }

  return (
    <>
      {/* 個人層 sub-tabs */}
      <div className="b-subtabs">
        {([
          { k: 'list', l: '場域清單', n: 1284 },
          { k: 'detail', l: '場域詳情' },
          { k: 'consumable', l: '耗材庫存' },
          { k: 'tank', l: '水箱管理' },
        ] as Array<{ k: APersonalSub; l: string; n?: number }>).map((t) => (
          <div
            key={t.k}
            className={`b-subtab ${t.k === subTab ? 'active' : ''}`}
            onClick={() => setSubTab(t.k)}
          >
            {t.l}
            {t.n != null && <span className="n">{t.n}</span>}
          </div>
        ))}
      </div>

      {subTab === 'detail' && (
        <ALocationDetail
          fieldId={currentFieldId}
          onBackToList={() => setSubTab('list')}
          onJumpOverview={onJumpOverview}
          onJumpSegments={onJumpSegments}
        />
      )}
      {subTab === 'list' && <ALocationList onSelect={openDetail} />}
      {subTab === 'consumable' && <AConsumables onSelect={openDetail} />}
      {subTab === 'tank' && <ATank />}
    </>
  )
}

/* ── 場域清單 (個人層) ───────────────────────────────── */
function ALocationList({ onSelect }: { onSelect: (fid: string) => void }) {
  const catMeta = (id: CatId) => CATEGORIES.find((c) => c.id === id)!
  return (
    <div className="dt-wrap">
      <table className="dt">
        <thead>
          <tr>
            <th style={{ width: 32 }}><input type="checkbox" /></th>
            <th>場域</th>
            <th>客戶編號</th>
            <th>類型</th>
            <th>六大類型</th>
            <th>坪數</th>
            <th>設備</th>
            <th>狀態</th>
            <th>PM2.5</th>
            <th>室外 PM2.5</th>
            <th>日均</th>
            <th>會員等級</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {FIELDS_A_FULL.map((f: FieldRecord) => {
            const meta = catMeta(f.cat)
            const outdoor = FIELD_OUTDOOR_PM25[f.id]
            return (
              <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(f.id)}>
                <td onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                <td>
                  <div className="dt-nm">{f.customerName}</div>
                  <div className="dt-sub">{f.nm} · {f.addr}</div>
                </td>
                <td className="mono mute">{f.customerId}</td>
                <td><span className="tt">{f.type}</span></td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, padding: '2px 8px', borderRadius: 10,
                    background: meta.bg, color: meta.color, fontWeight: 600,
                  }}>
                    <span style={{ fontFamily: 'var(--f-mono)' }}>{meta.id}</span>
                    <span>{meta.code}</span>
                  </span>
                </td>
                <td>{f.sz}</td>
                <td>{f.dev}</td>
                <td>
                  <span className="lamp">
                    <span className={`d ${f.lamp}`}></span>
                    {f.lamp === 'g' ? '正常' : f.lamp === 'y' ? '警示' : '異常'}
                  </span>
                </td>
                <td><span className={`pill ${f.pm > 50 ? 'r' : f.pm > 25 ? 'y' : 'g'}`}>{f.pm}</span></td>
                <td>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>{outdoor}</span>
                  <span style={{ fontSize: 9, color: 'var(--as-mute)', marginLeft: 4 }}>待接入</span>
                </td>
                <td className="mono">{f.hrs}<span style={{ color: 'var(--as-mute)' }}>h</span></td>
                <td>
                  {f.tier === 'g'
                    ? <span className="pill" style={{ background: '#FEF3C7', borderColor: '#FCD34D', color: '#B45309', fontWeight: 600 }}>★ 高級</span>
                    : <span className="pill">一般</span>}
                </td>
                <td>
                  <button className="rowbtn" onClick={(e) => { e.stopPropagation(); onSelect(f.id) }}>
                    <Icon name="arrow" size={12} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="dt-foot">
        <span>顯示 9 / 1,284 筆 · 點任一列進「場域詳情」</span>
        <div className="pager">
          <button>‹</button>
          <button className="on">1</button>
          <button>2</button>
          <button>3</button>
          <span className="ell">…</span>
          <button>143</button>
          <button>›</button>
        </div>
      </div>
    </div>
  )
}

/* ── 耗材庫存 ────────────────────────────────────────── */
function AConsumables({ onSelect }: { onSelect: (fid: string) => void }) {
  const tot = CONSUMABLE_CATS.reduce(
    (a, c) => ({ i: a.i + c.dist.i, n: a.n + c.dist.n, w: a.w + c.dist.w, r: a.r + c.dist.r }),
    { i: 0, n: 0, w: 0, r: 0 }
  )
  const all = tot.i + tot.n + tot.w + tot.r

  const stageKeys: Array<'i' | 'n' | 'w' | 'r'> = ['i', 'n', 'w', 'r']

  return (
    <>
      {/* 四階段 KPI */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi red">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-danger)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            立即處理 (&lt; 20%)
          </div>
          <div className="val">{tot.i}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta dn"><Icon name="bell" size={11} />觸發 E 模組</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.i / all * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="kpi orange">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-warning)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            近期處理 (20–30%)
          </div>
          <div className="val">{tot.n}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta"><Icon name="cal" size={11} />3 工作日內</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.n / all * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="kpi purple">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: '#4F46E5', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            持續觀察 (30–50%)
          </div>
          <div className="val">{tot.w}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta"><Icon name="eye" size={11} />本月內</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.w / all * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-mute-2)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            更換備料 (≥ 50%)
          </div>
          <div className="val">{tot.r}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="check" size={11} />正常</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.r / all * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* AI 跨模組訊號條 */}
      <div className="alert-banner" style={{ marginTop: 16, background: 'linear-gradient(90deg, #FFF1F0 0%, #FFFBEB 100%)', borderColor: '#FECDD3' }}>
        <div className="al-ic" style={{ background: 'var(--as-danger)' }}><Icon name="sparkles" size={18} /></div>
        <div className="al-tx">
          <div className="al-h"><b>520 台設備耗材剩餘 &lt; 20% (立即處理)</b> · 已自動觸發 E 模組「需主動聯繫名單」27 位會員 · 其中 9 位為高級會員</div>
          <div className="al-s">推薦下一步:批次派工 + 推送「自動配送耗材」訂閱方案 (歷史接受率 38%，預估月經常性收入 + NT$ 124K)</div>
        </div>
        <div className="al-ac">
          <button className="btn"><Icon name="download" size={13} />匯出名單</button>
          <button className="btn primary"><Icon name="headset" size={13} />批次派工 + 通知</button>
        </div>
      </div>

      {/* 六類耗材卡 */}
      <div className="con-grid">
        {CONSUMABLE_CATS.map((c) => {
          const t = tone(c.avg)
          const total = c.dist.i + c.dist.n + c.dist.w + c.dist.r
          return (
            <div className="con-card" key={c.k}>
              <div className="con-h">
                <div className="con-tag" style={{ background: c.clr + '18', color: c.clr }}>
                  <span className="con-ic" style={{ background: c.clr }}></span>
                  <span>{c.sub}</span>
                </div>
                <div className="con-life">壽命 {c.life}</div>
              </div>
              <div className="con-nm">{c.nm}</div>
              <div className="con-ring">
                <svg viewBox="0 0 80 80" width="100" height="100">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--as-line-2)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={t.clr} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${c.avg / 100 * 2 * Math.PI * 34} 999`}
                    transform="rotate(-90 40 40)" />
                  <text x="40" y="42" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--as-ink)" fontFamily="var(--f-mono)">{c.avg}</text>
                  <text x="40" y="55" textAnchor="middle" fontSize="9" fill="var(--as-mute)">% 平均</text>
                </svg>
                <div className="con-tone" style={{ background: t.bg, color: t.clr }}>{t.lbl}</div>
              </div>
              <div className="con-dist">
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-danger)' }}></span><span className="l">立即</span><span className="v">{c.dist.i}</span></div>
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-warning)' }}></span><span className="l">近期</span><span className="v">{c.dist.n}</span></div>
                <div className="con-dr"><span className="d" style={{ background: '#4F46E5' }}></span><span className="l">觀察</span><span className="v">{c.dist.w}</span></div>
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-mute-2)' }}></span><span className="l">備料</span><span className="v">{c.dist.r}</span></div>
              </div>
              <div className="con-stack">
                {stageKeys.map((s) => {
                  const v = c.dist[s]
                  const bg = s === 'i' ? 'var(--as-danger)' : s === 'n' ? 'var(--as-warning)' : s === 'w' ? '#4F46E5' : 'var(--as-mute-2)'
                  return <div key={s} style={{ width: `${v / total * 100}%`, background: bg, height: '100%' }}></div>
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 耗材熱力矩陣 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>★ 需立即處理裝置 — 耗材熱力矩陣</h3>
            <div className="csub">六類耗材 × 個別裝置 · 紅色 &lt; 20% (立即) · 黃 &lt; 30% (近期) · 藍 &lt; 50% (觀察)</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--as-mute)', display: 'flex', gap: 12 }}>
            <span><b style={{ color: 'var(--as-danger)', fontFamily: 'var(--f-mono)' }}>● 18</b> 立即處理 (今日)</span>
            <span><b style={{ color: 'var(--as-warning)', fontFamily: 'var(--f-mono)' }}>● 64</b> 近期處理</span>
          </div>
        </div>
        <div className="con-heat">
          <div className="con-heat-head">
            <div className="hcell mute">會員 / 場域 / 裝置</div>
            <div className="hcell">前置</div>
            <div className="hcell">ECF·L</div>
            <div className="hcell">ECF·R</div>
            <div className="hcell">HEPA</div>
            <div className="hcell">電漿</div>
            <div className="hcell">UV</div>
            <div className="hcell mute">逾期</div>
            <div className="hcell mute">下一步</div>
          </div>
          {URGENT_DEVICES.map((u) => {
            const fid = URGENT_DEVICE_TO_FIELD[u.mid]
            return (
              <div
                className="con-heat-r"
                key={u.mid}
                style={fid ? { cursor: 'pointer' } : undefined}
                onClick={() => fid && onSelect(fid)}
              >
                <div className="hwho">
                  <div className={`av ${u.tier === 'g' ? 'gold' : ''}`}>{u.nm[0]}</div>
                  <div>
                    <div className="hnm">{u.nm}<span className="hid">{u.mid}</span></div>
                    <div className="haddr">{u.addr} · <span className="mono">{u.dev}</span></div>
                  </div>
                </div>
                {(['pre', 'ecfL', 'ecfR', 'hepa', 'plasma', 'uv'] as const).map((k) => {
                  const v = u.vals[k]
                  const t = tone(v)
                  return (
                    <div className={`hcell-v ${t.cls}`} key={k} style={{ background: t.bg, color: t.clr }}>
                      <div className="vv">{v}<span className="pp">%</span></div>
                      <div className="vt">{t.lbl}</div>
                    </div>
                  )
                })}
                <div className="hdays">
                  <span className={`pill ${u.sev === 'critical' ? 'r' : u.sev === 'soon' ? 'y' : ''}`}>
                    {u.sev === 'critical' ? `+${u.days} 天` : u.sev === 'soon' ? `${u.days} 天內` : '本週'}
                  </span>
                </div>
                <div className="hact" onClick={(e) => e.stopPropagation()}>
                  <button className="rowbtn"><Icon name="phone" size={12} /></button>
                  <button className="rowbtn"><Icon name="headset" size={12} /></button>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--as-line-2)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--as-mute)' }}>
          <span>顯示前 6 筆 · 共 <b style={{ color: 'var(--as-ink)' }}>27</b> 位會員需主動聯繫</span>
          <span style={{ color: 'var(--as-cdefg)', cursor: 'pointer' }}>跳至 E 模組 · 完整聯繫名單 →</span>
        </div>
      </div>
    </>
  )
}

/* ── 水箱管理 ────────────────────────────────────────── */
function ATank() {
  const hourly = [4, 2, 1, 1, 1, 2, 4, 8, 12, 14, 11, 8, 9, 7, 6, 6, 7, 9, 11, 14, 13, 10, 8, 5]
  const hMax = Math.max(...hourly)

  const ABNORMAL = [
    { sid: 'SH-2841', site: '臺中科技園區', mem: '王淑芬 · 高級', tier: 'g', evt: 32, avg: 28.4, p50: 18, p90: 52, max: 96, trend: 'up', sig: '已觸發 E' },
    { sid: 'SH-7821', site: '陽明山度假', mem: '陳俊宏 · 高級', tier: 'g', evt: 14, avg: 38.2, p50: 26, p90: 68, max: 124, trend: 'up', sig: '已觸發 E' },
    { sid: 'SH-1147', site: '新北板橋辦公', mem: '李文君', tier: 'n', evt: 26, avg: 22.1, p50: 16, p90: 38, max: 72, trend: 'flat', sig: '已觸發 E' },
    { sid: 'SH-5023', site: '臺南安平診所', mem: '林醫師', tier: 'n', evt: 41, avg: 19.8, p50: 14, p90: 31, max: 58, trend: 'down', sig: '監控中' },
    { sid: 'SH-5611', site: '臺北大安咖啡店', mem: '阿諾義式', tier: 'n', evt: 38, avg: 16.4, p50: 12, p90: 26, max: 48, trend: 'flat', sig: '監控中' },
  ]

  return (
    <>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi purple">
          <div className="lbl">本週水滿事件</div>
          <div className="val">2,841<span className="u">次</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+8%</span>
            <Sparkline data={[2600, 2620, 2680, 2700, 2750, 2780, 2810, 2820, 2835, 2841]} color="var(--as-cdefg)" />
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">平均清除時間</div>
          <div className="val">11.4<span className="u">小時</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="down" size={11} />−1.8h</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>目標 ≤ 12h</span>
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">P50 中位數</div>
          <div className="val">8.6<span className="u">h</span></div>
          <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-success)' }}>50% 用戶 ≤ 8.6h</span></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">P90 (★ 觸發閾值)</div>
          <div className="val">24.8<span className="u">h</span></div>
          <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-warning)' }}>P90 &gt; 24h → 觸發 E</span></div>
        </div>
        <div className="kpi red">
          <div className="lbl">最長 (Max)</div>
          <div className="val">124<span className="u">h</span></div>
          <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-danger)' }}>陽明山度假 · 5 天 4 小時</span></div>
        </div>
      </div>

      <div className="alert-banner" style={{ marginTop: 16, background: 'linear-gradient(90deg, #FFFBEB 0%, #FFFFFF 100%)', borderColor: '#FED7AA' }}>
        <div className="al-ic" style={{ background: 'var(--as-warning)' }}><Icon name="bell" size={18} /></div>
        <div className="al-tx">
          <div className="al-h"><b>14 個場域 P90 &gt; 24 小時</b> · 已觸發 E 模組主動聯繫 · 包含 4 位高級會員</div>
          <div className="al-s">疑似原因:① 除濕需求過高 (建議升級機型) ② 用戶習慣 (推送提醒) ③ 設備異常 (派工檢查)</div>
        </div>
        <div className="al-ac">
          <button className="btn primary"><Icon name="headset" size={13} />批次派工 + 通知</button>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch">
            <div>
              <h3>倒水節奏 · 24 小時分布</h3>
              <div className="csub">深色柱 = 工作日 · 淺色 = 週末 · 峰值 09:00 / 19:00</div>
            </div>
          </div>
          <div className="tank-24h">
            {hourly.map((v, i) => {
              const isWeekendPeak = (i === 10 || i === 11 || i === 14 || i === 15)
              return (
                <div className="t24" key={i}>
                  <div className="t24-b" style={{
                    height: `${v / hMax * 120}px`,
                    background: isWeekendPeak ? 'var(--as-cdefg)' : 'var(--as-primary)',
                    opacity: isWeekendPeak ? 0.55 : 1
                  }}></div>
                  {(i % 3 === 0) && <div className="t24-l">{String(i).padStart(2, '0')}</div>}
                </div>
              )
            })}
          </div>
          <div className="tank-week">
            <div className="twr">
              <span className="lbl">工作日平均</span>
              <span className="ev">94 次/日</span>
              <span className="dur">11.2 h 平均清除</span>
            </div>
            <div className="twr">
              <span className="lbl">週末平均</span>
              <span className="ev">62 次/日</span>
              <span className="dur">14.8 h 平均清除</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div>
              <h3>清除時間分位數 · 30 天</h3>
              <div className="csub">紅線標示 P90 觸發閾值 (24h)</div>
            </div>
          </div>
          <div className="tank-pct">
            {[
              { k: '最快', v: 0.4, pct: 0.4 / 124 * 100, c: 'var(--as-success)', lab: '0.4 h' },
              { k: 'P25', v: 4.2, pct: 4.2 / 124 * 100, c: 'var(--as-success)', lab: '4.2 h' },
              { k: 'P50 中位', v: 8.6, pct: 8.6 / 124 * 100, c: 'var(--as-success)', lab: '8.6 h' },
              { k: '平均', v: 11.4, pct: 11.4 / 124 * 100, c: 'var(--as-cdefg)', lab: '11.4 h' },
              { k: 'P75', v: 16.8, pct: 16.8 / 124 * 100, c: 'var(--as-cdefg)', lab: '16.8 h' },
              { k: 'P90', v: 24.8, pct: 24.8 / 124 * 100, c: 'var(--as-warning)', lab: '24.8 h ⚠' },
              { k: '最長', v: 124, pct: 100, c: 'var(--as-danger)', lab: '124 h' },
            ].map((p) => (
              <div className="tpr" key={p.k}>
                <div className="tpk">{p.k}</div>
                <div className="tpb">
                  <div className="tpf" style={{ width: `${p.pct}%`, background: p.c }}></div>
                  <div className="tp-line" style={{ left: `${24 / 124 * 100}%` }}></div>
                </div>
                <div className="tpv mono">{p.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 異常場域表 */}
      <div className="dt-wrap" style={{ marginTop: 16 }}>
        <table className="dt">
          <thead>
            <tr>
              <th>場域</th>
              <th>會員</th>
              <th>事件 (週)</th>
              <th>平均</th>
              <th>P50</th>
              <th>P90 ★</th>
              <th>最長</th>
              <th>趨勢</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ABNORMAL.map((a) => (
              <tr key={a.sid}>
                <td>
                  <div className="dt-nm">{a.site}</div>
                  <div className="dt-sub mono">{a.sid}</div>
                </td>
                <td>{a.mem}</td>
                <td className="mono">{a.evt}</td>
                <td className="mono">{a.avg} h</td>
                <td className="mono">{a.p50} h</td>
                <td className="mono">
                  <span className={`pill ${a.p90 > 24 ? 'r' : a.p90 > 12 ? 'y' : 'g'}`}>{a.p90} h</span>
                </td>
                <td className="mono">{a.max} h</td>
                <td>
                  {a.trend === 'up'
                    ? <span style={{ color: 'var(--as-danger)' }}>▲ 惡化</span>
                    : a.trend === 'down'
                    ? <span style={{ color: 'var(--as-success)' }}>▼ 改善</span>
                    : <span style={{ color: 'var(--as-mute)' }}>— 持平</span>}
                </td>
                <td><span className={`pill ${a.sig.includes('觸發') ? 'r' : 'y'}`}>{a.sig}</span></td>
                <td><button className="rowbtn"><Icon name="arrow" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ── 場域詳情 (個人層 · 場域 360°) ──────────────────── */

const CONSUMABLE_STATUS_META: Record<FieldDetail['consumables'][number]['status'], { lbl: string; cls: 'r' | 'y' | 'g'; clr: string; bg: string }> = {
  critical: { lbl: '立即處理', cls: 'r', clr: 'var(--as-danger)',  bg: '#FEE4E2' },
  soon:     { lbl: '7-30 天', cls: 'y', clr: '#CA8A04',           bg: '#FEF3C7' },
  watch:    { lbl: '本季', cls: 'y', clr: '#4F46E5',              bg: '#EEF0FF' },
  ok:       { lbl: '正常', cls: 'g', clr: 'var(--as-success)',    bg: '#DCFCE7' },
}

const TIMELINE_KIND_META: Record<FieldDetail['timeline'][number]['kind'], { icon: string; clr: string; lbl: string }> = {
  alarm:   { icon: 'bell',            clr: 'var(--as-danger)',  lbl: '警報' },
  spike:   { icon: 'alert-triangle',  clr: 'var(--as-warning)', lbl: '空污事件' },
  tank:    { icon: 'drop',            clr: '#4F46E5',           lbl: '水箱' },
  service: { icon: 'headset',         clr: 'var(--as-primary)', lbl: '服務' },
  event:   { icon: 'pulse',           clr: 'var(--as-mute)',    lbl: '事件' },
}

/* 取得場域詳情 — 目前以 SH-2841 王婉真為主示範,其他場域回退到同份 mock 但替換 identity */
function getFieldDetail(fid: string): FieldDetail {
  const rec = FIELDS_A_FULL.find((f) => f.id === fid)
  if (fid === 'SH-2841' || !rec) return FIELD_DETAIL_WANG
  return {
    ...FIELD_DETAIL_WANG,
    fid: rec.id,
    memberName: rec.customerName,
    memberTier: rec.tier === 'g' ? 'g' : 'n',
    area: rec.addr,
    spaceType: rec.type,
    floorSize: rec.sz,
    dhi: rec.q,
    dhiDelta: FIELD_DELTAS[rec.id] ?? 0,
    cat: rec.cat,
    pm25Now: rec.pm,
    onlineDevices: parseInt(rec.dev.split('/')[0]),
    totalDevices: parseInt(rec.dev.split('/')[1]),
    hoursToday: rec.hrs,
  }
}

/* —— SVG 90 天 PM2.5 趨勢圖(室內主線 + 室外灰虛線 + P50/P90 + 事件) —— */
function PM25TrendChart({ detail }: { detail: FieldDetail }) {
  const W = 720, H = 200, padL = 36, padR = 12, padT = 12, padB = 28
  const inner = { w: W - padL - padR, h: H - padT - padB }
  const data = detail.pm25Trend
  const outdoor = detail.pm25OutdoorTrend
  const maxY = Math.max(...outdoor, ...data, 100)
  const yMax = Math.ceil(maxY / 50) * 50
  const x = (i: number) => padL + (i / (data.length - 1)) * inner.w
  const y = (v: number) => padT + inner.h - (v / yMax) * inner.h
  const pathFor = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxHeight: 220 }}>
      {/* Y axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => {
        const yy = padT + inner.h * (1 - p)
        return (
          <g key={p}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--as-line-2)" strokeWidth="1" />
            <text x={padL - 6} y={yy + 3} textAnchor="end" fontSize="9" fill="var(--as-mute)">{Math.round(yMax * p)}</text>
          </g>
        )
      })}
      {/* 室外 PM2.5(灰虛線) */}
      <path d={pathFor(outdoor)} fill="none" stroke="var(--as-mute-2)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
      {/* P50 / P90 參考線 */}
      <line x1={padL} y1={y(detail.pm25P50)} x2={W - padR} y2={y(detail.pm25P50)} stroke="var(--as-success)" strokeWidth="1" strokeDasharray="6 4" opacity="0.7" />
      <text x={W - padR - 4} y={y(detail.pm25P50) - 3} textAnchor="end" fontSize="9" fill="var(--as-success)">P50 = {detail.pm25P50}</text>
      <line x1={padL} y1={y(detail.pm25P90)} x2={W - padR} y2={y(detail.pm25P90)} stroke="var(--as-danger)" strokeWidth="1" strokeDasharray="6 4" opacity="0.7" />
      <text x={W - padR - 4} y={y(detail.pm25P90) - 3} textAnchor="end" fontSize="9" fill="var(--as-danger)">P90 = {detail.pm25P90}</text>
      {/* 室內 PM2.5(橘色主線) */}
      <path d={pathFor(data)} fill="none" stroke="var(--as-h)" strokeWidth="1.8" />
      {/* 事件標記 */}
      {detail.pm25Events.map((ev, i) => (
        <g key={i}>
          <circle cx={x(ev.dayIdx)} cy={y(ev.pm)} r="5" fill="var(--as-danger)" stroke="#fff" strokeWidth="2" />
          <text x={x(ev.dayIdx)} y={y(ev.pm) - 10} textAnchor="middle" fontSize="9" fill="var(--as-danger)" fontWeight="600">↑ {ev.pm}</text>
        </g>
      ))}
      {/* X 軸:90 天標示 */}
      <text x={padL} y={H - 8} fontSize="9" fill="var(--as-mute)">-90 天</text>
      <text x={padL + inner.w / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--as-mute)">-45 天</text>
      <text x={W - padR} y={H - 8} textAnchor="end" fontSize="9" fill="var(--as-mute)">今日</text>
    </svg>
  )
}

/* —— 溫濕度雙線圖(舒適區帶) —— */
function TempHumidityChart({ detail }: { detail: FieldDetail }) {
  const W = 720, H = 180, padL = 36, padR = 36, padT = 12, padB = 28
  const inner = { w: W - padL - padR, h: H - padT - padB }
  const tempMin = 20, tempMax = 35
  const humMin = 40, humMax = 100
  const x = (i: number) => padL + (i / (detail.tempTrend.length - 1)) * inner.w
  const yTemp = (v: number) => padT + inner.h - ((v - tempMin) / (tempMax - tempMin)) * inner.h
  const yHum = (v: number) => padT + inner.h - ((v - humMin) / (humMax - humMin)) * inner.h
  const pathT = detail.tempTrend.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${yTemp(v).toFixed(1)}`).join(' ')
  const pathH = detail.humidityTrend.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${yHum(v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxHeight: 200 }}>
      {/* 舒適濕度區帶 50–60% */}
      <rect x={padL} y={yHum(60)} width={inner.w} height={yHum(50) - yHum(60)} fill="var(--as-success)" opacity="0.08" />
      <text x={padL + 4} y={yHum(60) + 10} fontSize="9" fill="var(--as-success)">舒適濕度 50–60%</text>
      {/* Y 軸左:溫度 */}
      {[tempMin, 25, 30, tempMax].map((v) => (
        <g key={`t${v}`}>
          <line x1={padL} y1={yTemp(v)} x2={W - padR} y2={yTemp(v)} stroke="var(--as-line-2)" strokeWidth="0.5" opacity="0.5" />
          <text x={padL - 4} y={yTemp(v) + 3} textAnchor="end" fontSize="9" fill="var(--as-danger)">{v}°C</text>
        </g>
      ))}
      {/* Y 軸右:濕度 */}
      {[humMin, 60, 80, humMax].map((v) => (
        <text key={`h${v}`} x={W - padR + 4} y={yHum(v) + 3} fontSize="9" fill="var(--as-info)">{v}%</text>
      ))}
      <path d={pathT} fill="none" stroke="var(--as-danger)" strokeWidth="1.6" />
      <path d={pathH} fill="none" stroke="var(--as-info)" strokeWidth="1.6" strokeDasharray="0" />
      <text x={padL} y={H - 8} fontSize="9" fill="var(--as-mute)">-90 天</text>
      <text x={W - padR} y={H - 8} textAnchor="end" fontSize="9" fill="var(--as-mute)">今日</text>
    </svg>
  )
}

/* —— 24h × 7 天節奏熱力圖 —— */
function WeekUsageHeatmap({ detail }: { detail: FieldDetail }) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const intensityColors = ['#F3F4F6', '#A7F3D0', '#34D399', '#0E7A66']
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '32px repeat(24, 1fr)', gap: 2, fontFamily: 'var(--f-mono)', fontSize: 9 }}>
        <div></div>
        {[...Array(24)].map((_, h) => (
          <div key={h} style={{ textAlign: 'center', color: 'var(--as-mute)' }}>
            {h % 3 === 0 ? `${h}` : ''}
          </div>
        ))}
        {detail.weekUsage.map((row, di) => (
          <Fragment key={di}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, color: 'var(--as-mute)' }}>週{days[di]}</div>
            {row.map((v, hi) => (
              <div
                key={hi}
                title={`週${days[di]} ${hi}:00 · 強度 ${v}`}
                style={{ height: 18, background: intensityColors[v], borderRadius: 2 }}
              ></div>
            ))}
          </Fragment>
        ))}
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--as-mute)' }}>
        <span>強度</span>
        {intensityColors.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, background: c, borderRadius: 2, display: 'inline-block' }}></span>
            {i === 0 ? '關機' : i === 1 ? '低速' : i === 2 ? '中速' : '高速'}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: 8, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)' }}>
        <Icon name="pulse" size={12} /> <b>{detail.workdayPeak}</b>
      </div>
    </div>
  )
}

function ALocationDetail({
  fieldId,
  onBackToList,
  onJumpOverview,
  onJumpSegments,
}: {
  fieldId: string
  onBackToList: () => void
  onJumpOverview: () => void
  onJumpSegments: () => void
}) {
  const d = getFieldDetail(fieldId)
  const catMeta = CATEGORIES.find((c) => c.id === d.cat)!
  const dhiCls: 'g' | 'y' | 'r' = d.dhi >= 85 ? 'g' : d.dhi >= 75 ? 'y' : 'r'
  const dhiClr = dhiCls === 'g' ? 'var(--as-success)' : dhiCls === 'y' ? 'var(--as-warning)' : 'var(--as-danger)'
  const pmTier = d.pm25Now < 16 ? { lbl: '極優', clr: 'var(--as-success)' }
              : d.pm25Now < 26 ? { lbl: '良好', clr: '#16A085' }
              : d.pm25Now < 51 ? { lbl: '普通', clr: 'var(--as-warning)' }
              : { lbl: '不佳', clr: 'var(--as-danger)' }
  const onlineRate = Math.round((d.onlineDevices / d.totalDevices) * 100)

  return (
    <>
      {/* ── Hero 場域識別卡 ───────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ background: `linear-gradient(135deg, ${catMeta.color}18 0%, ${catMeta.color}08 60%, #fff 100%)`, padding: 18, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            {/* 左:基本識別 */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 280 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: catMeta.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
                <Icon name={d.spaceType === '居家' ? 'home' : d.spaceType === '辦公' ? 'box' : 'package'} size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--as-ink)' }}>
                    {d.memberName}
                  </h2>
                  {d.memberTier === 'g' && (
                    <span className="pill" style={{ background: '#FEF3C7', borderColor: '#FCD34D', color: '#B45309', fontWeight: 600 }}>★ 高級</span>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, padding: '3px 10px', borderRadius: 12,
                    background: catMeta.color, color: '#fff', fontWeight: 600,
                  }}>{catMeta.id} {catMeta.code}</span>
                  <span className="pill g" style={{ background: catMeta.bg, borderColor: catMeta.color + '40', color: catMeta.color }}>
                    {catMeta.identity}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--as-mute)', marginTop: 4, fontFamily: 'var(--f-mono)' }}>
                  {FIELDS_A_FULL.find((f) => f.id === d.fid)?.customerId ?? d.fid} · {FIELDS_A_FULL.find((f) => f.id === d.fid)?.nm ?? ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--as-ink-2)', marginTop: 4 }}>
                  {d.area}
                </div>
                <div style={{ fontSize: 12, color: 'var(--as-ink-2)', marginTop: 6 }}>
                  {d.spaceType} · {d.floorSize} 坪 · {d.homeStyle} · {d.members}
                </div>
                <div style={{ marginTop: 8, padding: '6px 10px', background: '#fff', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)', display: 'inline-block' }}>
                  <Icon name="sparkles" size={12} /> {catMeta.desc}
                </div>
              </div>
            </div>

            {/* 中:健康度大分數 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 130 }}>
              <div style={{ fontSize: 10, color: 'var(--as-mute)', letterSpacing: '0.1em' }}>場域健康度 DHI</div>
              <div style={{ fontSize: 56, fontWeight: 700, color: dhiClr, lineHeight: 1, fontFamily: 'var(--f-mono)' }}>{d.dhi}</div>
              <div style={{ fontSize: 11, color: dhiClr, fontWeight: 600 }}>
                {d.dhiDelta > 0 ? `▲ ${d.dhiDelta}` : d.dhiDelta < 0 ? `▼ ${Math.abs(d.dhiDelta)}` : '— 0'} · 同分群 #{d.cohortRank}/{d.cohortSize}
              </div>
            </div>

            {/* 右:會員 + 行動 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
              <div style={{ padding: 10, background: '#fff', borderRadius: 8, border: '1px solid var(--as-line-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`av ${d.memberTier === 'g' ? 'gold' : ''}`} style={{ width: 32, height: 32, borderRadius: '50%', background: d.memberTier === 'g' ? '#FCD34D' : 'var(--as-mute-2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{d.memberName[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {d.memberName}
                      {d.memberTier === 'g' && <span style={{ marginLeft: 6, fontSize: 10, color: '#B45309' }}>★ 高級</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>入會 {d.memberSince} · {d.memberDevices} 台跨場域</div>
                  </div>
                </div>
                <button className="btn" style={{ width: '100%', marginTop: 8, fontSize: 11, padding: '4px 8px' }}>
                  <Icon name="users" size={12} />會員 360°(Module B)
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn primary ab" style={{ flex: 1, fontSize: 11, padding: '6px' }}><Icon name="headset" size={12} />派工</button>
                <button className="btn" style={{ flex: 1, fontSize: 11, padding: '6px' }}><Icon name="phone" size={12} />聯繫</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5 張即時狀態 KPI 卡 ───────────────── */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi green">
          <div className="lbl">場域健康度</div>
          <div className="val" style={{ color: dhiClr }}>{d.dhi}<span className="u">/100</span></div>
          <div className="ft">
            <span className={`delta ${d.dhiDelta > 0 ? 'up' : 'dn'}`}>
              <Icon name={d.dhiDelta > 0 ? 'up' : 'down'} size={11} />{d.dhiDelta > 0 ? `+${d.dhiDelta}` : d.dhiDelta} 本月
            </span>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>同分群均 {d.cohortAvg}</span>
          </div>
        </div>
        <div className="kpi orange">
          <div className="lbl">空氣品質 · PM2.5</div>
          <div className="val">{d.pm25Now}<span className="u">µg</span></div>
          <div className="ft">
            <span className="delta" style={{ color: pmTier.clr, fontWeight: 600 }}>{pmTier.lbl}</span>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>P50 {d.pm25P50} · P90 {d.pm25P90}</span>
          </div>
        </div>
        <div className="kpi purple">
          <div className="lbl">體感舒適</div>
          <div className="val" style={{ fontSize: 22 }}>{d.temp}°C<span className="u" style={{ fontSize: 10 }}> / {d.humidity}%</span></div>
          <div className="ft">
            <span className="delta">{d.comfort}</span>
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">設備可用度</div>
          <div className="val">{d.hoursToday}<span className="u">h</span></div>
          <div className="ft">
            <span className="delta up">
              <Icon name="zap" size={11} />{d.onlineDevices}/{d.totalDevices} 線上 · {onlineRate}%
            </span>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>7日均 {d.hoursAvg7}h</span>
          </div>
        </div>
        <div className="kpi red">
          <div className="lbl">維護倒數</div>
          <div className="val">{d.nextMaintenance.days}<span className="u">天</span></div>
          <div className="ft">
            <span className="delta dn"><Icon name="bell" size={11} />{d.nextMaintenance.item} 到期</span>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>連動耗材表</span>
          </div>
        </div>
      </div>

      {/* ── PM2.5 趨勢 + 溫濕度趨勢 ─────────────── */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch">
            <div>
              <h3>PM2.5 90 天趨勢 · 事件敘事</h3>
              <div className="csub">室內(橘實線) · 室外示意(灰虛線) · 紅點為空污事件</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>3 次空污事件 · 機器平均 18 分鐘內反應</span>
          </div>
          <PM25TrendChart detail={d} />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.pm25Events.map((ev, i) => (
              <div key={i} style={{ fontSize: 11, padding: '6px 10px', background: 'var(--as-danger-tint)', borderRadius: 6, color: 'var(--as-ink-2)' }}>
                <b style={{ color: 'var(--as-danger)' }}>{ev.label}</b> → <span style={{ color: 'var(--as-mute)' }}>{ev.reaction}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <div>
              <h3>溫濕度 90 天趨勢</h3>
              <div className="csub">溫度(紅) / 濕度(藍) · 綠帶為舒適濕度 50–60%</div>
            </div>
          </div>
          <TempHumidityChart detail={d} />
          <div style={{ marginTop: 10, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)' }}>
            <b>觀察:</b> 濕度長期偏高(均 {Math.round(d.humidityTrend.reduce((a, v) => a + v, 0) / d.humidityTrend.length)}%,2 次峰值 &gt; 85%),屬「⑥ 雙重介入型」濕氣困擾特徵。
          </div>
        </div>
      </div>

      {/* ── 24h × 7 天 使用節奏熱力圖 ─────────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>使用節奏熱力圖 · 24h × 7 天</h3>
            <div className="csub">推測作息 · 服務團隊話術依據</div>
          </div>
        </div>
        <WeekUsageHeatmap detail={d} />
      </div>

      {/* ── 設備清單 + 耗材表 ─────────────────── */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch">
            <div>
              <h3>設備清單 · {d.devices.length} 台</h3>
              <div className="csub">{d.onlineDevices} 台線上 / {d.totalDevices - d.onlineDevices} 台離線</div>
            </div>
          </div>
          <div className="dt-wrap" style={{ border: 0 }}>
            <table className="dt">
              <thead>
                <tr><th>機台</th><th>型號 / 位置</th><th>狀態</th><th>今日</th><th>在線率</th></tr>
              </thead>
              <tbody>
                {d.devices.map((dev) => (
                  <tr key={dev.id}>
                    <td className="mono" style={{ fontSize: 11 }}>{dev.id}</td>
                    <td>
                      <div className="dt-nm">{dev.model}</div>
                      <div className="dt-sub">{dev.room}</div>
                    </td>
                    <td>
                      <span className="lamp">
                        <span className={`d ${dev.status === 'online' ? 'g' : dev.status === 'alert' ? 'y' : 'r'}`}></span>
                        {dev.status === 'online' ? '線上' : dev.status === 'alert' ? '警示' : '離線'}
                      </span>
                    </td>
                    <td className="mono">{dev.hoursToday}h</td>
                    <td><span className={`pill ${dev.uptimePct >= 80 ? 'g' : dev.uptimePct >= 50 ? 'y' : 'r'}`}>{dev.uptimePct}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <div>
              <h3>耗材健康度 · 進度條 + 預估到期 + 行動</h3>
              <div className="csub">{d.consumables.filter((c) => c.status === 'critical').length} 項立即處理 · {d.consumables.filter((c) => c.status === 'soon').length} 項近期處理</div>
            </div>
            <button className="btn primary ab" style={{ fontSize: 11 }}>
              <Icon name="package" size={12} />批次訂購
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.consumables.map((c) => {
              const meta = CONSUMABLE_STATUS_META[c.status]
              return (
                <div key={c.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: meta.bg, borderRadius: 6 }}>
                  <div style={{ width: 80, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: meta.clr }}>{c.nm}</div>
                    <div style={{ fontSize: 9, color: 'var(--as-mute)' }}>{c.life}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ height: 10, background: '#fff', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--as-line-2)' }}>
                      <div style={{ width: `${c.pct}%`, height: '100%', background: meta.clr }}></div>
                    </div>
                  </div>
                  <div style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: meta.clr }}>{c.pct}%</span>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>≈ {c.daysLeft} 天</div>
                  </div>
                  <button className="btn" style={{ fontSize: 10, padding: '3px 8px', flexShrink: 0 }}>
                    {c.status === 'critical' ? '立即訂購' : c.status === 'soon' ? '加入提醒' : '—'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 時間軸 + AI 建議 ───────────────────── */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch">
            <div>
              <h3>場域時間軸 · 過去 30 天事件流</h3>
              <div className="csub">警報 / 空污 / 水箱 / 服務 · 含客戶反應</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>{d.timeline.length} 筆</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
            {d.timeline.map((ev, i) => {
              const meta = TIMELINE_KIND_META[ev.kind]
              return (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < d.timeline.length - 1 ? '1px solid var(--as-line-2)' : 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: meta.clr + '20', color: meta.clr, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={meta.icon} size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>{ev.date}{ev.time && ` ${ev.time}`}</span>
                      <span className={`pill`} style={{ background: meta.clr + '20', borderColor: meta.clr + '40', color: meta.clr }}>{meta.lbl}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--as-ink)', marginTop: 2 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--as-ink-2)', marginTop: 2 }}>{ev.detail}</div>
                    {ev.reaction && (
                      <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 2, fontStyle: 'italic' }}>
                        → {ev.reaction}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #fff 100%)', borderColor: '#FDE68A' }}>
          <div className="ch">
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="brain" size={16} />AI 顧問建議
              </h3>
              <div className="csub">疑似原因 ①②③ · 對應推薦行動</div>
            </div>
            <span className="pill r">高優先級</span>
          </div>
          <div style={{ padding: 10, background: '#fff', borderRadius: 6, fontSize: 12, color: 'var(--as-ink-2)', marginBottom: 12, lineHeight: 1.6, border: '1px solid var(--as-line-2)' }}>
            {d.aiSummary}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.aiCauses.map((c) => (
              <div key={c.rank} style={{ padding: 10, background: '#fff', borderRadius: 6, border: '1px solid var(--as-line-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--as-h)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{c.rank}</span>
                  <b style={{ fontSize: 12, color: 'var(--as-ink)' }}>{c.cause}</b>
                </div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)', paddingLeft: 30 }}>
                  → <b style={{ color: 'var(--as-primary)' }}>{c.action}</b>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            <button className="btn primary ab" style={{ flex: 1, fontSize: 11 }}>
              <Icon name="send" size={12} />產生主動聯繫腳本
            </button>
            <button className="btn" style={{ flex: 1, fontSize: 11 }}>
              <Icon name="headset" size={12} />安排技師到府
            </button>
          </div>
        </div>
      </div>

      {/* ── 跨層級導航列 ───────────────────── */}
      <div className="card" style={{ marginTop: 16, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--as-mute)' }}>
            <Icon name="layers" size={12} /> 跨層級導航 · 本場域在分群中排名 <b style={{ color: 'var(--as-ink)' }}>#{d.cohortRank}/{d.cohortSize}</b>(同類型平均 {d.cohortAvg} 分)
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn" onClick={onJumpOverview}><Icon name="chart" size={13} />回整體層</button>
            <button className="btn" onClick={onJumpSegments}><Icon name="layers" size={13} />同分群比較</button>
            <button className="btn" onClick={onBackToList}><Icon name="menu" size={13} />回場域清單</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── ModuleA (root) ─────────────────────────────────── */
type ATab = 'overview' | 'segments' | 'personal'

export function ModuleA() {
  const [tab, setTab] = useState<ATab>('overview')
  // 個人層的 sub-tab 與當前場域 id 提到 root,讓整體層 row 點擊可以直接跳場域詳情
  const [personalSubTab, setPersonalSubTab] = useState<APersonalSub>('detail')
  const [currentFieldId, setCurrentFieldId] = useState<string>('SH-2841')

  const openDetailById = (fid: string) => {
    setCurrentFieldId(fid)
    setPersonalSubTab('detail')
    setTab('personal')
  }

  const tabs = [
    { k: 'overview', l: '整體層' },
    { k: 'segments', l: '分群層', n: 3 },
    { k: 'personal', l: '個人層', n: 1284 },
  ]

  return (
    <PageShell
      tk="A"
      tkClass="ab"
      title="居家空氣場域"
      sub="雙核心 · 三層級場域監控"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出</button>
          <button className="btn primary"><Icon name="plus" size={14} />新增場域</button>
        </>
      }
      tabs={tabs}
      activeTab={tab}
      onTab={(k) => setTab(k as ATab)}
    >
      {tab === 'overview' && (
        <AOverview
          onJump={() => setTab('segments')}
          onOpenDetail={openDetailById}
        />
      )}
      {tab === 'segments' && <ASegments onOpenDetail={openDetailById} />}
      {tab === 'personal' && (
        <APersonal
          subTab={personalSubTab}
          setSubTab={setPersonalSubTab}
          currentFieldId={currentFieldId}
          setCurrentFieldId={setCurrentFieldId}
          onJumpOverview={() => setTab('overview')}
          onJumpSegments={() => setTab('segments')}
        />
      )}
    </PageShell>
  )
}

export default ModuleA
