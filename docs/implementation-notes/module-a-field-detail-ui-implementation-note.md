# Module A 個人場域資訊 UI 調整 — Implementation Note

- 對應 plan：`docs/module-a-field-detail-ui-plan.md`
- 目前狀態：**in progress**（三分數卡、濾網管理 6→5 元件已完成，其餘待辦）
- 最近更新：2026-08-11

---

## 第 8 輪:客戶編號查詢 + 個資不落地

### 中台:`/api/members` 支援客戶編號
Salesforce Contact 上存客戶編號的欄位是 **`LeadNum__c`「客戶編號(C)」**(另有 `LeadNum_F__c`「客戶編號(F)」)——
即設備分析報告 `customer.code` 的來源,也是 **IoT 設備 ↔ SF 會員的唯一接點**。

比對規則刻意不一致:姓名/電話用 `%q%`,客戶編號用 **`q%` 前綴**。
編號是結構化字串,`C2026010088` 的中段對使用者沒有意義;infix 只會把整批同年度客戶撈進來,也無法走索引。
前綴同時支援「輸入完整編號」與「輸入 `C202601` 找同批」。

`/api/members` 與 `/api/member360` 都新增回傳 `lead_num`。
(中台在 `~/repos/dataspec/sf-dashboard`,與本 repo 分開。)

### 前端:身分改為即時查,repo 不存個資
上一輪為了讓識別卡可點,把 Contact Id + 姓名寫進 `SF_CONTACT_BY_CUSTOMER`,且只有 1 筆查得到。
本輪 **整表移除**,改為新 hook `useMemberByCode(code)`:

- `FieldDetail` 的 `sfContactId` / `memberPhone` → 換成 `customerCode`(報告本來就有的欄位)
- 識別卡用 `customerCode` 即時向 SF 換姓名/等級/建檔日,查到才可點
- **三台設備現在全部可點**(上一輪只有 1 台)
- 姓名、電話、Contact Id 一律不落地在 repo(AGENTS.md §7)
- 中台未連線時退回只顯示客戶編號,卡片不可點 —— 不猜、不留假資料

前綴比對可能撈到同批多筆,hook 只取 `lead_num` **完全相等**那筆,沒有就回 `null`。

**pitfall**:hook 初版在 effect 裡同步 `setMember(null)` / `setLoading(true)` → `react-hooks/set-state-in-effect`(lint 9→10)。
改成把「結果 + 當初查的編號」存成同一個 state、`loading` 由 `res.code !== c` 推導,effect 只在 async callback 裡 setState。
副作用是切換場域時不會再閃一下上一位客戶的姓名。

### 也改到的地方
- 場域清單 `customerName` / `mem` 改顯示客戶編號(不顯示姓名)
- Module B 搜尋框 placeholder 補「客戶編號」,搜尋結果列與 Live 識別卡顯示客戶編號

### 驗證
```
npx tsc --noEmit → 通過
npm run build    → 通過(ModuleA 183.97 kB / gzip 47.36 kB)
npm run lint     → 9 problems,與 HEAD 相同
中台實測:C2026010088 / C2026010076 / C2026010062 各 1 筆命中;前綴 C202601 命中同批多筆
```
**仍未做瀏覽器目視。**

---

## 第 7 輪：三台真實設備 + 報告產生器 + 識別卡跳轉

### 報告產生器
`scratchpad/gen.py <報告.md>` → `src/mocks/devices/<mac>.ts`。解析報告的 6 個 vega-lite 區塊 + 12 張統計表，輸出符合 `DeviceReport` 的單一物件。新增設備 = 跑產生器 + 在 `devices/index.ts` 加一行。**`devices/*.ts` 不要手改。**

`devices/types.ts` 的 `DeviceReport` 即未來 `GET /api/device-report?mac=` 的 response 形狀。

### 新增兩台
`806599927630`（C2026010076・臺中南區）、`1cdbd4f8def8`（C2026010062・臺中南區），連同既有 `8065998dcaf0` 共 3 台，各 90 天。

