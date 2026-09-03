/* AirSure — Module A 場域清單的報告產製層
 *
 * 依《AIRCARE 報告產製 Dashboard 設計規格》(docs/ report/) §3 九態狀態機、§4 清單頁欄位建構。
 * 顆粒度:一客戶一列,設備為可展開子列(一設備 = 一份報告)。
 *
 * ⚠ 除了「揭露閘門」與「資料涵蓋天數(真實設備)」以外,本檔的九態、輪廓、寄發、
 *   上次/到期全部是示範用 overlay,不是中台資料。正式版由報告產出引擎回填
 *   (規格 §9:GET /reports/dashboard)。
 */
import {
  CATEGORIES,
  FIELDS_A_FULL,
  getFieldDetail,
  reportGateOf,
  REPORT_DISCLOSURE_MIN_SCORE,
  type CatId,
  type FieldRecord,
} from './module-a'
import { DEVICE_BY_FIELD_ID, deviceFieldId } from './devices'
import { ELIGIBLE_BY_CUSTOMER, ELIGIBLE_DEVICES, type EligibleDevice } from './eligible-customers'

/* ── 九態狀態機(規格 §3) ─────────────────────────────────────────── */
export type ReportState =
  | 'insufficient'  // 1 資料未達標
  | 'need-profile'  // 2 待補輪廓
  | 'ready'         // 3 可產製
  | 'internal'      // 4 內部版已產
  | 'review'        // 5 客戶版待審
  | 'approved'      // 6 已核准
  | 'sent'          // 7 已寄發
  | 'opened'        // 8 已開啟 / 互動
  | 'overdue'       // 9 逾期待更新

export interface ReportStateMeta {
  no: number
  label: string
  color: string
  /** 操作欄主按鈕文案;null = 不可動作 */
  action: string | null
  /** 主按鈕是否為主要樣式 */
  primary: boolean
}

export const REPORT_STATE_META: Record<ReportState, ReportStateMeta> = {
  insufficient: { no: 1, label: '資料未達標',   color: 'var(--as-danger)',  action: '未達門檻',   primary: false },
  'need-profile': { no: 2, label: '待補輪廓',   color: '#D97706',           action: '補輪廓',     primary: true  },
  ready:        { no: 3, label: '可產製',       color: 'var(--as-success)', action: '一鍵產製',   primary: true  },
  internal:     { no: 4, label: '內部版已產',   color: '#2F74B5',           action: '預覽內部版', primary: false },
  review:       { no: 5, label: '客戶版待審',   color: '#7C5CBF',           action: '核准',       primary: true  },
  approved:     { no: 6, label: '已核准',       color: '#2F9E6F',           action: '寄發',       primary: true  },
  sent:         { no: 7, label: '已寄發',       color: '#0D7FA8',           action: '查看寄發',   primary: false },
  opened:       { no: 8, label: '已開啟/互動',  color: '#C99A2E',           action: '安排跟進',   primary: false },
  overdue:      { no: 9, label: '逾期待更新',   color: 'var(--as-mute)',    action: '產新季報',   primary: true  },
}

export const REPORT_STATE_ORDER: ReportState[] = [
  'insufficient', 'need-profile', 'ready', 'internal', 'review', 'approved', 'sent', 'opened', 'overdue',
]

/* ── 客戶輪廓(規格 §4:決定客戶版痛點與 CTA) ─────────────────────
 * child / senior / pet / allergy / illness 一對一對應 SF「成員困擾」的五個選項;
 * general = 有填但判讀不出;kol 目前 SF 沒有對應選項,保留給示範與人工標記。 */
export type ProfileId = 'child' | 'senior' | 'pet' | 'allergy' | 'illness' | 'general' | 'kol'

