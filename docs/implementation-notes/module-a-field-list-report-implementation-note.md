# Module A 場域清單升第一層 + 對齊報告產製清單頁 — Implementation Note

- 對應 plan：`docs/module-a-field-list-report-plan.md`
- 目前狀態：**completed**（本輪五個項目全數落地，未提交）
- 最近更新：2026-08-13

## 本輪操作摘要

1. 讀 `docs/ report/` 三份輸入（設計規格 md、mockup html、截圖）與 Module A 現況，確認「場域清單」目前是「個人場域資訊」的 sub-tab。
2. 與使用者確認三個決定：IA 放在分類概況之後、完整照 report 清單頁重做、改成一客戶一列多設備展開。
3. 寫 plan（item packet）→ 建報告資料層 → 建新清單元件 → 改 Module A 的 tab 結構 → build / lint 驗證。

## 已完成項目

### 項目 1：場域清單升為第一層 tab
- `ATab` 增 `'list'`，主 tab 改為 `整體場域 / 分類概況 / 場域清單(1284) / 個人場域資訊`（`ModuleA.tsx`）。
- `APersonalSub` 移除 `'list'`，sub-tab 剩五個切面；sub-tab 列右側改放「回場域清單」。
- `openCategoryList()`（整體層 upsell 卡片）改成切 `list` 主 tab 並帶六大類型篩選。
- 場域詳情的「回場域清單」與新的 sub-tab 列按鈕都指向新的第一層 tab。

### 項目 2：ReportButton 移位
- 從 sub-tab 列移進 `ALocationDetail` Hero 卡底部的動作條，文案加「快照 + 免登入連結，產出後收不回」。
- 清單頁的產製動作改由每列「操作」欄負責。

### 項目 3：報告資料層 `src/mocks/module-a-report.ts`（新檔）
- 九態 `ReportState` + `REPORT_STATE_META`（燈號色、操作按鈕文案）。
- 輪廓 `ProfileId` / 寄發 `SendState` / 對外分群 `tierOfCat()`（④⑤⑥ 風險軸對外一律揭露為銅級）。
- `REPORT_ROWS`：由 `FIELDS_A_FULL` 聚成客戶列，`FieldRecord.dev` 的總數展開成設備子列。
- 狀態判定 `resolveState()` 優先序：天數不足 → gate `unverified` → gate `blocked`（僅內部版）→ 缺輪廓 → overlay 流程狀態。
- `REPORT_KPI` / `REPORT_FILTERS` / `matchesFilter()`：KPI 四格算「報告（設備）數」，chip 算「客戶數」與列數一致。

### 項目 4：清單頁 `src/modules/module-a/AFieldList.tsx`（新檔）
- KPI 四格 + 五個狀態 chip（可與六大類型篩選並存，chip 可清除）+ 規格十欄 + 九態圖例 + footer。
- 多設備客戶可展開設備子列；狀態不一致時客戶列顯示「展開看各機」，操作欄變「展開/收合」。
- 舊 `ALocationList` 已刪除（原 ModuleA.tsx 1040–1178），保留一行註解指向新檔。

### 項目 5：資料層共用與隱私
- `getFieldDetail()` 從 `ModuleA.tsx` 搬到 `mocks/module-a.ts` 並 export —— 清單狀態與詳情頁的揭露閘門吃同一份判斷。
- `maskName()` 依規格 §2 遮蔽第二個字（陳○宏 / 安○診所）；`MASK_CUSTOMER_NAME` 常數可一鍵切回全名。
- 真實設備列沒有落地姓名，客戶欄改顯示客戶編號 + 「姓名待 Salesforce 即時查詢」，不再重複印兩次編號。
- `batch-map.ts` 新增 `A.場域清單.報告產製`（p2 · 需報告產出引擎回填）。

### 項目 6：姓名解析與快取（第二輪，2026-08-13）
- `hooks/useMember360.ts`：新增 session 級 `memberCache` / `memberInflight` 與 `fetchMemberByCode()`；`useMemberByCode()` 改由快取推導狀態（同編號只查一次，切換場域不再重打）；新增 `useMembersByCodes()`（未快取才查、併發上限 4）與 `clearMemberCache()`。
- 快取只在記憶體，不寫 localStorage/sessionStorage。
- `MASK_CUSTOMER_NAME` 改 `false`，清單顯示全名；`maskName()` 保留供對外報告使用。
- `AFieldList` 只對「沒有 mock 姓名」的列送查（＝真實設備 3 筆），解析到的列標「SF 即時」，footer 顯示 `N / M 筆 Salesforce 即時`。

