# AirSure 克立淨數據中台 — 接手交接文件 v3

> ⚠ **本文件已由 [HANDOVER-接手新對話-v5.md](HANDOVER-接手新對話-v5.md) 取代（2026-09-06）**，僅作歷史記錄保留。內容停在撰寫當時的狀態，多處與現況不符，請勿當作規格使用。

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
| **當前 commit** | `c8e9bfc`(2026-05-29 會員 360° 整合 + Module E P0/P1 + 階段 A-D) |
| **上一版 commit** | `75ed09a`(2026-05-28 Module A 全面客戶中心化改版) |
| **主分支** | `main` |

---

## 二、架構地圖(簡)

```
src/
├── modules/
│   ├── dashboard/Dashboard.tsx
│   ├── module-a/ModuleA.tsx        # 居家空氣場域(雙核心)
│   ├── module-b/ModuleB.tsx        # 用戶 360° 視圖(雙核心,王敬梅) 👈 v3 大整合
│   ├── module-c ~ module-h         # 其餘營運/AI 模組
├── mocks/
│   ├── module-a.ts                 # Module A 場域資料
│   ├── module-b.ts                 # 王敬梅 WANG_PROFILE + WANG_MEMBER_EXT(v3 新加)
│   ├── module-e.ts                 # POPULATION + MEMBER_MASTER 20 筆主檔(v3 新加)
│   └── module-c.ts ~ module-h.ts
├── components/layout/PageShell.tsx
└── styles/
    ├── app.css                     # .kpi .val nowrap(v3 加)
    └── modules.css                 # .b-subtabs.cdefg 主題(v3 加)
```

---

## 三、本次重大變動(v3 vs v2)

### 1. Module E 「會員 360°」整合進 Module B 個人 360° 視圖

| 變動 | 內容 |
|---|---|
| Module E 個人層 | **拿掉**,EMember 元件刪除(761 行),`'member'` tab 移除 |
| Module B 個人層 | 名稱改為「**個人 360° 視圖**」,從 5 sub-tab 擴成 **7 sub-tab** |
| 跨模組導航 | Module E `outreach / churn / points` row 點擊 → `navigate('/module-b', { state: { gotoIndividual: true, memberId } })` → Module B `useLocation` 接收 → 自動切到「個人 360° 視圖」 |
| 王敬梅 mock | `WANG_MEMBER_EXT` 從 mock-e 搬到 mock-b,成為「王敬梅 360° 單一資料源」(訂閱/流失預測/積點/行銷/跨模組信號 6 大段) |

### 2. Module B 個人 360° 視圖 — 7 sub-tab(客戶面向命名)

| Sub-tab | 副標 | 客戶面向描述(看客戶的哪一面) | 來源 |
|---|---|---|---|
| 📊 **價值與風險** | (主管) | 累計貢獻、流失訊號、成長空間 | B 原有 |
| 🎯 **觸及與商機** | (行銷) | 管道、訴求、加值機會 | E 整合 |
| 🎧 **聯絡與歷程** | (客服) | 怎麼聯絡、上次發生什麼、這次該做什麼 | B 原有(動線重排) |
| 🩺 **設備與到府** | (顧問) | 帶什麼料、預判什麼、溝通眉角 | B 原有(+E 整合流失/What-If) |
| 🏠 居家與畫像 | — | 環境條件 + 困擾 + 個人標籤 | B 原有 |
| 💳 **訂閱、積點與帳務** | — | 訂閱方案、積點等級、累計消費、送修報價 | B+E 整合 |
| 🔗 跨模組信號 | — | A 場域 / C 工單 / D 產品 / F 營收 / G 證書 / H 決策的足跡 | E 整合 |

### 3. Module E 大整理(依 3 份 MD)

| 文件 | 改動 |
|---|---|
| `module-e-修改清單.md` | P0 #1-#4 + P1 #5-#9 全做完 |
| `module-e-mock會員主檔與母體定義.md` | 新增 `MEMBER_MASTER` 20 筆 + `POPULATION` 母體 |
| `module-e-tab命名與順序調整.md` | 日常經營 → 總覽;順序改成 總覽 → 主動聯繫名單 → 流失預測 → 分群管理 → 積點管理 |

