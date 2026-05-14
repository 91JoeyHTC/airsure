/* AirSure — Module H: 營運決策中心 */
import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  H_KPIS,
  H_RECS,
  H_CATEGORIES,
  ADOPTED_RECS,
  HISTORY_RECS,
} from '../../mocks/module-h'

// ── Embedded AI Chat ───────────────────────────────────────────────────────────
function EmbeddedChat() {
  const [msgs, setMsgs] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  const CHIPS = ['今日建議摘要', '最高優先項目', '採納效果如何？', '跨模組關聯？']
  const MOCK_RESPONSES: Record<string, string> = {
    '今日建議摘要': '今日共 8 條新 AI 建議，預估可挽回收入 NT$184,000。最高優先：王淑芬 (M-009203) 場域設備離線 48 小時 + 5 位高級會員濾網逾期，需立即處理。',
    '最高優先項目': '最高優先 2 條：①高級會員王太太臺中場域 4 台設備離線 48 小時，距訂閱到期 27 天，歷史流失率 64%，建議立即指派顧問致電。②5 位高級會員 14 台設備濾網逾期 18 天，建議批次派工 + 自動配送。',
    '採納效果如何？': '本月已採納 14 條建議，成功 10 條、部分成功 3 條、未達標 1 條，整體採納率 68.4% 創季度新高。累計挽回 NT$1.24M，ROI 5.4×。',
    '跨模組關聯？': '目前有 3 條跨模組關聯建議：A (場域) → E (會員)：臺中異常場域對應即將到期的高級會員；C (服務) → D (產品)：CO₂ 感測器工單 → 批次韌體升級；F (營收) → G (行銷)：銀級轉換率 16.8% 建議延長春季活動。',
  }
  const DEFAULT_MOCK = '已分析跨模組資料。目前有 8 條新 AI 建議，預估可挽回 NT$184,000 收入及降低 22 張工單/月。建議優先處理高 LTV 會員流失風險及設備逾期維護問題。'

  const send = async (text: string) => {
    if (!text.trim() || busy) return
    const userText = text
    setMsgs(p => [...p, { role: 'user', text: userText }])
    setInput('')
    setBusy(true)
    await new Promise(r => setTimeout(r, 800))
    const reply = MOCK_RESPONSES[userText] ?? DEFAULT_MOCK
    setBusy(false)
    setMsgs(p => [...p, { role: 'ai', text: reply }])
  }

  return (
    <div style={{ border: '1px solid var(--as-line)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 180, maxHeight: 300 }}>
      <div style={{ padding: '12px 14px', background: 'linear-gradient(90deg, var(--as-h-tint) 0%, #fff 100%)', borderBottom: '1px solid var(--as-line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--as-h)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkles" size={15} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--as-h-ink)' }}>AI 特助</div>
          <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>Claude Haiku 4.5 · 營運決策中心</div>
        </div>
        <button onClick={() => setMsgs([])} style={{ background: 'var(--as-bg)', border: '1px solid var(--as-line)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: 'var(--as-mute)', fontFamily: 'inherit' }}>清除</button>
      </div>

      {/* Quick chips */}
      {msgs.length === 0 && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--as-line-2)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CHIPS.map(c => (
            <button key={c} onClick={() => send(c)} style={{ background: 'var(--as-h-tint)', border: '1px solid #FED7AA', borderRadius: 16, padding: '4px 10px', fontSize: 11, color: 'var(--as-h-ink)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Message area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '88%', padding: '7px 11px', borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '3px 12px 12px 12px', background: m.role === 'user' ? 'var(--as-h)' : 'var(--as-bg)', color: m.role === 'user' ? '#fff' : 'var(--as-ink)', fontSize: 12, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', gap: 4, padding: 4 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--as-h)', opacity: 0.5 }} />)}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--as-line)', display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="輸入問題…"
          style={{ flex: 1, height: 32, border: '1px solid var(--as-line)', borderRadius: 6, padding: '0 10px', fontSize: 12, fontFamily: 'inherit', background: 'var(--as-bg)', outline: 'none' }}
        />
        <button
          onClick={() => send(input)}
          style={{ width: 32, height: 32, background: 'var(--as-h)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Category Pills (Left Column) ───────────────────────────────────────────────
function CategoryPills({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {H_CATEGORIES.map(c => (
        <button
          key={c.k}
          onClick={() => onChange(c.k)}
          style={{
            padding: '6px 14px', borderRadius: 18, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            border: `1.5px solid ${active === c.k ? c.accent : 'var(--as-line)'}`,
            background: active === c.k ? `${c.accent}18` : '#fff',
            color: active === c.k ? c.accent : 'var(--as-ink-2)',
            fontWeight: active === c.k ? 600 : 400,
          }}
        >
          {c.nm}
          <span style={{ fontSize: 10, marginLeft: 5, fontWeight: 600 }}>({c.total})</span>
        </button>
      ))}
    </div>
  )
}

// ── 全部建議 Tab ───────────────────────────────────────────────────────────────
function AllRecsTab() {
  const [activeCat, setActiveCat] = useState('member')
  const cat = H_CATEGORIES.find(c => c.k === activeCat) ?? H_CATEGORIES[0]

  // Show recs matching category
  const catRecs = H_RECS.filter(r => {
    if (activeCat === 'member') return r.cat === 'revenue' || r.src.includes('B') || r.src.includes('E')
    if (activeCat === 'mkt') return r.cat === 'brand' || r.src.includes('G')
    if (activeCat === 'svc') return r.cat === 'service'
    if (activeCat === 'prod') return r.src.includes('D') || r.src.includes('F → D')
    return true
  }).slice(0, 3)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '45fr 55fr', gap: 20 }}>
      {/* LEFT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* AI 摘要橫幅 */}
        <div style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, var(--as-h-tint) 0%, #FFF3CD 100%)',
          border: '1px solid #FDE68A', borderLeft: '4px solid var(--as-h)', borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="sparkles" size={16} />
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--as-h-ink)' }}>AI 建議摘要 · 今日</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--as-mute)' }}>09:42 更新</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--as-ink-2)', lineHeight: 1.6 }}>
            今日共 <b>8 條新建議</b>，預估可挽回 <b>NT$ 184,000</b> 收入及降低 <b>22 張工單/月</b>。
            2 條高優先 (A+E 跨模組)，採納率 <b>68.4%</b> 創季度新高。
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12 }}>
            {[['NT$ 184K', '本週估值'], ['87%', '平均信心'], ['14', '本月採納']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-h)' }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Embedded AI Chat */}
        <EmbeddedChat />

        {/* Advisory Category Pills */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--as-mute)', marginBottom: 8, fontWeight: 500 }}>四大職能建議分類</div>
          <CategoryPills active={activeCat} onChange={setActiveCat} />
        </div>
      </div>

      {/* RIGHT: 3 rec cards based on active category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ padding: '10px 14px', background: '#fff', border: '1px solid var(--as-line)', borderRadius: 8, marginBottom: 4 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: cat.accent, marginBottom: 2 }}>{cat.nm}</div>
          <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>{cat.sub} · {cat.total} 條建議 · 預估影響 {cat.impact}</div>
        </div>
        {cat.items.map((it, i) => (
          <div key={i} style={{
            border: `1px solid ${it.lv === 'high' ? '#FCA5A5' : 'var(--as-line)'}`,
            borderLeft: `4px solid ${it.lv === 'high' ? cat.accent : it.lv === 'mid' ? 'var(--as-warning)' : 'var(--as-mute-2)'}`,
            borderRadius: 8, padding: '14px 16px',
            background: it.lv === 'high' ? `${cat.accent}08` : '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, color: '#fff',
                background: it.lv === 'high' ? cat.accent : it.lv === 'mid' ? 'var(--as-warning)' : 'var(--as-mute-2)',
              }}>{it.tag}</span>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--as-ink)' }}>{it.t}</h4>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--as-ink-2)', lineHeight: 1.6 }}>{it.d}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {it.m.map((m, j) => (
                <span key={j} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'var(--as-bg)', border: '1px solid var(--as-line)', color: 'var(--as-ink-2)' }}>{m}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" style={{ fontSize: 12, padding: '5px 12px' }}>稍後</button>
              <button style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: cat.accent, border: 'none', color: '#fff', cursor: 'pointer' }}>{it.act} →</button>
            </div>
          </div>
        ))}
        {catRecs.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--as-mute)', padding: 40, fontSize: 13 }}>
            此類別目前無待處理建議
          </div>
        )}
      </div>
    </div>
  )
}

// ── 已採納 Tab ─────────────────────────────────────────────────────────────────
function AdoptedTab() {
  const PHASES = [
    { l: '立即執行 (0–7天)', n: 7, pct: 50, color: 'var(--as-danger)' },
    { l: '短期 (8–14天)', n: 4, pct: 28, color: 'var(--as-h)' },
    { l: '中期 (15–30天)', n: 3, pct: 22, color: 'var(--as-cdefg)' },
  ]
  const BOARD = [
    { av: '王', nm: '王顧問', role: '客服顧問', adopted: 5, roi: 'NT$ 226K', medal: '🥇' },
    { av: '林', nm: '林技術員', role: '高級技術員', adopted: 4, roi: 'NT$ 178K', medal: '🥈' },
    { av: '行', nm: '行銷主管', role: '行銷主管', adopted: 3, roi: 'NT$ 144K', medal: '🥉' },
  ]

  return (
    <div>
      {/* 5 metric KPIs */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 20 }}>
        {[
          { lbl: '已採納', val: '14', u: '條', cls: 'purple', spark: [8,9,10,11,12,12,13,13,14,14] },
          { lbl: '成功', val: '10', u: '條', cls: 'green', spark: [5,6,7,7,8,8,9,9,10,10] },
          { lbl: '部分成功', val: '3', u: '條', cls: 'orange', spark: [1,2,2,2,2,3,3,3,3,3] },
          { lbl: '未達標', val: '1', u: '條', cls: 'red', spark: [0,0,1,1,1,1,1,1,1,1] },
          { lbl: '累計挽回', val: 'NT$1.24M', u: '', cls: 'green', spark: [700,800,900,950,1000,1050,1100,1150,1200,1240] },
        ].map(k => (
          <div key={k.lbl} className={`kpi ${k.cls}`}>
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}{k.u && <span className="u">{k.u}</span>}</div>
            <div className="ft">
              <Sparkline data={k.spark} color={k.cls === 'green' ? 'var(--as-primary)' : k.cls === 'orange' ? 'var(--as-h)' : k.cls === 'red' ? 'var(--as-danger)' : 'var(--as-cdefg)'} />
            </div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        {/* Adoption timeline */}
        <div className="card">
          <div className="ch"><div><h3>採納時間軸</h3><div className="csub">按執行時程分類</div></div></div>
          {PHASES.map(p => (
            <div key={p.l} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <div style={{ width: 130, fontSize: 12, color: 'var(--as-mute)', flexShrink: 0 }}>{p.l}</div>
              <div style={{ flex: 1, height: 28, position: 'relative' }}>
                <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                  <span style={{ color: '#fff', fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{p.n}</span>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--as-mute)', width: 36 }}>{p.pct}%</span>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="ch"><div><h3>採納排行榜</h3><div className="csub">ROI 累計 · 本季</div></div></div>
          {BOARD.map(b => (
            <div key={b.nm} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, padding: '10px 12px', background: 'var(--as-bg)', borderRadius: 8 }}>
              <span style={{ fontSize: 20 }}>{b.medal}</span>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--as-cdefg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{b.av}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.nm}</div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>{b.role} · 採納 {b.adopted} 條</div>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, color: 'var(--as-success)', fontSize: 13 }}>{b.roi}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Adopted recs table */}
      <div className="card">
        <div className="ch"><div><h3>已採納建議 · 成效追蹤</h3><div className="csub">採納後 ROI 5.4×</div></div></div>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th>編號</th>
                <th>建議摘要</th>
                <th>採納日期</th>
                <th>執行期</th>
                <th>挽回 / 效益</th>
                <th>結果</th>
                <th>負責</th>
              </tr>
            </thead>
            <tbody>
              {ADOPTED_RECS.map(r => (
                <tr key={r.id}>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--as-mute)' }}>{r.id}</td>
                  <td style={{ maxWidth: 200 }}><div className="dt-nm">{r.ttl}</div></td>
                  <td style={{ fontSize: 11, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>{r.adoptedDate}</td>
                  <td><span className="tt">{r.period}</span></td>
                  <td style={{ fontFamily: 'var(--f-mono)', fontWeight: 600, color: 'var(--as-success)' }}>{r.roi}</td>
                  <td><span className={`pill ${r.resultCls}`}>{r.result}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--as-mute)' }}>{r.member}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── 歷史紀錄 Tab ───────────────────────────────────────────────────────────────
function HistoryTab() {
  const REJECT_REASONS = [
    { nm: '預算限制', n: 3, pct: 33.3 },
    { nm: '技術整合未就緒', n: 2, pct: 22.2 },
    { nm: '客群不符', n: 2, pct: 22.2 },
    { nm: '優先序調整', n: 1, pct: 11.1 },
    { nm: '業務資源不足', n: 1, pct: 11.1 },
  ]
  const MODEL_ACCURACY = [
    { model: 'churn-v3.2', accuracy: 87, improvement: '+1.2 pp', prev: 85.8 },
    { model: 'maintenance-v2.1', accuracy: 91, improvement: '+0.8 pp', prev: 90.2 },
    { model: 'revenue-v1.4', accuracy: 83, improvement: '+0.4 pp', prev: 82.6 },
  ]

  return (
    <div>
      {/* 4 KPIs */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { lbl: '駁回', val: '9', u: '條', cls: 'red', spark: [5,6,6,7,7,8,8,9,9,9] },
          { lbl: '過期', val: '8', u: '條', cls: 'orange', spark: [4,5,5,6,6,7,7,8,8,8] },
          { lbl: '延後', val: '5', u: '條', cls: 'purple', spark: [2,3,3,4,4,4,5,5,5,5] },
          { lbl: '精度回饋', val: '+2.4', u: '%', cls: 'green', spark: [0.5,0.8,1.0,1.2,1.5,1.8,2.0,2.1,2.3,2.4] },
        ].map(k => (
          <div key={k.lbl} className={`kpi ${k.cls}`}>
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}{k.u && <span className="u">{k.u}</span>}</div>
            <div className="ft">
              <Sparkline data={k.spark} color={k.cls === 'green' ? 'var(--as-primary)' : k.cls === 'orange' ? 'var(--as-h)' : k.cls === 'red' ? 'var(--as-danger)' : 'var(--as-cdefg)'} />
            </div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        {/* Rejection reason chart */}
        <div className="card">
          <div className="ch"><div><h3>駁回原因分析</h3><div className="csub">本季 9 筆駁回</div></div></div>
          {REJECT_REASONS.map((d, i) => (
            <div key={d.nm} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, fontWeight: 700, fontSize: 10,
                background: i < 2 ? 'var(--as-danger)' : i < 4 ? 'var(--as-warning)' : 'var(--as-mute-2)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              <div style={{ fontSize: 12, color: 'var(--as-ink-2)', width: 130, flexShrink: 0 }}>{d.nm}</div>
              <div style={{ flex: 1, height: 16, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.pct / 35 * 100}%`, background: i < 2 ? 'var(--as-danger)' : 'var(--as-warning)', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, fontFamily: 'var(--f-mono)', color: 'var(--as-mute)', width: 56 }}>
                {d.n} <span style={{ fontSize: 10 }}>({d.pct.toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Model feedback */}
        <div className="card">
          <div className="ch"><div><h3>模型學習回饋</h3><div className="csub">駁回 / 過期紀錄提升精度</div></div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {MODEL_ACCURACY.map(m => (
              <div key={m.model} style={{ padding: '10px 12px', border: '1px solid var(--as-line)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, fontFamily: 'var(--f-mono)' }}>{m.model}</span>
                  <span style={{ fontSize: 12, color: 'var(--as-success)', fontWeight: 600 }}>{m.improvement}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 8, background: 'var(--as-line-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.accuracy}%`, background: 'var(--as-primary)', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 13, width: 36 }}>{m.accuracy}%</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--as-mute)', marginTop: 4 }}>前次 {m.prev}% → 現在 {m.accuracy}%</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--as-h-tint)', borderRadius: 6, fontSize: 12, color: 'var(--as-h-ink)' }}>
            ★ 本季回饋學習共 22 筆 · 整體模型精度提升 +2.4 pp
          </div>
        </div>
      </div>

      {/* History cards */}
      <div className="card">
        <div className="ch"><div><h3>歷史紀錄</h3><div className="csub">近 90 天 · 用於模型回饋學習</div></div></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {HISTORY_RECS.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '12px 16px', border: '1px solid var(--as-line)', borderRadius: 8, background: '#fff',
            }}>
              <div style={{ minWidth: 80, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--as-mute)', paddingTop: 2 }}>{r.id}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--as-ink)', marginBottom: 4 }}>{r.ttl}</div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>{r.date} · {r.reason} · {r.feedback}</div>
              </div>
              <span style={{
                padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, flexShrink: 0, color: '#fff',
                background: r.status === '駁回' ? 'var(--as-danger)' : r.status === '過期' ? 'var(--as-warning)' : 'var(--as-cdefg)',
              }}>{r.status}</span>
              <button style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, flexShrink: 0, border: '1px solid var(--as-line)', background: '#fff', color: 'var(--as-cdefg)', cursor: 'pointer', fontFamily: 'inherit' }}>
                重新評估 →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Module H Main ──────────────────────────────────────────────────────────────
export function ModuleH() {
  const [tab, setTab] = useState('all')

  // Use H_RECS to show count accurately
  const totalRecs = H_RECS.length

  return (
    <PageShell
      tk="H"
      tkClass="h"
      title="營運決策中心"
      sub="智能模組 · AI 決策支援"
      showFAB={false}
      actions={
        <><button className="btn"><Icon name="download" size={14} />匯出報告</button></>
      }
      tabs={[
        { k: 'all',      l: '全部建議', n: totalRecs },
        { k: 'adopted',  l: '已採納',   n: 14 },
        { k: 'history',  l: '歷史紀錄', n: 22 },
      ]}
      activeTab={tab}
      onTab={setTab}
    >
      {/* KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {H_KPIS.map(k => (
          <div key={k.lbl} className={`kpi ${k.cls}`}>
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}{k.unit && <span className="u">{k.unit}</span>}</div>
            <div className="ft">
              <span className={`delta ${k.deltaUp ? 'up' : 'dn'}`}>
                <Icon name={k.deltaUp ? 'up' : 'down'} size={11} />{k.delta}
              </span>
              <Sparkline data={k.spark} color={k.cls === 'orange' ? 'var(--as-h)' : 'var(--as-primary)'} />
            </div>
          </div>
        ))}
      </div>

      {tab === 'all'     && <AllRecsTab />}
      {tab === 'adopted' && <AdoptedTab />}
      {tab === 'history' && <HistoryTab />}
    </PageShell>
  )
}