### 項目 7–8：匯入合格清單 + 輪廓對應（第三輪，2026-08-13）
- 新增 `src/mocks/eligible-customers.ts`：72 台 / 69 位客戶，地址截到路名層級（縣市＋行政區＋路名），姓名電話不落地。
- `module-a-report.ts` 改成兩個 builder：`buildRealRow()`（合格清單，不套 90 天門檻，只留揭露閘門與輪廓兩道判斷）與 `buildDemoRow()`（原 9 筆示範，維持舊規則）。
- `ReportDeviceRow` 新增 `orderNo` / `sensorDays` / `statusDays`，`fieldId` 與 `cat` 改為可為 null（沒有設備分析報告就沒有分群，也不能點進詳情）。
- `ReportCustomerRow` 新增 `isDemo`。
- `AFieldList` 加真分頁（20 筆/頁）、示範標記、「待報告產出」空狀態、停用箭頭、KPI 真實/示範分子、母體來源說明列。
- 新增 `profileFromConcern()`：SF「成員困擾」→ 報告輪廓的關鍵字對應（中台尚未回傳該欄位，先備好）。

### 項目 8 續：成員困擾是多重選擇（第四輪，2026-08-13）
拿到欄位定義：`Family_Bothered__c`，選項清單（多重選擇）。

- `ReportCustomerRow.profile: ProfileId | null` → `profiles: ProfileId[]`；清單輪廓欄可疊多個標籤，第一個粗體為主輪廓。
- `profileFromConcern()` → `profilesFromConcern()`：以 `;；,、` 斷詞後逐詞比對，回傳依 `PROFILE_PRIORITY`（過敏 > 幼童 > 銀髮 > 寵物 > KOL > 一般）排序的陣列。
- 新增 `applyLiveProfiles(row, profiles)`：中台回傳輪廓後，把卡在 ② 待補輪廓的設備放行到 ③ 可產製；其餘狀態不動。`AFieldList` 已呼叫，中台一開放欄位就生效。
- `MemberHit.family_bothered` 與 `Member360.profile.family_bothered` 型別先定義好。

實跑驗證（esbuild + node）：

```
"幼童"          → ["child"]                    主 child
"幼童;寵物"      → ["child","pet"]              主 child
"長輩;過敏;寵物"  → ["allergy","senior","pet"]    主 allergy
"貓;狗"         → ["pet"]                      主 pet
"過敏、氣喘"     → ["allergy"]                   主 allergy
"其他"          → ["general"]                  主 general
"" / null      → []                           主 null
"幼童；銀髮"(全形) → ["child","senior"]           主 child

applyLiveProfiles:
  C2026010030  need-profile / [] / 「輪廓待接 SF 成員困擾欄位」
    → 套用「幼童;過敏」→ ready / [allergy, child] / 待補內容清空
  資料未達標的列        insufficient → insufficient(不受影響)
  示範列已有輪廓        [senior] → [senior](不被覆寫)
```

### 項目 8 再續：拿到選項清單、實際比對 72 筆（第五輪，2026-08-13）

中台不吐這個欄位，改用中台自己的 `SalesforceClient`（`/Users/joeyshiue/repos/dataspec/sf-dashboard`，**AGENTS.md §10 寫的 `~/repos/DB/sf-dashboard` 是舊路徑**）寫唯讀腳本查詢，不改中台、不重啟服務。

`Contact` describe 結果：`Family_Bothered__c`，`multipicklist`，五個選項全部啟用 ——
家有孕婦/家有新生兒/小孩、家人過敏、家人生病、家有長輩、家有寵物。

**「家人生病」原本的輪廓分類沒有** → 新增 `ProfileId = 'illness'`（標籤「家人生病」）。`child` 標籤同步改成「幼童/孕婦」，因為該選項涵蓋孕婦與新生兒。

69 位合格客戶實際填答：查得 69/69，**只有 10 位有填**（14.5%）。選項計次 家人過敏 6 / 家有孕婦·新生兒·小孩 5 / 家有寵物 2 / 家人生病 1 / 家有長輩 0。

關鍵字比對改成「精確對照優先、關鍵字後備」，六種實際組合驗證：

