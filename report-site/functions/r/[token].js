/* GET /r/<token>[?ch=...] —— 送出報告，並把通路接到報告裡的 CTA 上
 *
 * 為什麼需要這支:報告是靜態檔,裡面的 CTA 寫死成 /c/<token>/<cta>,
 * 不會帶上「客戶是從哪個通路點進來的」。少了它,D1 的 ch 永遠是 null。
 *
 * 刻意在伺服器端改寫,不用前端 JS —— 與 CTA 走 302 是同一個理由:
 * LINE 內建瀏覽器 / 轉傳情境下 JS 不一定跑得到,通路歸因不該賭這個。
 */

/* 只認得這幾個通路。ch 會被寫進 HTML 屬性,不做白名單等於讓網址參數注入頁面。 */
const CHANNELS = new Set(['line', 'sms', 'email'])

export async function onRequestGet({ params, request, env }) {
  /* publish.mjs 與舊連結會帶 .html;這支函式接管了 /r/*,Pages 不再自己轉乾淨網址 */
  const token = String(params.token || '').replace(/\.html$/, '')
  const url = new URL(request.url)

  /* env.ASSETS 直接取靜態檔,不會再繞回這支函式 */
  const asset = await env.ASSETS.fetch(new URL(`/r/${token}.html`, url.origin))
  if (!asset.ok) return new Response('not found', { status: 404 })

  const ch = url.searchParams.get('ch')
  if (!CHANNELS.has(ch)) return asset

  return new HTMLRewriter()
    .on('a[href^="/c/"]', {
      element(el) {
        const href = el.getAttribute('href')
        el.setAttribute('href', `${href}${href.includes('?') ? '&' : '?'}ch=${ch}`)
      },
    })
    .transform(asset)
}
