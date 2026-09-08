# AirCare 報告站（原型）

> ⚠ **這是本機原型，不是要上線的東西。** 目的只有一個：**驗證「點報告裡的按鈕 → 事件真的被記下來 → 客戶被正確轉走」這條鏈路成立。**
> 正式版由工程師依 `../docs/aircare-0918-報告寄送計畫.md` §3、§4 另行建置（獨立網域、正式環境）。原型驗完就該把這個目錄抽出去成獨立 repo。

## 這一版做了什麼

| 有 | 沒有 |
|---|---|
| 一顆 CTA（設定倒水提醒）的點擊追蹤 | 其餘兩顆 CTA、四顆分享按鈕 |
| 302 轉址（不依賴 JS） | 報告開啟事件（`/e/open`） |
| 通路辨識 `?ch=line/sms/email` | 預抓取過濾 |
| 不可猜 8 碼 token | token 期效／撤銷 |
| 事件寫入 D1 | 字型內嵌（報告仍載 Google Fonts） |

## 怎麼跑

```bash
cd report-site

# 1. 建本機 D1 的表（只需一次）
npx wrangler d1 execute aircare-report --local --file=schema.sql

# 2. 上架一份報告（會產 token 並注入追蹤連結）
node scripts/publish.mjs <原始報告.html> <客戶編號> <設備MAC>

# 3. 起本機服務
npx wrangler pages dev public --port 8788 --d1 DB=aircare-report

# 4. 開上一步印出的網址，點「設定倒水提醒」

# 5. 查事件
npx wrangler d1 execute aircare-report --local \
  --command "SELECT * FROM cta_click ORDER BY id"
```

> ⚠ `--d1 DB=aircare-report` 這個參數不能省 —— `pages dev` 不會自動吃 `wrangler.toml` 的 D1 綁定，
> 省略會讓 `env.DB` 是 undefined，事件靜靜地寫不進去（函式有 try/catch，客戶端不會有感覺）。
> 另外 `wrangler.toml` 的 `database_id` 必須與 `--d1` 的名稱一致，否則 `d1 execute` 與 dev server 會指到**兩個不同的本機 DB**。

## 檔案

```
functions/c/[token]/[cta].js   GET /c/<token>/<cta> → 寫 cta_click 後 302
public/demo-destination.html   原型的假目的地（正式版換成活動頁／表單／LINE）
public/r/<token>.html          上架後的報告（publish.mjs 產出，不進版控）
reports/manifest.json          token → 客戶編號/MAC（正式版要進 D1）
scripts/publish.mjs            上架處理：產 token、注入追蹤連結、檢查外部資源
schema.sql                     cta_click 一張表
```

## 設計決策

**CTA 走 302 轉址，不用前端埋點** —— 連結被複製、轉傳、在 LINE 內建瀏覽器開啟時，JS 埋點常收不到，302 一定收得到。

**寫事件失敗仍要轉址** —— 追蹤壞掉不該擋住客戶的行動，所以 insert 包在 try/catch 裡。代價是失敗會靜靜地發生，只在 server log 看得到。

**不認識的 `cta_id` 回 404，不轉址** —— 否則這支端點就成了開放跳板，任何人都能拿它導去任意網址。

**只存國別不存 IP**（`cf-ipcountry`），保留原始 UA 供事後過濾預抓取。

## 已知問題（正式版要處理）

1. **報告仍載 Google Fonts**（三套、含兩套中文字型）—— 違反計畫 §5.5 第 1 條。`publish.mjs` 會警告但放行。
2. **token 對照在 JSON 檔**，不是 D1。
3. **目的地寫死在函式裡** —— 正式版應由設定決定，才能不改報告就換活動頁。
4. **沒有 rate limit** —— 正式版要防 token 掃描。
5. `public/r/*.html` 含客戶編號（證書編號與分享卡），屬輕度個資，token 即憑證。