```
家人過敏;家有孕婦/家有新生兒/小孩 → [allergy, child]  主 allergy
家人過敏                      → [allergy]         主 allergy
家有孕婦/家有新生兒/小孩          → [child]           主 child
家人過敏;家有寵物               → [allergy, pet]    主 allergy
家人生病                      → [illness]         主 illness
家有寵物 / 家有長輩             → [pet] / [senior]
(空白)                       → []               待補輪廓
```

**逐筆結果不落地**：客戶編號 ↔ 家人過敏/家人生病 屬健康相關個資，只在執行期向中台取，不寫進 repo（AGENTS.md §7）。查詢腳本放在 session scratchpad，未進版控。

### 項目 8 完成：中台補上欄位、端到端打通（第六輪，2026-08-13）

使用者回報「沒看到成員困擾」—— 前端全部備妥但中台不吐欄位，所以清單一律顯示「待補輪廓」。

**改中台（經使用者同意）**：`~/repos/dataspec/sf-dashboard/app.py`，4 行 ——
`/api/members` 與 `/api/member360` 的 SOQL 各加 `Family_Bothered__c`，回應各加
`"family_bothered"`（原樣回傳分號分隔字串，斷詞交給前端）。`py_compile` 通過，
kill PID 60181 後以 `.venv/bin/python -m uvicorn app:app --port 8000` 重啟，
`/api/health` 回 200。**該 repo 的改動尚未 commit**（不在本輪授權範圍）。

端點驗證（只列客戶編號與困擾值，不列姓名）：

```
C2026010088  members / member360 → "家人過敏;家有孕婦/家有新生兒/小孩"
C2026020478  members / member360 → "家人過敏;家有寵物"
C2026020500  members / member360 → "家人生病"
C2026010030  members / member360 → ""            (未填)
```

端到端模擬（真實 API 回應餵 `profilesFromConcern` + `applyLiveProfiles`，清單第 1 頁 20 位）：

```
C2026010055  "家人過敏"                     → [allergy]        ② → ③ 可產製
C2026010088  "家人過敏;家有孕婦/新生兒/小孩"   → [allergy, child] ① 維持(濕度分數異常優先序在前)
C2026010511  "家人過敏;家有孕婦/新生兒/小孩"   → [allergy, child] ② → ③ 可產製
C2026020478  "家人過敏;家有寵物"              → [allergy, pet]   ② → ③ 可產製
第 1 頁 20 位中 4 位有輪廓
```

`C2026010088` 拿到輪廓仍維持「① 資料未達標」是正確的 —— 揭露閘門的優先序在輪廓之前。

### 項目 8 收尾：KPI／chip 改吃「已套用輪廓的列」（第七輪，2026-08-13）

做操作手冊的標註截圖時發現的真實不一致：表格已有 2 位真實客戶因 SF 輪廓放行顯示綠燈「可產製」，但 chip 仍寫「可產製 1」、KPI 仍寫「可立即產製 1 份（真實 0）」。

**成因**：`REPORT_KPI` / `REPORT_FILTERS` 是模組載入時算好的靜態常數，那時 Salesforce 還沒回來；表格燈號則是 `CustomerRow` 內各自呼叫 `applyLiveProfiles()` 的結果。兩邊各算各的。

**改法**：

- `module-a-report.ts`：`REPORT_KPI` → `computeKpi(rows)`、`REPORT_FILTERS` → `computeFilters(rows)`（純函式吃列陣列）；與輪廓無關的母體規模拆成 `REPORT_TOTALS`；新增 `REAL_CUSTOMER_CODES`。
- `AFieldList.tsx`：輪廓放行從 `CustomerRow` 上移到容器，算一次 `liveRows`，表格／KPI／chip 全部吃同一份。
- **解析範圍從「當頁」改成「全部真實列」**：KPI 與 chip 是整份母體的數字，只解析當頁必然對不起來。佇列依序、同時 4 筆，第 1 頁的姓名仍最先出現。
- `useMembersByCodes` 多回一個 `resolved` 計數；母體說明列右側顯示「輪廓解析中 N / 69 位 · KPI 與篩選數字尚未到齊」，完成轉綠。**沒到齊就講出來，不要讓人以為那是定值。**

**代價**：進場域清單一律解析 69 位（約 13.1 秒、69 次 SOQL），不再是只看第 1 頁就只打 20 次。但翻完 4 頁本來也是 69 次，總量不變、只是前置。中台加上批次端點後可降到一次呼叫。

**驗證**（真實中台 + SF，逐頁統計 vs 面板數字）：

