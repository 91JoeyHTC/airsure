/* AirSure — Module B mock data: 用戶 360° 視圖 */

export interface CustomerDevice {
  id: string
  site: string
  loc: string
  mdl: string
  fw: string
  hr: number
  fil: number
  st: 'g' | 'y' | 'r'
}

export const CUSTOMER_DEVICES: CustomerDevice[] = [
  { id: 'AC-PRO-1101', site: '臺北信義居家', loc: '客廳', mdl: 'AirSure Pro 500', fw: '2.4.1', hr: 2840, fil: 86, st: 'g' },
  { id: 'AC-PRO-1102', site: '臺北信義居家', loc: '主臥', mdl: 'AirSure Pro 500', fw: '2.4.1', hr: 1920, fil: 72, st: 'g' },
  { id: 'AC-LITE-1103', site: '臺北信義居家', loc: '書房', mdl: 'AirSure Lite', fw: '2.3.8', hr: 1240, fil: 91, st: 'g' },
  { id: 'AC-LITE-1104', site: '臺北信義居家', loc: '小孩房', mdl: 'AirSure Lite', fw: '2.3.8', hr: 980, fil: 88, st: 'g' },
  { id: 'AC-PRO-3344', site: '大安辦公室', loc: '會議室', mdl: 'AirSure Pro 300', fw: '2.4.1', hr: 3120, fil: 24, st: 'y' },
  { id: 'AC-PRO-3345', site: '大安辦公室', loc: '開放區', mdl: 'AirSure Pro 300', fw: '2.4.1', hr: 3210, fil: 18, st: 'y' },
  { id: 'AC-LITE-7821', site: '陽明山度假', loc: '客廳', mdl: 'AirSure Lite', fw: '2.3.6', hr: 412, fil: 96, st: 'r' },
]

export interface ServiceRecord {
  d: string
  tk: string
  tt: string
  st: 'open' | 'done'
  ag: string
  cat: string
}

export const SERVICE_RECORDS: ServiceRecord[] = [
  { d: '2026-05-10', tk: 'T-22791', tt: '陽明山場域 PM2.5 連續超標自動工單', st: 'open', ag: 'AI 觸發', cat: '主動聯繫' },
  { d: '2026-05-05', tk: 'T-22770', tt: '濾網更換 (大安辦公室 AC-PRO-3344)', st: 'done', ag: '林晉宇', cat: '到府服務' },
  { d: '2026-04-22', tk: 'T-22631', tt: '韌體升級派送 2.4.1 (全部 9 台)', st: 'done', ag: '系統', cat: '韌體' },
  { d: '2026-04-15', tk: 'T-22589', tt: '健康諮詢 — 顧問陳怡君', st: 'done', ag: '陳怡君', cat: '諮詢' },
  { d: '2026-04-02', tk: 'T-22441', tt: 'App 配對失敗 (AC-LITE-7821)', st: 'done', ag: '王雅琳', cat: '技術支援' },
  { d: '2026-03-18', tk: 'T-22288', tt: '到府保養 · 高級會員 (信義居家)', st: 'done', ag: '王雅琳', cat: '到府服務' },
  { d: '2026-02-04', tk: 'T-22041', tt: 'CO₂ 感測器校正', st: 'done', ag: '林晉宇', cat: '校正' },
]

export interface FinanceRecord {
  d: string
  ord: string
  it: string
  amt: number
  st: 'paid' | 'pending'
  pm: string
}

