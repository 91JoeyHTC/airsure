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
  /* 客戶編號(SF Contact.LeadNum__c「客戶編號(C)」,無值時退 LeadNum_F__c)。
   * 設備分析報告的 customer.code 就是這個欄位 —— Module A 場域 ↔ SF 會員的接點。 */
  lead_num?: string
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
    lead_num?: string      // 客戶編號(C);對應設備分析報告的 customer.code
    bought_families: string[] // 曾購系列
    bought_models: string[]   // 曾購機型
    // 識別卡補充欄位(SF Contact:Sex__c / Birthday__c / CustomerAge__c / City__c / Area__c
    //   / Address__c / CleanZone__c / CSR_EmployeeID__r.Name / NextMaintenanceDate__c)
    sex?: string           // 性別
    birthday?: string      // 生日 YYYY-MM-DD
    age?: number | null    // 年齡(SF 衍生欄位)
    city?: string          // 縣市
    area?: string          // 區域
    address?: string       // 地址
    clean_zone?: string    // 克立淨分區(如「北一區」)
    consultant?: string    // 服務顧問 = 最近一次消費業務(SalesBy__c)
    consultant_dept?: string // 業務員部門(成員部門,SalesByDepartment__c)
    next_maintenance?: string // 下次定保(SF 型別為 string)
  }
  purchase_summary: { total: number; count: number; first_d: string; last_d: string }
  purchases: MemberPurchase[]
  services: MemberService[]
  errors?: string[]
}

const API_BASE: string =
  (import.meta as { env?: Record<string, string> }).env?.VITE_MIDDLE_API ?? 'http://localhost:8000'

/** 依客戶編號解析單一會員(Module A 場域詳情用)。
 *
 * 走 /api/members?q= 而不是把 Contact Id + 姓名寫死在前端 mock:
 *   ① 姓名是個資,本 repo 不留;報告本來就有客戶編號,拿編號換身分即可
 *   ② Salesforce 才是身分的真相來源,改名/換電話不必動程式碼
 * 中台對客戶編號是「前綴」比對,可能撈到同批多筆 → 只取 lead_num 完全相等那筆,
 * 沒有完全相等的就回 null(寧可不顯示,也不猜)。
 *
 * 結果連同「當初查的編號」一起存,loading 由 res.code !== c 推導 ——
 * 這樣 effect 裡不需要同步 setState(避免 cascading render),
 * 切換場域時也不會先閃一下上一位客戶的姓名。 */
export function useMemberByCode(code: string | null | undefined): { member: MemberHit | null; loading: boolean } {
  const c = (code ?? '').trim()
  const [res, setRes] = useState<{ code: string; member: MemberHit | null } | null>(null)

  useEffect(() => {
    if (c.length < 2) return
    let alive = true
    fetch(`${API_BASE}/api/members?q=${encodeURIComponent(c)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { members: MemberHit[] }) => {
        if (alive) setRes({ code: c, member: d.members.find(m => m.lead_num === c) ?? null })
      })
      .catch(() => {
        if (alive) setRes({ code: c, member: null }) // 中台未連線:呼叫端退回只顯示客戶編號
      })
    return () => {
      alive = false
    }
  }, [c])

  const settled = res?.code === c
  return { member: settled ? res.member : null, loading: c.length >= 2 && !settled }
}

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
