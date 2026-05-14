/* AirSure — Module E (會員經營) mock data */

// ── KPI Cards ────────────────────────────────────────────────────────────────
export interface MemberKPI {
  lbl: string
  val: string
  u: string
  delta: string
  dir: 'up' | 'dn' | 'flat'
  accent: 'green' | 'purple' | 'orange' | 'red'
  spark: number[]
}

export const MEMBER_KPIS: MemberKPI[] = [
  {
    lbl: '總會員數', val: '3,248', u: '位', delta: '+342 本月', dir: 'up',
    accent: 'purple',
    spark: [2800, 2900, 2980, 3020, 3060, 3100, 3140, 3180, 3210, 3248],
  },
  {
    lbl: '活躍率', val: '68.4', u: '%', delta: '+1.8 pp', dir: 'up',
    accent: 'green',
    spark: [62, 63, 64, 65, 65, 66, 67, 67, 68, 68],
  },
  {
    lbl: '本月新增', val: '342', u: '位', delta: '+22%', dir: 'up',
    accent: 'orange',
    spark: [200, 220, 240, 260, 275, 290, 300, 315, 330, 342],
  },
  {
    lbl: '挽回估值', val: '840', u: 'K · NT$', delta: 'AI 預估', dir: 'up',
    accent: 'red',
    spark: [620, 660, 700, 720, 740, 760, 790, 810, 825, 840],
  },
]

// ── Daily Operations Channels ─────────────────────────────────────────────────
export interface DailyChannel {
  k: string
  nm: string
  sub: string
  stats: { l: string; v: string; sub: string; good?: boolean }[]
  target: number
  actual: number
  c: string
}

export const DAILY_CHANNELS: DailyChannel[] = [
  {
    k: 'edm', nm: 'EDM · 電子報', sub: '每週四發送 · 訂閱 6,842',
    stats: [
      { l: '送達', v: '6,720', sub: '98.2%' },
      { l: '開信率', v: '42.4%', sub: '↑ +2.1 pp', good: true },
      { l: '點擊率', v: '8.6%', sub: '↑ +0.8 pp', good: true },
      { l: '退訂率', v: '0.18%', sub: '↓ 良好', good: true },
    ],
    target: 35, actual: 42.4, c: '#4F46E5',
  },
  {
    k: 'app', nm: 'APP · 月活', sub: '6,420 位有 APP 帳號',
    stats: [
      { l: 'MAU', v: '4,128', sub: '64.3%' },
      { l: 'DAU', v: '1,842', sub: 'DAU/MAU 44.6%' },
      { l: '平均使用時長', v: '4.2 分', sub: '↑ +0.4 分', good: true },
      { l: '推播開啟率', v: '52.4%', sub: '↑ +3.2 pp', good: true },
    ],
    target: 60, actual: 64.3, c: '#0E7A66',
  },
  {
    k: 'line', nm: 'LINE OA', sub: '好友 7,842',
    stats: [
      { l: '送達', v: '7,820', sub: '99.8%' },
      { l: '開啟率', v: '78.4%', sub: '↑ +1.8 pp', good: true },
      { l: '回覆率', v: '12.6%', sub: '互動深度' },
      { l: '封鎖率', v: '0.42%', sub: '↓ 健康' },
    ],
    target: 70, actual: 78.4, c: '#06C755',
  },
]

// ── Lifecycle stages ──────────────────────────────────────────────────────────
export interface LifecycleStage {
  k: string
  l: string
  n: number
  c: string
}

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { k: 'new',  l: '新會員',    n: 184,  c: '#16A34A' },
  { k: 'act',  l: '活躍',      n: 6842, c: '#0E7A66' },
  { k: 'slp',  l: '沉睡',      n: 1284, c: '#D97706' },
  { k: 'risk', l: '流失預警',  n: 268,  c: '#DC2626' },
  { k: 'gone', l: '流失·挽回', n: 96,   c: '#6B7280' },
]

