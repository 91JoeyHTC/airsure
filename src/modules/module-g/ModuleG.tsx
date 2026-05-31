/* AirSure — Module G: 行銷與健康證書 */
import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { Icon } from '../../components/ui/Icon'
import { Sparkline } from '../../components/charts/Sparkline'
import { batchAttrs } from '../../components/ui/BatchAttrs'
import {
  G_KPIS,
  CERT_FUNNEL,
  RECENT_CERTS,
  REFERRAL_TIERS,
  TOP_REFERRERS,
  CAMPAIGNS,
  CHANNEL_STATS,
  DATA_GAP_SOURCES,
  REFERRAL_FUNNEL,
} from '../../mocks/module-g'

/* ── Cert Funnel tab ─────────────────────────────────────────────── */
function CertFunnelTab() {
  return (
    <div>
      {/* Horizontal Funnel */}
      <div className="card" style={{ marginBottom: 16 }} {...batchAttrs('G.健康證書')}>
        <div className="ch">
          <div>
            <h3>健康證書推薦漏斗</h3>
            <div className="csub">本月四指標追蹤 · 轉傳 → 開啟 → 預約 → 新客</div>
          </div>
          <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>更新於 09:42</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {CERT_FUNNEL.map((step, i) => (
            <div key={step.lbl} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, fontSize: 12, fontWeight: 600, color: 'var(--as-ink-2)', textAlign: 'right', flexShrink: 0 }}>
                {step.lbl}
              </div>
              <div style={{ flex: 1, position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>
                <div style={{
                  height: 36,
                  width: `${step.pct != null ? step.pct : 100}%`,
                  minWidth: '10%',
                  background: step.color,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                  transition: 'width 0.4s ease',
                }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--f-mono)' }}>
                    {step.n.toLocaleString()}
                  </span>
                </div>
                {step.pct != null && (
                  <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)', flexShrink: 0 }}>
                    轉換 {step.pct}%
                    {i === 3 && <span style={{ marginLeft: 6, color: step.color, fontWeight: 600 }}>新客</span>}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--as-bg)', borderRadius: 6, fontSize: 12, display: 'flex', gap: 24, color: 'var(--as-ink-2)' }}>
          <span>整體漏斗效率 <b style={{ fontFamily: 'var(--f-mono)', color: 'var(--as-h)' }}>4.1%</b></span>
          <span>本月目標 <b>120 新客</b> · 達成 <b style={{ color: 'var(--as-danger)' }}>97.5%</b></span>
          <span style={{ marginLeft: 'auto', color: 'var(--as-mute)' }}>★ 漏斗效率較上月 +0.6 pp</span>
        </div>
      </div>

      {/* Certificate template + issuance */}
      <div className="two-col">
        <div className="card">
          <div className="ch">
            <div>
              <h3>健康證書模板預覽</h3>
              <div className="csub">Q1 2026 · 信義居家居住空間健康認證</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn"><Icon name="eye" size={13} />預覽 PDF</button>
              <button className="btn primary cdefg"><Icon name="download" size={13} />批次寄送</button>
            </div>
          </div>
          {/* Mock certificate card */}
          <div style={{
            border: '2px solid #4F46E5',
            borderRadius: 10,
            overflow: 'hidden',
            marginTop: 8,
            background: 'linear-gradient(135deg, #F8F8FF 0%, #EEF2FF 100%)',
          }}>
            <div style={{ background: 'var(--as-cdefg)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--as-cdefg)', fontSize: 14 }}>A</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>AIRSURE · KLEIN AIR</div>
              </div>
              <div style={{ textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 700, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 8, padding: '6px 12px' }}>
                Q1<br />2026<br />★★★
              </div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--as-mute)', textTransform: 'uppercase', marginBottom: 6 }}>Certificate of Indoor Air Health</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--as-ink)', marginBottom: 4 }}>陳俊宏 先生</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--as-cdefg)', marginBottom: 8 }}>居家空間健康認證 · <span style={{ background: 'var(--as-cdefg)', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>A 級</span></div>
              <div style={{ fontSize: 12, color: 'var(--as-ink-2)', lineHeight: 1.6, marginBottom: 12 }}>
                經連續 90 天監測,信義居家空間平均 PM2.5 21 μg/m³、CO₂ 718 ppm、TVOC 0.31 mg/m³,綜合空氣品質指數達 A 級認證標準。
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 10, borderTop: '1px solid var(--as-line)' }}>
                {[['證書編號', 'AS-2026Q1-08412'], ['認證日期', '2026/04/15'], ['有效期', '2026/07/15']].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)', fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--f-mono)', color: 'var(--as-ink-2)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Issuance schedule */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--as-ink-2)', marginBottom: 6 }}>推薦寄送排程</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--as-ink-2)', padding: '8px 12px', background: 'var(--as-bg)', borderRadius: 6 }}>
              <Icon name="cal" size={14} />
              下次自動寄送：<b>2026/05/21 (週四) 10:00</b>
              <span style={{ marginLeft: 'auto', color: 'var(--as-cdefg)', cursor: 'pointer' }}>調整排程</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="ch">
            <div>
              <h3>近期證書發行記錄</h3>
              <div className="csub">本月共 482 份</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--as-cdefg)', fontFamily: 'var(--f-mono)', fontWeight: 600 }}>57% 達成率</div>
          </div>
          <div className="dt-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>會員</th>
                  <th>等級</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_CERTS.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--as-mute)' }}>{c.date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--as-cdefg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                          {c.member[0]}
                        </div>
                        <span style={{ fontSize: 13 }}>{c.member}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: c.grade === 'A' ? 'var(--as-success-tint)' : c.grade === 'B' ? 'var(--as-primary-tint)' : 'var(--as-warning-tint)',
                        color: c.grade === 'A' ? 'var(--as-success)' : c.grade === 'B' ? 'var(--as-primary)' : '#78350F',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {c.grade} 級
                      </span>
                    </td>
                    <td><span className={`pill ${c.statusCls}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Referral tab ─────────────────────────────────────────────────── */
function ReferralTab() {
  return (
    <div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 16 }} {...batchAttrs('G.推薦計劃')}>
        <div className="kpi green">
          <div className="lbl">本月邀請</div>
          <div className="val">189<span className="u">次</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />+24%</span><Sparkline data={[120,135,145,160,165,170,178,182,186,189]} color="var(--as-primary)" /></div>
        </div>
        <div className="kpi purple">
          <div className="lbl">轉換為會員</div>
          <div className="val">108<span className="u">位</span></div>
          <div className="ft"><span className="delta up"><Icon name="up" size={11} />57.1%</span><Sparkline data={[60,68,75,82,88,94,98,102,106,108]} color="var(--as-cdefg)" /></div>
        </div>
        <div className="kpi orange">
          <div className="lbl">已發放回饋</div>
          <div className="val">NT$ 86K</div>
          <div className="ft"><span className="delta">本月累計</span><Sparkline data={[40,48,55,62,68,72,76,80,84,86]} color="var(--as-h)" /></div>
        </div>
        <div className="kpi red">
          <div className="lbl">推薦帶來 LTV</div>
          <div className="val">2.4<span className="u">M · NT$</span></div>
          <div className="ft"><span className="delta">ROI 28×</span><Sparkline data={[1.5,1.7,1.9,2.0,2.1,2.2,2.3,2.35,2.4,2.4]} color="var(--as-danger)" /></div>
        </div>
      </div>

      <div className="two-col">
        {/* 6-tier reward system */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3E2 100%)', borderColor: '#FED7AA' }}>
          <div className="ch">
            <div>
              <h3 style={{ color: '#B45309' }}>六階推薦獎勵計劃</h3>
              <div className="csub">達成不同里程碑可解鎖回饋</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {REFERRAL_TIERS.map((t) => (
              <div key={t.n} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                background: t.got ? 'rgba(79,70,229,0.06)' : '#fff',
                borderRadius: 8,
                border: `1px solid ${t.got ? '#C7D2FE' : 'var(--as-line)'}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: t.got ? 'var(--as-cdefg)' : 'var(--as-bg)',
                  color: t.got ? '#fff' : 'var(--as-mute)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, fontFamily: 'var(--f-mono)',
                }}>{t.n}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--as-ink)' }}>{t.lbl}</div>
                  <div style={{ fontSize: 11, color: 'var(--as-cdefg)', fontWeight: 600 }}>{t.rwd}</div>
                  <div style={{ height: 4, background: 'var(--as-line-2)', borderRadius: 2, marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${t.pct}%`, background: t.got ? 'var(--as-success)' : 'var(--as-cdefg)', borderRadius: 2 }} />
                  </div>
                </div>
                {t.got && <Icon name="check" size={16} />}
              </div>
            ))}
          </div>
        </div>

        {/* Referral funnel */}
        <div className="card">
          <div className="ch">
            <div><h3>邀請漏斗</h3><div className="csub">本月 189 次邀請追蹤</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {REFERRAL_FUNNEL.map((step) => (
              <div key={step.lbl} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 52, fontSize: 12, color: 'var(--as-mute)', textAlign: 'right', flexShrink: 0 }}>{step.lbl}</div>
                <div style={{ flex: 1, height: 32, position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: `${step.pct ?? 100}%`,
                    background: step.color,
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', paddingLeft: 10,
                  }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-mono)' }}>{step.n}</span>
                  </div>
                </div>
                {step.pct != null && (
                  <span style={{ fontSize: 11, fontFamily: 'var(--f-mono)', color: 'var(--as-mute)', width: 48, flexShrink: 0 }}>{step.pct}%</span>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 16, padding: '10px 14px', background: 'var(--as-bg)', borderRadius: 6, fontSize: 12 }}>
            <span><b>整體轉換率</b> 57.1%</span>
            <span><b>付費轉換</b> 32.3%</span>
            <span><b>單客成本</b> NT$ 796</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Top 10 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="ch">
          <div><h3>推薦人排行榜 · TOP 10</h3><div className="csub">本月回饋金額累計</div></div>
          <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>共 38 位活躍推薦人</span>
        </div>
        <div className="dt-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th style={{ width: 48 }}>排名</th>
                <th>推薦人</th>
                <th style={{ textAlign: 'right' }}>邀請</th>
                <th style={{ textAlign: 'right' }}>成功</th>
                <th>轉換率</th>
                <th style={{ textAlign: 'right' }}>累計回饋</th>
                <th>最近活躍</th>
              </tr>
            </thead>
            <tbody>
              {TOP_REFERRERS.map((t) => (
                <tr key={t.cid}>
                  <td>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 12,
                      background: t.rk === 1 ? '#FDE68A' : t.rk === 2 ? '#E5E7EB' : t.rk === 3 ? '#FECACA' : 'var(--as-bg)',
                      color: t.rk <= 3 ? 'var(--as-ink)' : 'var(--as-mute)',
                    }}>{t.rk}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: t.tier === 'g' ? 'linear-gradient(135deg, #F59E0B, #B45309)' : 'linear-gradient(135deg, var(--as-cdefg), #7C3AED)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                      }}>{t.av}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {t.nm}
                          {t.tier === 'g' && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#FEF3C7', color: '#78350F', fontWeight: 600 }}>高級</span>}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--as-mute)', fontFamily: 'var(--f-mono)' }}>{t.cid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{t.invites}</td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--as-success)' }}>{t.success}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{ width: `${t.rate}%`, height: '100%', background: 'var(--as-success)' }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 40 }}>{t.rate}%</span>
                    </div>
                  </td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--as-h-ink)' }}>NT$ {t.reward.toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: 'var(--as-mute)' }}>{t.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ── Campaign Management tab ──────────────────────────────────────── */
function CampaignsTab() {
  return (
    <div>
      {/* Campaign cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }} {...batchAttrs('G.活動管理')}>
        {CAMPAIGNS.map((c) => (
          <div key={c.title} style={{ border: '1px solid var(--as-line)', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
            <div style={{
              padding: '16px 20px',
              background: c.theme === 'spring' ? 'linear-gradient(135deg, #E8F5E9, #C6F6D5)' :
                         c.theme === 'health' ? 'linear-gradient(135deg, #EEF2FF, #C7D2FE)' :
                         'linear-gradient(135deg, #F0F9FF, #BAE6FD)',
              borderBottom: '1px solid var(--as-line)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--as-ink)' }}>{c.title}</h4>
              <span style={{
                padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                background: c.status === 'live' ? 'var(--as-success)' : 'var(--as-mute-2)',
                color: '#fff',
              }}>{c.statusLbl}</span>
            </div>
            <div style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 12 }}>
                {c.dateRange} · {c.target} · {c.channel}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { l: c.status === 'draft' ? '目標數' : '觸及', v: c.reach != null ? c.reach.toLocaleString() : '—' },
                  { l: c.status === 'draft' ? '參與' : '參與', v: c.participate != null ? c.participate.toLocaleString() : '—' },
                  { l: '轉換', v: c.conversion != null ? `${c.conversion}%` : '—' },
                ].map((s) => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-ink)' }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: 'var(--as-mute)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 6, background: 'var(--as-line-2)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${c.progress}%`, background: c.status === 'live' ? 'var(--as-cdefg)' : 'var(--as-mute-2)', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>{c.progressTag}</div>
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--as-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--as-mute)' }}>{c.budget}</span>
              <span style={{ fontSize: 12, color: 'var(--as-cdefg)', cursor: 'pointer', fontWeight: 600 }}>{c.ctaLbl}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Channel performance */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <div><h3>觸達通路成效</h3><div className="csub">本月 · 跨通路漏斗追蹤 · 預估 ROAS 5.8×</div></div>
          <span className="csub" style={{ fontFamily: 'var(--f-mono)' }}>更新於 09:42</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 8 }}>
          {CHANNEL_STATS.map((ch) => (
            <div key={ch.ch} style={{
              border: '1px solid var(--as-line)', borderRadius: 8, padding: '14px 16px',
              borderTop: `3px solid ${ch.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: ch.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{ch.glyph}</div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{ch.nm}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: ch.deltaUp ? 'var(--as-success)' : 'var(--as-danger)' }}>{ch.delta}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-ink)', marginBottom: 4 }}>
                {ch.reach.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--as-mute)', marginLeft: 4 }}>送達</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)', marginBottom: 8 }}>{ch.sub}</div>
              <div style={{ height: 4, background: 'var(--as-line-2)', borderRadius: 2, marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${ch.openPct}%`, background: ch.color, borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--as-mute)' }}>
                <span>開啟 <b style={{ color: 'var(--as-ink)' }}>{ch.openPct}%</b></span>
                <span>轉換 <b style={{ color: 'var(--as-success)' }}>{ch.ctrPct}%</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication center */}
      <div className="card">
        <div className="ch">
          <div><h3>溝通中心 · 訊息模板</h3><div className="csub">本月 7,861 人次觸達 · 18 個範本使用中</div></div>
          <button className="btn primary cdefg"><Icon name="plus" size={13} />新增範本</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 8 }}>
          {[
            { ch: 'LN', nm: '春季健康月邀請', cat: '行銷活動', sent: 1840, open: 78, ctr: 18.4, last: '今日 09:00', live: true, color: '#06C755' },
            { ch: '@', nm: 'Q1 健康證書發送', cat: '會員權益', sent: 482, open: 42, ctr: 28.2, last: '昨日 10:00', live: true, color: '#4F46E5' },
            { ch: 'LN', nm: '訂閱續約 14 天提醒', cat: '續約', sent: 624, open: 82, ctr: 26.0, last: '本週', live: true, color: '#06C755' },
            { ch: 'SM', nm: '設備異常即時告警', cat: '系統', sent: 88, open: 94, ctr: 12.5, last: '今日', live: true, color: '#D97706' },
            { ch: 'PN', nm: 'PM2.5 健康提醒', cat: '健康', sent: 2412, open: 52, ctr: 14.2, last: '本週', live: true, color: '#7C3AED' },
            { ch: '@', nm: '梅雨季空氣關懷 (草稿)', cat: '行銷活動', sent: 0, open: 0, ctr: 0, last: '—', live: false, color: '#9CA3AF' },
          ].map((t) => (
            <div key={t.nm} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid var(--as-line)', borderRadius: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.ch}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{t.nm}</span>
                  <span className={`pill ${t.live ? 'g' : ''}`} style={{ fontSize: 10 }}>{t.live ? '使用中' : '草稿'}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 2 }}>
                  <span className="tt" style={{ marginRight: 8 }}>{t.cat}</span>最後發送 · {t.last}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
                <div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-mono)' }}>{t.sent.toLocaleString()}</div><div style={{ fontSize: 10, color: 'var(--as-mute)' }}>送達</div></div>
                <div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-mono)' }}>{t.open}%</div><div style={{ fontSize: 10, color: 'var(--as-mute)' }}>開啟率</div></div>
                <div><div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-success)' }}>{t.ctr}%</div><div style={{ fontSize: 10, color: 'var(--as-mute)' }}>點擊率</div></div>
              </div>
              <button className="rowbtn"><Icon name="arrow" size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Data Gap tab ─────────────────────────────────────────────────── */
