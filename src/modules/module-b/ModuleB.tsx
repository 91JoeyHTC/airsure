import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  CUSTOMER_DEVICES,
  SERVICE_RECORDS,
  FINANCE_RECORDS,
  B_OVERVIEW_JUMP_CARDS,
  SEGMENTS_B,
  B_LIFECYCLE,
  B_NEW_JOIN,
  B_CHURN,
  B_MONTHS_12,
} from '../../mocks/module-b'

// ── PM2.5 30-day mock data ─────────────────────────────────────────────────────
const PM25_30D = [
  18, 22, 19, 35, 42, 38, 28, 24, 19, 16,
  14, 18, 22, 31, 45, 52, 48, 36, 28, 22,
  19, 17, 15, 14, 18, 24, 28, 22, 19, 16,
]

// ── 90-day event timeline ──────────────────────────────────────────────────────
const EVENTS_90D = [
  { d: '2026-05-10', type: '主動聯繫', desc: '陽明山場域 PM2.5 連續超標 AI 自動工單', cls: 'r' },
  { d: '2026-04-22', type: '韌體更新', desc: '全部裝置升級至韌體 2.4.1', cls: 'g' },
  { d: '2026-03-18', type: '到府服務', desc: '高級會員到府保養 — 信義居家', cls: 'b' },
  { d: '2026-02-15', type: '訂閱續約', desc: '年度高級訂閱方案自動續約 NT$88,800', cls: 'p' },
]

// ── Cross-module signal chips ──────────────────────────────────────────────────
const CROSS_SIGNALS = [
  { mod: 'C', label: '服務管理', signal: '1 張待確認工單', cls: 'r' },
  { mod: 'E', label: '會員經營', signal: '高級會員 · 積分 4,218', cls: 'p' },
  { mod: 'F', label: '營收分析', signal: 'LTV NT$370K+ · P75↑', cls: 'g' },
  { mod: 'G', label: '健康證書', signal: '本季健康報告已發送', cls: 'b' },
]

// ── AI Recommendations ─────────────────────────────────────────────────────────
const AI_RECS = [
  {
    pri: '高', priCls: 'r',
    title: '陽明山場域異常',
    desc: 'AC-LITE-7821 PM2.5 連續 5 天超標 · 建議立即排程到府檢修',
    action: '立即建立工單',
  },
  {
    pri: '中', priCls: 'y',
    title: '大安辦公室濾網',
    desc: '2 台設備濾網使用率 < 24% · 建議安排更換以維持效能',
    action: '安排更換',
  },
  {
    pri: '低', priCls: 'g',
    title: '升級推薦',
    desc: '客戶裝置數達 7 台且 LTV 高 · 符合 Pro Plus 升級資格',
    action: '傳送升級邀請',
  },
]

// ── Segment customer cards ─────────────────────────────────────────────────────
interface SegCustomer {
  nm: string
  id: string
  tier: string
  metric: string
  signal: string
  sigCls: string
  av: string
}

