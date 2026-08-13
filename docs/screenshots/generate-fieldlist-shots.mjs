/* 場域清單 — 標註截圖產生器
 * 依 AGENTS.md §7:截圖要進 repo,姓名一律遮成「陳○碩」,不留真名。 */
import { chromium } from 'playwright'

const OUT = '/Users/joeyshiue/repos/airsure/docs/screenshots'
const URL = 'http://localhost:5174/module-a'
const INK = '#111827'
const TINT = 'rgba(250, 204, 21, 0.18)'
const CLIP_X = 232, CLIP_W = 1360, LG_X = 258, LG_W = 1308

const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: 2 })
await p.goto(URL, { waitUntil: 'networkidle' })
await p.getByText('場域清單', { exact: false }).first().click()
/* 等 69 位真實客戶的姓名與「成員困擾」全部解析完(約 13 秒),
   KPI 與 chip 要到齊才截圖,否則圖上是解析中的過渡數字 */
await p.waitForFunction(() => document.body.innerText.includes('輪廓已解析'), null, { timeout: 60000 })
await p.waitForTimeout(600)

const maskNames = () => p.evaluate(() => {
  const mask = (s) => s.length <= 1 ? s : s.length === 2 ? s[0] + '○' : s[0] + '○' + s.slice(2)
  for (const el of document.querySelectorAll('.dt-nm')) {
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim() && !/^C\d+$/.test(n.textContent.trim())) {
        n.textContent = mask(n.textContent.trim()); break
      }
    }
  }
})

await p.addStyleTag({ content: `
  #anno { position: fixed; inset: 0; z-index: 99999; pointer-events: none;
          font-family: -apple-system, "PingFang TC", sans-serif; }
  #anno .hl { position: fixed; border: 2.5px dashed ${INK}; border-radius: 6px; background: ${TINT}; }
  #anno .bg { position: fixed; width: 26px; height: 26px; border-radius: 50%; background: ${INK};
              color: #fff; font-size: 15px; font-weight: 700; display: flex;
              align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,.35); }
  #anno .lg { position: fixed; background: #fff; border: 2px solid ${INK}; border-radius: 10px;
              padding: 15px 20px 17px; box-shadow: 0 4px 22px rgba(0,0,0,.2); }
  #anno .lg h4 { margin: 0 0 11px; font-size: 15.5px; font-weight: 800; color: ${INK}; }
  #anno .lg li { list-style: none; display: flex; gap: 10px; margin: 0 0 8px; font-size: 13.5px;
                 line-height: 1.55; color: #1f2937; }
  #anno .lg li:last-child { margin-bottom: 0 }
  #anno .lg li > b { flex: none; width: 20px; height: 20px; border-radius: 50%; background: ${INK};
                     color: #fff; font-size: 12px; display: flex; align-items: center;
                     justify-content: center; margin-top: 2px; font-weight: 700 }
  #anno .lg ul { margin: 0; padding: 0 }
  #anno .lg em { font-style: normal; color: #b91c1c; font-weight: 700 }
  #anno .lg s { text-decoration: none; font-weight: 700; color: ${INK} }
`})

/** 回傳 legend 的 rect,供 clip 計算 */
async function draw(items, legend) {
  return p.evaluate(({ items, legend, INK }) => {
    document.getElementById('anno')?.remove()
    const root = document.createElement('div'); root.id = 'anno'
    for (const it of items) {
      let r = it.rect
      if (!r) {
        const el = document.querySelectorAll(it.sel)[it.nth ?? 0]
        if (!el) { console.log('MISS', it.sel, it.nth); continue }
        const q = el.getBoundingClientRect()
        r = { x: q.x, y: q.y, w: q.width, h: q.height }
      }
      const pad = it.pad ?? 3
      const hl = document.createElement('div'); hl.className = 'hl'
      hl.style.cssText += `left:${r.x - pad}px;top:${r.y - pad}px;width:${r.w + pad * 2}px;height:${r.h + pad * 2}px`
      root.appendChild(hl)
      const bg = document.createElement('div'); bg.className = 'bg'; bg.textContent = it.n
      const bp = it.badge ?? 'tl'
      bg.style.cssText += `left:${(bp === 'tr' ? r.x + r.w + pad - 13 : r.x - pad - 13)}px;` +
                          `top:${(bp === 'bl' ? r.y + r.h + pad - 13 : r.y - pad - 13)}px`
      root.appendChild(bg)
    }
    document.body.appendChild(root)
    if (!legend) return null
    const lg = document.createElement('div'); lg.className = 'lg'
    lg.style.cssText += `left:${legend.x}px;top:${legend.y}px;width:${legend.w}px`
    lg.innerHTML = `<h4>${legend.title}</h4><ul>${legend.lines
      .map((t, i) => `<li><b>${i + 1}</b><span>${t}</span></li>`).join('')}</ul>`
    root.appendChild(lg)
    const q = lg.getBoundingClientRect()
    return { x: q.x, y: q.y, w: q.width, h: q.height, bottom: q.bottom }
  }, { items, legend, INK })
}