export const FINANCE_RECORDS: FinanceRecord[] = [
  { d: '2025-11-04', ord: 'ORD-94821', it: '高級訂閱 (年方案)', amt: 88800, st: 'paid', pm: '信用卡 (****4421)' },
  { d: '2025-09-12', ord: 'ORD-93120', it: '濾網 6 入組', amt: 7200, st: 'paid', pm: '信用卡 (****4421)' },
  { d: '2025-06-22', ord: 'ORD-90415', it: 'AirSure Pro 500 × 2', amt: 142000, st: 'paid', pm: '銀行轉帳' },
  { d: '2025-03-04', ord: 'ORD-87011', it: '濾網 4 入組', amt: 4800, st: 'paid', pm: '信用卡 (****4421)' },
  { d: '2024-11-04', ord: 'ORD-82281', it: '高級訂閱 (年方案)', amt: 88800, st: 'paid', pm: '信用卡 (****8210)' },
  { d: '2024-08-15', ord: 'ORD-80012', it: 'AirSure Lite × 2 + 安裝', amt: 38400, st: 'paid', pm: '信用卡 (****8210)' },
]

export interface BOverviewJumpCard {
  ax: string
  t: string
  s: string
  n: string
  hi: { lbl: string; pct: number; n: number }
  act: string
  groups: Array<{ c: string; p: number }>
  kpi: string
  kpiL: string
}

export const B_OVERVIEW_JUMP_CARDS: BOverviewJumpCard[] = [
  {
    ax: '需求', t: '需求分群', s: '空品挑戰 × 居住類型', n: '8,628',
    hi: { lbl: '一般居家小家庭', pct: 48.9, n: 4218 },
    act: '5 群 · 主流為居家',
    groups: [
      { c: '#DC2626', p: 21.4 },
      { c: '#4F46E5', p: 48.9 },
      { c: '#0E7A66', p: 14.9 },
      { c: '#D97706', p: 7.2 },
      { c: '#9CA3AF', p: 7.6 },
    ],
    kpi: '客單 NT$ 38K', kpiL: '平均',
  },
  {
    ax: '消費力', t: '消費力分群', s: 'RFM 五分位 · LTV 分布', n: '8,628',
    hi: { lbl: 'P95 Champions', pct: 5.0, n: 432 },
    act: 'Top 5% 貢獻 38% ARR',
    groups: [
      { c: '#0E7A66', p: 5 },
      { c: '#16A085', p: 15 },
      { c: '#4F46E5', p: 25 },
      { c: '#EAB308', p: 25 },
      { c: '#DC2626', p: 30 },
    ],
    kpi: 'NT$ 480K+', kpiL: 'Champion LTV',
  },
  {
    ax: '依賴度', t: '服務依賴度', s: '服務頻次 + 顧問互動', n: '8,628',
    hi: { lbl: '中依賴 (主流)', pct: 49.4, n: 4264 },
    act: '高依賴 = 訂閱升級機會',
    groups: [
      { c: '#0E7A66', p: 24.7 },
      { c: '#4F46E5', p: 49.4 },
      { c: '#EAB308', p: 25.9 },
    ],
    kpi: '2.4×', kpiL: '高依賴 LTV 倍率',
  },
  {
    ax: '滿意度', t: '滿意度分群', s: 'NPS · 推薦/中立/貶損', n: '8,628',
    hi: { lbl: '推薦者 9–10', pct: 49.4, n: 4260 },
    act: 'NPS +42 · 行業均 +28',
    groups: [
      { c: '#16A34A', p: 49.4 },
      { c: '#EAB308', p: 29.4 },
      { c: '#DC2626', p: 6.8 },
      { c: '#9CA3AF', p: 14.4 },
    ],
    kpi: '+42', kpiL: 'NPS 分數',
  },
]

export interface BSegmentGroup {
  lbl: string
  n: number
  pct: number
  traits: string
  action: string
  c: string
}

export interface BSegment {
  title: string
  sub: string
  axis: string
  groups: BSegmentGroup[]
}

