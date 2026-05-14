/* AirSure — Module B mock data: 用戶 360° 視圖 */

export interface CustomerDevice {
  id: string
  site: string
  loc: string
  mdl: string
  fw: string
  hr: number
  fil: number
  st: 'g' | 'y' | 'r'
}

export const CUSTOMER_DEVICES: CustomerDevice[] = [
  { id: 'AC-PRO-1101', site: '臺北信義居家', loc: '客廳', mdl: 'AirSure Pro 500', fw: '2.4.1', hr: 2840, fil: 86, st: 'g' },
  { id: 'AC-PRO-1102', site: '臺北信義居家', loc: '主臥', mdl: 'AirSure Pro 500', fw: '2.4.1', hr: 1920, fil: 72, st: 'g' },
  { id: 'AC-LITE-1103', site: '臺北信義居家', loc: '書房', mdl: 'AirSure Lite', fw: '2.3.8', hr: 1240, fil: 91, st: 'g' },
  { id: 'AC-LITE-1104', site: '臺北信義居家', loc: '小孩房', mdl: 'AirSure Lite', fw: '2.3.8', hr: 980, fil: 88, st: 'g' },
  { id: 'AC-PRO-3344', site: '大安辦公室', loc: '會議室', mdl: 'AirSure Pro 300', fw: '2.4.1', hr: 3120, fil: 24, st: 'y' },
  { id: 'AC-PRO-3345', site: '大安辦公室', loc: '開放區', mdl: 'AirSure Pro 300', fw: '2.4.1', hr: 3210, fil: 18, st: 'y' },
  { id: 'AC-LITE-7821', site: '陽明山度假', loc: '客廳', mdl: 'AirSure Lite', fw: '2.3.6', hr: 412, fil: 96, st: 'r' },
]

export interface ServiceRecord {
  d: string
  tk: string
  tt: string
  st: 'open' | 'done'
  ag: string
  cat: string
}

export const SERVICE_RECORDS: ServiceRecord[] = [
  { d: '2026-05-10', tk: 'T-22791', tt: '陽明山場域 PM2.5 連續超標自動工單', st: 'open', ag: 'AI 觸發', cat: '主動聯繫' },
  { d: '2026-05-05', tk: 'T-22770', tt: '濾網更換 (大安辦公室 AC-PRO-3344)', st: 'done', ag: '林晉宇', cat: '到府服務' },
  { d: '2026-04-22', tk: 'T-22631', tt: '韌體升級派送 2.4.1 (全部 9 台)', st: 'done', ag: '系統', cat: '韌體' },
  { d: '2026-04-15', tk: 'T-22589', tt: '健康諮詢 — 顧問陳怡君', st: 'done', ag: '陳怡君', cat: '諮詢' },
  { d: '2026-04-02', tk: 'T-22441', tt: 'App 配對失敗 (AC-LITE-7821)', st: 'done', ag: '王雅琳', cat: '技術支援' },
  { d: '2026-03-18', tk: 'T-22288', tt: '到府保養 · 高級會員 (信義居家)', st: 'done', ag: '王雅琳', cat: '到府服務' },
  { d: '2026-02-04', tk: 'T-22041', tt: 'CO₂ 感測器校正', st: 'done', ag: '林晉宇', cat: '校正' },
]

export interface FinanceRecord {
  d: string
  ord: string
  it: string
  amt: number
  st: 'paid' | 'pending'
  pm: string
}

export const FINANCE_RECORDS: FinanceRecord[] = [
  { d: '2025-11-04', ord: 'ORD-94821', it: '高級訂閱 (年方案)', amt: 88800, st: 'paid', pm: '信用卡 (****4421)' },
  { d: '2025-09-12', ord: 'ORD-93120', it: '濾網 6 入組', amt: 7200, st: 'paid', pm: '信用卡 (****4421)' },
  { d: '2025-06-22', ord: 'ORD-90415', it: 'AirSure Pro 500 × 2', amt: 142000, st: 'paid', pm: '銀行轉帳' },
  { d: '2025-03-04', ord: 'ORD-87011', it: '濾網 4 入組', amt: 4800, st: 'paid', pm: '信用卡 (****4421)' },
  { d: '2024-11-04', ord: 'ORD-82281', it: '高級訂閱 (年方案)', amt: 88800, st: 'paid', pm: '信用卡 (****8210)' },
  { d: '2024-08-15', ord: 'ORD-80012', it: 'AirSure Lite × 2 + 安裝', amt: 38400, st: 'paid', pm: '信用卡 (****8210)' },
]

