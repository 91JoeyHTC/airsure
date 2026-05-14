import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import {
  FIELDS_A_FULL,
  FIELD_DELTAS,
  REGION_HEALTH,
  DHI_DIST,
  SITE_TYPES,
  AHI_TREND,
  SITE_TREND,
  SEGMENTS_A,
  CONSUMABLE_CATS,
  URGENT_DEVICES,
} from '../../mocks/module-a'

/* ── helpers ─────────────────────────────────────────── */
type ToneKey = 'i' | 'n' | 'w' | 'r'
interface Tone { cls: ToneKey; lbl: string; clr: string; bg: string }

function tone(pct: number): Tone {
  if (pct < 20) return { cls: 'i', lbl: '立即處理', clr: 'var(--as-danger)', bg: '#FEE4E2' }
  if (pct < 30) return { cls: 'n', lbl: '近期處理', clr: 'var(--as-warning)', bg: '#FEF0C7' }
  if (pct < 50) return { cls: 'w', lbl: '持續觀察', clr: '#4F46E5', bg: '#EEF0FF' }
  return { cls: 'r', lbl: '更換備料', clr: 'var(--as-mute)', bg: '#F3F4F6' }
}

/* ── 整體層 ─────────────────────────────────────────── */
function AOverview({ onJump }: { onJump: () => void }) {
  const buckets = [3, 6, 11, 18, 32, 64, 142, 318, 462, 228]
  const bucketMax = Math.max(...buckets)
  const colorFor = (i: number) =>
    i < 3 ? 'var(--as-danger)' : i < 6 ? 'var(--as-warning)' : 'var(--as-success)'

  return (
    <>
      {/* KPI 卡 */}
      <div className="kpi-row">
        <div className="kpi green">
          <div className="lbl">使用中場域</div>
          <div className="val">1,284<span className="u">處</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+12 MoM</span>
            <Sparkline data={SITE_TREND.slice(-8)} color="var(--as-primary)" />
          </div>
        </div>
        <div className="kpi purple">
          <div className="lbl">連網裝置</div>
          <div className="val">4,832<span className="u">台</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />99.1% 在線率</span>
            <Sparkline data={[4600, 4680, 4720, 4760, 4800, 4820, 4828, 4832]} color="var(--as-cdefg)" />
          </div>
        </div>
        <div className="kpi orange">
          <div className="lbl">今日平均 DHI</div>
          <div className="val">82<span className="u">分</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+0.4 vs 昨日</span>
            <Sparkline data={AHI_TREND} color="var(--as-warning)" />
          </div>
        </div>
        <div className="kpi red">
          <div className="lbl">需注意場域</div>
          <div className="val">42<span className="u">處</span></div>
          <div className="ft">
            <span className="delta dn"><Icon name="bell" size={11} />11 台設備異常</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>需立即處理</span>
          </div>
        </div>
      </div>

      {/* 健康度排行 + 區域熱圖 */}
      <div className="rank-grid" style={{ marginTop: 16 }}>
        {/* Top 5 */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>健康度 Top 5</h3>
              <div className="csub">過去 7 天平均 · 全部 1,284 場域</div>
            </div>
            <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>平均 81.4</span>
          </div>
          <div className="rank">
            {[...FIELDS_A_FULL].sort((a, b) => b.q - a.q).slice(0, 5).map((f, i) => {
              const dlt = FIELD_DELTAS[f.id] ?? 0
              const dCls = dlt > 0 ? '' : dlt < 0 ? 'dn' : 'flat'
              const dStr = dlt > 0 ? `▲ ${dlt}` : dlt < 0 ? `▼ ${Math.abs(dlt)}` : '— 0'
              return (
                <div className="rk" key={f.id}>
                  <div className={`rk-rk ${i < 3 ? 'gold' : ''}`}>{i + 1}</div>
                  <div className="rk-nm">
                    {f.nm}
                    <div className="rk-sub">{f.addr} · {f.mem.split(' · ')[0]}</div>
                  </div>
                  <div className="rk-bar">
                    <div className="rk-tr">
                      <div className="rk-fi" style={{ width: `${f.q}%` }}></div>
                    </div>
                  </div>
                  <div className="rk-v">
                    {f.q}<span className="u">/100</span>
                    <span className={`dlt ${dCls}`}>{dStr}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 需關注 */}
        <div className="card">
          <div className="ch">
            <div>
              <h3>需關注 · 健康度 &lt; 75</h3>
              <div className="csub">建議顧問主動聯繫</div>
            </div>
            <span className="csub" style={{ color: 'var(--as-danger)', fontWeight: 600 }}>● 23 個場域</span>
          </div>
          <div className="rank">
            {[...FIELDS_A_FULL].sort((a, b) => a.q - b.q).slice(0, 4).map((f) => {
              const dlt = FIELD_DELTAS[f.id] ?? 0
              const dCls = dlt > 0 ? '' : dlt < 0 ? 'dn' : 'flat'
              const dStr = dlt > 0 ? `▲ ${dlt}` : dlt < 0 ? `▼ ${Math.abs(dlt)}` : '— 0'
              return (
                <div className="rk" key={f.id}>
                  <div className="rk-rk r">!</div>
                  <div className="rk-nm">
                    {f.nm}
                    <div className="rk-sub">{f.mem} · PM2.5 {f.pm}</div>
                  </div>
                  <div className="rk-bar">
                    <div className="rk-tr">
                      <div className={`rk-fi ${f.q < 60 ? 'r' : 'y'}`} style={{ width: `${f.q}%` }}></div>
                    </div>
                  </div>
                  <div className="rk-v">
                    {f.q}<span className="u">/100</span>
                    <span className={`dlt ${dCls}`}>{dStr}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 區域分佈 span-2 */}
        <div className="card span-2">
          <div className="ch">
            <div>
              <h3>區域分佈 — 健康度熱圖 (本月)</h3>
              <div className="csub">點擊地區查看詳細 · 數值為區內場域 7 日平均</div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--as-mute)' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-success)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>≥ 85 良好</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-warning)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>75–84 普通</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-danger)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>&lt; 75 需關注</span>
            </div>
          </div>
          <div className="region-heat">
            {REGION_HEALTH.map((x) => {
              const cls = x.q >= 85 ? 'g' : x.q >= 75 ? 'y' : 'r'
              const dCls = x.dlt > 0 ? 'up' : x.dlt < 0 ? 'dn' : ''
              const dStr = x.dlt > 0 ? `▲${x.dlt}` : x.dlt < 0 ? `▼${Math.abs(x.dlt)}` : '— 0'
              return (
                <div className={`heat ${cls}`} key={x.r}>
                  <div className="hr">{x.r}</div>
                  <div className="hv">{x.q}</div>
                  <div className="hn">{x.n} 場域 <span className={`dlt ${dCls}`}>{dStr}</span></div>
                </div>
              )
            })}
          </div>
          <div className="rh-hist">
            {buckets.map((v, i) => (
              <div className="bar" key={i}>
                <div className="b" style={{ height: `${v / bucketMax * 44 + 4}px`, background: colorFor(i) }}></div>
                <div className="lb">{i * 10}+</div>
              </div>
            ))}
            <div className="leg">
              分數區間分佈<br />
              <b>1,284</b> 場域<br />
              中位數 <b>87</b>
            </div>
          </div>
        </div>
      </div>

      {/* 場域清單 */}
      <div className="dt-wrap" style={{ marginTop: 16 }}>
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" /></th>
              <th>場域</th>
              <th>編號</th>
              <th>類型</th>
              <th>坪數</th>
              <th>設備</th>
              <th>狀態</th>
              <th>PM2.5</th>
              <th>CO₂</th>
              <th>關聯會員</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {FIELDS_A_FULL.map((f) => (
              <tr key={f.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <div className="dt-nm">{f.nm}</div>
                  <div className="dt-sub">{f.addr}</div>
                </td>
                <td className="mono mute">{f.id}</td>
                <td><span className="tt">{f.type}</span></td>
                <td>{f.sz}</td>
                <td>{f.dev}</td>
                <td>
                  <span className="lamp">
                    <span className={`d ${f.lamp}`}></span>
                    {f.lamp === 'g' ? '正常' : f.lamp === 'y' ? '警示' : '異常'}
                  </span>
                </td>
                <td><span className={`pill ${f.pm > 50 ? 'r' : f.pm > 25 ? 'y' : 'g'}`}>{f.pm}</span></td>
                <td><span className={`pill ${f.co2 > 1000 ? 'y' : 'g'}`}>{f.co2}</span></td>
                <td>{f.mem}</td>
                <td><button className="rowbtn"><Icon name="arrow" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="dt-foot">
          <span>顯示 9 / 1,284 筆</span>
          <div className="pager">
            <button>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <span className="ell">…</span>
            <button>143</button>
            <button>›</button>
          </div>
        </div>
      </div>

      {/* 下鑽至分群層 */}
      <div className="ov-jump" style={{ marginTop: 16 }}>
        <div className="ov-jh"><b>↘ 下鑽至分群層</b> · 從整體統計切入到具體分群</div>
        <div className="ov-jb">
          <button className="ov-jc" onClick={onJump}><span>設備健康分群</span><i>A/B/C/D 四級</i></button>
          <button className="ov-jc" onClick={onJump}><span>使用強度分群</span><i>重度 / 中度 / 輕度</i></button>
          <button className="ov-jc" onClick={onJump}><span>空品挑戰分群</span><i>常態優 / 一般 / 高挑戰</i></button>
          <button className="ov-jc" onClick={onJump}><span>水箱頻率分群</span><i>除濕需求 高 / 中 / 低</i></button>
        </div>
      </div>
    </>
  )
}

/* ── 分群層 ─────────────────────────────────────────── */
function ASegments() {
  return (
    <>
      <div className="seg-banner">
        <div className="sb-lv">★ 分群層</div>
        <div className="sb-tx">
          <h3>四軸交叉分群 · 12,481 設備 / 1,284 場域</h3>
          <div className="sb-sub">v4 規格 A.5 · 點任一分群 → 個人層 (場域 / 設備清單)</div>
        </div>
        <div className="sb-ac">
          <button className="btn"><Icon name="download" size={13} />分群名單匯出</button>
        </div>
      </div>

      {/* DHI 分佈 + 場域類型 概覽 */}
      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="ch">
            <div>
              <h3>DHI 等級分佈</h3>
              <div className="csub">健康指數 · 全部 12,481 設備</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {DHI_DIST.map((d) => (
              <div key={d.lv} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: d.c + '20', color: d.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{d.lv}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--as-ink-2)' }}>DHI {d.range}</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{d.n.toLocaleString()} <span style={{ color: 'var(--as-mute)', fontWeight: 400 }}>({d.pct}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${d.pct}%`, height: '100%', background: d.c, borderRadius: 3 }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div>
              <h3>場域類型分佈</h3>
              <div className="csub">依場域性質分類 · {SITE_TYPES.reduce((a, s) => a + s.n, 0).toLocaleString()} 場域</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {SITE_TYPES.map((s) => {
              const total = SITE_TYPES.reduce((a, x) => a + x.n, 0)
              const pct = Math.round(s.n / total * 100)
              return (
                <div key={s.nm} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.c, flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--as-ink-2)' }}>{s.nm}</span>
                      <span className="mono" style={{ fontWeight: 600 }}>{s.n.toLocaleString()} <span style={{ color: 'var(--as-mute)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.c, borderRadius: 3 }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="seg-grid">
        {SEGMENTS_A.map((s) => (
          <div className="seg-card" key={s.title}>
            <div className="sg-h">
              <div>
                <div className="sg-axis">{s.axis}</div>
                <h3>{s.title}</h3>
                <div className="sg-sub">{s.sub}</div>
              </div>
              <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>{s.groups.length} 群</span>
            </div>
            <div className="sg-stack">
              {s.groups.map((g) => (
                <div key={g.lbl} style={{ width: `${g.pct}%`, background: g.c, height: '100%' }}></div>
              ))}
            </div>
            <div className="sg-legend">
              {s.groups.map((g) => (
                <span key={g.lbl}><span className="d" style={{ background: g.c }}></span>{g.pct}%</span>
              ))}
            </div>
            <div className="sg-rows">
              {s.groups.map((g) => (
                <div className="sg-r" key={g.lbl}>
                  <div className="sg-pct" style={{ background: g.c + '18', color: g.c, borderColor: g.c + '50' }}>{g.lbl}</div>
                  <div className="sg-info">
                    <div className="sg-traits">{g.traits}</div>
                    <div className="sg-action"><Icon name="arrow" size={10} />{g.action}</div>
                  </div>
                  <div className="sg-num">
                    <div className="v mono">{g.n.toLocaleString()}</div>
                    <div className="l">設備</div>
                  </div>
                  <button className="rowbtn"><Icon name="arrow" size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ── 個人層 (場域清單 + 耗材 + 水箱) ─────────────────── */
function APersonal() {
  const [subTab, setSubTab] = useState<'list' | 'consumable' | 'tank'>('list')

  return (
    <>
      {/* 個人層 sub-tabs */}
      <div className="b-subtabs">
        {([
          { k: 'list', l: '場域清單', n: 1284 },
          { k: 'consumable', l: '耗材庫存' },
          { k: 'tank', l: '水箱管理' },
        ] as Array<{ k: 'list' | 'consumable' | 'tank'; l: string; n?: number }>).map((t) => (
          <div
            key={t.k}
            className={`b-subtab ${t.k === subTab ? 'active' : ''}`}
            onClick={() => setSubTab(t.k)}
          >
            {t.l}
            {t.n != null && <span className="n">{t.n}</span>}
          </div>
        ))}
      </div>

      {subTab === 'list' && <ALocationList />}
      {subTab === 'consumable' && <AConsumables />}
      {subTab === 'tank' && <ATank />}
    </>
  )
}

/* ── 場域清單 (個人層) ───────────────────────────────── */
function ALocationList() {
  return (
    <div className="dt-wrap">
      <table className="dt">
        <thead>
          <tr>
            <th style={{ width: 32 }}><input type="checkbox" /></th>
            <th>場域</th>
            <th>編號</th>
            <th>類型</th>
            <th>坪數</th>
            <th>設備</th>
            <th>狀態</th>
            <th>PM2.5</th>
            <th>CO₂</th>
            <th>關聯會員</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {FIELDS_A_FULL.map((f) => (
            <tr key={f.id}>
              <td><input type="checkbox" /></td>
              <td>
                <div className="dt-nm">{f.nm}</div>
                <div className="dt-sub">{f.addr}</div>
              </td>
              <td className="mono mute">{f.id}</td>
              <td><span className="tt">{f.type}</span></td>
              <td>{f.sz}</td>
              <td>{f.dev}</td>
              <td>
                <span className="lamp">
                  <span className={`d ${f.lamp}`}></span>
                  {f.lamp === 'g' ? '正常' : f.lamp === 'y' ? '警示' : '異常'}
                </span>
              </td>
              <td><span className={`pill ${f.pm > 50 ? 'r' : f.pm > 25 ? 'y' : 'g'}`}>{f.pm}</span></td>
              <td><span className={`pill ${f.co2 > 1000 ? 'y' : 'g'}`}>{f.co2}</span></td>
              <td>{f.mem}</td>
              <td><button className="rowbtn"><Icon name="arrow" size={12} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dt-foot">
        <span>顯示 9 / 1,284 筆</span>
        <div className="pager">
          <button>‹</button>
          <button className="on">1</button>
          <button>2</button>
          <button>3</button>
          <span className="ell">…</span>
          <button>143</button>
          <button>›</button>
        </div>
      </div>
    </div>
  )
}

/* ── 耗材庫存 ────────────────────────────────────────── */
function AConsumables() {
  const tot = CONSUMABLE_CATS.reduce(
    (a, c) => ({ i: a.i + c.dist.i, n: a.n + c.dist.n, w: a.w + c.dist.w, r: a.r + c.dist.r }),
    { i: 0, n: 0, w: 0, r: 0 }
  )
  const all = tot.i + tot.n + tot.w + tot.r

  const stageKeys: Array<'i' | 'n' | 'w' | 'r'> = ['i', 'n', 'w', 'r']

  return (
    <>
      {/* 四階段 KPI */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi red">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-danger)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            立即處理 (&lt; 20%)
          </div>
          <div className="val">{tot.i}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta dn"><Icon name="bell" size={11} />觸發 E 模組</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.i / all * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="kpi orange">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-warning)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            近期處理 (20–30%)
          </div>
          <div className="val">{tot.n}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta"><Icon name="cal" size={11} />3 工作日內</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.n / all * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="kpi purple">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: '#4F46E5', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            持續觀察 (30–50%)
          </div>
          <div className="val">{tot.w}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta"><Icon name="eye" size={11} />本月內</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.w / all * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--as-mute-2)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }}></span>
            更換備料 (≥ 50%)
          </div>
          <div className="val">{tot.r}<span className="u">台</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="check" size={11} />正常</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{(tot.r / all * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* AI 跨模組訊號條 */}
      <div className="alert-banner" style={{ marginTop: 16, background: 'linear-gradient(90deg, #FFF1F0 0%, #FFFBEB 100%)', borderColor: '#FECDD3' }}>
        <div className="al-ic" style={{ background: 'var(--as-danger)' }}><Icon name="sparkles" size={18} /></div>
        <div className="al-tx">
          <div className="al-h"><b>520 台設備耗材剩餘 &lt; 20% (立即處理)</b> · 已自動觸發 E 模組「需主動聯繫名單」27 位會員 · 其中 9 位為高級會員</div>
          <div className="al-s">推薦下一步:批次派工 + 推送「自動配送耗材」訂閱方案 (歷史接受率 38%，預估月經常性收入 + NT$ 124K)</div>
        </div>
        <div className="al-ac">
          <button className="btn"><Icon name="download" size={13} />匯出名單</button>
          <button className="btn primary"><Icon name="headset" size={13} />批次派工 + 通知</button>
        </div>
      </div>

      {/* 六類耗材卡 */}
      <div className="con-grid">
        {CONSUMABLE_CATS.map((c) => {
          const t = tone(c.avg)
          const total = c.dist.i + c.dist.n + c.dist.w + c.dist.r
          return (
            <div className="con-card" key={c.k}>
              <div className="con-h">
                <div className="con-tag" style={{ background: c.clr + '18', color: c.clr }}>
                  <span className="con-ic" style={{ background: c.clr }}></span>
                  <span>{c.sub}</span>
                </div>
                <div className="con-life">壽命 {c.life}</div>
              </div>
              <div className="con-nm">{c.nm}</div>
              <div className="con-ring">
                <svg viewBox="0 0 80 80" width="100" height="100">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--as-line-2)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={t.clr} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${c.avg / 100 * 2 * Math.PI * 34} 999`}
                    transform="rotate(-90 40 40)" />
                  <text x="40" y="42" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--as-ink)" fontFamily="var(--f-mono)">{c.avg}</text>
                  <text x="40" y="55" textAnchor="middle" fontSize="9" fill="var(--as-mute)">% 平均</text>
                </svg>
                <div className="con-tone" style={{ background: t.bg, color: t.clr }}>{t.lbl}</div>
              </div>
              <div className="con-dist">
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-danger)' }}></span><span className="l">立即</span><span className="v">{c.dist.i}</span></div>
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-warning)' }}></span><span className="l">近期</span><span className="v">{c.dist.n}</span></div>
                <div className="con-dr"><span className="d" style={{ background: '#4F46E5' }}></span><span className="l">觀察</span><span className="v">{c.dist.w}</span></div>
                <div className="con-dr"><span className="d" style={{ background: 'var(--as-mute-2)' }}></span><span className="l">備料</span><span className="v">{c.dist.r}</span></div>
              </div>
              <div className="con-stack">
                {stageKeys.map((s) => {
                  const v = c.dist[s]
                  const bg = s === 'i' ? 'var(--as-danger)' : s === 'n' ? 'var(--as-warning)' : s === 'w' ? '#4F46E5' : 'var(--as-mute-2)'
                  return <div key={s} style={{ width: `${v / total * 100}%`, background: bg, height: '100%' }}></div>
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 耗材熱力矩陣 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div>
            <h3>★ 需立即處理裝置 — 耗材熱力矩陣</h3>
            <div className="csub">六類耗材 × 個別裝置 · 紅色 &lt; 20% (立即) · 黃 &lt; 30% (近期) · 藍 &lt; 50% (觀察)</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--as-mute)', display: 'flex', gap: 12 }}>
            <span><b style={{ color: 'var(--as-danger)', fontFamily: 'var(--f-mono)' }}>● 18</b> 立即處理 (今日)</span>
            <span><b style={{ color: 'var(--as-warning)', fontFamily: 'var(--f-mono)' }}>● 64</b> 近期處理</span>
          </div>
        </div>
        <div className="con-heat">
          <div className="con-heat-head">
            <div className="hcell mute">會員 / 場域 / 裝置</div>
            <div className="hcell">前置</div>
            <div className="hcell">ECF·L</div>
            <div className="hcell">ECF·R</div>
            <div className="hcell">HEPA</div>
            <div className="hcell">電漿</div>
            <div className="hcell">UV</div>
            <div className="hcell mute">逾期</div>
            <div className="hcell mute">下一步</div>
          </div>
          {URGENT_DEVICES.map((u) => (
            <div className="con-heat-r" key={u.mid}>
              <div className="hwho">
                <div className={`av ${u.tier === 'g' ? 'gold' : ''}`}>{u.nm[0]}</div>
                <div>
                  <div className="hnm">{u.nm}<span className="hid">{u.mid}</span></div>
                  <div className="haddr">{u.addr} · <span className="mono">{u.dev}</span></div>
                </div>
              </div>
              {(['pre', 'ecfL', 'ecfR', 'hepa', 'plasma', 'uv'] as const).map((k) => {
                const v = u.vals[k]
                const t = tone(v)
                return (
                  <div className={`hcell-v ${t.cls}`} key={k} style={{ background: t.bg, color: t.clr }}>
                    <div className="vv">{v}<span className="pp">%</span></div>
                    <div className="vt">{t.lbl}</div>
                  </div>
                )
              })}
              <div className="hdays">
                <span className={`pill ${u.sev === 'critical' ? 'r' : u.sev === 'soon' ? 'y' : ''}`}>
                  {u.sev === 'critical' ? `+${u.days} 天` : u.sev === 'soon' ? `${u.days} 天內` : '本週'}
                </span>
              </div>
              <div className="hact">
                <button className="rowbtn"><Icon name="phone" size={12} /></button>
                <button className="rowbtn"><Icon name="headset" size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--as-line-2)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--as-mute)' }}>
          <span>顯示前 6 筆 · 共 <b style={{ color: 'var(--as-ink)' }}>27</b> 位會員需主動聯繫</span>
          <span style={{ color: 'var(--as-cdefg)', cursor: 'pointer' }}>跳至 E 模組 · 完整聯繫名單 →</span>
        </div>
      </div>
    </>
  )
}

/* ── 水箱管理 ────────────────────────────────────────── */
function ATank() {
  const hourly = [4, 2, 1, 1, 1, 2, 4, 8, 12, 14, 11, 8, 9, 7, 6, 6, 7, 9, 11, 14, 13, 10, 8, 5]
  const hMax = Math.max(...hourly)

  const ABNORMAL = [
    { sid: 'SH-2841', site: '臺中科技園區', mem: '王淑芬 · 高級', tier: 'g', evt: 32, avg: 28.4, p50: 18, p90: 52, max: 96, trend: 'up', sig: '已觸發 E' },
    { sid: 'SH-7821', site: '陽明山度假', mem: '陳俊宏 · 高級', tier: 'g', evt: 14, avg: 38.2, p50: 26, p90: 68, max: 124, trend: 'up', sig: '已觸發 E' },
    { sid: 'SH-1147', site: '新北板橋辦公', mem: '李文君', tier: 'n', evt: 26, avg: 22.1, p50: 16, p90: 38, max: 72, trend: 'flat', sig: '已觸發 E' },
    { sid: 'SH-5023', site: '臺南安平診所', mem: '林醫師', tier: 'n', evt: 41, avg: 19.8, p50: 14, p90: 31, max: 58, trend: 'down', sig: '監控中' },
    { sid: 'SH-5611', site: '臺北大安咖啡店', mem: '阿諾義式', tier: 'n', evt: 38, avg: 16.4, p50: 12, p90: 26, max: 48, trend: 'flat', sig: '監控中' },
  ]

  return (
    <>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi purple">
          <div className="lbl">本週水滿事件</div>
          <div className="val">2,841<span className="u">次</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="up" size={11} />+8%</span>
            <Sparkline data={[2600, 2620, 2680, 2700, 2750, 2780, 2810, 2820, 2835, 2841]} color="var(--as-cdefg)" />
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">平均清除時間</div>
          <div className="val">11.4<span className="u">小時</span></div>
          <div className="ft">
            <span className="delta up"><Icon name="down" size={11} />−1.8h</span>
            <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>目標 ≤ 12h</span>
          </div>
        </div>
        <div className="kpi green">
          <div className="lbl">P50 中位數</div>
          <div className="val">8.6<span className="u">h</span></div>
          <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-success)' }}>50% 用戶 ≤ 8.6h</span></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">P90 (★ 觸發閾值)</div>
          <div className="val">24.8<span className="u">h</span></div>
          <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-warning)' }}>P90 &gt; 24h → 觸發 E</span></div>
        </div>
        <div className="kpi red">
          <div className="lbl">最長 (Max)</div>
          <div className="val">124<span className="u">h</span></div>
          <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-danger)' }}>陽明山度假 · 5 天 4 小時</span></div>
        </div>
      </div>

      <div className="alert-banner" style={{ marginTop: 16, background: 'linear-gradient(90deg, #FFFBEB 0%, #FFFFFF 100%)', borderColor: '#FED7AA' }}>
        <div className="al-ic" style={{ background: 'var(--as-warning)' }}><Icon name="bell" size={18} /></div>
        <div className="al-tx">
          <div className="al-h"><b>14 個場域 P90 &gt; 24 小時</b> · 已觸發 E 模組主動聯繫 · 包含 4 位高級會員</div>
          <div className="al-s">疑似原因:① 除濕需求過高 (建議升級機型) ② 用戶習慣 (推送提醒) ③ 設備異常 (派工檢查)</div>
        </div>
        <div className="al-ac">
          <button className="btn primary"><Icon name="headset" size={13} />批次派工 + 通知</button>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="ch">
            <div>
              <h3>倒水節奏 · 24 小時分布</h3>
              <div className="csub">深色柱 = 工作日 · 淺色 = 週末 · 峰值 09:00 / 19:00</div>
            </div>
          </div>
          <div className="tank-24h">
            {hourly.map((v, i) => {
              const isWeekendPeak = (i === 10 || i === 11 || i === 14 || i === 15)
              return (
                <div className="t24" key={i}>
                  <div className="t24-b" style={{
                    height: `${v / hMax * 120}px`,
                    background: isWeekendPeak ? 'var(--as-cdefg)' : 'var(--as-primary)',
                    opacity: isWeekendPeak ? 0.55 : 1
                  }}></div>
                  {(i % 3 === 0) && <div className="t24-l">{String(i).padStart(2, '0')}</div>}
                </div>
              )
            })}
          </div>
          <div className="tank-week">
            <div className="twr">
              <span className="lbl">工作日平均</span>
              <span className="ev">94 次/日</span>
              <span className="dur">11.2 h 平均清除</span>
            </div>
            <div className="twr">
              <span className="lbl">週末平均</span>
              <span className="ev">62 次/日</span>
              <span className="dur">14.8 h 平均清除</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="ch">
            <div>
              <h3>清除時間分位數 · 30 天</h3>
              <div className="csub">紅線標示 P90 觸發閾值 (24h)</div>
            </div>
          </div>
          <div className="tank-pct">
            {[
              { k: '最快', v: 0.4, pct: 0.4 / 124 * 100, c: 'var(--as-success)', lab: '0.4 h' },
              { k: 'P25', v: 4.2, pct: 4.2 / 124 * 100, c: 'var(--as-success)', lab: '4.2 h' },
              { k: 'P50 中位', v: 8.6, pct: 8.6 / 124 * 100, c: 'var(--as-success)', lab: '8.6 h' },
              { k: '平均', v: 11.4, pct: 11.4 / 124 * 100, c: 'var(--as-cdefg)', lab: '11.4 h' },
              { k: 'P75', v: 16.8, pct: 16.8 / 124 * 100, c: 'var(--as-cdefg)', lab: '16.8 h' },
              { k: 'P90', v: 24.8, pct: 24.8 / 124 * 100, c: 'var(--as-warning)', lab: '24.8 h ⚠' },
              { k: '最長', v: 124, pct: 100, c: 'var(--as-danger)', lab: '124 h' },
            ].map((p) => (
              <div className="tpr" key={p.k}>
                <div className="tpk">{p.k}</div>
                <div className="tpb">
                  <div className="tpf" style={{ width: `${p.pct}%`, background: p.c }}></div>
                  <div className="tp-line" style={{ left: `${24 / 124 * 100}%` }}></div>
                </div>
                <div className="tpv mono">{p.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 異常場域表 */}
      <div className="dt-wrap" style={{ marginTop: 16 }}>
        <table className="dt">
          <thead>
            <tr>
              <th>場域</th>
              <th>會員</th>
              <th>事件 (週)</th>
              <th>平均</th>
              <th>P50</th>
              <th>P90 ★</th>
              <th>最長</th>
              <th>趨勢</th>
              <th>狀態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ABNORMAL.map((a) => (
              <tr key={a.sid}>
                <td>
                  <div className="dt-nm">{a.site}</div>
                  <div className="dt-sub mono">{a.sid}</div>
                </td>
                <td>{a.mem}</td>
                <td className="mono">{a.evt}</td>
                <td className="mono">{a.avg} h</td>
                <td className="mono">{a.p50} h</td>
                <td className="mono">
                  <span className={`pill ${a.p90 > 24 ? 'r' : a.p90 > 12 ? 'y' : 'g'}`}>{a.p90} h</span>
                </td>
                <td className="mono">{a.max} h</td>
                <td>
                  {a.trend === 'up'
                    ? <span style={{ color: 'var(--as-danger)' }}>▲ 惡化</span>
                    : a.trend === 'down'
                    ? <span style={{ color: 'var(--as-success)' }}>▼ 改善</span>
                    : <span style={{ color: 'var(--as-mute)' }}>— 持平</span>}
                </td>
                <td><span className={`pill ${a.sig.includes('觸發') ? 'r' : 'y'}`}>{a.sig}</span></td>
                <td><button className="rowbtn"><Icon name="arrow" size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ── ModuleA (root) ─────────────────────────────────── */
type ATab = 'overview' | 'segments' | 'personal'

export function ModuleA() {
  const [tab, setTab] = useState<ATab>('overview')

  const tabs = [
    { k: 'overview', l: '整體層' },
    { k: 'segments', l: '分群層', n: 4 },
    { k: 'personal', l: '個人層', n: 1284 },
  ]

  return (
    <PageShell
      tk="A"
      tkClass="ab"
      title="居家空氣場域"
      sub="雙核心 · 三層級場域監控"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出</button>
          <button className="btn primary"><Icon name="plus" size={14} />新增場域</button>
        </>
      }
      tabs={tabs}
      activeTab={tab}
      onTab={(k) => setTab(k as ATab)}
    >
      {tab === 'overview' && <AOverview onJump={() => setTab('segments')} />}
      {tab === 'segments' && <ASegments />}
      {tab === 'personal' && <APersonal />}
    </PageShell>
  )
}

export default ModuleA