export interface LifecycleFlow {
  from: number
  to: number
  n: number
  pct: number
  c: string
  label: string
  risk?: boolean
}

export const LIFECYCLE_FLOWS_FWD: LifecycleFlow[] = [
  { from: 0, to: 1, n: 184, pct: 78.4, c: '#16A34A', label: '轉活躍' },
  { from: 1, to: 2, n: 124, pct: 1.4,  c: '#D97706', label: '進入沉睡', risk: true },
  { from: 2, to: 3, n: 86,  pct: 6.7,  c: '#DC2626', label: '預警觸發', risk: true },
  { from: 3, to: 4, n: 14,  pct: 5.2,  c: '#6B7280', label: '判定流失' },
]

export const LIFECYCLE_FLOWS_BACK: LifecycleFlow[] = [
  { from: 3, to: 1, n: 22, pct: 25.6, c: '#7C3AED', label: '挽回成功' },
  { from: 2, to: 1, n: 38, pct: 3.0,  c: '#0E7A66', label: '喚醒回流' },
]

// ── Acquisition source bar chart ──────────────────────────────────────────────
export interface AcqSource {
  nm: string
  n: number
  c: string
}

export const ACQ_SOURCES: AcqSource[] = [
  { nm: '春季健康月活動', n: 98,  c: '#4F46E5' },
  { nm: 'LINE 推薦',      n: 84,  c: '#06C755' },
  { nm: '官網有機搜尋',   n: 62,  c: '#0E7A66' },
  { nm: '健康證書口碑',   n: 56,  c: '#D97706' },
  { nm: 'Meta 廣告',      n: 24,  c: '#E1306C' },
  { nm: '其他',           n: 18,  c: '#9CA3AF' },
]

// ── Segment cards ─────────────────────────────────────────────────────────────
export interface SegCard {
  k: string
  cls: 'g' | 'b' | 'y' | 'r'
  nm: string
  cnt: number
  pct: number
  rfm: string
  desc: string
  act: string
  tail: string
  gr: 'up' | 'dn'
}

export const OPS_SEGMENTS: SegCard[] = [
  { k: 'champ',  cls: 'g', nm: '冠軍會員',   cnt: 182,  pct: 5.6,  rfm: 'R5 F5 M5', desc: '高頻 · 高價值 · 近 30 天活躍 · ARR 貢獻 42%',       act: '邀請大使計畫',      tail: '近 30 天 +12', gr: 'up' },
  { k: 'loyal',  cls: 'g', nm: '忠誠主力',   cnt: 208,  pct: 6.4,  rfm: 'R4 F5 M4', desc: '訂閱 ≥ 24 月 · 高使用率 · NPS +62',                act: '推進大使邀請',      tail: 'Tenure 中位 31 月', gr: 'up' },
  { k: 'pot',    cls: 'b', nm: '潛力新星',   cnt: 146,  pct: 4.5,  rfm: 'R4 F3 M3', desc: '使用穩定 · 升級至高級潛力高',                       act: '推升級方案',        tail: '預估升級 NT$ 84K', gr: 'up' },
  { k: 'gen',    cls: 'b', nm: '一般活躍',   cnt: 420,  pct: 12.9, rfm: 'R3 F3 M2', desc: '穩定訂閱但使用中等 · 有提升空間',                   act: '健康教育推播',      tail: '+28 vs 上月', gr: 'up' },
  { k: 'wake',   cls: 'y', nm: '需喚醒',     cnt: 74,   pct: 2.3,  rfm: 'R3 F2 M2', desc: '本月使用率 < 20% 但仍持有訂閱',                    act: 'LINE 喚醒任務',    tail: '上月 +5', gr: 'dn' },
  { k: 'about',  cls: 'r', nm: '即將流失',   cnt: 82,   pct: 2.5,  rfm: 'R2 F2 M2', desc: '訂閱 30 天內到期 + 使用驟降 · ★ 主動聯繫',         act: '顧問致電 + 優惠',   tail: '12 位高風險 24h', gr: 'dn' },
  { k: 'risk',   cls: 'r', nm: '已流失',     cnt: 154,  pct: 4.7,  rfm: 'R1 F1 M1', desc: '訂閱已過期 90+ 天 · 重啟成本 4–6 倍',              act: 'Reactivation 活動', tail: '6 個月再啟 8%', gr: 'dn' },
  { k: 'new',    cls: 'b', nm: '觀望新客',   cnt: 92,   pct: 2.8,  rfm: 'R5 F1 M1', desc: '近 90 天加入 · 仍在學習產品 · 需第一次成功',        act: '安裝引導 + 顧問',   tail: '90 日留存 78%', gr: 'up' },
]

