# Module A 場域清單 — 升第一層 + 對齊報告產製清單頁 Plan

> 建立：2026-08-13
> 相關 note：`docs/implementation-notes/module-a-field-list-report-implementation-note.md`

## 需求來源

使用者要求（2026-08-13）：

1. 「將『場域清單』拉到第二層」——截圖 `docs/ report/截圖 2026-08-13 上午11.36.42.png` 以箭頭指出目前埋在
   「個人場域資訊」內的 sub-tab `場域清單 1284`，要往上提到主 tab 列。
2. 「詳細的調整參考 docs 文件中 report 裡的相關資料」——
   `docs/ report/AIRCARE報告產製Dashboard_設計規格.md` 第 4 節（清單頁欄位）、
   `docs/ report/aircare-report-dashboard-mockup.html` 第 3 節（清單頁版面示意）。

討論後使用者確認的三個決定：

| 決定點 | 選擇 |
|---|---|
| IA 位置 | 放在「分類概況」之後 → `整體場域 / 分類概況 / 場域清單 / 個人場域資訊` |
| 改造範圍 | 完整照 report 清單頁重做（KPI 四格、狀態 chip、十欄、多設備展開） |
| 顆粒度 | 改成一客戶一列、多設備展開子列 |

## 目標頁面 / 流程

- Route `/module-a`
- 主 tab 由 3 個變 4 個；「個人場域資訊」的 sub-tab 由 6 個變 5 個
- 流程：整體場域 →（分類概況）→ 場域清單 → 點列 → 個人場域資訊 · 場域詳情

## 目標檔案

| 檔案 | 動作 |
|---|---|
| `src/mocks/module-a.ts` | 把 `getFieldDetail()` 從 ModuleA.tsx 搬進來並 export（新 mock 層要用，避免循環 import） |
| `src/mocks/module-a-report.ts` | 新增。報告九態、輪廓、寄發狀態、客戶/設備兩層列資料 |
| `src/modules/module-a/AFieldList.tsx` | 新增。重做後的場域清單（KPI + chip + 十欄 + 展開） |
| `src/modules/module-a/ModuleA.tsx` | 主 tab 增列、移除舊 `ALocationList`、`ReportButton` 移入場域詳情、sub-tab 收斂 |
| `src/styles/modules.css` | 新增報告狀態燈號 / 金銀銅 / 子列樣式 |
| 本 plan + implementation note | 新增 |

## 目前問題

1. `場域清單` 是 `個人場域資訊` 的 sub-tab（ModuleA.tsx:1002），語意錯位：清單是母體，其餘五個 sub-tab 是「某一個場域」的切面。
2. sub-tab 列右側的 `ReportButton`（ModuleA.tsx:1021）綁 `currentFieldId`，在看清單時它指向一個使用者還沒選的場域 —— 截圖上的「待確認 濕度分數為 0…」就是這個錯位。
3. 清單欄位（場域/客戶編號/類型/六大類型/坪數/設備/狀態/PM2.5/室外/日均/會員等級）與報告產製無關，看不出「誰可以馬上出報告、誰卡在哪」。
4. 顆粒度是場域，report 規格是客戶（多設備展開）。
5. 九態狀態機、輪廓、資料涵蓋天數、寄發狀態在 mock 完全不存在；現有只有三態的 `reportGateOf()`。

## 預計改動

### 項目 1：場域清單升為第一層 tab

- `ATab` 增 `'list'`，`tabs` 順序：`整體場域 / 分類概況 / 場域清單(1284) / 個人場域資訊`
- `APersonalSub` 移除 `'list'`，sub-tab 剩 `場域詳情 / 空氣品質 / 使用行為 / 濾網管理 / 水箱管理`
- `openCategoryList()`（整體層 upsell 卡片帶類別篩選）改成切到 `list` 主 tab
- 場域詳情的「回場域清單」按鈕改成切主 tab

### 項目 2：ReportButton 移位

- 從 sub-tab 列移進 `ALocationDetail` 的 Hero 卡右上，語意變成「對這個場域產報告」
- 清單頁的產製動作改為每列的「操作」欄

