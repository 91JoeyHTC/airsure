/* AirSure — Module H mock data: 營運決策中心 */

export interface KpiCard {
  lbl: string
  val: string
  unit: string
  cls: string
  delta: string
  deltaUp: boolean
  spark: number[]
}

export const H_KPIS: KpiCard[] = [
  {
    lbl: 'AI 建議',
    val: '64',
    unit: '條',
    cls: 'orange',
    delta: '累計本季',
    deltaUp: true,
    spark: [40, 44, 48, 50, 52, 55, 58, 60, 62, 64],
  },
  {
    lbl: '今日新增',
    val: '8',
    unit: '條',
    cls: 'orange',
    delta: '+3 vs 昨日',
    deltaUp: true,
    spark: [3, 4, 5, 4, 6, 5, 7, 6, 5, 8],
  },
  {
    lbl: '已採納率',
    val: '68.4',
    unit: '%',
    cls: 'green',
    delta: '+4.2 pp',
    deltaUp: true,
    spark: [55, 58, 60, 62, 63, 64, 65, 66, 67, 68.4],
  },
  {
    lbl: '累計挽回',
    val: 'NT$1.24M',
    unit: '',
    cls: 'green',
    delta: '+NT$ 186K 本月',
    deltaUp: true,
    spark: [700, 780, 860, 920, 980, 1040, 1100, 1160, 1200, 1240],
  },
]

export interface Recommendation {
  lv: 'high' | 'mid' | 'lo'
  src: string
  pri: string
  cat: 'revenue' | 'service' | 'brand'
  ttl: string
  why: string
  ev: [string, string][]
  conf: number
  impact: string
  action: string
}

