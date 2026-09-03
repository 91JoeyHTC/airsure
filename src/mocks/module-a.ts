/* AirSure — Module A mock data: 居家空氣場域 */

/* ── 六大類型參照表(方案 C 業務端代號為主、方案 A 身分標籤為副) ───────── */
import { DEVICE_REPORTS, deviceFieldId } from './devices'
import type { DeviceReport } from './devices'

export type CatId = '1' | '2' | '3' | '4' | '5' | '6'
export type Disposition = 'ok' | 'attention' | 'warning'

export interface CategoryMeta {
  id: CatId
  code: string        // 業務端代號(主)
  identity: string    // 身分標籤(副)
  customer: string    // 客戶端標籤
  disposition: Disposition
  color: string       // 主色
  bg: string          // 淺底色
  desc: string        // 一句話定位
}

export const CATEGORIES: CategoryMeta[] = [
  { id: '1', code: '維持型',     identity: '空氣模範生', customer: '金級空氣',  disposition: 'ok',        color: '#16A34A', bg: '#DCFCE7', desc: 'PM2.5 與濕度雙優 · 健康證書首選' },
  { id: '2', code: '穩定型',     identity: '健康常客',   customer: '銀級空氣',  disposition: 'ok',        color: '#16A085', bg: '#D1F3EB', desc: '日常穩定 · 重點維護濾網節奏' },
  { id: '3', code: '待提升型',   identity: '可優化型',   customer: '銅級空氣',  disposition: 'attention', color: '#CA8A04', bg: '#FEF3C7', desc: '單項偏弱 · 可推升級耗材' },
  { id: '4', code: '除濕型',     identity: '濕氣困擾型', customer: '濕度待調',  disposition: 'attention', color: '#D97706', bg: '#FFEDD5', desc: '濕度偏高 · CS 系列除濕主打族群' },
  { id: '5', code: '清淨型',     identity: '空污壓力型', customer: '空品待調',  disposition: 'attention', color: '#EA580C', bg: '#FFE4D6', desc: '室內 PM2.5 偏高 · CS 系列清淨主打族群' },
  { id: '6', code: '雙重介入型', identity: '雙重風險型', customer: '環境待調',  disposition: 'warning',   color: '#DC2626', bg: '#FEE2E2', desc: 'PM2.5 與濕度同步偏弱 · 最高 LTV upsell' },
]

export const DISPOSITION_META: Record<Disposition, { label: string; color: string; bg: string; pill: 'g'|'y'|'r' }> = {
  ok:        { label: 'OK',     color: 'var(--as-success)', bg: '#DCFCE7', pill: 'g' },
  attention: { label: '建議處理', color: '#CA8A04',          bg: '#FEF3C7', pill: 'y' },
  warning:   { label: '警告處理', color: 'var(--as-danger)',  bg: '#FEE2E2', pill: 'r' },
}

/* ── 六大類型在 1,284 場域中的分布(對齊使用中場域數) ──────────────────── */
export interface CategoryDist {
  id: CatId
  n: number
  pct: number   // 佔比 %(已四捨五入到 1 位)
}

export const CATEGORY_DIST: CategoryDist[] = [
  { id: '1', n: 412, pct: 32.1 },
  { id: '2', n: 386, pct: 30.1 },
  { id: '3', n: 248, pct: 19.3 },
  { id: '4', n: 124, pct:  9.7 },
  { id: '5', n:  78, pct:  6.1 },
  { id: '6', n:  36, pct:  2.8 },
]

/* 三級處置 rollup(① + ② / ③④⑤ / ⑥) */
export interface DispositionRollup {
  key: Disposition
  n: number
  pct: number
  catIds: CatId[]
}

export const DISPOSITION_ROLLUP: DispositionRollup[] = [
  { key: 'ok',        n: 798, pct: 62.2, catIds: ['1', '2'] },
  { key: 'attention', n: 450, pct: 35.0, catIds: ['3', '4', '5'] },
  { key: 'warning',   n:  36, pct:  2.8, catIds: ['6'] },
]

/* ── KPI ② 今日開機率 ────────────────────────────────────────────────── */
export const TODAY_POWER_ON = {
  active: 4231,
  total: 4832,
  pct: 87.5,
  deltaPct: +1.8, // vs 昨日
}

/* ── KPI ③ DHI 副指標:機器貢獻 / 室內外落差(Phase 2 待接 API) ────────── */
export const DHI_ATTRIBUTION = {
  baseline: 65.6,    // 若無機器、室外落塵推估的基礎分
  contributedBy: 16.4, // 機器拉抬的分數
  total: 82,
  status: 'pending' as 'pending' | 'live', // pending = 待接環境部 API
}

/* ── KPI ④ 室內外落差(Phase 2 待接 API,先給示意值) ─────────────────── */
export const INDOOR_OUTDOOR = {
  indoorPM25: 12.4,
  outdoorPM25: 28.6,
  blockedPct: 56.6,
  status: 'pending' as 'pending' | 'live',
  source: '環境部空氣品質開放 API · 待串接',
}

/* ── upsell 機會池(對應 CS 系列產品訴求) ────────────────────────────── */
export interface UpsellSlot {
  catId: CatId
  code: string
  persona: string
  n: number
  product: string
  pitch: string
  ltvHint: string
}

export const UPSELL_POOL: UpsellSlot[] = [
  { catId: '4', code: '除濕型',     persona: '濕氣困擾型', n: 124, product: 'CS 系列 · 除濕主打',    pitch: '梅雨季除濕需求 + 黴菌過敏',          ltvHint: '客單 7–9k' },
  { catId: '5', code: '清淨型',     persona: '空污壓力型', n:  78, product: 'CS 系列 · 清淨主打',    pitch: '空污季 PM2.5 飆高 + 高敏家庭',       ltvHint: '客單 6–8k' },
  { catId: '6', code: '雙重介入型', persona: '雙重風險型', n:  36, product: 'CS 系列 · 清淨+除濕一體機', pitch: '一機解決兩重困擾 · 主管最在意 LTV', ltvHint: '客單 12–18k' },
]

/* ── 類型流動(Phase 1.5,本月遷移示意) ─────────────────────────────── */
export interface CategoryFlow {
  from: CatId
  to: CatId
  n: number
  dir: 'up' | 'down'   // up = 改善方向,down = 惡化方向
}

export const CATEGORY_FLOWS: CategoryFlow[] = [
  { from: '3', to: '2', n: 24, dir: 'up' },
  { from: '4', to: '2', n:  8, dir: 'up' },
  { from: '5', to: '3', n: 11, dir: 'up' },
  { from: '6', to: '4', n:  3, dir: 'up' },
  { from: '2', to: '4', n:  6, dir: 'down' },
  { from: '3', to: '5', n:  4, dir: 'down' },
  { from: '5', to: '6', n:  3, dir: 'down' },
]

/* 流動匯總 */
export const CATEGORY_FLOW_SUMMARY = {
  improved: 46,    // 本月升級數
  worsened: 13,    // 本月降級數
  stable: 1225,    // 持平
  net: +33,        // 淨改善
  snapshotWeeks: 4, // 已累積快照週數
}

/* ── 場域記錄(加 cat 類型 + hrs 日均開機時數 + customerId 客戶編號) ── */
/* 設備屬性 —— 2026-09-03「設備總覽」六個篩選條件需要。
 * 真實三台一律由 DEVICE_REPORTS 推導;報告沒寫的(例如 model 為空字串)標「未登錄」,不補假值。 */
export type DeviceModel = 'CS101' | 'CS201' | 'CS301' | 'CS500' | '未登錄'
/* power 與 devOnline 同源,不得各自為政:
 *   開機 ⟺ devOnline > 0;關機 = 設備仍連網但今日皆未開機;離線 = 今日完全無回報。 */
export type PowerState = '開機' | '關機' | '離線'
export type UsageMode = '雙智慧' | '清淨智慧' | '除濕智慧' | '手動風量' | '睡眠' | '除臭'

export const DEVICE_MODELS: DeviceModel[] = ['CS101', 'CS201', 'CS301', 'CS500', '未登錄']
export const POWER_STATES: PowerState[] = ['開機', '關機', '離線']
export const USAGE_MODES: UsageMode[] = ['雙智慧', '清淨智慧', '除濕智慧', '手動風量', '睡眠', '除臭']

export interface FieldRecord {
  nm: string           // 實體場域名(如「臺北信義居家」),作為副資訊
  id: string           // 場域編號 SH-xxxx(內部識別)
  customerId: string   // 客戶編號 C20xxxxxxx(對外顯示主鍵)
  customerName: string // 客戶 / 公司名(乾淨名稱,無 tier 標籤)
  addr: string
  type: string
  sz: number
  dev: string
  lamp: 'g' | 'y' | 'r'
  q: number
  pm: number
  co2: number
  mem: string
  tier: string
  cat: CatId           // 六大類型
  hrs: number          // 日均開機時數
  minPct: number       // 該場域 6 類耗材的最低殘量 %(用於分群第 1 軸)
  predictedDays: number // 最快需要更換的耗材預估剩餘天數
  /* ↓ 設備總覽篩選與 KPI 字卡用 */
  model: DeviceModel   // 機型
  power: PowerState    // 場域主要電源狀態
  mode: UsageMode      // 時數占比最高的使用模式
  humidity: number     // 平均相對濕度 %
  temp: number         // 平均溫度 °C
  devTotal: number     // 場域設備總數(全母體 Σ = 4,832,對齊 TODAY_POWER_ON.total)
  devOnline: number    // 今日開機數(全母體 Σ = 4,231,對齊 TODAY_POWER_ON.active)
  urgentParts: number  // 耗材判定「立即處理」的設備數
  alarmDevices: number // 有未解除警報的設備數
}

