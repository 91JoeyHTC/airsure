import { useState, useMemo, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMemberByCode } from '../../hooks/useMember360'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import { batchAttrs } from '../../components/ui/BatchAttrs'
import {
  FIELDS_A_FULL,
  FIELDS_A_POP,
  REAL_FIELD_IDS,
  FIELD_DELTAS,
  REGION_HEALTH,
  SITE_TYPES,
  AHI_TREND,
  SEGMENTS_A,
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
  WHO_PM25_GUIDELINE,
  getFieldDetail,
  reportGateOf,
  type CatId,
  type CategoryMeta,
  type Disposition,
  type FieldRecord,
  type FieldDetail,
  type FieldConsumable,
} from '../../mocks/module-a'
import {
  ALL,
  DEFAULT_FILTERS,
  FILTER_OPTIONS,
  PM_BUCKETS,
  HUMIDITY_BUCKETS,
  TIME_RANGES,
  filterFields,
  computeOverviewKpi,
  metricsFor,
  activeFilterCount,
  computeAirQualityDist,
  computeHumidityDist,
  computeUsageDist,
  computePowerDist,
  computeModeDist,
  FAN_SPEED_DIST,
  FAN_SPEED_SOURCE,
  type OverviewFilters,
  type TierCount,
  type DonutSlice,
} from '../../mocks/module-a-overview'
import { DEVICE_BY_FIELD_ID } from '../../mocks/devices'
import type { DeviceReport } from '../../mocks/devices'
import { AFieldList } from './AFieldList'

/* ── helpers ─────────────────────────────────────────── */
/* 耗材緊急度 → 標籤與顏色。緊急度本身由資料層判定(見 mocks/module-a.ts 的 urgencyOf),
 * 真實設備則直接沿用報告給的 urgency 文字,前端一律不重算。
 * 判準是「剩餘百分比」:<20% 立即 / 20–50% 近期 / ≥50% 持續觀察。
 * 反證:C2026010088 的前置濾網剩 175.4 天(83.2%)判持續觀察,
 *       ECF 剩 176.2 天(41.0%)判近期處理 —— 天數幾乎相同,所以判準不是天數。 */
const STATUS_LABEL: Record<FieldConsumable['status'], { lbl: string; clr: string; bg: string }> = {
  critical: { lbl: '立即處理', clr: 'var(--as-danger)',  bg: '#FEE4E2' },
  soon:     { lbl: '近期處理', clr: 'var(--as-warning)', bg: '#FEF0C7' },
  watch:    { lbl: '持續觀察', clr: '#4F46E5',           bg: '#EEF0FF' },
  ok:       { lbl: '更換備料', clr: 'var(--as-mute)',    bg: '#F3F4F6' },
}

/* ── 設備總覽(第一層) ───────────────────────────────── */
type HeatDim = 'health' | 'type' | 'gap'

/** 明細表每頁列數。母體 1,284 筆,一次全渲染會卡,所以分頁是真的。 */
const OVERVIEW_PAGE_SIZE = 20

/** 分頁按鈕:頭尾各留一顆、當前頁前後各一顆,其餘以 -1 代表省略號。
 *  1,284 筆 / 20 = 65 頁,全列出來會把 dt-foot 撐爆。 */
function pageWindow(current: number, count: number): number[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i)
  const keep = new Set([0, count - 1, current - 1, current, current + 1])
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    if (keep.has(i) && i >= 0) { out.push(i); continue }
    if (out[out.length - 1] !== -1) out.push(-1)
  }
  return out
}

/* 篩選列的下拉。六個條件共用同一個外觀,避免各寫各的樣式。 */
function OvFilter({ label, value, options, onChange }: {
  label: string
  value: string
  options: { k: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--as-mute)', whiteSpace: 'nowrap' }}>
      {label}
      <select className="fsel" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.k} value={o.k}>{o.label}</option>)}
      </select>
    </label>
  )
}

/* 級距分布卡(空氣品質 / 濕度控制)。兩張結構相同,筆數一律由
 * computeAirQualityDist / computeHumidityDist 依當前 filtered 母體算好才傳進來。
 * 每一級下方的分群 chip 也是算出來的,不是硬綁 —— 舊版寫死的 catIds 讓「過乾」
 * 那一級對不到任何分群。 */
