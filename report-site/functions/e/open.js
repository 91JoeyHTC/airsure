/* POST /e/open?token=<token>&ch=<ch> —— 報告在瀏覽器裡真的跑起來了
 *
 * 由 /r/<token> 注入的 beacon 送出。與伺服器端那筆的差別見 schema.sql:
 * 預抓取通常不執行 JS,所以「有 beacon」幾乎等於人真的看到了。
 *
 * 沒有 body —— sendBeacon 送空 body 最不容易被內建瀏覽器擋掉,參數走 query。
 */

const CHANNELS = new Set(['line', 'sms', 'email'])

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  if (!token) return new Response('missing token', { status: 400 })

  const raw = url.searchParams.get('ch')
  const ch = CHANNELS.has(raw) ? raw : null

  try {
    await env.DB.prepare(
      `INSERT INTO report_open (token, ch, source, ua, ip_country, opened_at)
       VALUES (?, ?, 'beacon', ?, ?, ?)`,
    )
      .bind(
        token,
        ch,
        request.headers.get('user-agent') || '',
        request.headers.get('cf-ipcountry') || '',
        new Date().toISOString(),
      )
      .run()
  } catch (e) {
    console.error('report_open(beacon) insert failed', e)
  }

  /* 回什麼客戶端都不看,但要小、要快 */
  return new Response(null, { status: 204 })
}