### 兩條規則被新資料推翻
1. **緊急度門檻 <20% → <30%**：`1cdbd4f8def8` 的 ECF 剩 23.9% 判「立即處理」，舊規則會誤判成近期。12 個輸出驗證剩餘 % 可完全分離三級、剩餘天數不行（兩處重疊）。門檻只被夾在 (23.9, 30.7] 與 (48.2, 69.0]，非報告明寫。
2. **濕度分級五級 → 七級**：新報告出現「乾燥 ≤35 / 一點乾 35–45 / 舒適 45–55」。初版把 45–55% 標成「偏乾」，實際是分數最高的舒適帶。

### 濕度分數 0.0 的代價（三台）
| MAC | 濕度加權應得 | 指數現 | 指數應 | 低估 |
|---|---:|---:|---:|---:|
| 8065998dcaf0 | 87.4 | 45.3 | 89.0 | −43.7 |
| 806599927630 | 83.6 | 46.4 | 88.2 | −41.8 |
| 1cdbd4f8def8 | 98.4 | 47.6 | 96.8 | −49.2 |

三台都被判「金級空氣」，卻都拿 45–48 分。

### 多設備化
- `fieldDetailFromReport(r)` 取代手寫 `FIELD_DETAIL_C88`；`DEVICE_ROWS` 產生場域清單前 3 列
- 四個 tab 改吃 `fieldId` prop；`ADVICE_*` 常數 → `adviceAir/Usage/Filter/Tank(r)` 函式
- 示範場域顯示 `NoReport` 空狀態，不生成假逐時資料
- **pitfall**：`AConsumables` 的 `useState` 一度被放在 early return 之後 → `react-hooks/rules-of-hooks`。切換「真實設備 ↔ 示範場域」時 hook 順序會變，已把 hook 移到 guard 之前

### 識別卡 → Module B Live 360°
場域詳情 Hero 的會員識別卡整張可點（＋按鈕），`navigate('/module-b', { state: { gotoIndividual: true, liveMember } })`。
`ModuleB` 新增 `initialLiveMember`，`PersonaView` 以此當初值並用 `key` 強制重掛，直接開該會員的 Live 360°，省掉再搜尋一次。

`FieldDetail` 新增 `sfContactId` / `memberPhone`。**只有 C2026010088 有值** —— 中台 `/api/members?q=` 只比對姓名/電話，另外兩位無法用客戶編號反查，卡片維持不可點（灰框 + tooltip 說明）。

### 驗證
```
npm run build → 通過（434ms，ModuleA chunk 183.94 kB / gzip 47.35 kB）
npm run lint  → 9 problems，與 HEAD 相同
git diff --check → clean
三台交叉驗證：指數組成、濕度加權、耗材緊急度逐台核對一致
```
**仍未做瀏覽器目視。**

---

## 第 6 輪：顧問調整建議五處 + 產出客戶端報告閘門

### 顧問調整建議
抽成可複用的 `AdvisorNotes`（改名自「AI 顧問建議」），掛在 5 處，**每處內容不同**，各取自報告對應章節：場域詳情（吃 `detail.aiSummary`/`aiCauses`）／空氣品質／使用行為／濾網管理（徽章改「近期處理」黃）／水箱管理。位置一律置頂。

### 產出客戶端報告（`ReportButton`）
掛在 sub-tab 列右側，屬**頁面層級動作** —— 報告範圍是整台設備、跨所有章節，不屬於任一 tab；放進 `AdvisorNotes` 會在 5 個 tab 重複 5 顆按鈕卻產出同一份報告，放 Hero 則另外 4 個 tab 看不到。

閘門規則見 `reportGateOf()`（`src/mocks/module-a.ts`），依 v2 §4.2「揭露資格 = 分數 ≥75 且資料有效」：

| 狀態 | 條件 | 現有資料的例子 |
|---|---|---|
| `unverified` 待確認 | 濕度分數 = 0 但平均濕度 > 0 → 分數來源有已知缺陷，**連門檻都不該拿來判** | **C2026010088**（真實）：指數 45.3 不可信 |
| `blocked` 不可揭露 | 分數有效但 < 75 | 王婉真 SH-2841：48.0 < 75 |
| `ready` 可產出 | 分數 ≥75 且有效 | 陳俊宏 SH-0021：92.0 |