/* 真實設備 → 場域清單列。nm 由地址前兩段推出,只為清單好讀;主鍵仍是 MAC。 */
const DEVICE_ROWS: FieldRecord[] = DEVICE_REPORTS.map((r) => {
  const m = r.meta
  const worst = [...r.consumables].sort((a, b) => a.remainingPct - b.remainingPct)[0]
  const city = m.address.slice(0, 3), dist = m.address.slice(3, 5)
  /* 設備屬性全部推導,不手填:model 空字串代表報告沒帶機型,標「未登錄」而非猜一個。 */
  const runOn = r.runStates.find((x) => x.label === '正常運轉')?.hours ?? 0
  const runOff = r.runStates.find((x) => x.label === '關機')?.hours ?? 0
  const topMode = [...r.modes].sort((a, b) => b.hours - a.hours)[0]
  const tempAvg = r.daily.reduce((s, d) => s + d.temp, 0) / r.daily.length
  const isOn = runOn > 0 && runOn >= runOff
  return {
    nm: `${city.replace('臺', '台')}${dist}居家`,
    id: deviceFieldId(m.mac),
    customerId: m.customerCode,
    /* 清單不顯示姓名(個資不落地);要看是誰,點進場域詳情由識別卡即時向 SF 取。 */
    customerName: m.customerCode,
    addr: m.address.slice(3),
    type: '居家', sz: 0, dev: isOn ? '1/1' : '0/1',
    lamp: m.airScore >= 75 ? 'g' : m.airScore >= 60 ? 'y' : 'r',
    q: Math.round(m.airScore),
    pm: Math.round(r.daily[r.daily.length - 1].avg),
    co2: 0,
    mem: m.customerCode,
    tier: '',
    cat: (({ 金級空氣: '1', 銀級空氣: '2', 銅級空氣: '3', 濕度風險: '4', 清淨風險: '5', 清淨除濕雙風險: '6' } as Record<string, CatId>)[m.segment]) ?? '1',
    hrs: Math.round(m.runHours / m.days * 10) / 10,
    minPct: worst.remainingPct,
    predictedDays: Math.round(worst.daysLeft),
    model: (DEVICE_MODELS as string[]).includes(m.model) ? (m.model as DeviceModel) : '未登錄',
    power: runOn <= 0 ? '離線' : isOn ? '開機' : '關機',
    mode: (USAGE_MODES as string[]).includes(topMode?.label) ? (topMode.label as UsageMode) : '雙智慧',
    humidity: Math.round(m.humidityAvg * 10) / 10,
    temp: Math.round(tempAvg * 10) / 10,
    devTotal: 1,
    devOnline: isOn ? 1 : 0,
    urgentParts: r.consumables.some((c) => c.urgency === '立即處理') ? 1 : 0,
    alarmDevices: m.lastAlarmCode !== 0 ? 1 : 0,
  }
})

export const FIELDS_A_FULL: FieldRecord[] = [
  /* ★ 真實資料列(3 台),由 DEVICE_REPORTS 產生 —— 見本檔後段 fieldDetailFromReport。
   *   其餘 9 列仍為示範資料。 */
  ...DEVICE_ROWS,
  { nm: '臺北信義居家',   id: 'SH-0021', customerId: 'C202105001', customerName: '陳俊宏',       addr: '信義區松仁路',  type: '居家', sz: 42,  dev: '4/4',  lamp: 'g', q: 92, pm: 12, co2: 642,  mem: '陳俊宏 · 高級',  tier: 'g', cat: '1', hrs: 18.2, minPct: 64, predictedDays:  72,
    model: 'CS301', power: '開機', mode: '雙智慧',   humidity: 54, temp: 25.8, devTotal:  4, devOnline: 4, urgentParts: 0, alarmDevices: 0 },
  { nm: '新北板橋辦公',   id: 'SH-1147', customerId: 'C202003042', customerName: '李文君',       addr: '板橋區文化路',  type: '辦公', sz: 88,  dev: '8/9',  lamp: 'y', q: 76, pm: 32, co2: 894,  mem: '李文君',         tier: '',  cat: '3', hrs: 10.4, minPct: 28, predictedDays:  18,
    model: 'CS201', power: '開機', mode: '清淨智慧', humidity: 62, temp: 26.4, devTotal:  9, devOnline: 8, urgentParts: 1, alarmDevices: 1 },
  { nm: '臺中科技園區',   id: 'SH-2841', customerId: 'C201000272', customerName: '王婉真',       addr: '西屯區工業區',  type: '辦公', sz: 185, dev: '6/10', lamp: 'r', q: 48, pm: 84, co2: 1240, mem: '王婉真 · 高級',  tier: 'g', cat: '6', hrs:  6.1, minPct: 11, predictedDays:   6,
    model: 'CS500', power: '開機', mode: '手動風量', humidity: 74, temp: 28.9, devTotal: 10, devOnline: 6, urgentParts: 3, alarmDevices: 2 },
  { nm: '高雄前鎮辦公',   id: 'SH-3052', customerId: 'C202206018', customerName: '張志成',       addr: '前鎮區成功二路', type: '辦公', sz: 64,  dev: '5/5',  lamp: 'g', q: 88, pm: 18, co2: 720,  mem: '張志成',         tier: '',  cat: '2', hrs: 14.6, minPct: 52, predictedDays:  48,
    model: 'CS301', power: '開機', mode: '雙智慧',   humidity: 57, temp: 27.2, devTotal:  5, devOnline: 5, urgentParts: 0, alarmDevices: 0 },
  { nm: '桃園藝文居家',   id: 'SH-4119', customerId: 'C201912033', customerName: '黃慧君',       addr: '桃園區慈文路',  type: '居家', sz: 38,  dev: '3/3',  lamp: 'g', q: 95, pm:  8, co2: 580,  mem: '黃慧君 · 高級',  tier: 'g', cat: '1', hrs: 20.8, minPct: 71, predictedDays:  88,
    model: 'CS500', power: '開機', mode: '雙智慧',   humidity: 52, temp: 25.1, devTotal:  3, devOnline: 3, urgentParts: 0, alarmDevices: 0 },
  { nm: '臺南安平診所',   id: 'SH-5023', customerId: 'C202109054', customerName: '安平診所',     addr: '安平區永華路',  type: '醫療', sz: 96,  dev: '7/8',  lamp: 'y', q: 71, pm: 38, co2: 920,  mem: '林醫師',         tier: '',  cat: '5', hrs:  9.2, minPct: 22, predictedDays:  14,
    model: 'CS201', power: '開機', mode: '清淨智慧', humidity: 61, temp: 26.8, devTotal:  8, devOnline: 7, urgentParts: 1, alarmDevices: 1 },
  { nm: '新竹東區居家',   id: 'SH-5208', customerId: 'C202304076', customerName: '吳承翰',       addr: '東區光復路',    type: '居家', sz: 52,  dev: '4/4',  lamp: 'g', q: 90, pm: 14, co2: 620,  mem: '吳承翰 · 高級',  tier: 'g', cat: '2', hrs: 16.5, minPct: 58, predictedDays:  56,
    model: 'CS301', power: '開機', mode: '雙智慧',   humidity: 55, temp: 25.6, devTotal:  4, devOnline: 4, urgentParts: 0, alarmDevices: 0 },
  { nm: '臺北大安咖啡店', id: 'SH-5611', customerId: 'C202008123', customerName: '阿諾義式咖啡', addr: '大安區忠孝東路', type: '商業', sz: 28,  dev: '2/3',  lamp: 'y', q: 68, pm: 42, co2: 1080, mem: '阿諾義式',       tier: '',  cat: '4', hrs: 11.8, minPct: 18, predictedDays:   9,
    model: 'CS101', power: '開機', mode: '除濕智慧', humidity: 68, temp: 27.9, devTotal:  3, devOnline: 2, urgentParts: 1, alarmDevices: 1 },
  { nm: '宜蘭礁溪民宿',   id: 'SH-6022', customerId: 'C202105099', customerName: '陶然居民宿',   addr: '礁溪鄉德陽路',  type: '商業', sz: 76,  dev: '4/4',  lamp: 'g', q: 86, pm: 22, co2: 690,  mem: '陶然居',         tier: '',  cat: '2', hrs: 13.4, minPct: 46, predictedDays:  32,
    model: 'CS201', power: '開機', mode: '睡眠',     humidity: 59, temp: 26.2, devTotal:  4, devOnline: 4, urgentParts: 0, alarmDevices: 0 },
]

/* 當區室外 PM2.5(Phase 2 待接,先示意) */
export const FIELD_OUTDOOR_PM25: Record<string, number> = {
  'SH-0021': 22,
  'SH-1147': 35,
  'SH-2841': 92,
  'SH-3052': 28,
  'SH-4119': 26,
  'SH-5023': 41,
  'SH-5208': 24,
  'SH-5611': 38,
  'SH-6022': 19,
}

export const FIELD_DELTAS: Record<string, number> = {
  'SH-0021': 2,
  'SH-1147': -4,
  'SH-2841': -12,
  'SH-3052': 1,
  'SH-4119': 3,
  'SH-5023': -5,
  'SH-5208': 0,
  'SH-5611': -7,
  'SH-6022': 4,
}