export const MKT_SEGMENTS: SegCard[] = [
  { k: 'allergy',   cls: 'g', nm: '過敏季響應族',   cnt: 312, pct: 9.6,  rfm: 'R4 F4 M3', desc: '春秋空污推播回應顯著 · 開信率 68%',           act: '春秋兩季 EDM',        tail: '上次 CTR 22%', gr: 'up' },
  { k: 'cert',      cls: 'g', nm: '健康證書傳播者', cnt: 156, pct: 4.8,  rfm: 'R5 F4 M4', desc: '主動分享證書 · 帶來 1.4 推薦',                act: '推薦獎勵階梯',        tail: '本月分享 +28', gr: 'up' },
  { k: 'recurring', cls: 'g', nm: '推薦回購主力',   cnt: 98,  pct: 3.0,  rfm: 'R5 F5 M5', desc: '訂閱 ≥ 2 年 + 推薦 1 位 · 核心擁護',         act: '大使計畫終身綁定',    tail: '貢獻 LTV 4.2M', gr: 'up' },
  { k: 'line',      cls: 'b', nm: 'LINE 高互動族',  cnt: 482, pct: 14.8, rfm: 'R4 F3 M2', desc: 'LINE OA 開啟率 ≥ 65% · 回應 < 30 分',        act: 'LINE 限定優惠',       tail: '本週開啟 86%', gr: 'up' },
  { k: 'edm',       cls: 'b', nm: 'EDM 開信族',     cnt: 268, pct: 8.2,  rfm: 'R3 F3 M2', desc: '開信率 ≥ 45% · 偏好深度內容',                act: '健康知識電子報',      tail: '近 4 期 52%', gr: 'up' },
  { k: 'dragon',    cls: 'y', nm: '端午檔期回應',   cnt: 184, pct: 5.7,  rfm: 'R3 F2 M3', desc: '去年端午下單 · 節慶送禮型',                   act: '送禮包裝 + 早鳥',     tail: '預估今年 220', gr: 'up' },
  { k: 'mother',    cls: 'y', nm: '母親節送禮族',   cnt: 142, pct: 4.4,  rfm: 'R3 F2 M3', desc: '4–5 月集中下單 · 子女購買為父母',             act: '母親節主題 (4/15 起)', tail: '去年 NT$ 3.8M', gr: 'up' },
  { k: 'discount',  cls: 'r', nm: '折扣敏感型',     cnt: 386, pct: 11.9, rfm: 'R2 F2 M1', desc: '折扣 ≥ 15% 才下單 · 毛利率偏低',             act: '降低投放頻次',        tail: '單客毛利 380', gr: 'dn' },
]

// ── Outreach members ──────────────────────────────────────────────────────────
export type SevLevel = 'high' | 'mid' | 'lo'

export interface MemberSignal {
  m: string
  t: string
  when: string
  sev: 'r' | 'y' | 'g'
}

export interface OutreachMember {
  id: string
  nm: string
  av: string
  lv: string
  tier: 'g' | 'n'
  addr: string
  ltv: number
  churn: number
  sev: SevLevel
  sla: { txt: string; cls: string }
  last: string
  cs: string
  cha: 'phone' | 'line'
  reason: string
  sig: MemberSignal[]
  recoverVal: string
  actions: string[]
}

