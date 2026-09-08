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

## 怎麼測試

### 準備：開兩個終端機

**終端機 A —— 服務（測試期間要一直開著）**

```bash
cd ~/repos/airsure/report-site
npx wrangler pages dev public --port 8788 --d1 DB=aircare-report
```

啟動後**先確認這一行有出現**：

```
env.DB (local-DB=aircare-report)   D1 Database   local
```

> ⚠ 沒看到就是 `--d1` 漏了。這時報告照樣打得開、按鈕照樣會轉址，**但事件一筆都不會寫進去**
> （函式有 try/catch，只有終端機 A 會印 `insert failed`）。這是最容易誤判「測試通過」的地方。

**終端機 B —— 查資料**

```bash
cd ~/repos/airsure/report-site

# 清掉先前的測試資料,讓待會自己點的那一筆不會混淆
npx wrangler d1 execute aircare-report --local --command "DELETE FROM cta_click"
```

### 測試步驟

| # | 做什麼 | 應該看到 |
|---|---|---|
| 1 | 瀏覽器開 `http://localhost:8788/r/<token>?ch=line` | 完整的報告頁（`<token>` 見 `reports/manifest.json`） |
| 2 | 捲到 **Ch.03 你的行動清單**，點橘色的「**設定倒水提醒 →**」 | 跳到綠色的「✅ 轉址成功」頁，顯示 `來源 CTA: tank` / `通路: line` |
| 3 | 終端機 B 查事件（見下方指令） | 出現一筆 `cta_id=tank`、`ch=line`、`ua` 是你的瀏覽器 |
| 4 | 把網址的 token 改一個字元再開 | **404** |
| 5 | 換 `?ch=sms` 再點一次 | D1 多一筆，`ch=sms` |

查事件：

```bash
npx wrangler d1 execute aircare-report --local \
  --command "SELECT id, cta_id, ch, substr(ua,1,40) ua, clicked_at FROM cta_click ORDER BY id"
```

### 手機測試（重要）

客戶多半在 LINE 內建瀏覽器用手機開，**桌機測過不代表手機沒問題**。讓區網其他裝置連得到：

```bash
npx wrangler pages dev public --port 8788 --d1 DB=aircare-report --ip 0.0.0.0
```

然後手機連同一個 Wi-Fi，開 `http://<你電腦的區網IP>:8788/r/<token>?ch=line`
（查 IP：`ipconfig getifaddr en0`）

手機上要特別看：版面有沒有跑掉、**字型載入前後版面會不會跳**（報告還在載 Google Fonts）、按鈕好不好按。

### 驗收清單

- [ ] 報告完整顯示，桌機與手機都正常
- [ ] 點按鈕會跳到轉址成功頁，且 CTA 與通路顯示正確
- [ ] D1 出現對應的一筆，`ch` 正確
- [ ] token 改一個字元 → 404
- [ ] 不同 `?ch=` 記成不同通路
- [ ] 終端機 A 全程沒有 `insert failed`

### 重新上架一份

```bash
node scripts/publish.mjs <原始報告.html> <客戶編號> <設備MAC>
# 會產新 token、印出網址,並警告仍引用的外部資源
```

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
