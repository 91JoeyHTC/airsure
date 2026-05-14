/* AirSure — Module A mock data: 居家空氣場域 */

export interface FieldRecord {
  nm: string
  id: string
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
}

export const FIELDS_A_FULL: FieldRecord[] = [
  { nm: '臺北信義居家', id: 'SH-0021', addr: '信義區松仁路', type: '居家', sz: 42, dev: '4/4', lamp: 'g', q: 92, pm: 12, co2: 642, mem: '陳俊宏 · 高級', tier: 'g' },
  { nm: '新北板橋辦公', id: 'SH-1147', addr: '板橋區文化路', type: '辦公', sz: 88, dev: '8/9', lamp: 'y', q: 76, pm: 32, co2: 894, mem: '李文君', tier: '' },
  { nm: '臺中科技園區', id: 'SH-2841', addr: '西屯區工業區', type: '辦公', sz: 185, dev: '6/10', lamp: 'r', q: 48, pm: 84, co2: 1240, mem: '王婉真 · 高級', tier: 'g' },
  { nm: '高雄前鎮辦公', id: 'SH-3052', addr: '前鎮區成功二路', type: '辦公', sz: 64, dev: '5/5', lamp: 'g', q: 88, pm: 18, co2: 720, mem: '張志成', tier: '' },
  { nm: '桃園藝文居家', id: 'SH-4119', addr: '桃園區慈文路', type: '居家', sz: 38, dev: '3/3', lamp: 'g', q: 95, pm: 8, co2: 580, mem: '黃慧君 · 高級', tier: 'g' },
  { nm: '臺南安平診所', id: 'SH-5023', addr: '安平區永華路', type: '醫療', sz: 96, dev: '7/8', lamp: 'y', q: 71, pm: 38, co2: 920, mem: '林醫師', tier: '' },
  { nm: '新竹東區居家', id: 'SH-5208', addr: '東區光復路', type: '居家', sz: 52, dev: '4/4', lamp: 'g', q: 90, pm: 14, co2: 620, mem: '吳承翰 · 高級', tier: 'g' },
  { nm: '臺北大安咖啡店', id: 'SH-5611', addr: '大安區忠孝東路', type: '商業', sz: 28, dev: '2/3', lamp: 'y', q: 68, pm: 42, co2: 1080, mem: '阿諾義式', tier: '' },
  { nm: '宜蘭礁溪民宿', id: 'SH-6022', addr: '礁溪鄉德陽路', type: '商業', sz: 76, dev: '4/4', lamp: 'g', q: 86, pm: 22, co2: 690, mem: '陶然居', tier: '' },
]

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

export const REGION_HEALTH = [
  { r: '臺北市', n: 312, q: 86, dlt: +2 },
  { r: '新北市', n: 286, q: 82, dlt: -1 },
  { r: '桃園市', n: 178, q: 89, dlt: +3 },
  { r: '新竹縣市', n: 38, q: 91, dlt: +4 },
  { r: '臺中市', n: 165, q: 71, dlt: -6 },
  { r: '臺南市', n: 124, q: 79, dlt: -2 },
  { r: '高雄市', n: 142, q: 84, dlt: +1 },
  { r: '其他', n: 39, q: 76, dlt: 0 },
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
    title: '依設備健康分數', sub: '加權整合六類耗材 + 運轉指標 · 0–100 分', axis: 'DHI',
    groups: [
      { lbl: 'A 級 (≥ 85)', n: 7842, pct: 62.8, traits: '濾網準時 · 韌體最新 · 主動採納建議高', action: '推薦升級訂閱 / 加入健康證書計畫', c: 'var(--as-success)' },
      { lbl: 'B 級 (70–84)', n: 3214, pct: 25.8, traits: '部分耗材接近壽命 · 偶有警示', action: '主動推送耗材自動配送', c: '#16A085' },
      { lbl: 'C 級 (50–69)', n: 1102, pct: 8.8, traits: '多項耗材逾期 · 韌體偏舊', action: '排程到府保養 + 韌體升級', c: 'var(--as-warning)' },
      { lbl: 'D 級 (< 50)', n: 323, pct: 2.6, traits: '影響保固 · 流失風險高', action: '客服優先聯繫 + 派工', c: 'var(--as-danger)' },
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
    title: '依場域空品挑戰', sub: '室外 PM2.5 比值 + 改善幅度', axis: '空品',
    groups: [
      { lbl: '常態優 (比 < 50%)', n: 4218, pct: 33.8, traits: '本來空品好 · 改善幅度小', action: '健康證書頒發 / 案例分享', c: 'var(--as-success)' },
      { lbl: '一般 (50–80%)', n: 6842, pct: 54.8, traits: '一般家庭 · 改善 30–60%', action: '常規服務 + 季度報告', c: '#4F46E5' },
      { lbl: '高挑戰 (≥ 80%)', n: 1421, pct: 11.4, traits: '空污嚴重區 · 設備滿載運轉', action: '推薦多機部署 / 升級高效濾網', c: 'var(--as-danger)' },
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
