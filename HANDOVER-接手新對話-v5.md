# AirSure 克立淨數據中台 — 工程交接文件 v5

> **給誰看**：接手這個 repo 的前端／全端工程師。
> **怎麼用**：新對話時附上本檔並說「接手 AirSure，以下是交接文件」。
> **與 v4 的關係**：v4 停在 2026-05-29（commit `6f8e6ea`）且以產品敘述為主；本版重寫為工程視角，內容以 2026-09-06 `26e2607` 的實際程式碼為準。v3／v4 僅作歷史保留，**兩者的敘述與現況已多處不符，不要拿來當規格**。

---

## 一、專案基本資料

| 項目 | 值 |
|---|---|
| **GitHub repo** | https://github.com/91JoeyHTC/airsure |
| **上線網址** | https://airsure-c3k.pages.dev/ |
| **本機 repo** | `~/repos/airsure`（⚠ v3/v4 寫的 `~/Desktop/airsure` 已不存在） |
| **主分支** | `main`（唯一分支，無 develop／release） |
| **部署** | Cloudflare Pages，push `main` 自動建置，約 1–2 分鐘反映 |
| **當前 commit** | `26e2607`（2026-09-06 · Module A 名單成效 tab） |
| **Node** | 22（`.nvmrc`；實測 v22.22.2 / npm 10.9.7） |
| **框架** | React 19.2 · TypeScript ~6.0 · Vite 8 · Tailwind v4（`@tailwindcss/vite`）· react-router-dom 7 |
| **CI** | 無（`.github/` 不存在）。品質關卡靠本機 `npm run build` + `npm run lint` |
| **測試** | **未配置**（無 `npm test`、無測試框架）。驗證靠 build／lint／人工 smoke |

---

## 二、30 秒上手

```bash
cd ~/repos/airsure
nvm use                      # Node 22
npm install
npm run dev                  # http://localhost:5173

npm run build                # tsc -b && vite build（型別 + 打包，最重要的關卡）
npm run lint                 # eslint（目前有 9 個既有 error，見 §11）
npm run preview              # 預覽 dist

# 部署 = push main，Cloudflare Pages 自動建置
git push origin main
```

**接真實資料（可選）**：Module B 個人 360°、Module F 營收、Module A 場域清單姓名需要數據中台。

```bash
# 另一個 repo，不在本專案內
cd ~/repos/dataspec/sf-dashboard
.venv/bin/uvicorn app:app --port 8000
```

前端用 `VITE_MIDDLE_API` 指定中台網址（預設 `http://localhost:8000`）。**中台打不到不會壞頁面**，會自動退回 mock（見 §4.2）。

---

## 三、架構地圖（實際檔案 + 行數）

```
src/
├── App.tsx                          63   9 條 route（+ catch-all），全部 lazy + Suspense
├── main.tsx                         15
├── modules/
│   ├── dashboard/Dashboard.tsx     545   首頁（persona 硬寫 gm）
│   ├── module-a/
│   │   ├── ModuleA.tsx            3660   ⚠ 全 repo 最大檔，五個第一層 tab 都在裡面
│   │   └── AFieldList.tsx          482   場域清單（報告產製九態）
│   ├── module-b/
│   │   ├── ModuleB.tsx            2330   用戶 360°（7 sub-tab）
│   │   └── Member360Live.tsx       311   中台 live 版個人 360°
│   └── module-c ~ module-h        483–779  營運／AI 模組，仍純 mock
├── hooks/
│   ├── useMember360.ts             272   /api/members、/api/member360（含批次查編號）
│   ├── useRevenue.ts                67   /api/revenue
│   ├── usePersona.ts                30   localStorage 'as-persona'
│   └── useTweaks.ts                 28   localStorage 'as-tweaks'
├── mocks/
│   ├── devices/                          ⭐ 真實 IoT 報告（產生器輸出，勿手改）
│   │   ├── types.ts                 55   DeviceReport 形狀＝未來 API response
│   │   ├── index.ts                 26   DEVICE_REPORTS 註冊表 + deviceFieldId()
│   │   └── 8065998dcaf0.ts 等 ×3   266   一台一檔
│   ├── module-a.ts                1343   ⭐ AirCare v2 分群／評分唯一真相 + 1,284 場域母體
│   ├── module-a-overview.ts        681   設備總覽的篩選／KPI／各分布 compute*
│   ├── module-a-report.ts          527   場域清單九態、輪廓、寄發 overlay
│   ├── module-a-campaign.ts        297   名單成效:方案／寄發頻率／CTA／跟進(全 overlay)
│   ├── eligible-customers.ts       112   AIRCARE 合格清單 72 台／69 位（去識別化）
│   └── module-b.ts ~ module-h.ts        其餘模組假資料
├── data/batch-map.ts               175   94 列卡片 → P1/P2/P3 批次對照
├── components/
│   ├── layout/{PageShell,Header,Sidebar}.tsx
│   ├── ui/{BatchAttrs.ts,BatchModeToggle.tsx,Icon.tsx}
│   ├── charts/Sparkline.tsx
│   ├── ai/AssistantFAB.tsx
│   └── tweaks/TweaksPanel.tsx
└── styles/
    ├── modules.css                6423   ⚠ 主要樣式全在這，新增樣式請找對區塊
    ├── app.css                     913   殼層 + 批次徽章
    └── globals.css                 114
```