export interface BOverviewJumpCard {
  ax: string
  t: string
  s: string
  n: string
  hi: { lbl: string; pct: number; n: number }
  act: string
  groups: Array<{ c: string; p: number }>
  kpi: string
  kpiL: string
}

export const B_OVERVIEW_JUMP_CARDS: BOverviewJumpCard[] = [
  {
    ax: '需求', t: '需求分群', s: '空品挑戰 × 居住類型', n: '8,628',
    hi: { lbl: '一般居家小家庭', pct: 48.9, n: 4218 },
    act: '5 群 · 主流為居家',
    groups: [
      { c: '#DC2626', p: 21.4 },
      { c: '#4F46E5', p: 48.9 },
      { c: '#0E7A66', p: 14.9 },
      { c: '#D97706', p: 7.2 },
      { c: '#9CA3AF', p: 7.6 },
    ],
    kpi: '客單 NT$ 38K', kpiL: '平均',
  },
  {
    ax: '消費力', t: '消費力分群', s: 'RFM 五分位 · LTV 分布', n: '8,628',
    hi: { lbl: 'P95 Champions', pct: 5.0, n: 432 },
    act: 'Top 5% 貢獻 38% ARR',
    groups: [
      { c: '#0E7A66', p: 5 },
      { c: '#16A085', p: 15 },
      { c: '#4F46E5', p: 25 },
      { c: '#EAB308', p: 25 },
      { c: '#DC2626', p: 30 },
    ],
    kpi: 'NT$ 480K+', kpiL: 'Champion LTV',
  },
  {
    ax: '依賴度', t: '服務依賴度', s: '服務頻次 + 顧問互動', n: '8,628',
    hi: { lbl: '中依賴 (主流)', pct: 49.4, n: 4264 },
    act: '高依賴 = 訂閱升級機會',
    groups: [
      { c: '#0E7A66', p: 24.7 },
      { c: '#4F46E5', p: 49.4 },
      { c: '#EAB308', p: 25.9 },
    ],
    kpi: '2.4×', kpiL: '高依賴 LTV 倍率',
  },
  {
    ax: '滿意度', t: '滿意度分群', s: 'NPS · 推薦/中立/貶損', n: '8,628',
    hi: { lbl: '推薦者 9–10', pct: 49.4, n: 4260 },
    act: 'NPS +42 · 行業均 +28',
    groups: [
      { c: '#16A34A', p: 49.4 },
      { c: '#EAB308', p: 29.4 },
      { c: '#DC2626', p: 6.8 },
      { c: '#9CA3AF', p: 14.4 },
    ],
    kpi: '+42', kpiL: 'NPS 分數',
  },
]

export interface BSegmentGroup {
  lbl: string
  n: number
  pct: number
  traits: string
  action: string
  c: string
}

export interface BSegment {
  title: string
  sub: string
  axis: string
  groups: BSegmentGroup[]
}