export const PROFILE_META: Record<ProfileId, { label: string; color: string; bg: string }> = {
  child:   { label: '幼童/孕婦', color: '#2F74B5', bg: '#E4EFF7' },
  senior:  { label: '銀髮家庭', color: '#7C5CBF', bg: '#EFEAFA' },
  pet:     { label: '寵物家庭', color: '#E0862A', bg: '#FBEED9' },
  allergy: { label: '過敏家庭', color: '#D1495B', bg: '#FBE6E9' },
  illness: { label: '家人生病', color: '#0F766E', bg: '#CCFBF1' },
  general: { label: '一般家庭', color: 'var(--as-ink-2)', bg: 'var(--as-bg)' },
  kol:     { label: 'KOL',      color: '#C99A2E', bg: '#FDF3D9' },
}

/* ── 輪廓 ← Salesforce「成員困擾」欄位 ─────────────────────────────
 * 2026-08-13 決定:客戶輪廓不必人工重補,對應 SF Contact 的「成員困擾」。
 *
 *   欄位標籤  成員困擾
 *   API 名稱  Family_Bothered__c
 *   資料類型  選項清單(多重選擇)→ SF 回傳以分號分隔的字串,例「幼童;寵物」
 *
 * 選項清單(2026-08-13 由 Contact describe 取得,五個全部啟用):
 *   家有孕婦/家有新生兒/小孩 · 家人過敏 · 家人生病 · 家有長輩 · 家有寵物
 *   → 注意沒有「一般」也沒有 KOL 選項;沒勾任何項 = 空字串 = 待補輪廓。
 *
 * ⚠ 現況:中台 /api/member360 尚未回傳這個欄位(profile 只有性別/生日/年齡/
 *   縣市/區/地址/分區/顧問/下次定保),所以下面這支對應器目前拿不到輸入。
 *   中台把欄位吐出來後(見 plan 的端點規格),清單與識別卡會自動生效。 */
export const SF_PROFILE_FIELD = 'Family_Bothered__c'

/** 選項值 → 輪廓的精確對照(以 SF describe 的實際 picklist 值為準) */
export const CONCERN_OPTION_MAP: Record<string, ProfileId> = {
  '家有孕婦/家有新生兒/小孩': 'child',
  '家人過敏': 'allergy',
  '家人生病': 'illness',
  '家有長輩': 'senior',
  '家有寵物': 'pet',
}

/** 關鍵字後備:選項若日後新增/改名,不至於整個判成「一般」 */
const CONCERN_KEYWORDS: Array<{ id: ProfileId; words: string[] }> = [
  { id: 'child',   words: ['孕婦', '新生兒', '幼童', '小孩', '嬰', '孩童', '兒童'] },
  { id: 'senior',  words: ['長輩', '銀髮', '長者', '老人', '年長'] },
  { id: 'pet',     words: ['寵物', '毛小孩', '貓', '狗'] },
  { id: 'allergy', words: ['過敏', '氣喘', '鼻炎', '異位性', '呼吸道'] },
  { id: 'illness', words: ['生病', '病', '術後', '慢性'] },
  { id: 'kol',     words: ['KOL', '網紅', '意見領袖'] },
]

/** 客戶版報告只能有一個主痛點/CTA,多選時依這個順序取主輪廓(健康風險優先)。
 *  ⚠ 這個排序是我方假設,待行銷/CS 確認。 */
export const PROFILE_PRIORITY: ProfileId[] = ['allergy', 'illness', 'child', 'senior', 'pet', 'kol', 'general']

/** 多重選擇 → 輪廓陣列。SF 以分號分隔;先走精確對照,對不上才用關鍵字。 */
export function profilesFromConcern(concern: string | null | undefined): ProfileId[] {
  const raw = (concern ?? '').trim()
  if (!raw) return []
  const tokens = raw.split(/[;；,、]/).map((t) => t.trim()).filter(Boolean)
  const hit = new Set<ProfileId>()
  for (const t of tokens) {
    const exact = CONCERN_OPTION_MAP[t]
    if (exact) { hit.add(exact); continue }
    const m = CONCERN_KEYWORDS.find(({ words }) => words.some((w) => t.includes(w)))
    if (m) hit.add(m.id)
  }
  if (!hit.size) return ['general']            // 有填但判讀不出,仍算「輪廓已知」
  return PROFILE_PRIORITY.filter((p) => hit.has(p))
}

