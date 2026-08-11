/* 真實設備報告註冊表。新增一台:
 *   python3 scratchpad/gen.py ~/Downloads/AirCare_<訂單>_<mac>.md
 * 然後在這裡 import 並加進陣列。devices/*.ts 由產生器輸出,不要手改。 */
import type { DeviceReport } from './types'
import { DEVICE as D_8065998dcaf0 } from './8065998dcaf0'
import { DEVICE as D_806599927630 } from './806599927630'
import { DEVICE as D_1cdbd4f8def8 } from './1cdbd4f8def8'

export type { DeviceReport, DeviceDaily } from './types'

export const DEVICE_REPORTS: DeviceReport[] = [
  D_8065998dcaf0,
  D_806599927630,
  D_1cdbd4f8def8,
]

/** 場域/設備 id ← MAC。真實設備在 Module A 用這個當 FieldRecord.id */
export const deviceFieldId = (mac: string) => `DEV-${mac.toUpperCase()}`

export const DEVICE_BY_FIELD_ID: Record<string, DeviceReport> =
  Object.fromEntries(DEVICE_REPORTS.map((d) => [deviceFieldId(d.meta.mac), d]))

/* 註:此處刻意不放 Salesforce Contact 對照表。
 * 中台 /api/members?q= 已支援客戶編號(SF Contact.LeadNum__c)前綴查詢,
 * 前端拿 meta.customerCode 即時換身分即可 —— 姓名/電話/Contact Id 不落地在 repo。
 * 見 hooks/useMember360.ts 的 useMemberByCode。 */
