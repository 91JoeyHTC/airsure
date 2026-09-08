/* Module A · 場域清單(第一層 tab)
 *
 * 依《AIRCARE 報告產製 Dashboard 設計規格》§4 清單頁重做:
 * 一客戶一列、多設備可展開;KPI 四格 + 狀態 chip + 九態燈號 + 待補內容 + 寄發 + 操作。
 * 資料與狀態判定在 mocks/module-a-report.ts,本檔只負責版面。
 */
import { useState, Fragment } from 'react'
import { Icon } from '../../components/ui/Icon'
import { batchAttrs } from '../../components/ui/BatchAttrs'
import { useMembersByCodes, type MemberHit } from '../../hooks/useMember360'
import { CATEGORIES, type CatId } from '../../mocks/module-a'
import {
  REPORT_ROWS,
  REPORT_TOTALS,
  REAL_CUSTOMER_CODES,
  computeKpi,
  computeFilters,
  REPORT_STATE_META,
  REPORT_STATE_ORDER,
  REPORT_DATA_THRESHOLD_DAYS,
  PROFILE_META,
  profilesFromConcern,
  applyLiveProfiles,
  SEND_META,
  TIER_DOT,
  tierOfCat,
  matchesFilter,
  pickRowsOf,
  type ReportFilterKey,
  type ReportCustomerRow,
  type ReportDeviceRow,
  type ReportState,
  type KpiSplit,
  type PickRow,
} from '../../mocks/module-a-report'

/* KPI 的真實/示範分子。清單同時有 AIRCARE 合格清單的真實客戶與 9 筆示範,
 * 只給總數會讓人把虛構的寄發數當成營運實績。 */
function KpiSource({ k }: { k: KpiSplit }) {
  return (
    <span style={{ fontSize: 10, color: 'var(--as-mute)' }}>
      真實 {k.real} · 示範 {k.demo}
    </span>
  )
}

/** 每頁列數。姓名要逐筆向中台解析,分頁越大等越久 —— 中台加了批次端點後可再放大。 */
const PAGE_SIZE = 20

/* 九態燈號 */
function StateLamp({ state }: { state: ReportState }) {
  const m = REPORT_STATE_META[state]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: m.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flex: 'none' }} />
      {m.label}
    </span>
  )
}

/* 對外分群(金/銀/銅)+ 內部七分群代號。
 * cat 為 null = 這台還沒有設備分析報告,分群與指數都無從得知。 */
function TierCell({ cat }: { cat: CatId | null }) {
  if (!cat) return <span className="mute" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>待報告產出</span>
  const t = tierOfCat(cat)
  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--as-ink)' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: TIER_DOT[t.key], flex: 'none' }} />
        {t.label}
      </span>
      <div style={{ fontSize: 10, color: 'var(--as-mute)', marginTop: 1 }}>{t.internal}</div>
    </div>
  )
}

function ActionButton({ state }: { state: ReportState }) {
  const m = REPORT_STATE_META[state]
  if (!m.action) return <span className="mute">—</span>
  return (
    <button
      className={`rowbtn${m.primary ? ' on' : ''}`}
      /* 2026-09-08:本版 AirSure 是檢視台,產製與寄發走人工流程(見
         docs/aircare-0918-報告寄送計畫.md §9)。按鈕保留以呈現九態的動作語意,
         但一律停用 —— 點了沒反應會讓人以為系統壞掉。 */
      disabled
      title="待接入:本版為檢視台,產製與寄發為人工流程"
      style={{
        fontSize: 11, padding: '4px 9px', width: 'auto', height: 'auto', whiteSpace: 'nowrap',
        opacity: 0.45, cursor: 'not-allowed',
      }}
    >
      {m.action}
    </button>
  )
}

/* 資料涵蓋:真實列顯示合格清單給的有效天數(合格與否已由清單本身認定,
 * 不再拿 90 天去判);示範列沿用 90 天門檻示意。 */