/** 主輪廓(決定客戶版痛點與 CTA);沒填 → null */
export function primaryProfile(profiles: ProfileId[]): ProfileId | null {
  return profiles[0] ?? null
}

/* ── 寄發狀態(規格 §7) ──────────────────────────────────────────── */
export type SendState = 'none' | 'line' | 'email' | 'opened'

export const SEND_META: Record<SendState, { label: string; color: string }> = {
  none:   { label: '未寄',         color: 'var(--as-mute)' },
  line:   { label: '已寄 LINE',    color: '#0D7FA8' },
  email:  { label: '已寄 Email',   color: '#0D7FA8' },
  opened: { label: '已開啟(LINE)', color: '#C99A2E' },
}

/* ── 對外分群(規格 §2:對外只揭露金/銀/銅,風險軸僅內部用) ─────── */
export type TierKey = 'gold' | 'silver' | 'bronze' | 'risk'

export const TIER_DOT: Record<TierKey, string> = {
  gold: '#C99A2E', silver: '#9AA7AB', bronze: '#B9793F', risk: 'var(--as-danger)',
}

/** 七分群 → 對外揭露等級(v2 §3.5)。④⑤⑥ 是內部風險軸,對外一律以銅級揭露;
 *  ⑦乾燥同樣不直接揭露,但它不是風險,對外以銅級呈現、內部標「乾燥」。 */
export function tierOfCat(cat: CatId): { key: TierKey; label: string; internal: string } {
  const meta = CATEGORIES.find((c) => c.id === cat)!
  const key: TierKey = cat === '1' ? 'gold' : cat === '2' ? 'silver' : cat === '3' || cat === '7' ? 'bronze' : 'risk'
  return {
    key,
    label: key === 'risk' || cat === '7' ? '銅級空氣' : meta.customer,
    internal: `${meta.id} ${meta.code}`,
  }
}

/* ── 資料列 ───────────────────────────────────────────────────────── */
export interface ReportDeviceRow {
  /** 對外設備代號(遮蔽格式,不顯示 MAC) */
  code: string
  /** 安裝位置;真實設備沒有位置資料,顯示「主機」或「第 N 台」 */
  loc: string
  model: string
  /** 訂單號(內部辨識實體設備用;真實設備才有) */
  orderNo: string | null
  /** 場域詳情的 id;沒有設備分析報告時為 null(該列不可點進詳情) */
  fieldId: string | null
  /** 分群;沒有報告就沒有分群 */
  cat: CatId | null
  /** 期間內有效感測天數 */
  sensorDays: number
  /** 期間內有效狀態天數 */
  statusDays: number
  state: ReportState
  /** 待補內容;空字串 = 無缺口 */
  blocked: string
  lastIssued: string | null
  dueDate: string | null
  send: SendState
}

export interface ReportCustomerRow {
  customerId: string
  /** mock 姓名;真實客戶不落地姓名,這裡等於客戶編號,由中台即時解析 */
  name: string
  /** 場域名 + 地址,作為副資訊 */
  fieldNm: string
  addr: string
  spaceType: string
  fieldId: string | null
  isMember: boolean
  /** 示範資料(非 AIRCARE 合格清單上的真實客戶) */
  isDemo: boolean
  /** 輪廓(SF「成員困擾」為多重選擇,故為陣列);空陣列 = 待補輪廓 */
  profiles: ProfileId[]
  devices: ReportDeviceRow[]
  /** 全部設備同狀態時為該狀態;不同則為 null(清單顯示「展開看各機」) */
  rollupState: ReportState | null
}

/* ── 姓名遮蔽 ─────────────────────────────────────────────────────
 * 規格 §2 的「○家」是**對外報告**的規則;內部後台以辨識效率優先,顯示全名
 * (2026-08-13 決定)。這個開關留著,要一鍵切回遮蔽版時改 true 即可。
 *
 * ⚠ 真要當隱私邊界,遮蔽必須在中台做(前端拿到全名再遮只是化妝,
 *   姓名仍在瀏覽器記憶體與 Network response 裡)。 */
export const MASK_CUSTOMER_NAME = false