const SEG_CUSTOMERS: Record<string, SegCustomer[]> = {
  '新購': [
    { nm: '林雅婷', id: 'M-009812', tier: '標準', metric: 'LTV NT$28K', signal: '首購 14 天', sigCls: 'b', av: '林' },
    { nm: '張宗翰', id: 'M-009801', tier: '標準', metric: 'LTV NT$32K', signal: '設備配對完成', sigCls: 'g', av: '張' },
    { nm: '許佳伶', id: 'M-009788', tier: '標準', metric: 'LTV NT$25K', signal: '待 App 教學', sigCls: 'y', av: '許' },
    { nm: '吳俊傑', id: 'M-009774', tier: '標準', metric: 'LTV NT$41K', signal: '已預約到府安裝', sigCls: 'b', av: '吳' },
    { nm: '蔡明珠', id: 'M-009761', tier: '標準', metric: 'LTV NT$19K', signal: '等待開機激活', sigCls: 'y', av: '蔡' },
    { nm: '劉建志', id: 'M-009750', tier: '標準', metric: 'LTV NT$36K', signal: '首月體驗期', sigCls: 'g', av: '劉' },
  ],
  '復購': [
    { nm: '陳俊宏', id: 'M-008412', tier: '高級', metric: 'LTV NT$370K+', signal: '7 台裝置', sigCls: 'g', av: '陳' },
    { nm: '王淑芬', id: 'M-007821', tier: '高級', metric: 'LTV NT$220K', signal: '3 年客戶', sigCls: 'b', av: '王' },
    { nm: '李建民', id: 'M-007433', tier: '標準', metric: 'LTV NT$95K', signal: '年方案續約', sigCls: 'g', av: '李' },
    { nm: '黃雅琳', id: 'M-007288', tier: '高級', metric: 'LTV NT$180K', signal: '加購濾網', sigCls: 'y', av: '黃' },
    { nm: '鄭文哲', id: 'M-007102', tier: '標準', metric: 'LTV NT$78K', signal: '二度擴機', sigCls: 'b', av: '鄭' },
    { nm: '謝淑娟', id: 'M-006988', tier: '高級', metric: 'LTV NT$290K', signal: 'P90 高價值', sigCls: 'p', av: '謝' },
  ],
  '會推薦': [
    { nm: '林美君', id: 'M-005441', tier: '高級', metric: 'NPS 10 分', signal: '推薦 4 位', sigCls: 'g', av: '林' },
    { nm: '陳志遠', id: 'M-004892', tier: '標準', metric: 'NPS 9 分', signal: '社群分享', sigCls: 'g', av: '陳' },
    { nm: '蔡雅雯', id: 'M-004321', tier: '高級', metric: 'NPS 10 分', signal: '推薦 2 位', sigCls: 'b', av: '蔡' },
    { nm: '黃建平', id: 'M-003988', tier: '標準', metric: 'NPS 9 分', signal: '部落格評測', sigCls: 'p', av: '黃' },
    { nm: '吳麗華', id: 'M-003641', tier: '高級', metric: 'NPS 10 分', signal: '推薦 6 位', sigCls: 'g', av: '吳' },
    { nm: '許仁傑', id: 'M-003112', tier: '標準', metric: 'NPS 9 分', signal: 'Google 五星', sigCls: 'g', av: '許' },
  ],
  '潛在': [
    { nm: '趙曉明', id: 'M-002811', tier: '潛在', metric: '詢問 3 次', signal: '報價單待回覆', sigCls: 'y', av: '趙' },
    { nm: '孫佳琪', id: 'M-002744', tier: '潛在', metric: '看展記錄', signal: '活動報名', sigCls: 'b', av: '孫' },
    { nm: '周文星', id: 'M-002610', tier: '潛在', metric: '試用申請', signal: '14 天試用中', sigCls: 'g', av: '周' },
    { nm: '馮淑美', id: 'M-002488', tier: '潛在', metric: '官網瀏覽', signal: '高價值頁面停留', sigCls: 'y', av: '馮' },
    { nm: '程建國', id: 'M-002311', tier: '潛在', metric: '社群互動', signal: '問卷填寫', sigCls: 'b', av: '程' },
    { nm: '沈怡如', id: 'M-002188', tier: '潛在', metric: '競品比較', signal: 'AI 推薦觸及', sigCls: 'p', av: '沈' },
  ],
}

const SEG_TYPE_META: Array<{ k: string; count: string; ltv: string; trait: string }> = [
  { k: '新購', count: '1,284 位', ltv: 'NT$28–42K', trait: '首月體驗 · 配對完成率關鍵' },
  { k: '復購', count: '4,218 位', ltv: 'NT$80–480K', trait: '主流收益來源 · LTV 穩定成長' },
  { k: '會推薦', count: '2,128 位', ltv: 'NT$120K+', trait: 'NPS 9–10 · 高 K-factor 傳播力' },
  { k: '潛在', count: '841 位', ltv: 'NT$0 → 潛力', trait: '試用中 / 詢問階段 · 轉換關鍵' },
]

