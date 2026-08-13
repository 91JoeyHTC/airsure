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
  REPORT_KPI,
  REPORT_FILTERS,
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
  type ReportFilterKey,
  type ReportCustomerRow,
  type ReportDeviceRow,
  type ReportState,
  type KpiSplit,
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

/* 對外分群(金/銀/銅)+ 內部六大類型代號。
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
      disabled={state === 'insufficient'}
      style={{
        fontSize: 11, padding: '4px 9px', width: 'auto', height: 'auto', whiteSpace: 'nowrap',
        ...(state === 'insufficient' ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      }}
      onClick={(e) => e.stopPropagation()}
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
  row: rawRow, expanded, onToggle, onSelect, live, resolving,
}: {
  row: ReportCustomerRow
  expanded: boolean
  onToggle: () => void
  onSelect: (fid: string) => void
  /** 由客戶編號向中台即時解析到的 Salesforce 會員(查不到為 null) */
  live: MemberHit | null
  resolving: boolean
}) {
  /* 輪廓來自 SF「成員困擾」(多重選擇)。中台回來後,原本卡在「② 待補輪廓」
   * 的設備要跟著放行到「③ 可產製」—— 靜態算好的九態不知道 SF 有資料。 */
  const row = applyLiveProfiles(rawRow, profilesFromConcern(live?.family_bothered))

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
        <td onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
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

/* ── 場域清單 ─────────────────────────────────────────── */
export function AFieldList({
  onSelect,
  catFilter,
  onClearCatFilter,
}: {
  onSelect: (fid: string) => void
  /** 六大類型篩選(由整體層 upsell 卡片點擊帶入) */
  catFilter?: CatId | null
  onClearCatFilter?: () => void
}) {
  const [filter, setFilter] = useState<ReportFilterKey>('all')
  const [expanded, setExpanded] = useState<string[]>([])
  const [page, setPage] = useState(0)

  const catMeta = catFilter ? CATEGORIES.find((c) => c.id === catFilter)! : null
  const rows = REPORT_ROWS
    .filter((r) => matchesFilter(r, filter))
    .filter((r) => (catMeta ? r.devices.some((d) => d.cat === catMeta.id) : true))

  /* 分頁是真的 —— 姓名解析逐筆打中台,一次只解析當頁,不是整份清單。 */
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const pageRows = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  /* 當頁向中台解析姓名(結果進 session 快取,同一編號只查一次)。
   * 中台未連線就退回 mock 姓名/客戶編號,清單照常顯示 —— AGENTS.md §10 的優雅降級。
   *
   * 只查「沒有 mock 姓名」的列(= AIRCARE 合格清單的真實客戶,個資不落地所以只有編號)。
   * 示範場域刻意不查:它們的編號有些在 Salesforce 真的存在但屬於別人
   * (例:C201000272),查了會把真人姓名貼到虛構的場域資料上。 */
  const codesToResolve = pageRows.filter((r) => !r.isDemo).map((r) => r.customerId)
  const { byCode, resolving } = useMembersByCodes(codesToResolve)
  const liveCount = pageRows.filter((r) => byCode[r.customerId]?.name).length

  const toggle = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

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
          <div className="val">{REPORT_KPI.ready.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta">資料與輪廓齊備</span><KpiSource k={REPORT_KPI.ready} /></div>
        </div>
        <div className="kpi purple">
          <div className="lbl">本季已寄發</div>
          <div className="val">{REPORT_KPI.sent.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta">含已開啟/互動</span><KpiSource k={REPORT_KPI.sent} /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">待補客戶輪廓</div>
          <div className="val">{REPORT_KPI.needProfile.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta">輪廓待接 SF「成員困擾」</span><KpiSource k={REPORT_KPI.needProfile} /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">逾期待更新</div>
          <div className="val">{REPORT_KPI.overdue.total}<span className="u">份</span></div>
          <div className="ft"><span className="delta dn">距上次 &gt; {REPORT_DATA_THRESHOLD_DAYS} 天</span><KpiSource k={REPORT_KPI.overdue} /></div>
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
          <b>{REPORT_KPI.realCustomers}</b> 位客戶 · <b>{REPORT_KPI.realDevices}</b> 台設備來自
          AIRCARE 正式報告合格清單(2026-08-11 匯出),姓名由客戶編號向 Salesforce 即時解析;
          其餘 {REPORT_KPI.customers - REPORT_KPI.realCustomers} 列標「示範」。
        </span>
        <span style={{ color: 'var(--as-mute)' }}>
          其中 {REPORT_KPI.withReport} 台已有設備分析報告(才有分群與指數),其餘待報告產出引擎接入。
        </span>
      </div>

      {/* 狀態篩選 —— 規格 §4 */}
      <div className="fb" style={{ marginTop: 16 }}>
        {REPORT_FILTERS.map((f) => (
          <span
            key={f.k}
            className={`chip ${f.k === filter ? 'on' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setFilter(f.k)}
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
              <th style={{ width: 28 }}><input type="checkbox" /></th>
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
            共 {rows.length} 位客戶 / {REPORT_KPI.devices} 份報告
            <span style={{ color: 'var(--as-mute)', marginLeft: 6 }}>
              (本頁姓名 {resolving
                ? '查詢 Salesforce 中…'
                : `${liveCount} / ${codesToResolve.length} 筆即時解析`})
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
