/* Module B — 真實會員 360°(Salesforce 即時)
 * MemberSearch:個人 360° 頂部的真實會員搜尋框(中台未連線時顯示提示)。
 * Member360Live:選定會員後的 Live 視圖 — profile + 消費紀錄 + 服務紀錄。
 * SF 沒有的區塊(設備、訂閱、積點、分群)標注待資料源接入,可返回示範會員查看完整版面。
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../../components/ui/Icon'
import { batchAttrs } from '../../components/ui/BatchAttrs'
import { useMemberSearch, useMember360 } from '../../hooks/useMember360'
import type { MemberHit, MemberService } from '../../hooks/useMember360'

const KIND_CLS: Record<MemberService['kind'], string> = {
  '派工': 'g',
  '送修': 'y',
  '維修完成': '', // 中性樣式
}

/** 由日期字串(YYYY-MM-DD)算滿幾年,無法解析回 null。 */
function yearsSince(dateStr?: string): number | null {
  if (!dateStr) return null
  const t = Date.parse(dateStr)
  if (Number.isNaN(t)) return null
  const now = new Date()
  const d = new Date(t)
  let y = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) y -= 1 // 未滿週年不進位
  return y < 0 ? null : y
}

/** 識別卡一格:小圖示 + 文字,值為空時不渲染。 */
function MetaItem({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--as-mute)' }}>
      <span aria-hidden style={{ fontSize: 13, opacity: 0.85 }}>{icon}</span>
      {children}
    </span>
  )
}

