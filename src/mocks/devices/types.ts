/* AirCare 設備分析報告的資料形狀。
 * 一台設備一份報告 —— 報告的顆粒度就是這樣,所以這裡也是。
 * 欄位刻意對齊未來 GET /api/device-report?mac= 的 response,接中台時只換資料源。
 * 產生器:scratchpad/gen.py <報告.md>,不要手改 devices/*.ts。 */

export interface DeviceDaily {
  d: string; readings: number; avg: number; p95: number; max: number; humidity: number; temp: number
}

export interface DeviceReport {
  meta: {
    customerCode: string; mac: string; orderNo: string; model: string; address: string
    periodStart: string; periodEnd: string; days: number
    /* 指數 = PM2.5 分數 × 50% + 濕度分數 × 50% */
    airScore: number; pm25Score: number; humidityScore: number; segment: string
    peakDay: string; peakDayAvg: number; peakDayMax: number
    /* 可比較表現:母體 = 全部設備近 90 個臺北時區日曆日 */
    percentileAirScore: number; percentilePm25: number
    pm25Avg: number; pm25P95: number; pm25Max: number
    humidityAvg: number; humidityP50: number; humidityP90: number
    humidityOver65Pct: number; humidityOver70Pct: number
    tempMin: number; tempMax: number
    outdoorStation: string; outdoorPm25Avg: number; outdoorPm25Peak: number; outdoorAqiAvg: number
    runHours: number; lowFanPct: number; highFanPct: number
    lastAlarmAt: string; lastAlarmCode: number
    consumableBaseDate: string
    diurnalPeakSlot: string; diurnalPeakP95: number
  }
  daily: DeviceDaily[]
  outdoorDaily: number[]
  /** 日 × 小時平均 PM2.5 [days][24],null = 該小時無讀數 */
  hourlyGrid: (number | null)[][]
  /** 使用節奏 [7][24] 0–3(週日→週六),由每小時 readings 回報密度依星期彙總後正規化 */
  weekUsage: number[][]
  pm25Levels: { lv: string; hours: number; pct: number; range: string }[]
  diurnal: { slot: string; hours: number; avg: number; p95: number; max: number }[]
  peakHours: { at: string; slot: string; avg: number; max: number; level: string }[]
  /** score 欄即報告的濕度計分基準,可對照出「濕度分數 0.0」的矛盾 */
  humidityLevels: { lv: string; range: string; score: number; pct: number }[]
  runStates: { label: string; hours: number }[]
  modes: { label: string; hours: number; pct: number }[]
  fanSpeeds: { label: string; hours: number; pct: number }[]
  manualActions: { slot: string; slotLabel: string; action: string; count: number }[]
  events: { label: string; count: number }[]
  tank: {
    cycles: number; resolved: number; unresolved: number; excluded: number
    avgWaitHours: number; p50WaitHours: number; p90WaitHours: number
  }
  consumables: {
    label: string; remainingPct: number; hoursUsed: number; remainingHours: number; hoursMax: number
    dailyBurn: number; daysLeft: number; exhaustDate: string
    /** 報告原始判定,前端不重算 */
    urgency: string
  }[]
}
