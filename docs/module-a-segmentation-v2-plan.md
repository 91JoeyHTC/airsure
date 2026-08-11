# Module A 環境分群對齊 AirCare v2 — Plan

- 建立日期：2026-08-11
- 對應 note：`docs/implementation-notes/module-a-segmentation-v2-implementation-note.md`
- 狀態：**待使用者確認範圍後實作**

---

## 背景

`~/Downloads/aircare-segmentation-recommendations-v2-20260804.md`（AirCare 族群分群與有效分析規格建議 v2，2026-08-04）為分群規則的權威版本。Module A 目前實作停在 v1（六大類型），與 v2 有三處核心落差。

架構依據（`~/Downloads/aircare-architecture.html`）：Module A 三個 tab 對應架構圖第二層「內部 Dashboard 三層」的 ①總覽 ②分群分析 ③個人詳細。決策 2 明定「一套產出引擎，兩個出口，分數只算一次」，因此分群定義必須與中台引擎一致。

**已拍板**：使用者於 2026-08-11 確認「跟改」，Module A 分群對齊 v2。

---

## 項目 1：六大類型 → 七分群（新增「乾燥」群）

### 需求來源
v2 §4.1 環境分群為 7 群，Module A `CATEGORIES` 只有 6 群，缺「乾燥」。
現況已有可見破口：`HUMIDITY_DIST` 的「過乾」列 `catIds: []`（[module-a.ts:260](../src/mocks/module-a.ts#L260)）— 18 個場域對不到任何類型。

### 目標頁面 / 流程
Module A 全三個 tab（整體場域 / 分類概況 / 個人場域資訊）。不影響其他 Module。

### 目標檔案
| 檔案 | 改什麼 |
|---|---|
| `src/mocks/module-a.ts` | `CatId`、`CATEGORIES`、`CATEGORY_DIST`、`DISPOSITION_ROLLUP`、`HUMIDITY_DIST`、`AIR_QUALITY_DIST`、`FIELDS_A_FULL` |
| `src/modules/module-a/ModuleA.tsx` | 標題 / `<th>` 文案 6 處、`batchAttrs` key |
| `src/data/batch-map.ts` | `A.整體.六大類型分布` key 改名 |
| `MODULES-卡片與圖表清單.md`、`HANDOVER-接手新對話-v4.md` | 同步「六大類型」字樣 |

### 目前問題
- `CatId = '1'|…|'6'`，無第 7 群
- 「過乾」濕度級距對不到類型（`catIds: []`）
- 分布數字為憑空編配，與 v2 實測母體比例差距大

### 預計改動

**1a. 新增第 7 群**

```ts
{ id: '7', code: '乾燥型', identity: '空氣偏乾型', customer: '空氣偏乾',
  disposition: 'ok', color: '#0EA5E9', bg: '#E0F2FE',
  desc: '濕度偏低 · 不適用除濕方向 · 搭配加濕建議' }
```

- 色系沿用 `HUMIDITY_DIST` 「過乾」既有的 `#0EA5E9` / `#E0F2FE`，全站一致
- `disposition: 'ok'` 依據 v2 §4.2「乾燥群移出風險類，改為可揭露的正向標籤」。v2 實測乾燥群分數中位 92.7，高於銅級 87.1；若標 `attention` 會與分數矛盾

**1b. 分布數字按 v2 實測比例重配（⚠ 會改動整體場域 tab 的檯面數字）**

| 分群 | v2 實測(台) | 佔比 | 重配後(場域/1,284) | 現況 |
|---|---:|---:|---:|---:|
| ① 金級空氣 | 869 | 33.9% | **435** | 412 |
| ② 銀級空氣 | 587 | 22.9% | **294** | 386 |
| ③ 銅級空氣 | 120 | 4.7% | **60** | 248 |
| ④ 濕度風險 | 830 | 32.3% | **415** | 124 |
| ⑤ 清淨風險 | 60 | 2.3% | **30** | 78 |
| ⑥ 清淨除濕雙風險 | 52 | 2.0% | **26** | 36 |
| ⑦ 乾燥 | 49 | 1.9% | **24** | — |
| 合計 | 2,567 | 100% | **1,284** | 1,284 |

最大變化：**濕度風險從 9.7% → 32.3%，成為第二大群**。現況 mock 嚴重低估除濕族群，而 CS 系列主打就是除濕 — 修正後 upsell 敘事反而更強。

連動：`DISPOSITION_ROLLUP` → ok 753 (58.6%) / attention 505 (39.3%) / warning 26 (2.0%)；`HUMIDITY_DIST` 過乾列 18 → 24 並補 `catIds: ['7']`。

**1c. 客戶端標籤對齊 v2 §5 官方文案**

| 類型 | 現況 `customer` | v2 §5 官方 |
|---|---|---|
| ④ | 濕度待調 | **濕度管理待改善** |
| ⑤ | 空品待調 | **空氣清淨待改善** |
| ⑥ | 環境待調 | **空氣與濕度皆待改善** |
| ⑦ | — | **空氣偏乾** |

金/銀/銅三級現況已一致。`customer` 欄位即架構決策 2 的「對外出口文案」，兩出口必須同文案。

**1d. `FIELDS_A_FULL` 新增 1 筆乾燥型示例場域**（9 → 10 筆），否則第 7 群在場域清單與詳情頁看不到。

### API / DB / 外部服務影響
**無。** 純前端型別與 mock 資料。

### 驗收條件
1. `npm run build` 與 `npx tsc --noEmit` 通過，`CatId` 擴充後無 exhaustiveness 錯誤
2. 整體場域 tab 分布卡顯示 7 列，總數 1,284、佔比合計 100.0%
3. `DISPOSITION_ROLLUP` 三級合計 = 1,284
4. 分類概況 tab 濕度分布「過乾」列可點/可對應到第 7 群
5. 場域清單可篩到乾燥型場域，點入詳情頁正常渲染
6. 全站搜尋無殘留「六大類型」字樣（含 docs）

### 風險 / 限制
- **1b 會改動已對外展示過的 demo 數字**，若近期有簡報引用舊數字需先確認
- 分布卡為 flex column（[ModuleA.tsx:185](../src/modules/module-a/ModuleA.tsx#L185)），加第 7 列版面安全，**已確認非 6 欄 grid**
- `batch-map` key 改名需同步 `batchAttrs` 呼叫端，否則徽章靜默失效（不會報錯）

### 本輪不處理（已知限制，記錄於 note）
- **`CATEGORY_FLOWS` 不加第 7 群**：其 `dir: 'up'|'down'` 二元模型對乾燥群不適用（乾燥不是「差」，往金級也不是單純「改善」）。待 v2 §10 營運優先序確認後另案處理
- **`AIR_QUALITY_DIST.catIds` 的硬綁模型與 v2 不符**：v2 分群是 P×H 矩陣交叉，現況是單軸切分後硬綁類型，乾燥群（僅由 H 定義）無法乾淨歸入任一 PM 級距。另案
- **`UPSELL_POOL` 不加乾燥群**：CS 系列為清淨+除濕，無加濕產品；v2 只給「加濕建議」。待產品端確認是否有對應方案

---

## 項目 2：新增資料狀態四分類（`dataStatus`）— 建議同批

### 需求來源
v2 §2.2 核心修訂。實測 3,345 台中 778 台（23%）資料不足，其中「疑似長期未使用」214 台在 v1 被錯誤排除。v2 原話：**「狀態天數少本身就是訊號，不是資料缺失。」**

### 目前問題
`FieldRecord` 與 `FieldDetail` **每個場域都必有 `q`/`dhi` 分數與 `cat` 類型**，沒有「無法判定」這個狀態。真實資料接入後約四分之一場域無法顯示分群，現有元件沒有對應呈現方式。

### 預計改動
```ts
export type DataStatus = 'valid' | 'suspected_idle' | 'sensor_insufficient' | 'pm25_anomaly'
```
加入 `FieldRecord` 與 `FieldDetail`；`cat` / `dhi` 改為 `dataStatus !== 'valid'` 時可為 null。
UI：場域清單該列顯示狀態標籤而非分群；詳情頁 KPI 卡顯示「資料不足 · 建議檢查連線」等對應文案（依 v2 §2.2 報告處理欄）。

| 狀態 | 條件 | 報告處理 |
|---|---|---|
| `valid` | 感測 ≥63 天 且 狀態 ≥30 天 | 顯示正式分群與建議 |
| `suspected_idle` | 感測 ≥63 天 但 狀態 <30 天 | 顯示環境分群，建議降級為參考，**進回訪名單** |
| `sensor_insufficient` | 感測 <63 天 | 顯示資料不足，建議檢查連線 |
| `pm25_anomaly` | PM2.5 平均 >50 | 不顯示環境判定，先設備健檢 |

### 為什麼建議同批
`/api/field360` 合約的 response schema 必須含此欄位，否則定出來的是 v1 合約。且 `cat` 轉 nullable 會牽動所有 `catMeta(d.cat)!` 的非空斷言（[ModuleA.tsx:60](../src/modules/module-a/ModuleA.tsx#L60)、[:670](../src/modules/module-a/ModuleA.tsx#L670)、[:1042](../src/modules/module-a/ModuleA.tsx#L1042)、[:1775](../src/modules/module-a/ModuleA.tsx#L1775)），與項目 1 同一批型別改動一起做成本較低。

---

## 項目 3：揭露資格改判分數 — 建議同批

### 需求來源
v2 §4.2 核心修訂：「揭露資格 = AirCare 分數 ≥ 75 且資料有效；分群名稱只作描述標籤，不決定揭露。」

### 目前問題
`CategoryMeta.customer` 把客戶端標籤硬綁在分類上（[module-a.ts:11](../src/mocks/module-a.ts#L11)）— 正是 v2 指名要修的 v1 做法。v2 實測乾燥群 49 台中 36 台（73.5%）分數高於銅級中位，卻被 v1 判為不可揭露。

### 預計改動
新增 `canDisclose(score, dataStatus): boolean`，`customer` 標籤降級為純描述文案。揭露判斷改由分數決定。

### 待確認
`FieldRecord.q` / `FieldDetail.dhi` / `AHI_TREND` 是否就是 v2 的「AirCare 分數」？若是，命名應統一（單一真相原則同樣適用於指標命名）；若否，需要新增獨立欄位，本項目範圍擴大。

---

## 驗證方式

```bash
npx tsc --noEmit
npm run build
npm run lint
git diff --check
```

加上人工 smoke：整體場域 → 分類概況 → 個人場域資訊 四個 sub-tab 逐一開啟，確認 7 群渲染、總數一致、乾燥型場域可點入。

---

## 待使用者確認

1. **範圍**：只做項目 1，還是 1+2+3 一批做完？（建議一批，理由見項目 2）
2. **項目 1b** 分布數字重配是否可接受（會改動整體場域 tab 檯面數字）
3. **項目 3** 的 `dhi` / `AHI` 是否等同 v2「AirCare 分數」
4. 第 7 群 `identity`（內部身分標籤）文案「空氣偏乾型」是否合適
