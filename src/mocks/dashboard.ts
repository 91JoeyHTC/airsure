/* AirSure 數據中台 — Dashboard mock data */

import type { PersonaId } from '../hooks/usePersona'

// ── Personas ──────────────────────────────────────────────────────────────────
export interface Persona {
  id: PersonaId
  label: string
  icon: string
  focus: string
}

export const PERSONAS: Persona[] = [
  { id: 'gm',  label: '總經理', icon: 'chart',    focus: '營收 / 整體' },
  { id: 'cs',  label: '顧問',   icon: 'pulse',    focus: '健康 / 客戶' },
  { id: 'svc', label: '客服',   icon: 'headset',  focus: '工單 / 設備' },
  { id: 'mk',  label: '行銷',   icon: 'bullhorn', focus: '會員 / 轉換' },
]

// ── KPI cards ─────────────────────────────────────────────────────────────────
export interface KPI {
  lbl: string
  val: string
  u: string
  delta: string
  dir: 'up' | 'dn' | 'flat'
  accent: 'green' | 'purple' | 'orange' | 'red'
  spark: number[]
}

export const KPIS_BY_PERSONA: Record<PersonaId, KPI[]> = {
  gm: [
    { lbl: '今日營收',   val: '847,200', u: 'NT$',    delta: '+12.4%',    dir: 'up',   accent: 'green',  spark: [3, 5, 4, 6, 7, 5, 8, 9, 7, 10] },
    { lbl: '訂閱續約率', val: '92.8',    u: '%',      delta: '+1.2%',     dir: 'up',   accent: 'green',  spark: [85, 86, 88, 87, 89, 90, 91, 92, 92, 93] },
    { lbl: '連網機器數量',val: '1,284',  u: '個',     delta: '+8',        dir: 'up',   accent: 'purple', spark: [1200, 1210, 1220, 1240, 1255, 1260, 1270, 1278, 1280, 1284] },
    { lbl: '需主動聯繫', val: '37',      u: '位會員', delta: '+5 待處理', dir: 'dn',   accent: 'red',    spark: [25, 28, 30, 29, 32, 33, 35, 34, 36, 37] },
  ],
  cs: [
    { lbl: '高風險用戶', val: '23',  u: '位',    delta: '+3',        dir: 'dn',   accent: 'red',    spark: [18, 19, 20, 21, 22, 22, 23, 22, 23, 23] },
    { lbl: '本月已諮詢', val: '156', u: '人次',  delta: '+18%',      dir: 'up',   accent: 'purple', spark: [4, 5, 5, 6, 7, 8, 8, 9, 10, 11] },
    { lbl: '健康證書發行',val: '482',u: '份',    delta: '+24',       dir: 'up',   accent: 'green',  spark: [400, 420, 430, 445, 455, 460, 465, 470, 478, 482] },
    { lbl: '需主動聯繫', val: '37',  u: '位會員',delta: '+5 待處理', dir: 'dn',   accent: 'red',    spark: [25, 28, 30, 29, 32, 33, 35, 34, 36, 37] },
  ],
  svc: [
    { lbl: '待處理工單', val: '42',   u: '張', delta: '−6',      dir: 'up',   accent: 'orange', spark: [55, 52, 50, 48, 46, 45, 44, 43, 42, 42] },
    { lbl: '設備離線',   val: '11',   u: '台', delta: '+2',      dir: 'dn',   accent: 'red',    spark: [7, 8, 8, 9, 10, 10, 11, 10, 11, 11] },
    { lbl: '濾網將屆期', val: '128',  u: '台', delta: '7 天內',  dir: 'flat', accent: 'orange', spark: [110, 112, 115, 118, 120, 122, 124, 126, 127, 128] },
    { lbl: 'SLA 達成率', val: '96.4', u: '%',  delta: '+0.8%',  dir: 'up',   accent: 'green',  spark: [93, 94, 94, 95, 95, 96, 96, 96, 96, 96] },
  ],
  mk: [
    { lbl: '本月新會員', val: '342',  u: '位', delta: '+22%',  dir: 'up', accent: 'green',  spark: [200, 220, 240, 260, 275, 290, 300, 315, 330, 342] },
    { lbl: '活動轉換率', val: '14.6', u: '%',  delta: '+2.1%', dir: 'up', accent: 'purple', spark: [10, 11, 11, 12, 12, 13, 13, 14, 14, 15] },
    { lbl: '推薦邀請',   val: '89',   u: '次', delta: '+12',   dir: 'up', accent: 'purple', spark: [60, 65, 68, 72, 75, 78, 82, 85, 87, 89] },
    { lbl: '需主動聯繫', val: '37',   u: '位會員', delta: '+5 待處理', dir: 'dn', accent: 'red', spark: [25, 28, 30, 29, 32, 33, 35, 34, 36, 37] },
  ],
}

// ── AI banner ─────────────────────────────────────────────────────────────────
export interface AIBanner {
  ttl: string
  msg: string
}

