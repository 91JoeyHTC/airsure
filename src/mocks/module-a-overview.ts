/* Module A · 設備總覽(第一層 tab)的篩選與 KPI 彙總
 *
 * 為什麼獨立成一檔:七張 KPI 字卡與下方明細表必須吃同一份 filtered 母體,
 * 否則篩選一動,字卡與表就各說各話。判定全部集中在這裡,元件只負責版面。
 * 母體是 FIELDS_A_POP(1,284 場域 / 4,832 台),生成規則見 mocks/module-a.ts。
 */
import { DEVICE_REPORTS, deviceFieldId } from './devices'
import {
  FIELDS_A_POP,
  REAL_FIELD_IDS,
  regionOfName,
  DEVICE_MODELS,
  POWER_STATES,
  USAGE_MODES,
  type FieldRecord,
  type DeviceModel,
  type PowerState,
  type UsageMode,
} from './module-a'

/* ── 時間區間 ─────────────────────────────────────────────────────────── */

export type TimeRange = '7d' | '30d' | '90d'

export const TIME_RANGES: { k: TimeRange; label: string; days: number }[] = [
  { k: '7d', label: '近 7 天', days: 7 },
  { k: '30d', label: '近 30 天', days: 30 },
  { k: '90d', label: '近 90 天', days: 90 },
]

/** 預設 90 天 —— AirCare 設備分析報告的統計期就是 90 天,檯面數字也以此為準。 */
export const DEFAULT_RANGE: TimeRange = '90d'

/* 示範列的區間位移。真實三台不吃這組係數(它們從 daily 真算),
 * 這裡只讓示範母體在切換區間時有一致方向的變化:越短期越貼近近期空污與梅雨。 */
const RANGE_SHIFT: Record<TimeRange, { pm: number; humidity: number; temp: number; q: number }> = {
  '7d': { pm: 1.35, humidity: +2.4, temp: +1.1, q: -3 },
  '30d': { pm: 1.12, humidity: +1.0, temp: +0.4, q: -1 },
  '90d': { pm: 1, humidity: 0, temp: 0, q: 0 },
}

/* ── 真實設備的區間量測值(由 daily 真算,不套係數) ─────────────────── */

const r1 = (v: number) => Math.round(v * 10) / 10

const REAL_METRICS: Record<string, Record<TimeRange, FieldMetrics>> = Object.fromEntries(
  DEVICE_REPORTS.map((r) => {
    const q = Math.round(r.meta.airScore)
    const byRange = Object.fromEntries(
      TIME_RANGES.map(({ k, days }) => {
        const win = r.daily.slice(-days)
        const mean = (f: (d: (typeof win)[number]) => number) => win.reduce((s, d) => s + f(d), 0) / win.length
        return [k, {
          pm: r1(mean((d) => d.avg)),
          humidity: r1(mean((d) => d.humidity)),
          temp: r1(mean((d) => d.temp)),
          /* 報告只給 90 天的總分,短區間沒有官方計分基準 —— 不自己編一個,維持原分數。 */
          q,
        }]
      }),
    ) as Record<TimeRange, FieldMetrics>
    return [deviceFieldId(r.meta.mac), byRange]
  }),
)

/* ── 每列在指定區間下的量測值 ─────────────────────────────────────────── */

export interface FieldMetrics {
  pm: number
  humidity: number
  temp: number
  q: number
}

/** 由場域 id 推一個 -1 ~ +1 的決定性抖動,讓示範列各自有自己的區間變化 */
function jitterOf(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 2000) / 1000 - 1
}

/** 該場域在指定區間下的 PM2.5 / 濕度 / 溫度 / AirCare 分數。 */
export function metricsFor(f: FieldRecord, range: TimeRange): FieldMetrics {
  const real = REAL_METRICS[f.id]
  if (real) return real[range]
  const s = RANGE_SHIFT[range]
  if (range === '90d') return { pm: f.pm, humidity: f.humidity, temp: f.temp, q: f.q }
  /* 抖動幅度隨區間縮短放大 —— 短期本來就比長期不穩 */
  const amp = range === '7d' ? 0.22 : 0.09
  const j = jitterOf(f.id)
  return {
    pm: Math.max(0.1, r1(f.pm * s.pm * (1 + j * amp))),
    humidity: Math.min(95, Math.max(20, r1(f.humidity + s.humidity + j * amp * 22))),
    temp: r1(f.temp + s.temp + j * amp * 5),
    q: Math.min(100, Math.max(0, Math.round(f.q + s.q + j * amp * 14))),
  }
}

/* ── 區間分桶 ─────────────────────────────────────────────────────────── */

export interface Bucket {
  k: string
  label: string
  lo: number
  hi: number
}

/* 門檻依室內實測訂,不是套室外 AQI:三台真實設備 90 天平均 PM2.5 是 1.4 / 2.5 / 3.6,
 * 若沿用室外的 15/35/55 分級,整份母體會全部塞進同一格,篩選等於沒作用。 */
export const PM_BUCKETS: Bucket[] = [
  { k: 'pm0', label: '優 · < 2', lo: 0, hi: 2 },
  { k: 'pm1', label: '良好 · 2–5', lo: 2, hi: 5 },
  { k: 'pm2', label: '普通 · 5–10', lo: 5, hi: 10 },
  { k: 'pm3', label: '不佳 · ≥ 10', lo: 10, hi: Infinity },
]