三態在現有資料上都踩得到。`report_kind` 依 `spaceType` 自動判（居家 → 家庭版 / 其餘 → 場域版），顯示在按鈕上。

> ⚠ 這是**前端暫時護欄**。報告是快照 + token 派送，一旦產出收不回來，正式版這道判斷必須放進報告產出引擎，不能靠前端擋。已寫進程式碼註解。

### 順手修掉的既有缺陷
`getFieldDetail()` fallback 的分數回推公式 `humidityScore = total − 14` 會讓高分場域算出 **PM2.5 > 100**（陳俊宏 q=92 → 106/100）。改成 `pm25Score = min(100, total+8)`、濕度補差額，9 個示範場域全部驗過：兩項均落在 0–100 且平均等於 q。

### 驗證
```
npm run build → 通過（275ms）
npm run lint  → 9 problems，與 HEAD 相同
git diff --check → clean
```

---

## 第 5 輪：濕度區塊 + 使用行為 tab + 水箱管理去公式化

### 濕度與舒適（併入「空氣品質」tab，不另開分頁）
避免 sub-tab 太碎，濕度放在空氣品質頁下半。左卡六項統計（平均 59.5／P50 58.5／P90 64.5／≥65% 5.6%／≥70% 0.0%／溫度 27.5–32.0°C），右卡濕度四級分佈**加兩列對照**：

| | 分數 |
|---|---|
| 依此表加權應得 | **87.4** |
| 報告實際給的濕度分數 | **0.0**（紅底） |

底下紅框直接算給人看：指數本應約 **89.0**，被壓到 **45.3**；並註明另一台設備同樣輸出 0.0。**畫面現在會自己把中台的缺陷講出來**，不必翻報告。

### 新增 sub-tab `usage`「使用行為」（`AUsage`）
| 區塊 | 內容 |
|---|---|
| **水滿停機 vs 正常運轉** | 置頂、左側黃邊。堆疊條顯示五種狀態佔比 ＋ 一句「機器有 46% 的該運轉時間卡在水滿，等待 P90 23.58h」 |
| 模式／風速分佈 | 雙欄橫條（雙智慧 93.6%／最小風·停止 43.9%） |
| 人為操作 × 時段 | 四時段分組長條，合計 8,041 次。紫框標為**產品訊號、非服務工單**：切換 7,865 次 vs 幾乎不關機 |
| 事件與警報 | 四格計數 ＋ 最近警報時間與碼 |

### 水箱管理去公式化（`ATank` 重寫，194 行 → 98 行）
移除 `factor = uptimePct/100` 推導的「事件數 8~188 次/週」「平均清除 6~28h」「P50 = 平均×0.7」「P90 = 平均×2.1」整組虛構公式，改用報告實際統計：週期 68／已確認解除 60／未確認 0／未納入統計 8／平均 12.51h／P50 1.95h／P90 23.58h。

等待時間改成三條分位橫條 ＋ 24 小時參考線，並點出**長尾**：P50 只有 1.95h（多數時候很快倒水），P90 卻到 23.58h —— 少數幾次擱置將近一整天，就是 801.1h 停機的主要來源。

原本的「P90 > 24h → 觸發 E 模組」判定拿掉了 —— 報告裡沒有這條規則，是舊 mock 自己編的。

### 驗證
```
npm run build → 通過（289ms）
npm run lint  → 9 problems，與 HEAD 相同，未新增
git diff --check → clean
累計 diff：2 檔案 +1,021 / −316
```

---

## 第 4 輪：新增「空氣品質」sub-tab + 趨勢圖四層化

### 新增 sub-tab `air`「空氣品質」（`AAirQuality`）
個人場域資訊的 sub-tab 由 4 個變 5 個：場域清單／場域詳情／**空氣品質**／濾網管理／水箱管理。