function DataCoverage({ sensor, status, isDemo }: { sensor: number; status: number; isDemo: boolean }) {
  if (isDemo) {
    const short = sensor < REPORT_DATA_THRESHOLD_DAYS
    return (
      <span className="mono" style={{ fontSize: 11, color: short ? 'var(--as-danger)' : 'var(--as-ink-2)', whiteSpace: 'nowrap' }}>
        {sensor} / {REPORT_DATA_THRESHOLD_DAYS} 天
      </span>
    )
  }
  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>感測 {sensor} 天</span>
      <div className="mono mute" style={{ fontSize: 10 }}>狀態 {status} 天</div>
    </div>
  )
}

/* 進場域詳情的箭頭。沒有設備分析報告的設備不可點 —— 點進去只會看到別台的曲線。 */
function DetailArrow({ fieldId, onSelect }: { fieldId: string | null; onSelect: (fid: string) => void }) {
  if (!fieldId) {
    return (
      <button className="rowbtn" disabled title="尚無設備分析報告,無法開啟場域詳情" style={{ opacity: 0.4 }}>
        <Icon name="arrow" size={12} />
      </button>
    )
  }
  return (
    <button className="rowbtn" onClick={(e) => { e.stopPropagation(); onSelect(fieldId) }}>
      <Icon name="arrow" size={12} />
    </button>
  )
}

/* ── 設備子列 ─────────────────────────────────────────── */
function DeviceRow({ d, isDemo, onSelect }: { d: ReportDeviceRow; isDemo: boolean; onSelect: (fid: string) => void }) {
  return (
    <tr
      style={{ cursor: d.fieldId ? 'pointer' : 'default', background: 'var(--as-bg)' }}
      onClick={() => d.fieldId && onSelect(d.fieldId)}
    >
      <td onClick={(e) => e.stopPropagation()}></td>
      <td style={{ paddingLeft: 30 }}>
        <span className="mono mute">└ {d.loc}</span>
      </td>
      <td className="mono mute" style={{ fontSize: 10 }}>
        {d.model}
        {d.orderNo && <div style={{ fontSize: 9 }}>訂單 {d.orderNo}</div>}
      </td>
      <td className="mono mute">{d.code}</td>
      <td><TierCell cat={d.cat} /></td>
      <td><DataCoverage sensor={d.sensorDays} status={d.statusDays} isDemo={isDemo} /></td>
      <td><StateLamp state={d.state} /></td>
      <td style={{ fontSize: 11, color: d.blocked ? 'var(--as-danger)' : 'var(--as-mute)', maxWidth: 190 }}>
        {d.blocked || '—'}
      </td>
      <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
        {d.lastIssued ?? '—'}
        {d.dueDate && <div className="mono mute" style={{ fontSize: 10 }}>{d.dueDate}</div>}
      </td>
      <td style={{ fontSize: 11, fontWeight: 600, color: SEND_META[d.send].color, whiteSpace: 'nowrap' }}>
        {SEND_META[d.send].label}
      </td>
      <td><ActionButton state={d.state} /></td>
      <td><DetailArrow fieldId={d.fieldId} onSelect={onSelect} /></td>
    </tr>
  )
}