export const SEGMENTS_B: BSegment[] = [
  {
    title: '需求分群', sub: '空品挑戰 × 居住類型 · 影響產品推薦', axis: '需求',
    groups: [
      { lbl: '高空污 · 都會家庭', n: 1842, pct: 21.4, traits: '臺中/新北重點區 · 設備滿載', action: '推薦多機部署 + 高效濾網', c: 'var(--as-danger)' },
      { lbl: '一般 · 居家小家庭', n: 4218, pct: 48.9, traits: '主流客群 · 1–2 台', action: '常規服務 + 季度健康證書', c: '#4F46E5' },
      { lbl: '辦公 · 中小企業', n: 1284, pct: 14.9, traits: '需多機 · 高峰時段密集', action: 'B2B 方案 + 韌體統一管理', c: '#0E7A66' },
      { lbl: '醫療 · 機構', n: 624, pct: 7.2, traits: '高合規需求 · 24h 運轉', action: 'Pro 機型 + SLA 保證', c: '#D97706' },
      { lbl: '其他', n: 660, pct: 7.6, traits: '商業 / 教育 / 公共空間', action: '客製方案', c: 'var(--as-mute-2)' },
    ],
  },
  {
    title: '消費力分群 (RFM 五分位)', sub: 'Recency × Frequency × Monetary', axis: '消費力',
    groups: [
      { lbl: 'P95 高價值 (Champions)', n: 432, pct: 5.0, traits: '近期 + 高頻 + 高額 · LTV NT$ 480K+', action: 'VIP 顧問 + 推薦獎勵升級', c: '#0E7A66' },
      { lbl: 'P75–95 忠誠者', n: 1294, pct: 15.0, traits: '穩定貢獻 · LTV NT$ 180–480K', action: '保持參與 + 提早續約', c: '#16A085' },
      { lbl: 'P50–75 主流', n: 2156, pct: 25.0, traits: '一般消費力 · LTV NT$ 80–180K', action: '推升頻次 / 加購', c: '#4F46E5' },
      { lbl: 'P25–50 低活躍', n: 2156, pct: 25.0, traits: '消費距今久 · LTV < NT$ 80K', action: '喚醒任務 + 優惠回購', c: 'var(--as-warning)' },
      { lbl: '後 25% 流失邊緣', n: 2590, pct: 30.0, traits: '180 天無行為', action: '客服優先聯繫', c: 'var(--as-danger)' },
    ],
  },
  {
    title: '服務依賴度分群', sub: '服務頻次 + 顧問互動深度', axis: '依賴度',
    groups: [
      { lbl: '高依賴', n: 2128, pct: 24.7, traits: '每季 2+ 服務 · 顧問熟悉', action: '訂閱升級 + 自動配送', c: '#0E7A66' },
      { lbl: '中依賴', n: 4264, pct: 49.4, traits: '半年 1 服務 · 主流模式', action: '維持基本服務', c: '#4F46E5' },
      { lbl: '低依賴', n: 2236, pct: 25.9, traits: '一年 < 1 服務 · DIY 為主', action: '推送線上工具 + 提醒', c: 'var(--as-warning)' },
    ],
  },
  {
    title: '滿意度分群 (NPS)', sub: '推薦意願 0–10', axis: '滿意度',
    groups: [
      { lbl: '推薦者 9–10', n: 4260, pct: 49.4, traits: '主動分享證書 · 高 K-factor', action: '加入推薦獎勵計畫 (G 模組)', c: 'var(--as-success)' },
      { lbl: '中立 7–8', n: 2536, pct: 29.4, traits: '滿意但不會主動推薦', action: '提升個人化體驗', c: 'var(--as-warning)' },
      { lbl: '貶損者 0–6', n: 584, pct: 6.8, traits: '可能流失 · 客訴未結', action: '客服 24h 內聯繫', c: 'var(--as-danger)' },
      { lbl: '未評分', n: 1248, pct: 14.4, traits: '潛在客戶或新註冊', action: '邀請填寫', c: 'var(--as-mute-2)' },
    ],
  },
]

export interface BLifecycle {
  k: string
  n: number
  pct: number
  c: string
  sub: string
}

