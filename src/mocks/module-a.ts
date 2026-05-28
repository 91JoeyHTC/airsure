/* AirSure — Module A mock data: 居家空氣場域 */

/* ── 六大類型參照表(方案 C 業務端代號為主、方案 A 身分標籤為副) ───────── */
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
}

export const FIELDS_A_FULL: FieldRecord[] = [
  { nm: '臺北信義居家',   id: 'SH-0021', customerId: 'C202105001', customerName: '陳俊宏',       addr: '信義區松仁路',  type: '居家', sz: 42,  dev: '4/4',  lamp: 'g', q: 92, pm: 12, co2: 642,  mem: '陳俊宏 · 高級',  tier: 'g', cat: '1', hrs: 18.2, minPct: 64, predictedDays:  72 },
  { nm: '新北板橋辦公',   id: 'SH-1147', customerId: 'C202003042', customerName: '李文君',       addr: '板橋區文化路',  type: '辦公', sz: 88,  dev: '8/9',  lamp: 'y', q: 76, pm: 32, co2: 894,  mem: '李文君',         tier: '',  cat: '3', hrs: 10.4, minPct: 28, predictedDays:  18 },
  { nm: '臺中科技園區',   id: 'SH-2841', customerId: 'C201000272', customerName: '王婉真',       addr: '西屯區工業區',  type: '辦公', sz: 185, dev: '6/10', lamp: 'r', q: 48, pm: 84, co2: 1240, mem: '王婉真 · 高級',  tier: 'g', cat: '6', hrs:  6.1, minPct: 11, predictedDays:   6 },
  { nm: '高雄前鎮辦公',   id: 'SH-3052', customerId: 'C202206018', customerName: '張志成',       addr: '前鎮區成功二路', type: '辦公', sz: 64,  dev: '5/5',  lamp: 'g', q: 88, pm: 18, co2: 720,  mem: '張志成',         tier: '',  cat: '2', hrs: 14.6, minPct: 52, predictedDays:  48 },
  { nm: '桃園藝文居家',   id: 'SH-4119', customerId: 'C201912033', customerName: '黃慧君',       addr: '桃園區慈文路',  type: '居家', sz: 38,  dev: '3/3',  lamp: 'g', q: 95, pm:  8, co2: 580,  mem: '黃慧君 · 高級',  tier: 'g', cat: '1', hrs: 20.8, minPct: 71, predictedDays:  88 },
  { nm: '臺南安平診所',   id: 'SH-5023', customerId: 'C202109054', customerName: '安平診所',     addr: '安平區永華路',  type: '醫療', sz: 96,  dev: '7/8',  lamp: 'y', q: 71, pm: 38, co2: 920,  mem: '林醫師',         tier: '',  cat: '5', hrs:  9.2, minPct: 22, predictedDays:  14 },
  { nm: '新竹東區居家',   id: 'SH-5208', customerId: 'C202304076', customerName: '吳承翰',       addr: '東區光復路',    type: '居家', sz: 52,  dev: '4/4',  lamp: 'g', q: 90, pm: 14, co2: 620,  mem: '吳承翰 · 高級',  tier: 'g', cat: '2', hrs: 16.5, minPct: 58, predictedDays:  56 },
  { nm: '臺北大安咖啡店', id: 'SH-5611', customerId: 'C202008123', customerName: '阿諾義式咖啡', addr: '大安區忠孝東路', type: '商業', sz: 28,  dev: '2/3',  lamp: 'y', q: 68, pm: 42, co2: 1080, mem: '阿諾義式',       tier: '',  cat: '4', hrs: 11.8, minPct: 18, predictedDays:   9 },
  { nm: '宜蘭礁溪民宿',   id: 'SH-6022', customerId: 'C202105099', customerName: '陶然居民宿',   addr: '礁溪鄉德陽路',  type: '商業', sz: 76,  dev: '4/4',  lamp: 'g', q: 86, pm: 22, co2: 690,  mem: '陶然居',         tier: '',  cat: '2', hrs: 13.4, minPct: 46, predictedDays:  32 },
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

export interface ConsumableCategory {
  k: string
  nm: string
  sub: string
  avg: number
  dist: { i: number; n: number; w: number; r: number }
  life: string
  clr: string
}

export const CONSUMABLE_CATS: ConsumableCategory[] = [
  { k: 'pre', nm: '前置濾網', sub: 'Pre-Filter', avg: 58, dist: { i: 84, n: 142, w: 412, r: 646 }, life: '90 天', clr: '#16A085' },
  { k: 'ecfL', nm: 'ECF · 左', sub: 'Electrostatic L', avg: 42, dist: { i: 168, n: 224, w: 388, r: 504 }, life: '180 天', clr: '#4F46E5' },
  { k: 'ecfR', nm: 'ECF · 右', sub: 'Electrostatic R', avg: 44, dist: { i: 152, n: 218, w: 402, r: 512 }, life: '180 天', clr: '#7C3AED' },
  { k: 'hepa', nm: 'HEPA', sub: '主濾網', avg: 67, dist: { i: 56, n: 88, w: 348, r: 792 }, life: '365 天', clr: '#0E7A66' },
  { k: 'plasma', nm: '電漿模組', sub: 'Plasma', avg: 72, dist: { i: 38, n: 64, w: 282, r: 900 }, life: '730 天', clr: '#D97706' },
  { k: 'uv', nm: 'UV 負離子', sub: 'UV-C', avg: 81, dist: { i: 22, n: 41, w: 168, r: 1053 }, life: '1,095 天', clr: '#DC2626' },
]

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
}

