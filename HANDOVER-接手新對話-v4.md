# AirSure 克立淨數據中台 — 接手交接文件 v4

> **用法**:開啟新對話時,把這份檔案附上去並貼上以下訊息即可:
>
> > 「接手 AirSure 克立淨數據中台改版,以下是上一段對話的進度交接,請繼續。」

---

## 一、專案基本資料

| 項目 | 值 |
|---|---|
| **GitHub repo** | https://github.com/91JoeyHTC/airsure |
| **上線網址** | https://airsure-c3k.pages.dev/ |
| **本機 repo** | `~/Desktop/airsure`(已接入 Cowork,Claude 直接寫檔) |
| **框架** | React 19 + TypeScript 6 + Vite 8 + Tailwind v4 |
| **部署** | Cloudflare Pages(main 分支自動部署) |
| **當前 commit** | `6f8e6ea`(2026-05-29 全站重整 + 批次標示系統 + 個人場域聯動重構) |
| **上一版 commit** | `c8e9bfc`(2026-05-29 會員 360° 整合 + Module E P0/P1 + 階段 A-D) |
| **主分支** | `main` |

---

## 二、本次(v3 → v4)重大變動總覽

| 區塊 | 變動類別 |
|---|---|
| Dashboard 首頁總覽 | 大幅重構(KPI 換內容、布局重排、persona 隱藏、Header 加日期區間) |
| Module A 居家空氣場域 | Tab 改名、整體層 5 KPI、區域熱圖連動、個人層 4 sub-tab 全面重構 |
| Module B / Module E | 維持 v3 結構,僅加批次標示 |
| 8/1 上線批次標示系統 | **全新建置**(70 張卡片標 P1/P2/P3) |
| Header 元件 | 加日期區間下拉選單(localStorage 記憶) |

---

## 三、架構地圖(簡)

```
src/
├── modules/
│   ├── dashboard/Dashboard.tsx       # 首頁(persona 固定 GM,5 KPI,3 列顧問軌道)
│   ├── module-a/ModuleA.tsx          # 居家空氣場域(整體場域/分類概況/個人場域資訊)
│   ├── module-b/ModuleB.tsx          # 用戶 360° 視圖(7 sub-tab)
│   ├── module-c ~ module-h           # 其餘營運/AI 模組
├── mocks/
│   ├── dashboard.ts                  # CONTACT_LIST(對齊 WANG + MEMBER_MASTER)
│   ├── module-a.ts                   # FIELD_DETAIL_WANG 主示範
│   ├── module-b.ts                   # WANG_PROFILE + WANG_MEMBER_EXT
│   ├── module-e.ts                   # POPULATION + MEMBER_MASTER 20 筆
│   └── module-c.ts ~ module-h.ts
├── data/
│   └── batch-map.ts                  # v4 新加 · 62 列卡片 → P1/P2/P3 對照
├── components/
│   ├── layout/PageShell.tsx          # 含 BatchModeToggle
│   ├── layout/Header.tsx             # v4 改寫 · 日期區間下拉
│   └── ui/
│       ├── BatchAttrs.ts             # v4 新加 · batchAttrs(key) helper
│       └── BatchModeToggle.tsx       # v4 新加 · 「🔧 施工狀態」開關
└── styles/
    ├── app.css                       # body[data-batch-mode=on] 全域徽章樣式
    └── modules.css
```

---

## 四、Dashboard 首頁總覽(v4 大改)

### 4.1 結構順序(由上到下)

1. **Header**(共用元件):右上日期區間選單(今日/昨日/近 7 天/近 30 天/本月/本季/本年/自訂)
2. **ptitle**:總經理視角 · 數據時間 09:42 自動更新 +「查看主動聯繫名單」CTA
   *(原 h1「早安,怡君」拿掉)*
3. **KPI 5 卡**(動態欄數,gm 5/其他 4)
4. **今日顧問行程**:3 列顧問軌道
5. **AI 對策建議 · 高層摘要**
6. **重要資訊**(原八大模組總覽):只留雙核心,佔滿全寬
7. **需主動聯繫名單**:單欄佔滿全寬