export const OUTREACH_MEMBERS: OutreachMember[] = [
  {
    id: 'M-008412', nm: '陳俊宏', av: '陳', lv: '高級', tier: 'g',
    addr: '台北 · 信義居家 SH-0021',
    ltv: 184, churn: 64, sev: 'high',
    sla: { txt: '剩 6 小時', cls: 'r' },
    last: '14 天前', cs: '王 (高級顧問)', cha: 'phone',
    reason: '訂閱 27 天到期 · 使用率 18% · 設備離線',
    sig: [
      { m: 'A', t: 'PM2.5 連 5 天超標 (峰值 84)', when: '今 09:12', sev: 'r' },
      { m: 'A', t: '4 台設備離線 48 小時', when: '昨 17:30', sev: 'r' },
      { m: 'B', t: '本月使用率 18% (平均 72%)', when: '本週', sev: 'y' },
      { m: 'F', t: '訂閱距到期 27 天', when: '系統', sev: 'y' },
    ],
    recoverVal: 'NT$ 184K',
    actions: ['致電', '排程', 'LINE'],
  },
  {
    id: 'M-007738', nm: '李文芳', av: '李', lv: '一般', tier: 'n',
    addr: '台北 · 大安辦公室 SH-0033',
    ltv: 88, churn: 51, sev: 'high',
    sla: { txt: '今日 17:00', cls: 'r' },
    last: '32 天前', cs: '林 (顧問)', cha: 'line',
    reason: '訂閱 14 天內到期 · 連續 28 天 0 開機',
    sig: [
      { m: 'F', t: '訂閱 14 天內到期', when: '系統', sev: 'r' },
      { m: 'B', t: '連續 28 天 0 開機', when: '今', sev: 'r' },
      { m: 'G', t: '春季活動未參與', when: '本週', sev: 'y' },
    ],
    recoverVal: 'NT$ 88K',
    actions: ['LINE', '排程'],
  },
  {
    id: 'M-009203', nm: '王淑芬', av: '王', lv: '高級', tier: 'g',
    addr: '台中 · 科技園區 SH-2841',
    ltv: 12, churn: 22, sev: 'mid',
    sla: { txt: '24 小時', cls: 'y' },
    last: '昨日', cs: '張 (技術)', cha: 'phone',
    reason: '濾網逾期 18 天 · TVOC 警示頻發',
    sig: [
      { m: 'D', t: '濾網逾期 18 天未換 (3 台)', when: '今', sev: 'r' },
      { m: 'A', t: 'TVOC 7 天 3 次警示', when: '今 06:40', sev: 'y' },
      { m: 'C', t: '上次保養工單延誤 2 週', when: '上月', sev: 'y' },
    ],
    recoverVal: 'NT$ 12K',
    actions: ['排程派工', '致電'],
  },
  {
    id: 'M-005611', nm: '張志明', av: '張', lv: '一般', tier: 'n',
    addr: '新北 · 板橋 SH-1147',
    ltv: 24, churn: 28, sev: 'mid',
    sla: { txt: '48 小時', cls: 'y' },
    last: '8 天前', cs: '林 (顧問)', cha: 'phone',
    reason: '健康諮詢預約逾期 · 分數下降',
    sig: [
      { m: 'G', t: '健康諮詢預約逾期 3 天', when: '本週', sev: 'y' },
      { m: 'B', t: '健康分數 78 → 66', when: '本季', sev: 'y' },
    ],
    recoverVal: 'NT$ 24K',
    actions: ['致電', 'LINE'],
  },
  {
    id: 'M-010055', nm: '林雅琪', av: '林', lv: '一般', tier: 'n',
    addr: '桃園 · 中壢 SH-4119',
    ltv: 38, churn: 15, sev: 'lo',
    sla: { txt: '本週', cls: '' },
    last: '6 天前', cs: '未指派', cha: 'line',
    reason: '推薦邀請 3 次未成功 · 高潛在推薦人',
    sig: [
      { m: 'G', t: '推薦邀請 3 次未成功 (近 30 天)', when: '本月', sev: 'y' },
      { m: 'B', t: '滿意度 4.8/5 · 高潛在推薦人', when: '上季', sev: 'g' },
    ],
    recoverVal: 'NT$ 38K',
    actions: ['LINE', '邀請工具'],
  },
  {
    id: 'M-006822', nm: '黃建中', av: '黃', lv: '高級', tier: 'g',
    addr: '高雄 · 鼓山 SH-3052',
    ltv: 92, churn: 38, sev: 'lo',
    sla: { txt: '本週', cls: '' },
    last: '46 天前', cs: '王 (高級顧問)', cha: 'phone',
    reason: 'TVOC 異常 · App 30 天未開啟',
    sig: [
      { m: 'A', t: 'TVOC 異常但設備未排除', when: '本週', sev: 'y' },
      { m: 'B', t: 'App 30 天未開啟', when: '本月', sev: 'y' },
    ],
    recoverVal: 'NT$ 92K',
    actions: ['致電', '排程'],
  },
]