export interface RegionHealth {
  r: string
  n: number
  q: number
  dlt: number
  /** 警告處理(類型⑥)占該區比例 % — 用於熱圖類型維度 */
  warnPct: number
  /** 建議處理(③④⑤)占該區比例 % */
  attnPct: number
  /** 室內外落差 %(機器擋掉的 PM2.5 比例),Phase 2 示意 */
  blockedPct: number
}

export const REGION_HEALTH: RegionHealth[] = [
  { r: '臺北市',   n: 312, q: 86, dlt: +2, warnPct: 1.8, attnPct: 28, blockedPct: 62 },
  { r: '新北市',   n: 286, q: 82, dlt: -1, warnPct: 2.5, attnPct: 36, blockedPct: 58 },
  { r: '桃園市',   n: 178, q: 89, dlt: +3, warnPct: 1.2, attnPct: 24, blockedPct: 66 },
  { r: '新竹縣市', n:  38, q: 91, dlt: +4, warnPct: 0.8, attnPct: 18, blockedPct: 71 },
  { r: '臺中市',   n: 165, q: 71, dlt: -6, warnPct: 6.8, attnPct: 48, blockedPct: 52 },
  { r: '臺南市',   n: 124, q: 79, dlt: -2, warnPct: 3.4, attnPct: 41, blockedPct: 49 },
  { r: '高雄市',   n: 142, q: 84, dlt: +1, warnPct: 2.6, attnPct: 32, blockedPct: 54 },
  { r: '其他',     n:  39, q: 76, dlt:  0, warnPct: 3.1, attnPct: 38, blockedPct: 47 },
]

export interface DHILevel {
  lv: string
  range: string
  n: number
  pct: number
  c: string
}

export const DHI_DIST: DHILevel[] = [
  { lv: 'A', range: '≥ 85', n: 7842, pct: 62.8, c: 'var(--as-success)' },
  { lv: 'B', range: '70–84', n: 3214, pct: 25.8, c: '#16A085' },
  { lv: 'C', range: '50–69', n: 1102, pct: 8.8, c: 'var(--as-warning)' },
  { lv: 'D', range: '< 50', n: 323, pct: 2.6, c: 'var(--as-danger)' },
]

/* ── 空氣品質(PM2.5) 4 級分布 ─────────────────────────────────── */
export interface AirQualityTier {
  lvl: string
  range: string
  n: number
  pct: number
  color: string
  bg: string
  catIds: CatId[]   // 對應的六大類型
}

export const AIR_QUALITY_DIST: AirQualityTier[] = [
  { lvl: '優',   range: 'PM2.5 < 15 µg/m³',  n: 412, pct: 32.1, color: 'var(--as-success)', bg: '#DCFCE7', catIds: ['1'] },
  { lvl: '良好', range: 'PM2.5 15–25 µg/m³', n: 510, pct: 39.7, color: '#16A085',           bg: '#D1F3EB', catIds: ['2', '4'] },
  { lvl: '普通', range: 'PM2.5 25–50 µg/m³', n: 248, pct: 19.3, color: 'var(--as-warning)', bg: '#FEF3C7', catIds: ['3'] },
  { lvl: '不佳', range: 'PM2.5 ≥ 50 µg/m³',  n: 114, pct:  8.9, color: 'var(--as-danger)',  bg: '#FEE2E2', catIds: ['5', '6'] },
]

/* ── 濕度控制 4 級分布 ─────────────────────────────────────────── */
export interface HumidityTier {
  lvl: string
  range: string
  n: number
  pct: number
  color: string
  bg: string
  catIds: CatId[]
}

export const HUMIDITY_DIST: HumidityTier[] = [
  { lvl: '過乾', range: '濕度 < 40%',    n:  18, pct:  1.4, color: '#0EA5E9',           bg: '#E0F2FE', catIds: [] },
  { lvl: '舒適', range: '濕度 40–60%',   n: 798, pct: 62.2, color: 'var(--as-success)', bg: '#DCFCE7', catIds: ['1', '2'] },
  { lvl: '偏濕', range: '濕度 60–75%',   n: 308, pct: 24.0, color: 'var(--as-warning)', bg: '#FEF3C7', catIds: ['3', '5'] },
  { lvl: '過濕', range: '濕度 ≥ 75%',    n: 160, pct: 12.4, color: 'var(--as-danger)',  bg: '#FEE2E2', catIds: ['4', '6'] },
]

export interface SiteType {
  nm: string
  n: number
  c: string
}

export const SITE_TYPES: SiteType[] = [
  { nm: '居家', n: 982, c: '#0E7A66' },
  { nm: '辦公', n: 218, c: '#4F46E5' },
  { nm: '醫療', n: 64, c: '#D97706' },
  { nm: '商業', n: 20, c: '#7C3AED' },
]

/* ── 設備總覽母體(1,284 場域) ─────────────────────────────────────────
 * 為什麼要生成:設備總覽的 KPI 字卡與六個篩選條件必須同源連動,而 FIELDS_A_FULL
 * 只有 12 筆 —— 用 12 筆餵字卡,「4,832 台」會塌成個位數,與檯面數字打架。
 *
 * 生成規則:固定 seed 的 mulberry32,重整頁面數字不變;分布刻意對齊既有 mock,
 * 不是隨便灑點:
 *   - 六大類型筆數 = CATEGORY_DIST(412/386/248/124/78/36)
 *   - 區域筆數     = REGION_HEALTH.n
 *   - 場域類型筆數 = SITE_TYPES.n
 *   - Σ devTotal   = TODAY_POWER_ON.total  (4,832)
 *   - Σ devOnline  = TODAY_POWER_ON.active (4,231,開機率 87.5%)
 *   - 平均 PM2.5 ≈ 2 µg/m³(與三台真實設備 90 天 pm25Avg 1.4 / 2.5 / 3.6 同量級)
 *   - 平均濕度 ≈ 58%、平均 AirCare 分數 ≈ 82
 * 前 12 筆是既有的 FIELDS_A_FULL(3 筆真實 + 9 筆手寫示範),數值一個都沒動。
 * 生成列一律用「示範客戶 NNNN」與 C2099 開頭的編號 —— 不生成像真人的姓名(AGENTS.md §7)。
 */

/** 真實設備列的場域 id(其餘皆為示範資料) */
export const REAL_FIELD_IDS: string[] = DEVICE_ROWS.map((r) => r.id)
export const isDemoField = (f: FieldRecord): boolean => !REAL_FIELD_IDS.includes(f.id)

function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const POP_BAND: Record<CatId, { pm: [number, number]; hum: [number, number]; temp: [number, number]; q: [number, number] }> = {
  '1': { pm: [0.4, 1.2],  hum: [49, 61], temp: [24.0, 28.0], q: [88, 96] },
  '2': { pm: [0.65, 1.7], hum: [51, 63], temp: [24.5, 28.5], q: [82, 90] },
  '3': { pm: [1.1, 2.5],  hum: [55, 67], temp: [24.5, 29.0], q: [70, 80] },
  '4': { pm: [0.85, 2.0], hum: [65, 79], temp: [25.0, 29.5], q: [64, 74] },
  '5': { pm: [2.4, 4.9],  hum: [47, 63], temp: [25.0, 30.0], q: [60, 70] },
  '6': { pm: [4.1, 8.3],  hum: [67, 81], temp: [25.5, 30.5], q: [46, 56] },
}

const MODEL_WEIGHT: [DeviceModel, number][] = [['CS101', 0.42], ['CS201', 0.26], ['CS301', 0.18], ['CS500', 0.11], ['未登錄', 0.03]]
const MODE_WEIGHT: [UsageMode, number][] = [['雙智慧', 0.46], ['清淨智慧', 0.19], ['除濕智慧', 0.14], ['手動風量', 0.11], ['睡眠', 0.07], ['除臭', 0.03]]

/* 區域 → 行政區。nm 的前兩字要能被 regionOf() 對回 REGION_HEALTH,否則熱圖點擊會篩不到列。 */
const REGION_DISTRICTS: Record<string, string[]> = {
  '臺北市':   ['信義', '大安', '中山', '松山', '內湖', '士林', '北投', '文山'],
  '新北市':   ['板橋', '新莊', '中和', '永和', '三重', '新店', '土城', '汐止'],
  '桃園市':   ['桃園', '中壢', '平鎮', '八德', '龜山', '蘆竹'],
  '新竹縣市': ['東區', '北區', '竹北', '湖口'],
  '臺中市':   ['西屯', '北屯', '南屯', '西區', '南區', '大里'],
  '臺南市':   ['安平', '東區', '中西', '永康', '仁德'],
  '高雄市':   ['前鎮', '左營', '三民', '鳳山', '楠梓', '苓雅'],
  /* 非六都直接寫完整行政區名 —— 這些是鄉/市,補「區」會變成不存在的地名 */
  '其他':     ['礁溪鄉', '花蓮市', '臺東市', '南投市', '嘉義市', '屏東市'],
}
/** nm 前綴:regionOf() 認得的縣市名(新竹縣市在 nm 上寫「新竹」) */
const REGION_PREFIX: Record<string, string> = {
  '臺北市': '臺北', '新北市': '新北', '桃園市': '桃園', '新竹縣市': '新竹',
  '臺中市': '臺中', '臺南市': '臺南', '高雄市': '高雄', '其他': '',
}
const ROADS = ['中正路', '中山路', '民生路', '光復路', '文化路', '成功路', '復興路', '建國路', '和平路', '自由路', '大同路', '忠孝路']
const SECTIONS = ['', '', '一段', '二段', '三段', '四段']
/** 行政區已帶「區/鄉/鎮/市」就不再補,否則會生出「南區區」這種地名 */
const distAddr = (d: string) => (/[區鄉鎮市]$/.test(d) ? d : `${d}區`)

