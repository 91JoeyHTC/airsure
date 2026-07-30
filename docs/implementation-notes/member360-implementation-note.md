# Implementation note:Module B 個人 360° 串接 SF 真實會員

- 對應 plan:`docs/member360-plan.md`(項目1)
- 目前狀態:completed
- 最近更新:2026-07-23

## 本輪操作摘要

- describe 探查四個 SF 自訂物件與 Contact 關聯欄位(結果記入 plan 物件對照表)。
- 中台(`~/repos/DB/sf-dashboard/app.py`)新增 `GET /api/members`、`GET /api/member360`,重啟 uvicorn 生效。
- 前端新增 `src/hooks/useMember360.ts`、`src/modules/module-b/Member360Live.tsx`,`PersonaView` 頂部加會員搜尋,選定後整頁切換 Live 360°。
- AGENTS.md 已接端點表同步更新。

## 已完成項目

- SF schema 探查與 plan/note 建檔。
- 中台端點:搜尋(姓名/電話 LIKE,LIMIT 20)、member360(profile + 實績消費 + 三物件服務紀錄合併排序;id regex 驗證、`_soql_escape` 防注入、picklist 用 `TOLABEL()` 取中文標籤、demo 模式假資料、單物件失敗不影響其他區塊)。
- 前端 hook(300ms debounce 搜尋 / 單會員 360°,打不到中台回 null)與 Live 視圖(profile 卡 + 4 KPI + 消費表 + 服務表,「SALESFORCE 即時」標示、待接入區塊註記、返回示範會員)。

## 追加(2026-07-23 第二輪)

- profile 增加:客戶等級(`Contact.CustomerLevel__c`,TOLABEL)、曾購系列(`BuyProductFamily__c`)、曾購機型(`BuyProductModel__c`);後兩者為分號分隔 textarea,中台以 `_semi_list` 拆為字串陣列。
- UI:等級以綠色 pill 顯示在姓名旁;曾購系列/機型以 chips 列在識別卡。
- 驗證:林雯雯 → 「B:一般客人」+ CS系列 + CS101/CS100 ✅(E2E 全綠、tsc OK)。
- pitfall:SOQL 欄位別名僅 aggregate 與 `TOLABEL()` 可用,一般欄位加別名會 MALFORMED_QUERY。

## 驗證紀錄(2026-07-23)

- `curl /api/members?q=林雯` → 3 筆 Contact ✅
- `curl /api/member360?id=003Q900001kCHA9IAO` → 林雯雯 3 筆實績共 193,092(與 `/api/revenue` Top客戶數字一致)+ 2 筆派工(TOLABEL 中文標籤)✅
- bad id → HTTP 400 ✅
- `npx tsc --noEmit` ✅
- Playwright E2E(port 5176):切個人 360° → 搜「林雯」→ 選林雯雯 → 累計 NT$193,092 / 服務紀錄「新機居檢」顯示、console 無錯誤 → 返回示範會員(王敬梅)✅

## 已知問題與 pitfall

- `Work__c` 連 Contact 的欄位拼字是 `Coustomer__c`(SF 原始欄位如此,勿「修正」拼字)。
- `sf_client.get()` 需傳完整路徑 `/services/data/{ver}/...`,傳相對路徑會拼壞 host 造成 DNS 錯誤。
- 中台 uvicorn 未帶 `--reload`,改 app.py 後需手動重啟。
- 示範會員 mock 名為「王敬梅」(非註解中的王曉明)。
- `member360` 首次呼叫約 3–6 秒(5 條 SOQL 無快取);單客查詢輕量故未加快取,若展示時感覺慢可補。

## 追加(2026-07-30 第三輪:搜尋結果加辨識欄位)