const rectOf = (sel, nth = 0) => p.evaluate(({ sel, nth }) => {
  const el = document.querySelectorAll(sel)[nth]; if (!el) return null
  const q = el.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height, bottom: q.bottom }
}, { sel, nth })

const shot = (name, top, lg) =>
  p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: CLIP_X, y: top, width: CLIP_W, height: lg.bottom + 26 - top } })

const scrollTo = async (y) => { await p.evaluate((y) => { document.querySelector('.mp').scrollTop = y }, y); await p.waitForTimeout(400) }

/* ══ 圖 1:上半部 ══════════════════════════════════════════ */
await maskNames()
const kpi = await rectOf('.kpi-row')
const src = await rectOf('.kpi-row + div')
const fb = await rectOf('.fb')
const srcNote = await rectOf('.kpi-row + div > span:last-child')
let lg = await draw([
  { sel: '.kpi', nth: 0, n: 1 },
  { sel: '.kpi .ft span:last-child', nth: 2, n: 2, badge: 'bl' },
  { rect: src, n: 3 },
  { rect: { x: fb.x + 4, y: fb.y, w: 590, h: fb.h }, n: 4, badge: 'bl' },
  { rect: srcNote, n: 5, badge: 'tr' },
], {
  x: LG_X, y: fb.bottom + 108, w: LG_W,
  title: '① 場域清單 · 上半部怎麼讀',
  lines: [
    'KPI 四格的單位是「<s>份</s>」＝設備數＝報告份數:可立即產製 / 本季已寄發 / 待補客戶輪廓 / 逾期待更新(距上次 &gt; 90 天)。',
    '每格右下的「真實 N · 示範 M」<em>要先看這行</em>——清單同時有 AIRCARE 合格清單的真實客戶與 9 筆示範,把示範的寄發數當成營運實績是這頁最容易犯的錯。',
    '母體來源:69 位真實客戶 / 72 台設備來自 AIRCARE 正式報告合格清單,姓名由客戶編號向 Salesforce 即時解析;其中僅 <s>3 台</s>已有設備分析報告(才有分群與指數),其餘標「待報告產出」。',
    '狀態 chip 的單位是「<s>位</s>」＝客戶列數,與 KPI 的「份」不同單位。判準是「該客戶有<s>任一台</s>設備落在該狀態」——所以多設備客戶可能同時出現在兩個 chip,「可產製 10 位」也會比表格上的 9 顆綠燈多 1(那位客戶四台狀態不一致,顯示「展開看各機」)。',
    '右側的解析進度:KPI 與 chip 吃的是<s>已套用 Salesforce 輪廓</s>的列,69 位全部解析完(約 13 秒)數字才到齊。解析中會標「輪廓解析中 N / 69 位」,此時可產製會被低估。搜尋框與 checkbox <em>尚未接</em>,輸入不會過濾、批次操作未實作。',
  ],
})
await shot('fieldlist-01-header', kpi.y - 26, lg)

