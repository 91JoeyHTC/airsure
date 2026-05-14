/* AirSure 數據中台 — Module D (產品管理) mock data */

// ── Product catalog ───────────────────────────────────────────────────────────
export interface Product {
  id: string
  nm: string
  cat: string
  px: number
  stk: number
  sold: number
  status: 'live' | 'oos' | 'soon'
  clr: string
}

export const PRODUCTS: Product[] = [
  { id: 'CS101MAX-W', nm: 'CS101MAX-慕白',    cat: '空氣清淨機旗艦',  px: 78000, stk: 124, sold: 2840, status: 'live', clr: '#0E7A66' },
  { id: 'A81-PRO',   nm: 'A81',               cat: '空氣清淨機專業',  px: 48000, stk: 86,  sold: 3920, status: 'live', clr: '#1F8A5B' },
  { id: 'PAPABIN-V1',nm: 'PaPaBinV1',         cat: '廚餘機',          px: 32800, stk: 204, sold: 1480, status: 'live', clr: '#4F46E5' },
  { id: 'CS100-W',   nm: 'CS100-慕白',        cat: '空氣清淨機入門',  px: 18800, stk: 312, sold: 8410, status: 'live', clr: '#16A085' },
  { id: 'CS101P-W',  nm: 'CS101PLUS-慕白',    cat: '空氣清淨機耗材',  px: 1200,  stk: 1840,sold: 28412,status: 'live', clr: '#7C3AED' },
  { id: 'HEPA-STD',  nm: 'HEPA 濾網',         cat: '廚餘機耗材配件',  px: 980,   stk: 2120,sold: 19821,status: 'live', clr: '#D97706' },
  { id: 'CS101U-W',  nm: 'CS101ULTRA-慕白',   cat: '空氣清淨機旗艦',  px: 128000,stk: 0,   sold: 0,     status: 'soon', clr: '#0E7A66' },
]

// ── Fleet devices ─────────────────────────────────────────────────────────────
export interface FleetDevice {
  id: string
  model: string
  site: string
  owner: string
  installed: string
  uptime: string
  fw: string
  lamp: 'g' | 'y' | 'r'
}

export const FLEET_DEVICES: FleetDevice[] = [
  { id: 'AC-PRO-1101', model: 'CS101MAX-慕白',   site: '臺北信義居家',   owner: '陳俊宏',  installed: '2023-01-12', uptime: '2,840', fw: '2.4.1', lamp: 'g' },
  { id: 'AC-PRO-1102', model: 'CS101MAX-慕白',   site: '臺北信義居家',   owner: '陳俊宏',  installed: '2023-01-12', uptime: '1,920', fw: '2.4.1', lamp: 'g' },
  { id: 'AC-PRO-3344', model: 'A81',             site: '大安辦公室',     owner: '陳俊宏',  installed: '2024-03-08', uptime: '3,120', fw: '2.4.1', lamp: 'y' },
  { id: 'AC-PRO-2841', model: 'CS101MAX-慕白',   site: '臺中科技園區',   owner: '王婉真',  installed: '2023-08-22', uptime: '5,210', fw: '2.3.6', lamp: 'r' },
  { id: 'AC-LITE-7821',model: 'CS100-慕白',      site: '陽明山度假',     owner: '陳俊宏',  installed: '2025-01-04', uptime: '412',   fw: '2.3.6', lamp: 'r' },
  { id: 'AC-PRO-5023', model: 'A81',             site: '臺南安平診所',   owner: '林醫師',  installed: '2024-06-12', uptime: '2,488', fw: '2.4.1', lamp: 'g' },
  { id: 'AC-LITE-1109',model: 'CS100-慕白',      site: '新北板橋辦公',   owner: '李文君',  installed: '2024-09-18', uptime: '1,604', fw: '2.4.0', lamp: 'y' },
  { id: 'AC-BIN-0214', model: 'PaPaBinV1',       site: '高雄鼓山辦公',   owner: '黃建中',  installed: '2024-11-02', uptime: '1,128', fw: '2.4.0', lamp: 'g' },
  { id: 'AC-PRO-4119', model: 'CS101PLUS-慕白',  site: '桃園藝文居家',   owner: '黃慧君',  installed: '2024-04-14', uptime: '2,210', fw: '2.4.1', lamp: 'g' },
  { id: 'AC-BIN-0502', model: 'PaPaBinV1',       site: '新竹東區居家',   owner: '吳承翰',  installed: '2025-02-20', uptime: '620',   fw: '2.4.1', lamp: 'g' },
]

// ── Consumables ───────────────────────────────────────────────────────────────
export interface ConsumableStock {
  nm: string
  cur: number
  max: number
  pct: number
  days: number
  cls: '' | 'y' | 'r'
}