| 區塊 | 內容 |
|---|---|
| 期間摘要 4 卡 | 平均 PM2.5 3.6（P95 11.5・最大 253）／室外參考臺南 8.5（峰值 34・AQI 39.8）／本期尖峰日 06-22／分析期間 90 天 |
| **PM2.5 日 × 小時熱力圖** | 90 列 × 24 欄 = 2,160 格，色階直接取自報告 vega-lite 的 `domain [0,15,35,55,150]`，缺讀數格顯示灰色（17 格）。尖峰日列以紅色標出，每格有 tooltip |
| PM2.5 等級分佈 | 五級橫條（極淨 84.4%／優良 11.9%／尚可 1.6%／待改善 1.6%／不健康 0.4%），共 2,143 小時 |
| 日內節奏 | 四時段表，P95 最高的「上午」整列標黃 |
| 最高尖峰小時 Top 5 | 時間／時段／時均／最大／等級，5 筆有 4 筆落在 06-22 |

### `PM25TrendChart` 四層化
新增 `pm25P95Trend` / `pm25MaxTrend`（**選填**）到 `FieldDetail`。有值時多畫「日均–P95 淡藍帶」「P95 橘虛線」「單日最大紅點」；示範資料沒有這兩條，圖表自動退回原本的「室內線 + 室外虛線」兩層，不會壞。

### 順手修掉的殘留
`STATUS_LABEL` 上方的註解還停在第 2 輪已被推翻的「緊急度依預估剩餘天數」，且舉的例子是反的。已改寫成正確的百分比判準並附上反證。

### 驗證
```
npm run build → 通過（345ms）
npm run lint  → 9 problems，與 HEAD 相同，未新增
git diff --check → clean
```
**熱力圖 2,160 個 div 的渲染效能與版面尚未人眼確認。**

---

## 第 3 輪：以真實設備取代王婉真 mock

### 摘要
把個人場域資訊的主示範從虛構的「王婉真 · SH-2841」換成真實的「C2026010088 · MAC 8065998dcaf0」。

### 資料來源與接法
| 層 | 來源 | 取得方式 |
|---|---|---|
| 身分 | Salesforce Contact `003Q900001ULQXCIA5` | 中台 `GET /api/member360?id=`（live 模式實測通過） |
| 環境 / 設備 / 耗材 | AirCare 設備分析報告（90 天） | `src/mocks/device-c2026010088.ts`，由報告的 6 個 vega-lite 區塊 + 統計表逐筆抽出 |

**兩邊的安裝地址逐字相符**（台南市南區大同路二段…，門牌略）—— 這是目前唯一 SF ↔ IoT 對得起來的客戶。

### 改動
- `src/mocks/device-c2026010088.ts`（新增，361 行）：90 天逐日序列、90 天室外日均、90×24 熱力圖（2,143 格）、7×24 使用節奏（由每小時 readings 依星期彙總）、PM2.5 五級、日內節奏、尖峰小時 Top5、濕度四級、運轉狀態、模式/風速、人為操作×時段、事件警報、水箱節奏、耗材五元件
- `src/mocks/module-a.ts`：新增 `FIELD_DETAIL_C88`；`AirScore` 加 `percentile`；`FIELDS_A_FULL` 首列換成真實設備；`FIELD_DETAILS` 以 id 對應
- `src/modules/module-a/ModuleA.tsx`：`getFieldDetail()` 先查 `FIELD_DETAILS`；`AConsumables`/`ATank` 改吃 C88；預設場域改 `DEV-8065998DCAF0`；hero 空欄位不顯示佔位；分群名次改百分位

### 刻意不補的欄位
坪數 / 住宅型態 / 同住成員 —— 報告與 SF 都沒有，留空並讓 UI 過濾，不填假值。
`cohortSize` / `cohortRank` / `cohortAvg` 設 0，改用 `airScore.percentile`（報告用百分位，沒有名次）。

