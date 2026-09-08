-- AirCare 報告站 · 事件表(原型)
-- 目前只做「CTA 點擊」一種事件,先驗證追蹤鏈路是否成立。
-- 正式版的完整模型見 docs/dispatch-data-model-spec.md §3。

CREATE TABLE IF NOT EXISTS cta_click (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT NOT NULL,          -- 報告 token(綁設備)
  cta_id     TEXT NOT NULL,          -- 點了哪一顆
  ch         TEXT,                   -- 通路 line / sms / email;未帶為 null
  ua         TEXT,                   -- 原始 User-Agent,供事後過濾預抓取
  ip_country TEXT,                   -- Cloudflare 給的國別,不存 IP
  clicked_at TEXT NOT NULL           -- ISO8601(UTC)
);

CREATE INDEX IF NOT EXISTS idx_click_token ON cta_click(token);

-- 報告開啟事件。刻意記兩種來源,因為兩種都不完整:
--   server —— 伺服器端在送出 /r/<token> 時記的。不依賴 JS,關掉 JS、
--             LINE 內建瀏覽器都記得到,但預覽器/預抓取也會進來。
--   beacon —— 頁面真的在瀏覽器裡跑起來後才送。預抓取通常不執行 JS,
--             所以有 beacon 幾乎等於「人真的看到了」,但擋掉 JS 的人會漏。
-- 「真開啟」= 同一個 token 兩種都有。過濾規則不寫死在這裡,原始 UA 全留,
-- 事後可重算(計畫 §6.3、§3.1 F6)。
CREATE TABLE IF NOT EXISTS report_open (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT NOT NULL,
  ch         TEXT,                   -- 通路 line / sms / email;未帶為 null
  source     TEXT NOT NULL,          -- server / beacon
  ua         TEXT,                   -- 原始 User-Agent,供事後過濾預抓取
  ip_country TEXT,
  opened_at  TEXT NOT NULL           -- ISO8601(UTC)
);

CREATE INDEX IF NOT EXISTS idx_open_token ON report_open(token);