### 項目 3：報告資料層（`src/mocks/module-a-report.ts`）

九態（依規格 §3）：

| # | key | 燈號 |
|---|---|---|
| 1 | `insufficient` 資料未達標 | red |
| 2 | `need-profile` 待補輪廓 | orange |
| 3 | `ready` 可產製 | green |
| 4 | `internal` 內部版已產 | blue |
| 5 | `review` 客戶版待審 | purple |
| 6 | `approved` 已核准 | teal |
| 7 | `sent` 已寄發 | cyan |
| 8 | `opened` 已開啟/互動 | gold |
| 9 | `overdue` 逾期待更新 | grey |

**狀態判定優先序**（單一設備，越前面越優先）：

1. `dataDays < 90` → ① 資料未達標，待補內容寫「尚差 N 天感測資料」＋預估達標日
2. `reportGateOf()` 回 `unverified` → ① 資料未達標，待補內容用 gate 的 reason（例：濕度分數為 0 但平均濕度 59.5%）
3. `reportGateOf()` 回 `blocked`（指數 < 75 揭露門檻）→ ④ 內部版已產，待補內容寫「指數 N 未達揭露門檻 75 · 僅出內部版」
4. 客戶輪廓為空 → ② 待補輪廓
5. 其餘用 mock overlay 手寫狀態（③～⑨）

> 這條優先序讓清單的狀態與場域詳情的 `ReportButton` 永遠同源，不會出現「清單說可產製、詳情說不可揭露」。

其他新欄位：

- `profile` 輪廓：幼童／銀髮／寵物／過敏／一般／KOL，`null` = 待補輪廓
- `tier` 對外分群：直接用既有 `CATEGORIES[cat].customer`（金級空氣／銀級空氣／銅級空氣／濕度待調／空品待調／環境待調），金銀銅配色；風險軸（④⑤⑥）只在內部欄位以灰字副標顯示，符合規格「對外只揭露金銀銅」
- `dataDays` 資料涵蓋：真實設備取報告 `meta.days`（3 台都是 90）；示範場域由 overlay 指定
- `lastIssued` / `dueDate`：上次產出 + 下季到期
- `send`：`none | line | email | opened`

**資料量說明**：目前只有 12 筆客戶（3 台真實設備 + 9 個示範場域），KPI 四格由這 12 筆即時算出，並在清單頁標注「示範 12 筆 · 母體 1,284 待中台接入」，不寫死 mockup 的 34/61/21/9。

**多設備子列**：由 `FieldRecord.dev`（`"4/4"` = 在線/總數）展開。設備位置名由場域類型的固定字串池決定（居家：客廳/主臥/書房/小孩房；辦公：大廳/會議室/開放區…），設備代號沿用規格的遮蔽格式 `C..01-A`，不顯示 MAC。除 `C202105001`（照 mockup 手寫四台不同狀態當展開示範）外，其餘客戶的設備狀態一致，避免無意義雜訊。

### 項目 4：清單頁 UI（`AFieldList.tsx`）

- KPI 四格（`metric-strip`）：可立即產製 / 本季已寄發 / 待補客戶輪廓 / 逾期待更新(>90天)
- 篩選 chip（`fb .chip`）：全部 / 可產製 / 待補輪廓 / 資料未達標 / 逾期待更新，與既有六大類型 `catFilter` 可並存
- 十欄：客戶/代號、輪廓、設備、分群、資料涵蓋、報告狀態、待補內容、上次/到期、寄發、操作（＋checkbox 與進場域詳情箭頭）
- 客戶列多設備且狀態不一致 → 報告狀態顯示「展開看各機」
- 操作按鈕依狀態切換（一鍵產製／補輪廓／預覽／核准／寄發／產新季報／未達門檻），本輪為 mock 無 handler，與現有 `ReportButton` 一致
- 九態圖例列放表格下方

**取捨**：原清單的 PM2.5／室外 PM2.5／日均／坪數／會員等級欄位不再出現在主欄位（會員等級改成客戶名旁的 ★ 高級 標記，場域名/地址收成客戶名下的副行）。這些數值在場域詳情與空氣品質頁都在，未移除資料。

