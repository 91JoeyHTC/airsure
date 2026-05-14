/* AirSure — Module F (營收分析) mock data */

// ── KPI Cards ─────────────────────────────────────────────────────────────────
export interface RevenueKPI {
  lbl: string
  val: string
  u: string
  delta: string
  dir: 'up' | 'dn' | 'flat'
  accent: 'green' | 'purple' | 'orange' | 'red'
  spark: number[]
}

export const REVENUE_KPIS: RevenueKPI[] = [
  {
    lbl: '本月營收 (MTD)', val: 'NT$4.7', u: 'M', delta: '+12.4% MoM', dir: 'up',
    accent: 'purple',
    spark: [3.2, 3.5, 3.8, 4.0, 4.1, 4.2, 4.3, 4.5, 4.6, 4.7],
  },
  {
    lbl: 'MoM 成長率', val: '+12.4', u: '%', delta: '較上月 +4.2 pp', dir: 'up',
    accent: 'green',
    spark: [6, 7, 8, 8, 9, 9, 10, 11, 11, 12],
  },
  {
    lbl: 'ARR', val: 'NT$52.8', u: 'M', delta: '+8.2% YoY', dir: 'up',
    accent: 'orange',
    spark: [44, 46, 47, 48, 49, 50, 51, 52, 52.5, 52.8],
  },
  {
    lbl: '訂閱續約率', val: '92.8', u: '%', delta: '+1.4 pp', dir: 'up',
    accent: 'green',
    spark: [88, 89, 90, 90, 91, 91, 92, 92, 92.5, 92.8],
  },
]

// ── Customer Source (客戶類型) ─────────────────────────────────────────────────
export interface CustomerSource {
  k: string
  nm: string
  sub: string
  rev: number
  pct: number
  custs: number
  aov: number
  ord: number
  yoy: number
  mom: number
  dir: 'up' | 'dn'
  clr: string
  tint: string
  icon: string
  sig: string
  flagship?: boolean
  isLead?: boolean
}

export const CUSTOMER_SOURCES: CustomerSource[] = [
  {
    k: 'new', nm: '新購客戶', sub: '今年首次成交 · 反映 G 模組獲客效益',
    rev: 11.2, pct: 39.2, custs: 342, aov: 32750, ord: 386,
    yoy: 12.4, mom: 5.8, dir: 'up',
    clr: '#4F46E5', tint: '#EEF0FF', icon: 'plus',
    sig: '主要來自春季健康月活動 + Meta 廣告投放',
  },
  {
    k: 'repeat', nm: '復購客戶', sub: '2 次以上消費 · 反映 E 留存效能',
    rev: 9.8, pct: 34.3, custs: 218, aov: 44950, ord: 248,
    yoy: 8.4, mom: 3.2, dir: 'up',
    clr: '#0E7A66', tint: '#E8F4EE', icon: 'refresh',
    sig: '訂閱續約 + 耗材自動配送 + 升級方案',
  },
  {
    k: 'referral', nm: '會推薦客戶', sub: 'v4 核心 — 服務型品牌真實成效',
    rev: 5.6, pct: 19.6, custs: 89, aov: 62920, ord: 124,
    yoy: 38.2, mom: 14.2, dir: 'up',
    clr: '#D97706', tint: '#FEF3E2', icon: 'star',
    sig: '健康證書社交分享 + 老客戶 NPS 推薦 (K-factor 1.42)',
    flagship: true,
  },
  {
    k: 'lead', nm: '潛在客戶', sub: '已互動尚未成交 · 預估價值',
    rev: 2.0, pct: 6.9, custs: 1248, aov: 0, ord: 52,
    yoy: 18.4, mom: 6.2, dir: 'up',
    clr: '#9CA3AF', tint: '#F3F4F6', icon: 'eye',
    sig: 'KOL 合作 / 公關 / 互動名單 · 預估 LTV NT$ 24.6M',
    isLead: true,
  },
]

// ── Referral Funnel ────────────────────────────────────────────────────────────
export interface ReferralFunnelStep {
  lbl: string
  n: number
  pct: number
  c: string
  note?: string
}

