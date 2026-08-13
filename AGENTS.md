# AGENTS.md

本文件是 airsure repo 的 agent / AI coding assistant 操作準則。任何 agent 在查詢、修改、提交或部署本 repo 前，必須先閱讀並遵守本文件。

---

## 1. Repo 操作基本原則

- 先同步遠端與確認工作樹狀態，不直接跳到實作。
- 只處理本輪任務需要的檔案；不得順手修改或 stage unrelated dirty files。
- 不提交 local secrets、tokens、keys、`.env*`、log、cache、build artifact、`node_modules/`、virtualenv 或其他本機產物。
- 文件與程式碼要一起維護；若行為、資料流、API 或驗收條件改變，需同步更新相關文件或 implementation note。
- 若文件與程式碼不一致，以目前程式碼與已同步的 GitHub 遠端狀態為準，並在同輪或後續 plan 中修正文件。

---

## 2. 開工前必做 GitHub 同步

在查詢或更動 repo 內容前，先執行：

```bash
git fetch origin --prune
git status -sb --untracked-files=all
git rev-parse --abbrev-ref --symbolic-full-name @{upstream}
git rev-list --left-right --count HEAD...@{upstream}
```

規則：

1. 若本地落後 upstream，先檢查是否能安全 fast-forward / pull，再讀檔或改檔。
2. 若本地與 upstream diverged，停止並回報狀態，不要自行 reset、merge 或 rebase。
3. 若有 unrelated dirty files，不可修改、stage 或清理；只處理本輪任務範圍。
4. commit / push 前再次確認 status、staged files、diff check。

---

## 3. 前端 / 後台 / 資料流調整工作流

對非 trivial 的前端、後台、篩選、欄位、表單、API、CSV、資料流或跨頁面調整，必須先建立 numbered item packet，再實作。

### Item packet 格式

每個項目至少包含：

- 項目名稱：`項目N：<簡短名稱>`
- 需求來源：使用者要求、截圖、現有痛點或 bug 描述。
- 目標頁面 / 流程：受影響的 route、頁面、元件或使用者流程。
- 目標檔案：預計會讀取或修改的 frontend / backend / docs / tests 檔案。
- 目前問題：現況、限制、資料來源與重現方式。
- 預計改動：UI 行為、狀態管理、API request / response、資料轉換或 DB 影響。
- API / DB / 外部服務影響：若無影響也要明確寫「無」。
- 驗收條件：可人工或自動驗證的明確條件。
- 風險 / 限制：相容性、舊資料、部署、權限、效能、UX 或測試限制。
- 驗證方式：預計執行的 test、build、lint、smoke check 或人工檢查。

### 分級原則

- 小改：文字、label、spacing、單一樣式修正，可輕量處理，但仍要先同步 GitHub 並檢查 diff。
- 中改：單一元件行為、排序、篩選、欄位顯示，至少寫簡短 item packet。
- 大改：跨頁面、API、DB、CSV、權限、部署或外部服務，一定要完整 item packet、implementation note 與驗證紀錄。

---

## 4. Implementation note

每個非 trivial plan 都要有對應 implementation note，用來記錄實作進度、問題、pitfall 和驗證結果。

建議路徑：

- Plan：`docs/<topic>-plan.md`
- Note：`docs/implementation-notes/<topic>-implementation-note.md`

若 repo 已有既定 docs 結構，以既有結構為準；若 note 不存在，開始實作前先建立。

Implementation note 至少包含：

- 對應 plan / item packet 路徑。
- 目前狀態：not started / in progress / blocked / completed / parked。
- 最近更新時間。
- 本輪操作摘要。
- 已完成項目。
- 進行中項目。
- 待辦項目。
- 已知問題與 pitfall。
- 驗證紀錄與命令輸出摘要。
- 下一步建議。

每輪操作結束前必須更新 note；不要只在 chat 裡描述進度。

---

## 5. 實作準則

- 先研究，再文件化，再計畫，再實作，再驗證。
- 對 runtime 行為改動，優先 TDD / smoke-driven：先建立可失敗的測試或 smoke assertion，再實作最小通過版本。
- 修 root cause，不做只遮掩症狀的 patch。
- 保持改動最小且聚焦，不重構無關區域。
- 保持 UI 文案、資料命名、錯誤處理與現有專案風格一致。
- 涉及資料流時，需同時檢查 frontend state、API contract、backend validation、DB schema、import/export 與文件是否一致。

---

## 6. 驗證與 diff hygiene

依專案實際 scripts 選擇合適命令。常見驗證包含：

```bash
git diff --check
npm run build
npm test
npm run lint
python -m compileall app
pytest
```

規則：