### 項目 6：姓名解析與快取（2026-08-13 追加）

使用者提問「清單為什麼只有客戶編號、沒有姓名」後追加。原因有兩層：真實設備列的 repo 裡根本沒有姓名（個資不落地，`module-a.ts:167` 把 `customerName` 設成客戶編號）；示範場域列則是被項目 5 的遮罩蓋掉。

決定：**快取 + 當頁預解析**，且**不遮罩、顯示全名**。

- `hooks/useMember360.ts` 加 module-level `memberCache` / `memberInflight`，`fetchMemberByCode()` 統一走「快取 → 進行中請求 → 才打中台」；`useMemberByCode()` 改由快取推導 member/loading，同一場域切出去再切回來不再重打。
- 新增 `useMembersByCodes(codes)`：只查未快取的編號，同時併發上限 4；中台之後加批次端點時，只需換掉這個 hook 內部。
- 快取只放記憶體，不寫 localStorage/sessionStorage（姓名落磁碟會違反 AGENTS.md §7）。中台從離線變上線時，重整頁面或 `clearMemberCache()`。
- `MASK_CUSTOMER_NAME` 改 `false`：內部後台以辨識效率優先，「○家」是對外報告的規則。並註明前端遮蔽不是隱私邊界，真要擋得由中台回遮蔽後姓名。
- **只解析「沒有 mock 姓名」的列**（＝真實設備）。示範場域的編號有些在 Salesforce 真的存在但屬於別人（例：`C201000272`），若一併解析，會把真人姓名貼到虛構的場域資料上。
- 解析到的列在姓名旁標「SF 即時」，footer 顯示 `N / M 筆 Salesforce 即時`，符合 AGENTS.md §10 第 2 條的即時 vs 示範標示要求。

### 項目 7：匯入 AIRCARE 正式報告合格清單（2026-08-13 追加）

來源：`aircare-formal-report-eligible-customers-20260811.csv`（72 台 / 69 位客戶，全為 CS101）。

- 新增 `src/mocks/eligible-customers.ts`（由 CSV 產生）。**地址只落地到「縣市＋行政區＋路名」**，完整門牌（巷/弄/號/樓）一律不進 repo（AGENTS.md §7）；姓名、電話不落地，由客戶編號向中台即時換。
- 清單母體改為「69 位真實客戶（前）＋ 9 筆示範（後，標『示範』）」。3 台在 repo 有完整設備分析報告的真實設備，仍走揭露閘門，與場域詳情同源。
- **合格判準改由這份清單認定**：出現在 CSV = 已通過門檻。前端不再拿 90 天判真實列 —— CSV 的 `sensor_valid_days` 最大只有 87，那是「期間內有效感測天數」，與設備報告 `meta.days` 的「期間日曆天 90」是兩個不同定義。示範列仍沿用 90 天門檻示意 ① 資料未達標。
- 「資料涵蓋」欄真實列顯示「感測 N 天 / 狀態 N 天」，示範列維持「N / 90 天」。
- 沒有設備分析報告的設備：分群顯示「待報告產出」，進場域詳情的箭頭停用（`getFieldDetail()` 的 fallback 會借別台的曲線，點進去等於看到錯的人的資料）。
- 清單改為真分頁（每頁 20 筆），姓名解析只針對當頁 —— 逐筆打中台，整份 69 筆併發 4 實測要 10.8 秒。
- KPI 四格改成 `{ real, demo, total }`，卡片下方標「真實 N · 示範 M」，避免把虛構的寄發數當成營運實績。

### 項目 8：輪廓 ← Salesforce「成員困擾」（2026-08-13 追加）

使用者指出客戶輪廓可對應 SF Contact 的「成員困擾」欄位，不必人工重補。

| 項目 | 值 |
|---|---|
| 欄位標籤 | 成員困擾 |
| 欄位名稱 | Family_Bothered |
| API 名稱 | `Family_Bothered__c` |
| 資料類型 | 選項清單（**多重選擇**）→ SF 回傳分號分隔字串 |