/** 依 target 各鍵的筆數排出序列,扣掉 curated 已占的名額 */
function popSequence<T extends string>(target: Record<T, number>, curated: Record<string, number>): T[] {
  const out: T[] = []
  for (const k of Object.keys(target) as T[]) {
    for (let i = 0; i < target[k] - (curated[k] ?? 0); i++) out.push(k)
  }
  return out
}
/** 決定性洗牌 —— 不洗的話同類會連號擠在同一頁,翻頁時看起來像壞掉 */
function popShuffle<T>(arr: T[], seed: number): T[] {
  const r = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
/** 把整數陣列的總和逐格 ±1 收斂到 target(受 lo/hi 夾限),讓設備台數精確對上檯面數字 */
function popReconcile(vals: number[], target: number, lo: (i: number) => number, hi: (i: number) => number): void {
  let d = target - vals.reduce((s, v) => s + v, 0)
  for (let pass = 0; d !== 0 && pass < 60; pass++) {
    for (let i = 0; i < vals.length && d !== 0; i++) {
      if (d > 0 && vals[i] < hi(i)) { vals[i]++; d-- }
      else if (d < 0 && vals[i] > lo(i)) { vals[i]--; d++ }
    }
  }
}

function buildPopulation(): FieldRecord[] {
  const curated = FIELDS_A_FULL
  const countBy = <T extends string>(pickKey: (f: FieldRecord) => T): Record<string, number> => {
    const acc: Record<string, number> = {}
    for (const f of curated) acc[pickKey(f)] = (acc[pickKey(f)] ?? 0) + 1
    return acc
  }
  const catTarget = Object.fromEntries(CATEGORY_DIST.map((d) => [d.id, d.n])) as Record<CatId, number>
  const regionTarget = Object.fromEntries(REGION_HEALTH.map((r) => [r.r, r.n])) as Record<string, number>
  const typeTarget = Object.fromEntries(SITE_TYPES.map((t) => [t.nm, t.n])) as Record<string, number>

  const cats = popShuffle(popSequence(catTarget, countBy((f) => f.cat)), 20260903)
  const regions = popShuffle(popSequence(regionTarget, countBy((f) => regionOfName(f.nm))), 20260904)
  const types = popShuffle(popSequence(typeTarget, countBy((f) => f.type)), 20260905)

  const rows: FieldRecord[] = cats.map((cat, i) => {
    const rnd = mulberry32(0x5EED + i * 2654435761)
    const b = POP_BAND[cat]
    const span = (x: [number, number]) => x[0] + rnd() * (x[1] - x[0])
    const r1 = (v: number) => Math.round(v * 10) / 10
    const weighted = <T>(w: [T, number][]) => { const r = rnd(); let a = 0; for (const [v, p] of w) { a += p; if (r < a) return v } return w[w.length - 1][0] }

    const region = regions[i], type = types[i]
    const dz = REGION_DISTRICTS[region]
    const dist = dz[Math.floor(rnd() * dz.length)]
    /* 少數場域有明顯 PM2.5 事件 —— 沒有這條尾巴,PM2.5 區間篩選會全塞在同一格 */
    const spike = rnd()
    const pm = r1(span(b.pm) * (spike < 0.035 ? 5 + rnd() * 6 : 1))
    const dry = rnd()   // 過乾場域,對齊 HUMIDITY_DIST 的 1.4%
    const humidity = r1(dry < 0.014 ? 33 + rnd() * 7 : span(b.hum))
    const devTotal = 1 + Math.floor(rnd() * 6)     // 之後由 popReconcile 收斂到 Σ = 4,832
    const roll = rnd()
    const power: PowerState = roll < 0.035 ? '離線' : roll < 0.08 ? '關機' : '開機'
    const q = Math.round(span(b.q))
    const minPct = Math.round(cat === '6' ? 6 + rnd() * 20 : cat === '4' || cat === '5' ? 15 + rnd() * 28 : 30 + rnd() * 55)
    const seq = String(i + 1).padStart(4, '0')
    return {
      nm: `${REGION_PREFIX[region]}${dist}${type}`,
      id: `SH-${7000 + i}`,
      customerId: `C2099${seq.padStart(6, '0')}`,
      customerName: `示範客戶 ${seq}`,
      addr: `${distAddr(dist)}${ROADS[Math.floor(rnd() * ROADS.length)]}${SECTIONS[Math.floor(rnd() * SECTIONS.length)]}`,
      type,
      sz: 20 + Math.floor(rnd() * 160),
      dev: '',                                     // 下方由 devOnline/devTotal 補
      lamp: q >= 75 ? 'g' : q >= 60 ? 'y' : 'r',
      q,
      pm,
      co2: 500 + Math.floor(rnd() * 700),
      mem: `示範客戶 ${seq}`,
      tier: rnd() < 0.18 ? 'g' : '',
      cat,
      hrs: r1(6 + rnd() * 16),
      minPct,
      predictedDays: Math.max(1, Math.round(minPct * (1.2 + rnd() * 1.1))),
      model: weighted(MODEL_WEIGHT),
      power,
      mode: weighted(MODE_WEIGHT),
      humidity,
      temp: r1(span(b.temp)),
      devTotal,
      devOnline: power === '開機' ? devTotal : 0,
      urgentParts: 0,
      alarmDevices: 0,
    }
  })

  // 設備台數收斂到檯面數字,字卡才對得上 TODAY_POWER_ON
  const curTotal = curated.reduce((s, f) => s + f.devTotal, 0)
  const curOnline = curated.reduce((s, f) => s + f.devOnline, 0)
  const dt = rows.map((r) => r.devTotal)
  popReconcile(dt, TODAY_POWER_ON.total - curTotal, () => 1, () => 8)
  rows.forEach((r, i) => {
    r.devTotal = dt[i]
    if (r.power === '開機') r.devOnline = Math.min(r.devOnline, r.devTotal)
  })
  const on = rows.map((r) => r.devOnline)
  popReconcile(on, TODAY_POWER_ON.active - curOnline,
    (i) => (rows[i].power === '開機' ? 1 : 0),
    (i) => (rows[i].power === '開機' ? rows[i].devTotal : 0))
  rows.forEach((r, i) => {
    r.devOnline = on[i]
    r.dev = `${r.devOnline}/${r.devTotal}`
    /* 耗材與警報由該場域的殘量與燈號推,不另外亂灑,才不會出現「全綠燈卻一堆警報」 */
    r.urgentParts = r.minPct < 20 ? Math.max(1, Math.round(r.devTotal * 0.5)) : r.minPct < 30 && r.devTotal >= 3 ? 1 : 0
    r.alarmDevices = r.lamp === 'r' ? Math.max(1, Math.round(r.devTotal * 0.4)) : r.lamp === 'y' && r.minPct < 25 ? 1 : 0
  })
  return rows
}

/** 依場域名推區域,對應 REGION_HEALTH.r。與 ModuleA 的區域熱圖共用同一份判斷。 */
export function regionOfName(nm: string): string {
  if (nm.startsWith('臺北') || nm.startsWith('台北')) return '臺北市'
  if (nm.startsWith('新北')) return '新北市'
  if (nm.startsWith('桃園')) return '桃園市'
  if (nm.startsWith('新竹')) return '新竹縣市'
  if (nm.startsWith('臺中') || nm.startsWith('台中')) return '臺中市'
  if (nm.startsWith('臺南') || nm.startsWith('台南')) return '臺南市'
  if (nm.startsWith('高雄')) return '高雄市'
  return '其他'
}

/** 設備總覽的完整母體:12 筆既有列 + 1,272 筆生成列 = 1,284 場域 / 4,832 台。 */
export const FIELDS_A_POP: FieldRecord[] = [...FIELDS_A_FULL, ...buildPopulation()]

export const MONTHS_12 = ['06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05']
export const AHI_TREND = [76.4, 77.2, 77.8, 78.4, 79.1, 80.2, 79.6, 80.4, 80.8, 81.2, 81.0, 81.4]
export const SITE_TREND = [1142, 1156, 1172, 1188, 1204, 1218, 1232, 1244, 1258, 1268, 1276, 1284]

export interface SegmentGroup {
  lbl: string
  n: number
  pct: number
  traits: string
  action: string
  c: string
}

export interface Segment {
  title: string
  sub: string
  axis: string
  groups: SegmentGroup[]
}

export const SEGMENTS_A: Segment[] = [
  {
    title: '依耗材剩餘壽命', sub: '六類耗材最低殘量 % + 預測下次更換時間', axis: '耗材',
    groups: [
      { lbl: '立即處理 (< 20% · 7 天內)',    n:  520, pct:  4.2, traits: 'ECF/HEPA 已過警戒 · 影響淨化效果',     action: '批次派工 + 推送自動配送訂閱 · 預估月經常性收入 +124K', c: 'var(--as-danger)' },
      { lbl: '近期處理 (20–30% · 30 天內)',  n: 1845, pct: 14.8, traits: '進入更換倒數 · 平均 18 天',             action: '主動推送耗材自動配送 + 寄出更換提醒',                   c: 'var(--as-warning)' },
      { lbl: '持續觀察 (30–50% · 本季內)',   n: 4218, pct: 33.8, traits: '本季內需處理 · 可預先排程',             action: '排程到府保養 + 韌體升級',                                c: '#4F46E5' },
      { lbl: '充足 (≥ 50% · 下季)',          n: 5898, pct: 47.2, traits: '濾網準時 · 主動採納建議高',             action: '推薦升級訂閱 / 加入健康證書計畫',                        c: 'var(--as-success)' },
    ],
  },
  {
    title: '依使用強度', sub: 'active_day_ratio + power_on_pct 百分位', axis: '使用強度',
    groups: [
      { lbl: '重度 (前 25%)', n: 3120, pct: 25.0, traits: '日均運轉 > 18h · 高度依賴', action: '推薦長效濾網 / 升級 Pro 機型', c: '#0E7A66' },
      { lbl: '中度 (25–75%)', n: 6240, pct: 50.0, traits: '日均 10–18h · 穩定使用', action: '維持基本服務 / 月度報告', c: '#4F46E5' },
      { lbl: '輕度 (後 25%)', n: 3121, pct: 25.0, traits: '日均 < 10h · 部分閒置', action: '推送喚醒任務 / LINE 提醒', c: 'var(--as-warning)' },
    ],
  },
  {
    title: '依水箱管理頻率', sub: 'P90 清除時間 / 倒水節奏', axis: '水箱',
    groups: [
      { lbl: '除濕需求高 (P90 > 24h)', n: 1842, pct: 14.8, traits: '南部 / 山區 / 梅雨季高峰', action: '推送倒水提醒 / 推薦自動排水', c: 'var(--as-warning)' },
      { lbl: '一般 (P90 12–24h)', n: 7842, pct: 62.8, traits: '常見家庭模式', action: '維持基本服務', c: '#4F46E5' },
      { lbl: '除濕需求低 (P90 < 12h)', n: 2797, pct: 22.4, traits: '乾燥地區 / 已關閉除濕', action: '可推薦進階空品服務', c: 'var(--as-success)' },
    ],
  },
]

/* 註:原本的 CONSUMABLE_CATS(全站 6 類耗材平均殘量 + 4 階段分布)已移除。
 * 理由:① 報告實際只有 5 個元件,沒有 UV-C;② 全站分布是整體層的統計,
 * 不該出現在「單一裝置」的濾網管理視圖。耗材改由 devices[].consumables 提供。 */

export interface UrgentDevice {
  mid: string
  nm: string
  tier: string
  addr: string
  dev: string
  vals: Record<string, number>
  days: number
  sev: 'critical' | 'soon' | 'watch'
}

export const URGENT_DEVICES: UrgentDevice[] = [
  { mid: 'M-009203', nm: '王淑芬', tier: 'g', addr: '臺中科技園區', dev: 'AC-PRO-2841', vals: { pre: 22, ecfL: 14, ecfR: 11, hepa: 38, plasma: 64, uv: 78 }, days: 18, sev: 'critical' },
  { mid: 'M-008412', nm: '陳俊宏 · 陽明山', tier: 'g', addr: '北投陽明山度假', dev: 'AC-LITE-7821', vals: { pre: 18, ecfL: 28, ecfR: 26, hepa: 12, plasma: 22, uv: 41 }, days: 6, sev: 'critical' },
  { mid: 'M-007738', nm: '李文芳', tier: 'n', addr: '大安辦公室', dev: 'AC-PRO-3344', vals: { pre: 32, ecfL: 19, ecfR: 16, hepa: 24, plasma: 48, uv: 62 }, days: 4, sev: 'soon' },
  { mid: 'M-005611', nm: '張志明', tier: 'n', addr: '新北板橋辦公', dev: 'AC-LITE-1109', vals: { pre: 28, ecfL: 41, ecfR: 38, hepa: 22, plasma: 52, uv: 71 }, days: 3, sev: 'soon' },
  { mid: 'M-010055', nm: '林雅琪', tier: 'n', addr: '桃園中壢居家', dev: 'AC-PRO-4119', vals: { pre: 41, ecfL: 26, ecfR: 24, hepa: 56, plasma: 68, uv: 82 }, days: 2, sev: 'soon' },
  { mid: 'M-006822', nm: '黃建中', tier: 'g', addr: '高雄鼓山辦公', dev: 'AC-PRO-3052', vals: { pre: 54, ecfL: 38, ecfR: 36, hepa: 47, plasma: 71, uv: 88 }, days: 1, sev: 'watch' },
]

/* URGENT_DEVICES.addr 反查到場域 id(用於點 row 跳場域詳情) */
export const URGENT_DEVICE_TO_FIELD: Record<string, string> = {
  'M-009203': 'SH-2841',
  'M-008412': 'SH-0021',
  'M-007738': 'SH-5611',
  'M-005611': 'SH-1147',
  'M-010055': 'SH-4119',
  'M-006822': 'SH-3052',
}

/* ── 個人層 · 場域詳情(主示範:SH-2841 王婉真 ⑥ 雙重介入型) ─────── */

export interface FieldDeviceUnit {
  id: string         // 機台序號
  model: string      // 型號
  room: string       // 擺放位置
  status: 'online' | 'offline' | 'alert'
  uptimePct: number  // 在線率 %
  hoursToday: number // 今日開機時數
  /* 該台的耗材狀態。報告的顆粒度就是「一台設備一份」,所以耗材掛在裝置上,
   * 不再由前端拿場域層的數字乘在線率推算。 */
  consumables: FieldConsumable[]
}

/* 耗材狀態 — 對齊 AirCare 設備分析報告「耗材狀態分析」章節的欄位。
 * 報告實際輸出為 5 個元件(前置濾網 / ECF 左 / ECF 右 / HEPA / 電漿模組),沒有 UV-C。
 * 剩餘百分比為依原廠規格上限推算的估算值,不是設備原生回報值。 */
export interface FieldConsumable {
  k: string
  nm: string
  sub: string
  clr: string
  remainHours: number     // 剩餘小時
  usedHours: number       // 估算已用小時
  capHours: number        // 估算上限(原廠規格)
  pct: number             // 剩餘百分比 = remainHours / capHours
  dailyBurnHours: number  // 每日等效消耗(依模式/風量使用習慣換算)
  daysLeft: number        // 預估剩餘天數
  exhaustDate: string     // 預估耗盡日 YYYY-MM-DD
  status: 'critical' | 'soon' | 'watch' | 'ok'
}

/* 5 個元件的原廠規格上限與每日等效消耗。正式版由中台下發,公式來源見報告註記
 * `docs/filter-lifetime-calculation.md`(中台側)。 */
const CONSUMABLE_SPEC = [
  { k: 'pre',    nm: '前置濾網', sub: 'Pre-Filter',      capHours: 2232, dailyBurnHours: 8.55, clr: '#16A085' },
  { k: 'ecfL',   nm: 'ECF · 左', sub: 'Electrostatic L', capHours: 4380, dailyBurnHours: 9.05, clr: '#4F46E5' },
  { k: 'ecfR',   nm: 'ECF · 右', sub: 'Electrostatic R', capHours: 4380, dailyBurnHours: 9.05, clr: '#7C3AED' },
  { k: 'hepa',   nm: 'HEPA',     sub: '主濾網',          capHours: 8760, dailyBurnHours: 7.83, clr: '#0E7A66' },
  { k: 'plasma', nm: '電漿模組', sub: 'Plasma',          capHours: 8760, dailyBurnHours: 7.83, clr: '#D97706' },
] as const

/* 緊急度依「剩餘百分比」判定。由四份實際報告的 12 個輸出回推,三級可完全分離:
 *   立即處理 [0.0, 13.2, 23.9]  近期處理 [30.7, 41.0, 46.7, 48.2]  持續觀察 [69.0 … 83.8]
 *
 * 為什麼不是天數:同一批 12 點用「預估剩餘天數」無法分離 ——
 *   立即最大 63.6 天(1cdbd4f8def8 ECF 23.9%)> 近期最小 57.8 天(806599927630 前置 46.7%),
 *   近期最大 233.4 天 > 觀察最小 175.4 天。兩處都重疊。
 *
 * ⚠ 門檻只被資料夾在區間內,不是報告明寫:
 *   立即/近期 邊界落在 (23.9, 30.7] → 取 30
 *   近期/觀察 邊界落在 (48.2, 69.0] → 取 50
 * ⚠ 第四級「更換備料」四份報告都未出現,門檻未知。 */
function urgencyOf(pct: number): FieldConsumable['status'] {
  if (pct < 30) return 'critical'
  if (pct < 50) return 'soon'
  return 'watch'
}

/* 以「估算已用小時」推導單一裝置的 5 筆耗材狀態(mock 用;正式版整包由中台給) */
function makeConsumables(baseDate: string, usedHours: number[]): FieldConsumable[] {
  const base = new Date(baseDate + 'T00:00:00Z')
  return CONSUMABLE_SPEC.map((s, i) => {
    const used = Math.min(usedHours[i] ?? 0, s.capHours)
    const remainHours = s.capHours - used
    const pct = Math.round((remainHours / s.capHours) * 1000) / 10
    const daysLeft = Math.round((remainHours / s.dailyBurnHours) * 10) / 10
    const exhaust = new Date(base.getTime() + Math.round(daysLeft) * 86400000)
    return {
      k: s.k, nm: s.nm, sub: s.sub, clr: s.clr,
      remainHours, usedHours: used, capHours: s.capHours,
      pct, dailyBurnHours: s.dailyBurnHours, daysLeft,
      exhaustDate: exhaust.toISOString().slice(0, 10),
      status: urgencyOf(pct),
    }
  })
}

/* 耗盡日的推算基準日(報告的「耗盡日基準日」) */
export const CONSUMABLE_BASE_DATE = '2026-08-11'

export interface FieldEvent {
  date: string       // YYYY/MM/DD
  time?: string      // HH:MM
  kind: 'alarm' | 'event' | 'service' | 'spike' | 'tank'
  title: string
  detail: string
  reaction?: string
}

export interface FieldAiCause {
  rank: '①' | '②' | '③'
  cause: string
  action: string
}

/* AirCare 指數 — 對齊 aircareRP 報告產出引擎的口徑:
 *   總分 = PM2.5 分數 × 50% + 濕度分數 × 50%
 * 分數一律由中台計算後下發,前端只負責顯示與分級文案;
 * 欄位形狀刻意對齊未來 GET /api/field360 的 response,接上時直接換資料源。 */
export interface AirScore {
  total: number             // 綜合指數 0–100
  pm25Score: number         // PM2.5 分數 0–100
  humidityScore: number     // 濕度分數 0–100
  pm25Avg: number           // 期間平均 PM2.5 µg/m³(分數的計算基礎,非即時值)
  humidityAvg: number       // 期間平均相對濕度 %
  humidityP90: number       // 濕度 P90 %
  humidityOver65Pct: number // 濕度 ≥65% 佔比 %
  outdoorPm25Avg: number    // 室外參考測站期間平均 µg/m³
  outdoorStation: string    // 室外參考測站名(如「臺南」)
  /* 可比較表現(母體:全部設備近 90 個臺北時區日曆日)。報告用百分位,不用名次。 */
  percentile?: number       // 本設備指數高於百分之幾的可比較設備
}

/* WHO PM2.5 年均指引值,用於分數卡對照 chip */
export const WHO_PM25_GUIDELINE = 15

/* ── 對外報告產出的揭露閘門 ────────────────────────────────────────────
 * 規則來源:AirCare 分群規則 v2 §4.2「揭露資格 = AirCare 分數 ≥ 75 且資料有效」。
 *
 * ⚠ 這是接上報告產出引擎前的「前端暫時護欄」。正式版這道判斷必須放在引擎裡 ——
 *   報告是快照 + token 派送,一旦產出就收不回來,不能靠前端擋。
 *   前端這份只是避免現在誤按。
 */
export const REPORT_DISCLOSURE_MIN_SCORE = 75

export type ReportGateState = 'ready' | 'blocked' | 'unverified'
export interface ReportGate {
  state: ReportGateState
  reason: string
  kind: 'consumer' | 'facility'   // report.schema.json 的 report_kind
}

export function reportGateOf(d: FieldDetail): ReportGate {
  const kind: ReportGate['kind'] = d.spaceType === '居家' ? 'consumer' : 'facility'
  const s = d.airScore

  /* ① 分數來源本身有已知缺陷 → 連門檻都不該拿來判。
   *    偵測條件:濕度分數為 0 但期間確實有濕度讀數(平均 > 0)。
   *    C2026010088 與 1cdbd4f6ac40 兩台都命中。 */
  if (s.humidityScore === 0 && s.humidityAvg > 0) {
    return {
      state: 'unverified', kind,
      reason: `濕度分數為 0 但平均濕度 ${s.humidityAvg}%,指數 ${s.total} 不可信 · 產出前需中台確認`,
    }
  }
  /* ② 分數有效但未達揭露門檻 */
  if (s.total < REPORT_DISCLOSURE_MIN_SCORE) {
    return {
      state: 'blocked', kind,
      reason: `指數 ${s.total} 未達揭露門檻 ${REPORT_DISCLOSURE_MIN_SCORE} 分`,
    }
  }
  return {
    state: 'ready', kind,
    reason: `指數 ${s.total} 已達揭露門檻 · 將產出${kind === 'consumer' ? '家庭版' : '場域版'}報告`,
  }
}

export interface FieldDetail {
  fid: string                       // SH-xxxx
  // 會員資訊
  memberName: string
  memberTier: 'g' | 'n'             // gold / normal
  memberSince: string               // 入會起算
  memberDevices: number             // 跨場域總設備數
  memberLink?: string               // 跳 Module B 連結 (mock)
  /* 客戶編號(設備分析報告的 customer.code = SF Contact.LeadNum__c)。
   * 這是場域 ↔ Salesforce 會員的唯一接點:識別卡拿它即時查 SF 取姓名,
   * 並可直接開 Module B 的 Live 360°。姓名/Contact Id 一律不落地在 repo。
   * 示範場域沒有對應 SF 記錄 → 留空,卡片不可點。 */
  customerCode?: string
  // 場域屬性
  area: string                      // 詳細地址
  spaceType: string                 // 居家 / 辦公 / 醫療 / 商業
  floorSize: number                 // 坪數
  homeStyle: string                 // 公寓 / 透天 / 大樓
  members: string                   // 同住成員
  acquisition: string               // 如何得知克立淨
  // 健康度與類型(對齊整體層)
  dhi: number
  dhiDelta: number
  cat: CatId
  // AirCare 指數(可拆組成 + 對照基準),場域詳情三分數卡來源
  airScore: AirScore
  // 即時狀態 (KPI 卡來源)
  pm25Now: number
  pm25Tier: 'excellent' | 'good' | 'fair' | 'poor'
  temp: number                      // °C
  humidity: number                  // %
  comfort: string                   // 一句話描述
  onlineDevices: number
  totalDevices: number
  hoursToday: number
  hoursAvg7: number
  // 設備清單
  devices: FieldDeviceUnit[]
  /* 耗材已改掛在 devices[].consumables(報告顆粒度＝一台設備一份);
   * 場域層只保留「最近一次維護到期」這種彙總欄位。 */
  nextMaintenance: { item: string; days: number }
  // 90 天 PM2.5(每日)
  pm25Trend: number[]               // 室內 PM2.5 日均
  pm25OutdoorTrend: number[]        // 室外參考測站日均
  /* 日 P95 與單日最大。只有真實報告有,示範資料沒有 → 選填,缺少時趨勢圖退回雙層。 */
  pm25P95Trend?: number[]
  pm25MaxTrend?: number[]
  pm25P50: number
  pm25P90: number
  pm25Events: { dayIdx: number; pm: number; label: string; reaction: string }[]
  // 90 天溫濕度(每日)
  tempTrend: number[]
  humidityTrend: number[]
  // 24h × 7 天使用節奏(0–3 強度)
  weekUsage: number[][]             // [7][24],週日→週六
  workdayPeak: string               // 描述
  // Timeline(30 天)
  timeline: FieldEvent[]
  // AI 疑似原因
  aiSummary: string
  aiCauses: FieldAiCause[]
  // 同分群表現
  cohortSize: number                // 同分群場域數
  cohortRank: number                // 本場域在分群中的健康度名次
  cohortAvg: number                 // 同分群平均健康度
}

/* 90 天 PM2.5 序列產生器(高敏家庭 + 工業區 → 偏高 + 多次飆升) */
const gen90 = (base: number, ampl: number, spikes: { i: number; v: number }[]): number[] => {
  const out: number[] = []
  for (let i = 0; i < 90; i++) {
    // 緩慢漂移 + 噪聲
    const drift = Math.sin(i / 12) * (ampl * 0.4)
    const noise = ((i * 37) % 17 - 8) * (ampl * 0.05)
    out.push(Math.max(1, Math.round(base + drift + noise)))
  }
  for (const s of spikes) out[s.i] = s.v
  return out
}

const WANGWANJEN_PM25_INDOOR = gen90(14, 8, [
  { i: 12, v: 56 }, // 04/26 飆升
  { i: 27, v: 87 }, // 05/11 飆升
  { i: 38, v: 42 }, // 05/22 中等
  { i: 64, v: 71 }, // 06/17 飆升
  { i: 78, v: 38 }, // 07/01
])

const WANGWANJEN_PM25_OUTDOOR = gen90(64, 28, [
  { i: 12, v: 142 },
  { i: 27, v: 188 },
  { i: 38, v: 96 },
  { i: 64, v: 162 },
  { i: 78, v: 82 },
])

const WANGWANJEN_TEMP = gen90(27.5, 3, [])
const WANGWANJEN_HUMIDITY = gen90(72, 8, [
  { i: 18, v: 86 },
  { i: 45, v: 88 },
])

/* 24h × 7 天熱力圖:0 關機 / 1 低速 / 2 中速 / 3 高速 */
const WANGWANJEN_WEEK_USAGE: number[][] = [
  /* 週日 */ [0,0,0,0,0,0,1,2,2,2,2,3,3,3,2,2,2,3,3,3,3,2,1,0],
  /* 週一 */ [0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,2,3,3,2,2,1,0],
  /* 週二 */ [0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,2,3,3,2,2,1,0],
  /* 週三 */ [0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,2,3,3,3,2,1,0],
  /* 週四 */ [0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,2,3,3,2,2,1,0],
  /* 週五 */ [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,1,3,3,3,3,2,1,0],
  /* 週六 */ [0,0,0,0,0,0,1,2,3,3,3,3,2,2,2,3,3,3,3,3,3,2,1,0],
]

export const FIELD_DETAIL_WANG: FieldDetail = {
  fid: 'SH-2841',
  memberName: '王婉真',
  memberTier: 'g',
  memberSince: '2020/11',
  memberDevices: 4,
  area: '臺中市西屯區工業區八路 88 號',
  spaceType: '辦公',
  floorSize: 185,
  homeStyle: '工業區辦公空間 · 鄰主幹道',
  members: '員工 12 位(其中 3 位高敏)',
  acquisition: '同業介紹 · 2020 同步引入',
  dhi: 48,
  dhiDelta: -12,
  cat: '6',
  /* 總分刻意等於 dhi(48),避免詳情頁與場域清單/整體層出現兩個不同的分數。
   * 組成:PM2.5 62.0 × 50% + 濕度 34.0 × 50% = 48.0 → 濕度是被拉低的主因。 */
  airScore: {
    total: 48.0,
    pm25Score: 62.0,
    humidityScore: 34.0,
    pm25Avg: 22.4,
    humidityAvg: 78.0,
    humidityP90: 84.0,
    humidityOver65Pct: 91.4,
    outdoorPm25Avg: 68.2,
    outdoorStation: '西屯',
  },
  pm25Now: 84,
  pm25Tier: 'poor',
  temp: 28.2,
  humidity: 78,
  comfort: '偏熱 + 偏濕 · 不舒適',
  onlineDevices: 6,
  totalDevices: 10,
  hoursToday: 6.1,
  hoursAvg7: 5.8,
  /* 6 台裝置各自的耗材狀態。usedHours 依序為 [前置, ECF左, ECF右, HEPA, 電漿];
   * 在線率高的機台(A/B/C)累積時數多、剩餘少,離線的 E/F 幾乎沒消耗。 */
  devices: [
    { id: 'AC-PRO-2841-A', model: 'CS100 旗艦', room: '辦公主區', status: 'alert',   uptimePct: 82, hoursToday: 8.4,
      consumables: makeConsumables(CONSUMABLE_BASE_DATE, [1937, 3767, 3898, 5431, 3154]) },
    { id: 'AC-PRO-2841-B', model: 'CS100 旗艦', room: '會議室 A', status: 'online',  uptimePct: 96, hoursToday: 4.2,
      consumables: makeConsumables(CONSUMABLE_BASE_DATE, [2094, 4102, 4038, 6218, 3702]) },
    { id: 'AC-PRO-2841-C', model: 'CS80 標準',  room: '會議室 B', status: 'online',  uptimePct: 91, hoursToday: 5.6,
      consumables: makeConsumables(CONSUMABLE_BASE_DATE, [1682, 3341, 3402, 4886, 2740]) },
    { id: 'AC-PRO-2841-D', model: 'CS80 標準',  room: '茶水間',   status: 'online',  uptimePct: 88, hoursToday: 3.8,
      consumables: makeConsumables(CONSUMABLE_BASE_DATE, [1418, 2269, 2311, 4104, 2286]) },
    { id: 'AC-PRO-2841-E', model: 'CS60 入門',  room: '主管室',   status: 'offline', uptimePct: 12, hoursToday: 0,
      consumables: makeConsumables(CONSUMABLE_BASE_DATE, [ 402,  688,  702, 1415,  946]) },
    { id: 'AC-PRO-2841-F', model: 'CS60 入門',  room: '走道',     status: 'offline', uptimePct: 34, hoursToday: 0,
      consumables: makeConsumables(CONSUMABLE_BASE_DATE, [ 861, 1502, 1544, 2418, 1602]) },
  ],
  /* 全場域最急的一項 = B 機前置濾網(剩 138h ÷ 8.55h/日 ≈ 16 天),與 devices[].consumables 對齊 */
  nextMaintenance: { item: '前置濾網 · B 機', days: 16 },
  pm25Trend: WANGWANJEN_PM25_INDOOR,
  pm25OutdoorTrend: WANGWANJEN_PM25_OUTDOOR,
  pm25P50: 18,
  pm25P90: 46,
  pm25Events: [
    { dayIdx: 12, pm: 56, label: '04/26 PM2.5 飆升',   reaction: '機器自動切高速 · 14 分鐘降至 18' },
    { dayIdx: 27, pm: 87, label: '05/11 PM2.5 飆升',   reaction: '機器自動切高速 · 23 分鐘降至 22(主因:鄰近工地揚塵)' },
    { dayIdx: 64, pm: 71, label: '06/17 PM2.5 飆升',   reaction: '機器在主管室未啟動(離線)· 客戶手動開啟其他機' },
  ],
  tempTrend: WANGWANJEN_TEMP,
  humidityTrend: WANGWANJEN_HUMIDITY,
  weekUsage: WANGWANJEN_WEEK_USAGE,
  workdayPeak: '工作日峰值:09:00–10:00、18:00–21:00 · 週末全日高運轉',
  timeline: [
    { date: '2026/05/27', time: '14:08', kind: 'alarm',   title: 'E4 警報 · 主管室機',   detail: 'AC-PRO-2841-E 通訊異常 · 連續 3 小時離線', reaction: '已自動觸發客服派工流程' },
    { date: '2026/05/24', time: '09:13', kind: 'spike',   title: 'PM2.5 飆升 · 工地揚塵', detail: '室外 PM2.5 達 188 · 室內 87 · 持續 23 分', reaction: '機器自動切高速 · 23 分鐘降至 22' },
    { date: '2026/05/22', time: '04:57', kind: 'tank',    title: '水箱已滿 · 茶水間機',   detail: '連續 36 小時未倒水 · 觸發 E2', reaction: '客戶 8.4h 後處理' },
    { date: '2026/05/18',                kind: 'service', title: '耗材更換提醒已寄送',   detail: 'B 機前置濾網剩 6.2% · 預估 16 天耗盡', reaction: '客戶尚未回覆' },
    { date: '2026/05/11', time: '11:42', kind: 'spike',   title: 'PM2.5 飆升',           detail: '室外 PM2.5 達 142 · 室內 56',     reaction: '機器自動切高速 · 14 分鐘降至 18' },
    { date: '2026/05/08', time: '19:13', kind: 'alarm',   title: 'E4 + dEF 警報 · 走道機', detail: 'AC-PRO-2841-F 重複觸發', reaction: '客戶手動重啟 · 恢復後再觸發 2 次' },
    { date: '2026/04/26', time: '15:22', kind: 'spike',   title: 'PM2.5 飆升',           detail: '室外 PM2.5 達 142 · 室內 56',     reaction: '機器自動切高速 · 18 分鐘降至 22' },
    { date: '2026/04/15',                kind: 'service', title: '到府定保 · 6 機完成',  detail: '濾網盤點 · 韌體升級至 v3.4',         reaction: '主管室、走道機 韌體升級失敗' },
  ],
  aiSummary: '此場域過去 30 天有 2 次 E4 警報 + ECF·L/R 即將到期 + 持續高 PM2.5 環境壓力。屬「⑥ 雙重介入型」高 LTV upsell 目標。',
  aiCauses: [
    { rank: '①', cause: '工業區地段 · 室外 PM2.5 P90 達 162 · 機器長期滿載',           action: '推薦升級 CS100 一體機(雙功能對抗濕氣 + 空污)· 客單 12–18K' },
    { rank: '②', cause: '主管室 / 走道機長期離線 · 上次定保韌體升級失敗',                action: '安排技師到府:檢查通訊模組 + 重新升級韌體' },
    { rank: '③', cause: 'A 機 ECF·L/R 雙側剩 < 15%、B 機前置濾網 16 天內耗盡',              action: '立即批次出貨耗材 + 推送「自動配送訂閱」(歷史接受率 38%)' },
  ],
  cohortSize: 36,
  cohortRank: 31,
  cohortAvg: 56,
}

/* ══ 真實設備報告 → FieldDetail ═══════════════════════════════════════════
 * 每台真實設備由 src/mocks/devices/ 的報告資料建出一筆 FieldDetail。
 * 報告沒有的欄位(坪數/住宅型態/同住成員)一律留空,不補假值。
 * 客戶姓名只有 C2026010088 對得到 Salesforce,其餘用客戶編號顯示。 */

/* 由真實日均序列取百分位(描述統計,非業務邏輯) */
const pctl = (arr: number[], p: number): number => {
  const s = [...arr].sort((a, b) => a - b)
  return Math.round(s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))] * 10) / 10
}

