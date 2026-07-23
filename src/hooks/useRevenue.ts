/* AirSure — 營收資料 hook
 * 資料來源:克立淨 Salesforce 數據中台 GET /api/revenue
 * 中台網址用 VITE_MIDDLE_API 設定(預設 http://localhost:8000);
 * 打不到 API 時回傳 null,呼叫端自動退回 mock 假資料。
 */
import { useEffect, useState } from 'react'

export interface RevenueBucket {
  name: string
  amount: number
}

export interface MonthAmount {
  month: number
  amount: number
}

export interface RevenueData {
  mode: 'live' | 'demo'
  kpis: {
    ytd_revenue: number
    mtd_revenue: number
    last_month_revenue: number
    mom_pct: number | null
    month_target: number
    month_target_pct: number | null
    year_target: number
    year_target_pct: number | null
    last_year_revenue: number
  }
  monthly_yoy: { this_year: MonthAmount[]; last_year: MonthAmount[] }
  by_department: RevenueBucket[]
  by_channel: RevenueBucket[]
  by_source: RevenueBucket[]
  top_customers: RevenueBucket[]
}

const API_BASE: string =
  (import.meta as { env?: Record<string, string> }).env?.VITE_MIDDLE_API ?? 'http://localhost:8000'

export function useRevenue(): { data: RevenueData | null; error: string | null } {
  const [data, setData] = useState<RevenueData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/api/revenue`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: RevenueData) => {
        if (alive) setData(d)
      })
      .catch((e: unknown) => {
        if (alive) setError(String(e)) // 靜默退回 mock,錯誤僅供除錯
      })
    return () => {
      alive = false
    }
  }, [])

  return { data, error }
}

/** 74_623_391 → "74.6" (單位 M) */
export const toM = (n: number): string => (n / 1_000_000).toFixed(1)