選項清單（2026-08-13 由 `Contact` describe 取得，五個全部啟用）：

| SF 選項值 | → 輪廓 |
|---|---|
| 家有孕婦/家有新生兒/小孩 | `child`（幼童/孕婦） |
| 家人過敏 | `allergy` |
| 家人生病 | `illness` ← **原本的輪廓分類沒有這一類，本輪新增** |
| 家有長輩 | `senior` |
| 家有寵物 | `pet` |

沒有「一般」也沒有 KOL 選項；沒勾任何項 = 空字串 = 待補輪廓。`general` 保留給「有填但對不上任何選項」，`kol` 保留給示範與人工標記。

**69 位合格客戶的實際填答狀況（2026-08-13 查詢）**：查得 69/69，但**只有 10 位有填**（14.5%），59 位空白。選項計次：家人過敏 6、家有孕婦/新生兒/小孩 5、家有寵物 2、家人生病 1；家有長輩 0。組合以「家人過敏;家有孕婦/家有新生兒/小孩」3 筆最多。

→ 影響：中台開放欄位後，只有這 10 位會從「② 待補輪廓」放行到「③ 可產製」，其餘 59 位仍待補。**輪廓的瓶頸不在系統，在 SF 的填答率。**

> 逐筆結果（客戶編號 ↔ 成員困擾）刻意不落地到 repo —— 「家人過敏 / 家人生病」綁上客戶編號屬健康相關個資（AGENTS.md §7）。前端一律執行期向中台取。

- ~~現況：中台沒有回傳這個欄位~~ → **2026-08-13 已於中台補上**：`/api/members?q=` 與 `/api/member360?id=` 都新增 `family_bothered`（`Family_Bothered__c` 原樣回傳的分號分隔字串）。中台檔案 `~/repos/dataspec/sf-dashboard/app.py`，共 4 行。
- **多重選擇改變了資料結構**：`ReportCustomerRow.profile: ProfileId | null` → `profiles: ProfileId[]`。清單的輪廓欄改成可疊多個標籤，第一個（粗體）是主輪廓。
- `profilesFromConcern()`：以 `;`／`；`／`,`／`、` 斷詞（不切 `/`，因為「家有孕婦/家有新生兒/小孩」本身含斜線），先走 `CONCERN_OPTION_MAP` 精確對照，對不上才用關鍵字後備（避免選項日後改名就整批判成「一般」）。沒填 → 空陣列。
- `PROFILE_PRIORITY`（健康風險優先）：過敏 > 家人生病 > 幼童/孕婦 > 銀髮 > 寵物 > KOL > 一般。客戶版報告只能有一個主痛點/CTA，多選時取排最前者。**這個排序是假設，需與行銷/CS 確認。**
- `applyLiveProfiles(row, profiles)`：清單九態是模組載入時算好的靜態值，那時還沒有 SF 資料。中台回來後由元件呼叫這支，把因「缺輪廓」卡在 ② 的設備放行到 ③ 可產製；資料未達標、僅內部版、已寄發等與輪廓無關的狀態不受影響。
- **KPI 四格與狀態 chip 也必須吃放行後的列**（2026-08-13 第七輪修）：原本 `REPORT_KPI` / `REPORT_FILTERS` 是模組層靜態常數，會與表格燈號對不起來（實測表格 2 綠燈、chip 寫「可產製 1」）。改成 `computeKpi(rows)` / `computeFilters(rows)`，由 `AFieldList` 算一次 `liveRows` 餵給表格、KPI、chip。連帶把姓名/輪廓解析範圍由「當頁」改成「全部真實列」——KPI 是整份母體的數字，只解析當頁必然不準。
- `MemberHit.family_bothered` / `Member360.profile.family_bothered` 型別已先定義好，中台補上欄位即自動生效，前端不用再改。
- 待補內容的文案改為「輪廓待接 SF『成員困擾』欄位」，不再寫成 CS 漏填。

### 中台端點規格（待中台實作）

**優先度已提高**：場域清單現在每次進頁都要解析全部 69 位（KPI／chip 要整份母體才算得準），逐筆打 `/api/members?q=` 實測 **13.1 秒**才到齊，這段時間 KPI 會低估可產製。批次端點可把它降到一次呼叫。