- 需求:同名或同電話的客戶,搜尋清單列視覺上無法分辨(原本只顯示姓名·電話·Email)。
- 中台 `/api/members`:SELECT 追加 `CreatedDate` 與 `TOLABEL(CustomerLevel__c) lvl`(同一筆 Contact 查詢即可取得,不增加 SOQL 次數);每筆回傳新增 `level`、`created_date`(`_d10` 取前 10 碼)。demo 會員(王曉明)補上對應欄位。
- 前端:`MemberHit` 加選填 `level` / `created_date`;`MemberSearch` 每列在右側補「等級 chip · 建檔日 · Id 末 6 碼」,同名/同電話即可區分(Id 末碼為唯一保底鍵)。
- 唯一鍵仍為 Salesforce Contact `Id`(`key={m.id}`、帶出 360° 用 `member.id`),重複資料不會混。
- 尚未做(使用者本輪未要求):LIMIT 20 命中截斷提示。
- 驗證:`npm run build` ✅、中台 `py_compile app.py` ✅。中台需手動重啟(未帶 `--reload`)才會生效;Live 端到端待中台重啟後人工確認同名情境。

## 追加(2026-07-30 第四輪:Live 識別卡補齊客戶欄位)

- 需求(截圖):識別卡要顯示性別/年齡/生日、縣市區、克立淨分區、服務顧問、年資、下次定保。
- 欄位對應(依 DB repo《客戶主檔_Salesforce欄位對應.md》,已用 describe 撈真實 schema):
  - 性別 `Sex__c`(picklist,TOLABEL)、生日 `Birthday__c`(date)、年齡 `CustomerAge__c`(double,SF 衍生,中台不重算)
  - 縣市 `City__c` / 區域 `Area__c`(picklist,TOLABEL)、地址 `Address__c`(textarea)
  - 克立淨分區 `CleanZone__c`(picklist,TOLABEL)
  - 服務顧問 = 負責人員(客服)`CSR_EmployeeID__r.Name`(reference;⚠️語意待使用者確認是否為「服務顧問」,另一候選是業務 `SalesMan__c`)
  - 年資:前端由 `CreatedDate` 算滿幾年(`yearsSince`,未滿週年不進位)
  - 下次定保 `NextMaintenanceDate__c`(⚠️SF 型別為 **string**,原樣回傳/顯示,不當 date 排序)
- 中台 member360 單筆 Contact 查詢一次取回上列欄位(不增加 SOQL 次數);profile 新增 sex/birthday/age/city/area/address/clean_zone/consultant/next_maintenance;demo profile 同步補值(王曉明)。
- 前端:`Member360.profile` 型別加對應選填欄位;識別卡姓名列下方新增 meta row(👤性別·年齡(生日) 📍縣市區 🏢克立淨 分區 🎧服務顧問 📅建立 N 年(建檔日)),下次定保另起一行以警示色 `--as-warning` 強調。
- pitfall 沿用:SOQL 一般欄位加別名會 MALFORMED,只有 aggregate / TOLABEL 可別名;`CSR_EmployeeID__r.Name` 回傳為巢狀 dict,以 `(c.get("CSR_EmployeeID__r") or {}).get("Name")` 取。
- 驗證:`npm run build` ✅、中台 `py_compile app.py` ✅、demo 路徑資料齊。Live(真實 Contact)因需中台重啟 + SF 連線,端到端待人工確認,尤其 `CSR_EmployeeID__r.Name` 與 `Area__c`/`CleanZone__c` 是否有值。

## 下一步建議

- 服務顧問語意確認:`CSR_EmployeeID__c`(客服負責人)vs `SalesMan__c`(業務)——若截圖「服務顧問」實為業務,改用 `SalesMan__c`。
- 下一範圍(plan 已列):RFM 分群 + 價值象限散點圖改吃 `TargetAndPerformance__c` by ContactId 彙總。
- 可選:搜尋命中達 20 筆時顯示「結果過多,請輸入更完整條件」避免靜默截斷。
- 線上部署(pages.dev)要吃 Live 需中台公開 https 網址 + `VITE_MIDDLE_API` build 變數(見 2026-07-23 對話結論)。