**打包結果**（`npm run build`）：每個 module 各自 lazy chunk，`ModuleA` 248 KB / gzip 66 KB 是最大的一支；entry 238 KB / gzip 77 KB。

---

## 四、資料層（最重要的一節）

全站資料分三種來源，**混在同一個畫面上**，所以 UI 一律要標示哪一塊是真的。

### 4.1 真實 IoT 設備報告（3 台）

- 檔案：`src/mocks/devices/<mac>.ts`，由產生器輸出：
  ```bash
  python3 scratchpad/gen.py ~/Downloads/AirCare_<訂單>_<mac>.md
  # 產出後在 devices/index.ts import 並加進 DEVICE_REPORTS
  ```
  **`devices/*.ts` 不要手改**，下次重跑產生器會蓋掉。
- 場域 id 慣例：`deviceFieldId(mac)` → `DEV-<MAC 大寫>`；真實設備在 Module A 就用它當 `FieldRecord.id`。
- `DeviceReport` 的欄位是刻意對齊未來 `GET /api/device-report?mac=`，**接中台時只換資料源，形狀不動**。
- 內容顆粒度：90 天 daily、`hourlyGrid[days][24]`、`weekUsage[7][24]`、耗材、水箱、模式／風速／事件…
- 個人層的「空氣品質／使用行為／濾網管理／水箱管理」四個 sub-tab **只有真實設備有內容**，示範場域顯示 `NoReport` 空狀態 —— 這是刻意的：不生成假的逐時資料。

### 4.2 Salesforce 數據中台（FastAPI）

**不直接連 Salesforce**，一律走中台。憑證只在中台 `.env`，本 repo 不得存放任何 SF 憑證。

| 端點 | 用途 | 前端使用處 |
|---|---|---|
| `GET /api/revenue` | 營收 KPI／逐月 YoY／部門／通路／來源／Top 客戶／目標達成 | `useRevenue` → Module F |
| `GET /api/members?q=` | 會員搜尋（姓名／電話模糊、客戶編號前綴），含 `family_bothered` | `useMemberSearch` / `useMemberByCode` / `useMembersByCodes` → Module B、Module A 場域清單 |
| `GET /api/member360?id=` | 單一會員 profile + 消費實績 + 服務紀錄（中台已合併排序） | `useMember360` → `Member360Live` |

**串接四條規則**（新資料域照做）：

1. 一個資料域一個 hook，fetch → 型別化 → 失敗回 `null`。
2. **優雅降級**：中台打不到時元件自動退回 mock，頁面不得壞掉；UI 用 `mode: 'live' | 'demo'` 標示「Salesforce 即時」vs「示範資料」。
3. SF 沒有的資料（訂閱方案、推薦漏斗、LTV…）維持 mock，UI 標「待資料源接入」。
4. 需要新資料**先在中台加端點**（SOQL 彙總 + 快取），不要在前端拼多次呼叫。

**SF 物件對照**：派工 `Work__c` / 送修 `FailureReport__c` / 維修完成 `RepairOrder__c`；營收 `TargetAndPerformance__c`（`Type__c` 分實績／目標，`Date__c` 認列日）。標準 `Case` 物件**無資料**。

