# Dispatch 資料模型規格草案(給中台)

- 建立：2026-09-08
- 用途：AirSure Module A「名單成效」與「場域清單」共用的寄發事件模型
- 相關：`docs/module-a-list-performance-plan.md`、`docs/AIRCARE報告產製Dashboard_設計規格.md`
- 前端現況：`src/mocks/module-a-campaign.ts`（示範 overlay，待本規格落地後替換）

---

## 一、已定案決策（2026-09-08 與需求方確認）

| # | 議題 | 決策 |
|---|---|---|
| 1 | 週報／月報是什麼 | **是另一種 `report_type`**，但內容與 CTA 尚未定義 → **目前一律以季報呈現**；模型先保留 `report_type` 欄位，週／月報等內容定案後再補 |
| 2 | Dispatch 顆粒度 | **一戶一次寄發，內含多份設備報告**（Dispatch 掛客戶層，`report_id` 為多筆） |
| 3 | 未達門檻的客戶 | **進名單**；漏斗要呈現「未達門檻・寄不出」這一段流失 |
| 5 | 通路與狀態 | **拆成 `channel` + `state` 兩欄**，不再像現況 `SendState` 混在一個 enum |
| 6 | `opened` 的定義 | **報告連結被點開**即算已開啟（不採用 Email open pixel） |
| 8 | CTA 成效口徑 | **分母 = 打開報告次數，分子 = 點擊互動數** |
| 9 | 歸因時間窗 | **7 天** |
| 10 | 歸因規則 | 沒點 CTA 直接來電**不計入**點擊成效；同一戶多次點擊算**最近一次**（last-click） |
| 11 | API 形狀 | 兩支：`summary`（彙總，名單成效用）＋ `members`（分頁逐列，場域清單用） |
| 12 | 個資 | Dispatch 回前端**不得帶**姓名／電話／Email／LINE ID；只回客戶編號與事件時間戳 |
| 13 | 時區 | 一律臺北時區日曆日，與設備報告的母體定義對齊 |
| — | 保留期限 | **2 年**（季報要看去年同期） |
| — | 寄發節流 | **同一客戶同週最多一封** |

### ⚠ 到時候要補充：週報／月報

決策 1 明確保留，但目前**只有季報存在**。補的時候要一併定義：

- 內容範圍（週報的統計期是 7 天？還是仍看 90 天只是提高寄發頻率？）
- 資料門檻（季報是 `REPORT_DATA_THRESHOLD_DAYS = 90`；週報的門檻是多少）
- CTA 環圈設計（週報放哪些 CTA、與季報是否共用一套 `cta_id`）
- 與季報的節流關係（同一客戶同週最多一封，週報上線後會與季報衝突）
- 逾期判定（季報是「距上次 96 天」；週報的 `due` 規則）

模型上已預留 `report_type`，補的時候**不需要改表結構**，只需新增列舉值與各自的門檻設定。

---

## 二、待確認（附建議預設值）

| # | 待確認 | 建議預設 | 若不定會怎樣 |
|---|---|---|---|
| 4 | 場域清單九態的 ⑦已寄發／⑧已開啟，與 Dispatch 事件**誰是真相** | Dispatch 存事件為唯一真相；九態的 ⑦⑧ 由該客戶最新一筆 Dispatch **推導**，不另外落地 | 兩邊各存一份，會出現「清單顯示未寄、成效顯示已開啟」 |
| 7 | 電子豹（Email）串接範圍 | 見下方 §2.1 | 通路狀態沒有真相來源 |
| 8b | 「打開報告次數」是**次數**還是**人數** | 兩者都存：`opens`（事件數）與 `unique_opens`（去重戶數）；CTA 互動率預設用 unique | 同一人開 5 次，互動率會被稀釋成 1/5 |
| — | 名單快照是否凍結 | **方案啟動時凍結名單成員**（分母穩定可比）；但每次寄發**重算寄發資格**（門檻可能剛好達標） | 名單規模月月浮動，轉換率不可比 |

### 2.1 電子豹（決策 7 的展開）

方向可行，但要先確認四件事：

1. **範圍**：電子豹只管 Email。**LINE 通路要另外接**（LINE Messaging API 的 delivery／read），兩條通路的狀態語意要統一到同一組 `state`。
2. **哪些欄位以電子豹為準**：建議 `sent` / `delivered` / `bounced` / `unsubscribed` 用電子豹。
   ⚠ **`opened` 不要用電子豹的 open pixel** —— 依決策 6，已開啟的定義是「報告連結被點開」，那是我們自己的埋點。兩者不可混用，否則 Apple Mail Privacy Protection 會讓開啟率虛高。
3. **對帳鍵**：電子豹的 message id 要能對回我們的 `dispatch_id`（用自訂欄位或 tag 帶過去），否則回來的事件無法歸戶。
4. **取得方式**：webhook 推還是 API 拉？重送如何去重？失敗重試算 1 次還是 N 次 `sent`？
5. **個資**：收件 Email 不得出中台，前端一律只拿客戶編號。

---