// ──────────────────────────────────────────────────────────────────────────────
// 整體層 view
// ──────────────────────────────────────────────────────────────────────────────
function OverallView() {
  const maxNew = Math.max(...B_NEW_JOIN)
  const maxChurn = Math.max(...B_CHURN)

  return (
    <>
      {/* Overall KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }}>
        <div className="kpi green">
          <div className="lbl">活躍會員</div>
          <div className="val">6,420<span className="u">位</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+2.8%</span><Sparkline data={[5800, 5900, 6000, 6100, 6150, 6200, 6280, 6350, 6400, 6420]} color="var(--as-primary)" /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">本月新增</div>
          <div className="val">342<span className="u">位</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+4.9%</span><Sparkline data={B_NEW_JOIN} color="var(--as-h)" /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">流失預警</div>
          <div className="val">612<span className="u">位</span></div>
          <div className="ft"><span className="delta dn"><Icon name="down" size={11} />−18 vs 上月</span><Sparkline data={[680, 670, 660, 655, 645, 638, 630, 622, 615, 612]} color="var(--as-danger)" /></div>
        </div>
        <div className="kpi purple">
          <div className="lbl">平均 LTV</div>
          <div className="val">NT$<span style={{ fontSize: 22 }}>118K</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+NT$4K</span><Sparkline data={[98, 101, 104, 107, 109, 111, 113, 115, 117, 118]} color="var(--as-cdefg)" /></div>
        </div>
      </div>

      {/* 生命週期 distribution */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <div><h3>會員生命週期分佈</h3><div className="csub">總計 8,508 位 · 依最後行為日歸類</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {B_LIFECYCLE.map(lc => (
            <div key={lc.k} style={{ flex: lc.pct, background: lc.c, borderRadius: 4, height: 8, opacity: 0.85 }} title={`${lc.k} ${lc.pct}%`} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {B_LIFECYCLE.map(lc => (
            <div key={lc.k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: lc.c, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{lc.k}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--f-mono)', paddingLeft: 16 }}>{lc.n.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', paddingLeft: 16 }}>{lc.pct}% · {lc.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 新增 vs 流失 chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <div><h3>新增 vs 流失趨勢</h3><div className="csub">近 12 個月 · 月度對比</div></div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--as-mute)' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--as-primary)', marginRight: 5, verticalAlign: 'middle' }} />新增</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--as-danger)', marginRight: 5, verticalAlign: 'middle' }} />流失</span>
          </div>
        </div>
        <svg viewBox="0 0 640 180" style={{ width: '100%', height: 180, display: 'block' }}>
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1="36" y1={20 + i * 40} x2="630" y2={20 + i * 40} stroke="var(--as-line-2)" strokeDasharray="2 4" />
          ))}
          {B_MONTHS_12.map((m, i) => {
            const bw = 18
            const gap = (640 - 50) / 12
            const x = 50 + i * gap
            const newH = (B_NEW_JOIN[i] / maxNew) * 120
            const churnH = (B_CHURN[i] / maxChurn) * 60
            return (
              <g key={m}>
                <rect x={x - bw - 2} y={140 - newH} width={bw} height={newH} rx={2} fill="var(--as-primary)" opacity="0.8" />
                <rect x={x + 2} y={140 - churnH} width={bw} height={churnH} rx={2} fill="var(--as-danger)" opacity="0.7" />
                <text x={x + bw / 2 - 2} y={158} fontSize="10" fill="var(--as-mute)" textAnchor="middle" fontFamily="var(--f-mono)">{m}月</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 4 drill-down cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {B_OVERVIEW_JUMP_CARDS.map(card => (
          <div key={card.ax} className="card" style={{ cursor: 'pointer' }}>
            <div className="ch">
              <div>
                <h3>{card.t}</h3>
                <div className="csub">{card.s} · 共 {card.n} 位</div>
              </div>
              <button className="rowbtn"><Icon name="arrow" size={13} /></button>
            </div>
            {/* stacked bar */}
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1, marginBottom: 12 }}>
              {card.groups.map((g, i) => (
                <div key={i} style={{ flex: g.p, background: g.c, opacity: 0.85 }} />
              ))}
            </div>
            {/* highlight segment */}
            <div style={{ background: 'var(--as-bg)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 2 }}>最大群</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{card.hi.lbl}</div>
              <div style={{ fontSize: 12, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>{card.hi.pct}% · {card.hi.n.toLocaleString()} 位</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: 'var(--as-mute)' }}>{card.act}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--f-mono)' }}>{card.kpi}</div>
                <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{card.kpiL}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// 分群層 view
// ──────────────────────────────────────────────────────────────────────────────
function SegmentView() {
  const [segTab, setSegTab] = useState<'需求' | '消費力' | '依賴度' | '滿意度'>('需求')
  const [custType, setCustType] = useState<'新購' | '復購' | '會推薦' | '潛在'>('復購')

  const seg = SEGMENTS_B.find(s => s.axis === segTab)!
  const tierColor = (tier: string) =>
    tier === '高級' ? 'var(--as-h)' : tier === '潛在' ? 'var(--as-mute-2)' : 'var(--as-primary)'

  return (
    <>
      {/* 分群維度 selector */}
      <div className="b-subtabs" style={{ marginBottom: 16 }}>
        {(['需求', '消費力', '依賴度', '滿意度'] as const).map(k => (
          <button key={k} className={`b-subtab${segTab === k ? ' active' : ''}`} onClick={() => setSegTab(k)}>
            {k}分群
          </button>
        ))}
      </div>

      {seg && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="ch">
            <div><h3>{seg.title}</h3><div className="csub">{seg.sub}</div></div>
          </div>
          {/* stacked bar */}
          <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2, marginBottom: 16 }}>
            {seg.groups.map(g => (
              <div key={g.lbl} style={{ flex: g.pct, background: g.c, opacity: 0.85 }} title={`${g.lbl} ${g.pct}%`} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {seg.groups.map(g => (
              <div key={g.lbl} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--as-line)', borderRadius: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: g.c, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{g.lbl}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--as-mute)', paddingLeft: 16, fontFamily: 'var(--f-mono)' }}>{g.n.toLocaleString()} 位 · {g.pct}%</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--as-ink-2)' }}>{g.traits}</div>
                <div>
                  <span className="pill b" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{g.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 客戶類型卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {SEG_TYPE_META.map(m => (
          <div
            key={m.k}
            className="card"
            style={{ cursor: 'pointer', borderColor: custType === m.k ? 'var(--as-primary)' : undefined, outline: custType === m.k ? '2px solid var(--as-primary)' : undefined }}
            onClick={() => setCustType(m.k as typeof custType)}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.k}</div>
            <div style={{ fontSize: 12, fontFamily: 'var(--f-mono)', color: 'var(--as-mute)', marginBottom: 4 }}>{m.count}</div>
            <div style={{ fontSize: 12, color: 'var(--as-h)', marginBottom: 6, fontFamily: 'var(--f-mono)' }}>{m.ltv}</div>
            <div style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>{m.trait}</div>
          </div>
        ))}
      </div>

      {/* Customer list for selected type */}
      <div className="card">
        <div className="ch">
          <div><h3>{custType}客戶</h3><div className="csub">代表性客戶列表</div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SEG_CUSTOMERS[custType].map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--as-line)', borderRadius: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--as-cdefg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                {c.av}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nm}</div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>{c.id}</div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: tierColor(c.tier) + '18', color: tierColor(c.tier), fontWeight: 600 }}>{c.tier}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--f-mono)' }}>{c.metric}</div>
                <span className={`pill ${c.sigCls}`} style={{ fontSize: 10 }}>{c.signal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// 個人層 view
// ──────────────────────────────────────────────────────────────────────────────
function PersonaView() {
  const [subTab, setSubTab] = useState<'概覽' | '裝置與場域' | '服務紀錄' | '健康數據' | '訂閱與帳務'>('概覽')

  const stLabel = (st: 'g' | 'y' | 'r') => st === 'g' ? '正常' : st === 'y' ? '注意' : '警示'
  const stCls = (st: 'g' | 'y' | 'r') => st

  return (
    <>
      {/* ── Hero card ── */}
      <div className="card" style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        {/* decorative stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--as-primary), var(--as-h))' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'start', paddingTop: 8 }}>
          {/* Avatar + health ring */}
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="40" cy="40" r="36" fill="none" stroke="var(--as-line-2)" strokeWidth="5" />
              <circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke="var(--as-primary)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(82 / 100) * 226} 226`}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'var(--as-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>
              陳
            </div>
            <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#fff', border: '1px solid var(--as-line)', borderRadius: 6, padding: '1px 5px', fontSize: 10, fontWeight: 700, color: 'var(--as-primary)', fontFamily: 'var(--f-mono)' }}>
              82
            </div>
          </div>

          {/* Name + meta */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>陳俊宏</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--as-mute)' }}>M-008412</span>
              <span style={{ padding: '2px 10px', borderRadius: 12, background: 'var(--as-h)', color: '#fff', fontSize: 11, fontWeight: 700 }}>高級會員</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--as-ink-2)', flexWrap: 'wrap' }}>
              <span><Icon name="cal" size={12} /> 加入 2022-11-04</span>
              <span><Icon name="eye" size={12} /> 最後活躍 2026-05-10</span>
              <span>
                <span style={{ fontWeight: 700, color: 'var(--as-primary)', fontFamily: 'var(--f-mono)' }}>DHI 健康指數</span>
                {' '}
                <span style={{ background: 'var(--as-primary)', color: '#fff', borderRadius: 4, padding: '1px 7px', fontSize: 12, fontWeight: 700 }}>B 級</span>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn"><Icon name="phone" size={13} />聯繫</button>
            <button className="btn primary ab"><Icon name="plus" size={13} />新增工單</button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginTop: 16, background: 'var(--as-line)', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { v: 'NT$38K', lbl: '客單價' },
            { v: '2.4 台', lbl: '裝置平均' },
            { v: '14 次', lbl: '服務次數' },
            { v: '高', lbl: '滿意度' },
          ].map(s => (
            <div key={s.lbl} style={{ background: 'var(--as-bg)', padding: '10px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-ink)' }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sub-tab nav ── */}
      <div className="b-subtabs" style={{ marginBottom: 16 }}>
        {(['概覽', '裝置與場域', '服務紀錄', '健康數據', '訂閱與帳務'] as const).map(k => (
          <button
            key={k}
            className={`b-subtab${subTab === k ? ' active' : ''}`}
            onClick={() => setSubTab(k)}
          >
            {k}
            {k === '裝置與場域' && <span className="n" style={{ marginLeft: 4 }}>3</span>}
            {k === '服務紀錄' && <span className="n" style={{ marginLeft: 4 }}>12</span>}
          </button>
        ))}
      </div>

      {/* ── 概覽 tab ── */}
      {subTab === '概覽' && (
        <div className="two-col" style={{ alignItems: 'start' }}>
          {/* Left 2/3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* PM2.5 trend */}
            <div className="card">
              <div className="ch">
                <div><h3>30 天 PM2.5 趨勢</h3><div className="csub">全場域平均 · µg/m³</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--as-mute)' }}>均值</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-ink)' }}>23.4</span>
                  <span className="pill g" style={{ fontSize: 10 }}>優良</span>
                </div>
              </div>
              <svg viewBox="0 0 560 110" style={{ width: '100%', height: 110, display: 'block' }}>
                {[15, 35, 55].map((g, i) => (
                  <line key={i} x1="0" y1={g} x2="560" y2={g} stroke="var(--as-line-2)" strokeDasharray="3 5" />
                ))}
                {/* red threshold at 35µg */}
                <line x1="0" y1={55} x2="560" y2={55} stroke="var(--as-danger)" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                {(() => {
                  const maxV = 60
                  const pts = PM25_30D.map((v, i) => `${10 + i * 18},${100 - (v / maxV) * 88}`).join(' ')
                  return (
                    <>
                      <polygon points={`10,100 ${pts} ${10 + 29 * 18},100`} fill="var(--as-primary)" opacity="0.08" />
                      <polyline points={pts} fill="none" stroke="var(--as-primary)" strokeWidth="2" strokeLinejoin="round" />
                      {PM25_30D.map((v, i) => v > 35 ? (
                        <circle key={i} cx={10 + i * 18} cy={100 - (v / maxV) * 88} r={3} fill="var(--as-danger)" />
                      ) : null)}
                    </>
                  )
                })()}
                <text x="0" y="12" fontSize="9" fill="var(--as-mute)">55</text>
                <text x="0" y="38" fontSize="9" fill="var(--as-mute)">35</text>
                <text x="0" y="58" fontSize="9" fill="var(--as-danger)">35↑</text>
              </svg>
            </div>

            {/* 90-day event timeline */}
            <div className="card">
              <div className="ch">
                <div><h3>90 天事件時間軸</h3><div className="csub">關鍵互動紀錄</div></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {EVENTS_90D.map((ev, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 16px 1fr', gap: '0 12px', alignItems: 'start', paddingBottom: i < EVENTS_90D.length - 1 ? 16 : 0 }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--as-mute)', textAlign: 'right', paddingTop: 2 }}>{ev.d}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: ev.cls === 'r' ? 'var(--as-danger)' : ev.cls === 'g' ? 'var(--as-success)' : ev.cls === 'b' ? 'var(--as-primary)' : 'var(--as-cdefg)', marginTop: 2 }} />
                      {i < EVENTS_90D.length - 1 && <div style={{ width: 1.5, flex: 1, background: 'var(--as-line-2)', minHeight: 24 }} />}
                    </div>
                    <div>
                      <span className={`pill ${ev.cls}`} style={{ fontSize: 10, marginBottom: 4, display: 'inline-block' }}>{ev.type}</span>
                      <div style={{ fontSize: 12, color: 'var(--as-ink-2)' }}>{ev.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-module signals */}
            <div className="card">
              <div className="ch">
                <div><h3>跨模組信號</h3><div className="csub">即時關聯資訊</div></div>
              </div>
              <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', gap: 8 }}>
                {CROSS_SIGNALS.map(sig => (
                  <div key={sig.mod} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--as-line)', borderRadius: 8, flex: '1 1 auto', minWidth: 180 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--as-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                      {sig.mod}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{sig.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{sig.signal}</div>
                    </div>
                    <span className={`pill ${sig.cls}`} style={{ fontSize: 10, marginLeft: 'auto' }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1/3 — AI assistant */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ margin: '-16px -16px 16px', padding: '12px 16px', background: 'linear-gradient(135deg, #EA580C, #F97316)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="sparkles" size={16} />
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>AI 建議</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>3 項行動建議</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {AI_RECS.map((rec, i) => (
                <div key={i} style={{ padding: '12px 14px', border: '1px solid var(--as-line)', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: rec.priCls === 'r' ? 'var(--as-danger)' : rec.priCls === 'y' ? 'var(--as-warning)' : 'var(--as-success)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span className={`pill ${rec.priCls}`} style={{ fontSize: 10 }}>{rec.pri}優先</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{rec.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--as-ink-2)', marginBottom: 10, lineHeight: 1.5 }}>{rec.desc}</div>
                  <button className="btn" style={{ width: '100%', fontSize: 12, justifyContent: 'center' }}>
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(249,115,22,0.06)', borderRadius: 8, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.5 }}>
              AI 建議基於 IoT 數據、服務記錄及消費行為綜合分析 · 每日更新
            </div>
          </div>
        </div>
      )}

      {/* ── 裝置與場域 tab ── */}
      {subTab === '裝置與場域' && (
        <div className="card">
          <div className="ch">
            <div><h3>裝置與場域清單</h3><div className="csub">共 {CUSTOMER_DEVICES.length} 台裝置 · 3 個場域</div></div>
          </div>
          <div className="dt-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>裝置 ID</th>
                  <th>場域</th>
                  <th>位置</th>
                  <th>型號</th>
                  <th>韌體</th>
                  <th>運行時數</th>
                  <th>濾網殘量</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {CUSTOMER_DEVICES.map(d => (
                  <tr key={d.id}>
                    <td className="mono" style={{ fontSize: 12 }}>{d.id}</td>
                    <td style={{ fontSize: 12 }}>{d.site}</td>
                    <td style={{ fontSize: 12 }}>{d.loc}</td>
                    <td style={{ fontSize: 12 }}>{d.mdl}</td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--as-mute)' }}>{d.fw}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{d.hr.toLocaleString()} h</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{ width: `${d.fil}%`, height: '100%', background: d.fil > 50 ? 'var(--as-success)' : d.fil > 25 ? 'var(--as-warning)' : 'var(--as-danger)' }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, minWidth: 28 }}>{d.fil}%</span>
                      </div>
                    </td>
                    <td><span className={`pill ${stCls(d.st)}`}>{stLabel(d.st)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 服務紀錄 tab ── */}
      {subTab === '服務紀錄' && (
        <div className="card">
          <div className="ch">
            <div><h3>服務紀錄</h3><div className="csub">共 {SERVICE_RECORDS.length} 筆 · 含主動聯繫與到府服務</div></div>
          </div>
          <div className="dt-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>工單編號</th>
                  <th>主旨</th>
                  <th>類別</th>
                  <th>負責</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {SERVICE_RECORDS.map(r => (
                  <tr key={r.tk}>
                    <td className="mono" style={{ fontSize: 11 }}>{r.d}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{r.tk}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{r.tt}</div>
                    </td>
                    <td><span className="tt" style={{ fontSize: 11 }}>{r.cat}</span></td>
                    <td style={{ fontSize: 12 }}>{r.ag}</td>
                    <td><span className={`pill ${r.st === 'open' ? 'r' : 'g'}`}>{r.st === 'open' ? '處理中' : '完成'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 健康數據 tab ── */}
      {subTab === '健康數據' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi green">
              <div className="lbl">DHI 健康指數</div>
              <div className="val">82<span className="u">/ 100</span></div>
              <div className="ft"><span className="delta up"><Icon name="up" size={11} />B 級</span><Sparkline data={[74, 75, 77, 78, 79, 80, 81, 81, 82, 82]} color="var(--as-primary)" /></div>
            </div>
            <div className="kpi green">
              <div className="lbl">PM2.5 月均值</div>
              <div className="val">23.4<span className="u">µg/m³</span></div>
              <div className="ft"><span className="delta up">優良</span><Sparkline data={[28, 27, 26, 25, 25, 24, 24, 23, 23, 23]} color="var(--as-primary)" /></div>
            </div>
            <div className="kpi orange">
              <div className="lbl">超標事件</div>
              <div className="val">3<span className="u">次 / 月</span></div>
              <div className="ft"><span className="delta dn">陽明山場域</span><Sparkline data={[1, 2, 2, 3, 3, 4, 3, 3, 3, 3]} color="var(--as-h)" /></div>
            </div>
            <div className="kpi purple">
              <div className="lbl">設備在線率</div>
              <div className="val">85.7<span className="u">%</span></div>
              <div className="ft"><span className="delta">6/7 台正常</span><Sparkline data={[100, 100, 100, 85, 85, 85, 85, 85, 85, 85]} color="var(--as-cdefg)" /></div>
            </div>
          </div>
          <div className="card">
            <div className="ch"><div><h3>30 天 PM2.5 完整記錄</h3><div className="csub">含場域細分 · 超標標記</div></div></div>
            <svg viewBox="0 0 640 160" style={{ width: '100%', height: 160, display: 'block' }}>
              {[25, 35, 55].map((_g, i) => (
                <line key={i} x1="40" y1={20 + i * 40} x2="630" y2={20 + i * 40} stroke="var(--as-line-2)" strokeDasharray="3 5" />
              ))}
              <line x1="40" y1={60} x2="630" y2={60} stroke="var(--as-danger)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
              {(() => {
                const maxV = 60
                const pts = PM25_30D.map((v, i) => `${48 + i * 19},${140 - (v / maxV) * 120}`).join(' ')
                return (
                  <>
                    <polygon points={`48,140 ${pts} ${48 + 29 * 19},140`} fill="var(--as-primary)" opacity="0.07" />
                    <polyline points={pts} fill="none" stroke="var(--as-primary)" strokeWidth="2" strokeLinejoin="round" />
                    {PM25_30D.map((v, i) => (
                      <circle key={i} cx={48 + i * 19} cy={140 - (v / maxV) * 120} r={v > 35 ? 4 : 2.5} fill={v > 35 ? 'var(--as-danger)' : 'var(--as-primary)'} />
                    ))}
                  </>
                )
              })()}
              {[0, 9, 19, 29].map(i => (
                <text key={i} x={48 + i * 19} y={156} fontSize="9" fill="var(--as-mute)" textAnchor="middle" fontFamily="var(--f-mono)">Day {i + 1}</text>
              ))}
              {[35, 60].map((v, i) => (
                <text key={i} x="36" y={140 - (v / 60) * 120 + 4} fontSize="9" fill={v === 35 ? 'var(--as-danger)' : 'var(--as-mute)'} textAnchor="end" fontFamily="var(--f-mono)">{v}</text>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* ── 訂閱與帳務 tab ── */}
      {subTab === '訂閱與帳務' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="ch">
              <div><h3>當前訂閱方案</h3><div className="csub">高級訂閱 · 年方案</div></div>
              <span className="pill g">有效</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 8 }}>
              {[
                { lbl: '訂閱等級', v: '高級 (Premium)' },
                { lbl: '下次扣款', v: '2026-11-04' },
                { lbl: '年費', v: 'NT$88,800' },
              ].map(m => (
                <div key={m.lbl} style={{ padding: '12px 14px', background: 'var(--as-bg)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 4 }}>{m.lbl}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--f-mono)' }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="ch"><div><h3>帳務記錄</h3><div className="csub">共 {FINANCE_RECORDS.length} 筆交易</div></div></div>
            <div className="dt-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>訂單編號</th>
                    <th>項目</th>
                    <th style={{ textAlign: 'right' }}>金額</th>
                    <th>付款方式</th>
                    <th>狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {FINANCE_RECORDS.map(f => (
                    <tr key={f.ord}>
                      <td className="mono" style={{ fontSize: 11 }}>{f.d}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{f.ord}</td>
                      <td style={{ fontSize: 13 }}>{f.it}</td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>NT${f.amt.toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--as-mute)' }}>{f.pm}</td>
                      <td><span className={`pill ${f.st === 'paid' ? 'g' : 'y'}`}>{f.st === 'paid' ? '已付款' : '待付款'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 0 0', textAlign: 'right', fontSize: 13, color: 'var(--as-mute)' }}>
              累計消費 <span style={{ fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-ink)', fontSize: 16 }}>
                NT${FINANCE_RECORDS.reduce((a, b) => a + b.amt, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ModuleB() {
  const [tab, setTab] = useState('individual')

  return (
    <PageShell
      tk="B"
      tkClass="ab"
      title="用戶 360° 視圖"
      sub="雙核心 · 三層級客戶智能"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出</button>
          <button className="btn primary ab"><Icon name="plus" size={14} />新增客戶</button>
        </>
      }
      tabs={[
        { k: 'overall',    l: '整體層' },
        { k: 'segment',    l: '分群層' },
        { k: 'individual', l: '個人層' },
      ]}
      activeTab={tab}
      onTab={setTab}
    >
      {/* ── Global KPI row (always visible) ── */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi purple">
          <div className="lbl">總會員</div>
          <div className="val">8,471<span className="u">位</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+342 本月</span><Sparkline data={[7200, 7400, 7600, 7750, 7900, 8000, 8100, 8250, 8380, 8471]} color="var(--as-cdefg)" /></div>
        </div>
        <div className="kpi green">
          <div className="lbl">活躍率</div>
          <div className="val">68.4<span className="u">%</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+1.2 pp</span><Sparkline data={[64, 65, 65, 66, 66, 67, 67, 68, 68, 68]} color="var(--as-primary)" /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">本月新增</div>
          <div className="val">342<span className="u">位</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+4.9%</span><Sparkline data={B_NEW_JOIN} color="var(--as-h)" /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">高風險</div>
          <div className="val">23<span className="u">位</span></div>
          <div className="ft"><span className="delta dn"><Icon name="down" size={11} />−3 vs 昨日</span><Sparkline data={[30, 29, 28, 27, 26, 26, 25, 24, 24, 23]} color="var(--as-danger)" /></div>
        </div>
      </div>

      {tab === 'overall'    && <OverallView />}
      {tab === 'segment'    && <SegmentView />}
      {tab === 'individual' && <PersonaView />}
    </PageShell>
  )
}
