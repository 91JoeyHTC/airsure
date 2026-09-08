/* 產生 public/index.html —— 原型的首頁,把已上架的報告列出來。
 *
 * 純粹是測試時的方便:不然每次都要回頭翻 manifest.json 抄 token。
 * 正式版沒有這一頁 —— 報告站不該有任何列出所有客戶報告的入口。
 *
 * 用法:
 *   node scripts/build-index.mjs        單獨重產
 *   (publish.mjs 上架完會自動叫一次)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function buildIndex() {
  const mf = JSON.parse(readFileSync(join(ROOT, 'reports', 'manifest.json'), 'utf8'))
  const rows = Object.entries(mf.tokens).sort((a, b) =>
    (b[1].publishedAt || '').localeCompare(a[1].publishedAt || ''),
  )

  /* 相對連結 —— 手機用區網 IP 連進來時才不會被導回 localhost */
  const links = (t) =>
    ['line', 'sms', 'email']
      .map((ch) => `<a href="r/${t}?ch=${ch}">${ch}</a>`)
      .concat(`<a href="r/${t}">未帶</a>`)
      .join(' · ')

  const body = rows.length
    ? `<table>
  <tr><th>token</th><th>客戶編號</th><th>設備 MAC</th><th>上架</th><th>用哪個通路開</th></tr>
${rows
  .map(
    ([t, r]) => `  <tr>
    <td><code>${esc(t)}</code></td>
    <td>${esc(r.customerNo)}</td>
    <td><code>${esc(r.mac)}</code></td>
    <td class="dim">${esc((r.publishedAt || '').slice(0, 16).replace('T', ' '))}</td>
    <td class="ch">${links(esc(t))}</td>
  </tr>`,
  )
  .join('\n')}
</table>`
    : `<p class="dim">還沒有上架任何報告。跑 <code>node scripts/publish.mjs &lt;報告.html&gt; &lt;客戶編號&gt; &lt;MAC&gt;</code>。</p>`

  const html = `<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>AirCare 報告站 · 本機原型</title>
<style>
body{font-family:-apple-system,"PingFang TC",sans-serif;background:#faf8f3;color:#1a2330;
     margin:0;padding:32px 24px;line-height:1.7}
main{max-width:860px;margin:0 auto}
h1{font-size:22px;color:#134731;margin:0 0 4px}
.warn{background:#fff4e5;border:1px solid #e0b978;border-radius:6px;padding:12px 16px;
      font-size:13px;color:#6b4a12;margin:16px 0 24px}
table{border-collapse:collapse;width:100%;background:#fff;border:1px solid #d4cfc2;border-radius:8px;
      overflow:hidden;font-size:14px}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #ece7dc;vertical-align:top}
th{background:#f2efe7;font-weight:600;font-size:13px;white-space:nowrap}
tr:last-child td{border-bottom:0}
code{background:#e8f1ec;padding:1px 6px;border-radius:4px;font-size:13px}
.dim{color:#8794a3;font-size:13px}
.ch a{color:#134731;white-space:nowrap}
p{font-size:14px}
</style></head><body><main>
<h1>AirCare 報告站</h1>
<p class="dim">本機原型 —— 驗證「點報告裡的按鈕 → 事件被記下來 → 客戶正確轉走」。</p>
<div class="warn">⚠ 這一頁只是測試方便，含客戶編號，<strong>不進版控、不會存在於正式環境</strong>。<br>
正式的報告站不該有任何列出所有客戶報告的入口。</div>
${body}
<p class="dim">通路（<code>ch</code>）是從報告網址接到按鈕上的，所以要從上面的連結進去，
點了才會記成對應通路。測試步驟見 <code>README.md</code>。</p>
</main></body></html>
`

  const outDir = join(ROOT, 'public')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html, 'utf8')
  return rows.length
}

/* 直接執行時才動手,被 import 時不動 */
if (process.argv[1] && process.argv[1].endsWith('build-index.mjs')) {
  console.log(`✅ public/index.html 已更新(${buildIndex()} 份報告)`)
}