### 4.3 示範母體（1,284 場域 / 4,832 台）

`FIELDS_A_POP = FIELDS_A_FULL(9 筆手工 curated) + buildPopulation()`（`mocks/module-a.ts`）。

- 用 seeded RNG（`mulberry32` + 固定 seed），**每次載入結果相同**，不是隨機。
- 先對齊目標分布再抽值：`CATEGORY_DIST`（七分群）／`REGION_HEALTH`（縣市）／`SITE_TYPES`（場域類型），再由 `SEGMENT_CELLS[cat]` 抽 P×H 格內的 PM2.5／濕度。
- **分群不是貼上去的標籤，是數值算出來的**；分數一律走 v2 §4 公式，不另外抽（抽出來會跟自己的 pm／濕度打架）。
- 裝置數由 `popReconcile` 收斂到 Σ = 4,832。

**兩張不吃篩選的快照卡**（UI 已標註，改動時別誤接篩選）：
- 風速分布 `FAN_SPEED_DIST` — 中台儀表板快照，母體 3,570 台
- 警報狀況分析 `ALARM_CODES` — 中台儀表板快照，母體 97 台

### 4.4 個資紅線（AGENTS.md §7，違反就是事故）

- repo **不落地**姓名、電話、Email、完整門牌。
- 只存客戶編號（SF `Contact.LeadNum__c`）＋ 地址到「縣市 + 行政區 + 路名」。
- 姓名一律用客戶編號**即時**向中台換（`useMemberByCode`），**只放記憶體，不寫 localStorage／sessionStorage**。
- `devices/index.ts` 刻意不放 SF Contact 對照表。

---

## 五、AirCare v2 分群與評分（唯一真相：`src/mocks/module-a.ts`）

規格：`docs/aircare-v2-分群與評分機制.md`。**全站只有這裡定義門檻，其他地方一律呼叫函式**。

### 5.1 分群等級

| PM2.5 | 範圍 | | 濕度 | 範圍 |
|---|---|---|---|---|
| P1 | 0–5 | | **HH** | ≤45%（優先覆蓋） |
| P2 | >5–12 | | H1 | >45–60% |
| P3 | >12–30 | | H2 | >60–65% |
| P4 | >30 | | H3 | >65–75% |
| | | | H4 | >75% |

### 5.2 P×H 矩陣 → 七分群

|  | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| **H1** | ① 金級空氣 | ② 銀級空氣 | ⑤ 清淨風險 | ⑤ |
| **H2** | ② | ③ 銅級空氣 | ⑤ | ⑤ |
| **H3** | ④ 濕度風險 | ④ | ⑥ 清淨除濕雙風險 | ⑥ |
| **H4** | ④ | ④ | ⑥ | ⑥ |
| **HH（≤45%）** | 一律 ⑦ 乾燥，不看 PM2.5 | | | |

`segmentOf(pm, humidity)` 是唯一判定入口。每群的 `code`（業務端）／`identity`（內部）／`customer`（對外文案）／`disposition` 都在 `CATEGORIES`。

### 5.3 評分

```
aircareIndex = pm25Score(pm) × 0.5 + humidityScore(humidity) × 0.5
```
兩支都是分段線性（`pm25Score` 越低越好；`humidityScore` 在 45–60% 滿分 100）。

> **紅線**：分群與評分刻意分離（v2 §2）。兩者吃同樣的兩個平均值但規則不同，**不得由分數反推分群**。
> 乾燥群 `disposition` 是 `ok` 不是 `attention`：v2 實測乾燥群分數中位 92.7 高於銅級 87.1，標 attention 會與分數自相矛盾。

### 5.4 時間區間

`TimeRange = '7d' | '30d' | '90d'`，預設 **90d**（AirCare 報告的統計期就是 90 天）。

- 真實設備：由 `daily` 真算區間平均，**不套係數**；短區間沒有官方計分基準，分數維持報告的 90 天總分。
- 示範列：套 `RANGE_SHIFT` + 由 id 推出的決定性抖動，分數用位移後的值重算。

入口一律是 `metricsFor(field, range)`。

---

## 六、Module A 現況（五個第一層 tab）

