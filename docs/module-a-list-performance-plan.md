# Module A · 名單成效（行銷名單成效管理）Plan

對應簡報：**第十屏 · 行銷名單成效管理**（族群分析章）
建立日期：2026-09-06
Implementation note：`docs/implementation-notes/module-a-list-performance-implementation-note.md`

---

## 項目 1：新增「名單成效」第一層 tab

**需求來源**
使用者提供第十屏投影片，三項需求：
1. 依行銷方案設計寄發週報／月報／季報
2. 報告內之 CTA 環圈設計之成效管理
3. 服務跟進成效管理

投影片版面：一個方案（2026.10 噴噴方案）下三張卡（週報 124 戶／月報 78 戶／季報 36 戶），每張卡含「顯示名單」與「寄發管理／CTA 行動／服務跟進」三個入口 —— 與已上線的族群卡（`CohortCard`）是同一個模板，只是分組軸從「空品族群」換成「行銷方案 × 寄發頻率」。

**目標頁面 / 流程**
`/module-a` 第一層 tab，插在「族群分析」與「場域清單」之間：

```
設備總覽 → 族群分析 → 【名單成效】 → 場域清單 → 個人場域資訊
 (母體)     (分群)     (方案×頻率)     (逐戶執行)    (單戶)
```

理由：Module A 的 IA 是一條由大到小的漏斗，「方案 × 頻率」的粒度正好落在「分群」與「逐戶」之間；且族群卡的「CTA 行動」「服務跟進」兩個 disabled 佔位就是要連到這裡。

**目標檔案**

| 檔案 | 動作 |
|---|---|
| `src/mocks/module-a-campaign.ts` | 新增 · 資料契約 + 示範資料 + compute* |
| `src/modules/module-a/ModuleA.tsx` | 新增 `AListPerformance`；`ATab` 加 `'perf'`；tabs 陣列插入；族群卡兩個佔位改為可點 |
| `src/data/batch-map.ts` | 補 4 列批次標示 |
| `docs/implementation-notes/module-a-list-performance-implementation-note.md` | 新增 |

**目前問題**
- 「行銷方案」與「寄發頻率（週／月／季）」兩個概念在 repo 完全不存在。
- `module-a-report.ts` 只有九態與 `SendState`（`none`/`line`/`email`/`opened`），沒有 cadence、沒有 campaign、沒有 CTA 事件、沒有服務跟進轉換。
- 族群卡的「CTA 行動」「服務跟進」是 disabled 佔位（`title="待接入:尚無此類資料源"`）。

**預計改動**
- 新資料層 `module-a-campaign.ts`（見項目 2）。
- 新 tab 版面三段：方案選擇器 → 三張 cadence 卡 → 選中後展開該批成效（寄發漏斗 / CTA 環圈成效 / 服務跟進成效）。
- 族群卡「CTA 行動」「服務跟進」改為跳本 tab 並帶該族群篩選。

**API / DB / 外部服務影響**
本輪**無**（純前端示範層）。正式資料源需求列於項目 3。

**驗收條件**
1. `/module-a` 第一層 tab 為 `設備總覽 / 族群分析 / 名單成效 / 場域清單 1284 / 個人場域資訊`，順序正確。
2. 切換方案，三張 cadence 卡的戶數隨之改變且加總 = 該方案名單數。
3. 點任一張 cadence 卡，下方展開該批的寄發漏斗 / CTA / 服務跟進三張卡。
4. 「顯示名單」「寄發管理」跳場域清單；「CTA 行動」「服務跟進」在本 tab 內切換視圖，**不再是 disabled**。
5. 族群分析的族群卡「CTA 行動」「服務跟進」可點，跳本 tab 並顯示「僅看 ④濕度風險」可清除 chip。
6. 每張卡都有批次徽章與「示範值 · 待接入」標示。

**風險 / 限制**
- **投影片的 124/78/36 是示意值，不照抄**。實作以「可產報告的客戶」為母體（`REPORT_ROWS`：69 真實 + 9 示範 = 78 位），戶數由名單長度算出。照抄會與場域清單的母體打架，重演「字卡與表各說各話」的老問題。
- CTA 點擊與服務跟進轉換**沒有任何資料源**，全部是示範 overlay，UI 必須標示，且批次標 P2/P3。
- 不動 `module-a-report.ts` 的九態與寄發狀態 —— 那是場域清單的真相，本 tab 只讀不寫。