### 4. Module B 階段 A-D(依 `module-b-完整調整交接包.md`)

| 階段 | 項目 | 內容 |
|---|---|---|
| **A1** | 數字卡換行 | `.kpi .val` 全域加 `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` |
| **A2+A3** | 四視圖客戶面向命名+描述句 | 主管→價值與風險 / 行銷→觸及與商機 / 客服→聯絡與歷程 / 顧問→設備與到府,描述句「📊 這位客戶的 X — 內容」 |
| **A4** | AI 字詞統一 | AI 建議標題直接帶入 subTab 名稱;底部「當前角色視圖」→「當前檢視面向」 |
| **B1** | Hero 摺疊 | 4 個大數字(累計/客單/服務/機型)預設**收合**,加「展開摘要 ▾」按鈕(內容上移約一屏) |
| **B2** | sub-tab 排列 | 原本提案「4 + 更多 ▾」,但**用戶要求** 7 個一字排開,不要收合 |
| **B4** | AI 側欄 sticky | `position: sticky, top: 16, maxHeight: calc(100vh - 32px), overflowY: auto` |
| **C1 聯絡與歷程** | 動線重排 | 聯絡資訊(加撥打/補資料鈕)→ **📞 撥號前·這次該解什麼(待辦上移)** → **💡 電話前必看·Memo 重點上移** → 最近互動+服務歷程(2 欄下移),拿掉重複的跨模組信號 |
| **C1 設備與到府** | 動線重排 | 設備清單 → **🔬 本次到府預判 + 歷次症狀(上移)** → 耗材盤點 → 溝通眉角 → 金流 |
| **C2 觸及與商機補 5 缺口** | LINE/推薦/活動/NPS/AI | ①「+ 補 LINE」鈕 ②「再邀推薦」鈕+潛力 ③ 雙11濾網組合補 NT$7,200 ④ NPS 補「+1 vs 上次 · 填答 2025-Q4」⑤ AI 推薦補預估貢獻 NT$6,800/季 |
| **D** | 共用「補資料」modal | 4 個入口(主管「+ 開始補資料」/ 行銷「+ 補 LINE」/ 客服 Email+Line ID 兩個「+ 補資料」)全部串到同一 modal,列出 `WANG_PROFILE.dataGaps` 9 欄一次補齊 |

---

## 四、關鍵資料模型

### `src/mocks/module-b.ts`

```ts
WANG_PROFILE                          // 王敬梅核心資料(基本識別 + 居家 + Memo + 設備 + 耗材 + 症狀 + 溝通眉角 + 金流 + 服務歷程 + 風險 + 機會 + 資料缺口 + 送修報價)
WANG_MEMBER_EXT (v3 新加)             // 會員經營面擴充:
  ├─ subscription      // 訂閱方案(年方案 + 自動續約 + 續約倒數 110 天)
  ├─ churnPrediction   // 流失預測(38% 中風險 + 5 主因 + 預估挽回 NT$68K + What-If 3 情境)
  ├─ points            // 積點(Gold + 14,000 點 + 距 Platinum 4,000 點 + 累積記錄 + 可兌換項目)
  ├─ marketing         // 行銷(4 命中分群 + NPS 8 + 趨勢 + 5 活動回應 + 下次推薦含 NT$6,800 預估)
  ├─ crossSignals      // 6 模組信號(A/C/D/F/G/H)
  └─ memberTodos       // 會員經營角度待辦(行銷+客服)
```

### `src/mocks/module-e.ts`

