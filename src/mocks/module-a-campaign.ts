/* Module A · 名單成效(行銷名單成效管理)
 *
 * 依簡報第十屏:一個行銷方案下,名單依寄發頻率分週報/月報/季報,每一批各自追
 * 寄發、報告內 CTA 環圈點擊、服務跟進轉換三段成效。
 * Plan:docs/module-a-list-performance-plan.md
 *
 * 母體用 FIELDS_A_POP(1,284 場域),與族群分析同源 —— 名單成效的「週報 N 戶」必須
 * 能跟族群卡的戶數對帳(週報 = ④+⑤+⑥),吃不同母體就會兩個 tab 各說各話。
 * 場域清單那份合格清單是「執行層」(誰已經可以產報告),不是規劃層的名單母體。
 *
 * ⚠ 除了「名單母體」與「分群」以外,本檔全部是示範 overlay,沒有資料源:
 *   寄發/開啟/CTA/跟進都是固定 seed 推出來的,正式版由報告產出引擎與 SF 回填
 *   (見 plan 項目 3)。UI 必須標示,不得當成營運實績。
 */
import { CATEGORIES, FIELDS_A_POP, isDemoField, type CatId, type FieldRecord } from './module-a'
import { VIZ_SERIES, VIZ_MUTED } from './module-a-overview'

/* ── 型別 ─────────────────────────────────────────────────────────── */

export type Cadence = 'weekly' | 'monthly' | 'quarterly'
export type CtaId = 'inspect' | 'filter' | 'dehumid' | 'upgrade' | 'maintain'
export type FollowUpState = 'none' | 'contacted' | 'scheduled' | 'done'

/* 2026-09-08 決策 1(docs/dispatch-data-model-spec.md §1):
 * 週報/月報是「另一種 report_type」,但內容與 CTA 尚未定義 ——
 * 所以目前全名單一律以季報寄發,週/月只保留「規劃中」的預分派結果,不給成效。
 * 把成效掛在不存在的 report_type 上就是編造。內容定案後才把 planned 拿掉。 */
export const CADENCE_META: { k: Cadence; label: string; sub: string; color: string; bg: string; planned: boolean }[] = [
  { k: 'weekly',    label: '週報', sub: '風險三群 · 密集跟進',   color: '#C2410C', bg: '#FFEDD5', planned: true },
  { k: 'monthly',   label: '月報', sub: '銅級／乾燥 · 月度節奏', color: '#B45309', bg: '#FEF3C7', planned: true },
  { k: 'quarterly', label: '季報', sub: '目前唯一的 report_type', color: '#9F1239', bg: '#FFE4E6', planned: false },
]

/** 目前實際寄發的頻率。決策 1:只有季報存在。 */
export const ACTIVE_CADENCE: Cadence = 'quarterly'

/** 未來的預分派(頻率由分群推出),週/月報內容定案後才會生效 */
const CADENCE_OF_CAT: Record<CatId, Cadence> = {
  '4': 'weekly', '5': 'weekly', '6': 'weekly',
  '3': 'monthly', '7': 'monthly',
  '1': 'quarterly', '2': 'quarterly',
}

export const CTA_META: { k: CtaId; label: string; sub: string; color: string }[] = [
  { k: 'inspect',  label: '預約空氣檢測', sub: '到府量測 · 報告首要 CTA', color: VIZ_SERIES[0] },
  { k: 'filter',   label: '更換濾網',     sub: '耗材訂購 / 自動配送',      color: VIZ_SERIES[1] },
  { k: 'dehumid',  label: '加購除濕',     sub: 'CS 系列除濕主打',          color: VIZ_SERIES[2] },
  { k: 'upgrade',  label: '升級機型',     sub: '高坪數 / 多機場域',        color: VIZ_SERIES[4] },
  { k: 'maintain', label: '預約定期保養', sub: '既有服務續約',             color: VIZ_SERIES[5] },
]

export const FOLLOW_META: Record<FollowUpState, { label: string; sub: string; color: string }> = {
  none:      { label: '未跟進',  sub: '點了 CTA 但尚無服務單', color: VIZ_MUTED },
  contacted: { label: '已聯繫',  sub: '顧問已致電',            color: VIZ_SERIES[4] },
  scheduled: { label: '已排程',  sub: '已開派工單',            color: VIZ_SERIES[1] },
  done:      { label: '已完成',  sub: '維修完成單結案',        color: VIZ_SERIES[0] },
}