export const H_RECS: Recommendation[] = [
  {
    lv: 'high',
    src: 'A → E (場域 → 會員)',
    pri: '高優先',
    cat: 'revenue',
    ttl: '高級會員王太太場域 PM2.5 持續異常,且訂閱即將到期',
    why: '<b>王淑芬 (M-009203)</b> 的臺中科技園區場域 <b>4 台設備離線 48 小時</b>,且距訂閱到期 <b>27 天</b>。歷史資料顯示類似情境下流失率 <b>達 64%</b>。',
    ev: [['關聯', 'A. 臺中 SH-2841 · B. M-009203 · F. 88K LTV'], ['模型', 'churn-v3.2 (precision 0.87)'], ['訓練樣本', '14 個月 · 8,471 會員']],
    conf: 92,
    impact: '+ NT$ 88K',
    action: '指派客服派工 + 顧問致電',
  },
  {
    lv: 'high',
    src: 'D → C → E (設備 → 服務 → 會員)',
    pri: '高優先',
    cat: 'service',
    ttl: '5 個高級會員場域濾網 18 天逾期,影響保固 + 引發 TVOC 警示',
    why: '<b>5 位高級會員</b> 共 <b>14 台設備</b> 濾網逾期超過 <b>15 天</b>,其中 3 位已出現 TVOC 警示。若 30 天內未更換將影響 12 個月保固條款。',
    ev: [['關聯', 'D. 14 台 · C. 8 張未排程工單 · A. 3 場域警示'], ['模型', 'maintenance-v2.1']],
    conf: 89,
    impact: '+ NT$ 142K · 保固維持',
    action: '批次派工 + 自動配送訂閱推薦',
  },
  {
    lv: 'mid',
    src: 'F → G (營收 → 行銷)',
    pri: '中優先',
    cat: 'revenue',
    ttl: '銀級會員 (60 位) 轉換率高於平均,建議擴大邀請至春季健康月',
    why: '春季健康月第三週,銀級會員邀請轉換率 <b>16.8%</b>,高於前兩週平均 <b>11.2%</b>。建議延長至第四週並擴大族群,預估可新增 <b>80–120 位活躍會員</b>。',
    ev: [['關聯', 'G. 春季健康月 · F. 月經常性收入'], ['樣本', '本月 60 位銀級']],
    conf: 87,
    impact: '+ NT$ 96–144K',
    action: '延長活動並擴大族群',
  },
  {
    lv: 'mid',
    src: 'C → D (服務 → 產品)',
    pri: '中優先',
    cat: 'service',
    ttl: '近 30 天 12 筆工單指向「CO₂ 感測器靈敏度」,建議排程韌體更新',
    why: '12 筆 CO₂ 異常工單集中於 <b>KleenAir Pro 2024 機型 (v3.2 韌體)</b>。韌體 v3.3 已於測試環境驗證可解決靈敏度問題。',
    ev: [['關聯', 'C. 12 張工單 · D. 482 台 v3.2 設備'], ['測試', '驗證通過 (3 週)']],
    conf: 81,
    impact: '預估減少工單 -22/月',
    action: '排程靜默 OTA 升級',
  },
  {
    lv: 'mid',
    src: 'B → E (用戶 → 會員)',
    pri: '中優先',
    cat: 'revenue',
    ttl: '24 位「需喚醒」分群成員,LINE 任務回應率達 37%,建議擴大批次',
    why: '上波 60 位休眠用戶 LINE 喚醒任務 <b>22 位回應</b> (37%),續訂率 13%。建議向 <b>剩餘 74 位需喚醒分群</b> 推送相同任務。',
    ev: [['關聯', 'B. 休眠分群 · G. LINE 任務 · F. 訂閱續約'], ['樣本', '60 位 · 37% 回應']],
    conf: 76,
    impact: '+ NT$ 38K (預估)',
    action: '批次 LINE 推送 · 自動流程',
  },
  {
    lv: 'lo',
    src: 'B → G (用戶 → 行銷)',
    pri: '低優先',
    cat: 'brand',
    ttl: '陳先生連續 2 季健康分數 A 級,適合作為案例分享候選',
    why: '<b>陳俊宏 (M-008412)</b> 健康分數連續 2 季 A 級,且本季已分享證書至 LINE。願意接受訪問可能性 <b>78%</b>。',
    ev: [['關聯', 'B. M-008412 · G. 證書分享紀錄'], ['情緒分析', '正面 91%']],
    conf: 78,
    impact: '品牌口碑 (定性)',
    action: '加入訪談候選名單',
  },
  {
    lv: 'lo',
    src: 'F → D (營收 → 產品)',
    pri: '低優先',
    cat: 'revenue',
    ttl: '舊型 KleenAir Air 1 (124 位用戶) 平均使用 4.2 年,可推升級回購',
    why: '124 位仍使用 <b>2022 出廠 KleenAir Air 1</b>,平均使用 50 個月。新機型 Pro 2026 上市後,3 月內回購率歷史 <b>14%</b>。',
    ev: [['關聯', 'D. 124 台舊機 · F. 平均原價 NT$ 16,800'], ['對照', '2024 同方案 14% 回購']],
    conf: 72,
    impact: '+ NT$ 280–340K (一次性)',
    action: '推送個人化升級方案',
  },
  {
    lv: 'lo',
    src: 'A → C (場域 → 服務)',
    pri: '低優先',
    cat: 'service',
    ttl: '臺中科技園區 4 場域同步離線疑為機房斷網,建議聯合通報維修',
    why: '<b>臺中科技園區 4 個場域</b> 設備在 14 分鐘內同步離線,網路斷線特徵相符。建議與大樓管理單位聯繫排查。',
    ev: [['關聯', 'A. 4 場域 · 11 台設備 · C. 派工成本約 NT$ 3,200'], ['模式', 'network-anomaly-v1']],
    conf: 71,
    impact: '節省派工 NT$ 12K',
    action: '聯繫大樓管理 · 暫緩派工',
  },
]

