import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  FINANCE_RECORDS,
  B_OVERVIEW_JUMP_CARDS,
  SEGMENTS_B,
  B_LIFECYCLE,
  B_NEW_JOIN,
  B_CHURN,
  B_MONTHS_12,
  WANG_PROFILE,
} from '../../mocks/module-b'

// ── PM2.5 30-day mock data ─────────────────────────────────────────────────────
const PM25_30D = [
  18, 22, 19, 35, 42, 38, 28, 24, 19, 16,
  14, 18, 22, 31, 45, 52, 48, 36, 28, 22,
  19, 17, 15, 14, 18, 24, 28, 22, 19, 16,
]

// ── Cross-module signal chips (H1 保留:客服視圖用) ─────────────────────────────
const CROSS_SIGNALS = [
  { mod: 'C', label: '服務管理', signal: '1 張待確認工單(2026-04-22 派工後)', cls: 'r' },
  { mod: 'E', label: '會員經營', signal: 'E:蛋黃克人 · C 群 1 級', cls: 'p' },
  { mod: 'F', label: '營收分析', signal: '累計 NT$128.9K · P72', cls: 'g' },
  { mod: 'G', label: '健康證書', signal: '近季尚未發送 · 建議推送', cls: 'y' },
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
// 個人層 view  ── 依「克立淨_客戶三角色彙整_欄位規格.md」三角色視圖
// ──────────────────────────────────────────────────────────────────────────────
type PSubTab = '主管視圖' | '客服視圖' | '顧問視圖' | '居家與畫像' | '訂閱與帳務'

function PersonaView() {
  const w = WANG_PROFILE
  const [subTab, setSubTab] = useState<PSubTab>('主管視圖')

  const stLabel = (st: 'g' | 'y' | 'r') => st === 'g' ? '正常' : st === 'y' ? '注意' : '警示'
  const stCls = (st: 'g' | 'y' | 'r') => st

  return (
    <>
      {/* ── Hero 客戶識別卡 (A1–A6 §0 共用) ── */}
      <div className="card" style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        {/* decorative stripe — 改用克立淨綠系 */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--as-primary), var(--as-info))' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'start', paddingTop: 8 }}>
          {/* A1 Avatar + 資料完整度環 */}
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="40" cy="40" r="36" fill="none" stroke="var(--as-line-2)" strokeWidth="5" />
              <circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke="var(--as-info)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(w.identity.completeness / 100) * 226} 226`}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'var(--as-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>
              {w.identity.name[0]}
            </div>
            <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#fff', border: '1px solid var(--as-line)', borderRadius: 6, padding: '1px 5px', fontSize: 10, fontWeight: 700, color: 'var(--as-info)', fontFamily: 'var(--f-mono)' }}>
              {w.identity.completeness}%
            </div>
          </div>

          {/* A2 Name + tier chips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{w.identity.name}</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--as-mute)' }}>{w.identity.cid}</span>
              <span style={{ padding: '2px 10px', borderRadius: 12, background: 'var(--as-h)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{w.identity.tier}</span>
              <span style={{ padding: '2px 10px', borderRadius: 12, background: 'var(--as-cdefg)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{w.identity.segment} · {w.identity.segLv}</span>
              <span style={{ padding: '2px 10px', borderRadius: 12, background: 'var(--as-primary)', color: '#fff', fontSize: 11, fontWeight: 700 }}>DHI {w.identity.dhi.score} / {w.identity.dhi.grade} 級</span>
            </div>
            {/* A3 meta row */}
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--as-ink-2)', flexWrap: 'wrap', marginBottom: 8 }}>
              <span>{w.identity.gender} · {w.identity.age} 歲（{w.identity.birth}）</span>
              <span>{w.identity.city}</span>
              <span>克立淨 {w.identity.region}</span>
              <span><Icon name="headset" size={12} /> 服務顧問 {w.identity.advisor}</span>
              <span><Icon name="cal" size={12} /> 建立 {w.identity.accountYears} 年（{w.identity.accountFrom}）</span>
              <span style={{ color: 'var(--as-danger)', fontWeight: 600 }}><Icon name="cal" size={12} /> 下次定保 {w.identity.nextMaintenance}</span>
            </div>
            {/* A4 一句話畫像 ribbon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--as-ab-tint)', borderLeft: '3px solid var(--as-primary)', borderRadius: 6, fontSize: 13, color: 'var(--as-ab-ink)' }}>
              <Icon name="sparkles" size={13} />
              <span style={{ fontWeight: 600 }}>一句話畫像：</span>
              <span>{w.identity.oneLine}</span>
            </div>
          </div>

          {/* A6 Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="btn"><Icon name="phone" size={13} />聯繫</button>
            <button className="btn primary ab"><Icon name="plus" size={13} />新增工單</button>
            <button className="btn" style={{ borderColor: 'var(--as-h)', color: 'var(--as-h)' }}><Icon name="bullhorn" size={13} />健康證書</button>
          </div>
        </div>

        {/* A5 Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginTop: 16, background: 'var(--as-line)', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { v: `NT$${w.finance.totalAmt.toLocaleString()}`, lbl: '累計消費（公式）' },
            { v: `NT$${w.finance.avgUnit.toLocaleString()}`,  lbl: '平均客單（公式）' },
            { v: `${w.finance.servicesTotal} 次`,             lbl: `服務次數（${w.finance.services}+${w.finance.servicesImported}）` },
            { v: `${w.finance.machineCount} 台`,              lbl: '持有機型' },
          ].map(s => (
            <div key={s.lbl} style={{ background: 'var(--as-bg)', padding: '10px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-ink)' }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── B1 Sub-tab nav · 三角色 + 共用 ── */}
      <div className="b-subtabs" style={{ marginBottom: 16 }}>
        {(['主管視圖', '客服視圖', '顧問視圖', '居家與畫像', '訂閱與帳務'] as const).map(k => (
          <button
            key={k}
            className={`b-subtab${subTab === k ? ' active' : ''}`}
            onClick={() => setSubTab(k)}
          >
            {k}
            {k === '顧問視圖' && <span className="n" style={{ marginLeft: 4 }}>{w.devices.length}</span>}
            {k === '客服視圖' && <span className="n" style={{ marginLeft: 4 }}>{w.todos.length}</span>}
          </button>
        ))}
      </div>

      {/* B2 視角說明條 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 16, background: 'var(--as-bg)', border: '1px solid var(--as-line)', borderRadius: 6, fontSize: 12, color: 'var(--as-mute)' }}>
        <Icon name="eye" size={12} />
        {subTab === '主管視圖' && <span><b style={{ color: 'var(--as-ink-2)' }}>📊 主管視角：</b>看的是「值不值得投資源、有沒有風險」— 價值、風險、機會</span>}
        {subTab === '客服視圖' && <span><b style={{ color: 'var(--as-ink-2)' }}>🎧 客服視角：</b>看的是「怎麼聯絡、上次發生什麼、這次該做什麼」— 聯絡、歷程、待辦</span>}
        {subTab === '顧問視圖' && <span><b style={{ color: 'var(--as-ink-2)' }}>🩺 顧問視角：</b>看的是「到府前該帶什麼、預判什麼」— 設備、耗材、症狀、眉角</span>}
        {subTab === '居家與畫像' && <span><b style={{ color: 'var(--as-ink-2)' }}>🏠 居家與畫像：</b>環境條件 + 困擾 + 個人標籤，輔以室內 PM2.5 佐證</span>}
        {subTab === '訂閱與帳務' && <span><b style={{ color: 'var(--as-ink-2)' }}>💳 訂閱與帳務：</b>當前方案、累計消費明細、送修報價單</span>}
      </div>

      {/* ── 三角色視圖共用容器:左主內容 + 右 G1 浮動 AI 側欄 ── */}
      <div className="two-col" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ═══ 主管視圖 (§1 價值 / 風險 / 機會) ═══ */}
        {subTab === '主管視圖' && (
          <>
            {/* C1 客戶價值卡 + 升降趨勢 */}
            <div className="card">
              <div className="ch">
                <div><h3>客戶價值</h3><div className="csub">累計消費 × 服務次數 × 等級趨勢</div></div>
                <span className="pill g">{w.identity.tier}</span>
              </div>
              <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="kpi green">
                  <div className="lbl">累計消費(公式)</div>
                  <div className="val">128.9K<span className="u">NT$</span></div>
                  <div className="ft"><span className="delta">銷 92.8K + 維 28.1K + 匯 8K</span></div>
                </div>
                <div className="kpi purple">
                  <div className="lbl">累計服務(公式)</div>
                  <div className="val">{w.finance.servicesTotal}<span className="u">次</span></div>
                  <div className="ft"><span className="delta">系統 {w.finance.services} + 匯入 {w.finance.servicesImported}</span></div>
                </div>
                <div className="kpi green">
                  <div className="lbl">客戶等級</div>
                  <div className="val">E<span className="u">蛋黃克人</span></div>
                  <div className="ft"><span className="delta">{w.identity.segment} {w.identity.segLv} · 升降 {w.identity.segDelta}</span></div>
                </div>
                <div className="kpi orange">
                  <div className="lbl">平均客單</div>
                  <div className="val">8.6K<span className="u">NT$</span></div>
                  <div className="ft"><span className="delta">{w.finance.totalAmt.toLocaleString()} / {w.finance.servicesTotal}</span></div>
                </div>
              </div>
            </div>

            {/* C2 價值象限定位 */}
            <div className="card">
              <div className="ch">
                <div><h3>價值象限定位</h3><div className="csub">消費金額 × 互動頻率</div></div>
                <span className="pill r">{w.valueQuadrant.label}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
                <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 240, display: 'block' }}>
                  {/* 4 象限框 */}
                  <line x1="110" y1="20" x2="110" y2="200" stroke="var(--as-line)" />
                  <line x1="20" y1="110" x2="200" y2="110" stroke="var(--as-line)" />
                  {/* 象限標籤 */}
                  <text x="170" y="32"  fontSize="9" fill="var(--as-mute)" textAnchor="middle">高消費 高互動</text>
                  <text x="170" y="200" fontSize="9" fill="var(--as-danger)" textAnchor="middle" fontWeight="700">高消費 低互動</text>
                  <text x="55"  y="32"  fontSize="9" fill="var(--as-mute)" textAnchor="middle">低消費 高互動</text>
                  <text x="55"  y="200" fontSize="9" fill="var(--as-mute)" textAnchor="middle">低消費 低互動</text>
                  {/* 軸線標籤 */}
                  <text x="110" y="14"  fontSize="8" fill="var(--as-mute)" textAnchor="middle">互動 高</text>
                  <text x="110" y="216" fontSize="8" fill="var(--as-mute)" textAnchor="middle">互動 低</text>
                  <text x="14"  y="113" fontSize="8" fill="var(--as-mute)" textAnchor="middle">↓消費</text>
                  <text x="206" y="113" fontSize="8" fill="var(--as-mute)" textAnchor="middle">↑消費</text>
                  {/* 客戶落點:x = 消費%, y = 100-互動% */}
                  {(() => {
                    const cx = 20 + (w.valueQuadrant.spendPct / 100) * 180
                    const cy = 20 + ((100 - w.valueQuadrant.interactPct) / 100) * 180
                    return (
                      <>
                        <circle cx={cx} cy={cy} r={14} fill="var(--as-danger)" opacity={0.18} />
                        <circle cx={cx} cy={cy} r={7}  fill="var(--as-danger)" />
                        <text x={cx + 12} y={cy + 4} fontSize="10" fill="var(--as-danger)" fontWeight="700">王</text>
                      </>
                    )
                  })()}
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--as-danger)', marginBottom: 6 }}>{w.valueQuadrant.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--as-ink-2)', lineHeight: 1.6, marginBottom: 10 }}>{w.valueQuadrant.desc}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                    <div style={{ padding: '8px 10px', background: 'var(--as-bg)', borderRadius: 6 }}>
                      <div style={{ color: 'var(--as-mute)', marginBottom: 2 }}>消費百分位</div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--f-mono)' }}>P{w.valueQuadrant.spendPct}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--as-bg)', borderRadius: 6 }}>
                      <div style={{ color: 'var(--as-mute)', marginBottom: 2 }}>互動百分位</div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--f-mono)' }}>P{w.valueQuadrant.interactPct}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* C3 兩欄:風險 + 機會 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* 流失/風險訊號 */}
              <div className="card">
                <div className="ch">
                  <div><h3 style={{ color: 'var(--as-danger)' }}>⚠ 流失 / 風險訊號</h3><div className="csub">毛利 / 觸及 / 保養三大警示</div></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {w.risks.map((r, i) => (
                    <div key={i} style={{ padding: '10px 12px', border: '1px solid var(--as-line)', borderLeft: `3px solid ${r.lv === 'r' ? 'var(--as-danger)' : 'var(--as-warning)'}`, borderRadius: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span className={`pill ${r.lv}`} style={{ fontSize: 10 }}>{r.lv === 'r' ? '高風險' : '中風險'}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.tag}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.5 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 成長機會 */}
              <div className="card">
                <div className="ch">
                  <div><h3 style={{ color: 'var(--as-primary)' }}>✦ 成長機會</h3><div className="csub">訂閱 / 加值 / 跨空間擴機</div></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {w.opportunities.map((o, i) => (
                    <div key={i} style={{ padding: '10px 12px', border: '1px solid var(--as-line)', borderLeft: '3px solid var(--as-primary)', borderRadius: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{o.tag}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--as-primary)', fontFamily: 'var(--f-mono)' }}>{o.val}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.5 }}>{o.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* C4 資料缺口旗標 */}
            <div className="card">
              <div className="ch">
                <div><h3>資料缺口旗標</h3><div className="csub">影響分群精準度 · {w.dataGaps.length} 欄空白</div></div>
                <span className="pill y">完整度 {w.identity.completeness}%</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {w.dataGaps.map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--as-warning-tint)', border: '1px solid #FDE68A', borderRadius: 6, fontSize: 11, color: '#713F12' }}>
                    <span style={{ fontWeight: 700 }}>{g.field}</span>
                    <span style={{ color: 'var(--as-mute)' }}>→ {g.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══ 客服視圖 (§2 聯絡 / 歷程 / 待辦) ═══ */}
        {subTab === '客服視圖' && (
          <>
            {/* D1 聯絡資訊 + D2 最近互動(2 欄) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="ch"><div><h3>聯絡資訊</h3><div className="csub">缺項以黃底標示</div></div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>手機</span>
                    <span className="mono">{w.contact.phone}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>Email</span>
                    <span style={{ background: 'var(--as-warning-tint)', padding: '2px 8px', borderRadius: 4, color: '#713F12', fontSize: 12, fontWeight: 600 }}>待補</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>Line ID</span>
                    <span style={{ background: 'var(--as-warning-tint)', padding: '2px 8px', borderRadius: 4, color: '#713F12', fontSize: 12, fontWeight: 600 }}>待補</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>可聯繫時間</span>
                    <span>{w.contact.timePref}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>聯繫偏好</span>
                    <span>{w.contact.channelPref}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="ch"><div><h3>最近互動</h3><div className="csub">最新一次接觸資訊</div></div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>最近派工</span>
                    <span className="mono">{w.recentActivity.lastDispatch}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>最近消費</span>
                    <span className="mono">{w.recentActivity.lastPurchase}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>消費類型</span>
                    <span>{w.recentActivity.lastType}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>處理顧問</span>
                    <span>{w.recentActivity.lastAgent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* D3 服務歷程摘要 */}
            <div className="card">
              <div className="ch"><div><h3>服務歷程摘要</h3><div className="csub">派工 / 定保 / 維修筆數 + 結案狀態</div></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {w.serviceSummary.map(s => (
                  <div key={s.type} style={{ padding: '12px 14px', background: 'var(--as-bg)', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--as-mute)', marginBottom: 4 }}>{s.type}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--f-mono)', marginBottom: 6 }}>{s.total}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="pill g" style={{ fontSize: 10 }}>已結 {s.closed}</span>
                      {s.open > 0 && <span className="pill r" style={{ fontSize: 10 }}>未結 {s.open}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* D4 Memo 重點濃縮 + 互動筆記時間軸 */}
            <div className="card">
              <div className="ch"><div><h3>Memo 重點濃縮</h3><div className="csub">體質與習慣 / 歷史處理 — 電話前先看這塊</div></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 6 }}>📌 體質與習慣</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {w.memo.physique.map((m, i) => (
                      <div key={i} style={{ padding: '6px 10px', background: 'var(--as-ab-tint)', borderRadius: 6, fontSize: 12, color: 'var(--as-ab-ink)' }}>{m}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 6 }}>📜 歷史處理</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {w.memo.history.map((m, i) => (
                      <div key={i} style={{ padding: '6px 10px', background: 'var(--as-cdefg-tint)', borderRadius: 6, fontSize: 12, color: 'var(--as-cdefg-ink)' }}>{m}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 6 }}>🕒 互動筆記時間軸</div>
              <div>
                {w.memoTimeline.map((ev, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 16px 1fr', gap: '0 12px', alignItems: 'start', paddingBottom: i < w.memoTimeline.length - 1 ? 12 : 0 }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--as-mute)', textAlign: 'right', paddingTop: 2 }}>{ev.d}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--as-primary)', marginTop: 4 }} />
                      {i < w.memoTimeline.length - 1 && <div style={{ width: 1.5, flex: 1, background: 'var(--as-line-2)', minHeight: 24 }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{ev.topic} · <span style={{ color: 'var(--as-mute)', fontWeight: 400 }}>{ev.who}</span></div>
                      <div style={{ fontSize: 11, color: 'var(--as-ink-2)', lineHeight: 1.5 }}>{ev.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* D5 待辦/提醒 */}
            <div className="card">
              <div className="ch">
                <div><h3>待辦 / 提醒</h3><div className="csub">下次定保倒數 / 濾網提醒 / 待補資料</div></div>
                <span className="pill r">{w.todos.filter(t => t.pri === 'r').length} 急</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {w.todos.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', border: '1px solid var(--as-line)', borderLeft: `3px solid ${t.pri === 'r' ? 'var(--as-danger)' : 'var(--as-warning)'}`, borderRadius: 6 }}>
                    <span className={`pill ${t.pri}`} style={{ fontSize: 10, flexShrink: 0 }}>{t.pri === 'r' ? '急' : '一般'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>{t.sub}</div>
                    </div>
                    <button className="btn" style={{ fontSize: 11 }}>處理</button>
                  </div>
                ))}
              </div>
            </div>

            {/* H1 保留:跨模組信號 */}
            <div className="card">
              <div className="ch">
                <div><h3>跨模組信號</h3><div className="csub">即時關聯資訊 · 可跳轉對應模組</div></div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CROSS_SIGNALS.map(sig => (
                  <div key={sig.mod} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--as-line)', borderRadius: 8, flex: '1 1 auto', minWidth: 180, cursor: 'pointer' }}>
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
          </>
        )}

        {/* ═══ 顧問視圖 (§3 到府前準備) ═══ */}
        {subTab === '顧問視圖' && (
          <>
            {/* E1 設備清單卡(克立淨真實機型 + 濾網規格) */}
            <div className="card">
              <div className="ch">
                <div><h3>設備清單</h3><div className="csub">{w.devices.length} 台克立淨機 · 各機型對應濾網規格</div></div>
              </div>
              <div className="dt-wrap">
                <table className="dt">
                  <thead>
                    <tr>
                      <th>機型</th>
                      <th>裝置 ID</th>
                      <th>位置</th>
                      <th>韌體</th>
                      <th>運行時數</th>
                      <th>濾網殘量</th>
                      <th>狀態</th>
                      <th>對應耗材規格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.devices.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontSize: 13, fontWeight: 700, color: 'var(--as-primary)' }}>{d.model}</td>
                        <td className="mono" style={{ fontSize: 11 }}>{d.id}</td>
                        <td style={{ fontSize: 12 }}>{d.location}</td>
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
                        <td><span className={`pill ${stCls(d.st as 'g' | 'y' | 'r')}`}>{stLabel(d.st as 'g' | 'y' | 'r')}</span></td>
                        <td style={{ fontSize: 11, color: 'var(--as-ink-2)' }}>{d.filterSpec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* E2 耗材盤點(全 0 → 黃底待補) */}
            <div className="card">
              <div className="ch">
                <div><h3>耗材盤點</h3><div className="csub">前置 / ECF / HEPA 各機型存量 · 全部 0 需到府確認</div></div>
                <span className="pill y">待補</span>
              </div>
              <div className="dt-wrap">
                <table className="dt">
                  <thead>
                    <tr>
                      <th>項目</th>
                      <th style={{ textAlign: 'center' }}>A71</th>
                      <th style={{ textAlign: 'center' }}>A51</th>
                      <th style={{ textAlign: 'center' }}>A81</th>
                      <th style={{ textAlign: 'center' }}>F501</th>
                      <th style={{ textAlign: 'center' }}>合計</th>
                      <th>旗標</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.consumables.map(c => (
                      <tr key={c.item}>
                        <td style={{ fontSize: 12, fontWeight: 600 }}>{c.item}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, background: c.a71 === 0 ? 'var(--as-warning-tint)' : 'transparent' }}>{c.a71}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, background: c.a51 === 0 ? 'var(--as-warning-tint)' : 'transparent' }}>{c.a51}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, background: c.a81 === 0 ? 'var(--as-warning-tint)' : 'transparent' }}>{c.a81}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, background: c.f501 === 0 ? 'var(--as-warning-tint)' : 'transparent' }}>{c.f501}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700 }}>{c.total}</td>
                        <td><span className="pill y">{c.flag}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* E3 歷次服務症狀預判 */}
            <div className="card">
              <div className="ch">
                <div><h3>歷次服務症狀 + 本次預判</h3><div className="csub">已知症狀重複次數 / 顧問判讀</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {w.symptoms.map((s, i) => (
                  <div key={i} style={{ padding: '12px 14px', border: '1px solid var(--as-line)', borderLeft: '3px solid var(--as-h)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--as-h)' }}>{s.tag}</span>
                      <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>×{s.count} 次</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--as-ink-2)', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--as-ab-tint)', borderLeft: '3px solid var(--as-primary)', borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 4 }}>📋 本次預判</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--as-ab-ink)' }}>{w.nextVisitPrediction}</div>
              </div>
            </div>

            {/* E4 客戶溝通眉角 + E5 金流備註(2 欄) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="ch"><div><h3>客戶溝通眉角</h3><div className="csub">議價 / 切入 / 放置 — 歷史經驗濃縮</div></div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {w.communicationTips.map((t, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12, padding: '8px 0', borderBottom: i < w.communicationTips.length - 1 ? '1px solid var(--as-line-2)' : 'none' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--as-primary)' }}>{t.k}</span>
                      <span style={{ fontSize: 12, color: 'var(--as-ink-2)', lineHeight: 1.6 }}>{t.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="ch"><div><h3>金流備註</h3><div className="csub">付款方式偏好</div></div></div>
                <div style={{ padding: '12px 14px', background: 'var(--as-bg)', borderRadius: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 4 }}>付款方式</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{w.payment.pref}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.5 }}>💡 {w.payment.note}</div>
              </div>
            </div>
          </>
        )}

        {/* ═══ 居家與畫像 (§0b + H 保留) ═══ */}
        {subTab === '居家與畫像' && (
          <>
            {/* H3 保留:居家 KPI */}
            <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="kpi green">
                <div className="lbl">DHI 健康指數</div>
                <div className="val">{w.identity.dhi.score}<span className="u">/ 100</span></div>
                <div className="ft"><span className="delta up"><Icon name="up" size={11} />{w.identity.dhi.grade} 級</span><Sparkline data={[70, 71, 72, 74, 75, 76, 77, 78, 78, 78]} color="var(--as-primary)" /></div>
              </div>
              <div className="kpi green">
                <div className="lbl">PM2.5 月均值</div>
                <div className="val">23.4<span className="u">µg/m³</span></div>
                <div className="ft"><span className="delta up">優良</span><Sparkline data={[28, 27, 26, 25, 25, 24, 24, 23, 23, 23]} color="var(--as-primary)" /></div>
              </div>
              <div className="kpi orange">
                <div className="lbl">超標事件</div>
                <div className="val">3<span className="u">次 / 月</span></div>
                <div className="ft"><span className="delta dn">客廳 A71 多</span><Sparkline data={[1, 2, 2, 3, 3, 4, 3, 3, 3, 3]} color="var(--as-h)" /></div>
              </div>
              <div className="kpi purple">
                <div className="lbl">設備在線率</div>
                <div className="val">75.0<span className="u">%</span></div>
                <div className="ft"><span className="delta">3/4 台正常</span><Sparkline data={[100, 100, 100, 75, 75, 75, 75, 75, 75, 75]} color="var(--as-cdefg)" /></div>
              </div>
            </div>

            {/* F1 居家環境卡 */}
            <div className="card">
              <div className="ch"><div><h3>居家環境</h3><div className="csub">住家型態 / 使用空間 / 居住成員 / 既有設備</div></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { lbl: '住家型態', v: w.homeEnv.type },
                  { lbl: '使用空間', v: w.homeEnv.space },
                  { lbl: '居住成員', v: w.homeEnv.members.join(' / ') },
                  { lbl: '有無電梯', v: w.homeEnv.elevator },
                  { lbl: '我牌清淨機', v: w.homeEnv.ours },
                  { lbl: '它牌清淨機', v: w.homeEnv.others },
                  { lbl: '居家乾淨度', v: w.homeEnv.cleanliness },
                  { lbl: '地址', v: w.homeEnv.address },
                ].map(m => (
                  <div key={m.lbl} style={{ padding: '10px 12px', background: 'var(--as-bg)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 4 }}>{m.lbl}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* F2 困擾標籤 4 群 */}
            <div className="card">
              <div className="ch"><div><h3>客戶困擾標籤</h3><div className="csub">成員 / 室外 / 室內 / 行為四維</div></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { k: '成員困擾',     items: w.troubles.member,   color: 'var(--as-danger)' },
                  { k: '室外汙染',     items: w.troubles.outdoor,  color: 'var(--as-h)' },
                  { k: '室內汙染',     items: w.troubles.indoor,   color: 'var(--as-warning)' },
                  { k: '行為困擾',     items: w.troubles.behavior, color: 'var(--as-cdefg)' },
                ].map(g => (
                  <div key={g.k}>
                    <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 8, paddingLeft: 4, borderLeft: `3px solid ${g.color}` }}>{g.k}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {g.items.map(it => (
                        <span key={it} style={{ padding: '4px 8px', background: 'var(--as-bg)', border: '1px solid var(--as-line)', borderRadius: 6, fontSize: 11, color: 'var(--as-ink-2)' }}>{it}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* F3 用戶個人標籤 + F4 商機來源 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="ch"><div><h3>用戶個人標籤</h3><div className="csub">畫像維度 · 影響推薦策略</div></div></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {w.personalTags.map(t => (
                    <div key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--as-bg)', borderRadius: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--as-mute)', flex: 1 }}>{t.k}</span>
                      <span className={`pill ${t.cls}`} style={{ fontSize: 11 }}>{t.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="ch"><div><h3>如何得知克立淨</h3><div className="csub">商機歸因 / 行銷分群依據</div></div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>管道</span>
                    <span style={{ fontWeight: 600 }}>{w.acquisition.channel}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--as-line-2)' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>商機來源</span>
                    <span>{w.acquisition.source}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, padding: '6px 0' }}>
                    <span style={{ color: 'var(--as-mute)', fontSize: 12 }}>推薦人</span>
                    <span style={{ fontSize: 12 }}>{w.acquisition.referrer}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* F5 30 天 PM2.5 完整圖(保留現有) */}
            <div className="card">
              <div className="ch"><div><h3>30 天 PM2.5 完整記錄</h3><div className="csub">環境佐證 · 含超標標記</div></div></div>
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
          </>
        )}

        {/* ═══ 訂閱與帳務(保留 + 加上送修明細) ═══ */}
        {subTab === '訂閱與帳務' && (
          <>
            <div className="card">
              <div className="ch">
                <div><h3>消費結構(公式合計)</h3><div className="csub">銷貨 + 維修 + 匯入 = 總累積</div></div>
                <span className="pill g">{w.identity.tier}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { lbl: '銷貨金額(機器)', v: `NT$${w.finance.salesAmt.toLocaleString()}` },
                  { lbl: '維修累計(耗材)', v: `NT$${w.finance.repairAmt.toLocaleString()}` },
                  { lbl: '匯入累計', v: `NT$${w.finance.importedAmt.toLocaleString()}` },
                  { lbl: '總累積(公式)', v: `NT$${w.finance.totalAmt.toLocaleString()}`, em: true },
                ].map(m => (
                  <div key={m.lbl} style={{ padding: '12px 14px', background: m.em ? 'var(--as-ab-tint)' : 'var(--as-bg)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 4 }}>{m.lbl}</div>
                    <div style={{ fontWeight: 700, fontSize: m.em ? 16 : 14, fontFamily: 'var(--f-mono)', color: m.em ? 'var(--as-ab-ink)' : 'var(--as-ink)' }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="ch"><div><h3>送修明細</h3><div className="csub">{w.repairOrders.length} 筆送修單 · 含品項與優惠</div></div></div>
              <div className="dt-wrap">
                <table className="dt">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>送修單號</th>
                      <th>品項</th>
                      <th style={{ textAlign: 'right' }}>金額</th>
                      <th>備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.repairOrders.map(o => (
                      <tr key={o.ord}>
                        <td className="mono" style={{ fontSize: 11 }}>{o.d}</td>
                        <td className="mono" style={{ fontSize: 12 }}>{o.ord}</td>
                        <td style={{ fontSize: 12 }}>{o.items}</td>
                        <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>NT${o.amt.toLocaleString()}</td>
                        <td style={{ fontSize: 11, color: 'var(--as-mute)' }}>{o.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="ch"><div><h3>帳務記錄</h3><div className="csub">共 {FINANCE_RECORDS.length} 筆交易 · 含訂閱與耗材</div></div></div>
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
            </div>
          </>
        )}

        </div>

        {/* ═══ G1 浮動 AI 側欄(隨 tab 切換內容) ═══ */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 16 }}>
          <div style={{ margin: '-16px -16px 16px', padding: '12px 16px', background: subTab === '主管視圖' ? 'linear-gradient(135deg, #DC2626, #F97316)' : subTab === '客服視圖' ? 'linear-gradient(135deg, #4F46E5, #6366F1)' : subTab === '顧問視圖' ? 'linear-gradient(135deg, #0E7A66, #16A085)' : subTab === '居家與畫像' ? 'linear-gradient(135deg, #D97706, #F59E0B)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="sparkles" size={16} />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>
              AI 建議 · {subTab === '主管視圖' ? '主管' : subTab === '客服視圖' ? '客服' : subTab === '顧問視圖' ? '顧問' : subTab === '居家與畫像' ? '畫像' : '帳務'}視角
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>3 項建議</span>
          </div>

          {/* 各 tab 對應 AI 建議 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(subTab === '主管視圖' ? [
              { pri: '高', priCls: 'r', title: '訂閱化耗材配送', desc: '4 機型耗材合計年消費 NT$24K · 散買轉訂閱可鎖 LTV', action: '推送訂閱方案' },
              { pri: '高', priCls: 'r', title: '補上 Email / Line', desc: '行銷觸及率 < 60% · 補齊後可大幅提升再行銷效果', action: '安排補資料任務' },
              { pri: '中', priCls: 'y', title: 'AirCare 季報試水', desc: '高敏家庭適配 95% · 客戶曾主動詢問', action: '加入推送清單' },
            ] : subTab === '客服視圖' ? [
              { pri: '高', priCls: 'r', title: '下一通電話這樣開場', desc: '直接提小孩房 A81 殘量 14% 急需更換 · 順帶問春季過敏狀況', action: '看 Memo 後撥打' },
              { pri: '高', priCls: 'r', title: '順帶補資料', desc: 'Email / Line ID / 職業 / 居住成員 · 4 欄一次補齊', action: '開啟資料清單' },
              { pri: '中', priCls: 'y', title: '2027/05 提前回訪', desc: '建議定保日前 60 天進入回訪流程', action: '加入提醒' },
            ] : subTab === '顧問視圖' ? [
              { pri: '高', priCls: 'r', title: '到府前帶料', desc: '前置 ×4 + ECF ×5 + HEPA H13 ×4 (含預備量)', action: '產出領料單' },
              { pri: '高', priCls: 'r', title: '預判處理項目', desc: '客廳 A71 主板巡檢 + 全機深度清潔(電漿積碳)', action: '列入工單' },
              { pri: '中', priCls: 'y', title: '溝通備忘', desc: '先報全價再 −8% · 主推空品訴求(小孩房優先)', action: '加入備忘錄' },
            ] : subTab === '居家與畫像' ? [
              { pri: '高', priCls: 'r', title: '春霾季加強建議', desc: '基隆河沿岸 + 重劃區揚塵 · 4–5 月為高發期', action: '推送濾網升級' },
              { pri: '中', priCls: 'y', title: '寵物毛屑配置', desc: 'F501 書房可換到貓主要活動區', action: '安排巡檢調整' },
              { pri: '中', priCls: 'y', title: '烹飪時段運轉', desc: '主臥 A51 烹飪時應靜置 · 改為書房 F501 強運轉', action: '推送使用建議' },
            ] : [
              { pri: '高', priCls: 'r', title: '訂閱制升級試算', desc: '4 機型耗材年訂閱 · 公式試算年省 NT$3,200', action: '模擬報價' },
              { pri: '中', priCls: 'y', title: '自動扣款優惠', desc: '線下刷卡可考慮信用卡綁定 + 5% off', action: 'E-Mail 推送' },
              { pri: '低', priCls: 'g', title: '送修閉環升級', desc: '上次優惠 −8% · 可建議 LTV 加值方案', action: '加入後續' },
            ]).map((rec, i) => (
              <div key={i} style={{ padding: '12px 14px', border: '1px solid var(--as-line)', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: rec.priCls === 'r' ? 'var(--as-danger)' : rec.priCls === 'y' ? 'var(--as-warning)' : 'var(--as-success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span className={`pill ${rec.priCls}`} style={{ fontSize: 10 }}>{rec.pri}優先</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{rec.title}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--as-ink-2)', marginBottom: 10, lineHeight: 1.5 }}>{rec.desc}</div>
                <button className="btn" style={{ width: '100%', fontSize: 12, justifyContent: 'center' }}>{rec.action}</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(14,122,102,0.06)', borderRadius: 8, fontSize: 11, color: 'var(--as-mute)', lineHeight: 1.5 }}>
            AI 建議依「當前角色視圖 + IoT 數據 + 服務記錄 + 消費行為」綜合判讀 · 每日更新
          </div>
        </div>
      </div>
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