**驗證方式**
`npm run build`（含 `tsc -b`）、`npm run lint`（不得新增 error）、人工 smoke 走完驗收條件 1–6。

---

## 項目 2：資料契約 `src/mocks/module-a-campaign.ts`

**名單母體**
`REPORT_ROWS`（場域清單同一份）。**沒有報告就沒東西可寄** —— `cat === null`（無設備分析報告、因此無分群）的客戶不進名單。

**寄發頻率由分群推出，不是貼上去的標籤**（沿用 §4.3「分群是算出來的」原則）：

| 頻率 | 收哪些族群 | 理由 |
|---|---|---|
| 週報 `weekly` | ④濕度風險 ⑤清淨風險 ⑥雙風險 | 風險三群需要密集跟進 |
| 月報 `monthly` | ③銅級空氣 ⑦乾燥 | 單項偏弱，月度節奏足夠 |
| 季報 `quarterly` | ①金級空氣 ②銀級空氣 | 已穩定，季度回顧即可 |

**型別**

```ts
export type Cadence = 'weekly' | 'monthly' | 'quarterly'
export type CtaId = 'inspect' | 'filter' | 'dehumid' | 'upgrade' | 'maintain'
export type FollowUpState = 'none' | 'contacted' | 'scheduled' | 'done'

export interface CampaignMeta {
  id: string; name: string; period: string
  status: 'active' | 'closed'
  /** 這個方案只收哪些族群;null = 全收 */
  cohorts: CatId[] | null
  note: string
}

/** 名單一列 = 一位客戶在某方案下的一筆寄發 */
export interface ListMember {
  customerId: string; name: string; cat: CatId; isDemo: boolean
  cadence: Cadence
  /* ↓ 以下全為示範 overlay,無資料源 */
  sent: boolean; delivered: boolean; opened: boolean
  cta: CtaId | null           // 點了哪個 CTA 環圈;null = 未點
  follow: FollowUpState
}
```

**寄發漏斗六階段**：名單 → 已寄發 → 已送達 → 已開啟 → 點 CTA → 服務跟進成立。

**成效事件生成**：固定 seed 的決定性 hash（比照 `module-a-overview.ts` 的 `jitterOf`），重整頁面數字不變。轉換率依 cadence 分層 —— 週報寄發疲勞、開啟率最低，季報最高。

**兩個示範方案**

| id | 名稱 | 狀態 | 名單 |
|---|---|---|---|
| `c202610` | 2026.10 噴噴方案 | 進行中 | 全族群，三個頻率 |
| `c202607` | 2026.07 夏季除濕方案 | 已結束 | 只收 ④⑥⑦（濕度相關），週報 + 月報 |

**KPI 拆真實／示範**：沿用 `AFieldList` 的 `KpiSplit` 慣例，每個數字都標「真實 N · 示範 M」。

---

## 項目 3：正式資料源需求（本輪不做，供中台排期）

依 AGENTS.md §10 規則 4「需要新資料先在中台加端點」。

| 需要的東西 | 來源 | 建議端點 |
|---|---|---|
| 行銷方案主檔（名稱／期間／狀態／名單規則） | 行銷／報告引擎 | `GET /api/campaigns` |
| 方案名單 + 寄發頻率 + 寄發狀態 | 報告產出引擎 | `GET /api/campaigns/{id}/members` |
| 報告內 CTA 環圈曝光／點擊 | 報告引擎埋點 | `GET /api/campaigns/{id}/cta` |
| 服務跟進轉換（CTA → 派工／送修／維修完成） | SF `Work__c` / `FailureReport__c` / `RepairOrder__c` | `GET /api/campaigns/{id}/followup` |

批次標示：方案總覽與寄發漏斗 **P2**（報告引擎回填）；CTA 成效與服務跟進 **P2**（需埋點 + SF 對應），皆標「待接入」。

---

## 分級

**大改**（跨 tab、新資料層、影響 IA）→ 完整 item packet + implementation note + 驗證紀錄。