```ts
POPULATION (v3 新加)                   // 母體定義(解 #2 #7):
  ├─ totalMembers: 8420               // 天花板 ← 頂部 KPI
  ├─ paidSubscribers / pointsAccounts // 子集
  ├─ edmSubscribers / lineFriends / appAccounts  // 渠道受眾(非會員母體)
  ├─ lifecycle 5 階段加總 = 8420       // 解 #2
  ├─ outreachTotal 37 + breakdown     // 解 #7
  └─ recoverValueTotal 840K           // 解 #3

MEMBER_MASTER (v3 新加,20 筆主檔)     // 解 #4 跨 tab 一致
  ├─ id / name / level / city / site
  ├─ stage / churn / rfm
  ├─ recoverK / outreach / pointsUsed / pointsTotal
  └─ trigger / owner

MEMBER_KPIS                          // 4 卡(總會員 8,420 / 活躍率 / 本月新增 / 挽回估值 840K)
LIFECYCLE_STAGES                     // 5 階段加總 = 8,420
DAILY_CHANNELS                       // EDM/APP/LINE 標「渠道受眾」
OUTREACH_MEMBERS                     // 10 筆對齊主檔(原 6 筆)+ owner + status
CHURN_TIERS                          // 對齊主檔(陳俊宏/王淑芬等不再矛盾)
POINTS_BY_TIER                       // 既有
```

### 王敬梅編號對應

- **王敬梅 = C201000272**(Module B 個人 360° 主示範,跨模組共用)
- 在 Module E 對應編號 = **M-201000272**(主檔內沒有,但 WANG_MEMBER_EXT.memberId 有定義)

### Module E 編號對應(主檔 20 筆代表性會員)