export function maskName(name: string): string {
  if (!MASK_CUSTOMER_NAME) return name
  if (/^C\d+$/.test(name)) return name          // 真實設備列本來就只有客戶編號
  if (name.length <= 1) return name
  if (name.length === 2) return `${name[0]}○`
  return `${name[0]}○${name.slice(2)}`
}

/* ── 設備位置字串池(示範用;真實設備用報告的型號) ─────────────── */
const LOC_POOL: Record<string, string[]> = {
  居家: ['客廳', '主臥', '書房', '小孩房', '長輩房', '餐廳'],
  辦公: ['大廳', '會議室', '開放辦公區', '主管室', '茶水間', '業務部', '研發區', '倉儲區', '休息室'],
  醫療: ['候診區', '診間 1', '診間 2', '處置室', '檢驗室', '藥局', '恢復室', '行政區'],
  商業: ['用餐區', '吧台', '包廂', '廚房', '入口'],
}

const MODEL_BY_TYPE: Record<string, string> = {
  居家: 'CS 系列一體機', 辦公: 'AirSure Pro 500', 醫療: 'AirSure Pro 500', 商業: 'AirSure Lite',
}

/* ── 示範 overlay ─────────────────────────────────────────────────
 * 只描述「資料達標、輪廓齊、可揭露」之後的流程狀態(③～⑨)。
 * ①②④ 由下方 resolveState() 依實際資料判定,overlay 不能覆寫。 */
interface DeviceOverlay {
  cat?: CatId
  state?: ReportState
  blocked?: string
  lastIssued?: string | null
  dueDate?: string | null
  send?: SendState
}

interface CustomerOverlay {
  profile: ProfileId | null
  /** 感測資料累積天數(門檻 90);未填 = 90 */
  dataDays?: number
  /** dataDays < 90 時的預估達標日 */
  eta?: string
  state?: ReportState
  blocked?: string
  lastIssued?: string | null
  dueDate?: string | null
  send?: SendState
  /** 逐台覆寫(示範多設備展開) */
  devices?: DeviceOverlay[]
}

const OVERLAY: Record<string, CustomerOverlay> = {
  /* 多設備展開示範:四台狀態各異,對應 mockup 的「陳○琳」 */
  C202105001: {
    profile: 'senior',
    lastIssued: '2026/05', dueDate: '08/15 到期',
    devices: [
      { cat: '2', state: 'opened',  send: 'opened' },
      { cat: '3', state: 'review',  blocked: '濕度敘事需複核', send: 'none' },
      { cat: '1', state: 'ready',   lastIssued: null, dueDate: '首次', send: 'none' },
      { cat: '2', state: 'approved', send: 'none' },
    ],
  },
  C202003042: { profile: 'general', state: 'sent', send: 'line', lastIssued: '2026/06', dueDate: '09/12 到期' },
  C201000272: { profile: 'allergy', lastIssued: '2026/04', dueDate: '07/20 到期' },
  C202206018: { profile: 'general', state: 'approved', lastIssued: '2026/06', dueDate: '09/05 到期' },
  C201912033: {
    profile: 'child', state: 'overdue', blocked: '距上次 96 天,建議出新季報',
    lastIssued: '2025/11', dueDate: '已逾期', send: 'opened',
  },
  C202109054: { profile: 'general', lastIssued: '2026/03', dueDate: '06/28 到期' },
  C202304076: { profile: null, lastIssued: null, dueDate: '首次' },
  C202008123: { profile: 'general', lastIssued: null, dueDate: '首次' },
  C202105099: { profile: 'pet', dataDays: 52, eta: '預估 09/20', lastIssued: null, dueDate: null },
}

const DEFAULT_OVERLAY: CustomerOverlay = { profile: null, lastIssued: null, dueDate: '首次' }

/** 示範列沿用的 90 天門檻。真實列不用它 —— 合格與否以 AIRCARE 合格清單為準。 */
export const REPORT_DATA_THRESHOLD_DAYS = 90