export interface CampaignMeta {
  id: string
  name: string
  period: string
  status: 'active' | 'closed'
  /** 這個方案只收哪些族群;null = 全收 */
  cohorts: CatId[] | null
  note: string
}

/** 名單一列 = 一個場域在某方案下的一筆寄發(決策 2:一戶一次,內含多份設備報告) */
export interface ListMember {
  fieldId: string
  nm: string
  customerId: string
  cat: CatId
  /** 非真實設備的示範列 */
  isDemo: boolean
  /** 未來的預分派頻率(週/月報上線後生效) */
  plannedCadence: Cadence
  /** 決策 3:未達報告資料門檻的仍留在名單內,只是寄不出去 */
  eligible: boolean
  /* ↓ 以下全是示範 overlay,無資料源 */
  sent: boolean
  delivered: boolean
  opened: boolean
  cta: CtaId | null
  follow: FollowUpState
}

/* ── 方案主檔 ─────────────────────────────────────────────────────── */

export const CAMPAIGNS: CampaignMeta[] = [
  {
    id: 'c202610', name: '2026.10 噴噴方案', period: '2026/10/01–10/31', status: 'active',
    cohorts: null, note: '全族群 · 依風險度派週/月/季報',
  },
  {
    /* 乾燥也是濕度問題(太乾,搭配加濕建議),所以收 ⑦ —— 方案名用「濕度改善」
     * 而不是「除濕」,否則收乾燥群會自相矛盾。①②③⑤ 不在名單內,故無季報批次。 */
    id: 'c202607', name: '2026.07 濕度改善方案', period: '2026/07/01–07/31', status: 'closed',
    cohorts: ['4', '6', '7'], note: '只收濕度相關族群(含乾燥) · 無季報批次',
  },
]

/* ── 名單建構 ─────────────────────────────────────────────────────── */