export function MemberSearch({ onPick }: { onPick: (m: MemberHit) => void }) {
  const [q, setQ] = useState('')
  const { hits, searching, error } = useMemberSearch(q)

  return (
    <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }} {...batchAttrs('B.個人.真實會員搜尋')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="search" size={14} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜尋真實會員(Salesforce)— 姓名、電話或客戶編號,至少 2 字"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: 'var(--as-ink)',
          }}
        />
        {searching && <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>搜尋中…</span>}
        <span className="chip">SALESFORCE 即時</span>
      </div>
      {error && q.trim().length >= 2 && (
        <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 8 }}>
          中台未連線,無法搜尋真實會員;以下顯示示範會員。
        </div>
      )}
      {hits.length > 0 && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--as-line-2)', paddingTop: 6 }}>
          {hits.map(m => (
            <button
              key={m.id}
              onClick={() => { onPick(m); setQ('') }}
              style={{
                display: 'flex', width: '100%', alignItems: 'center', gap: 12,
                padding: '7px 6px', border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left', borderRadius: 6, fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--as-ink)' }}>{m.name}</span>
              {/* 客戶編號:設備分析報告的 customer.code,也是唯一能對回 Module A 場域的鍵 */}
              {m.lead_num && <span className="mono" style={{ fontSize: 11, color: 'var(--as-info)' }}>{m.lead_num}</span>}
              <span className="mono" style={{ fontSize: 12, color: 'var(--as-mute)' }}>{m.phone || '—'}</span>
              {m.email && <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{m.email}</span>}
              {/* 辨識欄位:同名/同電話時用等級、建檔日、Id 末碼區分 */}
              <span style={{ flex: 1 }} />
              {m.level && <span className="chip">{m.level}</span>}
              {m.created_date && <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>建檔 {m.created_date}</span>}
              <span className="mono" style={{ fontSize: 10, color: 'var(--as-mute)' }}>…{m.id.slice(-6)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Member360Live({ member, onBack }: { member: MemberHit; onBack: () => void }) {
  const { data, loading, error } = useMember360(member.id)
  const fmtM = (n: number) => `NT$${n.toLocaleString()}`

  return (
    <>
      {/* ── 返回列 + 識別 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn" onClick={onBack}>← 返回示範會員</button>
        <span className="chip">SALESFORCE 即時</span>
        <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>
          設備、訂閱、積點、分群等區塊待資料源接入,暫僅示範會員可見
        </span>
      </div>

      {/* ── Profile 卡 ── */}
      <div className="card" style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }} {...batchAttrs('B.個人.Live識別卡')}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--as-primary), var(--as-info))' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingTop: 8 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--as-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
            {member.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--as-ink)' }}>{member.name}</span>
              {/* 客戶編號 —— 對得回設備分析報告與 Module A 場域,放在名字旁邊最好認 */}
              {(data?.profile.lead_num || member.lead_num) && (
                <span className="mono" style={{ fontSize: 12, color: 'var(--as-info)' }}>
                  {data?.profile.lead_num || member.lead_num}
                </span>
              )}
              {data?.profile.level && <span className="pill g">{data.profile.level}</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--as-mute)', marginTop: 2 }}>
              <span className="mono">{member.phone || '—'}</span>
              {member.email && <span style={{ marginLeft: 12 }}>{member.email}</span>}
            </div>
            {data && (() => {
              const p = data.profile
              const age = p.age ?? yearsSince(p.birthday)
              const region = [p.city, p.area].filter(Boolean).join('')
              const location = [region, p.address].filter(Boolean).join(' · ') // 縣市區 + 完整門牌
              const tenure = yearsSince(p.created_date)
              const consultant = [p.consultant, p.consultant_dept].filter(Boolean).join(' · ') // 最近消費業務 · 業務員部門
              const hasMeta = p.sex || age != null || p.birthday || location || p.clean_zone || consultant || p.created_date
              if (!hasMeta) return null
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 16, rowGap: 6, marginTop: 8 }}>
                  {(p.sex || age != null || p.birthday) && (
                    <MetaItem icon="👤">
                      {[p.sex, age != null ? `${age} 歲` : null].filter(Boolean).join(' · ')}
                      {p.birthday && <span style={{ marginLeft: 4 }}>({p.birthday})</span>}
                    </MetaItem>
                  )}
                  {location && <MetaItem icon="📍">{location}</MetaItem>}
                  {p.clean_zone && <MetaItem icon="🏢">克立淨 {p.clean_zone}</MetaItem>}
                  {consultant && <MetaItem icon="🎧">服務顧問 {consultant}</MetaItem>}
                  {p.created_date && (
                    <MetaItem icon="📅">
                      {tenure != null ? `建立 ${tenure} 年` : '建立'} ({p.created_date})
                    </MetaItem>
                  )}
                  {p.next_maintenance && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--as-warning, #D97706)' }}>
                      <span aria-hidden style={{ fontSize: 13 }}>🗓️</span>
                      下次定保 {p.next_maintenance}
                    </span>
                  )}
                </div>
              )
            })()}
            {data && (data.profile.bought_families.length > 0 || data.profile.bought_models.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
                {data.profile.bought_families.length > 0 && (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>曾購系列</span>
                    {data.profile.bought_families.map(f => <span key={f} className="chip">{f}</span>)}
                  </>
                )}
                {data.profile.bought_models.length > 0 && (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--as-mute)', marginLeft: data.profile.bought_families.length > 0 ? 10 : 0 }}>曾購機型</span>
                    {data.profile.bought_models.map(m => <span key={m} className="chip">{m}</span>)}
                  </>
                )}
              </div>
            )}
          </div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--as-mute)' }}>{member.id}</span>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--as-mute)', fontSize: 13 }}>
          正在讀取 Salesforce 會員資料…
        </div>
      )}
      {error && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--as-mute)', fontSize: 13 }}>
          中台未連線,無法讀取此會員的即時資料。
        </div>
      )}

      {data && (
        <>
          {/* ── KPI 列 ── */}
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16 }} {...batchAttrs('B.個人.LiveKPI')}>
            <div className="kpi purple">
              <div className="lbl">累計消費</div>
              <div className="val" style={{ fontSize: 22 }}>{fmtM(data.purchase_summary.total)}</div>
              <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-mute)' }}>實績認列(Salesforce)</span></div>
            </div>
            <div className="kpi green">
              <div className="lbl">消費筆數</div>
              <div className="val">{data.purchase_summary.count}<span className="u">筆</span></div>
              <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-mute)' }}>首購 {data.purchase_summary.first_d || '—'}</span></div>
            </div>
            <div className="kpi orange">
              <div className="lbl">最近消費</div>
              <div className="val" style={{ fontSize: 22 }}>{data.purchase_summary.last_d || '—'}</div>
              <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-mute)' }}>最近一筆實績日期</span></div>
            </div>
            <div className="kpi red">
              <div className="lbl">服務紀錄</div>
              <div className="val">{data.services.length}<span className="u">筆</span></div>
              <div className="ft"><span style={{ fontSize: 11, color: 'var(--as-mute)' }}>派工 / 送修 / 維修完成</span></div>
            </div>
          </div>

          {/* ── 消費紀錄 ── */}
          <div className="card" style={{ marginBottom: 16 }} {...batchAttrs('B.個人.Live消費紀錄')}>
            <div className="ch">
              <div>
                <h3>消費紀錄</h3>
                <div className="csub">共 {data.purchases.length} 筆實績 · 來源:Salesforce(即時)</div>
              </div>
            </div>
            {data.purchases.length === 0 ? (
              <div style={{ padding: '16px 0', fontSize: 12, color: 'var(--as-mute)' }}>此會員尚無實績認列紀錄。</div>
            ) : (
              <div className="dt-wrap">
                <table className="dt">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>序號</th>
                      <th>來源</th>
                      <th style={{ textAlign: 'right' }}>金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.purchases.map(p => (
                      <tr key={p.no}>
                        <td className="mono" style={{ fontSize: 11 }}>{p.d}</td>
                        <td className="mono" style={{ fontSize: 12 }}>{p.no}</td>
                        <td style={{ fontSize: 12 }}>{p.source}</td>
                        <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{fmtM(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── 服務紀錄 ── */}
          <div className="card" style={{ marginBottom: 16 }} {...batchAttrs('B.個人.Live服務紀錄')}>
            <div className="ch">
              <div>
                <h3>服務紀錄</h3>
                <div className="csub">派工 / 送修 / 維修完成 · 來源:Salesforce(即時)</div>
              </div>
            </div>
            {data.services.length === 0 ? (
              <div style={{ padding: '16px 0', fontSize: 12, color: 'var(--as-mute)' }}>此會員尚無服務紀錄。</div>
            ) : (
              <div className="dt-wrap">
                <table className="dt">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>單號</th>
                      <th>類型</th>
                      <th>內容</th>
                      <th>狀態</th>
                      <th style={{ textAlign: 'right' }}>金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.services.map(s => (
                      <tr key={`${s.kind}-${s.no}`}>
                        <td className="mono" style={{ fontSize: 11 }}>{s.d || '—'}</td>
                        <td className="mono" style={{ fontSize: 12 }}>{s.no}</td>
                        <td><span className={`pill ${KIND_CLS[s.kind]}`}>{s.kind}</span></td>
                        <td style={{ fontSize: 12 }}>{s.title}</td>
                        <td style={{ fontSize: 12, color: 'var(--as-mute)' }}>{s.status}</td>
                        <td className="mono" style={{ textAlign: 'right' }}>{s.amount != null ? fmtM(s.amount) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {data.errors && data.errors.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 16 }}>
              ※ 部分資料讀取失敗:{data.errors.join(';')}
            </div>
          )}
        </>
      )}
    </>
  )
}