/* ── 客戶列 ───────────────────────────────────────────── */
function CustomerRow({
  row, expanded, onToggle, onSelect, live, resolving, picked, onPick,
}: {
  /** 已套用 SF 輪廓的列(放行動作在 AFieldList 統一做,KPI/chip 才會與燈號同源) */
  row: ReportCustomerRow
  expanded: boolean
  onToggle: () => void
  onSelect: (fid: string) => void
  /** 由客戶編號向中台即時解析到的 Salesforce 會員(查不到為 null) */
  live: MemberHit | null
  resolving: boolean
  /** 挑名單:是否已選入寄送名單 */
  picked: boolean
  onPick: () => void
}) {
  const multi = row.devices.length > 1
  const first = row.devices[0]
  const uniformCat = row.devices.every((d) => d.cat === first.cat)
  const uniformSend = row.devices.every((d) => d.send === first.send)

  /* 姓名優先序:中台即時 > mock 名 > 客戶編號。
   * 真實設備的 mock 名就是客戶編號本身(個資不落地),此時只有中台查得到人。 */
  const mockName = row.name === row.customerId ? null : row.name
  const name = live?.name ?? mockName
  const isLive = !!live?.name

  return (
    <>
      <tr
        style={{ cursor: row.fieldId ? 'pointer' : 'default' }}
        onClick={() => row.fieldId && onSelect(row.fieldId)}
      >
        <td onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={picked} onChange={onPick} title="加入寄送名單" />
        </td>
        <td>
          <div className={name ? 'dt-nm' : 'dt-nm mono'} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {name ?? row.customerId}
            {isLive && (
              <span className="pill g" style={{ fontSize: 9, fontWeight: 600 }}>SF 即時</span>
            )}
            {row.isDemo && (
              <span className="pill" style={{ fontSize: 9, fontWeight: 600 }}>示範</span>
            )}
            {row.isMember && (
              <span className="pill" style={{ background: '#FEF3C7', borderColor: '#FCD34D', color: '#B45309', fontWeight: 600, fontSize: 9 }}>★ 高級</span>
            )}
          </div>
          <div className="mono mute" style={{ fontSize: 10, marginTop: 1 }}>
            {name
              ? row.customerId
              : resolving ? '查詢 Salesforce 中…' : '此編號在 Salesforce 查無對應客戶'}
          </div>
          <div className="dt-sub" style={{ fontSize: 10, color: 'var(--as-mute)' }}>{row.fieldNm} · {row.addr}</div>
        </td>
        <td>
          {row.profiles.length === 0
            ? <span className="pill r">待補輪廓</span>
            : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 150 }}>
                {row.profiles.map((p, i) => {
                  const meta = PROFILE_META[p]
                  return (
                    <span
                      key={p}
                      className="pill"
                      title={i === 0 ? '主輪廓 · 決定客戶版痛點與 CTA' : undefined}
                      style={{
                        background: meta.bg, borderColor: meta.color + '40', color: meta.color,
                        fontWeight: i === 0 ? 700 : 500, fontSize: 10,
                      }}
                    >
                      {meta.label}
                    </span>
                  )
                })}
              </div>
            )}
        </td>
        <td onClick={(e) => { if (multi) { e.stopPropagation(); onToggle() } }}>
          <span style={{ whiteSpace: 'nowrap', fontWeight: multi ? 600 : 400, color: multi ? 'var(--as-ink)' : 'var(--as-ink-2)' }}>
            {row.devices.length} 台
            {multi && <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--as-mute)' }}>{expanded ? '▴' : '▾'}</span>}
          </span>
        </td>
        <td>{uniformCat ? <TierCell cat={first.cat} /> : <span className="mute" style={{ fontSize: 11 }}>分機</span>}</td>
        <td><DataCoverage sensor={first.sensorDays} status={first.statusDays} isDemo={row.isDemo} /></td>
        <td>
          {row.rollupState
            ? <StateLamp state={row.rollupState} />
            : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#2F74B5', whiteSpace: 'nowrap' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2F74B5', flex: 'none' }} />
                展開看各機
              </span>
            )}
        </td>
        <td style={{ fontSize: 11, color: row.rollupState && first.blocked ? 'var(--as-danger)' : 'var(--as-mute)', maxWidth: 190 }}>
          {row.rollupState ? (first.blocked || '—') : '—'}
        </td>
        <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
          {first.lastIssued ?? '—'}
          {first.dueDate && <div className="mono mute" style={{ fontSize: 10 }}>{first.dueDate}</div>}
        </td>
        <td style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', color: uniformSend ? SEND_META[first.send].color : 'var(--as-mute)' }}>
          {uniformSend ? SEND_META[first.send].label : '分機'}
        </td>
        <td>
          {row.rollupState
            ? <ActionButton state={row.rollupState} />
            : (
              <button
                className="rowbtn"
                style={{ fontSize: 11, padding: '4px 9px', width: 'auto', height: 'auto', whiteSpace: 'nowrap' }}
                onClick={(e) => { e.stopPropagation(); onToggle() }}
              >
                {expanded ? '收合' : '展開'}
              </button>
            )}
        </td>
        <td><DetailArrow fieldId={row.fieldId} onSelect={onSelect} /></td>
      </tr>
      {expanded && row.devices.map((d) => (
        <DeviceRow key={d.code} d={d} isDemo={row.isDemo} onSelect={onSelect} />
      ))}
    </>
  )
}