/* ══ 圖 2:十欄怎麼讀 ══════════════════════════════════════ */
await scrollTo(150)
await maskNames()
const th = await rectOf('.dt thead th', 1)
lg = await draw([
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ sel: '.dt thead th', nth: i, n: i })),
  { sel: '.dt thead th', nth: 10, n: 10, badge: 'tr' },
], {
  x: LG_X, y: th.bottom + 292, w: LG_W,
  title: '② 十欄的讀法(顆粒度:一客戶一列,一台設備 ＝ 一份報告)',
  lines: [
    '<s>客戶 / 代號</s> — 姓名旁「SF 即時」＝這名字是剛從 Salesforce 換來的(repo 不落地姓名);「示範」＝虛構資料;「★ 高級」＝會員等級。副行是客戶編號與縣市/區/路名。',
    '<s>輪廓</s> — 來自 SF Contact 的「成員困擾」(多重選擇)。第一顆<s>粗體＝主輪廓</s>,決定客戶版報告的痛點與 CTA;紅底「待補輪廓」＝該客戶在 SF 沒勾任何項。',
    '<s>設備</s> — N 台。超過 1 台可點展開 ▾,逐台各自是一份報告、各自有狀態。',
    '<s>分群</s> — 對外只揭露金/銀/銅(內部風險類型對外一律以銅級揭露),灰字副標才是內部六大類型代號。<em>「待報告產出」＝這台還沒有設備分析報告</em>,所以沒有分群也沒有指數。',
    '<s>資料涵蓋</s> — 真實列顯示「感測 N 天 / 狀態 N 天」(合格清單給的有效天數);示範列顯示「N / 90 天」。真實列<em>不再用 90 天判合格</em>——合格與否由 AIRCARE 合格清單認定。',
    '<s>報告狀態</s> — 九態燈號(見表格下方圖例)。多設備狀態不一致時顯示「展開看各機」。',
    '<s>待補內容</s> — 卡住的<s>具體原因</s>,這是你要動作的依據,不是裝飾欄。',
    '<s>上次 / 到期</s> — 上次產出年月 + 下季到期日;沒出過為「首次」。',
    '<s>寄發</s> — 未寄 / 已寄 LINE / 已寄 Email / 已開啟(LINE)。',
    '<s>操作</s> — 按鈕文案隨狀態變(一鍵產製／補輪廓／核准／寄發／產新季報…),「資料未達標」為停用態。最右箭頭進場域詳情;<em>箭頭灰掉＝這台沒有設備分析報告</em>,點進去只會看到別台的曲線,故刻意擋掉。<em>所有操作按鈕目前是 UI 佔位,尚未接報告產出引擎。</em>',
  ],
})
await shot('fieldlist-02-columns', th.y - 34, lg)

/* ══ 圖 3:狀態怎麼分辨 ════════════════════════════════════ */
await scrollTo(150)
await maskNames()
const rows = await p.evaluate(() => [...document.querySelectorAll('.dt tbody tr')].map((el) => {
  const q = el.getBoundingClientRect()
  return { x: q.x, y: q.y, w: q.width, h: q.height, bottom: q.bottom, t: el.textContent }
}))
const pick = (fn) => rows.find(fn)
const rNeed = pick((r) => r.t.includes('待補輪廓') && r.t.includes('待報告產出'))
const rReady = pick((r) => r.t.includes('可產製'))
const rBad = pick((r) => r.t.includes('資料未達標') && !r.t.includes('過敏家庭'))
const rBoth = pick((r) => r.t.includes('資料未達標') && r.t.includes('過敏家庭'))
const box = (r, n) => ({ rect: { x: r.x + 12, y: r.y, w: r.w - 24, h: r.h }, n })
lg = await draw([box(rNeed, 1), box(rReady, 2), box(rBad, 3), box(rBoth, 4)], {
  x: LG_X, y: rBoth.bottom + 22, w: LG_W,
  title: '③ 四種狀態 · 各自該做什麼',
  lines: [
    '<s>橘燈 待補輪廓</s> — 資料與揭露都沒問題,只差 SF 沒填「成員困擾」。<s>動作:到 Salesforce 該 Contact 勾選「成員困擾」,回來重新整理頁面</s>(姓名/輪廓有記憶體快取,不重整不會更新)。目前 69 位合格客戶只有 10 位填了(14.5%)——<em>這是 CS 的填答率問題,不是系統問題</em>。',
    '<s>綠燈 可產製</s> — 資料、揭露、輪廓都齊了。輪廓「過敏家庭」是執行期從 SF 取回後<s>才放行</s>的:頁面載入時這列還是橘燈②,中台回傳「成員困擾」有值才變綠燈③。<s>動作:按「一鍵產製」。</s>',
    '<s>紅燈 資料未達標</s> — 按鈕停用是刻意的。待補內容寫「濕度分數為 0 但平均濕度 55.5%…」＝分數來源本身有缺陷,<s>動作:交中台/RD 確認,不要繞過</s>——這是揭露護欄。另一種寫「尚差 N 天感測資料」的則是等,欄位會給預估達標日。',
    '<s>有輪廓但仍是紅燈</s> — 正確行為,不是 bug。判定優先序是「揭露閘門 &gt; 輪廓」:這位客戶的成員困擾已填(過敏家庭 + 幼童/孕婦),但濕度分數異常,所以維持①資料未達標。反過來也成立:清單顯示可產製時,場域詳情的「產出客戶端報告」必定也可產製——兩邊共用同一支揭露閘門。',
  ],
})
await shot('fieldlist-03-states', rNeed.y - 34, lg)