`ATab = 'overview' | 'segments' | 'perf' | 'list' | 'personal'`，狀態（當前場域 id、個人層 sub-tab、類別篩選、名單成效的族群鎖定）提到 `ModuleA` root，所以任何一層都能互跳。

```
設備總覽 → 族群分析 → 名單成效 → 場域清單 → 個人場域資訊
 (母體)     (分群)    (方案×頻率)  (逐戶執行)    (單戶)
```

### 6.1 設備總覽 `overview`

**核心規則：篩選列 → `filterFields()` → 全頁所有字卡與表吃同一份 filtered 母體。** 判定集中在 `mocks/module-a-overview.ts`，元件只負責版面。

篩選（8 個維度，AND 結合）：機型／電源／運轉模式／PM2.5 級距／濕度級距／時間區間／區域（點熱圖帶入）／警報範圍（點預警卡「顯示名單」帶入）。

KPI 七格（`computeOverviewKpi`）：連網設備數 · 平均 PM2.5 · 平均濕度 · 平均溫度 · 平均 AirCare 分數 · 耗材立即處理 · 警報設備。副標另帶場域數／在線率／其中真實幾筆。

卡片：空品級距 + 濕度級距、七分群分布、類型流動月遷移、使用強度／電源狀態／運轉模式／風速四張甜甜圈、耗材壽命分布 + 濾網更換週期 + 處理時機、當前警報／期間警報／警報狀況分析、建議聯繫客戶（點卡跳場域清單並鎖類別）、健康度 Top 5 / 需關注 <75、區域三維熱圖（點區塊鎖定明細表）、場域明細表。

### 6.2 族群分析 `segments`（`62d56f8` 本次上線，原「分類概況」）

- **固定看 90d**，不吃設備總覽那組篩選（那是另一個 tab 的狀態）。
- 上方族群卡分兩區：`TIER_COHORTS = ['1','2','3']`（金銀銅）／`IMPROVE_COHORTS = ['4','5','6','7']`（改善加強型，含乾燥）。
- 每張卡：戶數 + 台數 + 三個入口 —— 「寄發管理」跳場域清單並套該族群；「CTA 行動」「服務跟進」目前 **disabled，標示待接入**。
- 點卡後下方展開四張分析：北中南佔比（以**戶**計，名單是按戶寄發）／使用強度／使用模式／濾網更換週期。
- 「優化方向分析」（`computeOptimizeDirection`）：由 P×H 矩陣**反推**這一群要跨哪條線、平均還差多少、多少戶適用；金級沒有往上空間，改列健康度 TOP 10（`topByScore`）。

### 6.3 名單成效 `perf`（`26e2607` 上線，簡報第十屏）

- 資料層 `mocks/module-a-campaign.ts`。Plan／note：`docs/module-a-list-performance-plan.md`、`docs/implementation-notes/module-a-list-performance-implementation-note.md`。
- 方案選擇（2026.10 噴噴方案 / 2026.07 濕度改善方案）→ 名單依寄發頻率分週／月／季三批 → 每批三張成效卡：寄發漏斗（六階段 + 階段留存）、CTA 環圈成效、服務跟進成效。
- **名單母體是 `FIELDS_A_POP`，與族群分析同源**，所以戶數可對帳：週報 471 = ④+⑤+⑥、月報 84 = ③+⑦、季報 729 = ①+②。
  ⚠ 不要改接場域清單那份合格清單 —— 合格清單裡只有 3 台有設備分析報告，其餘 `cat` 為 `null`，接上去名單只剩 13 戶、漏斗全為 0（已踩過，見 note 決策 1）。
- 寄發頻率由分群推出（風險群週報 / 銅級乾燥月報 / 金銀級季報），CTA 權重依族群痛點分配 —— **兩者都是示範規則**，正式版該由方案設定與客戶訂閱決定。
- 族群分析的族群卡「CTA 行動」「服務跟進」已改為跳這個 tab 並鎖定該族群（原本是 disabled 佔位）。
- ⚠ 寄發／開啟／CTA／跟進**全部是固定 seed 的 overlay，沒有資料源**，四張卡皆標 P2。

### 6.4 場域清單 `list`（`AFieldList.tsx`）