export const HUMIDITY_BUCKETS: Bucket[] = [
  { k: 'hu0', label: '過乾 · < 40%', lo: 0, hi: 40 },
  { k: 'hu1', label: '偏乾 · 40–50%', lo: 40, hi: 50 },
  { k: 'hu2', label: '舒適 · 50–60%', lo: 50, hi: 60 },
  { k: 'hu3', label: '偏濕 · 60–70%', lo: 60, hi: 70 },
  { k: 'hu4', label: '過濕 · ≥ 70%', lo: 70, hi: Infinity },
]

const inBucket = (v: number, list: Bucket[], k: string): boolean => {
  const b = list.find((x) => x.k === k)
  return !b || (v >= b.lo && v < b.hi)
}

/* ── 篩選 ─────────────────────────────────────────────────────────────── */

export const ALL = 'all' as const

export interface OverviewFilters {
  model: DeviceModel | typeof ALL
  power: PowerState | typeof ALL
  mode: UsageMode | typeof ALL
  pm: string
  humidity: string
  range: TimeRange
  /** 由區域熱圖點擊帶入,與六個下拉以 AND 結合 */
  region: string | null
}

export const DEFAULT_FILTERS: OverviewFilters = {
  model: ALL, power: ALL, mode: ALL, pm: ALL, humidity: ALL, range: DEFAULT_RANGE, region: null,
}

/** 已套用的篩選項數(時間區間不算,它永遠有值) */
export function activeFilterCount(f: OverviewFilters): number {
  return [f.model, f.power, f.mode, f.pm, f.humidity].filter((v) => v !== ALL).length + (f.region ? 1 : 0)
}

export const FILTER_OPTIONS = {
  model: DEVICE_MODELS,
  power: POWER_STATES,
  mode: USAGE_MODES,
}

/** 依篩選條件取出母體。PM2.5 / 濕度比對的是「該區間下」的值,與表格顯示同源。 */
export function filterFields(filters: OverviewFilters, pop: FieldRecord[] = FIELDS_A_POP): FieldRecord[] {
  return pop.filter((f) => {
    if (filters.model !== ALL && f.model !== filters.model) return false
    if (filters.power !== ALL && f.power !== filters.power) return false
    if (filters.mode !== ALL && f.mode !== filters.mode) return false
    if (filters.region && regionOfName(f.nm) !== filters.region) return false
    if (filters.pm === ALL && filters.humidity === ALL) return true
    const m = metricsFor(f, filters.range)
    if (filters.pm !== ALL && !inBucket(m.pm, PM_BUCKETS, filters.pm)) return false
    if (filters.humidity !== ALL && !inBucket(m.humidity, HUMIDITY_BUCKETS, filters.humidity)) return false
    return true
  })
}

/* ── KPI 七格 ─────────────────────────────────────────────────────────── */

export interface OverviewKpi {
  /** ① 連網設備數 */
  devices: number
  /** ② 平均 PM2.5 µg/m³ */
  pm: number
  /** ③ 平均濕度 % */
  humidity: number
  /** ④ 平均溫度 °C */
  temp: number
  /** ⑤ 平均 AirCare 分數 */
  score: number
  /** ⑥ 耗材立即處理數(台) */
  urgent: number
  /** ⑦ 警報設備數(台) */
  alarms: number
  /* 底下不是字卡,是給副標用的母體規模 —— 篩選後別讓人把局部數字當全體 */
  fields: number
  online: number
  onlinePct: number
  realFields: number
  realDevices: number
}

const EMPTY_KPI: OverviewKpi = {
  devices: 0, pm: 0, humidity: 0, temp: 0, score: 0, urgent: 0, alarms: 0,
  fields: 0, online: 0, onlinePct: 0, realFields: 0, realDevices: 0,
}

export function computeOverviewKpi(rows: FieldRecord[], range: TimeRange): OverviewKpi {
  if (rows.length === 0) return EMPTY_KPI
  const sum = (f: (r: FieldRecord) => number) => rows.reduce((s, r) => s + f(r), 0)
  const metrics = rows.map((r) => metricsFor(r, range))
  const avg = (f: (m: FieldMetrics) => number) => metrics.reduce((s, m) => s + f(m), 0) / metrics.length
  const devices = sum((r) => r.devTotal)
  const online = sum((r) => r.devOnline)
  const real = rows.filter((r) => REAL_FIELD_IDS.includes(r.id))
  return {
    devices,
    pm: r1(avg((m) => m.pm)),
    humidity: Math.round(avg((m) => m.humidity)),
    temp: r1(avg((m) => m.temp)),
    score: Math.round(avg((m) => m.q)),
    urgent: sum((r) => r.urgentParts),
    alarms: sum((r) => r.alarmDevices),
    fields: rows.length,
    online,
    onlinePct: devices === 0 ? 0 : Math.round((online / devices) * 1000) / 10,
    realFields: real.length,
    realDevices: real.reduce((s, r) => s + r.devTotal, 0),
  }
}