function TierDistCard({ icon, title, sub, headline, tiers, catMeta, batch }: {
  icon: 'wind' | 'drop'
  title: string
  sub: string
  headline: string
  tiers: TierCount[]
  catMeta: (id: CatId) => CategoryMeta
  batch: string
}) {
  return (
    <div className="card" {...batchAttrs(batch)}>
      <div className="ch">
        <div>
          <h3><Icon name={icon} size={14} /> {title}</h3>
          <div className="csub">{sub}</div>
        </div>
        <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>{headline}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {tiers.map((d) => (
          <div key={d.lvl} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 28, borderRadius: 6, background: d.bg,
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
              {d.cats.length > 0 && (
                <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {d.cats.map((id) => {
                    const m = catMeta(id)
                    return (
                      <span key={id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: 9, padding: '1px 6px', borderRadius: 8,
                        background: m.bg, color: m.color, fontWeight: 600,
                      }}>{m.id} {m.code}</span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* 甜甜圈分布卡(設備使用四張)。左環右圖例表,圖例同時就是資料表 ——
 * 顏色不是唯一的識別管道,色盲或列印時仍讀得到標籤與數值。
 * 色盤 VIZ_SERIES 已跑過 dataviz 驗證器(見 mocks/module-a-overview.ts),
 * 順序固定;超過 7 類一律折進「其他」,不再生第 8 個色。 */
function DonutCard({ title, sub, note, slices, unit, batch }: {
  title: string
  sub: string
  /** 卡片右上的來源/口徑說明 */
  note?: string
  slices: DonutSlice[]
  unit: string
  batch: string
}) {
  const [hover, setHover] = useState<string | null>(null)
  const R = 54, W = 20
  const C = 2 * Math.PI * R
  /* 段與段之間留 2px 底色縫,相鄰色塊才不會黏成一片 */
  const gap = (2 / C) * 100
  const total = slices.reduce((n, x) => n + x.n, 0)
  const active = slices.find((x) => x.k === hover) ?? null

  /* 位移由前面各段的累計算出,不在 map 裡累加變數 —— 跨 render 改寫閉包變數
     會被 React compiler 擋下,而且切片數最多 8 個,重算成本可以忽略。 */
  const arcs = slices.map((x, i) => {
    const len = total === 0 ? 0 : (x.n / total) * 100
    const before = slices.slice(0, i).reduce((n, y) => n + y.n, 0)
    return { ...x, len: Math.max(0, len - gap), offset: total === 0 ? 0 : (before / total) * 100 }
  })

  return (
    <div className="card" {...batchAttrs(batch)}>
      <div className="ch">
        <div>
          <h3>{title}</h3>
          <div className="csub">{sub}</div>
        </div>
        {note && <span style={{ fontSize: 10, color: 'var(--as-mute)', textAlign: 'right', maxWidth: 190 }}>{note}</span>}
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 8 }}>
        <div style={{ position: 'relative', flex: 'none', width: 150, height: 150 }}>
          <svg viewBox="0 0 150 150" width="150" height="150" role="img" aria-label={title}>
            <circle cx="75" cy="75" r={R} fill="none" stroke="var(--as-line-2)" strokeWidth={W} />
            {arcs.map((a) => (
              <circle
                key={a.k}
                cx="75" cy="75" r={R} fill="none"
                stroke={a.color}
                strokeWidth={hover === a.k ? W + 5 : W}
                pathLength={100}
                strokeDasharray={`${a.len} ${100 - a.len}`}
                strokeDashoffset={-a.offset}
                transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-width .12s', cursor: 'pointer', opacity: hover && hover !== a.k ? 0.35 : 1 }}
                onMouseEnter={() => setHover(a.k)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${a.label} ${a.n.toLocaleString()} ${unit} (${a.pct}%)`}</title>
              </circle>
            ))}
          </svg>
          {/* 中心讀數:平常是總數,滑到某一段時換成該段 —— 甜甜圈的中心不該空著 */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', textAlign: 'center',
          }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: 'var(--as-ink)', lineHeight: 1.1 }}>
              {(active ? active.n : total).toLocaleString()}
              <span style={{ fontSize: 10, color: 'var(--as-mute)', fontWeight: 400, marginLeft: 2 }}>{unit}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--as-mute)', marginTop: 2, maxWidth: 96, lineHeight: 1.25 }}>
              {active ? `${active.label} · ${active.pct}%` : '合計'}
            </div>
          </div>
        </div>

        {/* 圖例即資料表 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 10px',
            fontSize: 10, color: 'var(--as-mute)', paddingBottom: 4,
            borderBottom: '1px solid var(--as-line-2)',
          }}>
            <span></span><span style={{ textAlign: 'right' }}>設備數</span><span style={{ textAlign: 'right', width: 44 }}>佔比</span>
          </div>
          {slices.map((x) => (
            <div
              key={x.k}
              onMouseEnter={() => setHover(x.k)}
              onMouseLeave={() => setHover(null)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 10px',
                alignItems: 'center', padding: '4px 4px', margin: '0 -4px', borderRadius: 4,
                background: hover === x.k ? 'var(--as-bg)' : 'transparent', cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: x.color, flex: 'none' }} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--as-ink-2)', fontWeight: 600 }}>{x.label}</span>
                  {x.sub && <span style={{ display: 'block', fontSize: 9.5, color: 'var(--as-mute)', lineHeight: 1.3 }}>{x.sub}</span>}
                </span>
              </span>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--as-ink)', textAlign: 'right' }}>
                {x.n.toLocaleString()}
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--as-mute)', textAlign: 'right', width: 44 }}>
                {x.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* KPI 字卡。七張同一個形狀,值一律由 computeOverviewKpi 算好才傳進來 —— 元件不做計算。 */
function OvKpi({ tone, lbl, val, unit, foot, footTone = '', spark, sparkColor }: {
  tone: 'green' | 'purple' | 'orange' | 'red'
  lbl: string
  val: string
  unit: string
  foot: string
  footTone?: '' | 'up' | 'dn'
  spark?: number[]
  sparkColor?: string
}) {
  return (
    <div className={`kpi ${tone}`}>
      <div className="lbl">{lbl}</div>
      <div className="val">{val}<span className="u">{unit}</span></div>
      <div className="ft">
        <span className={`delta ${footTone}`}>{foot}</span>
        {spark && <Sparkline data={spark} color={sparkColor} />}
      </div>
    </div>
  )
}

function AOverview({
  onOpenDetail,
  onJumpListByCategory,
}: {
  onOpenDetail: (fid: string) => void
  /** 點 upsell 卡時跳個人層「場域清單」並鎖定該類別 */
  onJumpListByCategory: (catId: CatId) => void
}) {
  const [heatDim, setHeatDim] = useState<HeatDim>('health')
  /* 六個篩選 + 區域。KPI 字卡、Top5 / 需關注、明細表全部吃同一份 filtered 母體 ——
   * 分開算會讓字卡與表在同一個篩選下報出不同數字。判定在 mocks/module-a-overview.ts。 */
  const [filters, setFilters] = useState<OverviewFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(0)
  const setFilter = <K extends keyof OverviewFilters>(k: K, v: OverviewFilters[K]) => {
    setFilters((prev) => ({ ...prev, [k]: v }))
    setPage(0)
  }
  const selectedRegion = filters.region

  const catMeta = (id: CatId) => CATEGORIES.find((c) => c.id === id)!

  /* 1,284 場域,篩選一次就好 —— 翻頁不該重算母體 */
  const rows = useMemo(() => filterFields(filters), [filters])
  const kpi = useMemo(() => computeOverviewKpi(rows, filters.range), [rows, filters.range])
  const rangeMetrics = (f: FieldRecord) => metricsFor(f, filters.range)
  const activeCount = activeFilterCount(filters)
  /* 篩到 0 筆時平均值沒有意義 —— 顯示破折號,不要讓 NaN 上檯面 */
  const empty = rows.length === 0

  /* 類型分布與 upsell 戶數也吃 filtered 母體 —— 只有 KPI 動、分布卡不動的話,
   * 同一畫面會出現「21 場域」與「全 1,284 場域」兩套數字。 */
  const catDist = CATEGORY_DIST.map((d) => {
    const n = rows.filter((f) => f.cat === d.id).length
    return { id: d.id, n, pct: rows.length === 0 ? 0 : Math.round((n / rows.length) * 1000) / 10 }
  })
  const dispCount = (key: Disposition) => {
    const ids = DISPOSITION_ROLLUP.find((r) => r.key === key)!.catIds
    return rows.filter((f) => ids.includes(f.cat)).length
  }
  const upsellCount = (cid: CatId) => rows.filter((f) => f.cat === cid).length
  const airTiers = useMemo(() => computeAirQualityDist(rows, filters.range), [rows, filters.range])
  const humTiers = useMemo(() => computeHumidityDist(rows, filters.range), [rows, filters.range])
  const usageDist = useMemo(() => computeUsageDist(rows), [rows])
  const powerDist = useMemo(() => computePowerDist(rows), [rows])
  const modeDist = useMemo(() => computeModeDist(rows), [rows])

  const pageCount = Math.max(1, Math.ceil(rows.length / OVERVIEW_PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const visibleFields = rows.slice(current * OVERVIEW_PAGE_SIZE, current * OVERVIEW_PAGE_SIZE + OVERVIEW_PAGE_SIZE)
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
      {/* 篩選列 —— 六個條件同時作用在 KPI 字卡與下方明細表(2026-09-03) */}
      <div className="fb" style={{ marginBottom: 16 }} {...batchAttrs('A.設備總覽.篩選列')}>
        <OvFilter
          label="機型" value={filters.model}
          options={[{ k: ALL, label: '全部' }, ...FILTER_OPTIONS.model.map((m) => ({ k: m, label: m }))]}
          onChange={(v) => setFilter('model', v as OverviewFilters['model'])}
        />
        <OvFilter
          label="電源" value={filters.power}
          options={[{ k: ALL, label: '全部' }, ...FILTER_OPTIONS.power.map((m) => ({ k: m, label: m }))]}
          onChange={(v) => setFilter('power', v as OverviewFilters['power'])}
        />
        <OvFilter
          label="使用模式" value={filters.mode}
          options={[{ k: ALL, label: '全部' }, ...FILTER_OPTIONS.mode.map((m) => ({ k: m, label: m }))]}
          onChange={(v) => setFilter('mode', v as OverviewFilters['mode'])}
        />
        <OvFilter
          label="PM2.5" value={filters.pm}
          options={[{ k: ALL, label: '全部' }, ...PM_BUCKETS.map((b) => ({ k: b.k, label: b.label }))]}
          onChange={(v) => setFilter('pm', v)}
        />
        <OvFilter
          label="濕度" value={filters.humidity}
          options={[{ k: ALL, label: '全部' }, ...HUMIDITY_BUCKETS.map((b) => ({ k: b.k, label: b.label }))]}
          onChange={(v) => setFilter('humidity', v)}
        />
        <OvFilter
          label="時間區間" value={filters.range}
          options={TIME_RANGES.map((r) => ({ k: r.k, label: r.label }))}
          onChange={(v) => setFilter('range', v as OverviewFilters['range'])}
        />
        {selectedRegionMeta && (
          <span
            className="chip on"
            style={{ cursor: 'pointer' }}
            title="清除區域篩選"
            onClick={() => setFilter('region', null)}
          >
            <Icon name="globe" size={11} />
            {selectedRegionMeta.r}
            <Icon name="x" size={10} />
          </span>
        )}
        <span className="sp"></span>
        <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>
          已套用 {activeCount} 項
        </span>
        <button
          className="btn"
          disabled={activeCount === 0 && filters.range === DEFAULT_FILTERS.range}
          onClick={() => { setFilters(DEFAULT_FILTERS); setPage(0) }}
          style={{ padding: '4px 10px', fontSize: 11, height: 'auto', whiteSpace: 'nowrap' }}
        >
          <Icon name="x" size={11} />清除
        </button>
      </div>

      {/* KPI 七格(2026-09-03 依需求改版):第一排現況指標、第二排待處理量 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }} {...batchAttrs('A.KPI')}>
        <OvKpi
          tone="green" lbl="連網設備數" val={kpi.devices.toLocaleString()} unit="台"
          foot={`今日開機 ${kpi.online.toLocaleString()} 台 · ${kpi.onlinePct}%`} footTone="up"
          spark={[83.2, 84.1, 85.4, 86.2, 86.8, 87.1, 87.4, 87.5]} sparkColor="var(--as-cdefg)"
        />
        <OvKpi
          tone="green" lbl="平均 PM2.5" val={empty ? '—' : kpi.pm.toFixed(1)} unit="µg/m³"
          foot={`WHO 指引 ${WHO_PM25_GUIDELINE} µg/m³ 以下`} footTone="up"
          spark={[6.8, 6.2, 5.6, 5.1, 4.8, 4.6, 4.3, 4.1]} sparkColor="var(--as-success)"
        />
        <OvKpi
          tone="purple" lbl="平均濕度" val={empty ? '—' : String(kpi.humidity)} unit="%"
          foot="v2 舒適區間 H1 · >45–60%" footTone={!empty && kpi.humidity > 45 && kpi.humidity <= 60 ? 'up' : ''}
          spark={[58, 59, 60, 60, 61, 61, 61, 61]} sparkColor="var(--as-cdefg)"
        />
        <OvKpi
          tone="purple" lbl="平均溫度" val={empty ? '—' : kpi.temp.toFixed(1)} unit="°C"
          foot="舒適區間 24–27°C" footTone={!empty && kpi.temp >= 24 && kpi.temp <= 27 ? 'up' : ''}
          spark={[26.1, 26.3, 26.4, 26.6, 26.8, 26.7, 26.6, 26.6]} sparkColor="var(--as-h)"
        />
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <OvKpi
          tone="orange" lbl="平均 AirCare 分數" val={empty ? '—' : String(kpi.score)} unit="分"
          foot={`機器貢獻 +${DHI_ATTRIBUTION.contributedBy} 分`} footTone="up"
          spark={AHI_TREND} sparkColor="var(--as-warning)"
        />
        <OvKpi
          tone="red" lbl="耗材立即處理數" val={kpi.urgent.toLocaleString()} unit="台"
          foot="耗材殘量 < 20% · 需派工" footTone="dn"
        />
        <OvKpi
          tone="red" lbl="警報設備數" val={kpi.alarms.toLocaleString()} unit="台"
          foot="有未解除警報" footTone="dn"
        />
      </div>

      {/* 母體來源說明 —— 真實 vs 示範一定要分得出來(AGENTS.md §10) */}
      <div style={{
        marginTop: 12, padding: '8px 12px', borderRadius: 8,
        background: 'var(--as-bg)', border: '1px solid var(--as-line-2)',
        fontSize: 11, color: 'var(--as-ink-2)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      }} {...batchAttrs('A.設備總覽.母體來源')}>
        <Icon name="layers" size={12} />
        <span>
          目前條件下 <b>{kpi.fields.toLocaleString()}</b> 場域 · <b>{kpi.devices.toLocaleString()}</b> 台設備
          {activeCount > 0 && <span style={{ color: 'var(--as-mute)' }}>(全體 {FIELDS_A_POP.length.toLocaleString()} 場域 / {TODAY_POWER_ON.total.toLocaleString()} 台)</span>}
        </span>
        <span style={{ color: 'var(--as-mute)' }}>
          其中 {kpi.realFields} 場域 / {kpi.realDevices} 台為 AirCare 報告真實設備,量測值由 90 天 daily 真算;
          其餘為示範資料,時間區間差異為決定性示意值。
        </span>
      </div>

      {/* 空氣品質 / 濕度控制 —— 級距是分群的兩個輸入軸,擺在七分群分布上面,
          由「級距 → 分群」的順序讀下來(2026-09-03 從分類概況搬過來) */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <TierDistCard
          icon="wind" title="空氣品質" batch="A.設備總覽.空品濕度分布"
          sub={`PM2.5 · v2 報告級距 5 級 · ${activeCount > 0 ? '目前條件' : '全部'} ${rows.length.toLocaleString()} 場域`}
          headline={empty ? '—' : `${(airTiers[0].pct + airTiers[1].pct).toFixed(1)}% 達極淨／優良`}
          tiers={airTiers} catMeta={catMeta}
        />
        <TierDistCard
          icon="drop" title="濕度控制" batch="A.設備總覽.空品濕度分布"
          sub={`相對濕度 · v2 分群等級 HH–H4 · ${activeCount > 0 ? '目前條件' : '全部'} ${rows.length.toLocaleString()} 場域`}
          headline={empty ? '—' : `${humTiers[1].pct.toFixed(1)}% 處於舒適區 H1`}
          tiers={humTiers} catMeta={catMeta}
        />
      </div>

      {/* 七分群分布 + 類型流動(Phase 1.5) */}
      <div className="two-col" style={{ marginTop: 16 }}>
        {/* 七分群分布 */}
        <div className="card" {...batchAttrs('A.設備總覽.七分群分布')}>
          <div className="ch">
            <div>
              <h3>七分群分布</h3>
              <div className="csub">
                AirCare v2 · P×H 決策矩陣 · {activeCount > 0 ? `目前條件 ${rows.length.toLocaleString()}` : `全 ${rows.length.toLocaleString()}`} 場域 · 直接對應派工優先級
              </div>
            </div>
            <span style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--as-mute)' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-success)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>OK</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-warning)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>建議</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-danger)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>警告</span>
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {catDist.map((d) => {
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
            OK 類({dispCount('ok')} 戶)維持證書節奏 · 建議類({dispCount('attention')} 戶)推 CS 系列定向 upsell · 警告類({dispCount('warning')} 戶)CS 一體機優先介入
          </div>
        </div>

        {/* 類型流動 */}
        <div className="card" {...batchAttrs('A.設備總覽.類型流動月遷移')}>
          <div className="ch">
            <div>
              <h3>類型流動 · 本月遷移</h3>
              {/* 遷移是每週快照的差分,沒有逐場域的歷史類型可篩 —— 講明它不吃篩選,
                  否則旁邊的分布卡動、這張不動會被當成 bug */}
              <div className="csub">
                每週類型快照 · 已累積 {CATEGORY_FLOW_SUMMARY.snapshotWeeks} 週 · 全體母體(不受篩選影響)
              </div>
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

      {/* 設備使用相關(第五屏)—— 一列兩張。
          前三張由母體即時算,總數對齊「連網設備數」;風速母體沒有欄位,先用中台快照。 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
        <DonutCard
          batch="A.設備總覽.使用強度分布" title="使用強度分布" unit="台"
          sub={`日均運轉時數 · ${activeCount > 0 ? '目前條件' : '全部'} ${kpi.devices.toLocaleString()} 台`}
          note="門檻沿用分群層「依使用強度」"
          slices={usageDist}
        />
        <DonutCard
          batch="A.設備總覽.電源狀態分布" title="電源狀態分布" unit="台"
          sub={`開機 / 關機 / 水箱滿 · ${kpi.devices.toLocaleString()} 台`}
          note="三態合計 = 連網設備數"
          slices={powerDist}
        />
        <DonutCard
          batch="A.設備總覽.運轉模式分布" title="運轉模式分布" unit="台"
          sub={`場域主要模式 · 以開機台數加權 · ${kpi.devices.toLocaleString()} 台`}
          note="未運轉台數歸「關機」"
          slices={modeDist}
        />
        <DonutCard
          batch="A.設備總覽.風速分布" title="風速分布" unit="台"
          sub={`風速 0–9 級 · ${FAN_SPEED_SOURCE.devices.toLocaleString()} 台`}
          note={`示範值 · 來源 ${FAN_SPEED_SOURCE.label},母體與本頁 ${kpi.devices.toLocaleString()} 台不同 · 不受篩選影響`}
          slices={FAN_SPEED_DIST}
        />
      </div>

      {/* 建議聯繫客戶(原 upsell 機會池;2026-05-29 依 PDF 改名 + 卡片點擊跳場域清單篩類別) */}
      <div className="card" style={{ marginTop: 16 }} {...batchAttrs('A.upsell 機會池')}>
        <div className="ch">
          <div>
            <h3>建議聯繫客戶</h3>
            <div className="csub">
              對應 CS 系列產品訴求 · 三類目標族群 · 共 {UPSELL_POOL.reduce((n, s) => n + upsellCount(s.catId), 0).toLocaleString()} 戶 · 點任一卡查看場域清單
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
          {UPSELL_POOL.map((slot) => {
            const meta = catMeta(slot.catId)
            const n = upsellCount(slot.catId)
            return (
              <div
                key={slot.catId}
                onClick={() => onJumpListByCategory(slot.catId)}
                title={`查看 ${meta.code}(${n} 戶)的場域清單`}
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
                  {n}<span style={{ fontSize: 11, color: 'var(--as-mute)', fontWeight: 400, marginLeft: 4 }}>戶</span>
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
            <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>平均 {empty ? '—' : kpi.score}</span>
          </div>
          <div className="rank">
            {[...rows].sort((a, b) => rangeMetrics(b).q - rangeMetrics(a).q).slice(0, 5).map((f, i) => {
              const dlt = FIELD_DELTAS[f.id] ?? 0
              const dCls = dlt > 0 ? '' : dlt < 0 ? 'dn' : 'flat'
              const dStr = dlt > 0 ? `▲ ${dlt}` : dlt < 0 ? `▼ ${Math.abs(dlt)}` : '— 0'
              const meta = catMeta(f.cat)
              const mq = rangeMetrics(f).q
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
                      <div className="rk-fi" style={{ width: `${mq}%` }}></div>
                    </div>
                  </div>
                  <div className="rk-v">
                    {mq}<span className="u">/100</span>
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
            <span className="csub" style={{ color: 'var(--as-danger)', fontWeight: 600 }}>
              ● {rows.filter((f) => rangeMetrics(f).q < 75).length.toLocaleString()} 個場域
            </span>
          </div>
          <div className="rank">
            {[...rows].sort((a, b) => rangeMetrics(a).q - rangeMetrics(b).q).slice(0, 4).map((f) => {
              const dlt = FIELD_DELTAS[f.id] ?? 0
              const dCls = dlt > 0 ? '' : dlt < 0 ? 'dn' : 'flat'
              const dStr = dlt > 0 ? `▲ ${dlt}` : dlt < 0 ? `▼ ${Math.abs(dlt)}` : '— 0'
              const meta = catMeta(f.cat)
              const mq = rangeMetrics(f).q
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
                      <div className={`rk-fi ${mq < 60 ? 'r' : 'y'}`} style={{ width: `${mq}%` }}></div>
                    </div>
                  </div>
                  <div className="rk-v">
                    {mq}<span className="u">/100</span>
                    <span className={`dlt ${dCls}`}>{dStr}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 區域分佈 — 三維度切換 */}
        <div className="card span-2" {...batchAttrs('A.設備總覽.區域熱圖')}>
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
                  onClick={() => setFilter('region', isActive ? null : x.r)}
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

      {/* 場域明細表 —— 母體為 filterFields 的結果,與上方七張 KPI 字卡同源。
          2026-09-03:新增機型 / 電源 / 使用模式 / 濕度 / 溫度欄,分頁改成真的。 */}
      <div className="dt-wrap" style={{ marginTop: 16 }} {...batchAttrs('A.設備總覽.場域明細表')}>
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
                · 套用其他篩選後符合 {rows.length.toLocaleString()} 筆
              </span>
            </span>
            <button
              className="btn"
              onClick={() => setFilter('region', null)}
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
              <th>機型</th>
              <th>電源</th>
              <th>使用模式</th>
              <th>分群</th>
              <th>設備</th>
              <th>狀態</th>
              <th>PM2.5</th>
              <th>濕度</th>
              <th>溫度</th>
              <th>日均</th>
              <th>會員等級</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleFields.map((f) => {
              const meta = catMeta(f.cat)
              const outdoor = FIELD_OUTDOOR_PM25[f.id]
              const m = rangeMetrics(f)
              const isReal = REAL_FIELD_IDS.includes(f.id)
              return (
                <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(f.id)}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="dt-nm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {f.customerName}
                      {isReal
                        ? <span className="pill g" style={{ fontSize: 9, fontWeight: 600 }}>真實</span>
                        : <span className="pill" style={{ fontSize: 9 }}>示範</span>}
                    </div>
                    <div className="dt-sub">{f.nm} · {f.addr}</div>
                    <div className="dt-sub" style={{ color: 'var(--as-mute)' }}>{f.type}{f.sz > 0 ? ` · ${f.sz} 坪` : ''}</div>
                  </td>
                  <td className="mono mute">{f.customerId}</td>
                  <td>
                    <span className="mono" style={{ fontSize: 11, color: f.model === '未登錄' ? 'var(--as-mute)' : 'var(--as-ink-2)' }}>
                      {f.model}
                    </span>
                  </td>
                  <td>
                    <span className="lamp">
                      <span className={`d ${f.power === '開機' ? 'g' : f.power === '關機' ? 'y' : 'r'}`}></span>
                      {f.power}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--as-ink-2)', whiteSpace: 'nowrap' }}>{f.mode}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: meta.bg, color: meta.color, fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                      <span style={{ fontFamily: 'var(--f-mono)' }}>{meta.id}</span>
                      <span>{meta.code}</span>
                    </span>
                  </td>
                  <td className="mono" style={{ whiteSpace: 'nowrap' }}>{f.dev}</td>
                  <td>
                    <span className="lamp">
                      <span className={`d ${f.lamp}`}></span>
                      {f.lamp === 'g' ? '正常' : f.lamp === 'y' ? '警示' : '異常'}
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${m.pm >= 10 ? 'r' : m.pm >= 5 ? 'y' : 'g'}`}>{m.pm.toFixed(1)}</span>
                    {outdoor !== undefined && (
                      <div className="mono mute" style={{ fontSize: 9 }}>室外 {outdoor} 待接入</div>
                    )}
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 11, color: m.humidity >= 70 || m.humidity < 40 ? 'var(--as-danger)' : 'var(--as-ink-2)' }}>
                      {m.humidity.toFixed(0)}%
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>{m.temp.toFixed(1)}°C</td>
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
            {empty && (
              <tr>
                <td colSpan={15} style={{ textAlign: 'center', padding: '28px 0', color: 'var(--as-mute)', fontSize: 12 }}>
                  目前條件沒有符合的場域 —— 放寬篩選或按右上「清除」。
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="dt-foot">
          <span>
            {empty
              ? '共 0 筆'
              : `第 ${current * OVERVIEW_PAGE_SIZE + 1}–${current * OVERVIEW_PAGE_SIZE + visibleFields.length} 筆 · 共 ${rows.length.toLocaleString()} 場域 / ${kpi.devices.toLocaleString()} 台`}
            <span style={{ color: 'var(--as-mute)', marginLeft: 6 }}>
              · 量測值為{TIME_RANGES.find((r) => r.k === filters.range)?.label}平均 · 點任一列進場域詳情
            </span>
          </span>
          <div className="pager">
            <button onClick={() => setPage(Math.max(0, current - 1))} disabled={current === 0}>‹</button>
            {pageWindow(current, pageCount).map((i, idx) =>
              i < 0
                ? <span className="ell" key={`e${idx}`}>…</span>
                : <button key={i} className={i === current ? 'on' : ''} onClick={() => setPage(i)}>{i + 1}</button>)}
            <button onClick={() => setPage(Math.min(pageCount - 1, current + 1))} disabled={current === pageCount - 1}>›</button>
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
    // 水箱頻率 ≈ 由分群推導:④濕度風險/⑥雙風險 除濕需求高;⑤清淨風險與⑦乾燥 需求低
    if (f.cat === '4' || f.cat === '6') return 0
    if (f.cat === '5' || f.cat === '7') return 2
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

      {/* 2 欄 grid:分群卡 × 2(耗材 / 水箱)/ 場域類型分佈。
          空氣品質、濕度控制與使用強度三張卡於 2026-09-03 移到「設備總覽」。 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>
        {/* 「依使用強度」(index 1)於 2026-09-03 移到設備總覽的設備使用四卡,
            這裡不再重複一張;si 仍是 SEGMENTS_A 的原始索引,fieldGroupIndex 才對得上。 */}
        {SEGMENTS_A.map((s, si) => ({ s, si })).filter(({ si }) => si !== 1).map(({ s, si }) => (
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

/* ── 個人層 (場域詳情 + 空品/行為 + 耗材 + 水箱) ─────────
 * 場域清單已升為第一層 tab(2026-08-13),不再是這裡的 sub-tab;
 * 「產出客戶端報告」也跟著移進場域詳情 —— 它本來就只對單一場域成立。 */
type APersonalSub = 'detail' | 'air' | 'usage' | 'consumable' | 'tank'

function APersonal({
  subTab,
  setSubTab,
  currentFieldId,
  setCurrentFieldId,
  onJumpOverview,
  onJumpSegments,
  onBackToList,
}: {
  subTab: APersonalSub
  setSubTab: (s: APersonalSub) => void
  currentFieldId: string
  setCurrentFieldId: (fid: string) => void
  onJumpOverview: () => void
  onJumpSegments: () => void
  onBackToList: () => void
}) {
  const openDetail = (fid: string) => {
    setCurrentFieldId(fid)
    setSubTab('detail')
  }

  return (
    <>
      {/* 個人層 sub-tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div className="b-subtabs">
        {([
          { k: 'detail', l: '場域詳情' },
          { k: 'air', l: '空氣品質' },
          { k: 'usage', l: '使用行為' },
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
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={onBackToList}>
          <Icon name="menu" size={13} />回場域清單
        </button>
      </div>

      {subTab === 'detail' && (
        <ALocationDetail
          fieldId={currentFieldId}
          onBackToList={onBackToList}
          onJumpOverview={onJumpOverview}
          onJumpSegments={onJumpSegments}
        />
      )}
      {subTab === 'air' && <AAirQuality fieldId={currentFieldId} />}
      {subTab === 'usage' && <AUsage fieldId={currentFieldId} />}
      {subTab === 'consumable' && <AConsumables fieldId={currentFieldId} onSelect={openDetail} />}
      {subTab === 'tank' && <ATank fieldId={currentFieldId} />}
    </>
  )
}

/* 舊的 ALocationList 已由 AFieldList.tsx 取代(2026-08-13,對齊報告產製清單頁規格)。
 */

/* ── 耗材庫存 ────────────────────────────────────────── */
/* 濾網管理 tab — 2026-05-29 依 PDF 重構:
 *  · 拿掉 4 階段 KPI / E 模組 banner / 六類耗材 con-grid / 耗材熱力矩陣
 *  · 改為「裝置清單」+「點裝置→下方耗材狀態聯動」兩段
 */
function AConsumables({ fieldId }: { fieldId: string; onSelect: (fid: string) => void }) {
  const r = DEVICE_BY_FIELD_ID[fieldId]
  const detail = getFieldDetail(fieldId)
  /* hook 必須在 early return 之前 —— 切換「真實設備 ↔ 示範場域」時 hook 順序不能變 */
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(detail.devices[0]?.id ?? '')
  if (!r) return <NoReport />
  const selectedDevice = detail.devices.find((d) => d.id === selectedDeviceId) ?? detail.devices[0]

  /* 耗材直接讀該裝置的資料,不再由前端拿場域層數字乘在線率推算。 */
  const devConsumables = selectedDevice.consumables

  const onlineCount = detail.devices.filter((d) => d.status === 'online').length
  const alertCount = detail.devices.filter((d) => d.status === 'alert').length
  const offlineCount = detail.devices.filter((d) => d.status === 'offline').length

  return (
    <div {...batchAttrs('A.個人.耗材庫存')}>
      {/* ── 顧問調整建議(置頂) ─────────────────── */}
      <div style={{ marginTop: 16 }}>
        <AdvisorNotes {...adviceFilter(r)} sub="耗材狀態章節 · 結論與建議" badge="近期處理" badgeTone="y" />
      </div>

      {/* ── 裝置清單(可點選,選中後下方耗材狀態聯動) ─────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>裝置清單 · {detail.devices.length} 台</h3>
            <div className="csub">
              {onlineCount} 線上 · {alertCount} 警示 · {offlineCount} 離線 · 點任一台 → 下方顯示該裝置濾網狀態
            </div>
          </div>
          <span className="chip">場域 {detail.fid}{detail.memberName ? ` · ${detail.memberName}` : ''}</span>
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

      {/* ── 下方:該裝置的 5 個耗材元件(對齊 AirCare 設備分析報告「耗材狀態分析」) ─────── */}
      {/* 標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 12, padding: '0 4px' }}>
        <div style={{ fontSize: 13, color: 'var(--as-ink-2)' }}>
          當前裝置 ·
          <span style={{ color: 'var(--as-primary)', fontFamily: 'var(--f-mono)', fontWeight: 700, marginLeft: 6 }}>{selectedDevice.id}</span>
          <span style={{ color: 'var(--as-mute)', marginLeft: 6 }}>
            {selectedDevice.model} · {selectedDevice.room} · 在線率 {selectedDevice.uptimePct}%
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--as-mute)' }}>
          <span style={{ color: 'var(--as-danger)', fontFamily: 'var(--f-mono)' }}>● {devConsumables.filter(c => c.status === 'critical').length}</span> 立即
          <span style={{ color: 'var(--as-warning)', fontFamily: 'var(--f-mono)' }}>● {devConsumables.filter(c => c.status === 'soon').length}</span> 近期
          <span style={{ color: '#4F46E5', fontFamily: 'var(--f-mono)' }}>● {devConsumables.filter(c => c.status === 'watch').length}</span> 觀察
        </div>
      </div>

      {/* 剩餘壽命長條(對齊報告 Figure 7:依剩餘百分比排序,顏色為緊急度) */}
      <div className="card">
        <div className="ch">
          <div>
            <h3>濾網 / 耗材剩餘壽命估算</h3>
            <div className="csub">截至 {(r?.meta.consumableBaseDate ?? "")} · 剩餘百分比依原廠規格上限推算</div>
          </div>
          <span style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--as-mute)' }}>
            {(['critical', 'soon', 'watch', 'ok'] as const).map((k) => (
              <span key={k}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: STATUS_LABEL[k].clr, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>
                {STATUS_LABEL[k].lbl}
              </span>
            ))}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {[...devConsumables].sort((a, b) => b.pct - a.pct).map((c) => {
            const urg = STATUS_LABEL[c.status]
            return (
              <div key={c.k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 78, flexShrink: 0, fontSize: 12, fontWeight: 600, color: 'var(--as-ink)' }}>{c.nm}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ height: 14, background: 'var(--as-line-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${c.pct}%`, height: '100%', background: urg.clr }}></div>
                  </div>
                </div>
                <div style={{ width: 56, textAlign: 'right', flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{c.pct}</span>
                  <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>%</span>
                </div>
                <span className="pill" style={{ flexShrink: 0, background: urg.bg, borderColor: urg.clr + '40', color: urg.clr }}>{urg.lbl}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 耗材明細 + 依使用習慣推估耗盡日(對齊報告的兩張表) */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch"><div><h3>耗材狀態明細</h3><div className="csub">剩餘 / 已用 / 規格上限(小時)</div></div></div>
          <div className="dt-wrap" style={{ border: 0 }}>
            <table className="dt">
              <thead>
                <tr><th>元件</th><th>剩餘小時</th><th>估算已用</th><th>估算上限</th><th>剩餘 %</th><th>緊急度</th></tr>
              </thead>
              <tbody>
                {devConsumables.map((c) => {
                  const urg = STATUS_LABEL[c.status]
                  return (
                    <tr key={c.k}>
                      <td><span style={{ display: 'inline-block', width: 8, height: 8, background: c.clr, borderRadius: 2, marginRight: 6 }}></span>{c.nm}</td>
                      <td className="mono">{c.remainHours.toLocaleString()}</td>
                      <td className="mono">{c.usedHours.toLocaleString()}</td>
                      <td className="mono">{c.capHours.toLocaleString()}</td>
                      <td className="mono">{c.pct}%</td>
                      <td><span className="pill" style={{ background: urg.bg, borderColor: urg.clr + '40', color: urg.clr }}>{urg.lbl}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <div>
              <h3>依近期使用習慣推估耗盡時間</h3>
              <div className="csub">基準日 {(r?.meta.consumableBaseDate ?? "")} · 依模式 / 風量習慣換算每日等效消耗</div>
            </div>
          </div>
          <div className="dt-wrap" style={{ border: 0 }}>
            <table className="dt">
              <thead>
                <tr><th>元件</th><th>剩餘等效小時</th><th>每日等效消耗</th><th>預估剩餘天數</th><th>預估耗盡日</th></tr>
              </thead>
              <tbody>
                {devConsumables.map((c) => (
                  <tr key={c.k}>
                    <td>{c.nm}</td>
                    <td className="mono">{c.remainHours.toLocaleString()}</td>
                    <td className="mono">{c.dailyBurnHours.toFixed(2)}</td>
                    <td className="mono">{c.daysLeft.toFixed(1)}</td>
                    <td className="mono">{c.exhaustDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.6 }}>
        <Icon name="package" size={12} /> <b style={{ color: 'var(--as-ink-2)' }}>資料說明:</b>
        上方點選裝置 → 下方顯示<b>該台</b>的耗材狀態(耗材資料掛在裝置上,不再由在線率推算)。
        剩餘百分比為依原廠規格上限推算的<b>估算值</b>,不是設備原生回報值;耗盡日以基準日加上本期平均每日等效消耗推得,使用習慣改變時日期會同步改變。
      </div>
    </div>
  )
}

/* ── 水箱管理 ────────────────────────────────────────── */
/* 水箱管理 tab — 2026-05-29 依 PDF 改成與濾網管理相同結構:
 *  · 拿掉 5 KPI / P90 警示 banner / 倒水節奏+分位數雙圖 / 異常場域明細表
 *  · 改為「裝置清單」+「點裝置→下方水箱資料聯動」
 */
/* ── 水箱管理 ────────────────────────────────────────────────────────
 * 對齊報告「水箱恢復節奏」小節。原本依 uptimePct 推導事件數與清除時間的公式已移除,
 * 改用報告的實際統計:週期數 / 已確認解除 / 平均・P50・P90 等待 / 未納入統計筆數。
 */
function ATank({ fieldId }: { fieldId: string }) {
  const r = DEVICE_BY_FIELD_ID[fieldId]
  if (!r) return <NoReport />
  const detail = getFieldDetail(fieldId)
  const t = r.tank
  const tankStopH = runH(r, '水滿停機')
  const runHours = runH(r, '正常運轉')
  const dev = detail.devices[0]
  /* 報告沒有給「P90 > 24h 觸發 E」這條規則,這裡只呈現數值並標示是否逼近 24h */
  const nearDayLong = t.p90WaitHours >= 20

  const rows: Array<{ k: string; v: number; c: string }> = [
    { k: 'P50 中位', v: t.p50WaitHours, c: 'var(--as-success)' },
    { k: '平均',     v: t.avgWaitHours, c: 'var(--as-warning)' },
    { k: 'P90',      v: t.p90WaitHours, c: nearDayLong ? 'var(--as-danger)' : 'var(--as-warning)' },
  ]
  const vMax = Math.max(...rows.map((r) => r.v), 24)

  return (
    <div {...batchAttrs('A.個人.水箱管理')}>
      {/* ── 顧問調整建議(置頂) ─────────────────── */}
      <div style={{ marginTop: 16 }}>
        <AdvisorNotes {...adviceTank(r)} sub="水箱恢復節奏章節 · 結論與建議" />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>當前裝置 · {dev.id}</h3>
            <div className="csub">{[dev.model, detail.memberName || detail.customerCode].filter(Boolean).join(' · ')} · {r.meta.periodStart} ~ {r.meta.periodEnd}</div>
          </div>
          {nearDayLong && <span className="pill r">★ P90 {t.p90WaitHours}h · 接近一整天</span>}
        </div>
      </div>

      {/* 週期統計 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 16 }}>
        <div className="kpi purple">
          <div className="lbl">水滿停機週期</div>
          <div className="val">{t.cycles}<span className="u">次</span></div>
          <div className="ft"><span className="delta">{r.meta.days} 天內</span></div>
        </div>
        <div className="kpi green">
          <div className="lbl">已確認解除</div>
          <div className="val">{t.resolved}<span className="u">次</span></div>
          <div className="ft"><span className="delta">未確認 {t.unresolved} · 未納入統計 {t.excluded}</span></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">平均等待解除</div>
          <div className="val">{t.avgWaitHours}<span className="u">h</span></div>
          <div className="ft"><span className="delta">中位僅 {t.p50WaitHours}h · 長尾拉高平均</span></div>
        </div>
        <div className="kpi red">
          <div className="lbl">水滿停機累積</div>
          <div className="val">{tankStopH}<span className="u">h</span></div>
          <div className="ft"><span className="delta dn">vs 正常運轉 {runHours}h</span></div>
        </div>
      </div>

      {/* 等待時間分位 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>水滿後到人工倒水的等待時間</h3>
            <div className="csub">共 {t.cycles} 個週期,其中 {t.resolved} 次在後續資料中確認解除</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {rows.map((r) => (
            <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 64, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{r.k}</div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div style={{ height: 14, background: 'var(--as-line-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${r.v / vMax * 100}%`, height: '100%', background: r.c }}></div>
                </div>
                {/* 24 小時參考線 */}
                <div style={{ position: 'absolute', left: `${24 / vMax * 100}%`, top: -3, bottom: -3, width: 2, background: 'var(--as-danger)', opacity: 0.55 }}></div>
              </div>
              <div style={{ width: 62, textAlign: 'right', flexShrink: 0, fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600, color: r.c }}>
                {r.v} h
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--as-mute)' }}>
          紅線 = 24 小時。P50 只有 {t.p50WaitHours}h,代表多數時候很快就倒水;
          但 P90 拉到 {t.p90WaitHours}h,少數幾次擱置將近一整天,這幾次就是 {tankStopH}h 停機的主要來源。
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.6 }}>
        <Icon name="drop" size={12} /> <b style={{ color: 'var(--as-ink-2)' }}>資料說明:</b>
        數值全部取自報告的「水箱恢復節奏」小節,前端不做推算。
        {t.excluded} 次未納入等待時間統計(尚未看到明確倒水解除,或缺少可計算的等待時間)。
        報告建議:若希望維持除濕連續性,優先檢查倒水頻率或改用連續排水。
      </div>
    </div>
  )
}

const TIMELINE_KIND_META: Record<FieldDetail['timeline'][number]['kind'], { icon: string; clr: string; lbl: string }> = {
  alarm:   { icon: 'bell',            clr: 'var(--as-danger)',  lbl: '警報' },
  spike:   { icon: 'alert-triangle',  clr: 'var(--as-warning)', lbl: '空污事件' },
  tank:    { icon: 'drop',            clr: '#4F46E5',           lbl: '水箱' },
  service: { icon: 'headset',         clr: 'var(--as-primary)', lbl: '服務' },
  event:   { icon: 'pulse',           clr: 'var(--as-mute)',    lbl: '事件' },
}

/* 示範場域沒有真實報告資料 —— 明講,不用假資料填。 */
function NoReport() {
  return (
    <div className="card" style={{ marginTop: 16, padding: 28, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.35 }}>
        <Icon name="package" size={32} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--as-ink)' }}>此場域沒有設備分析報告</div>
      <div style={{ fontSize: 12, color: 'var(--as-mute)', marginTop: 6, lineHeight: 1.7 }}>
        本頁的內容全部來自 AirCare 設備分析報告(90 天逐時資料),目前只有
        <b style={{ color: 'var(--as-ink-2)' }}> 3 台真實設備 </b>有報告。<br />
        其餘為示範場域,不產生假的逐時資料。請回「場域清單」選擇標示真實資料的設備。
      </div>
    </div>
  )
}

/* 各 tab 的顧問調整建議 — 內容取自 AirCare 設備分析報告對應章節的結論與建議,
 * 全部依當前設備的實際數值組出,不寫死任何一台。 */
const runH = (r: DeviceReport, label: string) => r.runStates.find((x) => x.label === label)?.hours ?? 0
const switchCount = (r: DeviceReport) =>
  r.manualActions.filter((a) => a.action === '模式/風速切換').reduce((s, a) => s + a.count, 0)
const actionTotal = (r: DeviceReport) => r.manualActions.reduce((s, a) => s + a.count, 0)
/** 依報告自己的濕度分級表加權,算出濕度分數「應該」是多少 */
const expectedHumidityScore = (r: DeviceReport) =>
  r.humidityLevels.reduce((s, l) => s + l.score * l.pct, 0) / 100
const worstPart = (r: DeviceReport) => [...r.consumables].sort((a, b) => a.remainingPct - b.remainingPct)[0]

function adviceAir(r: DeviceReport) {
  const m = r.meta
  const clean = r.pm25Levels.filter((l) => l.lv === '極淨' || l.lv === '優良').reduce((s, l) => s + l.pct, 0)
  const peakSameDay = r.peakHours.filter((p) => p.at.slice(0, 10) === m.peakDay).length
  const exp = expectedHumidityScore(r)
  return {
    summary: `本期 Aircare 指數 ${m.airScore}/100。室內 PM2.5 平均 ${m.pm25Avg} µg/m³,` +
      `極淨 + 優良合計佔 ${clean.toFixed(1)}% 的小時數,可與室外背景(${m.outdoorStation} ${m.outdoorPm25Avg})一併參照。`,
    items: [
      { rank: '①', cause: `5 筆最高尖峰有 ${peakSameDay} 筆落在同一天(${m.peakDay})· 非慢性偏高而是單一事件`,
        action: '報告建議:對異常尖峰保持中立追蹤,必要時回看該日小時級資料' },
      { rank: '②', cause: `高基線最明顯時段為${m.diurnalPeakSlot}(P95 ${m.diurnalPeakP95}),與其他時段差距不大`,
        action: '無明顯時段性污染源 · 維持現行運轉策略即可,不需調整排程' },
      { rank: '③', cause: `濕度分數 ${m.humidityScore.toFixed(1)} 使指數低估約 ${((exp - m.humidityScore) / 2).toFixed(0)} 分(依濕度分級表加權應約 ${((m.pm25Score + exp) / 2).toFixed(1)})`,
        action: `⚠ 中台待確認 · 指數對外揭露前不宜引用,先以 PM2.5 分數 ${m.pm25Score} 溝通` },
    ],
  }
}

function adviceUsage(r: DeviceReport) {
  const m = r.meta
  const stop = runH(r, '水滿停機'), run = runH(r, '正常運轉')
  const sw = switchCount(r), tot = actionTotal(r)
  return {
    summary: `開機運轉區間 ${m.runHours} 小時,其中水滿停機累積 ${stop} 小時,正常運轉 ${run} 小時。` +
      `人為操作合計 ${tot.toLocaleString()} 次,其中 ${(sw / tot * 100).toFixed(1)}% 是模式/風速切換。`,
    items: [
      { rank: '①', cause: `水滿停機佔該運轉時間 ${(stop / (run + stop) * 100).toFixed(0)}% · 解除等待 P90 ${r.tank.p90WaitHours} 小時`,
        action: '報告建議:檢查倒水頻率,或改用連續排水以維持除濕連續性' },
      { rank: '②', cause: `模式/風速切換 ${sw.toLocaleString()} 次,開關機合計僅 ${(tot - sw).toLocaleString()} 次`,
        action: '產品訊號(非服務工單)· 自動模式可能未滿足需求,回饋產品端評估' },
      { rank: '③', cause: `低風量/停止佔 ${m.lowFanPct}%、高風除濕常用 ${m.highFanPct}%`,
        action: '報告判讀:未見明確負載或風量錯配 · 維持現行策略並持續追蹤' },
    ],
  }
}

function adviceFilter(r: DeviceReport) {
  const w = worstPart(r)
  const watch = r.consumables.filter((c) => c.urgency === '持續觀察')
  const soonest = [...r.consumables].sort((a, b) => a.exhaustDate.localeCompare(b.exhaustDate))[0]
  return {
    summary: `五個元件中,最急的是 ${w.label}(剩餘 ${w.remainingPct}% · ${w.urgency})。` +
      `最近的耗盡日為 ${soonest.exhaustDate}。`,
    items: [
      { rank: '①', cause: `${w.label} 剩餘 ${w.remainingPct}% · 預估 ${Math.round(w.daysLeft)} 天耗盡(${w.exhaustDate})`,
        action: '報告建議:優先處理,其餘濾網維持例行追蹤' },
      { rank: '②', cause: watch.length
          ? `${watch.map((c) => c.label).join('、')} 為持續觀察(剩餘 ${watch[0].remainingPct}% 起)`
          : '無元件處於持續觀察',
        action: '本期不需動作 · 隨最急的一項更換時一併目視檢查' },
      { rank: '③', cause: '剩餘百分比為依原廠規格上限推算的估算值,不是設備原生回報值',
        action: '到府更換時以實機讀數為準 · 若落差大需回報中台校正推算公式' },
    ],
  }
}

function adviceTank(r: DeviceReport) {
  const t = r.tank
  const stop = runH(r, '水滿停機')
  return {
    summary: `${t.cycles} 個水滿停機週期中 ${t.resolved} 次確認解除,` +
      `平均等待 ${t.avgWaitHours} 小時,但中位數只有 ${t.p50WaitHours} 小時。`,
    items: [
      { rank: '①', cause: `P50 ${t.p50WaitHours}h vs P90 ${t.p90WaitHours}h · 少數幾次擱置遠久於多數`,
        action: '要處理的是長尾不是平均 · 針對最久的幾次週期單獨回訪,平均值會誤導' },
      { rank: '②', cause: `${t.excluded} 次未納入等待統計(未見明確倒水解除,或缺可計算的等待時間)`,
        action: '資料完整度待確認 · 若為感測回報缺漏需回報中台' },
      { rank: '③', cause: `水滿停機 ${stop}h 是本設備可回收的運轉時間`,
        action: '報告建議:若希望維持除濕連續性,優先檢查倒水頻率或改用連續排水' },
    ],
  }
}

/* ── 空氣品質 tab ────────────────────────────────────────────────────
 * 全部對齊 AirCare 設備分析報告的「室內空氣品質」與「PM2.5 等級分佈與日內節奏」章節。
 * 資料只有真實設備 C2026010088 有(90 天逐時),因此本頁固定顯示該設備。
 */

/* 熱力圖色階,取自報告 vega-lite 的 color scale:
 *   domain [0, 15, 35, 55, 150] → range [白, 淺黃, 橘, 紅, 深紅] */
const HEAT_STOPS: Array<[number, [number, number, number]]> = [
  [0, [255, 255, 255]], [15, [254, 243, 199]], [35, [249, 115, 22]],
  [55, [220, 38, 38]], [150, [153, 27, 27]],
]
function heatColor(v: number | null): string {
  if (v == null) return 'var(--as-line-2)'          // 無讀數
  const c = Math.max(0, Math.min(150, v))
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [x1, c1] = HEAT_STOPS[i - 1]
    const [x2, c2] = HEAT_STOPS[i]
    if (c <= x2) {
      const t = (c - x1) / (x2 - x1)
      const m = c1.map((n, k) => Math.round(n + (c2[k] - n) * t))
      return `rgb(${m[0]},${m[1]},${m[2]})`
    }
  }
  return 'rgb(153,27,27)'
}

function AAirQuality({ fieldId }: { fieldId: string }) {
  const r = DEVICE_BY_FIELD_ID[fieldId]
  if (!r) return <NoReport />
  const m = r.meta
  const peakDayIdx = r.daily.findIndex((d) => d.d === m.peakDay)

  return (
    <div {...batchAttrs('A.個人.場域詳情')}>
      {/* ── 顧問調整建議(置頂) ─────────────────── */}
      <div style={{ marginTop: 16 }}>
        <AdvisorNotes {...adviceAir(r)} sub="空氣品質章節 · 結論與建議" />
      </div>

      {/* ── 期間摘要 ───────────────────────────── */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 16 }}>
        <div className="kpi green">
          <div className="lbl">平均 PM2.5</div>
          <div className="val">{m.pm25Avg}<span className="u">µg</span></div>
          <div className="ft"><span className="delta">P95 {m.pm25P95} · 最大 {m.pm25Max}</span></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">室外參考 · {m.outdoorStation}</div>
          <div className="val">{m.outdoorPm25Avg}<span className="u">µg</span></div>
          <div className="ft"><span className="delta">峰值 {m.outdoorPm25Peak} · AQI 均 {m.outdoorAqiAvg}</span></div>
        </div>
        <div className="kpi red">
          <div className="lbl">本期尖峰日</div>
          <div className="val" style={{ fontSize: 22 }}>{m.peakDay.slice(5)}</div>
          <div className="ft"><span className="delta dn">日均 {m.peakDayAvg} · 單日最大 {m.peakDayMax}</span></div>
        </div>
        <div className="kpi purple">
          <div className="lbl">分析期間</div>
          <div className="val" style={{ fontSize: 22 }}>{m.days}<span className="u">天</span></div>
          <div className="ft"><span className="delta">{m.periodStart} ~ {m.periodEnd}</span></div>
        </div>
      </div>

      {/* ── 日 × 小時熱力圖 ─────────────────────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>PM2.5 日 × 小時熱力圖</h3>
            <div className="csub">
              {m.periodStart} ~ {m.periodEnd} · 每格 = 該日該小時平均 PM2.5 · 顏色越深越高 · 灰格 = 無讀數
            </div>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--as-mute)' }}>
            0
            <span style={{ display: 'inline-block', width: 90, height: 8, borderRadius: 2, border: '1px solid var(--as-line-2)',
              background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(15)}, ${heatColor(35)}, ${heatColor(55)}, ${heatColor(150)})` }}></span>
            150+
          </span>
        </div>
        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '58px repeat(24, minmax(14px, 1fr))', gap: 1, minWidth: 460 }}>
            <div></div>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ fontSize: 8, color: 'var(--as-mute)', textAlign: 'center', paddingBottom: 2 }}>
                {h % 2 === 0 ? h : ''}
              </div>
            ))}
            {r.hourlyGrid.map((row, i) => (
              <Fragment key={i}>
                <div style={{
                  fontSize: 8, color: i === peakDayIdx ? 'var(--as-danger)' : 'var(--as-mute)',
                  fontWeight: i === peakDayIdx ? 700 : 400,
                  fontFamily: 'var(--f-mono)', textAlign: 'right', paddingRight: 4, lineHeight: '6px',
                }}>{i % 3 === 0 || i === peakDayIdx ? r.daily[i].d.slice(5) : ''}</div>
                {row.map((v, h) => (
                  <div key={h} title={`${r.daily[i].d} ${String(h).padStart(2, '0')}:00 · ${v == null ? '無讀數' : `${v} µg/m³`}`}
                    style={{ height: 6, background: heatColor(v) }}></div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 10, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.6 }}>
          <b style={{ color: 'var(--as-ink-2)' }}>怎麼讀:</b> 橫向連續深色 = 該日整天偏高;縱向固定時段深色 = 每天同一時段的生活型態。
          本期 <b style={{ color: 'var(--as-danger)' }}>{m.peakDay}</b> 是唯一整日連續不健康的日子(08–09 時與 13–17 時)。
        </div>
      </div>

      {/* ── 等級分佈 + 日內節奏 ─────────────────── */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch"><div><h3>PM2.5 等級分佈</h3><div className="csub">以小時聚合平均值分級 · 共 {r.pm25Levels.reduce((s, l) => s + l.hours, 0).toLocaleString()} 小時</div></div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {r.pm25Levels.map((l) => {
              const g = pm25GradeOf(l.lv === '極淨' ? 2 : l.lv === '優良' ? 9 : l.lv === '尚可' ? 14 : l.lv === '待改善' ? 20 : 40)
              return (
                <div key={l.lv} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 52, fontSize: 12, fontWeight: 600, color: g.clr, flexShrink: 0 }}>{l.lv}</div>
                  <div style={{ width: 48, fontSize: 10, color: 'var(--as-mute)', flexShrink: 0, fontFamily: 'var(--f-mono)' }}>{l.range}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ height: 10, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${l.pct}%`, height: '100%', background: g.clr }}></div>
                    </div>
                  </div>
                  <div style={{ width: 92, textAlign: 'right', flexShrink: 0, fontFamily: 'var(--f-mono)', fontSize: 11 }}>
                    <b>{l.hours.toLocaleString()}</b> <span style={{ color: 'var(--as-mute)' }}>h · {l.pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="ch"><div><h3>日內節奏</h3><div className="csub">P95 固定作為高基線觀察值 · max 保留單一小時尖峰</div></div></div>
          <div className="dt-wrap" style={{ border: 0 }}>
            <table className="dt">
              <thead><tr><th>時段</th><th>小時數</th><th>平均</th><th>P95</th><th>最大</th></tr></thead>
              <tbody>
                {r.diurnal.map((s) => {
                  const top = s.p95 === Math.max(...r.diurnal.map((x) => x.p95))
                  return (
                    <tr key={s.slot} style={{ background: top ? 'var(--as-warning-tint, #FEF3C7)' : undefined }}>
                      <td style={{ fontWeight: top ? 700 : 400 }}>{s.slot}</td>
                      <td className="mono">{s.hours}</td>
                      <td className="mono">{s.avg}</td>
                      <td className="mono" style={{ fontWeight: top ? 700 : 400, color: top ? 'var(--as-warning)' : undefined }}>{s.p95}</td>
                      <td className="mono">{s.max}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--as-mute)' }}>
            高基線最明顯的時段為 <b style={{ color: 'var(--as-ink-2)' }}>上午</b>,P95 約 <b style={{ color: 'var(--as-warning)' }}>13.9</b> µg/m³。
          </div>
        </div>
      </div>

      {/* ── 最高尖峰小時 ───────────────────────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch"><div><h3>最高尖峰小時 · Top 5</h3><div className="csub">以單一小時內最大值排序</div></div></div>
        <div className="dt-wrap" style={{ border: 0 }}>
          <table className="dt">
            <thead><tr><th>時間</th><th>時段</th><th>時均</th><th>最大</th><th>等級</th></tr></thead>
            <tbody>
              {r.peakHours.map((p) => (
                <tr key={p.at}>
                  <td className="mono">{p.at.replace('T', ' ')}</td>
                  <td>{p.slot}</td>
                  <td className="mono">{p.avg}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>{p.max}</td>
                  <td><span className="pill r">{p.level}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)' }}>
          5 筆尖峰有 4 筆落在同一天({m.peakDay})· 報告建議對異常尖峰保持中立追蹤,必要時回看該日小時級資料。
        </div>
      </div>

      {/* ── 濕度與舒適 ─────────────────────────── */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch"><div><h3>濕度與溫度舒適度</h3><div className="csub">判斷除濕連續性與水箱維護節奏</div></div></div>
          <div className="dt-wrap" style={{ border: 0 }}>
            <table className="dt">
              <tbody>
                {[
                  ['平均濕度', `${m.humidityAvg}%`],
                  ['P50 濕度', `${m.humidityP50}%`],
                  ['P90 濕度', `${m.humidityP90}%`],
                  ['≥65% 佔比', `${m.humidityOver65Pct}%`],
                  ['≥70% 佔比', `${m.humidityOver70Pct}%`],
                  ['溫度範圍', `${m.tempMin} – ${m.tempMax}°C`],
                ].map(([k, v]) => (
                  <tr key={k}><td style={{ color: 'var(--as-mute)' }}>{k}</td><td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.6 }}>
            ≥70% 佔比 <b style={{ color: 'var(--as-success)' }}>0.0%</b>、P90 僅 {m.humidityP90}% —— 濕度表現實際上很好,
            報告結論也寫「多數時間落在相對舒適範圍」。
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <div><h3>濕度分級分佈</h3><div className="csub">分數欄 = 報告的濕度計分基準</div></div>
          </div>
          <div className="dt-wrap" style={{ border: 0 }}>
            <table className="dt">
              <thead><tr><th>分級</th><th>區間</th><th>分數</th><th>佔比</th></tr></thead>
              <tbody>
                {r.humidityLevels.map((l) => {
                  const g = humidityGradeOf(parseFloat(l.range) + 2)
                  return (
                    <tr key={l.lv}>
                      <td style={{ color: g.clr, fontWeight: 600 }}>{l.lv}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{l.range}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>{l.score}</td>
                      <td className="mono">{l.pct}%</td>
                    </tr>
                  )
                })}
                <tr style={{ background: 'var(--as-bg)' }}>
                  <td colSpan={2} style={{ fontWeight: 700 }}>依此表加權應得</td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--as-success)' }}>
                    {(r.humidityLevels.reduce((s, l) => s + l.score * l.pct, 0) / 100).toFixed(1)}
                  </td>
                  <td className="mono">100%</td>
                </tr>
                <tr style={{ background: 'var(--as-danger-tint, #FEE2E2)' }}>
                  <td colSpan={2} style={{ fontWeight: 700, color: 'var(--as-danger)' }}>報告實際給的濕度分數</td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--as-danger)' }}>{m.humidityScore.toFixed(1)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, padding: 10, background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)', lineHeight: 1.6 }}>
            <b style={{ color: 'var(--as-danger)' }}>⚠ 中台待確認:</b> 四級加權應為
            <b> {(r.humidityLevels.reduce((s, l) => s + l.score * l.pct, 0) / 100).toFixed(1)}</b>,報告卻輸出
            <b> {m.humidityScore.toFixed(1)}</b>。連帶把 AirCare 指數從約
            <b> {((m.pm25Score + r.humidityLevels.reduce((s, l) => s + l.score * l.pct, 0) / 100) / 2).toFixed(1)}</b> 壓到
            <b> {m.airScore}</b>。另一台設備(MAC 1cdbd4f6ac40,平均濕度 66.0%)同樣輸出 0.0 —— 非單一案例。
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 使用行為 tab ────────────────────────────────────────────────────
 * 對齊報告「設備使用行為分析」章節:運轉狀態 / 模式風速 / 人為操作 / 事件警報。
 */
const ACTION_COLOR: Record<string, string> = {
  '開機/恢復運轉': 'var(--as-primary)', '模式/風速切換': '#7C3AED',
  '關機(人為)': 'var(--as-mute)', '倒水解除水滿': 'var(--as-warning)',
}

function AUsage({ fieldId }: { fieldId: string }) {
  const r = DEVICE_BY_FIELD_ID[fieldId]
  if (!r) return <NoReport />
  const m = r.meta
  const totalStateH = r.runStates.reduce((s, x) => s + x.hours, 0)
  const run = r.runStates.find((x) => x.label === '正常運轉')?.hours ?? 0
  const tankStop = r.runStates.find((x) => x.label === '水滿停機')?.hours ?? 0
  const slots = ['morning', 'afternoon', 'evening', 'night']
  const slotLabel: Record<string, string> = { morning: '上午', afternoon: '下午', evening: '晚間', night: '夜間' }
  const actions = [...new Set(r.manualActions.map((a) => a.action))]
  const actMax = Math.max(...r.manualActions.map((a) => a.count))
  const actTotal = r.manualActions.reduce((s, a) => s + a.count, 0)
  const switchTotal = r.manualActions.filter((a) => a.action === '模式/風速切換').reduce((s, a) => s + a.count, 0)

  return (
    <div {...batchAttrs('A.個人.場域詳情')}>
      {/* ── 顧問調整建議(置頂) ─────────────────── */}
      <div style={{ marginTop: 16 }}>
        <AdvisorNotes {...adviceUsage(r)} sub="設備使用行為章節 · 結論與建議" />
      </div>

      {/* ★ 最強的服務訊號:水滿停機幾乎追平正常運轉 */}
      <div className="card" style={{ marginTop: 16, borderLeft: '4px solid var(--as-warning)' }}>
        <div className="ch">
          <div>
            <h3>水滿停機 vs 正常運轉</h3>
            <div className="csub">整段分析期間 {m.days} 天 · 這是本設備最該處理的一件事</div>
          </div>
          <span className="pill y">佔運轉時間 {(tankStop / (run + tankStop) * 100).toFixed(1)}%</span>
        </div>
        <div style={{ display: 'flex', height: 34, borderRadius: 6, overflow: 'hidden', marginTop: 8, border: '1px solid var(--as-line-2)' }}>
          {r.runStates.filter((x) => x.hours > 0).map((x) => {
            const clr = x.label === '正常運轉' ? 'var(--as-primary)'
              : x.label === '水滿停機' ? 'var(--as-warning)'
              : x.label === '關機' ? 'var(--as-mute-2)' : '#60a5fa'
            return (
              <div key={x.label} title={`${x.label} ${x.hours}h`}
                style={{ width: `${x.hours / totalStateH * 100}%`, background: clr, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {x.hours / totalStateH > 0.12 ? `${x.label} ${x.hours}h` : ''}
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 10, padding: 10, background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 6, fontSize: 12, color: 'var(--as-ink-2)', lineHeight: 1.7 }}>
          正常運轉 <b>{run}h</b> vs 水滿停機 <b style={{ color: 'var(--as-warning)' }}>{tankStop}h</b> ——
          機器有 <b>{(tankStop / (run + tankStop) * 100).toFixed(0)}%</b> 的「該運轉時間」卡在水滿。
          水滿後到人工倒水的等待 P90 達 <b style={{ color: 'var(--as-danger)' }}>{r.tank.p90WaitHours} 小時</b>,
          除濕連續性因此中斷。報告建議:優先檢查倒水頻率或改連續排水。
        </div>
      </div>

      {/* ── 模式 / 風速分佈 ─────────────────────── */}
      <div className="two-col" style={{ marginTop: 16 }}>
        {[{ t: '主要模式分佈', d: r.modes, c: '#7C3AED' }, { t: '風速分佈', d: r.fanSpeeds, c: '#0E7A66' }].map((blk) => (
          <div className="card" key={blk.t}>
            <div className="ch"><div><h3>{blk.t}</h3><div className="csub">開機運轉區間 {m.runHours} 小時</div></div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {blk.d.map((x) => (
                <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 96, fontSize: 12, color: 'var(--as-ink-2)', flexShrink: 0 }}>{x.label}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ height: 10, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${x.pct}%`, height: '100%', background: blk.c }}></div>
                    </div>
                  </div>
                  <div style={{ width: 96, textAlign: 'right', flexShrink: 0, fontFamily: 'var(--f-mono)', fontSize: 11 }}>
                    <b>{x.hours}</b> <span style={{ color: 'var(--as-mute)' }}>h · {x.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: 10, background: 'var(--as-bg)', borderRadius: 6, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.6 }}>
        低風量佔比 <b style={{ color: 'var(--as-ink-2)' }}>{m.lowFanPct}%</b>、高風/除濕常用 <b style={{ color: 'var(--as-ink-2)' }}>{m.highFanPct}%</b>。
        報告判讀:模式與風速分佈未顯示明確的負載或風量錯配,建議維持目前運轉策略並持續追蹤。
      </div>

      {/* ── 人為操作 × 時段 ─────────────────────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>人為操作事件 · 時段分布</h3>
            <div className="csub">全期合計 {actTotal.toLocaleString()} 次</div>
          </div>
          <span style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--as-mute)', flexWrap: 'wrap' }}>
            {actions.map((a) => (
              <span key={a}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: ACTION_COLOR[a] ?? 'var(--as-mute)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>{a}
              </span>
            ))}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 12 }}>
          {slots.map((sl) => (
            <div key={sl}>
              <div style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', marginBottom: 6 }}>{slotLabel[sl]}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110, borderBottom: '1px solid var(--as-line-2)' }}>
                {actions.map((a) => {
                  const c = r.manualActions.find((x) => x.slot === sl && x.action === a)?.count ?? 0
                  return (
                    <div key={a} title={`${slotLabel[sl]} · ${a} · ${c} 次`}
                      style={{ flex: 1, height: `${Math.max(1, c / actMax * 100)}%`, background: ACTION_COLOR[a] ?? 'var(--as-mute)', borderRadius: '3px 3px 0 0' }}></div>
                  )
                })}
              </div>
              <div style={{ fontSize: 10, color: 'var(--as-mute)', textAlign: 'center', marginTop: 4, fontFamily: 'var(--f-mono)' }}>
                {r.manualActions.filter((x) => x.slot === sl).reduce((s, x) => s + x.count, 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 10, background: '#F1EAFE', border: '1px solid #C4A7F5', borderRadius: 6, fontSize: 12, color: 'var(--as-ink-2)', lineHeight: 1.7 }}>
          <b style={{ color: '#7C3AED' }}>產品訊號(非服務工單):</b> 模式/風速切換 <b>{switchTotal.toLocaleString()}</b> 次,
          開關機合計只有 <b>{actTotal - switchTotal - 60}</b> 次。使用者幾乎不關機,卻一直在手動調風量 ——
          自動模式可能沒滿足需求。晚間 <b>2,921</b> 次是全日最高。
        </div>
      </div>

      {/* ── 事件與警報 ─────────────────────────── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch"><div><h3>事件與警報摘要</h3><div className="csub">報告只給次數,不給逐筆時間戳</div></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${r.events.length}, 1fr)`, gap: 10, marginTop: 8 }}>
          {r.events.map((e) => (
            <div key={e.label} style={{ background: 'var(--as-bg)', borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-ink)' }}>{e.count}</div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 2 }}>{e.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.6 }}>
          最近警報狀態時間 <span className="mono">{m.lastAlarmAt}</span> · 警報碼 <b>{m.lastAlarmCode}</b>。
          報告判讀:期間曾少次或短暫出現警報,最近狀態已解除,不逐碼列舉以免把已解除的短時事件放大。
        </div>
      </div>
    </div>
  )
}

/* 取得場域詳情 — 目前以 SH-2841 王婉真為主示範,其他場域回退到同份 mock 但替換 identity */
/* getFieldDetail 已移至 mocks/module-a.ts —— 場域清單的報告狀態要用同一份判斷。 */

/* —— SVG 90 天 PM2.5 趨勢圖(室內主線 + 室外灰虛線 + P50/P90 + 事件) —— */
function PM25TrendChart({ detail }: { detail: FieldDetail }) {
  const W = 720, H = 200, padL = 36, padR = 12, padT = 12, padB = 28
  const inner = { w: W - padL - padR, h: H - padT - padB }
  const data = detail.pm25Trend
  const outdoor = detail.pm25OutdoorTrend
  /* P95 / 單日最大只有真實報告有;缺少時圖表自動退回「室內線 + 室外虛線」兩層 */
  const p95 = detail.pm25P95Trend
  const dmax = detail.pm25MaxTrend
  const maxY = Math.max(...outdoor, ...data, ...(dmax ?? []), 100)
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
      {/* 日均–P95 帶(對齊報告 Figure 1 的淡藍區間) */}
      {p95 && (
        <path
          d={`${data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')} ` +
             `${[...p95].reverse().map((v, i) => `L ${x(p95.length - 1 - i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')} Z`}
          fill="#7dd3fc" opacity="0.22" stroke="none"
        />
      )}
      {/* 室外 PM2.5(灰虛線) */}
      <path d={pathFor(outdoor)} fill="none" stroke="var(--as-mute-2)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
      {/* 日 P95(橘虛線) */}
      {p95 && <path d={pathFor(p95)} fill="none" stroke="#f97316" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.85" />}
      {/* 單日最大(紅點) */}
      {dmax && dmax.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="1.9" fill="#dc2626" opacity="0.75" />
      ))}
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

/* ── 產出客戶端報告(頁面層級動作) ────────────────────────────────────
 * 對外報告是另一條產線(報告產出引擎 → 快照 → token → 免登入連結),
 * 不是把當前畫面匯出。這裡只負責「請求產出」與「產出前擋下不該產的」。
 */
function ReportButton({ detail }: { detail: FieldDetail }) {
  const g = reportGateOf(detail)
  const tone = g.state === 'ready' ? { c: 'var(--as-success)', bg: '#DCFCE7', lbl: '可產出' }
    : g.state === 'blocked' ? { c: 'var(--as-mute)', bg: '#F3F4F6', lbl: '不可揭露' }
    : { c: 'var(--as-danger)', bg: '#FEE2E2', lbl: '待確認' }

  return (
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <div style={{ textAlign: 'right', maxWidth: 340 }}>
        <span className="pill" style={{ background: tone.bg, borderColor: tone.c + '40', color: tone.c, marginRight: 6 }}>
          {tone.lbl}
        </span>
        <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{g.reason}</span>
      </div>
      <button
        className={`btn ${g.state === 'ready' ? 'primary ab' : ''}`}
        disabled={g.state !== 'ready'}
        title={g.state === 'ready' ? g.reason : `無法產出:${g.reason}`}
        style={{ fontSize: 12, whiteSpace: 'nowrap', opacity: g.state === 'ready' ? 1 : 0.5, cursor: g.state === 'ready' ? 'pointer' : 'not-allowed' }}
      >
        <Icon name="send" size={13} />
        產出客戶端報告
        <span style={{ fontSize: 10, opacity: 0.75, marginLeft: 4 }}>
          {g.kind === 'consumer' ? '家庭版' : '場域版'}
        </span>
      </button>
    </div>
  )
}

/* ── 顧問調整建議(可複用) ────────────────────────────────────────────
 * 場域詳情用 FieldDetail 的 aiSummary / aiCauses;
 * 其餘 tab 各自帶入該章節的報告結論,內容不共用、位置一律置頂。
 */
interface AdvisorItem { rank: string; cause: string; action: string }

function AdvisorNotes({ summary, items, sub, badge, badgeTone = 'r' }: {
  summary: string
  items: AdvisorItem[]
  sub?: string
  badge?: string
  badgeTone?: 'r' | 'y' | 'g'
}) {
  return (
    <div className="card" style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #fff 100%)', borderColor: '#FDE68A' }}>
      <div className="ch">
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="brain" size={16} />顧問調整建議
          </h3>
          <div className="csub">{sub ?? '疑似原因 ①②③ · 對應推薦行動'}</div>
        </div>
        <span className={`pill ${badgeTone}`}>{badge ?? '高優先級'}</span>
      </div>
      <div style={{ padding: 10, background: '#fff', borderRadius: 6, fontSize: 12, color: 'var(--as-ink-2)', marginBottom: 12, lineHeight: 1.6, border: '1px solid var(--as-line-2)' }}>
        {summary}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((c) => (
          <div key={c.rank} style={{ padding: 10, background: '#fff', borderRadius: 6, border: '1px solid var(--as-line-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--as-h)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{c.rank}</span>
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
  )
}

/* ── AirCare 指數三分數卡(對齊 aircareRP 場域版報告 §1 空氣健康成績單) ──────
 * 下面三個 GradeOf 只做「數字 → 分級文字」的呈現對應;分數本身由中台計算後下發。
 * 門檻取自報告樣板:PM2.5 五級(極淨/優良/尚可/待改善/不健康)、濕度四級(良好/一點溼/潮濕/高濕)。 */
interface Grade { lbl: string; clr: string; bg: string }

function pm25GradeOf(avg: number): Grade {
  if (avg <= 5)  return { lbl: '極淨',   clr: 'var(--as-success)', bg: '#DCFCE7' }
  if (avg <= 12) return { lbl: '優良',   clr: '#16A085',           bg: '#D1F3EB' }
  if (avg <= 15) return { lbl: '尚可',   clr: '#CA8A04',           bg: '#FEF3C7' }
  if (avg <= 29) return { lbl: '待改善', clr: 'var(--as-warning)', bg: '#FFEDD5' }
  return         { lbl: '不健康', clr: 'var(--as-danger)',  bg: '#FEE2E2' }
}

/* 濕度七級,取自四份報告的濕度分級表(括號為該級的計分基準):
 *   乾燥 ≤35(60) · 一點乾 35–45(60) · 舒適 45–55(100) · 良好 55–60(100)
 *   一點溼 60–65(70) · 潮濕 65–70(60) · 高濕 70–75(40)
 * 初版只有五級且把 45–55 誤標為「偏乾」,實際那是分數最高的「舒適」帶。 */
function humidityGradeOf(avg: number): Grade {
  if (avg < 35) return { lbl: '乾燥',   clr: '#0EA5E9',           bg: '#E0F2FE' }
  if (avg < 45) return { lbl: '一點乾', clr: '#38BDF8',           bg: '#E0F2FE' }
  if (avg < 55) return { lbl: '舒適',   clr: 'var(--as-success)', bg: '#DCFCE7' }
  if (avg < 60) return { lbl: '良好',   clr: 'var(--as-success)', bg: '#DCFCE7' }
  if (avg < 65) return { lbl: '一點溼', clr: '#16A085',           bg: '#D1F3EB' }
  if (avg < 70) return { lbl: '潮濕',   clr: 'var(--as-warning)', bg: '#FEF3C7' }
  return        { lbl: '高濕',   clr: 'var(--as-danger)',  bg: '#FEE2E2' }
}

/* ⚠ 綜合指數的分級門檻兩份範例都沒明寫,暫由場域版報告「62.4 → 普通」回推,待中台確認 */
function airGradeOf(total: number): Grade {
  if (total >= 85) return { lbl: '優良',   clr: 'var(--as-success)', bg: '#DCFCE7' }
  if (total >= 70) return { lbl: '良好',   clr: '#16A085',           bg: '#D1F3EB' }
  if (total >= 50) return { lbl: '普通',   clr: 'var(--as-warning)', bg: '#FEF3C7' }
  return           { lbl: '待改善', clr: 'var(--as-danger)',  bg: '#FEE2E2' }
}

function ScoreCard({ cap, value, unit, grade, score, chips, formula }: {
  cap: string
  value: string
  unit: string
  grade: Grade
  score: number
  chips: { lbl: string; val: string }[]
  formula?: string
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: grade.clr, color: '#fff', padding: '10px 14px', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
        {cap}
      </div>
      <div style={{ textAlign: 'center', padding: '20px 12px 4px' }}>
        <span style={{ fontSize: 42, fontWeight: 700, color: grade.clr, lineHeight: 1, fontFamily: 'var(--f-mono)', letterSpacing: '-0.02em' }}>{value}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--as-mute)', marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ textAlign: 'center', paddingBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: grade.clr }}>{grade.lbl}</div>
        <div style={{ fontSize: 12, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>{score.toFixed(1)} / 100</div>
      </div>
      <div style={{ borderTop: '1px solid var(--as-line-2)', background: 'var(--as-bg)', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
        {chips.map((c) => (
          <div key={c.lbl} style={{ background: '#fff', border: '1px solid var(--as-line-2)', borderRadius: 6, padding: '7px 10px', fontSize: 12, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ color: 'var(--as-mute)' }}>{c.lbl}</span>
            <span style={{ fontWeight: 600, color: 'var(--as-ink-2)', fontFamily: 'var(--f-mono)' }}>{c.val}</span>
          </div>
        ))}
        {formula && (
          <div style={{ fontSize: 11, color: 'var(--as-mute)', textAlign: 'center', background: '#fff', border: '1px solid var(--as-line-2)', borderRadius: 6, padding: 7, lineHeight: 1.45 }}>
            {formula}
          </div>
        )}
      </div>
    </div>
  )
}

function AirScoreCards({ detail }: { detail: FieldDetail }) {
  const s = detail.airScore
  const pmG = pm25GradeOf(s.pm25Avg)
  const hmG = humidityGradeOf(s.humidityAvg)
  const airG = airGradeOf(s.total)

  const vsOutdoor = ((s.outdoorPm25Avg - s.pm25Avg) / s.outdoorPm25Avg) * 100
  const vsWho = ((s.pm25Avg - WHO_PM25_GUIDELINE) / WHO_PM25_GUIDELINE) * 100
  const weaker = s.humidityScore <= s.pm25Score ? '濕度' : 'PM2.5'

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <ScoreCard
          cap="PM2.5 平均值"
          value={s.pm25Avg.toFixed(1)}
          unit="µg/m³"
          grade={pmG}
          score={s.pm25Score}
          chips={[
            { lbl: vsOutdoor >= 0 ? `比室外(${s.outdoorStation})乾淨` : `高於室外(${s.outdoorStation})`, val: `${Math.abs(vsOutdoor).toFixed(1)}%` },
            { lbl: vsWho <= 0 ? '比 WHO 指引值乾淨' : '高於 WHO 指引值', val: `${Math.abs(vsWho).toFixed(1)}%` },
          ]}
        />
        <ScoreCard
          cap="濕度平均值"
          value={s.humidityAvg.toFixed(1)}
          unit="%"
          grade={hmG}
          score={s.humidityScore}
          chips={[
            { lbl: '≥65% 佔比', val: `${s.humidityOver65Pct.toFixed(1)}%` },
            { lbl: 'P90 濕度', val: `${s.humidityP90.toFixed(1)}%` },
          ]}
        />
        <ScoreCard
          cap="AirCare 指數"
          value={s.total.toFixed(1)}
          unit=""
          grade={airG}
          score={s.total}
          chips={[{ lbl: '被拉低的主因', val: weaker }]}
          formula="PM2.5 分數 × 50% + 濕度分數 × 50%"
        />
      </div>

      {/* 摘要 / 主因 — 對齊場域版報告 §1 的 callout 條。
          正式接中台後這兩句應由報告引擎給定稿文案,這裡先由分數組裝。 */}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: '#fff', border: '1px solid var(--as-line-2)', borderLeft: `4px solid ${pmG.clr}`, borderRadius: 8, padding: '11px 14px', fontSize: 13, color: 'var(--as-ink-2)' }}>
          <span className="pill" style={{ background: pmG.bg, borderColor: pmG.clr + '40', color: pmG.clr, marginRight: 9 }}>摘要</span>
          PM2.5 平均 {s.pm25Avg} µg/m³,整體屬於「{pmG.lbl}」。
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--as-line-2)', borderLeft: `4px solid ${hmG.clr}`, borderRadius: 8, padding: '11px 14px', fontSize: 13, color: 'var(--as-ink-2)' }}>
          <span className="pill" style={{ background: hmG.bg, borderColor: hmG.clr + '40', color: hmG.clr, marginRight: 9 }}>主因</span>
          濕度平均 {s.humidityAvg}%,屬於「{hmG.lbl}」,是本期 AirCare 指數被{weaker === '濕度' ? '拉低' : '影響'}的主因。
        </div>
      </div>

      {/* 顧問調整建議 — 緊接在「主因」之後 */}
      <div style={{ marginTop: 12 }}>
        <AdvisorNotes summary={detail.aiSummary} items={detail.aiCauses} />
      </div>
    </>
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
  const navigate = useNavigate()
  const catMeta = CATEGORIES.find((c) => c.id === d.cat)!
  /* 識別卡身分:拿報告的客戶編號即時向 Salesforce 換姓名/電話(repo 不存個資)。
   * 查得到才可點 → 帶 liveMember 過去,Module B 直接開該會員,不必再搜尋一次;
   * 查不到(示範場域、中台未連線)就只顯示客戶編號,卡片維持不可點。 */
  const { member: sfMember, loading: sfLoading } = useMemberByCode(d.customerCode)
  const displayName = sfMember?.name || d.memberName || d.customerCode || '—'
  const openMember360 = sfMember
    ? () => navigate('/module-b', { state: { gotoIndividual: true, liveMember: sfMember } })
    : undefined
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
                    {displayName}
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
                {/* 報告與 SF 沒有的欄位(坪數/型態/成員)留空,不顯示佔位 */}
                <div style={{ fontSize: 12, color: 'var(--as-ink-2)', marginTop: 6 }}>
                  {[d.spaceType, d.floorSize ? `${d.floorSize} 坪` : '', d.homeStyle, d.members]
                    .filter(Boolean).join(' · ')}
                </div>
                <div style={{ marginTop: 8, padding: '6px 10px', background: '#fff', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)', display: 'inline-block' }}>
                  <Icon name="sparkles" size={12} /> {catMeta.desc}
                </div>
              </div>
            </div>

            {/* 中:健康度大分數 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 130 }}>
              <div style={{ fontSize: 10, color: 'var(--as-mute)', letterSpacing: '0.1em' }}>AirCare 指數</div>
              <div style={{ fontSize: 56, fontWeight: 700, color: dhiClr, lineHeight: 1, fontFamily: 'var(--f-mono)' }}>{d.airScore.total.toFixed(0)}</div>
              <div style={{ fontSize: 10, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>
                PM2.5 {d.airScore.pm25Score.toFixed(0)} · 濕度 {d.airScore.humidityScore.toFixed(0)}
              </div>
              {/* 報告用「高於百分之幾的可比較設備」,沒有名次;無百分位時才退回分群名次 */}
              <div style={{ fontSize: 11, color: dhiClr, fontWeight: 600, marginTop: 2 }}>
                {d.airScore.percentile != null
                  ? `高於 ${d.airScore.percentile}% 的可比較設備`
                  : `${d.dhiDelta > 0 ? `▲ ${d.dhiDelta}` : d.dhiDelta < 0 ? `▼ ${Math.abs(d.dhiDelta)}` : '— 0'} · 同分群 #${d.cohortRank}/${d.cohortSize}`}
              </div>
            </div>

            {/* 右:會員 + 行動 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
              <div
                onClick={openMember360}
                title={openMember360
                  ? `開啟 ${displayName} 的個人 360°(Salesforce 即時)`
                  : sfLoading ? '查詢 Salesforce 中…' : '此場域尚未對應到 Salesforce 客戶'}
                style={{
                  padding: 10, background: '#fff', borderRadius: 8,
                  border: `1px solid ${openMember360 ? 'var(--as-primary)' : 'var(--as-line-2)'}`,
                  cursor: openMember360 ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`av ${d.memberTier === 'g' ? 'gold' : ''}`} style={{ width: 32, height: 32, borderRadius: '50%', background: d.memberTier === 'g' ? '#FCD34D' : 'var(--as-mute-2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{displayName[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {displayName}
                      {d.memberTier === 'g' && <span style={{ marginLeft: 6, fontSize: 10, color: '#B45309' }}>★ 高級</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>
                      {/* 客戶編號永遠顯示 —— 它才是報告與 SF 的接點,姓名只是查出來的附加資訊 */}
                      {d.customerCode && <span className="mono">{d.customerCode}</span>}
                      {sfLoading && ' · 查詢中…'}
                      {sfMember?.created_date && ` · 建檔 ${sfMember.created_date}`}
                      {sfMember?.level && ` · ${sfMember.level}`}
                      {!d.customerCode && `建檔 ${d.memberSince} · ${d.memberDevices} 台`}
                    </div>
                  </div>
                </div>
                <button
                  className={`btn ${openMember360 ? 'primary ab' : ''}`}
                  disabled={!openMember360}
                  onClick={(e) => { e.stopPropagation(); openMember360?.() }}
                  style={{ width: '100%', marginTop: 8, fontSize: 11, padding: '4px 8px', cursor: openMember360 ? 'pointer' : 'not-allowed' }}
                >
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

        {/* 對外報告產出 —— 2026-08-13 從個人層 sub-tab 列移進來:
            它只對「當前這一個場域」成立,掛在清單旁邊會指向使用者還沒選的場域。 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          padding: '10px 18px', borderTop: '1px solid var(--as-line-2)', background: '#fff',
        }}>
          <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>
            <Icon name="send" size={12} /> 對外報告 · 快照 + 免登入連結,產出後收不回
          </div>
          <ReportButton detail={d} />
        </div>
      </div>

      {/* ── 空氣健康成績單:AirCare 指數三分數卡 ───────────────── */}
      <AirScoreCards detail={d} />

      {/* ── 營運狀態 KPI(不進指數,分開呈現) ───────────────── */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16 }}>
        <div className="kpi orange">
          <div className="lbl">PM2.5 · 即時</div>
          <div className="val">{d.pm25Now}<span className="u">µg</span></div>
          <div className="ft">
            <span className="delta" style={{ color: pmTier.clr, fontWeight: 600 }}>{pmTier.lbl}</span>
            <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>P50 {d.pm25P50} · P90 {d.pm25P90}</span>
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
      <div style={{ marginTop: 16 }}>
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

      </div>

      {/* ── 跨層級導航列 ───────────────────── */}
      <div className="card" style={{ marginTop: 16, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--as-mute)' }}>
            <Icon name="layers" size={12} /> 跨層級導航 ·{' '}
            {d.airScore.percentile != null
              ? <>本設備 AirCare 指數 <b style={{ color: 'var(--as-ink)' }}>高於 {d.airScore.percentile}%</b> 的可比較設備(母體:全部設備近 90 個日曆日)</>
              : <>本場域在分群中排名 <b style={{ color: 'var(--as-ink)' }}>#{d.cohortRank}/{d.cohortSize}</b>(同類型平均 {d.cohortAvg} 分)</>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn" onClick={onJumpOverview}><Icon name="chart" size={13} />回設備總覽</button>
            <button className="btn" onClick={onJumpSegments}><Icon name="layers" size={13} />同分群比較</button>
            <button className="btn" onClick={onBackToList}><Icon name="menu" size={13} />回場域清單</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── ModuleA (root) ─────────────────────────────────── */
/* 場域清單是自己一層(整體 → 分類 → 清單 → 個人),不再是個人層的 sub-tab。 */
type ATab = 'overview' | 'segments' | 'list' | 'personal'

export function ModuleA() {
  const [tab, setTab] = useState<ATab>('overview')
  // 個人層的 sub-tab 與當前場域 id 提到 root,讓整體層 / 清單的 row 點擊可以直接跳場域詳情
  const [personalSubTab, setPersonalSubTab] = useState<APersonalSub>('detail')
  const [currentFieldId, setCurrentFieldId] = useState<string>('DEV-8065998DCAF0')
  // 場域清單類別篩選(由整體層 upsell 卡片點擊帶入)
  const [catFilter, setCatFilter] = useState<CatId | null>(null)

  const openDetailById = (fid: string) => {
    setCurrentFieldId(fid)
    setPersonalSubTab('detail')
    setTab('personal')
  }

  /** 從整體層 upsell 卡片進入「場域清單」並鎖定類別 */
  const openCategoryList = (cid: CatId) => {
    setCatFilter(cid)
    setTab('list')
  }

  const tabs = [
    { k: 'overview', l: '設備總覽' },
    { k: 'segments', l: '分類概況' },
    { k: 'list', l: '場域清單', n: 1284 },
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
      {tab === 'list' && (
        <AFieldList
          onSelect={openDetailById}
          catFilter={catFilter}
          onClearCatFilter={() => setCatFilter(null)}
        />
      )}
      {tab === 'personal' && (
        <APersonal
          subTab={personalSubTab}
          setSubTab={setPersonalSubTab}
          currentFieldId={currentFieldId}
          setCurrentFieldId={setCurrentFieldId}
          onJumpOverview={() => setTab('overview')}
          onJumpSegments={() => setTab('segments')}
          onBackToList={() => setTab('list')}
        />
      )}
    </PageShell>
  )
}

export default ModuleA