export const B_LIFECYCLE: BLifecycle[] = [
  { k: '活躍', n: 6420, pct: 75.4, c: 'var(--as-success)', sub: '90 天內有行為' },
  { k: '沉睡', n: 1284, pct: 15.1, c: 'var(--as-warning)', sub: '90–180 天無行為' },
  { k: '流失預警', n: 612, pct: 7.2, c: 'var(--as-danger)', sub: '180 天 + 風險 > 70' },
  { k: '已流失', n: 192, pct: 2.3, c: 'var(--as-mute-2)', sub: '> 180 天' },
]

export const B_MONTHS_12 = ['06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05']
export const B_NEW_JOIN = [186, 198, 224, 248, 268, 312, 286, 254, 278, 308, 326, 342]
export const B_CHURN = [88, 76, 92, 64, 58, 72, 96, 84, 68, 62, 56, 48]

// ── 個人層示範客戶:王敬梅 (C201000272) ───────────────────────────────────────
// 依「克立淨_客戶三角色彙整_欄位規格.md」設計,一份底層資料,三角色視圖共用
export const WANG_PROFILE = {
  // §0 共用識別卡
  identity: {
    name: '王敬梅',
    cid: 'C201000272',
    gender: '女',
    birth: '1984-12-01',
    age: 41,
    tier: 'E:蛋黃克人',
    segment: 'C 群',
    segLv: '1 級',
    segDelta: 0,        // 升降級 0
    advisor: '鄭偉仁',
    region: '北一區',
    city: '台北市信義區',
    accountYears: 3,
    accountFrom: '2023-04-15',
    nextMaintenance: '2027/05',
    oneLine: '多機型老客戶、高敏家庭、保養頻率偏低、會殺價但認同品牌',
    completeness: 62,   // 資料完整度分數 %
    dhi: { score: 78, grade: 'B' },  // 保留 DHI 健康指數
  },

  // §0b 消費 / 服務數字（公式合計）
  finance: {
    salesAmt: 92800,            // 銷貨單(機器)金額
    repairAmt: 28136,           // 累積維修完成單金額(耗材/濾網)
    importedAmt: 8000,          // 匯入累計金額
    totalAmt: 128936,           // 公式合計
    services: 9,                // 累積服務次數
    servicesImported: 6,        // 累計服務次數(匯入)
    servicesTotal: 15,          // 公式合計
    avgUnit: 8596,              // 平均客單價 = 總額 / 服務總計
    machineCount: 4,
  },

  // §0b 持有機型 + 對應濾網規格(顧問視圖§3.1)
  devices: [
    { id: 'A71-3344',  model: 'A71',  location: '客廳',   fw: '3.2.1', hr: 6420, fil: 18, st: 'y', filterSpec: '前置濾網×1 / ECF×1 / HEPA H13×1' },
    { id: 'A51-3402',  model: 'A51',  location: '主臥',   fw: '3.2.1', hr: 4180, fil: 32, st: 'y', filterSpec: '前置濾網×1 / ECF×1 / HEPA H13×1' },
    { id: 'A81-3501',  model: 'A81',  location: '小孩房', fw: '3.2.1', hr: 5280, fil: 14, st: 'r', filterSpec: '前置濾網×1 / ECF×2 / HEPA H13×1' },
    { id: 'F501-3812', model: 'F501', location: '書房',   fw: '2.8.4', hr: 2240, fil: 64, st: 'g', filterSpec: '前置濾網×1 / HEPA H13×1' },
  ],

  // §3.2 耗材盤點 — 全部 0,需到府確認
  consumables: [
    { item: '前置濾網', a71: 0, a51: 0, a81: 0, f501: 0, total: 0, flag: '待補' },
    { item: 'ECF 濾網', a71: 0, a51: 0, a81: 0, f501: '—', total: 0, flag: '待補' },
    { item: 'HEPA H13', a71: 0, a51: 0, a81: 0, f501: 0, total: 0, flag: '待補' },
  ],

  // §3.3 已知症狀 + 預判
  symptoms: [
    { tag: '電漿積碳', count: 3, desc: '近三次定保皆發現,客廳 A71 最嚴重' },
    { tag: '結晶多',   count: 2, desc: '主臥 A51 出風口附近,推估與烹飪用油有關' },
    { tag: '碳化剝落', count: 1, desc: '小孩房 A81 ECF 層,單次但顯著' },
  ],
  nextVisitPrediction: '本次預判:全機深度清潔 + ECF 全換 + 客廳 A71 主機板巡檢',

  // §3.4 客戶溝通眉角
  communicationTips: [
    { k: '議價策略', v: '舊客優惠較易成交,可先報全價再開折' },
    { k: '切入論述', v: '高敏家庭可帶空氣品質訴求,小孩房空品最被在意' },
    { k: '放置建議', v: '客廳 A71 已調至空氣循環死角,主臥 A51 距床頭 1m 內請避免' },
  ],

  // §3.5 金流備註
  payment: { pref: '線下刷卡 · 一次付清', note: '不偏好分期、不使用 LinePay' },

  // §2.1 聯絡資訊
  contact: {
    phone: '0912-***-272',
    email: null,           // 待補
    line: null,            // 待補
    timePref: '平日 19:00 後 / 週末白天',
    channelPref: '電話為主,簡訊備援',
  },

  // §2.2 最近互動
  recentActivity: {
    lastDispatch: '2026-04-22',
    lastPurchase: '2026-04-22',
    lastType: '到府定保 + 濾網更換',
    lastAgent: '鄭偉仁',
  },

  // §2.3 服務歷程摘要
  serviceSummary: [
    { type: '派工單',     total: 9, closed: 8, open: 1 },
    { type: '定保維修單', total: 4, closed: 4, open: 0 },
    { type: '維修完成單', total: 2, closed: 2, open: 0 },
  ],

  // §2.4 Memo 重點濃縮
  memo: {
    physique: ['過敏體質(全家三人皆有)', '怕雷會關冷氣', '對氣味敏感'],
    history:  ['曾協助整套換濾網並給優惠', '兩年前曾客訴 A81 噪音,當場降價處理', '主動詢問過 AirCare 報告'],
  },

  // §2.5 待辦/提醒
  todos: [
    { pri: 'r', label: '下次定保倒數 11 個月(2027/05)', sub: '建議提前 60 天回訪' },
    { pri: 'r', label: '小孩房 A81 濾網殘量 14% · 應主動推送更換', sub: '預估收益 NT$2,800' },
    { pri: 'y', label: '客廳 A71 濾網殘量 18% · 一個月內到期', sub: '可一併處理省一趟到府' },
    { pri: 'y', label: '待補資料:Email / Line ID / 居住成員 / 職業', sub: '影響分群精準度' },
  ],

  // §1.2 價值象限定位
  valueQuadrant: {
    spendPct: 72,         // 消費金額在族群百分位
    interactPct: 28,      // 互動頻率百分位
    label: '高價值待喚醒型',
    desc: '高消費 × 低互動 — 過去 12 個月僅 2 次服務但累計超過 NT$70K',
  },

  // §1.3 流失 / 風險訊號
  risks: [
    { lv: 'r', tag: '濾網更換偏低',     desc: '近 24 個月僅換 1 次,3 台殘量已 < 35%' },
    { lv: 'r', tag: '單一聯絡管道',     desc: '僅電話,無 Email/Line,通知到達率 < 60%' },
    { lv: 'y', tag: '長期殺價',         desc: '近 3 次成交皆要求折扣 · 毛利率敏感' },
    { lv: 'y', tag: '保養頻率偏低',     desc: '建議 6 個月/次,實際 11 個月/次' },
  ],

  // §1.4 成長機會
  opportunities: [
    { tag: '訂閱制 / 耗材定期配送', val: '+NT$ 24,000 / 年', desc: '4 台機型 × 標準耗材週期,訂閱可一鍵綁定' },
    { tag: 'AirCare 報告(高敏家庭)', val: '+NT$ 6,800 / 季', desc: '高敏體質 + 多機型,適配度 95%' },
    { tag: '跨空間覆蓋擴機',         val: '+NT$ 38,000 / 機', desc: '目前覆蓋 4 空間,書房可加 A51' },
  ],

  // §0b 居家環境
  homeEnv: {
    type: '電梯華廈',
    space: '4 房 2 廳 / 約 38 坪',
    members: ['夫妻 2 人', '國小子女 1 人'],
    elevator: '有',
    ours: 'A71, A51, A81, F501 各 1',
    others: 'B 牌 1 台(客房,未連網)',
    cleanliness: '中等 · 偶有外傭協助',
    address: '台北市信義區（詳細待補）',
  },

  // §0b 困擾標籤
  troubles: {
    member:  ['全家過敏', '小孩夜咳'],
    outdoor: ['基隆河沿岸春霾', '附近重劃區工地揚塵'],
    indoor:  ['烹飪油煙', '寵物毛屑(貓 1)'],
    behavior:['夜間窗戶緊閉', '冷氣依賴度高'],
  },

  // §0b 用戶個人標籤
  personalTags: [
    { k: '鐵粉潛力',     v: '中高',     cls: 'g' },
    { k: '濾網更換習慣', v: '偏低',     cls: 'r' },
    { k: '經濟敏感度',   v: '中',       cls: 'y' },
    { k: '開機時數',     v: '高(全天)', cls: 'g' },
    { k: '重視度',       v: '高',       cls: 'g' },
    { k: '個性',         v: '理性 · 重 CP', cls: 'b' },
    { k: '喜好',         v: '安靜 · 不愛換 model', cls: 'b' },
  ],

  // §0b 得知克立淨 / 商機來源
  acquisition: {
    channel: '朋友推薦',
    source: '台北家具展體驗',
    referrer: '鄰居 王太太(C20100xxx 待補)',
  },

  // §4 資料完整度檢核
  dataGaps: [
    { field: 'Email',             impact: '通知 / 行銷接觸管道' },
    { field: 'Line ID',           impact: '通知 / 行銷接觸管道' },
    { field: '職業',              impact: '主管分群' },
    { field: '居住成員(詳)',      impact: '顧問備料 / 訴求設計' },
    { field: '住家地址(詳)',      impact: '顧問備料' },
    { field: '聯繫偏好(時段細部)', impact: '客服接觸效率' },
    { field: '商機歸因(推薦人 ID)', impact: '行銷歸因' },
    { field: '購買渠道習慣',      impact: '行銷分群' },
    { field: '耗材實際盤點數',    impact: '顧問備料' },
  ],

  // 送修明細 §0b
  repairOrders: [
    { ord: 'FO-00009952', d: '2026-04-22', amt: 8200, items: 'A71 主板巡檢 + HEPA × 1 + ECF × 1', note: '舊客優惠 −8%' },
    { ord: 'FO-00008811', d: '2025-09-18', amt: 6400, items: 'A81 ECF × 2 + 前置 × 1',           note: '結晶清潔' },
    { ord: 'FO-00007724', d: '2025-03-04', amt: 5200, items: 'A51 HEPA × 1 + 校正',               note: '—' },
  ],

  // §2.4 Memo 互動筆記(時間軸用)
  memoTimeline: [
    { d: '2026-04-22', who: '鄭偉仁', topic: '到府定保', note: '客廳 A71 電漿積碳明顯,建議考慮主板巡檢;客戶要求 −8% 後成交' },
    { d: '2026-02-14', who: '鄭偉仁', topic: '電話回訪', note: '客戶詢問 AirCare 報告,先寄資料,客戶表示想等小孩過敏期再評估' },
    { d: '2025-09-18', who: '鄭偉仁', topic: '到府維修', note: 'A81 ECF 結晶嚴重,客戶提及春季過敏發作,推薦升級 ECF×2' },
    { d: '2025-03-04', who: '客服 廖小姐', topic: '客訴處理', note: 'A81 噪音問題,改派顧問到府當場降價處理,客戶滿意' },
  ],
}
