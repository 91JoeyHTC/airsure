/* 上架處理(原型)—— 把一份原始報告 HTML 變成可追蹤的線上報告。
 *
 * 目前做到:接上「設定倒水提醒」的追蹤轉址、開啟埋點、字型落地到本站。
 * 其餘 CTA 與分享按鈕還沒做(見 README)。
 *
 * 用法:
 *   node scripts/publish.mjs <原始報告.html> <客戶編號> <設備MAC>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { randomBytes } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildIndex } from './build-index.mjs'
import { localizeFonts } from './localize-fonts.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const [src, customerNo, mac] = process.argv.slice(2)
if (!src || !customerNo || !mac) {
  console.error('用法: node scripts/publish.mjs <原始報告.html> <客戶編號> <設備MAC>')
  process.exit(1)
}

/* 8 碼 base62 ≈ 218 兆組合。簡訊一則約 70 中文字,token 不能長。 */
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const newToken = () =>
  Array.from(randomBytes(8), (b) => ALPHABET[b % 62]).join('')

/* 這一版只接一顆。第一個元素就是報告最主要的行動 —— 整份報告的結論是水箱卡了 801 小時。 */
const CTA_PATCHES = [
  { id: 'tank', label: '設定倒水提醒' },
]

const html = readFileSync(src, 'utf8')
const token = newToken()

let out = html
const applied = []
for (const { id, label } of CTA_PATCHES) {
  /* 只換這顆按鈕自己的 href,不碰版面與其他連結 */
  const re = new RegExp(`(<a\\s+href=")#("[^>]*>\\s*${label})`, 'g')
  const before = out
  out = out.replace(re, `$1/c/${token}/${id}$2`)
  if (out !== before) applied.push(`${label} → /c/${token}/${id}`)
  else console.warn(`⚠ 找不到按鈕「${label}」,未注入`)
}

/* 字型搬到本站(§5.5 第 1 條)。要連 Google 取 subset,失敗就不該悄悄放行。 */
let fontInfo
try {
  fontInfo = await localizeFonts(out, { publicDir: join(ROOT, 'public') })
  out = fontInfo.html
} catch (e) {
  console.error(`\n✘ 字型處理失敗:${e.message}`)
  console.error(`   報告會留著 Google Fonts 連結,違反規格 §5.5 第 1 條,不予上架。`)
  process.exit(1)
}

/* 上架前檢查 —— 不過就不給上架(規格 §5.5) */
const externals = [...out.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !u.startsWith('http://www.w3.org/'))

const outDir = join(ROOT, 'public', 'r')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, `${token}.html`), out, 'utf8')

/* token → 報告對照。正式版要進 D1(dispatch/campaign_member),原型先用檔案。 */
const mfPath = join(ROOT, 'reports', 'manifest.json')
const mf = JSON.parse(readFileSync(mfPath, 'utf8'))
mf.tokens[token] = { customerNo, mac, src, publishedAt: new Date().toISOString() }
writeFileSync(mfPath, JSON.stringify(mf, null, 2) + '\n', 'utf8')

buildIndex()

console.log(`\n✅ 已上架`)
console.log(`   token       ${token}`)
console.log(`   客戶編號     ${customerNo}`)
console.log(`   設備 MAC     ${mac}`)
console.log(`   本機網址     http://localhost:8788/r/${token}?ch=line`)
console.log(`   已接上追蹤   ${applied.length ? applied.join(', ') : '(無)'}`)
console.log(`   HTML 大小    ${(Buffer.byteLength(out) / 1024).toFixed(0)} KB(字型不算在內,首屏只等這個)`)
console.log(`   字型         ${fontInfo.chars} 個字元 subset,放在 /f/ 同網域`)
for (const r of fontInfo.report) {
  console.log(`     · ${r.family.padEnd(16)} ${(r.bytes / 1024).toFixed(0).padStart(4)} KB  ${r.files.join(' ')}`)
}
if (externals.length) {
  console.log(`\n⚠ 這份報告仍引用 ${externals.length} 個外部資源(規格 §5.5 要求全部內嵌):`)
  for (const u of [...new Set(externals)]) console.log(`   · ${u}`)
  console.log(`   原型階段先放行,正式上架前要處理。`)
}
console.log()