export const H_CATEGORIES = [
  {
    k: 'member',
    nm: '會員經營建議',
    sub: '對接 B、E 模組',
    ic: 'users',
    accent: '#0E7A66',
    total: 23,
    newCount: 6,
    impact: 'NT$ 4.86M',
    impactL: '挽回 / 升級估值',
    items: [
      { lv: 'high', tag: '優先', t: '高 LTV 休眠名單 — 86 位高級會員 30 天未活躍', d: '建議顧問致電 + 推送個人化續約優惠,預估挽回率 38%。', m: ['86 位', 'NT$ 4.6M 估值', '已預生成名單'], act: '指派顧問致電' },
      { lv: 'mid', tag: '中', t: '新加入分群 → 潛力進取 — 42 位完成首 90 天啟動', d: '推送升級至高級訂閱方案,啟動經驗良好的客群轉換率歷史 22%。', m: ['42 位', '預估 +9 位轉換', 'EDM 預載'], act: '寄送升級邀請' },
      { lv: 'mid', tag: '中', t: '推薦回購主力 — 12 位忠誠主力升格冠軍', d: '邀請加入大使計畫,簽署終身分潤合約,鎖定核心擁護者。', m: ['12 位', 'NT$ 4.2M 累計貢獻', '需經理核准'], act: '寄送大使邀請' },
    ],
  },
  {
    k: 'mkt',
    nm: '行銷推廣建議',
    sub: '對接 G、F 模組',
    ic: 'bullhorn',
    accent: '#4F46E5',
    total: 18,
    newCount: 4,
    impact: 'NT$ 1.32M',
    impactL: '本季增量營收',
    items: [
      { lv: 'high', tag: '優先', t: '春季健康月延長至第四週,擴大至銀級會員', d: '前三週銀級轉換率 16.8%,高於前兩週 11.2%。預估新增 80–120 位活躍會員。', m: ['+80–120 位', '預算 NT$ 18K', 'CTR 22%'], act: '延長活動' },
      { lv: 'mid', tag: '中', t: '健康證書社群分享 — 156 位用戶帶來 1.4× 推薦', d: '推出證書版本 A/B 測試,優化文案與分享圖卡。', m: ['156 位分享者', '預估 +28 推薦', 'A/B 測試 7 天'], act: '建立 A/B 測試' },
      { lv: 'lo', tag: '低', t: '端午檔期早鳥推播 — 預估觸及 220 位', d: '對去年端午下單客群提前 21 天推送送禮包裝 + 早鳥優惠。', m: ['184 位 → 220', 'NT$ 86K 估值', '5/26 啟動'], act: '建立檔期活動' },
    ],
  },
  {
    k: 'svc',
    nm: '客戶服務建議',
    sub: '對接 C、A 模組',
    ic: 'headset',
    accent: '#D97706',
    total: 14,
    newCount: 5,
    impact: '−22 工單/月',
    impactL: '預估減少工單',
    items: [
      { lv: 'high', tag: '優先', t: '臺中科技園區 4 場域同步離線,疑為機房斷網', d: '14 分鐘內 11 台同時離線,網路斷線特徵相符。聯繫大樓管理單位排查,可省派工 NT$ 12K。', m: ['4 場域 · 11 台', '節省 NT$ 12K', '已通知 IT'], act: '通知大樓管理' },
      { lv: 'high', tag: '優先', t: '5 個高級會員濾網逾期 18 天 — 影響保固', d: '14 台設備需排程更換,3 位已出現 TVOC 警示。批次派工 + 自動配送可加速。', m: ['5 高級會員', '14 台設備', 'NT$ 142K 保固'], act: '批次派工' },
      { lv: 'mid', tag: '中', t: 'CO₂ 感測器靈敏度 — 482 台 v3.2 韌體建議升級', d: '12 筆異常工單集中於該機型,v3.3 韌體驗證可解決。OTA 靜默升級。', m: ['482 台', '−22 工單/月', '已通過驗證'], act: '排程 OTA 升級' },
    ],
  },
  {
    k: 'prod',
    nm: '產品發展建議',
    sub: '對接 D、F 模組',
    ic: 'box',
    accent: '#7C3AED',
    total: 9,
    newCount: 2,
    impact: 'NT$ 340K',
    impactL: '一次性升級營收',
    items: [
      { lv: 'mid', tag: '中', t: '舊機 KleenAir Air 1 — 124 位用戶平均 4.2 年', d: '新機 Pro 2026 上市後,歷史 3 個月內回購率 14%。可推送個人化升級方案。', m: ['124 位', '預估 17 位升級', 'NT$ 280–340K'], act: '推送升級方案' },
      { lv: 'mid', tag: '中', t: '濾網 A 型庫存將於 38 天內耗盡', d: '依本月平均消耗 + 春秋兩季高峰,建議提前下單補貨 2,400 組。', m: ['1,840 / 3,000', '38 天耗盡', 'NT$ 88K 採購'], act: '建立補貨單' },
      { lv: 'lo', tag: '低', t: '車載清淨機 (Auto) 銷量持續下滑 — 連續 3 季 −18%', d: '建議檢視通路、定價與宣傳組合,或調整為 B2B (車隊) 銷售模式。', m: ['本季 18 台', '上季 22 台', '需業務檢視'], act: '建立檢討會議' },
    ],
  },
]

