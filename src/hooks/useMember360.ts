/* AirSure — 會員 360° hook(Module B 個人視圖)
 * 資料來源:克立淨 Salesforce 數據中台
 *   GET /api/members?q=      會員搜尋(姓名/電話)
 *   GET /api/member360?id=   單一會員消費 + 服務紀錄
 * 中台網址用 VITE_MIDDLE_API 設定(預設 http://localhost:8000);
 * 打不到 API 時回傳 null,呼叫端自動退回 mock 假資料。
 */
import { useEffect, useState } from 'react'

export interface MemberHit {
  id: string
  name: string
  phone: string
  email: string
  level?: string        // 客戶等級(如「B:一般客人」);中台搜尋結果帶回,用來辨識同名/同電話
  created_date?: string // 建檔日期 YYYY-MM-DD;同上,重複時的辨識欄位
}

export interface MemberPurchase {
  d: string
  no: string
  source: string
  amount: number
  order: string
}

export interface MemberService {
  d: string
  no: string
  kind: '派工' | '送修' | '維修完成'
  title: string
  status: string
  amount: number | null
}

export interface Member360 {
  mode: 'live' | 'demo'
  profile: {
    id: string
    name: string
    phone: string
    email: string
    created_date: string
    level: string          // 客戶等級(如「B:一般客人」)
    bought_families: string[] // 曾購系列
    bought_models: string[]   // 曾購機型
  }
  purchase_summary: { total: number; count: number; first_d: string; last_d: string }
  purchases: MemberPurchase[]
  services: MemberService[]
  errors?: string[]
}

const API_BASE: string =
  (import.meta as { env?: Record<string, string> }).env?.VITE_MIDDLE_API ?? 'http://localhost:8000'

/** 會員搜尋:q 至少 2 字才打 API,輸入停頓 300ms 後查詢。 */
export function useMemberSearch(q: string): { hits: MemberHit[]; searching: boolean; error: string | null } {
  const [hits, setHits] = useState<MemberHit[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const query = q.trim()
    if (query.length < 2) {
      setHits([])
      setSearching(false)
      return
    }
    let alive = true
    setSearching(true)
    const t = setTimeout(() => {
      fetch(`${API_BASE}/api/members?q=${encodeURIComponent(query)}`)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        .then((d: { members: MemberHit[] }) => {
          if (alive) {
            setHits(d.members)
            setError(null)
          }
        })
        .catch((e: unknown) => {
          if (alive) setError(String(e)) // 中台未連線:呼叫端顯示提示,示範會員照常
        })
        .finally(() => {
          if (alive) setSearching(false)
        })
    }, 300)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [q])

  return { hits, searching, error }
}

/** 單一會員 360°:id 為 null 時不查詢。 */
export function useMember360(id: string | null): { data: Member360 | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<Member360 | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setData(null)
      return
    }
    let alive = true
    setLoading(true)
    setData(null)
    fetch(`${API_BASE}/api/member360?id=${encodeURIComponent(id)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: Member360) => {
        if (alive) {
          setData(d)
          setError(null)
        }
      })
      .catch((e: unknown) => {
        if (alive) setError(String(e))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [id])

  return { data, loading, error }
}