### UI 會直接暴露中台的濕度分數缺陷（刻意保留）
三分數卡的濕度卡會顯示 **分級「良好」但分數 0.0 / 100**，綜合卡顯示 **45.3「待改善」· 被拉低的主因＝濕度**。這是報告的原始輸出，不在前端修正 —— 讓畫面把問題講出來比藏起來有用。

### 數值抽查
```
pm25Now = 3.4（期末最後一日日均）      P50 = 2.5   P90 = 8.3
uptimePct = 952.5 /(90×24) = 44%      日均運轉 = 10.6 h
PM2.5 卡 chips:比室外(臺南)乾淨 57.6% / 比 WHO 指引值乾淨 76.0%
耗材:前置 83.2% 持續觀察 · ECF 左右 41.0% 近期處理 · HEPA/電漿 77.6% 持續觀察
      （直接採用報告的 urgency 文字,不用前端重算）
```

### 驗證
```
npm run build → 通過（241ms）
npm run lint  → 9 problems，與 HEAD 相同，未新增
git diff --check → clean
```
**仍未做瀏覽器目視**：本機無可用的瀏覽器自動化工具，需人工開 `npm run dev` 確認版面。

---

## 第 2 輪：濾網管理 6 → 5 元件

### 摘要
把濾網管理從「全站 6 類耗材環圖卡 × 在線率推算」改成「該裝置的 5 個元件真實狀態」，對齊 AirCare 設備分析報告的耗材章節。

### `src/mocks/module-a.ts`
- `FieldConsumable` 改為報告欄位：`remainHours / usedHours / capHours / pct / dailyBurnHours / daysLeft / exhaustDate / status`（原 `life` 字串移除）
- 新增 `CONSUMABLE_SPEC`（5 元件的原廠上限與每日等效消耗）、`makeConsumables()`、`urgencyOf()`、`CONSUMABLE_BASE_DATE`
- **耗材從 `FieldDetail` 移到 `FieldDeviceUnit`** —— 報告顆粒度就是「一台設備一份」，6 台裝置各給一組 `usedHours`
- **刪除 `CONSUMABLE_CATS` / `ConsumableCategory`**：① 報告只有 5 元件、沒有 UV-C；② 全站 4 階段分布屬整體層統計，不該出現在單一裝置視圖
- 連帶修正與新資料矛盾的場域層文案：`nextMaintenance`（ECF·R 6 天 → 前置濾網·B 機 16 天）、timeline 05/18、`aiCauses` ③

### `src/modules/module-a/ModuleA.tsx`
- 新增 `STATUS_LABEL`；**移除 `tone()` / `Tone` / `ToneKey`**（依剩餘 % 分級的舊模型）
- 移除 `deviceWearFactor`，`devConsumables` 直接讀 `selectedDevice.consumables`
- 環圖卡 grid → 報告版面：剩餘壽命水平長條（Figure 7）＋ 耗材狀態明細表 ＋ 依使用習慣推估耗盡時間表 ＋ 估算值 footnote

### 關鍵發現：緊急度看的是天數，不是百分比
報告輸出 ECF 48.2% → 近期處理、HEPA 83.8% → 持續觀察。若照舊的 `tone()` 依剩餘 % 分級會得到相反結果。
回推實際輸出（34.5 天→立即／233.4 天→近期／937.5 天→持續觀察）改為依 `daysLeft` 判定。**⚠ 精確門檻報告未明寫**，目前用 <60／<365／<1095，待中台確認。

### 驗證
```
npm run build → 通過（545ms，ModuleA chunk 92.72 kB）
npm run lint  → 9 problems，與 HEAD 相同，未新增
git diff --check → clean
```
數字抽查：A 機前置濾網 cap 2232 − used 1937 = 剩 295h → 13.2% → 34.5 天 → 立即處理，與報告同口徑。

---

## 第 1 輪：場域詳情三分數卡

實作場域詳情的「空氣健康成績單」三分數卡，取代原本 5 張 KPI 卡中的健康度／PM2.5／濕度三張。
資料形狀刻意對齊未來 `GET /api/field360` 的 response —— 分數作為**資料欄位**存在，不由前端計算。