現況每位客戶要 2 次呼叫（`/api/members?q=` 換 id → `/api/member360?id=`），69 位 = 138 次，不可行。建議新增：

```
GET /api/customers?codes=C2026010030,C2026010055,…
  codes  逗號分隔的客戶編號(SF Contact.LeadNum__c),單次上限 50
  比對   LeadNum__c 完全相等(不做前綴),查無者列在 missing
  回傳   { mode, customers: [{ lead_num, id, name, phone, level, created_date,
                               city, area, address, clean_zone, consultant,
                               consultant_dept, next_maintenance,
                               family_bothered }],  ← Family_Bothered__c 成員困擾(新增)
           missing: ["C…"] }
  快取   中台端 5–10 分鐘
```

`family_bothered` 是多重選擇欄位，中台原樣回傳分號分隔字串即可（前端會斷詞）；若中台想回陣列也可以，前端兩種都吃得下。同一個欄位請一併加進既有的 `/api/member360` profile。

前端接法：`useMembersByCodes()` 內部換成單次呼叫即可，呼叫端不用改。

**待使用者/RD 確認**：
1. `Family_Bothered__c` 的**選項清單實際值**（目前用關鍵字比對兜，拿到值才能寫精確對照）
2. 主輪廓的優先序（現為過敏 > 幼童 > 銀髮 > 寵物 > KOL > 一般，是我方假設）
3. AIRCARE 合格清單的實際判準（`sensor_valid_days` 的門檻是多少）

### 項目 5：隱私顯示

依規格 §2「客戶版用○家、只顯示客戶代號、不顯示 MAC」，清單客戶名遮蔽成 `陳○宏` / `安平○所` 格式，主要辨識鍵為客戶編號。遮蔽開關集中成一個常數（`MASK_CUSTOMER_NAME`），要改回全名只需改一行。真實設備列本來就只有客戶編號（`module-a.ts:166` 註解所述的「個資不落地」），行為不變。

## API / DB / 外部服務影響

無。全部為前端 mock 與版面調整，不新增中台端點，不動 `useMember360` / `useMemberByCode` 既有呼叫。

## 驗收條件

1. `/module-a` 主 tab 為 `整體場域 / 分類概況 / 場域清單 1284 / 個人場域資訊`，順序正確。
2. 「個人場域資訊」sub-tab 不再有「場域清單」，且該列不再有「產出客戶端報告」按鈕。
3. 場域詳情 Hero 右上出現「產出客戶端報告」，狀態/理由與原本一致。
4. 清單頁有 KPI 四格 + 五個狀態 chip + 規格十欄；點 chip 會過濾。
5. 多設備客戶可展開出設備子列；`C202105001` 展開後四台狀態不同。
6. 三台真實設備（C2026010088/76/62）在清單顯示「資料未達標」且待補內容為濕度分數異常，與詳情頁 `ReportButton` 的「待確認」同源同文。
7. 點任一客戶列或子列 → 進「個人場域資訊 · 場域詳情」，且帶到正確 fieldId。
8. 整體層 upsell 卡片點擊 → 切到場域清單並套用六大類型篩選，清除鈕可用。
9. `npm run build` 通過、`npm run lint` 無新增錯誤。

## 風險 / 限制

- 清單語意由「場域監控清單」轉為「報告產製清單」，PM2.5 等營運欄位退到詳情頁；若日常巡檢仰賴這些欄位，需回頭加回 2 欄。
- 客戶名遮蔽是內部後台的取捨（規格要求 vs CS 辨識效率），已設常數可一鍵切換。
- 九態、輪廓、寄發、上次/到期全部是 mock overlay，非中台資料；正式版必須由報告產出引擎回填（規格 §9 的 `GET /reports/dashboard`）。
- 揭露閘門仍是前端護欄（`module-a.ts` 已註明），本輪不改變這件事。

## 驗證方式

```bash
npm run build
npm run lint
```

外加人工檢查驗收條件 1–8（開發伺服器 `npm run dev`）。
