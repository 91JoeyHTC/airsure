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
  aircareIndex,
  AIR_QUALITY_DIST,
  HUMIDITY_DIST,
  CATEGORIES,
  DEVICE_MODELS,
  POWER_STATES,
  USAGE_MODES,
  type FieldRecord,
  type DeviceModel,
  type PowerState,
  type UsageMode,
  type CatId,
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
const RANGE_SHIFT: Record<TimeRange, { pm: number; humidity: number; temp: number }> = {
  '7d': { pm: 1.35, humidity: +2.4, temp: +1.1 },
  '30d': { pm: 1.12, humidity: +1.0, temp: +0.4 },
  '90d': { pm: 1, humidity: 0, temp: 0 },
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
  const pm = Math.max(0.1, r1(f.pm * s.pm * (1 + j * amp)))
  const humidity = Math.min(95, Math.max(20, r1(f.humidity + s.humidity + j * amp * 22)))
  return {
    pm,
    humidity,
    temp: r1(f.temp + s.temp + j * amp * 5),
    /* 分數跟著位移後的 pm / 濕度重算(v2 §4)—— 獨立位移分數會讓同一列的
     * 分數與自己的量測值對不起來,分群卡與分數卡就會互相打臉 */
    q: Math.round(aircareIndex(pm, humidity)),
  }
}

/* ── 區間分桶 ─────────────────────────────────────────────────────────── */

export interface Bucket {
  k: string
  label: string
  lo: number
  hi: number
}

/* 篩選級距直接由 AIR_QUALITY_DIST / HUMIDITY_DIST 展開 —— 兩者共用同一份 v2 定義,
 * 篩「>65–75%」時分布卡「偏濕」那一列就是同一批場域。各寫一套的話,下拉選
 * 「過乾 <40%」而卡片畫「≤45%」,同一畫面兩套標準。 */
export const PM_BUCKETS: Bucket[] = AIR_QUALITY_DIST.map((d, i) => ({
  k: `pm${i}`, label: `${d.lvl} · ${d.range.replace('PM2.5 ', '')}`, lo: d.lo, hi: d.hi,
}))

export const HUMIDITY_BUCKETS: Bucket[] = HUMIDITY_DIST.map((d, i) => ({
  k: `hu${i}`, label: `${d.band} ${d.lvl} · ${d.range.replace('濕度 ', '')}`, lo: d.lo, hi: d.hi,
}))

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

/* ── 級距分布(空氣品質 / 濕度控制兩張卡) ──────────────────────────────
 * 筆數一律由當前 filtered 母體算,不是寫死的 —— 否則篩選一動,
 * 上面的 KPI 變了、這兩張卡不動,同一畫面又會出現兩套母體。
 * 每一級同時列出實際落在該級的分群,取代舊版寫死的 catIds
 * (舊版「過乾」那列的 catIds 是空陣列,18 個場域對不到任何類型)。 */

export interface TierCount {
  lvl: string
  range: string
  n: number
  pct: number
  color: string
  bg: string
  /** 實際落在這一級的分群(依母體算出來,不是硬綁) */
  cats: CatId[]
}

function tally(
  rows: FieldRecord[],
  range: TimeRange,
  bands: { lvl: string; range: string; lo: number; hi: number; color: string; bg: string }[],
  pick: (m: FieldMetrics) => number,
): TierCount[] {
  return bands.map((b) => {
    const hit = rows.filter((f) => {
      const v = pick(metricsFor(f, range))
      return v > (b.lo === 0 ? -Infinity : b.lo) && v <= b.hi
    })
    const cats = CATEGORIES.map((c) => c.id).filter((id) => hit.some((f) => f.cat === id))
    return {
      lvl: b.lvl,
      range: b.range,
      n: hit.length,
      pct: rows.length === 0 ? 0 : Math.round((hit.length / rows.length) * 1000) / 10,
      color: b.color,
      bg: b.bg,
      cats,
    }
  })
}

/** PM2.5 報告級距分布(v2 §4.1 末段:極淨 / 優良 / 尚可 / 待改善 / 不健康) */
export function computeAirQualityDist(rows: FieldRecord[], range: TimeRange): TierCount[] {
  return tally(rows, range, AIR_QUALITY_DIST, (m) => m.pm)
}

/** 濕度分群等級分布(v2 §3.3:HH / H1 / H2 / H3 / H4) */
export function computeHumidityDist(rows: FieldRecord[], range: TimeRange): TierCount[] {
  return tally(rows, range, HUMIDITY_DIST, (m) => m.humidity)
}

/* ── 設備使用相關(第五屏)的四張分布 ────────────────────────────────────
 * 使用強度 / 電源狀態 / 運轉模式由母體即時算,總數對齊「連網設備數 4,832 台」;
 * 風速母體沒有欄位,先用中台儀表板快照的數字寫死(卡片上會標明來源與母體差異)。 */

/** 類別色盤。以 AirSure 品牌三色為基底延伸,並跑過 dataviz 驗證器:
 *  node scripts/validate_palette.js "#0D9488,#D97706,#4F46E5,#DC2626,#0284C7,#EA580C,#7C3AED"
 *    --mode light --surface "#FFFFFF"   → 亮度帶 / 色度下限 / CVD 分離 / 一般視覺 / 對比 全數 PASS
 *  順序固定,不得循環使用;第 8 個類別一律折進「其他」而不是再生一個色。 */
export const VIZ_SERIES = ['#0D9488', '#D97706', '#4F46E5', '#DC2626', '#0284C7', '#EA580C', '#7C3AED']
/** 「關機 / 關閉 / 其他」這類非類別的退位色,刻意低彩度,不佔類別色位 */
export const VIZ_MUTED = '#9CA3AF'

