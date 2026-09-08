/* GET /r/<token>[?ch=...] —— 送出報告，記一筆開啟事件，並把通路接到 CTA 上
 *
 * 三件事都刻意在伺服器端做，理由與 CTA 走 302 相同:
 * LINE 內建瀏覽器 / 轉傳情境下 JS 不一定跑得到，通路歸因與開啟率不該賭這個。
 */

/* 只認得這幾個通路。ch 會被寫進 HTML 屬性，不做白名單等於讓網址參數注入頁面。 */
const CHANNELS = new Set(['line', 'sms', 'email'])

/* token 會被嵌進下面那段 JS 字串,格式不先擋就等於讓路徑內容注入頁面。
 * publish.mjs 產的是 8 碼 base62,這裡放寬一點以免日後改長度就壞。 */
const TOKEN_RE = /^[0-9a-zA-Z]{6,16}$/

/* 頁面真的跑起來才送的那一筆。預抓取通常不執行 JS，兩筆對照就能分辨真開啟。
 * keepalive 讓請求在頁面被關掉後仍送得出去;sendBeacon 不是每個內建瀏覽器都有。 */
const BEACON = (token, ch) => `
;(function(){
  var u='/e/open?token=${token}${ch ? `&ch=${ch}` : ''}'
  try{
    if(navigator.sendBeacon){navigator.sendBeacon(u)}
    else{fetch(u,{method:'POST',keepalive:true})}
  }catch(e){}
})()`

export async function onRequestGet({ params, request, env, waitUntil }) {
  /* publish.mjs 與舊連結會帶 .html;這支函式接管了 /r/*,Pages 不再自己轉乾淨網址 */
  const token = String(params.token || '').replace(/\.html$/, '')
  if (!TOKEN_RE.test(token)) return new Response('not found', { status: 404 })

  const url = new URL(request.url)

  /* env.ASSETS 直接取靜態檔,不會再繞回這支函式。
   * ⚠ 沒有 public/404.html 的話,找不到的檔會被 Pages 換成首頁 200,這裡就擋不住。 */
  const asset = await env.ASSETS.fetch(new URL(`/r/${token}.html`, url.origin))
  if (!asset.ok) return new Response('not found', { status: 404 })

  const raw = url.searchParams.get('ch')
  const ch = CHANNELS.has(raw) ? raw : null

  /* 開啟事件不該讓客戶多等,也不該擋住報告 */
  waitUntil(
    env.DB.prepare(
      `INSERT INTO report_open (token, ch, source, ua, ip_country, opened_at)
       VALUES (?, ?, 'server', ?, ?, ?)`,
    )
      .bind(
        token,
        ch,
        request.headers.get('user-agent') || '',
        request.headers.get('cf-ipcountry') || '',
        new Date().toISOString(),
      )
      .run()
      .catch((e) => console.error('report_open(server) insert failed', e)),
  )

  return new HTMLRewriter()
    .on('a[href^="/c/"]', {
      element(el) {
        if (!ch) return
        const href = el.getAttribute('href')
        el.setAttribute('href', `${href}${href.includes('?') ? '&' : '?'}ch=${ch}`)
      },
    })
    .on('body', {
      element(el) {
        el.append(`<script>${BEACON(token, ch)}</script>`, { html: true })
      },
    })
    .transform(asset)
}