export const AI_BY_PERSONA: Record<PersonaId, AIBanner> = {
  gm:  { ttl: 'AI 對策建議 · 高層摘要',  msg: '今日營收 +12.4% 主因為訂閱續約活動，但 訂閱即將到期的高價值會員 共 23 位 預計在 14 天內到期且 尚未啟動續約流程。建議優先指派客服顧問主動聯繫，預估可挽回月經常性收入 NT$ 184,000。' },
  cs:  { ttl: 'AI 對策建議 · 顧問視角',  msg: '本日有 5 位會員 室內 PM2.5 連續 3 天超標 但設備運轉正常，可能為居住習慣或外部空污來源。建議啟動健康諮詢流程並推薦升級至 Plus 服務方案。' },
  svc: { ttl: 'AI 對策建議 · 客服視角',  msg: '臺中科技園區辦公室 #SH-2841 有 4 台設備 連續 48 小時離線，且該客戶昨日提交工單未指派。建議優先派工，避免影響續約意願。' },
  mk:  { ttl: 'AI 對策建議 · 行銷視角',  msg: '春季健康月活動 第三週 邀請轉換率 16.8%，高於前兩週平均 11.2%。建議延長活動至第四週並擴大至 銀級會員 族群，預估可新增 80–120 位活躍會員。' },
}

// ── Contact list ──────────────────────────────────────────────────────────────
export interface Contact {
  pip: 'high' | 'mid' | 'low'
  who: string
  cid: string
  why: string
  sla: string
  urgent: boolean
}

export const CONTACT_LIST: Contact[] = [
  { pip: 'high', who: '陳先生', cid: 'M-008412', why: '高級會員 · 連續 5 日 PM2.5 超標 且設備使用率 < 20%',   sla: '剩 6 小時', urgent: true  },
  { pip: 'high', who: '李女士', cid: 'M-007738', why: '訂閱 14 天內到期 · 已多次未開機',                      sla: '今日',      urgent: true  },
  { pip: 'mid',  who: '王太太', cid: 'M-009203', why: '濾網逾期 18 天 未更換',                                 sla: '24h',       urgent: false },
  { pip: 'mid',  who: '張先生', cid: 'M-005611', why: '健康諮詢預約逾期未回覆',                               sla: '48h',       urgent: false },
  { pip: 'mid',  who: '林小姐', cid: 'M-010055', why: '推薦邀請 3 次未成功 · 可主動關心',                     sla: '本週',      urgent: false },
]

// ── Field table ───────────────────────────────────────────────────────────────
export interface Field {
  nm: string
  id: string
  loc: string
  dev: string
  lamp: 'g' | 'y' | 'r'
  q: number
  qc: 'g' | 'y' | 'r'
  mem: string
}

export const FIELDS: Field[] = [
  { nm: '臺北信義居家', id: 'SH-0021', loc: '臺北市信義區', dev: '4 / 4',   lamp: 'g', q: 92, qc: 'g', mem: '陳先生 (高級)' },
  { nm: '新北板橋辦公', id: 'SH-1147', loc: '新北市板橋區', dev: '8 / 9',   lamp: 'y', q: 76, qc: 'y', mem: '李女士 (一般)' },
  { nm: '臺中科技園區', id: 'SH-2841', loc: '臺中市西屯區', dev: '6 / 10',  lamp: 'r', q: 48, qc: 'r', mem: '王太太 (高級)' },
  { nm: '高雄前鎮辦公', id: 'SH-3052', loc: '高雄市前鎮區', dev: '5 / 5',   lamp: 'g', q: 88, qc: 'g', mem: '張先生 (一般)' },
]

// ── Module map ────────────────────────────────────────────────────────────────
export interface ModuleCard {
  key: string
  icon: string
  nm: string
  num: string
  u: string
  stat?: string
  spark?: number[]
  route: string
  variant: 'ab' | 'cdefg' | 'h'
  numColor?: string
}

export const MODULE_MAP: ModuleCard[] = [
  {
    key: 'A', icon: 'home',     nm: '居家空氣場域',   num: '1,284', u: '場域 · 在線',
    stat: '11 離線 · 23 警示',
    spark: [6, 7, 5, 8, 7, 9, 8, 10, 9, 11, 10, 12],
    route: '/module-a', variant: 'ab',
  },
  {
    key: 'B', icon: 'users',    nm: '用戶 360° 視圖', num: '8,471', u: '會員',
    stat: '本月 +342 · 高風險 23',
    spark: [4, 5, 5, 6, 7, 6, 8, 9, 8, 10, 11, 12],
    route: '/module-b', variant: 'ab',
  },
  {
    key: 'C', icon: 'headset',  nm: '服務管理',       num: '42',    u: '工單',
    route: '/module-c', variant: 'cdefg',
  },
  {
    key: 'D', icon: 'box',      nm: '產品管理',       num: '12',    u: '系列',
    route: '/module-d', variant: 'cdefg',
  },
  {
    key: 'E', icon: 'star',     nm: '會員經營',       num: '37',    u: '待聯繫',
    route: '/module-e', variant: 'cdefg', numColor: 'var(--as-danger)',
  },
  {
    key: 'F', icon: 'chart',    nm: '營收分析',       num: '847K',  u: '今日',
    route: '/module-f', variant: 'cdefg',
  },
  {
    key: 'G', icon: 'bullhorn', nm: '行銷與健康證書', num: '3',     u: '活動進行中',
    route: '/module-g', variant: 'cdefg',
  },
  {
    key: 'H', icon: 'sparkles', nm: '營運決策中心',   num: '8',     u: '條建議 · 預估收益 NT$ 184K',
    spark: [3, 5, 4, 7, 6, 9, 8, 11, 10, 9, 12, 14],
    route: '/module-h', variant: 'h',
  },
]