export const REFERRAL_FUNNEL: ReferralFunnelStep[] = [
  { lbl: '證書 + NPS 觸發', n: 4128, pct: 100, c: '#0E7A66' },
  { lbl: '會員實際分享',     n: 1342, pct: 32.5, c: '#16A085' },
  { lbl: '被分享者點開',     n: 5680, pct: 137.6, c: '#4F46E5', note: '平均每分享觸及 4.2 人' },
  { lbl: '預約空氣檢測',     n: 412,  pct: 7.3,   c: '#D97706', note: '佔點開 7.3%' },
  { lbl: '完成首購',         n: 89,   pct: 1.6,   c: '#DC2626' },
]

// ── Subscription Plans ─────────────────────────────────────────────────────────
export interface SubPlan {
  nm: string
  count: number
  px: string
  c: string
}

export const SUB_PLANS: SubPlan[] = [
  { nm: 'Premium 高級 (年方案)', count: 2104, px: 'NT$ 88,800/年', c: '#0E7A66' },
  { nm: 'Standard 標準 (年方案)', count: 1820, px: 'NT$ 36,000/年', c: '#16A085' },
  { nm: 'Standard 月方案',        count: 612,  px: 'NT$ 3,800/月',  c: '#4F46E5' },
  { nm: 'Lite 入門',              count: 285,  px: 'NT$ 1,200/月',  c: '#7C3AED' },
]

// ── Renewal Funnel ─────────────────────────────────────────────────────────────
export interface RenewalStep {
  lbl: string
  n: number
  pct: number
  c: string
}

export const RENEWAL_FUNNEL: RenewalStep[] = [
  { lbl: '到期',   n: 1240, pct: 100, c: '#4F46E5' },
  { lbl: '已聯繫', n: 1142, pct: 92,  c: '#16A085' },
  { lbl: '回應',   n: 968,  pct: 78,  c: '#0E7A66' },
  { lbl: '已續約', n: 892,  pct: 72,  c: '#D97706' },
  { lbl: '升級方案', n: 224, pct: 18, c: '#DC2626' },
]

// ── Sales Channels ────────────────────────────────────────────────────────────
export interface SalesChannel {
  nm: string
  rev: number
  c: string
  icon: string
  mom: number
  convRate: number
  custs: number
}

export const SALES_CHANNELS: SalesChannel[] = [
  { nm: '官網直營 (D2C)',         rev: 142, c: '#0E7A66', icon: 'globe',  mom: 8.4,   convRate: 3.2, custs: 4842 },
  { nm: 'LINE 官方帳號',          rev: 88,  c: '#06C755', icon: 'msg',    mom: 24.0,  convRate: 5.8, custs: 7820 },
  { nm: '實體門市',               rev: 62,  c: '#4F46E5', icon: 'home',   mom: -2.1,  convRate: 12.4, custs: 1240 },
  { nm: '推薦口碑 (健康證書)',     rev: 56,  c: '#D97706', icon: 'star',   mom: 38.2,  convRate: 15.6, custs: 89 },
  { nm: '企業直銷 (B2B)',          rev: 32,  c: '#7C3AED', icon: 'users',  mom: 4.8,   convRate: 8.2, custs: 218 },
  { nm: '電商平台 (蝦皮/PChome)', rev: 48,  c: '#E1306C', icon: 'box',    mom: 6.2,   convRate: 1.8, custs: 3420 },
]

// ── Customer Segment LTV ──────────────────────────────────────────────────────
export interface SegmentLTV {
  nm: string
  pct: string
  ltv: string
  revPct: string
  c: string
}

export const SEGMENT_LTVS: SegmentLTV[] = [
  { nm: '高資產居家 (A+)', pct: '32%', ltv: 'NT$ 380K', revPct: '28%', c: '#0E7A66' },
  { nm: '一般居家 (B)',    pct: '41%', ltv: 'NT$ 96K',  revPct: '38%', c: '#4F46E5' },
  { nm: '中小企業辦公',   pct: '14%', ltv: 'NT$ 240K', revPct: '18%', c: '#16A085' },
  { nm: '醫療/教育機構',  pct: '8%',  ltv: 'NT$ 480K', revPct: '12%', c: '#7C3AED' },
  { nm: '其他',           pct: '5%',  ltv: 'NT$ 64K',  revPct: '4%',  c: '#9CA3AF' },
]

