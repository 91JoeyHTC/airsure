/* 把報告用到的字型搬到報告站自己的網域 —— 計畫 §5.5 第 1 條。
 *
 * 原始報告載三套 Google Fonts(含兩套中文)。這裡做兩件事:
 *
 *   1. subset —— 只取這份報告真的出現過的字元(約 740 個,中文 640)。
 *      中文完整檔好幾 MB,不切不能用。另外要**可變字型**(wght@400..900),
 *      單檔涵蓋所有字重,比四個固定字重各一檔省一半以上(220KB vs 450KB)。
 *   2. 落地 —— woff2 寫進 public/f/<內容雜湊>.woff2,@font-face 指到 /f/...。
 *
 * 為什麼不 base64 內嵌進 HTML:
 *   內嵌後 HTML 從 105KB 變 804KB(gzip 24KB → 565KB),而且要**整份下載完
 *   才畫得出第一個字**。客戶是從簡訊/LINE 用手機開,那是好幾秒白畫面,
 *   違反 §3.2 N2「手機優先、低延遲」。
 *   §5.5 第 1 條要擋的風險是「第三方 CDN 失效整份報告就毀了」—— 字型放在
 *   報告站同一個部署,那個風險一樣完全消除:要掛就跟報告一起掛。
 *   代價是不符合「全部 inline」的字面要求,這是上架前明確拍板過的取捨。
 *
 * 需要連得到 Google —— 這是上架時的一次性動作,產出的報告零第三方請求。
 */
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

/* 字重寫成範圍才拿得到可變字型。中文兩套吃全部字元,等寬只吃拉丁。 */
const FACES = [
  { family: 'Noto Sans TC', wght: '400..900', cjk: true, preload: true },
  { family: 'Noto Serif TC', wght: '400..900', cjk: true, preload: true },
  { family: 'JetBrains Mono', wght: '400..700', cjk: false, preload: false },
]

const stripTags = (html) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ')

const isCjk = (c) => c >= '⺀' && c <= '﫿'

async function fetchFace({ family, wght, cjk }, chars, fontDir) {
  const text = [...chars].filter((c) => cjk || !isCjk(c)).join('')
  const q = new URLSearchParams({ family: `${family}:wght@${wght}`, text })
  const css = await fetch(`https://fonts.googleapis.com/css2?${q}`, {
    headers: { 'User-Agent': UA },
  }).then((r) => {
    if (!r.ok) throw new Error(`${family}: css2 回 ${r.status}`)
    return r.text()
  })

  /* 逐個 @font-face 換掉 src,其餘(font-weight 範圍、unicode-range)原樣留著 */
  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) || []
  if (!blocks.length) throw new Error(`${family}: css2 沒有回 @font-face`)

  let bytes = 0
  const files = []
  const out = []
  for (const block of blocks) {
    const url = block.match(/url\((https:\/\/[^)]+)\)/)?.[1]
    if (!url) continue
    const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()))

    /* 檔名用內容雜湊:同樣的 subset 跨報告共用一份,而且可以永久快取 */
    const name = `${createHash('sha256').update(buf).digest('hex').slice(0, 16)}.woff2`
    if (!existsSync(join(fontDir, name))) writeFileSync(join(fontDir, name), buf)

    bytes += buf.length
    files.push(name)
    out.push(
      block
        .replace(/url\(https:\/\/[^)]+\)/, `url(/f/${name})`)
        /* swap:字型還沒到就先用系統字顯示,不要空白 */
        .replace(/\}\s*$/, '  font-display: swap;\n}'),
    )
  }
  return { css: out.join('\n'), bytes, files }
}

export async function localizeFonts(html, { publicDir }) {
  const chars = new Set(
    [...stripTags(html)].filter((c) => c.trim() && c.codePointAt(0) > 0x1f),
  )

  const fontDir = join(publicDir, 'f')
  mkdirSync(fontDir, { recursive: true })

  const parts = []
  const report = []
  const preloads = []
  for (const face of FACES) {
    const { css, bytes, files } = await fetchFace(face, chars, fontDir)
    parts.push(css)
    report.push({ family: face.family, bytes, files })
    if (face.preload) preloads.push(...files)
  }

  let out = html
  /* 拿掉 Google 的 preconnect 與 stylesheet —— 留著就還是第三方請求 */
  out = out.replace(/\s*<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g, '')

  /* 字型抓取一律走 CORS,所以連同網域的 preload 也得帶 crossorigin,
   * 不帶會抓兩次(preload 那份不會被 @font-face 重用)。 */
  const head =
    preloads
      .map((n) => `<link rel="preload" href="/f/${n}" as="font" type="font/woff2" crossorigin>`)
      .join('\n') +
    `\n<style>\n/* 字型:同網域,只含本份報告用到的 ${chars.size} 個字元 */\n${parts.join('\n')}\n</style>\n`

  out = out.includes('</head>') ? out.replace('</head>', `${head}</head>`) : head + out

  return { html: out, chars: chars.size, report }
}
