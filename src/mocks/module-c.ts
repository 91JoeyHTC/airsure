/* AirSure 數據中台 — Module C (服務管理) mock data */

// ── Kanban tickets ────────────────────────────────────────────────────────────
export interface SlaInfo {
  mins: number
  cls: 'r' | 'y' | 'g'
}

export interface Ticket {
  id: string
  nm: string
  addr: string
  pri: 'p1' | 'p2' | 'p3'
  prog: number
  ag: string
  age: string
  sla: SlaInfo | null
}

export interface KanbanCol {
  k: 'new' | 'assigned' | 'doing' | 'done'
  h: string
  n: number
  tickets: Ticket[]
}

export const KANBAN_COLS: KanbanCol[] = [
  {
    k: 'new', h: '新進工單', n: 8,
    tickets: [
      { id: 'T-22841', nm: '4 台設備離線 — 連續 48h',     addr: '臺中 SH-2841', pri: 'p1', prog: 0,  ag: 'AI',   age: '12 分鐘前', sla: { mins: 25,  cls: 'r' } },
      { id: 'T-22839', nm: '濾網更換預約',                 addr: '臺北 SH-0021', pri: 'p3', prog: 0,  ag: '會員', age: '38 分鐘前', sla: { mins: 220, cls: 'g' } },
      { id: 'T-22835', nm: 'App 配對失敗',                 addr: '高雄 SH-3052', pri: 'p2', prog: 0,  ag: '會員', age: '1 小時前',  sla: { mins: 95,  cls: 'y' } },
    ],
  },
  {
    k: 'assigned', h: '已指派', n: 14,
    tickets: [
      { id: 'T-22820', nm: 'CO₂ 感測器異常',              addr: '新北 SH-1147', pri: 'p2', prog: 25, ag: '林',   age: '3 小時前',  sla: { mins: 60,  cls: 'y' } },
      { id: 'T-22812', nm: '安裝諮詢 · 新場域',           addr: '桃園 SH-4119', pri: 'p3', prog: 40, ag: '王',   age: '昨日',      sla: { mins: 480, cls: 'g' } },
      { id: 'T-22808', nm: '濾網 3 台到期',               addr: '臺中 SH-2841', pri: 'p2', prog: 20, ag: '林',   age: '昨日',      sla: { mins: 30,  cls: 'r' } },
    ],
  },
  {
    k: 'doing', h: '處理中', n: 12,
    tickets: [
      { id: 'T-22791', nm: '到府保養 · 高級會員',         addr: '臺北 SH-0021', pri: 'p2', prog: 65, ag: '王',   age: '今日 10:30', sla: { mins: 150, cls: 'g' } },
      { id: 'T-22788', nm: '韌體升級派送',                addr: '5 個場域',     pri: 'p3', prog: 80, ag: '系統', age: '今日 09:00', sla: { mins: 360, cls: 'g' } },
    ],
  },
  {
    k: 'done', h: '今日完成', n: 8,
    tickets: [
      { id: 'T-22770', nm: '濾網更換 (大安辦公室)',       addr: '陳俊宏',       pri: 'p3', prog: 100, ag: '林',  age: '完成', sla: null },
      { id: 'T-22765', nm: 'TVOC 警示複檢',              addr: '李女士',       pri: 'p2', prog: 100, ag: '王',  age: '完成', sla: null },
    ],
  },
]

// ── SLA buckets ───────────────────────────────────────────────────────────────
export interface SlaBucket {
  lbl: string
  sub: string
  num: number
  tag: string
  cls: 'r' | 'y' | 'g' | ''
}

export const SLA_BUCKETS: SlaBucket[] = [
  { lbl: '已逾期',    sub: '需重排',   num: 3,  tag: 'P1·SLA', cls: 'r' },
  { lbl: '< 1 小時', sub: '緊迫',     num: 5,  tag: 'P1',     cls: 'r' },
  { lbl: '1–4 小時', sub: '今日處理', num: 12, tag: 'P2',     cls: 'y' },
  { lbl: '4–24 小時',sub: '本日內',   num: 14, tag: 'P2/3',   cls: 'g' },
  { lbl: '1–3 日',   sub: '計劃中',   num: 6,  tag: 'P3',     cls: '' },
  { lbl: '> 3 日',   sub: '長期',     num: 2,  tag: 'P3',     cls: '' },
]

// ── Tech load ─────────────────────────────────────────────────────────────────
export interface TechLoad {
  av: string
  nm: string
  role: string
  load: number
  cls: 'r' | 'y' | ''
  n: string
  st: 'busy' | 'off' | ''
}

