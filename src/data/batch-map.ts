/**
 * 8/1 施工總表 v2 · UI 卡片批次對照
 *
 * - p1 第一批：IoT + SF + 訂單，可立即接
 * - p2 第二批：會員 + ERP + 顧問 + 訂閱，待資料補齊
 * - p3 先放著：廣告 + 推薦 + 點數 + AI，未盤點或需自建
 *
 * 使用方式：在卡片元素加 data-batch="p1|p2|p3" data-source="#6"
 * 顯示開關：body[data-batch-mode="on"] 才會顯示徽章（見 app.css）
 *
 * 對應 commit c8e9bfc · 2026-05-29
 */

export type Batch = 'p1' | 'p2' | 'p3'

export interface BatchTag {
  batch: Batch
  /** 資料源編號(例：#6 IoT、#8 會員、#1 SF) */
  source: string
  /** 8/1 動作 / 備註 */
  note?: string
  /** ⚠ 警示說明（若有） */
  warn?: string
}

/**
 * key 慣例：'<Module>.<Tab>.<卡片名>'
 * 例：'A.設備總覽.七分群分布' / 'Dashboard.KPI'
 *
 * 元件端用 BATCH_MAP['A.設備總覽.七分群分布'] 查；
 * 為了 .tsx 簡潔，也可直接寫 data-batch="p1" data-source="#6"。
 */