/* ── 狀態判定(示範列) ────────────────────────────────────────────
 * 優先序(越前面越優先),讓清單狀態與場域詳情的「產出客戶端報告」永遠同源:
 *   ① 天數不足 → 資料未達標
 *   ② 揭露閘門 unverified(分數來源本身有缺陷) → 資料未達標
 *   ③ 揭露閘門 blocked(指數未達門檻) → 內部版已產(僅內部版)
 *   ④ 缺客戶輪廓 → 待補輪廓
 *   ⑤ 其餘採 overlay 的流程狀態,預設可產製
 */
function resolveState(
  f: FieldRecord,
  dataDays: number,
  profile: ProfileId | null,
  ov: CustomerOverlay,
  dev: DeviceOverlay,
): { state: ReportState; blocked: string } {
  if (dataDays < REPORT_DATA_THRESHOLD_DAYS) {
    return {
      state: 'insufficient',
      blocked: `尚差 ${REPORT_DATA_THRESHOLD_DAYS - dataDays} 天感測資料`,
    }
  }
  const gate = reportGateOf(getFieldDetail(f.id))
  if (gate.state === 'unverified') return { state: 'insufficient', blocked: gate.reason }
  if (gate.state === 'blocked') {
    return {
      state: 'internal',
      blocked: `指數 ${getFieldDetail(f.id).airScore.total} 未達揭露門檻 ${REPORT_DISCLOSURE_MIN_SCORE} · 僅出內部版`,
    }
  }
  if (!profile) return { state: 'need-profile', blocked: '缺客戶輪廓 → 影響痛點/CTA' }
  const state = dev.state ?? ov.state ?? 'ready'
  return { state, blocked: dev.blocked ?? ov.blocked ?? '' }
}

function locOf(spaceType: string, i: number): string {
  const pool = LOC_POOL[spaceType] ?? LOC_POOL['居家']
  const base = pool[i % pool.length]
  const round = Math.floor(i / pool.length)
  return round === 0 ? base : `${base} ${round + 1}`
}

/* ── ① 真實列:AIRCARE 合格客戶清單(69 位 / 72 台) ────────────────
 * 合格判定不在前端做 —— 出現在 ELIGIBLE_DEVICES 就是已通過。因此這裡沒有
 * 「天數 < 90 → 資料未達標」那條規則,只保留兩件真的能在前端判的事:
 *   · 有設備分析報告的(目前 3 台)→ 沿用揭露閘門(濕度分數異常 / 指數未達門檻)
 *   · 缺客戶輪廓 → ② 待補輪廓(Salesforce 沒有輪廓欄位,所以真實客戶目前全部落這)
 * 姓名不落地,name 先放客戶編號,由 hooks/useMember360 即時向中台換。 */
function buildRealRow(customerNo: string, devs: EligibleDevice[]): ReportCustomerRow {
  const head = devs[0]
  const devices: ReportDeviceRow[] = devs.map((d, i) => {
    const fid = deviceFieldId(d.mac)
    const hasReport = !!DEVICE_BY_FIELD_ID[fid]
    let state: ReportState = 'ready'
    let blocked = ''

    if (hasReport) {
      const detail = getFieldDetail(fid)
      const gate = reportGateOf(detail)
      if (gate.state === 'unverified') { state = 'insufficient'; blocked = gate.reason }
      else if (gate.state === 'blocked') {
        state = 'internal'
        blocked = `指數 ${detail.airScore.total} 未達揭露門檻 ${REPORT_DISCLOSURE_MIN_SCORE} · 僅出內部版`
      }
    }
    /* 輪廓對應 SF「成員困擾」,但中台還沒吐這個欄位 → 目前一律待補。
     * 中台開放後改由 profileFromConcern() 判定,這裡就只剩真的沒填的客戶。 */
    if (state === 'ready') { state = 'need-profile'; blocked = '輪廓待接 SF「成員困擾」欄位' }

    return {
      code: `C..${customerNo.slice(-2)}-${String.fromCharCode(65 + i)}`,
      loc: devs.length > 1 ? `第 ${i + 1} 台` : '主機',
      model: d.model,
      orderNo: d.orderNo,
      fieldId: hasReport ? fid : null,
      cat: hasReport ? getFieldDetail(fid).cat : null,
      sensorDays: d.sensorValidDays,
      statusDays: d.statusValidDays,
      state,
      blocked,
      lastIssued: null,
      dueDate: '首次',
      send: 'none',
    }
  })

  const states = new Set(devices.map((d) => d.state))
  return {
    customerId: customerNo,
    name: customerNo,                    // 姓名不落地,由中台即時解析
    fieldNm: `${head.city}${head.area}`,
    addr: head.road,
    spaceType: '居家',                    // CS101 為家用機;CSV 與 SF 都沒有場域型態欄位
    fieldId: devices.find((d) => d.fieldId)?.fieldId ?? null,
    isMember: false,                     // 會員等級要看 SF,清單不預判
    isDemo: false,
    profiles: [],                        // 待中台開放 Family_Bothered__c
    devices,
    rollupState: states.size === 1 ? devices[0].state : null,
  }
}