- 依《AIRCARE 報告產製 Dashboard 設計規格》§3／§4：**一客戶一列、多設備可展開**（一設備 = 一份報告）。
- 母體：`ELIGIBLE_DEVICES`（AIRCARE 合格清單 72 台／69 位）+ 9 筆示範。出現在合格清單 = 已通過資料門檻，前端不再自己判 90 天。
- 九態狀態機：`insufficient → need-profile → ready → internal → review → approved → sent → opened → overdue`。
- 姓名由 `useMembersByCodes` 批次向中台換，未接中台時顯示編號。
- KPI 一律標「真實 N · 示範 M」，避免把虛構寄發數當營運實績。
- ⚠ **除了「揭露閘門」與「真實設備的資料涵蓋天數」，九態／輪廓／寄發／上次到期全是示範 overlay**，正式版由報告產出引擎回填（規格 §9 `GET /reports/dashboard`）。

### 6.5 個人場域資訊 `personal`

5 個 sub-tab：場域詳情 / 空氣品質 / 使用行為 / 濾網管理 / 水箱管理。
後四者需要真實設備報告，示範場域一律 `NoReport`（§4.1）。

---

## 七、其他模組現況

| 模組 | 路由 | 資料 | 備註 |
|---|---|---|---|
| Dashboard | `/` | mock | persona 硬寫 `gm`，sidebar 視角切換 UI 隱藏 |
| A 居家空氣場域 | `/module-a` | **混合**（真實 3 台 + 中台姓名 + 示範母體） | 主戰場，近三個月幾乎所有改動都在這 |
| B 用戶 360° 視圖 | `/module-b` | **部分 live**（`Member360Live`） | 搜尋／消費／服務紀錄接中台；整體／分群視圖仍 mock |
| C 服務管理 | `/module-c` | mock | |
| D 產品管理 | `/module-d` | mock | |
| E 會員經營 | `/module-e` | mock | 母體 8420 / 挽回 840K 是固定值，⚠ 勿當真 |
| F 營收分析 | `/module-f` | **live**（`useRevenue`） | KPI／營收組成／目標達成已接中台 |
| G 行銷與健康證書 | `/module-g` | mock | |
| H 營運決策中心 | `/module-h` | mock | |

---

## 八、8/1 上線批次標示系統

用途：內部 demo 時一眼分辨「哪些卡 8/1 接得到、哪些要等資料」。

- 對照表 `src/data/batch-map.ts`：**94 列**（P1 37 / P2 45 / P3 12，其中 3 張 ⚠ 警示）。
- key 慣例 `<Module>.<Tab>.<卡片名>`，例：`'A.族群分析.優化方向'`。
- 用法：
  ```tsx
  import { batchAttrs } from '../../components/ui/BatchAttrs'
  <div className="card" {...batchAttrs('A.設備總覽.七分群分布')}>…</div>
  ```
- 顯示：右上「🔧 施工狀態」開關，`body[data-batch-mode='on'] [data-batch]::before` 浮出 pill；`localStorage 'as.batch-mode'`，預設關。
- **新增卡片時記得補一列**，否則 demo 時那張卡沒有批次標示。

---

## 九、跨模組導航

```
Module A 族群卡「CTA 行動 / 服務跟進」
  ↓ openPerf(catId, view) → tab='perf' + perfCat + 捲到對應成效卡
Module A 建議聯繫客戶卡 / 族群卡「顯示名單」/ 名單成效「寄發管理」
  ↓ openCategoryList(catId) → tab='list' + catFilter
Module A 場域清單 row
  ↓ openDetailById(fid) → tab='personal' + subTab='detail'

Dashboard 需主動聯繫名單 row / Module E row
  ↓ navigate('/module-b', { state: { gotoIndividual: true, memberId } })
Module B → 個人 360°
```

⚠ `ModuleB` 只讀 `state.gotoIndividual` 與 `state.liveMember`，**`memberId` 實際上被忽略** —— 從 Dashboard／Module E 跳進來一律顯示王敬梅 360°（`WANG_PROFILE` 主示範）；只有從中台搜尋帶 `liveMember` 進來才會顯示該會員。

---

## 十、慣例與紅線（完整版見 `AGENTS.md`）

