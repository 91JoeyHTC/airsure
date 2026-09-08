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
