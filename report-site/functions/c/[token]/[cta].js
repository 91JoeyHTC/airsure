/* GET /c/<token>/<cta>  —— CTA 點擊追蹤
 *
 * 先寫事件、再 302 轉走。刻意不用前端埋點:
 * 連結被複製、轉傳、在 LINE 內建瀏覽器開啟時,JS 埋點常常收不到,302 一定收得到。
 *
 * ⚠ 原型:目的地寫在這裡。正式版應由設定檔/DB 決定,才能不改報告就換活動頁。
 */

const DESTINATIONS = {
  tank: '/demo-destination.html?from=tank',
  inspect: '/demo-destination.html?from=inspect',
  filter: '/demo-destination.html?from=filter',
}

export async function onRequestGet({ params, request, env }) {
  const token = String(params.token || '')
  const cta = String(params.cta || '')
  const dest = DESTINATIONS[cta]

  /* 不認識的 CTA 就不要轉 —— 開放轉址等於幫別人做跳板 */
  if (!dest) return new Response('unknown cta', { status: 404 })

  const url = new URL(request.url)
  const ch = url.searchParams.get('ch')

  /* 寫事件失敗也要讓使用者轉過去 —— 追蹤壞掉不該擋住客戶的行動 */
  try {
    await env.DB.prepare(
      `INSERT INTO cta_click (token, cta_id, ch, ua, ip_country, clicked_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(
      token,
      cta,
      ch,
      request.headers.get('user-agent') || '',
      request.headers.get('cf-ipcountry') || '',
      new Date().toISOString(),
    ).run()
  } catch (e) {
    console.error('cta_click insert failed', e)
  }

  const to = new URL(dest, url.origin)
  if (ch) to.searchParams.set('ch', ch)
  return Response.redirect(to.toString(), 302)
}