1. **開工前先同步遠端**：`git fetch origin --prune` → `git status -sb` → 確認沒落後 upstream。diverged 就停下回報，不要自行 reset／rebase。
2. **只碰本輪任務的檔案**，不順手 stage 無關的 dirty file。
3. **非 trivial 改動先寫 item packet**（`docs/<topic>-plan.md`），實作中維護 implementation note（`docs/implementation-notes/<topic>-implementation-note.md`），**每輪結束前更新 note，不要只在 chat 講**。
4. 驗證：改完一塊就 `npm run build`（含 `tsc -b`）。沒有的工具不要硬加。被環境擋住要明說 blocked，不得假裝跑過。
5. commit 用 conventional style（`feat(module-a): …`）。commit 前跑 `git diff --cached --name-status / --stat / --check`。
6. 圖表配色用 `VIZ_SERIES`（7 色，已跑過 dataviz 驗證器）＋ `VIZ_MUTED`（「關機／其他」這類退位色，不佔類別色位）。品牌色：`--as-primary #0E7A66`（A/B 雙核心）／`--as-cdefg #4F46E5`／`--as-h #D97706`。
7. **UI 上不得讓真實與示範數字混為一談** —— 加卡片時想清楚它的母體是誰，並在副標寫出來。

---

## 十一、已知問題與技術債

| # | 問題 | 影響 | 備註 |
|---|---|---|---|
| 1 | `npm run lint` **9 個既有 error** | 不擋 build，但沒有乾淨基線 | `ModuleA.tsx` ×3（`no-useless-assignment`）、`ModuleB.tsx`（effect 內 setState）、`ModuleE.tsx`（no-unused-expressions）、`Header.tsx`、`Dashboard.tsx`、`useMember360.ts` ×2 |
| 2 | `ModuleA.tsx` 3,660 行 | 難維護、chunk 最大 | 建議按 tab 拆檔（`AOverview` / `ASegments` / `AListPerformance` / `APersonal`），`AFieldList` 已示範拆法 |
| 3 | `modules.css` 6,423 行單檔 | 找樣式費時 | |
| 4 | `react-router-dom` 放在 **devDependencies** | 目前能 build（有打包進 bundle），但語意錯誤 | 應移到 dependencies |
| 5 | 無測試、無 CI | 迴歸只能靠人工 smoke | |
| 6 | 場域清單九態／輪廓／寄發是示範 overlay | 不能當營運數據 | 等報告產出引擎 `GET /reports/dashboard` |
| 6b | 名單成效的方案／寄發／CTA／跟進**全是 overlay** | 同上，且方案主檔只有兩筆硬編資料 | 需 `GET /api/campaigns` 等四支端點，見 plan 項目 3 |
| 7 | `PersonaView` 只吃 `liveMember` | 跨模組跳轉帶的 `memberId` 被忽略，一律顯示王敬梅 | 見 §9 |
| 8 | `INDOOR_OUTDOOR` / `DHI_ATTRIBUTION` 待環境部 API | 卡片標「待接入」 | `status = 'live'` 後拿掉標示 |
| 9 | 中台尚未回傳 `family_bothered` | 報告「客戶輪廓」目前吃不到真值，欄位已備好 | 中台補上後前端自動生效 |
| 10 | 文件與程式碼不一致 | `docs/module-a-field-list-operations.md:13` 與四份 `docs/module-a-*-plan.md` 仍寫「分類概況」 | 現況以程式碼為準：**族群分析**。v3/v4 handover 屬歷史記錄，不再修 |
| 11 | 族群分析改版沒有 plan／implementation note | 違反 AGENTS.md §3/§4 | 建議補 `docs/implementation-notes/module-a-cohort-analysis-*.md` |

---

## 十二、常見雷（踩過的）

- **TypeScript 嚴格模式**（`noUnusedLocals`）：刪 UI 時 import 要一起清乾淨，否則 `tsc -b` 直接紅。
- **JSX 內的 `<`**：要寫成 `{'< 24h'}` 或 `&lt;`。
- **hook 順序**：`AConsumables` 這類「真實設備 ↔ 示範場域」會 early return 的元件，`useState` 必須放在 return 之前。
- **Sparkline 單點資料**：曾產生 NaN polyline 座標（`f0d2b65` 已修），自訂圖表注意單點／空陣列。
- **新增卡片別忘了 `batchAttrs`**。
- **改分群或分數門檻只能改 `mocks/module-a.ts`**，改別處會讓兩套判定並存。