export const OUTREACH_FILTERS = [
  { k: 'all',      l: '全部',       n: 37 },
  { k: 'expire',   l: '訂閱到期',   n: 15 },
  { k: 'device',   l: '設備異常',   n: 10 },
  { k: 'dormant',  l: '長期未活躍', n: 8  },
  { k: 'referral', l: '推薦追蹤',   n: 4  },
]

// ── Churn prediction ──────────────────────────────────────────────────────────
export interface ChurnTier {
  label: string
  count: number
  pctRange: string
  c: string
  cls: 'r' | 'y' | 'g'
  members: { nm: string; id: string; pct: number; reason: string }[]
}

export const CHURN_TIERS: ChurnTier[] = [
  {
    label: '高風險', count: 23, pctRange: '>60%', c: '#DC2626', cls: 'r',
    members: [
      { nm: '陳俊宏', id: 'M-008412', pct: 64, reason: '設備離線 + 訂閱到期' },
      { nm: '李文芳', id: 'M-007738', pct: 58, reason: '28 天未開機 + 到期' },
      { nm: '黃健宇', id: 'M-011204', pct: 72, reason: '使用率驟降 + 未回應' },
    ],
  },
  {
    label: '中風險', count: 58, pctRange: '30–60%', c: '#D97706', cls: 'y',
    members: [
      { nm: '張志明', id: 'M-005611', pct: 42, reason: '諮詢逾期 + 分數下降' },
      { nm: '黃建中', id: 'M-006822', pct: 38, reason: 'App 未開啟 + TVOC' },
      { nm: '林芳瑜', id: 'M-004178', pct: 35, reason: '使用率下降' },
    ],
  },
  {
    label: '低風險', count: 186, pctRange: '<30%', c: '#16A34A', cls: 'g',
    members: [
      { nm: '王淑芬', id: 'M-009203', pct: 22, reason: '濾網逾期' },
      { nm: '林雅琪', id: 'M-010055', pct: 15, reason: '推薦追蹤' },
      { nm: '吳承翰', id: 'M-005208', pct: 8, reason: '健康指數穩定' },
    ],
  },
]

// ── Points management ─────────────────────────────────────────────────────────
export const POINTS_BY_TIER = [
  { tier: 'Diamond', cnt: 184,  avg: 4820, used: 3420, c: '#A855F7' },
  { tier: 'Platinum', cnt: 412, avg: 2840, used: 1820, c: '#0E7A66' },
  { tier: 'Gold',     cnt: 824, avg: 1240, used: 720,  c: '#D97706' },
  { tier: 'Silver',   cnt: 1620, avg: 480, used: 280,  c: '#4F46E5' },
  { tier: 'Bronze',   cnt: 2842, avg: 124, used: 68,   c: '#9CA3AF' },
]
