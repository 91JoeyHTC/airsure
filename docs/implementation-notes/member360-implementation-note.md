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

## 下一步建議

- 下一範圍(plan 已列):RFM 分群 + 價值象限散點圖改吃 `TargetAndPerformance__c` by ContactId 彙總。
- 線上部署(pages.dev)要吃 Live 需中台公開 https 網址 + `VITE_MIDDLE_API` build 變數(見 2026-07-23 對話結論)。
