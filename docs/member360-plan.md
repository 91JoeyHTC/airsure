# Plan:Module B 個人 360° 串接 Salesforce 真實會員資料

日期:2026-07-23 · 狀態:in progress

## 項目1:個人 360° 會員搜尋 + Live 消費/服務紀錄

- **需求來源**:使用者要求將 Module B(用戶 360° 視圖)串接 Salesforce 資料;經確認範圍鎖定「個人 360° 紀錄」(消費紀錄 + 服務紀錄改 Live)。
- **目標頁面 / 流程**:`/module-b` → 個人 360° 視圖 tab(`PersonaView`)。新增會員搜尋;選定真實會員後整頁切換為該會員的 Live 360°,可返回示範會員(王曉明 mock)。
- **目標檔案**:
  - 中台(另一 repo):`~/repos/DB/sf-dashboard/app.py` — 新增 2 個端點
  - 前端:`src/hooks/useMember360.ts`(新)、`src/modules/module-b/Member360Live.tsx`(新)、`src/modules/module-b/ModuleB.tsx`(小幅修改 PersonaView)
  - 文件:本 plan、`docs/implementation-notes/member360-implementation-note.md`、`AGENTS.md` 已接端點表
- **目前問題**:`PersonaView` 整頁掛在固定 mock 會員 `WANG_PROFILE`;消費(`FINANCE_RECORDS`)與服務(`w.repairOrders` 等)全為假資料,無法查看真實客戶。
- **預計改動**:
  - 中台 `GET /api/members?q=` — Contact 依姓名/電話模糊搜尋(LIMIT 20)。
  - 中台 `GET /api/member360?id=` — 回傳 profile(Contact)+ purchases(`TargetAndPerformance__c` 實績 by `ContactId__c`)+ summary + services(`Work__c` 派工 / `FailureReport__c` 送修 / `RepairOrder__c` 維修完成,依 AGENTS.md 規則由中台合併排序,前端不拼湊多次呼叫)。
  - 前端 hook `useMemberSearch` / `useMember360`:打不到中台時回 null,UI 優雅降級(搜尋框顯示未連線提示,示範會員照常)。
  - `PersonaView`:頂部加搜尋框;選定後 render `<Member360Live>`(profile 卡 + KPI 列 + 消費紀錄表 + 服務紀錄表),SF 沒有的區塊(設備、訂閱、積點、分群)標注「待資料源接入」。

### SF 物件對照(2026-07-23 describe 確認)

| 物件 | 連 Contact 欄位 | 主要欄位 |
|---|---|---|
| `TargetAndPerformance__c` | `ContactId__c` | `Date__c`、`Amount__c`、`Source__c`、`OrderLink__c`、`Type__c`(實績/目標) |
| `Work__c` 派工 | `Coustomer__c`(原欄位拼字如此) | `StartDateTime__c`、`Name` 派工編號、`WorkType__c`、`Stage__c` |
| `FailureReport__c` 送修 | `Customer__c` | `OrderDate__c`、`Name`、`ServiceCatagory__c`、`Status__c`、`TotalAmount__c`、`Directions__c` |
| `RepairOrder__c` 維修完成 | `Customer__c` | `OrderDateF__c`、`Name` 貨單編號、`ModelNumber__c`、`Amount__c`、`MaintenanceDescription__c` |

- **API / DB / 外部服務影響**:中台新增 2 個唯讀 GET 端點(SOQL,60s 快取不適用/單客查詢輕量);Salesforce API 每次查詢 5 條 SOQL。無 DB。
- **驗收條件**:
  1. `curl /api/members?q=<姓名片段>` 回傳匹配 Contact 清單。
  2. `curl /api/member360?id=<ContactId>` 回傳該會員 purchases + services,金額與 SF 一致。
  3. `/module-b` 個人 360° 搜尋真實會員 → 顯示 Live 消費/服務紀錄與「Salesforce 即時」標示;返回鈕回到示範會員。
  4. 中台關閉時頁面不壞,搜尋框顯示未連線,示範會員照常。
  5. `tsc -b` 無錯誤、頁面 console 無錯誤。
- **風險 / 限制**:Contact 資料量大時 LIKE 搜尋較慢(LIMIT 20 緩解);`id` 參數需驗證格式防 SOQL injection;Run-As 使用者需有四個物件讀取權限。
- **驗證方式**:curl 端點、`npx tsc --noEmit`、Playwright 開頁截圖 + console 檢查。