1. 先跑最靠近改動的 targeted test / build，再視需要跑更廣的驗證。
2. 若專案沒有某項工具，不要新增不必要工具；回報「未配置」即可。
3. 若驗證被本機環境或權限阻擋，需明確記錄 blocked reason，不得假裝成功。
4. commit 前檢查：

```bash
git diff --name-status
git diff --check
git diff --cached --name-status
git diff --cached --stat
git diff --cached --check
```

---

## 7. Secret / private data hygiene

不得提交或輸出實際：

- API keys / tokens / passwords / DB credentials。
- Private keys / service account JSON。
- 真實 cookie、session、credential path。
- 非必要 private endpoint、private IP、內部主機細節。
- 可識別個資或客戶資料，除非本輪任務明確需要且已做適當遮蔽。

文件可提環境變數名稱，但不可放真值。範例請使用 placeholder，例如 `${DATABASE_URL}`、`${API_TOKEN}`、`[REDACTED]`。

---

## 8. Commit / push 規則

1. commit 前先同步遠端並確認本地沒有落後。
2. stage only 本輪目標檔案。
3. 不提交 unrelated WIP、本機設定、secret 或 generated artifacts。
4. commit message 使用 conventional style，例如：
   - `docs: add agent guidance`
   - `docs: update implementation note`
   - `feat: update admin filter behavior`
   - `fix: correct booking form validation`
   - `test: add data-flow coverage`
5. push 後再次確認 branch 與 upstream 已同步。

---

## 9. Agent 回報格式

完成工作時，回報需包含：

- 實際修改檔案。
- 驗證命令與結果。
- 未執行驗證的原因。
- 尚未處理或需使用者確認的風險。
- 下一步建議。

不要回報未實際執行過的測試或 build 結果。

---

## 10. 中台 API(Salesforce 真實資料來源)

本專案的真實營運數據**不直接連 Salesforce**,一律透過「克立淨數據中台」取得:

- 中台程式碼:`~/repos/dataspec/sf-dashboard`(FastAPI,啟動:`.venv/bin/uvicorn app:app --port 8000`)
  - 2026-08-13 更正路徑:舊文件寫的 `~/repos/DB/sf-dashboard`、`Cleanstation/sf-dashboard` 都已不存在。
    要確認實際位置:`lsof -a -p $(lsof -t -iTCP:8000 -sTCP:LISTEN) -d cwd`
- 中台授權:OAuth 2.0 Client Credentials(憑證只存在中台的 `.env`,本 repo 不得存放任何 Salesforce 憑證)
- 本專案以 `VITE_MIDDLE_API` 環境變數指定中台網址(預設 `http://localhost:8000`)

### 已接端點

| 端點 | 用途 | 使用處 |
|------|------|--------|
| `GET /api/revenue` | 營收 KPI / 逐月 YoY / 部門 / 通路 / 來源 / Top客戶 / 目標達成 | Module F(`src/hooks/useRevenue.ts`) |
| `GET /api/members?q=` | 會員搜尋(姓名/電話模糊、客戶編號前綴);回傳含 `family_bothered`(成員困擾) | Module B 個人 360°、Module A 場域清單(`src/hooks/useMember360.ts`) |
| `GET /api/member360?id=` | 單一會員 profile + 消費紀錄(實績)+ 服務紀錄(派工/送修/維修完成,中台合併排序) | Module B 個人 360°(`src/modules/module-b/Member360Live.tsx`) |

> 2026-08-13 於中台新增 `Family_Bothered__c`(成員困擾,多重選擇)到上列兩個端點,
> 回傳鍵為 `family_bothered`(分號分隔字串,前端斷詞)。Module A 的報告「客戶輪廓」由此推出。

### 串接模式(新模組接資料時遵循)

1. 每個資料域一個 hook(參考 `src/hooks/useRevenue.ts`):fetch 中台 → 型別化 → 錯誤時回傳 null。
2. **優雅降級**:中台打不到時元件必須自動退回 mock 資料,頁面不得壞掉;UI 需標示「Salesforce 即時」vs「示範資料」。
3. Salesforce 沒有的資料(訂閱方案、推薦漏斗、LTV 等)維持 mock,並在 UI 標注「待資料源接入」。
4. 需要新資料時**先在中台加端點**(SOQL 彙總 + 快取),不要在前端拼湊多次呼叫。
5. Salesforce 物件對照:案件在自訂物件(`Work__c` 派工 / `FailureReport__c` 送修單 / `RepairOrder__c` 維修完成單),營收在 `TargetAndPerformance__c`(`Type__c` 分「實績/目標」,`Date__c` 認列日期)。標準 `Case` 物件無資料。
