import { useState, Fragment } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import { batchAttrs } from '../../components/ui/BatchAttrs'
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

function AOverview({
  onOpenDetail,
  onJumpListByCategory,
}: {
  onOpenDetail: (fid: string) => void
  /** 點 upsell 卡時跳個人層「場域清單」並鎖定該類別 */
  onJumpListByCategory: (catId: CatId) => void
}) {
  const [heatDim, setHeatDim] = useState<HeatDim>('health')
  // 選中的區域(由區域熱圖點擊帶入,連動下方場域明細表)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const catMeta = (id: CatId) => CATEGORIES.find((c) => c.id === id)!
  const okRow = DISPOSITION_ROLLUP.find((d) => d.key === 'ok')!
  const attnRow = DISPOSITION_ROLLUP.find((d) => d.key === 'attention')!
  const warnRow = DISPOSITION_ROLLUP.find((d) => d.key === 'warning')!

  // 依場域 nm 推斷區域,對應 REGION_HEALTH 的 r 欄位
  const regionOf = (f: FieldRecord): string => {
    const n = f.nm
    if (n.startsWith('臺北') || n.startsWith('台北')) return '臺北市'
    if (n.startsWith('新北')) return '新北市'
    if (n.startsWith('桃園')) return '桃園市'
    if (n.startsWith('新竹')) return '新竹縣市'
    if (n.startsWith('臺中') || n.startsWith('台中')) return '臺中市'
    if (n.startsWith('臺南') || n.startsWith('台南')) return '臺南市'
    if (n.startsWith('高雄')) return '高雄市'
    return '其他'
  }
  // 場域明細表的顯示資料(依選中區域過濾)
  const visibleFields = selectedRegion
    ? FIELDS_A_FULL.filter((f) => regionOf(f) === selectedRegion)
    : FIELDS_A_FULL
  const selectedRegionMeta = selectedRegion ? REGION_HEALTH.find((x) => x.r === selectedRegion) : null

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
      {/* KPI 卡 — 2026-05-29 依 PDF 改成 5 卡:場域 / 連網開機 / 空氣品質 / 空氣濕度 / 環境健康分數 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }} {...batchAttrs('A.KPI')}>
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

        {/* ③ 空氣品質 PM2.5(2026-05-29 依 PDF,原 DHI 改放第 5 卡) */}
        <div className="kpi green">
          <div className="lbl">空氣品質 · PM2.5</div>
          <div className="val">2<span className="u">µg/m³</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="down" size={11} />−1.8 vs 昨日 · WHO 良好</span>
            <Sparkline data={[8, 7, 6, 6, 5, 4, 3, 2]} color="var(--as-success)" />
          </div>
        </div>

        {/* ④ 空氣濕度 58 %(2026-05-29 依 PDF,原類型處置分布移除 — 該圖表在下方六大類型卡仍可見) */}
        <div className="kpi purple">
          <div className="lbl">空氣濕度 · 平均相對</div>
          <div className="val">58<span className="u">%</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />舒適區間 50–60%</span>
            <Sparkline data={[55, 56, 57, 58, 58, 57, 58, 58]} color="var(--as-cdefg)" />
          </div>
        </div>

        {/* ⑤ 平均環境健康分數(2026-05-29 新增,沿用原 DHI 82 分內容) */}
        <div className="kpi orange">
          <div className="lbl">平均環境健康分數</div>
          <div className="val">82<span className="u">分</span></div>
          <div className="ft">
            <span className="delta up">
              <Icon name="up" size={11} />機器貢獻 +{DHI_ATTRIBUTION.contributedBy} 分
            </span>
            <Sparkline data={AHI_TREND} color="var(--as-warning)" />
          </div>
        </div>
      </div>

      {/* 六大類型分布 + 類型流動(Phase 1.5) */}
      <div className="two-col" style={{ marginTop: 16 }}>
        {/* 六大類型分布 */}
        <div className="card" {...batchAttrs('A.整體.六大類型分布')}>
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
        <div className="card" {...batchAttrs('A.整體.類型流動月遷移')}>
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

      {/* 建議聯繫客戶(原 upsell 機會池;2026-05-29 依 PDF 改名 + 卡片點擊跳場域清單篩類別) */}
      <div className="card" style={{ marginTop: 16 }} {...batchAttrs('A.upsell 機會池')}>
        <div className="ch">
          <div>
            <h3>建議聯繫客戶</h3>
            <div className="csub">對應 CS 系列產品訴求 · 三類目標族群 · 共 238 戶 · 點任一卡查看場域清單</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
          {UPSELL_POOL.map((slot) => {
            const meta = catMeta(slot.catId)
            return (
              <div
                key={slot.catId}
                onClick={() => onJumpListByCategory(slot.catId)}
                title={`查看 ${meta.code}(${slot.n} 戶)的場域清單`}
                style={{
                  padding: 14, border: `1px solid ${meta.color}40`,
                  background: meta.bg, borderRadius: 10,
                  cursor: 'pointer', transition: 'transform .12s, box-shadow .12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 14px ${meta.color}33` }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
              >
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
                <div style={{ fontSize: 10, color: 'var(--as-mute)', borderTop: '1px dashed var(--as-line)', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{slot.ltvHint}</span>
                  <button
                    className="btn"
                    style={{ padding: '2px 8px', fontSize: 10, height: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    名單匯出
                  </button>
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
        <div className="card span-2" {...batchAttrs('A.整體.區域熱圖')}>
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
              const isActive = selectedRegion === x.r
              return (
                <div
                  className={`heat ${cls}`}
                  key={x.r}
                  onClick={() => setSelectedRegion(isActive ? null : x.r)}
                  title={isActive ? `取消選取「${x.r}」` : `點擊鎖定「${x.r}」並篩選下方場域明細表`}
                  style={{
                    opacity: heatDim === 'gap' ? 0.85 : 1,
                    cursor: 'pointer',
                    outline: isActive ? '3px solid var(--as-primary)' : 'none',
                    outlineOffset: isActive ? 2 : 0,
                    transform: isActive ? 'scale(1.02)' : 'none',
                    transition: 'transform 0.12s, outline-color 0.12s',
                    position: 'relative',
                  }}
                >
                  <div className="hr">{x.r}</div>
                  <div className="hv">{mainVal}</div>
                  <div className="hn">{x.n} 場域 <span className={`dlt ${dimCls}`}>{subVal}</span></div>
                  {isActive && (
                    <span style={{
                      position: 'absolute', top: 6, right: 6,
                      fontSize: 9, fontWeight: 700, color: '#fff',
                      background: 'var(--as-primary)', padding: '1px 6px',
                      borderRadius: 999,
                    }}>已選</span>
                  )}
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

      {/* 場域明細表(加六大類型欄、室外 PM2.5 欄、日均 hrs 欄)
          · 2026-05-29 連動上方區域熱圖:點區域 → 此表自動篩選 */}
      <div className="dt-wrap" style={{ marginTop: 16 }} {...batchAttrs('A.整體.場域明細表')}>
        {/* 區域篩選 chip(由區域熱圖點擊帶入時顯示) */}
        {selectedRegionMeta && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', marginBottom: 8,
            background: 'var(--as-primary-tint)',
            border: '1px solid var(--as-primary)', borderRadius: 8,
          }}>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>區域篩選 ·</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 999,
              background: 'var(--as-primary)', color: '#fff',
              fontSize: 12, fontWeight: 700,
            }}>
              <Icon name="globe" size={11} />
              {selectedRegionMeta.r}
            </span>
            <span style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>
              該區 <b style={{ color: 'var(--as-primary)' }}>{selectedRegionMeta.n}</b> 場域 · 健康度 {selectedRegionMeta.q}
              <span style={{ color: 'var(--as-mute)', marginLeft: 6 }}>
                · 表內示意 {visibleFields.length} 筆(全體 mock {FIELDS_A_FULL.length} 筆)
              </span>
            </span>
            <button
              className="btn"
              onClick={() => setSelectedRegion(null)}
              style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, height: 'auto' }}
            >
              <Icon name="x" size={11} />清除篩選
            </button>
          </div>
        )}
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
            {visibleFields.map((f) => {
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
          <span>
            {selectedRegionMeta
              ? `顯示 ${visibleFields.length} / ${selectedRegionMeta.n} 筆(區域:${selectedRegionMeta.r})· 點任一列進場域詳情`
              : `顯示 ${visibleFields.length} / 1,284 筆 · 點任一列 → 切到個人層場域詳情 · 「室外 PM2.5」待環境部 API 接通`}
          </span>
          <div className="pager">
            <button>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <span className="ell">…</span>
            <button>{selectedRegionMeta ? Math.max(1, Math.ceil(selectedRegionMeta.n / 9)) : 143}</button>
            <button>›</button>
          </div>
        </div>
      </div>

      {/* 下鑽至分群層區塊已依 2026-05-29 PDF 拿掉 */}
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
      {/* 分群層 hero 已依 2026-05-29 PDF 拉掉 */}

      {/* 統一 2×3 grid(一排兩個):空氣品質 / 濕度控制 / 分群卡 × 3 / 場域類型分佈(右下) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>
        {/* 空氣品質(PM2.5) */}
        <div className="card" {...batchAttrs('A.分群.空品濕度分布')}>
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
        <div className="card" {...batchAttrs('A.分群.空品濕度分布')}>
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
  catFilter,
  setCatFilter,
}: {
  subTab: APersonalSub
  setSubTab: (s: APersonalSub) => void
  currentFieldId: string
  setCurrentFieldId: (fid: string) => void
  onJumpOverview: () => void
  onJumpSegments: () => void
  /** 場域清單類別篩選(由上層 upsell 卡片帶入) */
  catFilter: CatId | null
  setCatFilter: (id: CatId | null) => void
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
          { k: 'consumable', l: '濾網管理' },
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
      {subTab === 'list' && (
        <ALocationList
          onSelect={openDetail}
          catFilter={catFilter}
          onClearCatFilter={() => setCatFilter(null)}
        />
      )}
      {subTab === 'consumable' && <AConsumables onSelect={openDetail} />}
      {subTab === 'tank' && <ATank />}
    </>
  )
}

/* ── 場域清單 (個人層) ───────────────────────────────── */
function ALocationList({
  onSelect,
  catFilter,
  onClearCatFilter,
}: {
  onSelect: (fid: string) => void
  /** 類別篩選(由 upsell 卡片點擊帶入) */
  catFilter?: CatId | null
  onClearCatFilter?: () => void
}) {
  const catMeta = (id: CatId) => CATEGORIES.find((c) => c.id === id)!
  const filteredFields = catFilter
    ? FIELDS_A_FULL.filter((f: FieldRecord) => f.cat === catFilter)
    : FIELDS_A_FULL
  const filterMeta = catFilter ? catMeta(catFilter) : null

  return (
    <div className="dt-wrap" {...(catFilter ? { 'data-cat-filter': catFilter } : {})}>
      {/* 類別篩選 chip(從 upsell 卡片進來時顯示) */}
      {filterMeta && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', marginBottom: 8,
          background: filterMeta.bg, borderRadius: 8,
          border: `1px solid ${filterMeta.color}40`,
        }}>
          <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>篩選類別 ·</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: filterMeta.color, color: '#fff',
            fontSize: 12, fontWeight: 700,
          }}>
            <span style={{ fontFamily: 'var(--f-mono)' }}>{filterMeta.id}</span>
            {filterMeta.code}
          </span>
          <span style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>
            符合 <b style={{ color: filterMeta.color }}>{filteredFields.length}</b> 筆(全體 {FIELDS_A_FULL.length} 筆)
          </span>
          <button
            className="btn"
            onClick={onClearCatFilter}
            style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, height: 'auto' }}
          >
            <Icon name="x" size={11} />清除篩選
          </button>
        </div>
      )}
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
          {filteredFields.map((f: FieldRecord) => {
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
        <span>
          {catFilter
            ? `顯示 ${filteredFields.length} 筆(類別 ${filterMeta?.code})· 點任一列進「場域詳情」`
            : `顯示 ${filteredFields.length} / 1,284 筆 · 點任一列進「場域詳情」`}
        </span>
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
/* 濾網管理 tab — 2026-05-29 依 PDF 重構:
 *  · 拿掉 4 階段 KPI / E 模組 banner / 六類耗材 con-grid / 耗材熱力矩陣
 *  · 改為「裝置清單」+「點裝置→下方耗材狀態聯動」兩段
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AConsumables(_props: { onSelect: (fid: string) => void }) {
  const detail = FIELD_DETAIL_WANG  // 用 SH-2841 王婉真場域為示範
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(detail.devices[0]?.id ?? '')
  const selectedDevice = detail.devices.find((d) => d.id === selectedDeviceId) ?? detail.devices[0]

  // 依裝置 uptimePct 推導該裝置的耗材剩餘 %(uptime 高 → 磨耗快 → 剩餘低)
  // 0% uptime(離線/未使用)→ 基線 × 1.6;100% uptime → 基線 × 0.6
  const deviceWearFactor = (uptimePct: number): number =>
    1.6 - (uptimePct / 100) * 1.0

  const devConsumables = detail.consumables.map((c) => {
    const factor = deviceWearFactor(selectedDevice.uptimePct)
    const pct = Math.max(2, Math.min(100, Math.round(c.pct * factor)))
    const daysLeft = Math.max(0, Math.round(c.daysLeft * factor))
    let status: typeof c.status = 'ok'
    if (pct < 20) status = 'critical'
    else if (pct < 30) status = 'soon'
    else if (pct < 50) status = 'watch'
    return { ...c, pct, daysLeft, status }
  })

  const onlineCount = detail.devices.filter((d) => d.status === 'online').length
  const alertCount = detail.devices.filter((d) => d.status === 'alert').length
  const offlineCount = detail.devices.filter((d) => d.status === 'offline').length

  return (
    <div {...batchAttrs('A.個人.耗材庫存')}>
      {/* ── 裝置清單(可點選,選中後下方耗材狀態聯動) ─────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>裝置清單 · {detail.devices.length} 台</h3>
            <div className="csub">
              {onlineCount} 線上 · {alertCount} 警示 · {offlineCount} 離線 · 點任一台 → 下方顯示該裝置濾網狀態
            </div>
          </div>
          <span className="chip">場域 {detail.fid} · {detail.memberName}</span>
        </div>
        <div className="dt-wrap" style={{ border: 0 }}>
          <table className="dt">
            <thead>
              <tr>
                <th>機台</th>
                <th>型號 / 位置</th>
                <th>狀態</th>
                <th>今日</th>
                <th>在線率</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {detail.devices.map((dev) => {
                const isSelected = dev.id === selectedDeviceId
                return (
                  <tr
                    key={dev.id}
                    onClick={() => setSelectedDeviceId(dev.id)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'var(--as-primary-tint)' : undefined,
                    }}
                    title={isSelected ? '當前裝置' : `查看 ${dev.id} 的濾網狀態`}
                  >
                    <td className="mono" style={{ fontSize: 11, fontWeight: isSelected ? 700 : 400 }}>
                      {isSelected && <span style={{ color: 'var(--as-primary)', marginRight: 4 }}>▸</span>}
                      {dev.id}
                    </td>
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
                    <td>
                      <button
                        className="rowbtn"
                        onClick={(e) => { e.stopPropagation(); setSelectedDeviceId(dev.id) }}
                      >
                        <Icon name="arrow" size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 下方:該裝置的 6 類濾網卡(隨選中聯動,維持原版環圖卡) ─────── */}
      {/* 標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 12, padding: '0 4px' }}>
        <div style={{ fontSize: 13, color: 'var(--as-ink-2)' }}>
          當前裝置 ·
          <span style={{ color: 'var(--as-primary)', fontFamily: 'var(--f-mono)', fontWeight: 700, marginLeft: 6 }}>{selectedDevice.id}</span>
          <span style={{ color: 'var(--as-mute)', marginLeft: 6 }}>
            {selectedDevice.model} · {selectedDevice.room} · 在線率 {selectedDevice.uptimePct}% · 依此推導磨耗
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--as-mute)' }}>
          <span style={{ color: 'var(--as-danger)', fontFamily: 'var(--f-mono)' }}>● {devConsumables.filter(c => c.status === 'critical').length}</span> 立即
          <span style={{ color: 'var(--as-warning)', fontFamily: 'var(--f-mono)' }}>● {devConsumables.filter(c => c.status === 'soon').length}</span> 近期
          <span style={{ color: '#4F46E5', fontFamily: 'var(--f-mono)' }}>● {devConsumables.filter(c => c.status === 'watch').length}</span> 觀察
        </div>
      </div>

      {/* 6 類耗材環圖卡(con-grid · 維持原 PRE-FILTER / ECF·L / ECF·R / HEPA / PLASMA / UV-C 樣式) */}
      <div className="con-grid">
        {CONSUMABLE_CATS.map((c) => {
          // 依該裝置在線率縮放此類耗材的平均剩餘 %
          const factor = deviceWearFactor(selectedDevice.uptimePct)
          const avg = Math.max(2, Math.min(100, Math.round(c.avg * factor)))
          const t = tone(avg)
          // 4 階段分布也按 factor 重新分配(在線率高 → 更多落到立即/近期)
          const total = c.dist.i + c.dist.n + c.dist.w + c.dist.r
          const shiftPct = (1 - factor) * 0.4  // 0..0.4
          const newI = Math.round(c.dist.i + total * shiftPct * 0.5)
          const newN = Math.round(c.dist.n + total * shiftPct * 0.3)
          const newR = Math.max(0, Math.round(c.dist.r - total * shiftPct * 0.5))
          const newW = Math.max(0, total - newI - newN - newR)
          const dist = { i: newI, n: newN, w: newW, r: newR }

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
                    strokeDasharray={`${avg / 100 * 2 * Math.PI * 34} 999`}
                    transform="rotate(-90 40 40)" />
                  <text x="40" y="42" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--as-ink)" fontFamily="var(--f-mono)">{avg}</text>
                  <text x="40" y="55" textAnchor="middle" fontSize="9" fill="var(--as-mute)">% 平均</text>
                </svg>
                <div className="con-tone" style={{ background: t.bg, color: t.clr }}>{t.lbl}</div>
              </div>
              <div className="con-dist">
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-danger)' }}></span><span className="l">立即</span><span className="v">{dist.i}</span></div>
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-warning)' }}></span><span className="l">近期</span><span className="v">{dist.n}</span></div>
                <div className="con-dr"><span className="d" style={{ background: '#4F46E5' }}></span><span className="l">觀察</span><span className="v">{dist.w}</span></div>
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-mute-2)' }}></span><span className="l">備料</span><span className="v">{dist.r}</span></div>
              </div>
              <div className="con-stack">
                {(['i', 'n', 'w', 'r'] as const).map((s) => {
                  const v = dist[s]
                  const bg = s === 'i' ? 'var(--as-danger)' : s === 'n' ? 'var(--as-warning)' : s === 'w' ? '#4F46E5' : 'var(--as-mute-2)'
                  return <div key={s} style={{ width: `${v / total * 100}%`, background: bg, height: '100%' }}></div>
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)' }}>
        <Icon name="package" size={12} /> <b style={{ color: 'var(--as-ink-2)' }}>聯動規則:</b>
        上方點選裝置 → 下方 6 類濾網卡依該裝置的在線率推導(在線率越高,平均剩餘 % 越低、立即/近期數量越多)。
      </div>
    </div>
  )
}

/* ── 水箱管理 ────────────────────────────────────────── */
/* 水箱管理 tab — 2026-05-29 依 PDF 改成與濾網管理相同結構:
 *  · 拿掉 5 KPI / P90 警示 banner / 倒水節奏+分位數雙圖 / 異常場域明細表
 *  · 改為「裝置清單」+「點裝置→下方水箱資料聯動」
 */
function ATank() {
  const detail = FIELD_DETAIL_WANG  // 用 SH-2841 王婉真場域為示範
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(detail.devices[0]?.id ?? '')
  const selectedDevice = detail.devices.find((d) => d.id === selectedDeviceId) ?? detail.devices[0]

  // 依裝置 uptimePct 推導該裝置的水箱統計(在線率越高 → 倒水事件越多、平均清除時間越長)
  const factor = selectedDevice.uptimePct / 100  // 0..1
  const eventsWeek = Math.round(180 * factor + 8)         // 8 ~ 188 次/週
  const avgClearH = Number((28 * (1 - factor) + 6 * factor).toFixed(1))  // 6 ~ 28 h
  const p50 = Number((avgClearH * 0.7).toFixed(1))
  const p90 = Number((avgClearH * 2.1).toFixed(1))
  const maxH = Math.round(p90 * 4.2)
  const triggered = p90 > 24  // P90 > 24h → 觸發 E 模組
  const onlineCount = detail.devices.filter((d) => d.status === 'online').length
  const alertCount = detail.devices.filter((d) => d.status === 'alert').length
  const offlineCount = detail.devices.filter((d) => d.status === 'offline').length

  // 該裝置 24h 倒水節奏(依在線率縮放,離線裝置幾乎 0)
  const baseHourly = [4, 2, 1, 1, 1, 2, 4, 8, 12, 14, 11, 8, 9, 7, 6, 6, 7, 9, 11, 14, 13, 10, 8, 5]
  const devHourly = baseHourly.map((v) => Math.round(v * Math.max(0.1, factor)))
  const hMax = Math.max(...devHourly, 1)

  return (
    <div {...batchAttrs('A.個人.水箱管理')}>
      {/* ── 裝置清單(可點選,選中後下方水箱資料聯動) ─────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>裝置清單 · {detail.devices.length} 台</h3>
            <div className="csub">
              {onlineCount} 線上 · {alertCount} 警示 · {offlineCount} 離線 · 點任一台 → 下方顯示該裝置水箱資料
            </div>
          </div>
          <span className="chip">場域 {detail.fid} · {detail.memberName}</span>
        </div>
        <div className="dt-wrap" style={{ border: 0 }}>
          <table className="dt">
            <thead>
              <tr>
                <th>機台</th>
                <th>型號 / 位置</th>
                <th>狀態</th>
                <th>今日</th>
                <th>在線率</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {detail.devices.map((dev) => {
                const isSelected = dev.id === selectedDeviceId
                return (
                  <tr
                    key={dev.id}
                    onClick={() => setSelectedDeviceId(dev.id)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'var(--as-primary-tint)' : undefined,
                    }}
                    title={isSelected ? '當前裝置' : `查看 ${dev.id} 的水箱資料`}
                  >
                    <td className="mono" style={{ fontSize: 11, fontWeight: isSelected ? 700 : 400 }}>
                      {isSelected && <span style={{ color: 'var(--as-primary)', marginRight: 4 }}>▸</span>}
                      {dev.id}
                    </td>
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
                    <td>
                      <button
                        className="rowbtn"
                        onClick={(e) => { e.stopPropagation(); setSelectedDeviceId(dev.id) }}
                      >
                        <Icon name="arrow" size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 下方:該裝置的水箱資料(隨選中聯動,維持原雙欄圖表) ─────── */}
      {/* 標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 4, padding: '0 4px' }}>
        <div style={{ fontSize: 13, color: 'var(--as-ink-2)' }}>
          當前裝置 ·
          <span style={{ color: 'var(--as-primary)', fontFamily: 'var(--f-mono)', fontWeight: 700, marginLeft: 6 }}>{selectedDevice.id}</span>
          <span style={{ color: 'var(--as-mute)', marginLeft: 6 }}>
            {selectedDevice.model} · {selectedDevice.room} · 在線率 {selectedDevice.uptimePct}%
          </span>
        </div>
        {triggered && (
          <span style={{ fontSize: 11, color: 'var(--as-danger)', fontWeight: 700, padding: '3px 10px', background: 'var(--as-danger-tint)', border: '1px solid var(--as-danger)', borderRadius: 999 }}>
            ★ P90 &gt; 24h · 已觸發 E
          </span>
        )}
      </div>

      <div className="two-col" style={{ marginTop: 12 }}>
        {/* 倒水節奏 · 24 小時分布(維持原版) */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>倒水節奏 · 24 小時分布</h3>
              <div className="csub">深色柱 = 工作日 · 淺色 = 週末 · 峰值 09:00 / 19:00</div>
            </div>
          </div>
          <div className="tank-24h">
            {devHourly.map((v, i) => {
              const isWeekendPeak = (i === 10 || i === 11 || i === 14 || i === 15)
              return (
                <div className="t24" key={i}>
                  <div className="t24-b" style={{
                    height: `${v / hMax * 120}px`,
                    background: isWeekendPeak ? 'var(--as-cdefg)' : 'var(--as-primary)',
                    opacity: isWeekendPeak ? 0.55 : 1,
                  }}></div>
                  {(i % 3 === 0) && <div className="t24-l">{String(i).padStart(2, '0')}</div>}
                </div>
              )
            })}
          </div>
          <div className="tank-week">
            <div className="twr">
              <span className="lbl">工作日平均</span>
              <span className="ev">{Math.round(eventsWeek * 0.62)} 次/日</span>
              <span className="dur">{avgClearH} h 平均清除</span>
            </div>
            <div className="twr">
              <span className="lbl">週末平均</span>
              <span className="ev">{Math.round(eventsWeek * 0.38)} 次/日</span>
              <span className="dur">{(avgClearH * 1.3).toFixed(1)} h 平均清除</span>
            </div>
          </div>
        </div>

        {/* 清除時間分位數 · 30 天(維持原版) */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>清除時間分位數 · 30 天</h3>
              <div className="csub">紅線標示 P90 觸發閾值 (24h)</div>
            </div>
          </div>
          <div className="tank-pct">
            {(() => {
              const denom = Math.max(maxH, 24)
              const rows = [
                { k: '最快',    v: Number((avgClearH * 0.04).toFixed(1)), c: 'var(--as-success)' },
                { k: 'P25',    v: Number((avgClearH * 0.37).toFixed(1)), c: 'var(--as-success)' },
                { k: 'P50 中位', v: p50,                                  c: 'var(--as-success)' },
                { k: '平均',    v: avgClearH,                             c: 'var(--as-cdefg)' },
                { k: 'P75',    v: Number((avgClearH * 1.47).toFixed(1)), c: 'var(--as-cdefg)' },
                { k: 'P90',    v: p90,                                    c: triggered ? 'var(--as-danger)' : 'var(--as-warning)' },
                { k: '最長',    v: maxH,                                  c: 'var(--as-danger)' },
              ]
              return rows.map((p) => (
                <div className="tpr" key={p.k}>
                  <div className="tpk">{p.k}</div>
                  <div className="tpb">
                    <div className="tpf" style={{ width: `${Math.min(100, p.v / denom * 100)}%`, background: p.c }}></div>
                    <div className="tp-line" style={{ left: `${Math.min(100, 24 / denom * 100)}%` }}></div>
                  </div>
                  <div className="tpv mono">{p.v} h{p.k === 'P90' && triggered ? ' ⚠' : ''}</div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)' }}>
        <Icon name="drop" size={12} /> <b style={{ color: 'var(--as-ink-2)' }}>聯動規則:</b>
        上方點選裝置 → 下方雙圖依該裝置的在線率推導(在線率越高,事件越密、清除時間越長);P90 &gt; 24h 自動觸發 E 模組主動聯繫。
      </div>
    </div>
  )
}

/* ── 場域詳情 (個人層 · 場域 360°) ──────────────────── */

// CONSUMABLE_STATUS_META 已隨「場域詳情·耗材健康度」雙欄拿掉而移除(2026-05-29)

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

/* ── 除溼運作熱力圖(2026-05-29 新增,依 PDF,淡藍色表示有啟動除濕功能) ───── */
function WeekDehumidHeatmap({ detail }: { detail: FieldDetail }) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  // 4 階淡藍色:關閉(灰) / 微弱 / 中等 / 強除濕
  const dehumidColors = ['#F3F4F6', '#DBEAFE', '#93C5FD', '#3B82F6']
  // 由使用節奏推導:強度 ≥ 2 且該時段為高濕度時段(下午/夜間)時啟動除濕
  // mock 推測:使用強度 v ≥ 2 在 09:00–11:00 與 18:00–23:00 時段啟動除濕
  const isWetWindow = (h: number) => (h >= 9 && h <= 11) || (h >= 18 && h <= 23)
  const dehumidIntensity = (v: number, h: number): number => {
    if (v === 0) return 0
    if (!isWetWindow(h)) return v >= 3 ? 1 : 0
    if (v === 1) return 1
    if (v === 2) return 2
    return 3
  }
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
            {row.map((v, hi) => {
              const lvl = dehumidIntensity(v, hi)
              const lvlLabel = lvl === 0 ? '未啟動' : lvl === 1 ? '微弱' : lvl === 2 ? '中等' : '強除濕'
              return (
                <div
                  key={hi}
                  title={`週${days[di]} ${hi}:00 · ${lvlLabel}`}
                  style={{ height: 18, background: dehumidColors[lvl], borderRadius: 2 }}
                ></div>
              )
            })}
          </Fragment>
        ))}
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--as-mute)' }}>
        <span>除濕運作</span>
        {dehumidColors.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, background: c, borderRadius: 2, display: 'inline-block' }}></span>
            {i === 0 ? '未啟動' : i === 1 ? '微弱' : i === 2 ? '中等' : '強除濕'}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8, padding: 8, background: '#EFF6FF', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)' }}>
        <Icon name="drop" size={12} /> <b>除濕高峰</b> · 早晨 09:00–11:00、夜間 18:00–23:00(濕度 &gt; 70% 自動啟動);白天工作時段以送風為主。
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
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }} {...batchAttrs('A.個人.場域詳情')}>
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
          <div className="lbl">空氣濕度 · 平均相對</div>
          <div className="val">{d.humidity}<span className="u">%</span></div>
          <div className="ft">
            <span className="delta">{d.comfort} · 室溫 {d.temp}°C</span>
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

      {/* ── 24h × 7 天 除溼運作熱力圖(2026-05-29 依 PDF 新增,放在使用節奏圖下方) ─── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>除溼運作熱力圖 · 24h × 7 天</h3>
            <div className="csub">淡藍色表示有啟動除濕功能 · 對應 ④/⑥ 除濕需求型客戶</div>
          </div>
        </div>
        <WeekDehumidHeatmap detail={d} />
      </div>

      {/* 設備清單 + 耗材健康度雙欄區塊已依 2026-05-29 PDF 拿掉 */}

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
  // 場域清單類別篩選(由整體層 upsell 卡片點擊帶入)
  const [catFilter, setCatFilter] = useState<CatId | null>(null)

  const openDetailById = (fid: string) => {
    setCurrentFieldId(fid)
    setPersonalSubTab('detail')
    setTab('personal')
  }

  /** 從整體層 upsell 卡片進入個人層「場域清單」並鎖定類別 */
  const openCategoryList = (cid: CatId) => {
    setCatFilter(cid)
    setPersonalSubTab('list')
    setTab('personal')
  }

  const tabs = [
    { k: 'overview', l: '整體場域' },
    { k: 'segments', l: '分類概況' },
    { k: 'personal', l: '個人場域資訊' },
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
          onOpenDetail={openDetailById}
          onJumpListByCategory={openCategoryList}
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
          catFilter={catFilter}
          setCatFilter={setCatFilter}
        />
      )}
    </PageShell>
  )
}

export default ModuleA