export interface DonutSlice {
  k: string
  label: string
  /** 圖例第二行(級距、RPM、折疊進來的項目…) */
  sub?: string
  n: number
  pct: number
  color: string
}

const withPct = (raw: { k: string; label: string; sub?: string; n: number; color: string }[]): DonutSlice[] => {
  const total = raw.reduce((s, x) => s + x.n, 0)
  return raw.map((x) => ({ ...x, pct: total === 0 ? 0 : Math.round((x.n / total) * 1000) / 10 }))
}

/* ① 使用強度 —— 門檻沿用分群層 SEGMENTS_A「依使用強度」的 traits 敘述。
 * 母體的 hrs 為 6–22h 均勻分布,依此門檻切出來剛好接近 25 / 50 / 25 的百分位框架。 */
export const USAGE_BANDS: { k: string; label: string; sub: string; action: string; lo: number; hi: number }[] = [
  { k: 'heavy', label: '重度', sub: '日均 > 18h · 高度依賴', action: '推薦長效濾網 / 升級 Pro 機型', lo: 18, hi: Infinity },
  { k: 'mid',   label: '中度', sub: '日均 10–18h · 穩定使用', action: '維持基本服務 / 月度報告',       lo: 10, hi: 18 },
  { k: 'light', label: '輕度', sub: '日均 < 10h · 部分閒置',  action: '推送喚醒任務 / LINE 提醒',      lo: 0,  hi: 10 },
]

export function computeUsageDist(rows: FieldRecord[]): DonutSlice[] {
  return withPct(USAGE_BANDS.map((b, i) => ({
    k: b.k, label: b.label, sub: b.sub, color: VIZ_SERIES[i],
    n: rows.filter((f) => f.hrs > b.lo && f.hrs <= b.hi).reduce((s, f) => s + f.devTotal, 0),
  })))
}

/* ② 電源狀態 —— 三態合計必然等於 devTotal,不會出現對不上的殘數。 */
export function computePowerDist(rows: FieldRecord[]): DonutSlice[] {
  const sum = (f: (r: FieldRecord) => number) => rows.reduce((s, r) => s + f(r), 0)
  const on = sum((r) => r.devOnline)
  const tank = sum((r) => r.devTankFull)
  const off = sum((r) => r.devTotal) - on - tank
  return withPct([
    { k: 'on',   label: '開機',   sub: '今日有運轉',       n: on,   color: VIZ_SERIES[0] },
    { k: 'off',  label: '關機',   sub: '連網但今日未運轉', n: off,  color: VIZ_MUTED },
    { k: 'tank', label: '水箱滿', sub: '水滿停機 · 待倒水', n: tank, color: VIZ_SERIES[1] },
  ])
}

/* ③ 運轉模式 —— 未運轉的台數歸「關機」,其餘依該場域的主要模式,以開機台數加權。 */
export function computeModeDist(rows: FieldRecord[]): DonutSlice[] {
  const idle = rows.reduce((s, r) => s + (r.devTotal - r.devOnline), 0)
  const byMode = USAGE_MODES.map((m, i) => ({
    k: m, label: m, sub: MODE_HINT[m], color: VIZ_SERIES[i],
    n: rows.filter((f) => f.mode === m).reduce((s, f) => s + f.devOnline, 0),
  }))
  return withPct([
    { k: 'off', label: '關機', sub: '未運轉', n: idle, color: VIZ_MUTED },
    ...byMode,
  ].filter((x) => x.n > 0 || x.k === 'off'))
}

const MODE_HINT: Record<UsageMode, string> = {
  雙智慧: 'AUTO · PM2.5 自動 + 濕度連動',
  清淨智慧: 'CLEAN · 純清淨',
  除濕智慧: 'DEHUMIDIFY · 980 RPM 除濕強',
  手動風量: '使用者指定風速',
  睡眠: '固定最小風',
  除臭: '120 分鐘 Turbo',
}

/* ④ 風速 —— 母體沒有風速欄位(FieldRecord 不帶 fanSpeed),先用中台儀表板的快照寫死。
 * 母體 3,570 台與本頁的 4,832 台不同,卡片上會標明,不假裝是同一份數字。
 * 原始 10 級折成 7 段:退位灰(關閉)+ 6 個類別色。尾端四級(4 強風 104 / 3 大風 60 /
 * 6 除濕大 21 / 8 除臭風量 13)併為「其他風速」—— 甜甜圈超過 6–7 段就開始分不出來,
 * 折疊比多生兩個辨識不了的顏色誠實;折進去的四級在圖例第二行仍逐項列出,數字沒有消失。 */
export const FAN_SPEED_SOURCE = { label: '中台儀表板快照', devices: 3570 }

export const FAN_SPEED_DIST: DonutSlice[] = withPct([
  { k: 'f0', label: '0 關閉/停止', sub: '未送風',            n: 1630, color: VIZ_MUTED },
  { k: 'f1', label: '1 小風',      sub: '低風量',            n:  755, color: VIZ_SERIES[0] },
  { k: 'f5', label: '5 除濕強',    sub: '980 RPM',           n:  499, color: VIZ_SERIES[1] },
  { k: 'f7', label: '7 除濕中',    sub: '750 RPM',           n:  201, color: VIZ_SERIES[2] },
  { k: 'f9', label: '9 睡眠',      sub: '固定最小風',        n:  170, color: VIZ_SERIES[3] },
  { k: 'f2', label: '2 中風',      sub: '中風量',            n:  117, color: VIZ_SERIES[4] },
  { k: 'fx', label: '其他風速',    sub: '4 強風 104 · 3 大風 60 · 6 除濕大 21 · 8 除臭風量 13', n: 198, color: VIZ_SERIES[5] },
])