export interface FieldConsumable {
  k: string
  nm: string
  sub: string
  pct: number        // 剩餘 %
  daysLeft: number   // 預估剩餘天數
  life: string
  status: 'critical' | 'soon' | 'watch' | 'ok'
}

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

export interface FieldDetail {
  fid: string                       // SH-xxxx
  // 會員資訊
  memberName: string
  memberTier: 'g' | 'n'             // gold / normal
  memberSince: string               // 入會起算
  memberDevices: number             // 跨場域總設備數
  memberLink?: string               // 跳 Module B 連結 (mock)
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
  // 耗材(取所有機器加權平均殘量)
  consumables: FieldConsumable[]
  nextMaintenance: { item: string; days: number }
  // 90 天 PM2.5(每日)
  pm25Trend: number[]               // 室內 PM2.5
  pm25OutdoorTrend: number[]        // 室外 PM2.5(示意)
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
  pm25Now: 84,
  pm25Tier: 'poor',
  temp: 28.2,
  humidity: 78,
  comfort: '偏熱 + 偏濕 · 不舒適',
  onlineDevices: 6,
  totalDevices: 10,
  hoursToday: 6.1,
  hoursAvg7: 5.8,
  devices: [
    { id: 'AC-PRO-2841-A', model: 'CS100 旗艦',  room: '辦公主區',  status: 'alert',   uptimePct: 82, hoursToday: 8.4 },
    { id: 'AC-PRO-2841-B', model: 'CS100 旗艦',  room: '會議室 A',  status: 'online',  uptimePct: 96, hoursToday: 4.2 },
    { id: 'AC-PRO-2841-C', model: 'CS80 標準',   room: '會議室 B',  status: 'online',  uptimePct: 91, hoursToday: 5.6 },
    { id: 'AC-PRO-2841-D', model: 'CS80 標準',   room: '茶水間',    status: 'online',  uptimePct: 88, hoursToday: 3.8 },
    { id: 'AC-PRO-2841-E', model: 'CS60 入門',   room: '主管室',    status: 'offline', uptimePct: 12, hoursToday: 0   },
    { id: 'AC-PRO-2841-F', model: 'CS60 入門',   room: '走道',      status: 'offline', uptimePct: 34, hoursToday: 0   },
  ],
  consumables: [
    { k: 'pre',    nm: '前置濾網',   sub: 'Pre-Filter',     pct: 22, daysLeft: 12, life: '90 天',    status: 'critical' },
    { k: 'ecfL',   nm: 'ECF · 左',  sub: 'Electrostatic L', pct: 14, daysLeft: 7,  life: '180 天',   status: 'critical' },
    { k: 'ecfR',   nm: 'ECF · 右',  sub: 'Electrostatic R', pct: 11, daysLeft: 6,  life: '180 天',   status: 'critical' },
    { k: 'hepa',   nm: 'HEPA',     sub: '主濾網',          pct: 38, daysLeft: 28, life: '365 天',   status: 'soon' },
    { k: 'plasma', nm: '電漿模組',  sub: 'Plasma',          pct: 64, daysLeft: 65, life: '730 天',   status: 'watch' },
    { k: 'uv',     nm: 'UV 負離子', sub: 'UV-C',            pct: 78, daysLeft: 142, life: '1,095 天', status: 'ok' },
  ],
  nextMaintenance: { item: 'ECF·R', days: 6 },
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
    { date: '2026/05/18',                kind: 'service', title: 'HEPA 更換提醒已寄送',   detail: 'ECF·L/R 剩 < 15% · 預估 7 天到期', reaction: '客戶尚未回覆' },
    { date: '2026/05/11', time: '11:42', kind: 'spike',   title: 'PM2.5 飆升',           detail: '室外 PM2.5 達 142 · 室內 56',     reaction: '機器自動切高速 · 14 分鐘降至 18' },
    { date: '2026/05/08', time: '19:13', kind: 'alarm',   title: 'E4 + dEF 警報 · 走道機', detail: 'AC-PRO-2841-F 重複觸發', reaction: '客戶手動重啟 · 恢復後再觸發 2 次' },
    { date: '2026/04/26', time: '15:22', kind: 'spike',   title: 'PM2.5 飆升',           detail: '室外 PM2.5 達 142 · 室內 56',     reaction: '機器自動切高速 · 18 分鐘降至 22' },
    { date: '2026/04/15',                kind: 'service', title: '到府定保 · 6 機完成',  detail: '濾網盤點 · 韌體升級至 v3.4',         reaction: '主管室、走道機 韌體升級失敗' },
  ],
  aiSummary: '此場域過去 30 天有 2 次 E4 警報 + ECF·L/R 即將到期 + 持續高 PM2.5 環境壓力。屬「⑥ 雙重介入型」高 LTV upsell 目標。',
  aiCauses: [
    { rank: '①', cause: '工業區地段 · 室外 PM2.5 P90 達 162 · 機器長期滿載',           action: '推薦升級 CS100 一體機(雙功能對抗濕氣 + 空污)· 客單 12–18K' },
    { rank: '②', cause: '主管室 / 走道機長期離線 · 上次定保韌體升級失敗',                action: '安排技師到府:檢查通訊模組 + 重新升級韌體' },
    { rank: '③', cause: 'ECF·L/R 雙側剩 < 15% · 預估 7 天到期 · HEPA 後續 28 天',         action: '立即批次出貨耗材 + 推送「自動配送訂閱」(歷史接受率 38%)' },
  ],
  cohortSize: 36,
  cohortRank: 31,
  cohortAvg: 56,
}

/* 場域 id → FieldDetail。其他場域沿用同份 mock 但替換 identity(展示用) */
export const FIELD_DETAILS: Record<string, FieldDetail> = {
  'SH-2841': FIELD_DETAIL_WANG,
}