/* ── ② 示範列:原本的 9 個虛構場域(保留,標示為示範) ───────────── */
function buildDemoRow(f: FieldRecord): ReportCustomerRow {
  const ov = OVERLAY[f.customerId] ?? DEFAULT_OVERLAY
  const total = Math.max(1, parseInt(f.dev.split('/')[1] || '1', 10))
  const dataDays = ov.dataDays ?? REPORT_DATA_THRESHOLD_DAYS

  const devices: ReportDeviceRow[] = Array.from({ length: total }, (_, i) => {
    const dev = ov.devices?.[i] ?? {}
    const { state, blocked } = resolveState(f, dataDays, ov.profile, ov, dev)
    const lastIssued = dev.lastIssued !== undefined ? dev.lastIssued : ov.lastIssued ?? null
    const dueDate = dev.dueDate !== undefined ? dev.dueDate : ov.dueDate ?? null
    return {
      /* 對外遮蔽代號:客戶編號末兩碼 + 機序,不顯示 MAC(規格 §2) */
      code: `C..${f.customerId.slice(-2)}-${String.fromCharCode(65 + i)}`,
      loc: locOf(f.type, i),
      model: MODEL_BY_TYPE[f.type] || 'AirSure Pro 500',
      orderNo: null,
      fieldId: f.id,
      cat: dev.cat ?? f.cat,
      sensorDays: dataDays,
      statusDays: dataDays,
      state,
      blocked,
      lastIssued,
      dueDate: state === 'insufficient' && ov.eta ? ov.eta : dueDate,
      send: dev.send ?? ov.send ?? 'none',
    }
  })

  const states = new Set(devices.map((d) => d.state))
  return {
    customerId: f.customerId,
    name: maskName(f.customerName),
    fieldNm: f.nm,
    addr: f.addr,
    spaceType: f.type,
    fieldId: f.id,
    isMember: f.tier === 'g',
    isDemo: true,
    profiles: ov.profile ? [ov.profile] : [],
    devices,
    rollupState: states.size === 1 ? devices[0].state : null,
  }
}

/* 真實列在前、示範列在後。示範列扣掉 3 台真實設備(它們已在合格清單裡)。 */
const DEMO_FIELDS = FIELDS_A_FULL.filter((f) => !DEVICE_BY_FIELD_ID[f.id])

export const REPORT_ROWS: ReportCustomerRow[] = [
  ...Object.entries(ELIGIBLE_BY_CUSTOMER).map(([no, devs]) => buildRealRow(no, devs)),
  ...DEMO_FIELDS.map(buildDemoRow),
]

/* ── 中台回來的輪廓套進列上 ────────────────────────────────────────
 * 清單的九態是在模組載入時算好的靜態值,那時還沒有 Salesforce 資料。
 * 中台開放 Family_Bothered__c 後,元件拿到「成員困擾」就呼叫這支,把因為
 * 「缺輪廓」而卡在 ② 的設備放行到 ③ 可產製。其他狀態(資料未達標、僅內部版、
 * 已寄發…)不受影響 —— 那些跟輪廓無關。 */