/* ── 挑名單匯出(2026-09-18 首批寄送)──────────────────────────────
 * 選取以「客戶」為單位(決策 2:一戶一次寄發,內含多份設備報告),
 * 匯出時展開成一台設備一列交給報告產生器。 */

const CSV_COLS: { k: keyof PickRow; label: string }[] = [
  { k: 'customerId', label: '客戶編號' },
  { k: 'mac', label: '設備MAC' },
  { k: 'orderNo', label: '訂單號' },
  { k: 'model', label: '機型' },
  { k: 'city', label: '縣市' },
  { k: 'area', label: '行政區' },
  { k: 'road', label: '路名' },
  { k: 'sensorDays', label: '有效感測天數' },
  { k: 'hasReport', label: '已有報告' },
  { k: 'isDemo', label: '示範列' },
  { k: 'state', label: '報告狀態' },
]

function downloadPickCsv(picks: PickRow[]) {
  const cell = (v: unknown) => {
    const t = typeof v === 'boolean' ? (v ? 'Y' : 'N') : String(v ?? '')
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
  }
  const lines = [
    CSV_COLS.map((c) => c.label).join(','),
    ...picks.map((p) => CSV_COLS.map((c) => cell(p[c.k])).join(',')),
  ]
  /* BOM 讓 Excel 正確辨識 UTF-8,否則中文欄位會變亂碼 */
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  a.href = url
  a.download = `aircare-寄送名單-${stamp}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ── 場域清單 ─────────────────────────────────────────── */
export function AFieldList({
  onSelect,
  catFilter,
  onClearCatFilter,
}: {
  onSelect: (fid: string) => void
  /** 七分群篩選(由設備總覽的建議聯繫客戶卡片點擊帶入) */
  catFilter?: CatId | null
  onClearCatFilter?: () => void
}) {
  const [filter, setFilter] = useState<ReportFilterKey>('all')
  const [expanded, setExpanded] = useState<string[]>([])
  const [page, setPage] = useState(0)
  /* 挑名單:選取以客戶為單位,跨頁保留 */
  const [picked, setPicked] = useState<string[]>([])

  /* 向中台解析「全部真實列」而不是只解析當頁 —— KPI 四格與狀態 chip 是整份母體的
   * 數字,只解析當頁會讓它們少算可產製、多算待補輪廓,與表格上的燈號對不起來。
   * 佇列依傳入順序、同時 4 筆,所以第 1 頁的姓名仍最先出現;結果進 session 快取,
   * 翻頁不重打。示範列刻意不查:它們的編號有些在 Salesforce 真的存在但屬於別人
   * (例:C201000272),查了會把真人姓名貼到虛構的場域資料上。 */
  const { byCode, resolving, resolved } = useMembersByCodes(REAL_CUSTOMER_CODES)

  /* 輪廓來自 SF「成員困擾」。中台回來後,原本卡在「② 待補輪廓」的設備要放行到
   * 「③ 可產製」——靜態算好的九態不知道 SF 有資料。這個放行在這裡統一做一次,
   * 表格、KPI、chip 全部吃同一份 liveRows,不會各算各的。 */
  const liveRows = REPORT_ROWS.map((r) =>
    applyLiveProfiles(r, profilesFromConcern(byCode[r.customerId]?.family_bothered)),
  )
  const kpi = computeKpi(liveRows)
  const filters = computeFilters(liveRows)

  const catMeta = catFilter ? CATEGORIES.find((c) => c.id === catFilter)! : null
  const rows = liveRows
    .filter((r) => matchesFilter(r, filter))
    .filter((r) => (catMeta ? r.devices.some((d) => d.cat === catMeta.id) : true))

  /* 分頁是真的 —— 一頁 20 列,避免一次渲染整份母體。 */
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const pageRows = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const toggle = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  /* 挑名單 —— 全選作用在「目前篩選結果」而不是當頁,否則翻頁會以為選丟了 */
  const pickedSet = new Set(picked)
  const filteredIds = rows.map((r) => r.customerId)
  const allPicked = filteredIds.length > 0 && filteredIds.every((id) => pickedSet.has(id))
  const togglePick = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleAll = () =>
    setPicked((prev) => (allPicked ? prev.filter((id) => !filteredIds.includes(id)) : [...new Set([...prev, ...filteredIds])]))
  const pickRows = pickRowsOf(liveRows, picked)
  const pickedDemo = new Set(pickRows.filter((p) => p.isDemo).map((p) => p.customerId)).size

  const goto = (p: number) => {
    setPage(p)
    setExpanded([])
  }

  return (
    <div {...batchAttrs('A.場域清單.報告產製')}>
      {/* KPI 四格 —— 規格 §4 */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 16 }}>
        <div className="kpi green">
          <div className="lbl">可立即產製</div>
          <div className="val">{kpi.ready.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta">資料與輪廓齊備</span><KpiSource k={kpi.ready} /></div>
        </div>
        <div className="kpi purple">
          <div className="lbl">本季已寄發</div>
          <div className="val">{kpi.sent.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta">含已開啟/互動</span><KpiSource k={kpi.sent} /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">待補客戶輪廓</div>
          <div className="val">{kpi.needProfile.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta">SF「成員困擾」未填</span><KpiSource k={kpi.needProfile} /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">逾期待更新</div>
          <div className="val">{kpi.overdue.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta dn">距上次 &gt; {REPORT_DATA_THRESHOLD_DAYS} 天</span><KpiSource k={kpi.overdue} /></div>
        </div>
      </div>

      {/* 母體來源說明 —— 真實 vs 示範一定要分得出來(AGENTS.md §10) */}
      <div style={{
        marginTop: 12, padding: '8px 12px', borderRadius: 8,
        background: 'var(--as-bg)', border: '1px solid var(--as-line-2)',
        fontSize: 11, color: 'var(--as-ink-2)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <Icon name="layers" size={12} />
        <span>
          <b>{REPORT_TOTALS.realCustomers}</b> 位客戶 · <b>{REPORT_TOTALS.realDevices}</b> 台設備來自
          AIRCARE 正式報告合格清單(2026-08-11 匯出),姓名與輪廓由客戶編號向 Salesforce 即時解析;
          其餘 {REPORT_TOTALS.customers - REPORT_TOTALS.realCustomers} 列標「示範」。
        </span>
        <span style={{ color: 'var(--as-mute)' }}>
          其中 {REPORT_TOTALS.withReport} 台已有設備分析報告(才有分群與指數),其餘待報告產出引擎接入。
        </span>
        {/* KPI 與 chip 是整份母體的數字,輪廓沒到齊前會低估可產製 —— 講出來,不要讓人以為是定值 */}
        <span style={{ marginLeft: 'auto', fontWeight: 600, color: resolving ? '#D97706' : 'var(--as-success)' }}>
          {resolving
            ? `輪廓解析中 ${resolved} / ${REAL_CUSTOMER_CODES.length} 位 · KPI 與篩選數字尚未到齊`
            : `輪廓已解析 ${resolved} / ${REAL_CUSTOMER_CODES.length} 位`}
        </span>
      </div>

      {/* 挑名單摘要條 —— 2026-09-18 首批寄送。沒選任何人時不佔版面。 */}
      {picked.length > 0 && (
        <div style={{
          marginTop: 12, padding: '9px 12px', borderRadius: 8,
          background: 'var(--as-primary-bg, #E6F2EF)', border: '1px solid var(--as-primary)',
          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', fontSize: 12,
        }}>
          <Icon name="check" size={13} />
          <span>
            已選 <b className="mono">{picked.length}</b> 位客戶 ·
            <b className="mono"> {pickRows.length}</b> 台設備
            <span style={{ color: 'var(--as-mute)' }}>（一戶一次寄發，內含多份設備報告）</span>
          </span>
          {pickedDemo > 0 && (
            <span style={{ color: '#B45309' }}>
              ⚠ 含 {pickedDemo} 位示範客戶（無 MAC，產報告時請排除）
            </span>
          )}
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setPicked([])}>清除</button>
            <button className="btn primary" onClick={() => downloadPickCsv(pickRows)}>
              <Icon name="download" size={13} />匯出名單 CSV
            </button>
          </span>
        </div>
      )}

      {/* 狀態篩選 —— 規格 §4 */}
      <div className="fb" style={{ marginTop: 16 }}>
        {filters.map((f) => (
          <span
            key={f.k}
            className={`chip ${f.k === filter ? 'on' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setFilter(f.k)}
            title={f.k === 'selectable' ? '挑名單用:只排除「資料未達標」,忽略輪廓(中台尚未回傳 SF 成員困擾)' : undefined}
          >
            {f.label}<span className="n">{f.n}</span>
          </span>
        ))}
        {catMeta && (
          <>
            <span style={{ width: 1, height: 18, background: 'var(--as-line)' }}></span>
            <span
              className="chip on"
              style={{ cursor: 'pointer', background: catMeta.bg, color: catMeta.color, borderColor: catMeta.color + '40' }}
              onClick={onClearCatFilter}
            >
              類別 {catMeta.id} {catMeta.code}
              <Icon name="x" size={10} />
            </span>
          </>
        )}
        <span className="sp"></span>
        <input className="search" placeholder="客戶編號 / 場域 / 地址" />
      </div>

      <div className="dt-wrap" style={{ marginTop: 12 }} {...(catFilter ? { 'data-cat-filter': catFilter } : {})}>
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: 28 }}>
                <input
                  type="checkbox"
                  checked={allPicked}
                  onChange={toggleAll}
                  title={allPicked ? '取消選取目前篩選結果' : `選取目前篩選結果的 ${filteredIds.length} 位客戶`}
                />
              </th>
              <th>客戶 / 代號</th>
              <th>輪廓</th>
              <th>設備</th>
              <th>分群</th>
              <th>資料涵蓋</th>
              <th>報告狀態</th>
              <th>待補內容</th>
              <th>上次 / 到期</th>
              <th>寄發</th>
              <th>操作</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <Fragment key={r.customerId}>
                <CustomerRow
                  row={r}
                  expanded={expanded.includes(r.customerId)}
                  onToggle={() => toggle(r.customerId)}
                  onSelect={onSelect}
                  picked={pickedSet.has(r.customerId)}
                  onPick={() => togglePick(r.customerId)}
                  live={byCode[r.customerId] ?? null}
                  resolving={resolving}
                />
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* 九態圖例 —— 規格 §3 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '12px 14px', borderTop: '1px solid var(--as-line-2)', fontSize: 11, color: 'var(--as-ink-2)' }}>
          {REPORT_STATE_ORDER.map((s) => {
            const m = REPORT_STATE_META[s]
            return (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                {m.no} {m.label}
              </span>
            )
          })}
        </div>

        <div className="dt-foot">
          <span>
            第 {current * PAGE_SIZE + 1}–{current * PAGE_SIZE + pageRows.length} 筆 ·
            共 {rows.length} 位客戶 / {REPORT_TOTALS.devices} 份報告
            <span style={{ color: 'var(--as-mute)', marginLeft: 6 }}>
              (姓名/輪廓 {resolved} / {REAL_CUSTOMER_CODES.length} 筆向 Salesforce 即時解析
              {resolving ? ' · 查詢中…' : ''})
            </span>
          </span>
          <div className="pager">
            <button onClick={() => goto(Math.max(0, current - 1))} disabled={current === 0}>‹</button>
            {Array.from({ length: pageCount }, (_, i) => i).map((i) => (
              <button key={i} className={i === current ? 'on' : ''} onClick={() => goto(i)}>{i + 1}</button>
            ))}
            <button onClick={() => goto(Math.min(pageCount - 1, current + 1))} disabled={current === pageCount - 1}>›</button>
          </div>
        </div>
      </div>
    </div>
  )
}