export const TECH_LOAD: TechLoad[] = [
  { av: '林', nm: '林晉宇', role: '高級技術員 · 北區', load: 92, cls: 'r', n: '7 / 7', st: 'busy' },
  { av: '王', nm: '王雅琳', role: '客服顧問 · 北區',   load: 74, cls: 'y', n: '5 / 7', st: '' },
  { av: '張', nm: '張承翰', role: '技術員 · 中區',     load: 56, cls: '', n: '4 / 7',  st: '' },
  { av: '陳', nm: '陳奕廷', role: '技術員 · 南區',     load: 38, cls: '', n: '3 / 8',  st: '' },
  { av: '黃', nm: '黃慧君', role: '高級顧問 · 全區',   load: 18, cls: '', n: '1 / 6',  st: 'off' },
]

// ── List tab rows ─────────────────────────────────────────────────────────────
export interface ListRow {
  id: string
  pri: 'p1' | 'p2' | 'p3'
  t: string
  site: string
  cat: string
  age: string
  sla: string
  slaCls: 'r' | 'y' | 'g'
  ag: string
  st: string
  stCls: 'r' | 'y' | 'g'
}

export const LIST_ROWS: ListRow[] = [
  { id: 'T-22841', pri: 'p1', t: '4 台設備離線 — 連續 48h',        site: '臺中科技園區 SH-2841', cat: '設備', age: '12 分前',   sla: '已逾期 25 分',    slaCls: 'r', ag: '林', st: '新進',  stCls: 'r' },
  { id: 'T-22838', pri: 'p1', t: '高級會員緊急投訴 · TVOC 持續異常', site: '臺北信義 SH-0021',    cat: '客訴', age: '38 分前',   sla: '剩 22 分',       slaCls: 'r', ag: '王', st: '處理中', stCls: 'y' },
  { id: 'T-22835', pri: 'p2', t: 'App 配對失敗 (iOS 17.4)',          site: '高雄前鎮 SH-3052',    cat: '技術', age: '1 小時前',  sla: '剩 1 小時 35 分', slaCls: 'y', ag: '張', st: '已指派', stCls: 'y' },
  { id: 'T-22830', pri: 'p2', t: 'CO₂ 感測器異常複測',               site: '新北板橋 SH-1147',    cat: '維護', age: '3 小時前',  sla: '剩 1 小時',      slaCls: 'y', ag: '林', st: '處理中', stCls: 'y' },
  { id: 'T-22822', pri: 'p2', t: '濾網 3 台到期 · 高級會員',          site: '臺中科技園區 SH-2841', cat: '耗材', age: '昨日',      sla: '剩 6 小時',      slaCls: 'g', ag: '林', st: '已指派', stCls: 'y' },
  { id: 'T-22820', pri: 'p3', t: 'CO₂ 感測器校正 · 6 個月例行',       site: '新北板橋 SH-1147',    cat: '維護', age: '3 小時前',  sla: '剩 5 天',        slaCls: 'g', ag: '林', st: '已指派', stCls: 'y' },
  { id: 'T-22812', pri: 'p3', t: '安裝諮詢 · 新場域開通',             site: '桃園慈文 SH-4119',    cat: '諮詢', age: '昨日',      sla: '剩 8 小時',      slaCls: 'g', ag: '王', st: '已指派', stCls: 'y' },
  { id: 'T-22791', pri: 'p2', t: '到府保養 · 高級會員季度',            site: '臺北信義 SH-0021',    cat: '到府', age: '今 10:30', sla: '剩 2 小時 30 分', slaCls: 'g', ag: '王', st: '處理中', stCls: 'y' },
  { id: 'T-22788', pri: 'p3', t: '韌體升級派送 v2.4.1',               site: '5 個場域批次',        cat: '韌體', age: '今 09:00', sla: '剩 6 小時',      slaCls: 'g', ag: '系統', st: '處理中', stCls: 'y' },
  { id: 'T-22770', pri: 'p3', t: '濾網更換完成',                       site: '臺北大安 SH-0033',    cat: '耗材', age: '完成',      sla: '達標',           slaCls: 'g', ag: '林', st: '完成',  stCls: 'g' },
  { id: 'T-22765', pri: 'p2', t: 'TVOC 警示複檢完成',                  site: '李文芳 M-007738',    cat: '健康', age: '完成',      sla: '達標',           slaCls: 'g', ag: '王', st: '完成',  stCls: 'g' },
]

// ── SLA analysis ──────────────────────────────────────────────────────────────
export interface OverdueReason {
  nm: string
  n: number
  p: number
  c: 'r' | 'y' | ''
}

export const OVERDUE_REASONS: OverdueReason[] = [
  { nm: '技術人員不足 (突發離線批量)', n: 11, p: 39.3, c: 'r' },
  { nm: '客戶失聯 / 改期',             n: 7,  p: 25.0, c: 'r' },
  { nm: '零件缺貨 (濾網 / 感測器)',    n: 5,  p: 17.9, c: 'y' },
  { nm: '路途遠 / 偏遠場域',           n: 3,  p: 10.7, c: '' },
  { nm: '系統升級停機',                 n: 2,  p: 7.1,  c: '' },
]