### 4.2 KPI 5 卡(gm)

| # | 標題 | 值 | 顏色 |
|---|---|---|---|
| ① | 今日營收 | 847,200 NT$ | 綠 |
| ② | **本月營收**(v4 新加) | 21.4 M NT$ | 綠 |
| ③ | **Aircare 報告訂閱數**(v4 改) | 1,842 位(+186 vs 上月) | 橘 |
| ④ | 連網裝置 · 今日開機率 | 4,832 台(對齊 Module A) | 紫 |
| ⑤ | 需主動聯繫 | 37 位會員 | 紅 |

### 4.3 今日顧問行程(3 列軌道)

| 時間 | 顧問 | 服務類型 | 顏色 |
|---|---|---|---|
| 09:30 | ★ 偉仁 | 產品異常／維修 | 🟢 綠 `--as-primary` |
| 11:20 | 銘哲 | 預約空氣檢測 | 🟣 紫 `--as-cdefg` |
| 13:00 | 易杰 | 預約定期保養 | 🟠 橘 `--as-h` |
| 15:00 | 偉仁 | 產品使用教學 | 🟢 綠 |
| 17:00 | 銘哲 | 預約定期保養 | 🟣 紫 |

4 種服務類型:預約空氣檢測 / 產品使用教學 / 預約定期保養 / 產品異常／維修
3 位顧問:偉仁(綠)/ 銘哲(紫)/ 易杰(橘)
共用「現在」垂直線跨 3 列。

### 4.4 視角切換

`PERSONAS` 與 `usePersona` 仍存在,但 Dashboard 內部硬寫 `persona: PersonaId = 'gm'` 忽略 prop,sidebar 視角切換 UI 整塊隱藏。

### 4.5 需主動聯繫名單(來源對齊)

5 筆來自既有 mock(非自創):
- ★ **王敬梅 C201000272** — 來自 `WANG_PROFILE.identity`(Module B 個人 360° 主示範)
- 其他 4 筆來自 `MEMBER_MASTER`(Module E 共用會員主檔):陳俊宏 / 黃健宇 / 黃建中 / 楊雅雯

互動:
- row 點擊 → `navigate('/module-b', { state: { gotoIndividual: true, memberId } })`
- 📞 撥打按鈕 → `tel:` 協定觸發 ICT/系統撥號
- 💬 訊息 / 👁 檢視 → 同樣跳個人 360°

### 4.6 Header 日期區間選單

組件 `Header.tsx` 全改寫:
- 8 個 preset(今日 / 昨日 / 近 7 天 / 近 30 天 / 本月 / 本季 / 本年 / 自訂)
- `localStorage.getItem('as.date-range')` 記憶
- outside click 自動收合
- 預設「今日 · 2026/05/14」

---

## 五、Module A 居家空氣場域(v4 全面重構)

### 5.1 Tab 改名

| v3 | v4 |
|---|---|
| 整體層 | **整體場域** |
| 分群層 3 | **分類概況**(badge 拿掉) |
| 個人層 1284 | **個人場域資訊**(badge 拿掉) |

### 5.2 整體場域 — 5 KPI 卡(原 4)

| # | 標題 | 值 |
|---|---|---|
| ① | 使用中場域 | 1,284 處 |
| ② | 連網裝置 · 今日開機率 | 4,832 台 / 87.5% |
| ③ | **空氣品質 · PM2.5**(v4 改) | 2 µg/m³(原今日平均 DHI) |
| ④ | **空氣濕度 · 平均相對**(v4 改) | 58 %(原類型處置分布) |
| ⑤ | **平均環境健康分數**(v4 新加) | 82 分(原 DHI 內容) |

### 5.3 整體場域 — 其他變動

| 區塊 | 變動 |
|---|---|
| 建議聯繫客戶(原 upsell 機會池) | 標題改名 + 3 卡可點 → 跳個人層場域清單篩類別 + hover 陰影 + 「下鑽至分群」按鈕拿掉 |
| 區域熱圖 → 場域明細表 | 點熱圖區塊 → 鎖定篩選明細表 + 篩選 chip + 清除按鈕 + 分頁器最後一頁重算 |
| 「↘ 下鑽至分群層」3 按鈕 | **整塊拿掉** |
| 分群層 hero(★ 分群層 · 四軸交叉分群) | **拉掉** |