function DataGapTab() {
  const missing = DATA_GAP_SOURCES.filter((g) => g.status === 'missing').length
  const overall = DATA_GAP_SOURCES.reduce((a, b) => a + b.cov, 0) / DATA_GAP_SOURCES.length

  return (
    <div {...batchAttrs('G.數據缺口')}>
      {/* Red alert banner */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--as-danger-tint)',
        border: '1px solid #FCA5A5',
        borderLeft: '4px solid var(--as-danger)',
        borderRadius: 8,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <Icon name="alert-triangle" size={20} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--as-danger)', marginBottom: 4 }}>
            ⚠ 廣告與聲量資料整合 — 目前最大資料缺口
          </div>
          <div style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.6 }}>
            目前 IoT 與客戶資料基本具備，<b>唯一明顯缺口是行銷管理的廣告活動資料</b>。
            以下 <b>{DATA_GAP_SOURCES.length} 個資料源待整合</b>，其中 <b>{missing} 個未對接</b>，
            整體覆蓋率僅 <b>{overall.toFixed(0)}%</b>。
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--as-ink-2)', width: 80 }}>整體覆蓋率</span>
          <div style={{ flex: 1, height: 8, background: 'var(--as-line-2)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${overall}%`, background: 'var(--as-danger)', borderRadius: 4 }} />
            <div style={{ position: 'absolute', left: '80%', top: 0, bottom: 0, width: 2, background: 'var(--as-ink-2)' }} title="目標 80%">
              <span style={{ position: 'absolute', top: 10, left: 4, fontSize: 10, color: 'var(--as-mute)', whiteSpace: 'nowrap' }}>目標 80%</span>
            </div>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--as-danger)', width: 40 }}>{overall.toFixed(0)}%</span>
        </div>
      </div>

      {/* 6 data source status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
        {DATA_GAP_SOURCES.map((g) => (
          <div key={g.k} style={{
            border: `1px solid ${g.status === 'missing' ? '#FCA5A5' : g.status === 'partial' ? '#FDE68A' : 'var(--as-line)'}`,
            borderRadius: 8, padding: '14px 16px',
            background: g.status === 'missing' ? '#FFF5F5' : g.status === 'partial' ? '#FFFBEB' : '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--as-ink)' }}>{g.nm}</div>
                <div style={{ fontSize: 11, color: 'var(--as-mute)', marginTop: 2 }}>{g.sub}</div>
              </div>
              <span style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: g.status === 'missing' ? 'var(--as-danger)' : g.status === 'partial' ? 'var(--as-warning)' : 'var(--as-success)',
                color: '#fff',
              }}>
                {g.status === 'missing' ? '❌ 未對接' : g.status === 'partial' ? '⚠ 部分' : '✓ 完整'}
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--as-line-2)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${g.cov}%`, background: g.status === 'missing' ? 'var(--as-danger)' : 'var(--as-warning)', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[['需求', g.need], ['負責', g.owner], ['預計', g.eta]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                  <span style={{ color: 'var(--as-mute)', width: 32, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: 'var(--as-ink-2)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action items */}
      <div className="card">
        <div className="ch">
          <div><h3>行動項目清單</h3><div className="csub">依優先序排列 · 指定負責人</div></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {[
            { n: 1, t: '對接 Meta Ads API + UTM 對齊規範', owner: 'Joey + 立坦', eta: 'Q3 2026', pri: 'high' },
            { n: 2, t: 'GA4 + Google Ads API 整合方案確認', owner: 'Joey + 立坦', eta: 'Q3 2026', pri: 'high' },
            { n: 3, t: '網路聲量工具 OpView/iBuzz 評估完成', owner: '行銷主管', eta: 'Q2 2026', pri: 'mid' },
            { n: 4, t: 'LINE LAP API 串接規劃書送出', owner: '立坦', eta: 'Q4 2026', pri: 'mid' },
            { n: 5, t: '搜尋能見度工具採購決策', owner: '行銷主管', eta: 'TBD', pri: 'lo' },
          ].map((item) => (
            <div key={item.n} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 14px', borderRadius: 8, border: '1px solid var(--as-line)',
              background: item.pri === 'high' ? 'var(--as-danger-tint)' : 'var(--as-bg)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: item.pri === 'high' ? 'var(--as-danger)' : item.pri === 'mid' ? 'var(--as-warning)' : 'var(--as-mute-2)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>{item.n}</div>
              <div style={{ flex: 1, fontWeight: 500, fontSize: 13, color: 'var(--as-ink)' }}>{item.t}</div>
              <div style={{ fontSize: 11, color: 'var(--as-mute)' }}>{item.owner}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--f-mono)', color: 'var(--as-mute)', width: 60, textAlign: 'right' }}>{item.eta}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn"><Icon name="cal" size={13} />排程同步會議</button>
          <button className="btn primary cdefg"><Icon name="check" size={13} />檢視整合計畫</button>
        </div>
      </div>
    </div>
  )
}

/* ── Module G main ────────────────────────────────────────────────── */
export function ModuleG() {
  const [tab, setTab] = useState<string>('cert')

  return (
    <PageShell
      tk="G"
      tkClass="cdefg"
      title="行銷與健康證書"
      sub="營運模組 · 活動 / 推薦 / 證書"
      actions={
        <>
          <button className="btn"><Icon name="download" size={14} />匯出</button>
          <button className="btn primary cdefg"><Icon name="plus" size={14} />新增活動</button>
        </>
      }
      tabs={[
        { k: 'cert', l: '健康證書' },
        { k: 'referral', l: '推薦計劃' },
        { k: 'campaigns', l: '活動管理' },
        { k: 'datagap', l: '數據缺口' },
      ]}
      activeTab={tab}
      onTab={setTab}
    >
      {/* KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }} {...batchAttrs('G.KPI')}>
        {G_KPIS.map((k) => (
          <div key={k.lbl} className={`kpi ${k.cls}`}>
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}{k.unit && <span className="u">{k.unit}</span>}</div>
            <div className="ft">
              <span className={`delta ${k.deltaUp ? 'up' : 'dn'}`}>
                <Icon name={k.deltaUp ? 'up' : 'down'} size={11} />{k.delta}
              </span>
              <Sparkline data={k.spark} color={
                k.cls === 'purple' ? 'var(--as-cdefg)' :
                k.cls === 'green' ? 'var(--as-primary)' :
                k.cls === 'orange' ? 'var(--as-h)' : 'var(--as-danger)'
              } />
            </div>
          </div>
        ))}
      </div>

      {tab === 'cert' && <CertFunnelTab />}
      {tab === 'referral' && <ReferralTab />}
      {tab === 'campaigns' && <CampaignsTab />}
      {tab === 'datagap' && <DataGapTab />}
    </PageShell>
  )
}