export const CONSUMABLE_STOCK: ConsumableStock[] = [
  { nm: 'HEPA 濾網 (CS 系列)',       cur: 1840, max: 3000, pct: 61, days: 38, cls: '' },
  { nm: 'CS 系列初濾',               cur: 2120, max: 3000, pct: 71, days: 52, cls: '' },
  { nm: '活性碳濾網 C',              cur: 420,  max: 2000, pct: 21, days: 14, cls: 'y' },
  { nm: '前置濾網 (A81)',            cur: 88,   max: 1500, pct: 6,  days: 4,  cls: 'r' },
  { nm: '廚餘機濾芯 (PaPaBin)',      cur: 640,  max: 1200, pct: 53, days: 32, cls: '' },
  { nm: '除臭碳粒',                  cur: 220,  max: 1000, pct: 22, days: 15, cls: 'y' },
]

export interface ScheduledReplacement {
  d: string
  dm: string
  count: number
  note: string
  pillCls: 'g' | 'y' | '' | 'r'
  pillLbl: string
}

export const SCHEDULED_REPLACEMENTS: ScheduledReplacement[] = [
  { d: '12',  dm: '本週',  count: 52,  note: '52 台預定更換 · 北區為主',      pillCls: 'g', pillLbl: '已派工' },
  { d: '38',  dm: '下週',  count: 86,  note: '86 台 · 含 4 高級會員場域',     pillCls: 'y', pillLbl: '待排程' },
  { d: '112', dm: '本月',  count: 112, note: '112 台 · 月底高峰',             pillCls: '',  pillLbl: '規劃中' },
  { d: '136', dm: '逾期',  count: 136, note: '136 台已逾建議更換',            pillCls: 'r', pillLbl: '需聯繫' },
]

// ── Quality & yield ───────────────────────────────────────────────────────────
export interface QualityRow {
  nm: string
  sku: string
  made: number
  fpy: number
  rma: number
  mtbf: number | '—'
  trend: 'up' | 'flat' | 'dn'
}

export const QUALITY_ROWS: QualityRow[] = [
  { nm: 'CS101MAX-慕白',  sku: 'CS101MAX-W',  made: 620,  fpy: 99.2, rma: 0.32, mtbf: 22800, trend: 'up' },
  { nm: 'A81',            sku: 'A81-PRO',     made: 880,  fpy: 98.9, rma: 0.48, mtbf: 19400, trend: 'up' },
  { nm: 'PaPaBinV1',      sku: 'PAPABIN-V1',  made: 1240, fpy: 98.4, rma: 0.71, mtbf: 16200, trend: 'flat' },
  { nm: 'CS100-慕白',     sku: 'CS100-W',     made: 280,  fpy: 96.8, rma: 1.24, mtbf: 11200, trend: 'dn' },
  { nm: 'CS101PLUS-慕白', sku: 'CS101P-W',    made: 4200, fpy: 99.6, rma: 0.18, mtbf: '—',   trend: 'up' },
  { nm: 'HEPA 濾網',      sku: 'HEPA-STD',    made: 3120, fpy: 99.4, rma: 0.22, mtbf: '—',   trend: 'flat' },
]

export interface DefectItem {
  nm: string
  n: number
  p: number
  c: 'r' | 'y' | ''
}

export const DEFECT_PARETO: DefectItem[] = [
  { nm: '感測器校正偏差',      n: 14, p: 31.8, c: 'r' },
  { nm: '電源板焊接不良',      n: 10, p: 22.7, c: 'r' },
  { nm: 'Wi-Fi 模組接觸不良', n: 8,  p: 18.2, c: 'y' },
  { nm: '外殼塑膠披鋒',        n: 6,  p: 13.6, c: '' },
  { nm: '韌體燒錄失敗',        n: 3,  p: 6.8,  c: '' },
  { nm: '濾網密封不良',        n: 2,  p: 4.5,  c: '' },
  { nm: '其他',                n: 1,  p: 2.3,  c: '' },
]

export const YIELD_MONTHS = ['06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04', '05']
export const YIELD_TREND  = [97.8, 97.9, 98.0, 98.1, 98.2, 98.3, 98.0, 98.4, 98.5, 98.6, 98.6, 98.7]

// ── Firmware versions ─────────────────────────────────────────────────────────
export interface FirmwareVersion {
  v: string
  d: string
  n: number
  p: number
  latest?: boolean
  old?: boolean
  ch: string[]
}

export const FIRMWARE_VERSIONS: FirmwareVersion[] = [
  { v: '2.4.1', d: '最新 · 2026/04/22 發佈', n: 9842, p: 78.9, latest: true, ch: ['CO₂ 校正精度 +3%', 'App 配對穩定性'] },
  { v: '2.4.0', d: '2026/02/18 發佈',         n: 1820, p: 14.6,              ch: ['夜間靜音模式'] },
  { v: '2.3.8', d: '2025/11/02 發佈',         n: 612,  p: 4.9,               ch: ['Wi-Fi 重連優化'] },
  { v: '2.3.6', d: '2025/08/04 發佈 (舊)',    n: 207,  p: 1.7, old: true,    ch: ['—'] },
]