### 5.4 個人場域資訊 — 4 sub-tab 重構

#### `場域清單` — 維持 v3
- 13 欄表 + 9 筆 示例
- 支援類別 filter(由「建議聯繫客戶」卡跳轉時帶入)

#### `場域詳情` — v4 變動

| 區塊 | 變動 |
|---|---|
| KPI ③「體感舒適 28.2°C / 78%」 | → **空氣濕度·平均相對 78%**(室溫保留在副標) |
| 使用節奏熱力圖下方 | **新增除溼運作熱力圖**(淡藍 4 色階:未啟動/微弱/中等/強除濕) |
| 設備清單 + 耗材健康度雙欄 | **整塊拿掉** |

#### `濾網管理`(原耗材庫存) — v4 重構

**新結構**:**裝置清單(可選) + 6 環圖卡(隨裝置聯動)**

- 上方:裝置清單 6 台 row(機台/型號·位置/狀態/今日 h/在線率)
  - 點任一 row → 綠色高亮 + ▸ 箭頭 + 下方 6 環圖卡重新計算
- 下方:**維持原版 6 類耗材環圖卡**(PRE-FILTER / ECF·L / ECF·R / HEPA / PLASMA / UV-C)
  - 環圖中央 % 平均 + 4 階段分布(立即/近期/觀察/備料)依選中裝置 `uptimePct` 重算
  - 公式:`factor = 1.6 - uptimePct/100` → 在線率高 → 磨耗快 → 剩餘 %↓
- 拿掉:4 階段頂部 KPI / E 模組 banner / 耗材熱力矩陣 / 各列訂購按鈕

#### `水箱管理` — v4 重構

**新結構**:**裝置清單(可選) + 倒水節奏 24h + 清除時間分位數 30 天(隨裝置聯動)**

- 上方:裝置清單 6 台 row(同濾網管理結構)
- 中間:當前裝置標頭 + 「★ P90 > 24h · 已觸發 E」徽章(條件顯示)
- 下方雙欄:
  - **倒水節奏 24h 分布**(柱高依 factor 縮放,工作日 vs 週末平均隨之調整)
  - **清除時間分位數 30 天**(最快 / P25 / P50 / 平均 / P75 / P90 / 最長 七條進度條,P90 跨 24h 線即觸發 E 標示)
- 公式:`factor = uptimePct/100`
  - 事件數 8 ~ 188 次/週
  - 平均清除時間 6 ~ 28 h(在線高 → 事件密 → 平均長)
- 拿掉:5 KPI 卡 / P90 警示 banner / 異常場域明細 5 行表

### 5.5 場域詳情 helper / mock 來源

- `getFieldDetail(fid)` 仍以 `FIELD_DETAIL_WANG` (SH-2841 王婉真) 為主示範,其他 fallback
- 6 台裝置:AC-PRO-2841-A ~ F(CS100/CS80/CS60 mix)
- 點 A(96% 線上)→ 環圖剩餘 %↓、倒水事件多
- 點 E(12% 離線)→ 環圖剩餘 %↑、倒水稀疏但平均清除時間長(★ 觸發 E)

---

## 六、8/1 上線批次標示系統(v4 全新建置)

### 6.1 概念

依「8/1 施工總表 v2」對 **70 張卡片** 標記資料源批次,讓內部 demo 時一眼分辨「哪些卡 8/1 接得到,哪些要等資料」。

### 6.2 三個批次

| 批次 | 數量 | 接得到什麼 | 視覺 |
|---|:--:|---|---|
| **P1 第一批** | 24 列 | IoT 核心 + SF 客戶/工單 + 訂單營收 | 🟢 綠 |
| **P2 第二批** | 26 列 | 會員 + ERP 進銷存 + 顧問日誌 + 訂閱續訂 | 🟡 黃 |
| **P3 先放著** | 12 列 | 廣告/推薦/點數系統/AI | ⚪ 灰 |