---

## 十三、localStorage / 環境變數

| key | 用途 | 值 |
|---|---|---|
| `as.batch-mode` | 施工狀態徽章開關 | `on` / `off`（預設 off） |
| `as.date-range` | Header 日期區間 | `today` / `yesterday` / `7d` / `30d` / `mtd` / `qtd` / `ytd` / `custom` |
| `as-persona` | 視角 | `gm` / `cs` / `svc` / `mk`（首頁固定 gm，忽略此值） |
| `as-tweaks` | TweaksPanel 微調 | JSON |

| env | 預設 | 用途 |
|---|---|---|
| `VITE_MIDDLE_API` | `http://localhost:8000` | 數據中台網址（Cloudflare Pages 上未設 = 走 mock） |

---

## 十四、v4 → v5 變更清單（18 個 commit，44 檔 +9,825 / −1,038）

| 日期 | commit | 內容 |
|---|---|---|
| 07-23 | `a331324` `2e1412a` | Module B 個人 360° 接入 SF 真實會員（搜尋 + Live 消費／服務）、識別卡加等級／曾購系列機型 |
| 07-23 | `f0d2b65` | fix: Sparkline 單點資料防 NaN |
| 07-30 | `60118d9` `108538f` `e66b973` | 搜尋結果加辨識欄位、識別卡補齊 SF 客戶欄位、服務顧問改用最近消費業務 |
| 08-11 | `c546651` | **三台真實設備報告落地 + 客戶編號查身分，個資不落地** |
| 08-13 | `2c70633` | **場域清單升第一層 tab**，對齊報告產製規格，母體換成 AIRCARE 合格客戶 |
| 08-13 | `cf6c9da` `3fafd4e` `eee5714` | 輪廓改吃 SF `Family_Bothered__c`、精確對照選項清單、KPI/chip 改吃已套輪廓的列 |
| 08-13 | `d5224fd` `285cdc1` | docs: 更正中台路徑、新增架構關係圖 |
| 09-03 | `4a8d932` | **「整體場域」改名「設備總覽」**，七張字卡與六個篩選全連動 |
| 09-03 | `eea8a1a` | **分群／級距／評分全面對齊 AirCare v2**，兩張級距卡移入設備總覽 |
| 09-04 | `e1ea995` `508ff38` | 設備總覽新增設備使用四卡、耗材三卡、預警三卡 |
| 09-06 | `62d56f8` | **「分類概況」改版為「族群分析」**（族群卡 + 四項分析 + 優化方向） |
| 09-06 | `26e2607` | **新增「名單成效」tab**（方案 × 週/月/季 → 寄發漏斗 / CTA / 服務跟進） |

---

## 十五、接著可以做的事（建議優先序）

**P0 · 工程健康度**
- [ ] 清掉 9 個 lint error，建立乾淨基線（之後才有辦法擋新錯）
- [ ] `ModuleA.tsx` 按 tab 拆檔
- [ ] `react-router-dom` 移到 `dependencies`
- [ ] 加最小 CI：push 跑 `npm run build` + `npm run lint`

**P1 · 資料接軌**
- [ ] `GET /api/device-report?mac=` 上中台，`devices/*.ts` 從靜態檔切換成 API（形狀已對齊，成本低）
- [ ] 中台補 `family_bothered`，客戶輪廓改吃真值
- [ ] 報告產出引擎 `GET /reports/dashboard`，九態／寄發脫離 overlay
- [ ] 環境部 AQI 室內外落差 API

**P2 · 功能**
- [ ] 名單成效接真資料：`GET /api/campaigns`、`/campaigns/{id}/members`、`/cta`、`/followup`
- [ ] 寄發頻率改由方案設定與客戶訂閱決定，不再由風險度推導
- [ ] `PersonaView` 支援多會員
- [ ] Module E P2（渠道歸因 / CPA+留存 / 積點 ROI）
- [ ] 手機版 Hero + sub-tab nav 摺疊

**P3 · 文件**
- [ ] 補族群分析的 plan + implementation note
- [ ] 全域把「分類概況」更名為「族群分析」

---

*v5 · 2026-09-06 · 對應 commit `26e2607`*