export const SEGMENTS_B: BSegment[] = [
  {
    title: '需求分群', sub: '空品挑戰 × 居住類型 · 影響產品推薦', axis: '需求',
    groups: [
      { lbl: '高空污 · 都會家庭', n: 1842, pct: 21.4, traits: '臺中/新北重點區 · 設備滿載', action: '推薦多機部署 + 高效濾網', c: 'var(--as-danger)' },
      { lbl: '一般 · 居家小家庭', n: 4218, pct: 48.9, traits: '主流客群 · 1–2 台', action: '常規服務 + 季度健康證書', c: '#4F46E5' },
      { lbl: '辦公 · 中小企業', n: 1284, pct: 14.9, traits: '需多機 · 高峰時段密集', action: 'B2B 方案 + 韌體統一管理', c: '#0E7A66' },
      { lbl: '醫療 · 機構', n: 624, pct: 7.2, traits: '高合規需求 · 24h 運轉', action: 'Pro 機型 + SLA 保證', c: '#D97706' },
      { lbl: '其他', n: 660, pct: 7.6, traits: '商業 / 教育 / 公共空間', action: '客製方案', c: 'var(--as-mute-2)' },
    ],
  },
  {
    title: '消費力分群 (RFM 五分位)', sub: 'Recency × Frequency × Monetary', axis: '消費力',
    groups: [
      { lbl: 'P95 高價值 (Champions)', n: 432, pct: 5.0, traits: '近期 + 高頻 + 高額 · LTV NT$ 480K+', action: 'VIP 顧問 + 推薦獎勵升級', c: '#0E7A66' },
      { lbl: 'P75–95 忠誠者', n: 1294, pct: 15.0, traits: '穩定貢獻 · LTV NT$ 180–480K', action: '保持參與 + 提早續約', c: '#16A085' },
      { lbl: 'P50–75 主流', n: 2156, pct: 25.0, traits: '一般消費力 · LTV NT$ 80–180K', action: '推升頻次 / 加購', c: '#4F46E5' },
      { lbl: 'P25–50 低活躍', n: 2156, pct: 25.0, traits: '消費距今久 · LTV < NT$ 80K', action: '喚醒任務 + 優惠回購', c: 'var(--as-warning)' },
      { lbl: '後 25% 流失邊緣', n: 2590, pct: 30.0, traits: '180 天無行為', action: '客服優先聯繫', c: 'var(--as-danger)' },
    ],
  },
  {
    title: '服務依賴度分群', sub: '服務頻次 + 顧問互動深度', axis: '依賴度',
    groups: [
      { lbl: '高依賴', n: 2128, pct: 24.7, traits: '每季 2+ 服務 · 顧問熟悉', action: '訂閱升級 + 自動配送', c: '#0E7A66' },
      { lbl: '中依賴', n: 4264, pct: 49.4, traits: '半年 1 服務 · 主流模式', action: '維持基本服務', c: '#4F46E5' },
      { lbl: '低依賴', n: 2236, pct: 25.9, traits: '一年 < 1 服務 · DIY 為主', action: '推送線上工具 + 提醒', c: 'var(--as-warning)' },
    ],
  },
  {
    title: '滿意度分群 (NPS)', sub: '推薦意願 0–10', axis: '滿意度',
    groups: [
      { lbl: '推薦者 9–10', n: 4260, pct: 49.4, traits: '主動分享證書 · 高 K-factor', action: '加入推薦獎勵計畫 (G 模組)', c: 'var(--as-success)' },
      { lbl: '中立 7–8', n: 2536, pct: 29.4, traits: '滿意但不會主動推薦', action: '提升個人化體驗', c: 'var(--as-warning)' },
      { lbl: '貶損者 0–6', n: 584, pct: 6.8, traits: '可能流失 · 客訴未結', action: '客服 24h 內聯繫', c: 'var(--as-danger)' },
      { lbl: '未評分', n: 1248, pct: 14.4, traits: '潛在客戶或新註冊', action: '邀請填寫', c: 'var(--as-mute-2)' },
    ],
  },
]

export interface BLifecycle {
  k: string
  n: number
  pct: number
  c: string
  sub: string
}

export const B_LIFECYCLE: BLifecycle[] = [
  { k: '活躍', n: 6420, pct: 75.4, c: 'var(--as-success)', sub: '90 天內有行為' },
  { k: '沉睡', n: 1284, pct: 15.1, c: 'var(--as-warning)', sub: '90–180 天無行為' },
  { k: '流失預警', n: 612, pct: 7.2, c: 'var(--as-danger)', sub: '180 天 + 風險 > 70' },
  { k: '已流失', n: 192, pct: 2.3, c: 'var(--as-mute-2)', sub: '> 180 天' },
]

export const B_MONTHS_12 = ['06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05']
export const B_NEW_JOIN = [186, 198, 224, 248, 268, 312, 286, 254, 278, 308, 326, 342]
export const B_CHURN = [88, 76, 92, 64, 58, 72, 96, 84, 68, 62, 56, 48]