/* 報告的緊急度文字 → 內部 status。直接採用報告判定,不自行重算。 */
const URGENCY_MAP: Record<string, FieldConsumable['status']> = {
  立即處理: 'critical', 近期處理: 'soon', 持續觀察: 'watch', 更換備料: 'ok',
}
const PART_META: Record<string, { k: string; sub: string; clr: string }> = {
  前置濾網: { k: 'pre',    sub: 'Pre-Filter',      clr: '#16A085' },
  'ECF 左': { k: 'ecfL',   sub: 'Electrostatic L', clr: '#4F46E5' },
  'ECF 右': { k: 'ecfR',   sub: 'Electrostatic R', clr: '#7C3AED' },
  HEPA:     { k: 'hepa',   sub: '主濾網',          clr: '#0E7A66' },
  電漿模組:  { k: 'plasma', sub: 'Plasma',          clr: '#D97706' },
}

/** 報告的分群落點 → 六大類型 id */
const SEGMENT_TO_CAT: Record<string, CatId> = {
  金級空氣: '1', 銀級空氣: '2', 銅級空氣: '3',
  濕度風險: '4', 清淨風險: '5', 清淨除濕雙風險: '6',
}

function fieldDetailFromReport(r: DeviceReport): FieldDetail {
  const m = r.meta
  const avgs = r.daily.map((d) => d.avg)
  const runState = (label: string) => r.runStates.find((x) => x.label === label)?.hours ?? 0
  const tankStop = runState('水滿停機')
  const run = runState('正常運轉')
  /* 最急的一項耗材(剩餘 % 最低)作為場域層的「維護倒數」 */
  const worst = [...r.consumables].sort((a, b) => a.remainingPct - b.remainingPct)[0]
  const switches = r.manualActions
    .filter((a) => a.action === '模式/風速切換').reduce((s, a) => s + a.count, 0)
  const actTotal = r.manualActions.reduce((s, a) => s + a.count, 0)

  return {
    fid: deviceFieldId(m.mac),
    /* 姓名留空 —— 由識別卡用 customerCode 即時向 SF 取,repo 不存個資。 */
    memberName: '',
    memberTier: 'n',
    memberSince: '—',
    memberDevices: 1,
    customerCode: m.customerCode,
    area: m.address,
    spaceType: '居家',
    floorSize: 0, homeStyle: '', members: '',
    acquisition: '',
    dhi: Math.round(m.airScore),
    dhiDelta: 0,                                  // 首份報告,無上期可比
    cat: SEGMENT_TO_CAT[m.segment] ?? '1',
    airScore: {
      total: m.airScore, pm25Score: m.pm25Score, humidityScore: m.humidityScore,
      pm25Avg: m.pm25Avg, humidityAvg: m.humidityAvg, humidityP90: m.humidityP90,
      humidityOver65Pct: m.humidityOver65Pct,
      outdoorPm25Avg: m.outdoorPm25Avg, outdoorStation: m.outdoorStation,
      percentile: m.percentileAirScore,
    },
    pm25Now: r.daily[r.daily.length - 1].avg,     // 期末最後一日日均
    pm25Tier: 'excellent',
    temp: Math.round((m.tempMin + m.tempMax) / 2 * 10) / 10,
    humidity: m.humidityAvg,
    comfort: '多數時間落在相對舒適範圍',
    onlineDevices: 1, totalDevices: 1,
    hoursToday: Math.round(m.runHours / m.days * 10) / 10,
    hoursAvg7: Math.round(m.runHours / m.days * 10) / 10,
    devices: [{
      id: m.mac, model: m.model || 'CS101', room: '住家', status: 'online',
      uptimePct: Math.round(m.runHours / (m.days * 24) * 100),
      hoursToday: Math.round(m.runHours / m.days * 10) / 10,
      consumables: r.consumables.map((c) => {
        const pm = PART_META[c.label]
        return {
          k: pm.k, nm: c.label, sub: pm.sub, clr: pm.clr,
          remainHours: c.remainingHours, usedHours: c.hoursUsed, capHours: c.hoursMax,
          pct: c.remainingPct, dailyBurnHours: c.dailyBurn, daysLeft: c.daysLeft,
          exhaustDate: c.exhaustDate, status: URGENCY_MAP[c.urgency] ?? 'watch',
        }
      }),
    }],
    nextMaintenance: { item: worst.label, days: Math.round(worst.daysLeft) },
    pm25Trend: avgs,
    pm25OutdoorTrend: r.outdoorDaily,
    pm25P95Trend: r.daily.map((d) => d.p95),
    pm25MaxTrend: r.daily.map((d) => d.max),
    pm25P50: pctl(avgs, 0.5),
    pm25P90: pctl(avgs, 0.9),
    pm25Events: r.peakHours.map((p) => ({
      dayIdx: Math.max(0, r.daily.findIndex((d) => d.d === p.at.slice(0, 10))),
      pm: p.max,
      label: `${p.at.slice(5, 10)} ${p.at.slice(11, 16)} ${p.slot} · 時均 ${p.avg}`,
      reaction: `單日最大 ${p.max} µg/m³ · 等級${p.level}`,
    })),
    tempTrend: r.daily.map((d) => d.temp),
    humidityTrend: r.daily.map((d) => d.humidity),
    weekUsage: r.weekUsage,
    workdayPeak: `高基線最明顯時段:${m.diurnalPeakSlot}(P95 ${m.diurnalPeakP95} µg/m³)· 尖峰日 ${m.peakDay}`,
    timeline: [
      { date: m.lastAlarmAt.slice(0, 10).replace(/-/g, '/'), time: m.lastAlarmAt.slice(11, 16),
        kind: 'alarm', title: '最近警報狀態時間',
        detail: `警報碼 ${m.lastAlarmCode} · 期間曾少次或短暫出現警報,最近狀態已解除`,
        reaction: '報告判定:不逐碼列舉' },
      { date: m.peakDay.replace(/-/g, '/'), kind: 'spike', title: '本期尖峰日',
        detail: `日均 ${m.peakDayAvg} · 單日最大 ${m.peakDayMax} µg/m³`,
        reaction: '報告建議:對異常尖峰保持中立追蹤' },
    ],
    aiSummary: `本期 Aircare 指數 ${m.airScore}/100(PM2.5 ${m.pm25Score} × 50% + 濕度 ${m.humidityScore} × 50%)。` +
      `較需關注的耗材為 ${worst.label}(剩 ${worst.remainingPct}%)。` +
      `水滿停機累積 ${tankStop}h,正常運轉 ${run}h。`,
    aiCauses: [
      { rank: '①', cause: `水滿停機 ${tankStop}h vs 正常運轉 ${run}h · 解除等待 P90 ${r.tank.p90WaitHours} 小時`,
        action: '報告建議:檢查倒水頻率或排水流程,以維持除濕連續性' },
      { rank: '②', cause: `${worst.label} 剩餘 ${worst.remainingPct}% · 預估 ${Math.round(worst.daysLeft)} 天耗盡(${worst.exhaustDate})`,
        action: '報告建議:優先處理,其餘濾網維持例行追蹤' },
      { rank: '③', cause: `模式/風速切換 ${switches.toLocaleString()} 次,佔全部人為操作 ${(switches / actTotal * 100).toFixed(1)}%`,
        action: '使用者高頻手動調整,自動模式可能未滿足需求 —— 產品端訊號,非服務工單' },
    ],
    cohortSize: 0, cohortRank: 0, cohortAvg: 0,   // 報告用百分位,不用名次
  }
}

