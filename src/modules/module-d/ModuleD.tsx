import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  PRODUCTS,
  FLEET_DEVICES,
  CONSUMABLE_STOCK,
  SCHEDULED_REPLACEMENTS,
  QUALITY_ROWS,
  DEFECT_PARETO,
  YIELD_MONTHS,
  YIELD_TREND,
  FIRMWARE_VERSIONS,
} from '../../mocks/module-d'

// ── Sub-view: 產品目錄 ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { nm: '空氣清淨機',       skus: 3, rev: '42.8M', status: 'live' as const },
  { nm: '廚餘機',           skus: 1, rev: '11.2M', status: 'live' as const },
  { nm: '空氣清淨機耗材配件', skus: 2, rev: '8.6M',  status: 'live' as const },
  { nm: '廚餘機耗材配件',   skus: 2, rev: '3.1M',  status: 'live' as const },
  { nm: '維修服務',         skus: 4, rev: '6.4M',  status: 'live' as const },
  { nm: '即將推出',         skus: 1, rev: '—',      status: 'soon' as const },
]

function CatalogView() {
  return (
    <>
      <div className="fb" style={{ marginTop: 16, marginBottom: 16 }}>
        <span className="chip on">全部<span className="n">7</span></span>
        <span className="chip">空氣清淨機<span className="n">3</span></span>
        <span className="chip">廚餘機<span className="n">1</span></span>
        <span className="chip">耗材配件<span className="n">4</span></span>
        <span className="chip">即將推出<span className="n">1</span></span>
        <span className="sp"></span>
        <input className="search" placeholder="產品名稱 / SKU" />
      </div>

      {/* Category cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {CATEGORIES.map(c => (
          <div className="card" key={c.nm} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="bd-nm" style={{ fontSize: 15, fontWeight: 700 }}>{c.nm}</div>
              <span className={`pill ${c.status === 'soon' ? 'y' : 'g'}`}>
                {c.status === 'soon' ? '即將推出' : '上架中'}
              </span>
            </div>
            <div className="bd" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="bdr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--as-mute)' }}>SKU 數量</span>
                <span className="mono" style={{ fontWeight: 700, fontSize: 18 }}>{c.skus}</span>
              </div>
              <div className="bdr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--as-mute)' }}>本月營收</span>
                <span className="mono" style={{ fontWeight: 600 }}>NT$ {c.rev}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product detail table */}
      <div className="dt-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>產品名稱</th>
              <th>SKU</th>
              <th>類別</th>
              <th>售價</th>
              <th>庫存</th>
              <th>累計銷量</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="dt-nm">{p.nm}</div>
                  <div className="dt-sub">{p.cat}</div>
                </td>
                <td className="mono" style={{ color: 'var(--as-mute)', fontSize: 11 }}>{p.id}</td>
                <td>{p.cat}</td>
                <td className="mono">NT$ {p.px.toLocaleString()}</td>
                <td className="mono">
                  <span style={{ color: p.stk === 0 ? 'var(--as-danger)' : p.stk < 100 ? 'var(--as-warning)' : undefined }}>
                    {p.stk.toLocaleString()}
                  </span>
                </td>
                <td className="mono">{p.sold.toLocaleString()}</td>
                <td>
                  <span className={`pill ${p.status === 'live' ? 'g' : p.status === 'soon' ? 'y' : 'r'}`}>
                    {p.status === 'live' ? '上架' : p.status === 'soon' ? '即將推出' : '缺貨'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="rowbtn"><Icon name="eye" size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="dt-foot">
          <span>顯示 {PRODUCTS.length} / 7 款產品</span>
          <div className="pager">
            <button>‹</button>
            <button className="on">1</button>
            <button>›</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-view: 裝置艦隊 ─────────────────────────────────────────────────────────
function FleetView() {
  const lampLabel = (l: 'g' | 'y' | 'r') =>
    l === 'g' ? '正常' : l === 'y' ? '警示' : '離線'

  return (
    <>
      {/* Summary strip */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', margin: '16px 0' }}>
        <div className="kpi green">
          <div className="lbl">已部署裝置</div>
          <div className="val">12,481<span className="u">台</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+342 本月</span></div>
        </div>
        <div className="kpi red">
          <div className="lbl">離線裝置</div>
          <div className="val">11<span className="u">台</span></div>
          <div className="ft"><span className="delta dn">0.09% 離線率</span></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">警示裝置</div>
          <div className="val">128<span className="u">台</span></div>
          <div className="ft"><span className="delta">需檢查</span></div>
        </div>
        <div className="kpi purple">
          <div className="lbl">最新韌體覆蓋</div>
          <div className="val">78.9<span className="u">%</span></div>
          <div className="ft"><span className="delta up">v2.4.1</span></div>
        </div>
      </div>

      {/* Firmware distribution bar */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="ch">
          <div><h3>韌體版本分佈</h3><span className="csub">12,481 台</span></div>
        </div>
        <div className="bd" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { v: 'v2.4.1', p: 78.9, n: 9842,  cls: 'var(--as-success)' },
            { v: 'v2.4.0', p: 14.6, n: 1820,  cls: 'var(--as-cdefg)'  },
            { v: 'v2.3.8', p: 4.9,  n: 612,   cls: 'var(--as-h)'      },
            { v: 'v2.3.6', p: 1.7,  n: 207,   cls: 'var(--as-danger)' },
          ].map(fw => (
            <div className="bdr" key={fw.v} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="bd-nm" style={{ minWidth: 60, fontSize: 12, fontFamily: 'var(--f-mono)' }}>{fw.v}</div>
              <div className="bd-tr" style={{ flex: 1 }}>
                <div className="bd-fi" style={{ width: `${fw.p}%`, background: fw.cls }}></div>
              </div>
              <div className="bd-v mono" style={{ minWidth: 80, textAlign: 'right', fontSize: 12 }}>
                {fw.n.toLocaleString()} · {fw.p}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dt-wrap">
        <div className="fb" style={{ padding: '8px 0 12px', borderBottom: '1px solid var(--as-line-2)', marginBottom: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--as-success)', display: 'inline-block' }}></span>
            正常 <b className="mono">12,342</b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--as-warning)', display: 'inline-block' }}></span>
            警示 <b className="mono">128</b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--as-danger)', display: 'inline-block' }}></span>
            離線 <b className="mono">11</b>
          </span>
          <span className="sp"></span>
          <input className="search" placeholder="裝置 ID / 型號 / 場域" style={{ width: 220 }} />
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>裝置編號</th>
              <th>型號</th>
              <th>韌體版本</th>
              <th>場域 / 地點</th>
              <th>所有人</th>
              <th>運轉時數</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {FLEET_DEVICES.map(d => (
              <tr key={d.id}>
                <td className="mono">{d.id}</td>
                <td>
                  <div className="dt-nm">{d.model}</div>
                  <div className="dt-sub">{d.installed}</div>
                </td>
                <td className="mono">{d.fw}</td>
                <td>{d.site}</td>
                <td>{d.owner}</td>
                <td className="mono">{d.uptime} h</td>
                <td>
                  <span className="lamp">
                    <span className={`d ${d.lamp}`}></span>
                    {lampLabel(d.lamp)}
                  </span>
                </td>
                <td>
                  <button className="rowbtn"><Icon name="eye" size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="dt-foot">
          <span>顯示 {FLEET_DEVICES.length} / 12,481 台裝置</span>
          <div className="pager">
            <button>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <span className="ell">…</span>
            <button>1248</button>
            <button>›</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-view: 耗材庫存 ─────────────────────────────────────────────────────────
function urgencyLabel(cls: '' | 'y' | 'r', days: number): string {
  if (cls === 'r') return '緊急補充'
  if (cls === 'y') return '即將到期'
  if (days === 0)  return '已斷貨'
  return '充足'
}

function urgencyPillCls(cls: '' | 'y' | 'r'): string {
  if (cls === 'r') return 'r'
  if (cls === 'y') return 'y'
  return 'g'
}

function ConsumableView() {
  return (
    <>
      <div className="two-col" style={{ marginTop: 16 }}>
        {/* Stock level cards */}
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="ch">
              <div><h3>耗材庫存水位</h3><span className="csub">即時更新 · 2 分鐘前</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {CONSUMABLE_STOCK.map(s => (
                <div key={s.nm}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{s.nm}</span>
                      <span className={`pill ${urgencyPillCls(s.cls)}`} style={{ marginLeft: 8, fontSize: 10 }}>
                        {urgencyLabel(s.cls, s.days)}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--as-mute)' }}>
                      {s.cur.toLocaleString()} / {s.max.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--as-line-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${s.pct}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: s.cls === 'r' ? 'var(--as-danger)' : s.cls === 'y' ? 'var(--as-warning)' : 'var(--as-success)',
                      transition: 'width 0.4s',
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--as-mute)' }}>
                    <span style={{ color: s.cls === 'r' ? 'var(--as-danger)' : s.cls === 'y' ? 'var(--as-warning)' : undefined }}>
                      {s.pct}% · {s.cls ? '建議立即補貨' : `預估可用 ${s.days} 天`}
                    </span>
                    {s.cls === 'r' && <span style={{ color: 'var(--as-danger)', fontWeight: 600 }}>⚠ 緊急</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scheduled replacements */}
        <div>
          <div className="card">
            <div className="ch">
              <div><h3>本月排程更換</h3><span className="csub">386 台待換</span></div>
              <button className="btn primary cdefg" style={{ fontSize: 12 }}>
                <Icon name="plus" size={13} />建立排程
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SCHEDULED_REPLACEMENTS.map(r => (
                <div key={r.d} style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: 12,
                  padding: '12px 14px',
                  border: '1px solid var(--as-line)',
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: r.pillCls === 'r' ? 'var(--as-danger)' : r.pillCls === 'y' ? 'var(--as-warning)' : r.pillCls === 'g' ? 'var(--as-success)' : 'var(--as-line)',
                  alignItems: 'center',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{r.d}</div>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)', marginTop: 2 }}>{r.dm}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.count} 台</div>
                    <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 2 }}>{r.note}</div>
                  </div>
                  <span className={`pill ${r.pillCls}`}>{r.pillLbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency legend */}
          <div className="card" style={{ marginTop: 14 }}>
            <div className="ch"><h3>庫存緊急程度說明</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { lbl: '充足',    cls: 'g', desc: '庫存充足，預計使用 ≥ 30 天' },
                { lbl: '即將到期', cls: 'y', desc: '庫存偏低，建議 14–30 天內補貨' },
                { lbl: '緊急補充', cls: 'r', desc: '庫存嚴重不足，需立即補貨' },
                { lbl: '已斷貨',  cls: 'r', desc: '庫存歸零，已暫停接單' },
              ].map(u => (
                <div key={u.lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span className={`pill ${u.cls}`} style={{ minWidth: 64, textAlign: 'center' }}>{u.lbl}</span>
                  <span style={{ color: 'var(--as-mute)' }}>{u.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-view: 品質與良率 ───────────────────────────────────────────────────────
function QualityView() {
  return (
    <>
      {/* Hero KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '16px 0' }}>
        <div className="kpi green">
          <div className="lbl">首次通過良率 (FPY)</div>
          <div className="val">94.7<span className="u">%</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+0.4 pp 月增</span>
            <Sparkline data={[93.8, 93.9, 94.0, 94.1, 94.2, 94.3, 94.5, 94.6, 94.6, 94.7]} color="var(--as-primary)" />
          </div>
        </div>
        <div className="kpi purple">
          <div className="lbl">MTBF 平均無故障時間</div>
          <div className="val">18,400<span className="u">h</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+12%</span>
            <Sparkline data={[15000, 15500, 16000, 16400, 16800, 17200, 17600, 18000, 18200, 18400]} color="var(--as-cdefg)" />
          </div>
        </div>
        <div className="kpi orange">
          <div className="lbl">RMA 退貨率</div>
          <div className="val">1.2<span className="u">%</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="down" size={11} />−0.18 pp</span>
            <Sparkline data={[1.8, 1.7, 1.6, 1.5, 1.5, 1.4, 1.4, 1.3, 1.2, 1.2]} color="var(--as-h)" />
          </div>
        </div>
      </div>

      {/* Quality table */}
      <div className="qy-table">
        <div className="qy-h">
          <div>產品 / SKU</div>
          <div>生產 (台)</div>
          <div>FPY 良率</div>
          <div>RMA 退貨</div>
          <div>MTBF (h)</div>
          <div>趨勢</div>
        </div>
        {QUALITY_ROWS.map(p => {
          const fpyCls = p.fpy >= 99 ? 'g' : p.fpy >= 98 ? '' : p.fpy >= 97 ? 'y' : 'r'
          const rmaCls = p.rma < 0.5 ? 'g' : p.rma < 1 ? '' : 'r'
          const tStr   = p.trend === 'up' ? '▲ 改善' : p.trend === 'dn' ? '▼ 惡化' : '— 持平'
          const tCls   = p.trend === 'up' ? 'g' : p.trend === 'dn' ? 'r' : ''
          return (
            <div className="qy-r" key={p.sku}>
              <div>
                <div className="nm">{p.nm}</div>
                <div className="sku mono" style={{ fontSize: 10, color: 'var(--as-mute)' }}>{p.sku}</div>
              </div>
              <div className="num">{p.made.toLocaleString()}</div>
              <div className="yb">
                <div className="tr">
                  <div className={`fi ${fpyCls}`} style={{ width: `${Math.max(0, (p.fpy - 95) / 5 * 100)}%` }}></div>
                </div>
                <div className="vv">{p.fpy}%</div>
              </div>
              <div className={`num ${rmaCls}`}>{p.rma}<span className="u">%</span></div>
              <div className="num">
                {p.mtbf === '—'
                  ? <span style={{ color: 'var(--as-mute)' }}>—</span>
                  : (p.mtbf as number).toLocaleString()
                }
              </div>
              <div className={`num ${tCls}`} style={{ fontSize: 11, fontFamily: 'var(--f-sans)' }}>{tStr}</div>
            </div>
          )
        })}
      </div>

      {/* Defect pareto + 12-mo trend */}
      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch">
            <div><h3>不良原因 Pareto · 本月</h3><span className="csub">共 44 件不良 · TOP 3 佔 73%</span></div>
            <span className="csub mono">n = 44</span>
          </div>
          <div className="qp-bars">
            {DEFECT_PARETO.map((d, i) => (
              <div className="qpb" key={d.nm}>
                <div className={`rk ${i < 2 ? 'top' : ''}`}>{i + 1}</div>
                <div className="nm">{d.nm}</div>
                <div className="tr"><div className={`fi ${d.c}`} style={{ width: `${d.p / 32 * 100}%` }}></div></div>
                <div className="nn">{d.n}<span className="pct">{d.p}%</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div><h3>近 12 月良率趨勢</h3><span className="csub">目標線 ≥ 93.0%</span></div>
          </div>
          <svg viewBox="0 0 480 220" style={{ width: '100%', height: 240, display: 'block' }}>
            {[90, 93, 96, 100].map((g, i) => (
              <g key={g}>
                <line x1="36" y1={20 + i * 50} x2="468" y2={20 + i * 50} stroke="var(--as-line-2)" strokeDasharray="2 4" />
                <text x="30" y={24 + i * 50} fontSize="9" fill="var(--as-mute)" textAnchor="end" fontFamily="var(--f-mono)">{[100, 96, 93, 90][i]}%</text>
              </g>
            ))}
            <line x1="36" y1={120} x2="468" y2={120} stroke="var(--as-danger)" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
            <text x="462" y={114} fontSize="9" fill="var(--as-danger)" textAnchor="end" fontFamily="var(--f-mono)">目標 93.0</text>
            {(() => {
              const x0 = 50, xw = 36
              const yFn = (v: number) => 20 + (100 - v) / 10 * 150
              const pts = YIELD_TREND.map((v, i) => `${x0 + i * xw},${yFn(v)}`).join(' ')
              return (
                <>
                  <polyline points={pts} fill="none" stroke="var(--as-primary)" strokeWidth="2" strokeLinejoin="round" />
                  {YIELD_TREND.map((v, i) => (
                    <g key={i}>
                      <circle cx={x0 + i * xw} cy={yFn(v)} r="3" fill="#fff" stroke="var(--as-primary)" strokeWidth="1.5" />
                      {i === YIELD_TREND.length - 1 && (
                        <>
                          <circle cx={x0 + i * xw} cy={yFn(v)} r="5" fill="var(--as-primary)" />
                          <text x={x0 + i * xw - 8} y={yFn(v) - 8} fontSize="11" fill="var(--as-ink)" textAnchor="end" fontWeight="600" fontFamily="var(--f-mono)">{v}%</text>
                        </>
                      )}
                      <text x={x0 + i * xw} y={210} fontSize="9" fill="var(--as-mute)" textAnchor="middle" fontFamily="var(--f-mono)">{YIELD_MONTHS[i]}</text>
                    </g>
                  ))}
                </>
              )
            })()}
          </svg>
          <div style={{ display: 'flex', gap: 18, fontSize: 11, color: 'var(--as-mute)', marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--as-line-2)' }}>
            <span><b style={{ color: 'var(--as-ink)' }}>12 個月平均</b> 94.7%</span>
            <span><b style={{ color: 'var(--as-success)' }}>連續 14 月</b> ≥ 93%</span>
            <span><b style={{ color: 'var(--as-ink)' }}>最高</b> 98.7% (本月)</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-view: 軟體版本 ─────────────────────────────────────────────────────────
function FirmwareView() {
  return (
    <>
      {/* 4 version distribution cards */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', margin: '16px 0' }}>
        {FIRMWARE_VERSIONS.map(f => {
          const cls = f.latest ? 'green' : f.old ? 'red' : f.v === '2.4.0' ? 'purple' : 'orange'
          const sparkData = f.latest
            ? [5000, 6000, 7000, 7800, 8200, 8600, 8900, 9200, 9600, 9842]
            : f.old
            ? [500, 450, 400, 360, 330, 300, 270, 250, 230, 207]
            : f.v === '2.4.0'
            ? [2400, 2300, 2200, 2100, 2000, 1950, 1900, 1870, 1840, 1820]
            : [900, 850, 820, 790, 760, 730, 700, 670, 640, 612]
          const sparkClr = f.latest ? 'var(--as-primary)' : f.old ? 'var(--as-danger)' : f.v === '2.4.0' ? 'var(--as-cdefg)' : 'var(--as-h)'
          return (
            <div className={`kpi ${cls}`} key={f.v}>
              <div className="lbl">v{f.v}{f.latest ? ' (最新)' : f.old ? ' (舊版)' : ''}</div>
              <div className="val">{f.n.toLocaleString()}<span className="u">台</span></div>
              <div className="ft">
                <span className={`delta ${f.latest ? 'up' : f.old ? 'dn' : ''}`}>
                  {f.p}%{f.old ? ' · 需升級' : ''}
                </span>
                <Sparkline data={sparkData} color={sparkClr} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Push update section */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="ch">
          <div>
            <h3>韌體推送更新</h3>
            <span className="csub">2,639 台未更新至最新版 v2.4.1</span>
          </div>
          <button className="btn primary cdefg">
            <Icon name="zap" size={13} />推送全版升級
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, padding: '12px 0', fontSize: 12, color: 'var(--as-mute)' }}>
          <span>目標裝置：<b style={{ color: 'var(--as-ink)' }}>2,639 台</b></span>
          <span>預估時間：<b style={{ color: 'var(--as-ink)' }}>約 4 小時</b></span>
          <span>排程時段：<b style={{ color: 'var(--as-ink)' }}>03:00–05:00 低峰</b></span>
        </div>
      </div>

      {/* Version detail table */}
      <div className="dt-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>版本號</th>
              <th>發佈日期 / 說明</th>
              <th>更新記錄</th>
              <th>裝置數</th>
              <th>佔比</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {FIRMWARE_VERSIONS.map(f => (
              <tr key={f.v}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ fontWeight: 700 }}>v{f.v}</span>
                    {f.latest && <span className="pill g" style={{ fontSize: 10 }}>最新</span>}
                    {f.old    && <span className="pill r" style={{ fontSize: 10 }}>舊版</span>}
                  </div>
                </td>
                <td>
                  <div className="dt-nm" style={{ fontSize: 12 }}>{f.d}</div>
                </td>
                <td style={{ maxWidth: 220, fontSize: 12, color: 'var(--as-mute)' }}>
                  {f.ch.join(' · ')}
                </td>
                <td className="mono"><b>{f.n.toLocaleString()}</b></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${f.p}%`,
                        height: '100%',
                        background: f.latest ? 'var(--as-success)' : f.old ? 'var(--as-danger)' : 'var(--as-cdefg)',
                        borderRadius: 3,
                      }}></div>
                    </div>
                    <span className="mono" style={{ fontSize: 11, minWidth: 36 }}>{f.p}%</span>
                  </div>
                </td>
                <td>
                  {!f.latest
                    ? <button className="btn" style={{ fontSize: 12 }}>推送升級</button>
                    : <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="dt-foot">
          <span>共 {FIRMWARE_VERSIONS.length} 個版本 · 12,481 台裝置</span>
        </div>
      </div>
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ModuleD() {
  const [tab, setTab] = useState('catalog')

  return (
    <PageShell
      tk="D"
      tkClass="cdefg"
      title="產品管理"
      sub="營運模組 · 目錄 / 艦隊 / 品質"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出</button>
          <button className="btn primary cdefg"><Icon name="plus" size={14} />新增產品</button>
        </>
      }
      tabs={[
        { k: 'catalog',    l: '產品目錄',  n: 7 },
        { k: 'fleet',      l: '裝置艦隊',  n: null },
        { k: 'consumable', l: '耗材庫存' },
        { k: 'quality',    l: '品質與良率' },
        { k: 'firmware',   l: '軟體版本' },
      ]}
      activeTab={tab}
      onTab={setTab}
    >
      {/* Global KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi purple">
          <div className="lbl">在售 SKU</div>
          <div className="val">6<span className="u">款</span></div>
          <div className="ft">
            <span className="delta">+1 預購中</span>
            <Sparkline data={[4, 4, 5, 5, 5, 5, 6, 6, 6, 6]} color="var(--as-cdefg)" />
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">已部署設備</div>
          <div className="val">12,481<span className="u">台</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+342 本月</span>
            <Sparkline data={[11800, 11960, 12100, 12200, 12280, 12340, 12400, 12440, 12481, 12481]} color="var(--as-primary)" />
          </div>
        </div>
        <div className="kpi orange">
          <div className="lbl">本月出貨</div>
          <div className="val">486<span className="u">台</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+18%</span>
            <Sparkline data={[320, 360, 380, 400, 420, 440, 460, 470, 480, 486]} color="var(--as-h)" />
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">整體良率 (FPY)</div>
          <div className="val">94.7<span className="u">%</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+0.4 pp</span>
            <Sparkline data={[93.8, 93.9, 94.0, 94.1, 94.2, 94.3, 94.5, 94.6, 94.6, 94.7]} color="var(--as-primary)" />
          </div>
        </div>
      </div>

      {tab === 'catalog'    && <CatalogView />}
      {tab === 'fleet'      && <FleetView />}
      {tab === 'consumable' && <ConsumableView />}
      {tab === 'quality'    && <QualityView />}
      {tab === 'firmware'   && <FirmwareView />}
    </PageShell>
  )
}