### 已完成項目

### `src/mocks/module-a.ts`
- 新增 `AirScore` interface：`total / pm25Score / humidityScore / pm25Avg / humidityAvg / humidityP90 / humidityOver65Pct / outdoorPm25Avg / outdoorStation`
- 新增 `WHO_PM25_GUIDELINE = 15`（分數卡對照 chip 用）
- `FieldDetail` 新增 `airScore: AirScore`
- `FIELD_DETAIL_WANG.airScore` 填值：total 48.0 = PM2.5 62.0 × 50% + 濕度 34.0 × 50%

### `src/modules/module-a/ModuleA.tsx`
- 新增 `pm25GradeOf` / `humidityGradeOf` / `airGradeOf` 三個分級 helper（純呈現對應，不算分數）
- 新增 `ScoreCard` 與 `AirScoreCards` 元件
- 場域詳情：三分數卡取代原 5 KPI 中的 3 張；剩餘 KPI 列改 3 欄（PM2.5 即時／設備可用度／維護倒數）
- Hero 大分數標籤「場域健康度 DHI」→「AirCare 指數」，值改讀 `airScore.total`，下方加組成小字
- `getFieldDetail()` fallback 一併回推 `airScore`，避免詳情頁分數與清單／整體層打架

---

## 設計決策與理由

| 決策 | 理由 |
|---|---|
| 分數放 mock 當**資料**，不在元件內算 | 兩份範例的分數都由報告引擎產出；mock 形狀＝未來 API 形狀，接中台時只換資料源 |
| `airScore.total` 刻意等於既有 `dhi` | 場域清單與整體層仍讀 `q`／`dhi`；若不對齊，同一場域會出現兩個分數 |
| 分級 helper 留在前端 | 「數字 → 文字」屬呈現層；門檻取自報告樣板 |
| 保留 `dhi` 欄位不刪 | 整體層熱圖、場域明細表、排序都吃它，改動範圍超出本輪 |

---

## 已知問題與 pitfall

1. **綜合指數的分級門檻是推測的**：`airGradeOf` 用 ≥85 優良／≥70 良好／≥50 普通／<50 待改善，由場域版報告「62.4 → 普通」回推。**兩份範例都沒明寫此門檻**，待中台確認。程式碼已標 ⚠ 註解。
2. **摘要／主因兩句 callout 目前由前端組裝**。正式接中台後應由報告引擎給定稿文案（對外報告的 `report.schema.json` 就是這樣設計的，所有文案都是定稿字串）。已在程式碼註解標明。
3. **`getFieldDetail()` fallback 的分數回推是任意的**（`humidityScore = total - 14`，PM2.5 補差額），只為讓 9 個場域看起來不同。真實資料接入後整段移除。
4. **`dhi` 與 `airScore.total` 並存是過渡狀態**，長期應收斂成一個。

---

## 驗證紀錄

```
npx tsc --noEmit     → 通過，無輸出
npm run build        → 通過（tsc -b && vite build，463ms，ModuleA chunk 91.37 kB）
npm run lint         → 9 problems（與改動前 HEAD 相同，未新增）
                       module-a 的 3 個 error 在 455–457 行，屬既有程式碼，非本輪改動
git diff --check     → clean
```

**未執行**：無自動化測試（專案未配置 test script）。**尚未做瀏覽器人工 smoke** —— 需開 dev server 目視確認三分數卡版面與 3 欄 KPI 列的排版。

---

## 下一步建議

1. 人工 smoke：確認三分數卡在場域詳情的版面，以及 KPI 列由 5 欄改 3 欄後是否需要調整間距
2. 依 plan 續做「PM2.5 趨勢圖四層化」與「等級分佈五級表」（同屬場域詳情，改動集中）
3. 濾網管理的 6 → 5 元件是硬事實差異，建議優先於其他視覺調整
4. plan §待確認 的三個問題（PDF 數字疑點／MAC ↔ 機器碼／場域是否保留）需使用者或中台端回覆後才能繼續往資料層走