/* ══ 圖 4:多設備展開(示範列,狀態不一致) ═══════════════════ */
await scrollTo(3000)
await p.evaluate(() => [...document.querySelectorAll('.pager button')].at(-2)?.click())
await p.waitForTimeout(1200)
await scrollTo(0)
await maskNames()
const found = await p.evaluate(() => {
  const tr = [...document.querySelectorAll('.dt tbody tr')].find((el) => el.textContent.includes('展開看各機'))
  if (!tr) return false
  tr.querySelector('td:nth-child(4)')?.click(); return true
})
if (!found) throw new Error('找不到「展開看各機」的多設備列')
await p.waitForTimeout(600)
/* 展開的示範列在頁面下緣,先把它捲到視窗上方,否則子列與圖說會超出視窗被截掉 */
await p.evaluate(() => {
  const tr = [...document.querySelectorAll('.dt tbody tr')].find((el) => el.textContent.includes('展開看各機'))
  document.querySelector('.mp').scrollTop += tr.getBoundingClientRect().y - 140
})
await p.waitForTimeout(400)
await maskNames()
const g = await p.evaluate(() => {
  const trs = [...document.querySelectorAll('.dt tbody tr')]
  const i = trs.findIndex((el) => el.textContent.includes('展開看各機'))
  const h = trs[i].getBoundingClientRect()
  const kids = trs.slice(i + 1).filter((el) => el.textContent.includes('└'))
  const k0 = kids[0].getBoundingClientRect(), kn = kids.at(-1).getBoundingClientRect()
  return { head: { x: h.x, y: h.y, w: h.width, h: h.height }, kids: { x: k0.x, y: k0.y, w: k0.width, h: kn.bottom - k0.y, bottom: kn.bottom } }
})
lg = await draw([
  { rect: { x: g.head.x + 12, y: g.head.y, w: g.head.w - 24, h: g.head.h }, n: 1 },
  { rect: { x: g.kids.x + 12, y: g.kids.y, w: g.kids.w - 24, h: g.kids.h }, n: 2 },
], {
  x: LG_X, y: g.kids.bottom + 22, w: LG_W,
  title: '④ 多設備客戶:一台設備 ＝ 一份報告',
  lines: [
    '客戶列的「設備 4 台 ▾」可點展開。四台狀態不一致時,報告狀態欄顯示<s>「展開看各機」</s>,操作欄變成「展開／收合」——此時沒有一個對整位客戶成立的動作。若四台狀態一致(例:全部待補輪廓),客戶列才會直接顯示該狀態與對應按鈕。',
    '展開後的子列才是真正的工作單位:每台各自有位置、型號、分群、資料涵蓋、報告狀態、待補內容、寄發與操作鈕。此例四台分別落在⑧已開啟/互動、⑤客戶版待審(濕度敘事需複核)、③可產製、⑥已核准——<s>要逐台處理,不能整位客戶一鍵帶過</s>。',
  ],
})
await shot('fieldlist-04-expand', g.head.y - 34, lg)

console.log('DONE')
await b.close()