### 6.3 ⚠ 警示卡(3 張)

| 卡片 | 警示原因 |
|---|---|
| Dashboard.KPI(P2·#8 會員) | 第一批接不到資料源 |
| B.KPI(P2·#8 會員 + #2 訂單) | 同首頁問題 |
| E.母體 8420 / 挽回 840K(P3·mock 固定值) | 接真資料後全變,勿當真 |

### 6.4 元件 + 使用

```ts
// src/data/batch-map.ts
export const BATCH_MAP: Record<string, BatchTag> = {
  'A.KPI': { batch: 'p1', source: '#6 IoT', note: '接 IoT' },
  'B.KPI': { batch: 'p2', source: '#8 會員 + #2 訂單', warn: '⚠ 同首頁問題' },
  // ... 62 列
}

// 卡片端
import { batchAttrs } from '../../components/ui/BatchAttrs'
<div className="card" {...batchAttrs('A.KPI')}>...</div>
```

開關:右上「🔧 施工狀態 OFF/ON」按鈕,localStorage `as.batch-mode` 記憶,預設關。

### 6.5 視覺呈現

開啟時,卡片右上以絕對定位浮出徽章(透過 `body[data-batch-mode='on'] [data-batch]::before`):
- P1:`P1·#6 IoT` 綠 pill
- P2:`P2·#8 會員` 黃 pill
- P3:`P3·廣告` 灰 pill
- ⚠ 警示卡:額外多浮一個紅色 `⚠ 同首頁問題` pill

---

## 七、資料模型(v4 維持 v3 + 加批次表)

### 7.1 `src/mocks/dashboard.ts` · CONTACT_LIST(v4 改寫)

```ts
// 5 筆對齊既有 mock,不自創
[
  { star: true, who: '王敬梅', cid: 'C201000272', ... },  // ← WANG_PROFILE
  { who: '陳俊宏', cid: 'M-008412', ... },                // ← MEMBER_MASTER
  { who: '黃健宇', cid: 'M-011204', ... },                // ← MEMBER_MASTER
  { who: '黃建中', cid: 'M-006822', ... },                // ← MEMBER_MASTER
  { who: '楊雅雯', cid: 'M-010512', ... },                // ← MEMBER_MASTER
]
```

每筆 `phone: '+886-9xx-xxx-xxx'`,撥號時自動去掉非數字。

### 7.2 `src/data/batch-map.ts`(v4 新加)

62 列卡片對照表,key 慣例 `<Module>.<Tab>.<卡片名>` 例:`'A.設備總覽.七分群分布'`。
每筆含 `batch / source / note / warn`(可選)。

### 7.3 其他 mock(v4 維持 v3)

`WANG_PROFILE` / `WANG_MEMBER_EXT` / `MEMBER_MASTER` / `POPULATION` 等資料源無變動。

---

## 八、跨模組導航(v4 維持 v3)

```
Module E (outreach / churn / points row 點擊)
  ↓ navigate('/module-b', { state: { gotoIndividual: true, memberId: id } })
Dashboard 需主動聯繫名單 row 點擊                                  ← v4 新增
  ↓ navigate('/module-b', { state: { gotoIndividual: true, memberId: cid } })
Module B root
  ↓ useLocation().state.gotoIndividual === true
個人 360° 視圖(王敬梅完整 360°)
```

**注意**:PersonaView 不論收到什麼 memberId 都顯示王敬梅 360°(主示範)。

---

## 九、設計語彙(v4 維持)

```css
--as-primary:   #0E7A66   /* A/B 雙核心 — 綠 */
--as-cdefg:     #4F46E5   /* C-G 營運 — 紫 */
--as-h:         #D97706   /* H AI — 橘 */
--as-success:   #16A34A
--as-warning:   #EAB308
--as-danger:    #DC2626
--as-info:      #2563EB
```

**v4 新加 CSS**:
- `body[data-batch-mode="on"] [data-batch]::before` 徽章樣式
- `.batch-toggle / .batch-legend / .batch-toggle.on` toggle UI
- `[data-batch][data-warn]::after` 紅色警示徽章
- `.contact-list .row:hover` 反白 + cursor:pointer

---

## 十、Phase / 階段現況

| 階段 | 範圍 | 狀態 |
|---|---|:---:|
| Phase 1 | Module A 三層級客戶中心化 | ✅ |
| Phase 1.5 | Module A 類型流動快照 | ✅ |
| Phase 2 | Module A 環境部 AQI 室內外落差 | ⏳ 待 API |
| Module E P0 / P1 | 分群崩版 / 總會員 / 挽回估值 / SLA | ✅ |
| Module E P2 | 渠道結果 / CPA+留存 / 積點 ROI | ⏳ 未做 |
| Module B 階段 A-D | 個人 360° 7 sub-tab + 補資料 modal | ✅ |
| Module B 階段 D 進階 | AI 行動鈕跨模組驅動 | ⏳ 未做 |
| **v4 全站重整** | Dashboard / Module A 結構大改 | ✅ |
| **8/1 批次標示系統** | 70 卡標 P1/P2/P3 + 開關 + 警示 | ✅ |

---

## 十一、可以接著做的事(優先序)

### Module E P2
- [ ] 渠道結果一哩(EDM/APP/LINE 補歸因營收/回流/轉換)
- [ ] 新會員 CPA + 30 天留存
- [ ] 積點兌換 vs 留存對照

### Module B 進階
- [ ] **PersonaView 支援多會員**(目前 Dashboard / Module E 跳轉都顯示王敬梅)
- [ ] AI 行動鈕跨模組:「排入推送」實際進 Module E 活動排程
- [ ] 補資料 modal:input 受控 state + 表單驗證

### Module A 延伸
- [ ] 多場域完整 mock(只 SH-2841 完整,其他 8 個 fallback 到王婉真 detail)
- [ ] 場域翻頁(Hero「上/下一個場域」)

### 跨模組整合
- [ ] Module C 工單 row → Module A 場域詳情 / Module B 個人 360°
- [ ] Module G「從個人 360° 直接產證書」按鈕
- [ ] Module H 推薦行動真正驅動跨模組 action

### 視覺/技術優化
- [ ] 手機版 Hero + Sub-tab nav 摺疊
- [ ] 環境部 API 串接(`INDOOR_OUTDOOR.status = 'live'` 後拿掉「待接入」)
- [ ] 批次標示系統:擴充支援「Q2 補上 / Q3 補上」階段細分

---

## 十二、本次對話(2026-05-29)決策記錄

| 決策 | 內容 |
|---|---|
| **8/1 批次標示視覺強度** | 案 A 輕量徽章(預設關,demo 友好) |
| **批次標示覆蓋範圍** | 全部 130+ 卡 → 實際標 70 卡(每模組主要區塊),3 張 ⚠ 警示 |
| **批次標示徽章內容** | `P1·#6` 同時顯示批次 + 資料源編號 |
| **Dashboard h1 / 視角切換** | 全部隱藏 |
| **首頁固定 persona** | 即使 localStorage 有 cs/svc/mk,首頁也只顯示 GM |
| **Dashboard KPI 順序** | 今日營收 → 本月營收 → Aircare 訂閱 → 連網裝置 → 需主動聯繫 |
| **連網裝置數值** | 對齊 Module A `TODAY_POWER_ON.total = 4,832`,首頁與 Module A 一致 |
| **今日顧問行程顏色映射** | 顏色 = 顧問(偉仁綠/銘哲紫/易杰橘),★ 標示緊急 |
| **聯繫名單資料來源** | 王敬梅(WANG_PROFILE) + MEMBER_MASTER 4 筆,不自創 |
| **Dashboard 場域空品表** | 拿掉(主動聯繫名單佔滿全寬,集中焦點) |
| **Module A Tab 命名邏輯** | 從技術名(整體/分群/個人)改成業務名(整體場域/分類概況/個人場域資訊) |
| **Module A 整體層 KPI ③④⑤** | 分離原 DHI:抽出「平均環境健康分數」+ 獨立「空氣品質 PM2.5」「空氣濕度」 |
| **upsell 卡點擊** | 鎖定該類別跳場域清單(類似 Module E → B 跳轉 pattern) |
| **區域熱圖連動** | 點區塊鎖定明細表;雙向 toggle(再點同區取消) |
| **濾網/水箱重構統一模式** | 上方裝置清單(主資料源)→ 下方原圖表(隨選聯動) |
| **6 環圖卡 / 倒水雙圖 保留** | 用戶要求維持原視覺,改成依選中裝置聯動 |
| **聯動公式** | 在線率 `uptimePct` 推導磨耗 factor;P90 > 24h 自動觸發 E 紅標 |
| **新增除溼熱力圖** | 淡藍 4 色階,放使用節奏圖下方,規則:09-11 + 18-23 為除濕高峰 |
| **下鑽至分群層 3 按鈕** | 整塊拿掉(Tab 列已能直接切換) |

---

## 十三、Build / 部署快速操作

```bash
# 本機開發
cd ~/Desktop/airsure
npm run dev          # localhost:5173

# 編譯驗證
npx tsc -b

# 部署(Cloudflare Pages main 分支自動部署)
git push origin main
```

**部署狀態**:https://github.com/91JoeyHTC/airsure/commits/main
**Cloudflare 反映**:約 2 分鐘內

---

## 十四、注意事項

- **TypeScript 嚴格模式**(`noUnusedLocals: true`),改 import 時要清乾淨
- **沙箱無 GitHub 認證**,push 需要使用者本機跑(Cowork 內 commit 偶因 FUSE lock 失敗)
- FUSE mount 偶爾會卡住 `.git/index.lock` 或 `.git/objects/tmp_obj_*`,本機 `rm -f .git/index.lock` 再重試
- 改完一塊就 `npx tsc -b` 驗證
- **沙箱 vite build 會掛**(`@rolldown/binding-linux-arm64-gnu` 缺少 native binary),本機跑 `npm run build` 才能完整驗證
- **JSX 內 `<` 字元** 要用 `{'< 24h'}` 或 `&lt;` 包起來
- **施工狀態開關** localStorage key:`as.batch-mode`(on/off)
- **日期區間開關** localStorage key:`as.date-range`(today / 7d / 30d / mtd / qtd / ytd / custom)

---

## 十五、本次 commit 摘要

```
6f8e6ea — feat: 2026-05-29 全站重整 + 批次標示系統 + 模組重構

19 files changed, 1954 insertions(+), 693 deletions(-)

新增:
  src/data/batch-map.ts                  (+200)  62 列卡片批次對照表
  src/components/ui/BatchAttrs.ts        (+25)   batchAttrs(key) helper
  src/components/ui/BatchModeToggle.tsx  (+60)   開關 + 圖例
  MODULES-卡片與圖表清單.md              (+200)  9 模組卡片清單
  HANDOVER-接手新對話-v3.md              (+310)  從 uploads 加入版本控

修改:
  src/styles/app.css                     徽章樣式 + toggle/legend UI
  src/components/layout/PageShell.tsx    加 BatchModeToggle
  src/components/layout/Header.tsx       改寫 · 日期區間選單
  src/mocks/dashboard.ts                 CONTACT_LIST 對齊 + KPI 改 + 加本月營收
  src/modules/dashboard/Dashboard.tsx    全面重構
  src/modules/module-a/ModuleA.tsx       大幅重構(KPI 5 卡/Tab 改名/個人 4 sub-tab 重構/除溼熱力圖)
  src/modules/module-b/ModuleB.tsx       加 16 處 data-batch
  src/modules/module-c/ModuleC.tsx       加 9 處 data-batch
  src/modules/module-d/ModuleD.tsx       加 6 處 data-batch
  src/modules/module-e/ModuleE.tsx       加 7 處 data-batch
  src/modules/module-f/ModuleF.tsx       加 7 處 data-batch
  src/modules/module-g/ModuleG.tsx       加 5 處 data-batch
  src/modules/module-h/ModuleH.tsx       加 4 處 data-batch
```

---

*文件結束 — 2026-05-29 commit 6f8e6ea*