export function applyLiveProfiles(row: ReportCustomerRow, profiles: ProfileId[]): ReportCustomerRow {
  if (!profiles.length || row.profiles.length) return row
  const devices = row.devices.map((d) =>
    d.state === 'need-profile' ? { ...d, state: 'ready' as ReportState, blocked: '' } : d,
  )
  const states = new Set(devices.map((d) => d.state))
  return { ...row, profiles, devices, rollupState: states.size === 1 ? devices[0].state : null }
}

/* ── 母體規模(與輪廓無關,永遠是定值) ───────────────────────────── */
const REAL_ROWS = REPORT_ROWS.filter((r) => !r.isDemo)

export const REPORT_TOTALS = {
  devices: REPORT_ROWS.flatMap((r) => r.devices).length,
  customers: REPORT_ROWS.length,
  /** 真實(AIRCARE 合格清單)的分子 */
  realCustomers: REAL_ROWS.length,
  realDevices: ELIGIBLE_DEVICES.length,
  /** 真實設備裡已有設備分析報告(因此才有分群/指數)的台數 */
  withReport: REAL_ROWS.flatMap((r) => r.devices).filter((d) => d.fieldId).length,
}

/** 要向中台解析的客戶編號(真實列;示範列刻意不查,見 AFieldList 註解) */
export const REAL_CUSTOMER_CODES: string[] = REAL_ROWS.map((r) => r.customerId)

/* ── KPI 四格(規格 §4) ────────────────────────────────────────────
 * 每格都拆「真實 / 示範」—— 清單同時有 AIRCARE 合格清單的真實客戶與 9 筆示範,
 * 只給一個總數會讓人把虛構的寄發數當成營運實績。
 *
 * ⚠ 必須吃「已套用 SF 輪廓的列」而不是 REPORT_ROWS ——
 *   輪廓要等中台回來才放行(applyLiveProfiles),用靜態列算會少算可產製、
 *   多算待補輪廓,與表格上的燈號對不起來(2026-08-13 修)。 */
export interface KpiSplit { real: number; demo: number; total: number }

function countDevices(rows: ReportCustomerRow[], states: ReportState[]): number {
  return rows.reduce((n, r) => n + r.devices.filter((d) => states.includes(d.state)).length, 0)
}

export function computeKpi(rows: ReportCustomerRow[]) {
  const real = rows.filter((r) => !r.isDemo)
  const demo = rows.filter((r) => r.isDemo)
  const split = (...states: ReportState[]): KpiSplit => {
    const r = countDevices(real, states)
    const d = countDevices(demo, states)
    return { real: r, demo: d, total: r + d }
  }
  return {
    ready: split('ready'),
    sent: split('sent', 'opened'),
    needProfile: split('need-profile'),
    overdue: split('overdue'),
  }
}

/* ── 狀態篩選 chip(規格 §4 清單頁) ─────────────────────────────── */
export type ReportFilterKey = 'all' | 'ready' | 'need-profile' | 'insufficient' | 'overdue'

/** 該客戶是否有任一台設備落在指定狀態(清單以客戶為列,狀態以設備為準) */
export function matchesFilter(row: ReportCustomerRow, k: ReportFilterKey): boolean {
  if (k === 'all') return true
  return row.devices.some((d) => d.state === k)
}

const FILTER_LABELS: Array<{ k: ReportFilterKey; label: string }> = [
  { k: 'all',          label: '全部' },
  { k: 'ready',        label: '可產製' },
  { k: 'need-profile', label: '待補輪廓' },
  { k: 'insufficient', label: '資料未達標' },
  { k: 'overdue',      label: '逾期待更新' },
]

/** chip 的數字一律是「客戶數」,與清單列數一致(KPI 四格才是設備/報告數)。
 *  同樣要吃已套用 SF 輪廓的列,否則會與表格燈號不一致。 */
export function computeFilters(rows: ReportCustomerRow[]): Array<{ k: ReportFilterKey; label: string; n: number }> {
  return FILTER_LABELS.map(({ k, label }) => ({ k, label, n: rows.filter((r) => matchesFilter(r, k)).length }))
}