export interface AdoptedRec {
  id: string
  ttl: string
  adoptedDate: string
  period: string
  roi: string
  result: string
  resultCls: string
  member: string
}

export const ADOPTED_RECS: AdoptedRec[] = [
  { id: 'H-2026-048', ttl: '高 LTV 休眠名單電訪 · 春季健康月搭配', adoptedDate: '2026/04/28', period: '立即', roi: 'NT$ 184K', result: '成功', resultCls: 'g', member: '王顧問' },
  { id: 'H-2026-041', ttl: '5 位高級會員濾網逾期批次派工', adoptedDate: '2026/04/21', period: '短期', roi: 'NT$ 142K', result: '成功', resultCls: 'g', member: '林技術員' },
  { id: 'H-2026-033', ttl: '銀級春季健康月延長活動', adoptedDate: '2026/04/14', period: '中期', roi: 'NT$ 96K', result: '成功', resultCls: 'g', member: '行銷主管' },
  { id: 'H-2026-029', ttl: 'CO₂ 感測器 OTA 韌體升級', adoptedDate: '2026/04/08', period: '短期', roi: '−22 工單', result: '部分成功', resultCls: 'y', member: '系統' },
  { id: 'H-2026-024', ttl: '休眠分群 LINE 批次喚醒', adoptedDate: '2026/04/01', period: '中期', roi: 'NT$ 38K', result: '部分成功', resultCls: 'y', member: '王顧問' },
]

export interface HistoryRec {
  id: string
  ttl: string
  date: string
  status: '駁回' | '過期' | '延後'
  reason: string
  feedback: string
}

export const HISTORY_RECS: HistoryRec[] = [
  { id: 'H-2026-018', ttl: '新客優惠碼 A/B 測試 · 降低訂閱門檻', date: '2026/03/22', status: '駁回', reason: '預算限制', feedback: '已提供駁回回饋' },
  { id: 'H-2026-015', ttl: '高級會員 VIP 到府保養週', date: '2026/03/18', status: '過期', reason: '優先序調整', feedback: '模型已學習' },
  { id: 'H-2026-012', ttl: '車載機 B2B 車隊方案', date: '2026/03/14', status: '延後', reason: '業務資源不足', feedback: '6 月重新評估' },
  { id: 'H-2026-009', ttl: '開機率 < 30% 自動警示流程', date: '2026/03/08', status: '駁回', reason: '技術整合尚未就緒', feedback: '已提供回饋' },
  { id: 'H-2026-006', ttl: '診所場域 CO₂ 空氣品質報告推廣', date: '2026/03/02', status: '駁回', reason: '客群不符', feedback: '已提供駁回回饋' },
]