export const DEVICE_FIELD_DETAILS: FieldDetail[] = DEVICE_REPORTS.map(fieldDetailFromReport)

/* 場域 id → FieldDetail。真實設備從報告建出,其餘 8 個示範場域沿用 mock 骨架替換 identity。 */
export const FIELD_DETAILS: Record<string, FieldDetail> = {
  ...Object.fromEntries(DEVICE_FIELD_DETAILS.map((d) => [d.fid, d])),
  'SH-2841': FIELD_DETAIL_WANG,
}

/** fallback 骨架:示範場域沒有真實序列,借第一台真實設備的曲線 */
export const FIELD_DETAIL_C88 = DEVICE_FIELD_DETAILS[0]

/** 場域 id → FieldDetail(找不到真實資料時,用該場域的清單欄位改寫 fallback 骨架)。
 *  放在資料層而非元件層,讓場域清單與場域詳情共用同一份判斷(報告揭露閘門也吃這份)。 */
export function getFieldDetail(fid: string): FieldDetail {
  const real = FIELD_DETAILS[fid]
  if (real) return real                       // 有完整資料的場域(目前只有三台真實設備 + SH-2841)
  const rec = FIELDS_A_POP.find((f) => f.id === fid)
  if (!rec) return FIELD_DETAIL_C88
  /* 總分跟著該場域的 q 走,並回推兩項組成,避免詳情頁分數與清單/整體層打架。
   * 兩項都必須落在 0–100 且平均等於 total:PM2.5 取 min(100, total+8),濕度補足差額。
   * (舊寫法 humidityScore = total-14 會讓高分場域算出 PM2.5 > 100,例如 q=92 → 106。) */
  const total = rec.q
  const pm25Score = Math.min(100, total + 8)
  const humidityScore = Math.round((total * 2 - pm25Score) * 10) / 10
  return {
    ...FIELD_DETAIL_C88,
    fid: rec.id,
    memberName: rec.customerName,
    memberTier: rec.tier === 'g' ? 'g' : 'n',
    area: rec.addr,
    spaceType: rec.type,
    floorSize: rec.sz,
    dhi: rec.q,
    dhiDelta: FIELD_DELTAS[rec.id] ?? 0,
    cat: rec.cat,
    airScore: {
      ...FIELD_DETAIL_C88.airScore,
      total,
      pm25Score,
      humidityScore,
      pm25Avg: rec.pm,
      outdoorPm25Avg: FIELD_OUTDOOR_PM25[rec.id] ?? FIELD_DETAIL_C88.airScore.outdoorPm25Avg,
    },
    pm25Now: rec.pm,
    onlineDevices: rec.devOnline,
    totalDevices: rec.devTotal,
    hoursToday: rec.hrs,
  }
}