## 三、建議表結構

```
campaign                      行銷方案
  id                PK
  name                         例:2026.10 噴噴方案
  period_start / period_end
  status                       draft | active | closed
  cohort_rule                  名單規則(族群範圍),null = 全收
  report_type                  目前一律 'quarterly';週/月報待定義(決策 1)
  frozen_at                    名單凍結時點

campaign_member               方案 × 客戶(戶為單位,決策 2)
  id                PK
  campaign_id       FK
  customer_no                  SF Contact.LeadNum__c
  planned_cadence              weekly | monthly | quarterly ← 目前一律 quarterly
  eligible                     是否已達報告資料門檻(決策 3:未達也留在名單)
  ineligible_reason            資料未達標 / 缺輪廓 / 已退訂
  joined_at

dispatch                      一次寄發 = 一戶一次(決策 2)
  id                PK
  campaign_member_id FK
  report_type                  決策 1
  channel                      line | email          ← 決策 5
  state                        queued | sent | delivered | bounced
                               | unsubscribed | opened
  sent_at / delivered_at / opened_at                 ← opened 見決策 6
  external_id                  電子豹 message id / LINE request id(決策 7)
  attempt_no                   重試次數

dispatch_report               一次寄發夾帶的設備報告(決策 2:一戶多份)
  dispatch_id       FK
  report_id         FK         對應場域清單那一列的設備報告 ← 兩個 tab 的接點
  device_mac                   內部用,不出前端

report_open                   報告開啟事件(決策 6、8b)
  dispatch_id       FK
  report_id         FK
  opened_at
  (去重後可得 unique_opens;原始列即 opens)

cta_click                     報告內 CTA 環圈點擊(決策 8)
  id                PK
  dispatch_id       FK
  report_id         FK
  cta_id                       預約空氣檢測 / 更換濾網 / 加購除濕 / 升級機型 / 預約定期保養
  clicked_at

follow_up                     服務跟進歸因(決策 9、10)
  cta_click_id      FK         last-click:同戶多次點擊取最近一次
  sf_object                    Work__c | FailureReport__c | RepairOrder__c
  sf_record_id
  created_at
  attributed                   是否落在 7 天窗內
```

### 兩個 tab 的接點

`dispatch_report.report_id` 就是縫合線。關係是 **1 報告 : N 寄發**（同一份季報可能重寄、或下一季重出）：

- **場域清單** = 逐戶逐報告的執行檢視，其寄發狀態由該報告**最新一筆 dispatch** 推導（待確認 #4）
- **名單成效** = 同一批 dispatch 的彙總檢視

---

## 四、端點（決策 11）

### `GET /api/campaigns`
方案清單。前端用來畫方案選擇器。

### `GET /api/campaigns/{id}/summary?cadence=`
名單成效直接吃這支，回**已算好的**漏斗與成效（不要讓前端拼）：

```jsonc
{
  "campaign": { "id": "c202610", "name": "2026.10 噴噴方案", "report_type": "quarterly" },
  "funnel": {
    "members": 1284,          // 名單(決策 3:含未達門檻)
    "eligible": 1092,         // 已達門檻・可產製
    "sent": 1040,
    "delivered": 1006,
    "opened": 612,            // 決策 6:報告連結被點開
    "unique_opens": 612,      // 決策 8b
    "opens": 918,             // 事件數
    "cta_clicks": 214,
    "follow_ups": 96          // 決策 9/10:7 天內 last-click
  },
  "cta": [
    { "cta_id": "dehumid", "clicks": 92, "rate_of_opens": 15.0, "follow_up_rate": 58.3 }
  ],
  "follow_up": [
    { "state": "done", "n": 42 }, { "state": "scheduled", "n": 31 }
  ]
}
```

`rate_of_opens` = 點擊數 ÷ 開啟數（決策 8）。

### `GET /api/campaigns/{id}/members?cadence=&state=&page=`
場域清單吃這支，一列一戶（決策 2），**不含姓名／Email／LINE ID**（決策 12）：

```jsonc
{
  "total": 1284,
  "rows": [
    {
      "customer_no": "C2026010062",
      "eligible": true,
      "reports": [{ "report_id": "r_8891", "device_code": "AC-****-A" }],
      "latest_dispatch": {
        "channel": "email", "state": "opened",
        "sent_at": "2026-10-03T09:12:00+08:00",
        "opened_at": "2026-10-03T21:40:00+08:00"
      },
      "cta_clicks": [{ "cta_id": "filter", "clicked_at": "2026-10-03T21:41:12+08:00" }],
      "follow_up": { "sf_object": "Work__c", "attributed": true }
    }
  ]
}
```

---

## 五、前端落地順序

1. `GET /api/campaigns` + `summary` → 名單成效脫離 overlay
2. `members` → 場域清單加「方案」「頻率」欄與篩選，跳轉帶 `campaign_id`
3. 九態的 ⑦⑧ 改由 dispatch 推導（待確認 #4 定案後）
4. 週／月報 `report_type` 補上（本文 §1 的待補清單）