```
KPI  可立即產製 10 份(真實 9 · 示範 1)   本季已寄發 10(真實 0 · 示範 10)
     待補客戶輪廓 64(真實 60 · 示範 4)    逾期待更新 3(真實 0 · 示範 3)
chip 全部 78 · 可產製 10 · 待補輪廓 58 · 資料未達標 4 · 逾期待更新 1
表格 待補輪廓 58 · 可產製 9 · 資料未達標 4 · 展開看各機 1 · 已寄發 1
     內部版已產 3 · 已核准 1 · 逾期待更新 1
```

對帳：真實 72 台 = 可產製 9 + 資料未達標 3 + 待補輪廓 60 ✓。chip「可產製 10 位」比表格 9 顆綠燈多 1，是 `C202105001`（四台狀態不一致 → 顯示「展開看各機」，但其中一台為可產製）——符合 chip「有任一台落在該狀態」的判準，不是 bug。

`npm run build` 通過；`npm run lint` 9 個錯誤與改動前完全相同（都在 module-b/module-e，非本輪檔案）。

## 驗證紀錄

```
npm run build   → ✓ built in 389ms（tsc -b 無錯）
npx eslint src/modules/module-a/AFieldList.tsx src/mocks/module-a-report.ts → 無輸出（0 問題）
npm run lint    → 9 errors，全部是既有檔案的既有問題
                  （ModuleA.tsx:463–465 no-useless-assignment 已比對 HEAD 版本一字不差；
                    另有 Header/useMember360/Dashboard/ModuleB/ModuleE 既有錯誤）
npm run dev     → http://localhost:5174 root/AFieldList.tsx/module-a-report.ts 皆回 200
```

資料層以 esbuild bundle 後用 node 實跑驗證（`REPORT_ROWS` 實際輸出）：

| 客戶 | 台數 | 狀態 | 待補內容 |
|---|---|---|---|
| C2026010088/76/62（真實設備） | 各 1 | ① 資料未達標 | 濕度分數為 0 但平均濕度 59.5%… |
| 陳○宏 | 4 | 展開看各機 | 客廳已開啟／主臥待審／書房可產製／小孩房已核准 |
| 李○君 | 9 | ⑦ 已寄發 | — |
| 王○真 | 10 | ④ 內部版已產 | 指數 48 未達揭露門檻 75 · 僅出內部版 |
| 張○成 | 5 | ⑥ 已核准 | — |
| 黃○君 | 3 | ⑨ 逾期待更新 | 距上次 96 天，建議出新季報 |
| 安○診所 | 8 | ④ 內部版已產 | 指數 71 未達揭露門檻 75 |
| 吳○翰 | 4 | ② 待補輪廓 | 缺客戶輪廓 → 影響痛點/CTA |
| 阿○義式咖啡 | 3 | ④ 內部版已產 | 指數 68 未達揭露門檻 75 |
| 陶○居民宿 | 4 | ① 資料未達標 | 尚差 38 天感測資料 |

KPI：可立即產製 1 · 本季已寄發 10 · 待補輪廓 4 · 逾期待更新 3（共 12 客戶 / 53 份報告）。
chip：全部 12 · 可產製 1 · 待補輪廓 1 · 資料未達標 4 · 逾期待更新 1。

### 第二輪（姓名解析）驗證

中台在本機 `http://localhost:8000` 運行中，用 curl 逐一比對 12 個客戶編號的 exact `lead_num` 命中狀況（**未把查到的姓名寫進本文件或任何檔案**）：

| 編號 | 中台回應 |
|---|---|
| C2026010088 / C2026010076 / C2026010062（真實設備） | exact hit（各 1 筆） |
| C201000272（示範場域） | exact hit —— 但那是**另一位真實客戶**，與 mock 的場域資料無關 |
| C202105001 | 前綴撈到 5 筆，無 exact match |
| 其餘 7 個示範編號 | 中台回 0 筆 |

C201000272 的 exact hit 正是「只解析沒有 mock 姓名的列」這條規則的來由：若全部列都送查，虛構的臺中科技園區場域會掛上一位真人的姓名。

`npm run build` 通過；`npx eslint` 對 `AFieldList.tsx` / `module-a-report.ts` 0 問題；`useMember360.ts` 的 2 個 `set-state-in-effect` 錯誤已用 `git stash` 比對 HEAD，是既有問題（行號因新增程式碼由 117/159 位移到 184/226），本輪未新增。

