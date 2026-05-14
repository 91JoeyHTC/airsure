/* AirSure — Module G mock data: 行銷與健康證書 */

export interface KpiCard {
  lbl: string
  val: string
  unit: string
  cls: string
  delta: string
  deltaUp: boolean
  spark: number[]
}

export const G_KPIS: KpiCard[] = [
  {
    lbl: '進行中活動',
    val: '3',
    unit: '個',
    cls: 'purple',
    delta: '+1 本月',
    deltaUp: true,
    spark: [1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
  },
  {
    lbl: '本月發行證書',
    val: '482',
    unit: '份',
    cls: 'green',
    delta: '+24 vs 上月',
    deltaUp: true,
    spark: [300, 330, 360, 390, 420, 440, 455, 468, 478, 482],
  },
  {
    lbl: '推薦轉換率',
    val: '18.6',
    unit: '%',
    cls: 'orange',
    delta: '+2.4 pp',
    deltaUp: true,
    spark: [12, 13, 14, 14, 15, 16, 17, 17, 18, 18.6],
  },
  {
    lbl: 'LINE 觸及',
    val: '8,420',
    unit: '人',
    cls: 'red',
    delta: '+18%',
    deltaUp: true,
    spark: [5800, 6200, 6500, 6800, 7100, 7400, 7700, 8000, 8200, 8420],
  },
]

export interface FunnelStep {
  lbl: string
  n: number
  pct: number | null
  color: string
}

export const CERT_FUNNEL: FunnelStep[] = [
  { lbl: '轉傳', n: 2847, pct: null, color: '#4F46E5' },
  { lbl: '開啟', n: 1923, pct: 67.5, color: '#0E7A66' },
  { lbl: '預約', n: 634, pct: 33.0, color: '#16A085' },
  { lbl: '新客', n: 117, pct: 18.5, color: '#D97706' },
]

export interface CertRecord {
  date: string
  member: string
  id: string
  grade: string
  status: string
  statusCls: string
}

export const RECENT_CERTS: CertRecord[] = [
  { date: '2026/05/14', member: '陳俊宏', id: 'AS-2026Q1-08412', grade: 'A', status: '已發送', statusCls: 'g' },
  { date: '2026/05/14', member: '王淑芬', id: 'AS-2026Q1-09203', grade: 'B', status: '已發送', statusCls: 'g' },
  { date: '2026/05/14', member: '林雅琪', id: 'AS-2026Q1-10055', grade: 'A', status: '已發送', statusCls: 'g' },
  { date: '2026/05/12', member: '黃建中', id: 'AS-2026Q1-06822', grade: 'B', status: '已發送', statusCls: 'g' },
  { date: '2026/05/12', member: '李文芳', id: 'AS-2026Q1-07738', grade: 'C', status: '待確認', statusCls: 'y' },
  { date: '2026/05/11', member: '張志明', id: 'AS-2026Q1-05611', grade: 'B', status: '已發送', statusCls: 'g' },
  { date: '2026/05/10', member: '吳承翰', id: 'AS-2026Q1-06188', grade: 'A', status: '已發送', statusCls: 'g' },
]

export interface ReferralTier {
  n: number
  lbl: string
  rwd: string
  got: boolean
  pct: number
}

export const REFERRAL_TIERS: ReferralTier[] = [
  { n: 1, lbl: '初啟動', rwd: 'NT$ 800', got: true, pct: 100 },
  { n: 3, lbl: '推薦達人', rwd: '濾網 1 組', got: true, pct: 100 },
  { n: 6, lbl: '社群大使', rwd: '訂閱 1 個月', got: true, pct: 100 },
  { n: 12, lbl: '黃金大使', rwd: 'NT$ 8,000', got: true, pct: 100 },
  { n: 20, lbl: '白金大使', rwd: '高級訂閱年方案', got: false, pct: 60 },
  { n: 30, lbl: '鑽石大使', rwd: 'KleenAir Pro 500 旗艦機', got: false, pct: 40 },
]

export interface Referrer {
  rk: number
  nm: string
  cid: string
  av: string
  tier: 'g' | 'n'
  invites: number
  success: number
  rate: number
  reward: number
  last: string
}

export const TOP_REFERRERS: Referrer[] = [
  { rk: 1, nm: '陳俊宏', cid: 'M-008412', av: '陳', tier: 'g', invites: 18, success: 12, rate: 66.7, reward: 14400, last: '3 天前' },
  { rk: 2, nm: '王婉真', cid: 'M-009203', av: '王', tier: 'g', invites: 14, success: 9, rate: 64.3, reward: 10800, last: '本週' },
  { rk: 3, nm: '黃慧君', cid: 'M-010055', av: '黃', tier: 'g', invites: 12, success: 8, rate: 66.7, reward: 9600, last: '本週' },
  { rk: 4, nm: '吳承翰', cid: 'M-005611', av: '吳', tier: 'n', invites: 10, success: 6, rate: 60.0, reward: 7200, last: '上週' },
  { rk: 5, nm: '張志成', cid: 'M-007738', av: '張', tier: 'n', invites: 9, success: 5, rate: 55.6, reward: 6000, last: '上週' },
  { rk: 6, nm: '林雅琪', cid: 'M-010088', av: '林', tier: 'n', invites: 8, success: 4, rate: 50.0, reward: 4800, last: '2 週前' },
  { rk: 7, nm: '陳明志', cid: 'M-011024', av: '陳', tier: 'n', invites: 7, success: 3, rate: 42.9, reward: 3600, last: '本月' },
  { rk: 8, nm: '蔡靜芝', cid: 'M-012088', av: '蔡', tier: 'g', invites: 6, success: 3, rate: 50.0, reward: 3600, last: '本月' },
  { rk: 9, nm: '劉志明', cid: 'M-013102', av: '劉', tier: 'n', invites: 5, success: 2, rate: 40.0, reward: 2400, last: '上月' },
  { rk: 10, nm: '許淑惠', cid: 'M-014210', av: '許', tier: 'n', invites: 4, success: 2, rate: 50.0, reward: 2400, last: '上月' },
]

export interface Campaign {
  title: string
  status: 'live' | 'draft'
  statusLbl: string
  channel: string
  dateRange: string
  target: string
  reach: number | null
  participate: number | null
  conversion: number | null
  progress: number
  progressTag: string
  budget: string
  ctaLbl: string
  theme: string
}

export const CAMPAIGNS: Campaign[] = [
  {
    title: '春季健康月 · 第三週',
    status: 'live',
    statusLbl: '進行中',
    channel: 'LINE + Email',
    dateRange: '2026/04/22 — 2026/05/19',
    target: '全會員',
    reach: 2847,
    participate: 478,
    conversion: 16.8,
    progress: 72,
    progressTag: '已進行 72% · 預估超出目標 24%',
    budget: 'NT$ 124K · 已用 71%',
    ctaLbl: '查看詳情 →',
    theme: 'spring',
  },
  {
    title: 'Q1 健康證書頒發',
    status: 'live',
    statusLbl: '進行中',
    channel: 'Email + App Push',
    dateRange: '2026/04/01 — 2026/06/30',
    target: '高級會員',
    reach: 482,
    participate: 156,
    conversion: 32.4,
    progress: 54,
    progressTag: '高級會員 57% 已領取',
    budget: '自動發送 · 每週四',
    ctaLbl: '編輯模板 →',
    theme: 'health',
  },
  {
    title: '梅雨季空氣關懷',
    status: 'draft',
    statusLbl: '草稿',
    channel: 'LINE + SMS',
    dateRange: '預計 2026/05/26 開始',
    target: '潮濕區會員',
    reach: 1238,
    participate: null,
    conversion: null,
    progress: 20,
    progressTag: '內容已完成 · 待行銷主管核准',
    budget: '預算 NT$ 86K',
    ctaLbl: '送出審核 →',
    theme: 'air',
  },
]

export interface ChannelStat {
  ch: string
  glyph: string
  nm: string
  sub: string
  reach: number
  openPct: number
  ctrPct: number
  delta: string
  deltaUp: boolean
  color: string
}

export const CHANNEL_STATS: ChannelStat[] = [
  { ch: 'line', glyph: 'LN', nm: 'LINE OA', sub: '主要 · 推播 · 自動化', reach: 2841, openPct: 78, ctrPct: 18.4, delta: '+24%', deltaUp: true, color: '#06C755' },
  { ch: 'email', glyph: '@', nm: 'Email', sub: '證書 · 報告寄送', reach: 1420, openPct: 42, ctrPct: 8.2, delta: '−3%', deltaUp: false, color: '#4F46E5' },
  { ch: 'sms', glyph: 'SM', nm: 'SMS', sub: '緊急 · 提醒通知', reach: 412, openPct: 94, ctrPct: 6.8, delta: '+12%', deltaUp: true, color: '#D97706' },
  { ch: 'push', glyph: 'PN', nm: 'App Push', sub: 'App 內 · 健康提醒', reach: 3180, openPct: 52, ctrPct: 14.2, delta: '+8%', deltaUp: true, color: '#7C3AED' },
]

export interface DataGapSource {
  k: string
  nm: string
  sub: string
  cov: number
  status: 'missing' | 'partial' | 'connected'
  need: string
  owner: string
  eta: string
}

export const DATA_GAP_SOURCES: DataGapSource[] = [
  { k: 'meta', nm: 'Meta Ads', sub: 'Facebook + Instagram 廣告投放', cov: 0, status: 'missing', need: 'API 串接 + UTM 對齊', owner: 'Joey + 立坦', eta: 'Q3 2026' },
  { k: 'google', nm: 'Google Ads', sub: 'Search + Display + YouTube', cov: 0, status: 'missing', need: 'GA4 + Google Ads API 對接', owner: 'Joey + 立坦', eta: 'Q3 2026' },
  { k: 'line-lap', nm: 'LINE LAP', sub: 'LINE 廣告平台', cov: 0, status: 'missing', need: 'LAP API 串接', owner: '立坦', eta: 'Q4 2026' },
  { k: 'voice', nm: '網路聲量', sub: 'OpView / iBuzz', cov: 14, status: 'partial', need: '第三方工具評估中', owner: '行銷主管', eta: 'Q2 2026' },
  { k: 'serp', nm: '搜尋能見度', sub: 'SEO 排名 + SERP feature', cov: 0, status: 'missing', need: 'Ahrefs / SimilarWeb 工具採購', owner: '行銷主管', eta: 'TBD' },
  { k: 'sentiment', nm: '社群輿情分析', sub: '情緒分析 + 主題分群', cov: 0, status: 'missing', need: 'AI 模型 + 第三方資料源', owner: 'Joey', eta: 'Q4 2026' },
]

export const REFERRAL_FUNNEL: FunnelStep[] = [
  { lbl: '已發送', n: 189, pct: 100, color: '#4F46E5' },
  { lbl: '已開啟', n: 148, pct: 78.3, color: '#7C3AED' },
  { lbl: '已點擊', n: 118, pct: 62.4, color: '#16A085' },
  { lbl: '已註冊', n: 108, pct: 57.1, color: '#0E7A66' },
  { lbl: '已訂閱', n: 61, pct: 32.3, color: '#D97706' },
]