// ── Top Customers ─────────────────────────────────────────────────────────────
export type TierBadge = 'premium' | 'standard' | 'corporate' | 'medical'

export interface TopCustomer {
  rank: number
  nm: string
  type: string
  tier: TierBadge
  sites: number
  devices: number
  ltv: number
  thisYear: number
  subStatus: string
  lastContact: string
  alert?: boolean
}

export const TOP_CUSTOMERS: TopCustomer[] = [
  { rank: 1,  nm: '台積電 健康中心',     type: '法人',   tier: 'corporate', sites: 12, devices: 86,  ltv: 8420000, thisYear: 1840000, subStatus: '主約中',   lastContact: '本週',    alert: false },
  { rank: 2,  nm: '長庚醫院 (林口)',      type: '醫療',   tier: 'medical',   sites: 8,  devices: 124, ltv: 6280000, thisYear: 1240000, subStatus: '續約中',   lastContact: '3 天前',  alert: false },
  { rank: 3,  nm: '誠品書店 連鎖',        type: '商業',   tier: 'corporate', sites: 22, devices: 88,  ltv: 4820000, thisYear: 980000,  subStatus: '穩定',     lastContact: '本月',    alert: false },
  { rank: 4,  nm: '仁愛醫療財團',         type: '醫療',   tier: 'medical',   sites: 4,  devices: 38,  ltv: 2840000, thisYear: 620000,  subStatus: '續約中',   lastContact: '本週',    alert: false },
  { rank: 5,  nm: '陳俊宏',               type: '高級會員', tier: 'premium', sites: 3,  devices: 9,   ltv: 487200,  thisYear: 96000,   subStatus: '★ 需主動', lastContact: '14 天前', alert: true  },
  { rank: 6,  nm: '王婉真',               type: '高級會員', tier: 'premium', sites: 2,  devices: 14,  ltv: 412000,  thisYear: 88800,   subStatus: '★ 需主動', lastContact: '21 天前', alert: true  },
  { rank: 7,  nm: '黃慧君',               type: '高級會員', tier: 'premium', sites: 1,  devices: 3,   ltv: 384000,  thisYear: 88800,   subStatus: '穩定',     lastContact: '本週',    alert: false },
  { rank: 8,  nm: '吳承翰',               type: '高級會員', tier: 'premium', sites: 1,  devices: 4,   ltv: 312800,  thisYear: 88800,   subStatus: '穩定',     lastContact: '本月',    alert: false },
  { rank: 9,  nm: '博愛醫院',             type: '醫療',   tier: 'medical',   sites: 3,  devices: 24,  ltv: 1840000, thisYear: 420000,  subStatus: '穩定',     lastContact: '本月',    alert: false },
  { rank: 10, nm: '遠東新世紀',           type: '企業',   tier: 'corporate', sites: 6,  devices: 42,  ltv: 2140000, thisYear: 480000,  subStatus: '續約中',   lastContact: '本週',    alert: false },
  { rank: 11, nm: '林先生 (新竹)',         type: '高級會員', tier: 'premium', sites: 1,  devices: 5,   ltv: 284000,  thisYear: 88800,   subStatus: '穩定',     lastContact: '本月',    alert: false },
  { rank: 12, nm: '張家瑋',               type: '高級會員', tier: 'premium', sites: 1,  devices: 4,   ltv: 248000,  thisYear: 88800,   subStatus: '穩定',     lastContact: '本週',    alert: false },
]

// ── Goal Tracking ─────────────────────────────────────────────────────────────
export interface GoalItem {
  label: string
  current: number
  target: number
  unit: string
  pct: number
  cls: 'g' | 'y' | 'r' | 'mute'
}

export const GOALS: GoalItem[] = [
  { label: '本月營收',   current: 4.7,  target: 5.0,  unit: 'M',  pct: 94,  cls: 'y' },
  { label: 'ARR',        current: 52.8, target: 55.0, unit: 'M',  pct: 96,  cls: 'y' },
  { label: '新客數',     current: 342,  target: 350,  unit: '位', pct: 98,  cls: 'g' },
  { label: '訂閱續約率', current: 92.8, target: 93.0, unit: '%',  pct: 99.8, cls: 'g' },
  { label: '推薦客占比', current: 19.6, target: 20.0, unit: '%',  pct: 98,  cls: 'g' },
]