- 陳俊宏 M-008412(待聯繫第一筆 · 高風險 64%)
- 李文芳 M-007738 / 王淑芬 M-009203 / 張志明 M-005611 / 林雅琪 M-010055
- 黃建中 M-006822 / 黃健宇 M-011204 / 吳承翰 M-005208
- 黃慧君 M-004119 / 王婉真 M-009880(原 M-009203 同名問題已解,拆兩編號)
- 蔡明哲/周雅婷/劉建國(積點 #1 Diamond)/鄭淑芬/許志偉
- 楊雅雯/趙文德/簡美玲/邱建華/賴怡君

---

## 五、跨模組導航(v3 新增)

```
Module E (outreach / churn / points 三個 row 點擊)
  ↓ navigate('/module-b', { state: { gotoIndividual: true, memberId: id } })
Module B root
  ↓ useLocation().state.gotoIndividual === true
  ↓ useEffect setTab('individual')
個人 360° 視圖(王敬梅完整 360°)
  └─ Hero + 7 sub-tab + 共用補資料 modal + AI 側欄
```

**注意**:目前 PersonaView 不論收到什麼 memberId 都顯示王敬梅 360°(主示範)。若要對其他會員顯示對應姓名,需擴充 PersonaView 接收 prop + fallback Hero。

---

## 六、設計語彙(Design Tokens · 不變)

```css
--as-primary:   #0E7A66   /* A/B 雙核心 — 綠 */
--as-cdefg:     #4F46E5   /* C-G 營運 — 紫 */
--as-h:         #D97706   /* H AI — 橘 */
--as-success:   #16A34A
--as-warning:   #EAB308
--as-danger:    #DC2626
--as-info:      #2563EB
```

CSS class 慣例:`.card / .ch / .csub / .kpi-row / .kpi / .pill.g.y.r / .dt / .seg-card / .sg-h / .sg-stack / .sg-rows / .b-subtabs / .b-subtab / .two-col / .seg-cards`(分群卡用,Module E 分群管理用 minmax(260px, 1fr))

**v3 加的 CSS:**
- `.kpi .val` 全域 nowrap + overflow ellipsis(解數字卡換行)
- `.b-subtabs.cdefg .b-subtab.active .n` 紫色 badge(對應 Module E)

---

## 七、Phase / 階段現況

| 階段 | 範圍 | 狀態 |
|---|---|:---:|
| **Phase 1** | Module A 三層級客戶中心化(v2) | ✅ |
| **Phase 1.5** | Module A 類型流動快照 | ✅ |
| **Phase 2** | Module A 環境部 AQI 室內外落差 | ⏳ 待 API |
| **Module E P0** | 分群崩版 / 總會員 / 挽回估值 / 跨 tab 一致 | ✅ |
| **Module E P1** | 負責人欄 / SLA 警示 / 包含關係 / 模型版本 / 預設 tab | ✅ |
| **Module E P2** | 渠道結果一哩 / CPA+留存 / 積點 ROI / 行銷分群驗證 | ⏳ 未做 |
| **Module B 階段 A** | 數字卡 / 視圖命名 / 描述句 / AI 字詞 | ✅ |
| **Module B 階段 B** | Hero 摺疊 / sub-tab(7 個一字排開) / AI sticky | ✅ |
| **Module B 階段 C** | 動線重排(聯絡/設備) / 觸及與商機補 5 | ✅ |
| **Module B 階段 D** | 共用補資料 modal(4 入口) | ✅ |
| **Module B 階段 D 進階** | AI 行動鈕跨模組(行銷「排入推送」→ Module E 活動排程) | ⏳ 未做 |
| **會員 360° 整合** | 從 Module E 搬到 Module B | ✅ |

---

## 八、可以接著做的事(優先序)

### Module E P2(行銷深度)
- [ ] 渠道結果一哩:每張 EDM/APP/LINE 卡補「歸因營收 / 回流數 / 轉換筆數」
- [ ] 新會員來源補 CPA + 30 天留存率
- [ ] 積點管理加「有兌換 vs 無兌換」留存對照 + 兌換率業界基準
- [ ] 行銷分群 tab 內容檢視(若空或重複可隱藏切換鈕)

### Module B 進階
- [ ] **PersonaView 支援多會員**:目前所有 Module E 跳轉都顯示王敬梅,需擴充 PersonaView 接 memberId prop + Hero fallback(對應 Module A FIELD_DETAILS pattern)
- [ ] AI 行動鈕跨模組:「排入推送」實際進 Module E 活動排程;「採納 What-If」實際排定派工
- [ ] 補資料 modal 進階:input 受控 state + 表單驗證 + 真實 API hook 點
- [ ] 7 sub-tab 在窄螢幕的 overflow-x 滾動細節(b-subtabs 已 overflow-x: auto)

### Module A 延伸
- [ ] 多場域完整 mock(只 SH-2841 是完整,其他 8 個 fallback)
- [ ] 場域翻頁(Hero「上/下一個場域」)
- [ ] 水箱管理 tab row 接詳情

### 跨模組整合
- [ ] Module C 工單 row → Module A 場域詳情 / Module B 個人 360°
- [ ] Module G「從個人 360° 直接產證書」按鈕
- [ ] Module H 推薦行動真正驅動跨模組 action

### 視覺/技術優化
- [ ] 手機版 Hero + Sub-tab nav 摺疊
- [ ] 趨勢圖換 recharts(目前純 SVG 手刻)
- [ ] 環境部 API 串接(`INDOOR_OUTDOOR.status = 'live'` 後拿掉「待接入」)

---

## 九、本次對話(2026-05-29)決策記錄

| 決策 | 內容 |
|---|---|
| **示範會員** | 王敬梅 C201000272 — Module B/E 跨模組共用同一份完整 360° mock |
| **會員 360° 歸屬** | Module E 不留會員 360° tab,整段整合進 Module B 個人 360° 視圖 |
| **WANG_MEMBER_EXT 位置** | 從 mock-e 搬到 mock-b,讓 mock-b 成為王敬梅完整 mock 的單一資料源 |
| **跨模組跳轉機制** | `navigate('/module-b', { state })` + `useLocation` + `useEffect` setTab |
| **共用主檔 vs 各 tab 寫死** | 共用 `MEMBER_MASTER` 20 筆主檔解 #2/#3/#4/#7 一次到位 |
| **挽回估值 840K 對齊** | 10 筆顯示加總 650K + 註腳「+ 其餘 27 位約 190K = 840K」 |
| **生命週期合計** | 342/5760/1284/268/766 = 8,420 對齊總會員數 |
| **Module E 預設 tab** | 從「日常經營」改成「主動聯繫名單」(對齊工作動線:洞察 → 行動) |
| **Module E tab 順序** | 總覽 → 主動聯繫 → 流失預測 → 分群 → 積點(行動型先、策略型後) |
| **Module B 個人層命名** | 個人層 → 個人 360° 視圖(對齊 Hero「用戶 360° 視圖」) |
| **四視圖命名邏輯** | 從「誰來看」(主管視角)改成「看客戶的哪一面」(價值與風險);副標保留職位 |
| **AI 側欄字詞** | 「角色」→「面向」;底部「當前角色視圖」→「當前檢視面向」 |
| **Hero 摺疊** | 4 個大數字預設收合,內容上移約一屏 |
| **Sub-tab 排列** | 用戶決定 7 個一字排開,不採用「4 + 更多 ▾」 |
| **C1 聯絡與歷程動線** | 從「歷史檔案」改成「通話前作戰卡」(待辦+Memo 上移) |
| **C1 設備與到府動線** | 殘量→症狀→預判一氣呵成(本次預判上移到設備清單後) |
| **D 共用補資料** | 主管「資料缺口」/ 行銷「LINE 未連」/ 客服「Email+Line ID 待補」全部入口共用同一 modal |

---

## 十、Build / 部署快速操作

```bash
# 本機開發
cd ~/Desktop/airsure
npm run dev          # localhost:5173

# 編譯
npm run build        # 產出 dist/

# TS only(沙箱也能跑,vite 因 native binary 跑不起來)
npx tsc -b

# 部署(Cloudflare Pages main 分支自動部署)
git push origin main
```

**部署狀態**:https://github.com/91JoeyHTC/airsure/commits/main
**Cloudflare 部署觸發**:約 2 分鐘內反映 push 後狀態

---

## 十一、注意事項

- **TypeScript 嚴格模式**(`noUnusedLocals: true`),改 import 時要清乾淨
- **沙箱無 GitHub 認證**,push 需要使用者本機跑(Cowork 內 commit 沒問題)
- Cowork 連入 `~/Desktop/airsure` 後 Vite HMR 會自動 reload,改完不用重啟
- FUSE mount 偶爾會卡住 `.git/index.lock` 或 `.git/objects/tmp_obj_*`,卡住就 `rm -f .git/index.lock` 再重試
- 改完一塊就 `npx tsc -b` 驗證,TS 錯誤會在 tsc 步驟抓
- **沙箱 vite build 會掛**(`@rolldown/binding-linux-arm64-gnu` 缺少 native binary,因為 npm install 是在 macOS 跑的),本機跑 `npm run build` 才能完整驗證
- **JSX 內 `<` 字元**(如 `< 24h`)會被當成標籤起始,要用 `{'< 24h'}` 或 `&lt;` 包起來

---

## 十二、本次 commit 摘要

```
c8e9bfc — feat(module-b,module-e): 會員 360° 整合進個人 360° 視圖 + Module E P0/P1 修正

6 files changed, 1085 insertions(+), 234 deletions(-)

src/mocks/module-b.ts            (+132)  WANG_MEMBER_EXT 整段 + C2 marketing 補欄位
src/mocks/module-e.ts            (+209)  POPULATION + MEMBER_MASTER 20 筆 + 各 tab 對齊主檔
src/modules/module-b/ModuleB.tsx (+774)  7 sub-tab + Hero 摺疊 + 動線重排 + 補資料 modal
src/modules/module-e/ModuleE.tsx (重構)  移除 EMember 761 行 + 主檔對齊 + Tab 重排 + 跳轉
src/styles/app.css               (+1)    .kpi .val nowrap
src/styles/modules.css           (+1)    .b-subtabs.cdefg 主題
```

---

*文件結束 — 2026-05-29 commit c8e9bfc*