/** 由 id + 方案 + 用途推一個 0–1 的決定性亂數,重整頁面數字不變 */
function seeded(...parts: string[]): number {
  let h = 2166136261
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) h = Math.imul(h ^ p.charCodeAt(i), 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

/* 各頻率的轉換率。週報寄得密、開啟率最低(寄發疲勞),季報最高。
 * 這組數字是示範假設,不是實測 —— 接上埋點後整組刪掉。 */
const RATES: Record<Cadence, { delivered: number; opened: number; cta: number; follow: number }> = {
  weekly:    { delivered: 0.96, opened: 0.42, cta: 0.26, follow: 0.55 },
  monthly:   { delivered: 0.97, opened: 0.58, cta: 0.31, follow: 0.48 },
  quarterly: { delivered: 0.98, opened: 0.66, cta: 0.22, follow: 0.40 },
}

/* CTA 的權重依分群走 —— 濕度族群點「加購除濕」,耗材到期點「更換濾網」。
 * 報告內的 CTA 環圈本來就是照客戶痛點排的,亂數平均分配會失真。 */
const CTA_WEIGHT: Record<CatId, [CtaId, number][]> = {
  '1': [['maintain', 0.45], ['inspect', 0.30], ['filter', 0.25]],
  '2': [['filter', 0.40], ['maintain', 0.35], ['inspect', 0.25]],
  '3': [['filter', 0.40], ['inspect', 0.30], ['upgrade', 0.30]],
  '4': [['dehumid', 0.55], ['inspect', 0.25], ['maintain', 0.20]],
  '5': [['filter', 0.40], ['upgrade', 0.35], ['inspect', 0.25]],
  '6': [['upgrade', 0.40], ['dehumid', 0.35], ['inspect', 0.25]],
  '7': [['inspect', 0.50], ['maintain', 0.30], ['filter', 0.20]],
}

const FOLLOW_STEPS: FollowUpState[] = ['contacted', 'scheduled', 'done']

function pickWeighted<T>(r: number, w: [T, number][]): T {
  let acc = 0
  for (const [v, p] of w) { acc += p; if (r < acc) return v }
  return w[w.length - 1][0]
}

function buildMembers(c: CampaignMeta): ListMember[] {
  const out: ListMember[] = []
  for (const f of FIELDS_A_POP as FieldRecord[]) {
    const cat = f.cat
    if (c.cohorts && !c.cohorts.includes(cat)) continue
    const rate = RATES[ACTIVE_CADENCE]
    const id = f.id
    /* 決策 3:未達門檻的留在名單內。約 15% 未達標 —— 這個比例是示範假設,
     * 正式版由中台的 campaign_member.eligible 回填。 */
    const eligible = seeded(c.id, id, 'gate') < 0.85
    /* 進行中的方案還沒寄完;已結束的方案全部寄出。未達門檻的一律寄不出去。 */
    const sent = eligible && (c.status === 'closed' || seeded(c.id, id, 'sent') < 0.82)
    const delivered = sent && seeded(c.id, id, 'deliver') < rate.delivered
    const opened = delivered && seeded(c.id, id, 'open') < rate.opened
    const clicked = opened && seeded(c.id, id, 'cta') < rate.cta
    const cta = clicked ? pickWeighted(seeded(c.id, id, 'which'), CTA_WEIGHT[cat]) : null
    /* 跟進只在點了 CTA 之後才有意義 —— 沒點就沒有跟進的由頭 */
    let follow: FollowUpState = 'none'
    if (cta && seeded(c.id, id, 'follow') < rate.follow) {
      follow = FOLLOW_STEPS[Math.min(2, Math.floor(seeded(c.id, id, 'stage') * 3))]
    }
    out.push({
      fieldId: id, nm: f.nm, customerId: f.customerId, cat, isDemo: isDemoField(f),
      plannedCadence: CADENCE_OF_CAT[cat], eligible, sent, delivered, opened, cta, follow,
    })
  }
  return out
}

export const CAMPAIGN_MEMBERS: Record<string, ListMember[]> =
  Object.fromEntries(CAMPAIGNS.map((c) => [c.id, buildMembers(c)]))

/* ── 彙總 ─────────────────────────────────────────────────────────── */

/* 這一層刻意不拆「真實/示範」逐格顯示:成效事件全是 overlay,真實那幾戶的
 * 開啟/點擊同樣沒有埋點資料源,拆了會讓人以為其中一半是實績。
 * 母體規模與其中的真實場域數由 listSource() 在頁面層標一次。 */

export function listSource(rows: ListMember[]): { fields: number; real: number } {
  return { fields: rows.length, real: rows.filter((m) => !m.isDemo).length }
}

export interface CadenceSummary {
  k: Cadence
  label: string
  sub: string
  color: string
  bg: string
  /** true = 週/月報,report_type 尚未定義,只有規劃戶數沒有成效(決策 1) */
  planned: boolean
  /** 名單戶數。季報 = 全名單(目前全部走季報);週/月 = 未來的預分派規模 */
  size: number
  sent: number
  opened: number
  clicked: number
  /** 已成立服務跟進 */
  followed: number
}

export function cadenceSummaries(rows: ListMember[]): CadenceSummary[] {
  return CADENCE_META.map((m) => {
    /* 規劃中的批次只給預分派規模,成效一律 0 —— 那個 report_type 還不存在 */
    if (m.planned) {
      return { ...m, size: rows.filter((x) => x.plannedCadence === m.k).length, sent: 0, opened: 0, clicked: 0, followed: 0 }
    }
    return {
      ...m,
      size: rows.length,
      sent: rows.filter((x) => x.sent).length,
      opened: rows.filter((x) => x.opened).length,
      clicked: rows.filter((x) => x.cta != null).length,
      followed: rows.filter((x) => x.follow !== 'none').length,
    }
  })
}

/* ── 寄發漏斗(需求 1) ─────────────────────────────────────────────── */

export interface FunnelStep {
  k: string
  label: string
  sub: string
  n: number
  /** 佔名單的百分比 */
  pct: number
  /** 相對前一階段的留存率;第一階為 null */
  stepPct: number | null
  color: string
}

export function computeFunnel(rows: ListMember[]): FunnelStep[] {
  const defs: { k: string; label: string; sub: string; hit: (m: ListMember) => boolean }[] = [
    { k: 'list',      label: '名單',         sub: '含未達門檻(決策 3)',   hit: () => true },
    { k: 'eligible',  label: '可產製',       sub: '資料已達 90 天門檻',    hit: (m) => m.eligible },
    { k: 'sent',      label: '已寄發',       sub: 'LINE / Email 送出',    hit: (m) => m.sent },
    { k: 'delivered', label: '已送達',       sub: '未退信 / 未封鎖',      hit: (m) => m.delivered },
    { k: 'opened',    label: '已開啟',       sub: '報告連結被點開',        hit: (m) => m.opened },
    { k: 'cta',       label: '點 CTA',       sub: '報告內環圈被點擊',      hit: (m) => m.cta != null },
    { k: 'follow',    label: '服務跟進成立', sub: '已聯繫 / 排程 / 完成',  hit: (m) => m.follow !== 'none' },
  ]
  const total = rows.length
  return defs.map((d, i) => {
    const n = rows.filter(d.hit).length
    const prev = i === 0 ? null : rows.filter(defs[i - 1].hit).length
    return {
      k: d.k, label: d.label, sub: d.sub, n,
      pct: total === 0 ? 0 : Math.round((n / total) * 1000) / 10,
      stepPct: prev == null ? null : prev === 0 ? 0 : Math.round((n / prev) * 1000) / 10,
      color: VIZ_SERIES[Math.min(i, VIZ_SERIES.length - 1)],
    }
  })
}

/* ── CTA 環圈成效(需求 2) ─────────────────────────────────────────── */

export interface CtaPerf {
  k: CtaId
  label: string
  sub: string
  color: string
  /** 點擊數 */
  clicks: number
  /** 佔所有點擊的百分比 */
  pct: number
  /** 決策 8:點擊數 ÷ 打開報告數 */
  rateOfOpens: number
  /** 點了這個 CTA 之後成立服務跟進的比率 */
  followPct: number
}

export function computeCtaPerf(rows: ListMember[]): CtaPerf[] {
  const clicked = rows.filter((m) => m.cta != null)
  const opens = rows.filter((m) => m.opened).length
  return CTA_META.map((m) => {
    const hit = clicked.filter((x) => x.cta === m.k)
    const followed = hit.filter((x) => x.follow !== 'none').length
    return {
      ...m,
      clicks: hit.length,
      pct: clicked.length === 0 ? 0 : Math.round((hit.length / clicked.length) * 1000) / 10,
      rateOfOpens: opens === 0 ? 0 : Math.round((hit.length / opens) * 1000) / 10,
      followPct: hit.length === 0 ? 0 : Math.round((followed / hit.length) * 1000) / 10,
    }
  }).sort((a, b) => b.clicks - a.clicks)
}

/** 決策 8:CTA 互動率 = 點擊互動數 ÷ 打開報告次數 */
export function ctaInteractionRate(rows: ListMember[]): { clicks: number; opens: number; pct: number } {
  const clicks = rows.filter((m) => m.cta != null).length
  const opens = rows.filter((m) => m.opened).length
  return { clicks, opens, pct: opens === 0 ? 0 : Math.round((clicks / opens) * 1000) / 10 }
}

/* ── 服務跟進成效(需求 3) ─────────────────────────────────────────── */

export interface FollowPerf {
  k: FollowUpState
  label: string
  sub: string
  color: string
  n: number
  pct: number
}

/** 母體是「點過 CTA 的人」—— 沒點 CTA 的沒有跟進的由頭,放進來會稀釋轉換率 */
export function computeFollowPerf(rows: ListMember[]): FollowPerf[] {
  const clicked = rows.filter((m) => m.cta != null)
  const order: FollowUpState[] = ['done', 'scheduled', 'contacted', 'none']
  return order.map((k) => {
    const n = clicked.filter((x) => x.follow === k).length
    return {
      k, ...FOLLOW_META[k], n,
      pct: clicked.length === 0 ? 0 : Math.round((n / clicked.length) * 1000) / 10,
    }
  })
}

/* ── 名單的族群組成(給「僅看某族群」的 chip 用) ───────────────────── */

export function cohortsInList(rows: ListMember[]): { cat: CatId; label: string; color: string; n: number }[] {
  return CATEGORIES
    .map((c) => ({ cat: c.id, label: c.code, color: c.color, n: rows.filter((m) => m.cat === c.id).length }))
    .filter((x) => x.n > 0)
}