export interface SlaLevel {
  nm: string
  v: number
  clr: string
}

export const SLA_LEVELS: SlaLevel[] = [
  { nm: 'P1 緊急 (4h)',      v: 98,  clr: '#16A34A' },
  { nm: 'P2 一般 (24h)',     v: 96,  clr: '#0E7A66' },
  { nm: 'P3 低 (72h)',       v: 99,  clr: '#4F46E5' },
  { nm: '到府服務 (預約日)', v: 92,  clr: '#D97706' },
  { nm: '遠端支援 (1h)',     v: 100, clr: '#7C3AED' },
  { nm: '批次升級 (排程)',   v: 97,  clr: '#16A085' },
]

export interface HotIssue {
  cat: string
  sub: string
  n: number
}

export const HOT_ISSUES: HotIssue[] = [
  { cat: '其他', sub: '22.E003(馬達異常)',             n: 8 },
  { cat: '其他', sub: '17.大身上蓋破裂',              n: 7 },
  { cat: '其他', sub: '2.揮手不開(壓板有動)2代',      n: 6 },
  { cat: '其他', sub: '5.自動開蓋',                   n: 4 },
  { cat: '其他', sub: '23.E004(風扇異常)',             n: 3 },
  { cat: '其他', sub: '26.E007(溫溼度偵測異常)',       n: 2 },
  { cat: '其他', sub: '27.E008(偵測到無內鍋)',         n: 2 },
  { cat: '其他', sub: '11.風扇異音',                  n: 2 },
]

// ── IoT cards ─────────────────────────────────────────────────────────────────
export interface IoTCard {
  id: string
  device: string
  site: string
  trigger: string
  urgency: 'high' | 'mid' | 'low'
  since: string
  status: 'pending' | 'dispatched' | 'resolved'
}

export const IOT_CARDS: IoTCard[] = [
  { id: 'IOT-001', device: 'KleenAir Pro (AC-PRO-2841)', site: '臺中科技園區 SH-2841', trigger: '4 台設備連續 48 小時離線，場域 PM2.5 無法監測', urgency: 'high', since: '12 分鐘前', status: 'pending' },
  { id: 'IOT-002', device: 'KleenAir Lite (AC-LITE-7821)', site: '陽明山度假 SH-0055',  trigger: 'TVOC 連續 7 天 3 次警示，超標 2.1×',          urgency: 'high', since: '3 小時前',  status: 'dispatched' },
  { id: 'IOT-003', device: 'KleenAir Pro (AC-PRO-3344)',  site: '大安辦公室 SH-0033',   trigger: 'CO₂ 感測器靈敏度異常，讀值偏低 18%',         urgency: 'mid',  since: '昨日',       status: 'pending' },
  { id: 'IOT-004', device: '3 台設備 (多台)',             site: '臺中科技園區 SH-2841', trigger: '濾網逾期 18 天未更換，效能下降 34%',          urgency: 'mid',  since: '今日',       status: 'pending' },
  { id: 'IOT-005', device: 'KleenAir Pro (AC-PRO-5023)', site: '臺南安平診所 SH-6001',  trigger: 'PM2.5 連續 5 天 > 35 μg/m³ · 健康風險',      urgency: 'low',  since: '本週',       status: 'resolved' },
]

// ── Technician detail ─────────────────────────────────────────────────────────
export interface TechDetail {
  av: string
  nm: string
  role: string
  area: string
  skill: string[]
  on: number
  done: number
  hours: string
  sat: number
  st: 'busy' | 'off' | ''
  cls: 'r' | 'y' | ''
  load: number
}

export const TECH_DETAIL: TechDetail[] = [
  { av: '林', nm: '林晉宇', role: '高級技術員', area: '北區', skill: ['設備', '濾網', '安裝'],       on: 7, done: 5, hours: '7.4', sat: 4.9, st: 'busy', cls: 'r', load: 92 },
  { av: '王', nm: '王雅琳', role: '客服顧問',   area: '北區', skill: ['客訴', '到府', '健康諮詢'],   on: 5, done: 3, hours: '6.2', sat: 4.8, st: '',     cls: 'y', load: 74 },
  { av: '張', nm: '張承翰', role: '技術員',     area: '中區', skill: ['設備', '感測器'],             on: 4, done: 2, hours: '5.0', sat: 4.7, st: '',     cls: '',  load: 56 },
  { av: '陳', nm: '陳奕廷', role: '技術員',     area: '南區', skill: ['安裝', '韌體'],               on: 3, done: 1, hours: '4.2', sat: 4.6, st: '',     cls: '',  load: 38 },
  { av: '黃', nm: '黃慧君', role: '高級顧問',   area: '全區', skill: ['VIP', '健康諮詢', '訪談'],   on: 1, done: 0, hours: '2.4', sat: 5.0, st: 'off',  cls: '',  load: 18 },
]