### 第三輪（合格清單匯入）驗證

`npm run build` 通過。資料層以 esbuild bundle 後用 node 實跑：

```
customers 78 (real 69) · devices 122 (real 72) · withReport 3
KPI ready       { real: 0,  demo: 1,  total: 1 }
KPI sent        { real: 0,  demo: 10, total: 10 }
KPI needProfile { real: 69, demo: 4,  total: 73 }
KPI overdue     { real: 0,  demo: 3,  total: 3 }
chip 全部 78 | 可產製 1 | 待補輪廓 67 | 資料未達標 4 | 逾期待更新 1
多設備真實客戶 3 位:C2026030838 / C2026030942 / C2026040197(各 2 台)
有報告的 3 台:C2026010062 / 76 / 88,皆為 ① 資料未達標(濕度分數 0)
profileFromConcern:「家有幼童」→child、「長輩同住;寵物」→senior、「過敏性鼻炎」→allergy、空→null、其他→general
```

地址截斷規則（縣市 3 字 + 行政區 + 路名，切在第一個阿拉伯數字）已對全部 72 筆跑過檢查，0 筆可疑（含「高雄市前鎮區崗山西街」這種行政區與路名都含「鎮」的邊界案例）。

中台實測：69 個客戶編號 exact match 69/69；`/api/member360` profile 欄位清單確認**不含成員困擾**；`/api/diagnostics` 只回連線檢查，拿不到欄位 metadata。

**未執行的驗證**：本機沒有 Playwright/Puppeteer，也沒有測試框架（`npm test` 未配置），因此
(a) 版面（驗收條件 1–8）、(b) 快取真的讓同一編號只打一次中台、(c) 「SF 即時」標記與 footer 計數，
這三項都需要人工開 `http://localhost:5174` 配合瀏覽器 Network 分頁確認。

## 已知問題與 pitfall

1. **「可立即產製」只有 1 份**，因為示範場域的 AirCare 指數大多落在揭露門檻 75 以下（48/68/71）或濕度分數異常。這是門檻規則的真實結果，不是 bug；要讓示範畫面更好看只能調 mock 的 q 值，本輪刻意不調。
2. **九態、輪廓、寄發、上次/到期全是 overlay**，只有「揭露閘門」與真實設備的 90 天涵蓋是真資料。正式版要由 `GET /reports/dashboard` 回填。
3. **原清單的 PM2.5／室外 PM2.5／日均／坪數欄位不再出現在清單頁**（資料仍在場域詳情與空氣品質頁）。若日常巡檢需要，回頭加 2 欄即可。
4. `getFieldDetail()` 移到 mocks 後，`ModuleA.tsx` 不再 import `FIELD_DETAILS` / `FIELD_DETAIL_C88`；若之後有人要在元件層再用，記得從 mocks import，不要複製一份。
5. 展開子列的設備位置名（客廳/主臥…）與遮蔽代號 `C..01-A` 都是產生的示範值，不對應真實設備；真實設備列只有一台，位置寫「主機」。

6. **快取只在記憶體**：重整頁面就清空，中台從離線變上線時也要重整（或呼叫 `clearMemberCache()`）才會重查。網路錯誤同樣被快取成 null，這是為了避免清單每次 render 重打一輪。
7. **前端遮蔽不是隱私邊界**：`MASK_CUSTOMER_NAME` 現在是 false；即使改回 true，全名仍在瀏覽器記憶體與 Network response 裡。要真的擋住，得由中台回遮蔽後姓名。
8. **每頁 N 次呼叫**：`useMembersByCodes` 逐筆打 `/api/members?q=`，目前只有 3 筆真實設備所以是 3 次。真實設備變多後會等比增加，屆時必須換成中台批次端點（AGENTS.md §10 第 4 條）。

## 待辦 / 下一步建議

1. 人工視覺驗收（驗收條件 1–8），特別是十二欄在 1280px 寬度下是否需要橫向捲動。
2. 決定是否把 `report` 詳細頁（每設備一卡 · 內部 AK／客戶版分頁 · 寄發面板 · 歷史報告）也做進「個人場域資訊」——本輪只做清單頁。
3. 與中台確認 `GET /reports/dashboard` 的欄位（九態、輪廓、寄發、資料涵蓋天數），把 overlay 換成真資料。
4. `docs/ report/` 目前是 untracked，若要進版控需一併 commit（含 .docx 與截圖，注意檔名有前導空白 `docs/ report/`）。