export const BATCH_MAP: Record<string, BatchTag> = {
  // ─── Dashboard 首頁總覽 ───
  'Dashboard.KPI': {
    batch: 'p2',
    source: '#8 會員',
    note: '4 卡全來自會員，第一批接不了',
    warn: '⚠ 改放營收/IoT 組或標示意',
  },
  'Dashboard.今日聚焦時間帶': { batch: 'p2', source: '#1 SF + #7 工單', note: '排程資料待確認，可先靜態' },
  'Dashboard.場域空品即時表': { batch: 'p1', source: '#6 IoT', note: '接 IoT，第一批核心' },
  'Dashboard.需主動聯繫名單': { batch: 'p2', source: '#8 + #6', note: 'IoT 那半可先；會員第二批' },
  'Dashboard.八大模組總覽': { batch: 'p1', source: '— 純導覽', note: '純連結，直接可用' },
  'Dashboard.AI 建議橫幅': { batch: 'p3', source: '跨模組 + AI', note: '先靜態文案，當 H 預告' },

  // ─── Module A 居家空氣場域 ───
  'A.KPI': { batch: 'p1', source: '#6 IoT', note: '接 IoT' },
  'A.設備總覽.篩選列': { batch: 'p1', source: '#6 IoT', note: '機型/電源/使用模式需 IoT 裝置屬性' },
  'A.設備總覽.母體來源': { batch: 'p1', source: '#6 IoT + #1 SF', note: '接 IoT + SF' },
  'A.設備總覽.空品濕度分布': { batch: 'p1', source: '#6 IoT', note: '接 IoT + 套 v2 級距' },
  'A.設備總覽.七分群分布': { batch: 'p1', source: '#6 IoT + v2 P×H 分群', note: '接 IoT + 套 v2 分群規則' },
  'A.設備總覽.類型流動月遷移': { batch: 'p1', source: '#6 IoT + v2 P×H 分群', note: '需每週分群快照' },
  'A.設備總覽.使用強度分布': { batch: 'p1', source: '#6 IoT', note: '接 IoT 開機時數' },
  'A.設備總覽.電源狀態分布': { batch: 'p1', source: '#6 IoT', note: '接 IoT 運轉狀態(含水滿停機)' },
  'A.設備總覽.運轉模式分布': { batch: 'p1', source: '#6 IoT', note: '接 IoT 模式時數' },
  'A.設備總覽.風速分布': { batch: 'p2', source: '#6 IoT', note: '母體尚無 fanSpeed 欄位,現為中台快照示範值' },
  'A.設備總覽.耗材壽命分布': { batch: 'p2', source: '#3 ERP + #6 IoT', note: '耗材殘量需 ERP 進銷存' },
  'A.設備總覽.濾網更換週期': { batch: 'p2', source: '#3 ERP + #6 IoT', note: '容量時數需 ERP 料號規格' },
  'A.設備總覽.處理時機': { batch: 'p2', source: '#3 ERP + #6 IoT', note: '派工行動需工單系統' },
  'A.設備總覽.當前警報': { batch: 'p1', source: '#6 IoT', note: '接 IoT 警報狀態' },
  'A.設備總覽.期間警報': { batch: 'p1', source: '#6 IoT', note: '需警報歷史事件表' },
  'A.設備總覽.警報狀況分析': { batch: 'p2', source: '#6 IoT', note: '母體尚無警報碼別維度,現為中台快照示範值' },
  'A.設備總覽.區域熱圖': { batch: 'p1', source: '#6 IoT', note: '接 IoT' },
  'A.設備總覽.場域明細表': { batch: 'p1', source: '#6 IoT + #1 SF', note: '接 IoT + SF' },
  'A.族群分析.族群卡': { batch: 'p2', source: '#6 IoT + #1 SF + 寄發系統', note: 'CTA/服務跟進成效待接入' },
  'A.族群分析.北中南佔比': { batch: 'p1', source: '#6 IoT + #1 SF', note: '接 IoT + SF 地址' },
  'A.族群分析.使用強度': { batch: 'p1', source: '#6 IoT', note: '接 IoT 開機時數' },
  'A.族群分析.使用模式': { batch: 'p1', source: '#6 IoT', note: '接 IoT 模式時數' },
  'A.族群分析.濾網更換週期': { batch: 'p2', source: '#3 ERP + #6 IoT', note: '容量時數需 ERP 料號規格' },
  'A.族群分析.優化方向': { batch: 'p1', source: '#6 IoT + v2 P×H 分群', note: '由矩陣反推,無額外資料源' },
  'A.場域清單.報告產製': { batch: 'p2', source: '#6 IoT + #1 SF + 報告引擎', note: '九態/輪廓/寄發需報告產出引擎回填' },
  'A.個人.場域詳情': { batch: 'p2', source: '#6 IoT + #3 ERP', note: '耗材/水箱需 ERP，延後' },
  'A.個人.耗材庫存': { batch: 'p2', source: '#3 ERP', note: 'ERP 進銷存待確認' },
  'A.個人.水箱管理': { batch: 'p2', source: '#3 ERP', note: 'ERP 進銷存待確認' },
  'A.upsell 機會池': { batch: 'p2', source: '#6 + #2 訂單', note: 'upsell 邏輯第二批' },

  // ─── Module B 用戶 360 ───
  'B.KPI': {
    batch: 'p2',
    source: '#8 會員 + #2 訂單',
    note: 'LTV 可由訂單算，活躍/流失待會員',
    warn: '⚠ 同首頁問題',
  },
  'B.整體.生命週期分布': { batch: 'p2', source: '#8 會員', note: '會員資料待接' },
  'B.整體.新增vs流失趨勢': { batch: 'p2', source: '#8 會員', note: '會員資料待接' },
  'B.分群.價值象限散點': { batch: 'p1', source: '#1 SF + #2 訂單', note: '接 SF + 訂單可算' },
  'B.分群.生命週期': { batch: 'p2', source: '#8 + #6', note: '會員分群待接' },
  'B.分群.行動優先級': { batch: 'p2', source: '#8 + #6', note: '會員分群待接' },
  'B.分群.使用情境': { batch: 'p2', source: '#8 + #6', note: '會員分群待接' },
  'B.分群.設備結構': { batch: 'p2', source: '#8 + #6', note: '會員分群待接' },
  'B.分群.客戶標籤': { batch: 'p1', source: '#1 SF 標籤', note: 'SF 標籤可先做基礎' },
  'B.分群.組合分群': { batch: 'p1', source: '#1 SF 標籤', note: 'SF 標籤可先做基礎' },
  'B.個人.價值與風險': { batch: 'p1', source: '#1 SF + #2 訂單', note: '主管視圖，第一批做' },
  'B.個人.觸及與商機': { batch: 'p3', source: '#12 廣告 + #14 活動', note: '行銷頁，廣告未接' },
  'B.個人.聯絡與歷程': { batch: 'p2', source: '#7 客訴 + #5 顧問', note: '顧問日誌待電子化' },
  'B.個人.設備與到府': { batch: 'p2', source: '#6 + #5 顧問', note: '顧問頁，IoT 那半可先' },
  'B.個人.居家與畫像': { batch: 'p1', source: '#6 + #1 SF', note: '接 IoT + SF' },
  'B.個人.訂閱積點帳務': { batch: 'p3', source: '#16 訂閱 + 點數系統', note: '積點需自建' },
  'B.個人.跨模組信號': { batch: 'p2', source: '跨模組', note: '待各模組接齊' },

  // ─── Module C 服務管理 ───
  'C.KPI': { batch: 'p1', source: '#7 工單 + #1 SF', note: '接 SF 工單' },
  'C.看板': { batch: 'p1', source: '#7 工單', note: '接 SF' },
  'C.清單': { batch: 'p1', source: '#7 工單', note: '接 SF' },
  'C.SLA達成': { batch: 'p1', source: '#7 工單', note: '接 SF' },
  'C.IoT主動服務': { batch: 'p1', source: '#6 IoT', note: '接 IoT 觸發' },
  'C.顧問KPI': { batch: 'p2', source: '#18 KPI + #5 顧問', note: 'KPI 口徑+顧問日誌' },
  'C.客服KPI': { batch: 'p2', source: '#18 KPI + #5 顧問', note: 'KPI 口徑+顧問日誌' },
  'C.技術人員': { batch: 'p2', source: '#18 KPI', note: '人員資料待確認' },
  'C.問題分類熱點': { batch: 'p1', source: '#7 客訴', note: '接 SF 客訴分類' },

  // ─── Module D 產品管理 ───
  'D.KPI': { batch: 'p1', source: '#2 + #6 + #3', note: 'SKU 出貨可先；良率待 ERP' },
  'D.產品目錄': { batch: 'p1', source: '#2 訂單', note: '接 SF 訂單' },
  'D.裝置艦隊': { batch: 'p1', source: '#6 IoT', note: '接 IoT' },
  'D.耗材庫存': { batch: 'p2', source: '#3 ERP', note: 'ERP API 待確認' },
  'D.品質與良率': { batch: 'p2', source: '#3 ERP + #17 維修', note: '品質資料待接' },
  'D.軟體版本': { batch: 'p2', source: '#6 IoT', note: '推送功能第二批' },

  // ─── Module E 會員營運 ───
  'E.日常通道': { batch: 'p2', source: '#11 推播 + #8', note: 'LINE 可先；EDM 待確認' },
  'E.總覽.Sankey': { batch: 'p2', source: '#8 會員', note: '會員資料待接' },
  'E.主動聯繫': { batch: 'p2', source: '#1 + #6 + #16', note: '核心混合源，訂閱待接' },
  'E.流失預測': { batch: 'p3', source: '#8 + AI', note: '需 AI 模型，先放著' },
  'E.分群管理': { batch: 'p2', source: '#8 會員', note: '會員分群待接' },
  'E.積點管理': { batch: 'p3', source: '點數系統(自建)', note: 'SF 不易擴充，需自建' },
  'E.母體 8420 / 挽回 840K': {
    batch: 'p3',
    source: 'mock 固定值',
    note: '接真資料後全變',
    warn: '⚠ 勿當真',
  },

  // ─── Module F 營收分析 ───
  'F.KPI': { batch: 'p1', source: '#2 + #16', note: '營收可先；ARR/續約待訂閱' },
  'F.客戶類型': { batch: 'p1', source: '#1 + #2', note: '接 SF + 訂單' },
  'F.訂閱結構': { batch: 'p2', source: '#16 訂閱', note: '訂閱續訂資料待接' },
  'F.通路與客群': { batch: 'p2', source: '#2 + #15 通路', note: '外部通路待確認' },
  'F.Top客戶': { batch: 'p1', source: '#1 + #2', note: '接 SF + 訂單' },
  'F.目標達成': { batch: 'p1', source: '#2 + 目標設定', note: '營收目標可先' },
  'F.推薦轉換漏斗': { batch: 'p2', source: '#14 推薦活動', note: '活動資料待盤點' },

  // ─── Module G 行銷與健康證書 ───
  'G.KPI': { batch: 'p3', source: '#14 + #12', note: '多數依賴未接資料' },
  'G.健康證書': { batch: 'p2', source: '#1 + #6', note: '證書可由 IoT + SF 生成' },
  'G.推薦計劃': { batch: 'p2', source: '#14 推薦', note: '推薦資料待盤點' },
  'G.活動管理': { batch: 'p2', source: '#14 + #11', note: '活動工具待盤點' },
  'G.數據缺口': { batch: 'p3', source: '#12 廣告', note: '本身就是缺口看板，保留' },

  // ─── Module H 營運決策中心 ───
  'H.KPI': { batch: 'p3', source: '跨模組 + AI', note: 'AI 階段' },
  'H.AI 摘要 / 聊天': { batch: 'p3', source: '跨模組 + LLM', note: '需資料齊+AI' },
  'H.建議卡': { batch: 'p3', source: '跨模組推理', note: 'AI 階段' },
  'H.已採納 / 駁回': { batch: 'p3', source: 'AI 回饋', note: 'AI 階段' },
}

/** 批次說明（給 UI tooltip 或 legend 用） */
export const BATCH_LABEL: Record<Batch, { short: string; full: string; color: string }> = {
  p1: { short: 'P1', full: '第一批 · 可立即接', color: 'var(--as-success)' },
  p2: { short: 'P2', full: '第二批 · 待資料補齊', color: 'var(--as-warning)' },
  p3: { short: 'P3', full: '先放著 · 未盤點/需自建', color: 'var(--as-mute)' },
}

/** 統計用 */
export const BATCH_STATS = {
  p1: 24,
  p2: 26,
  p3: 12,
  total: 62,
}
