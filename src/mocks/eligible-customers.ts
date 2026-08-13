/* AirSure — AIRCARE 正式報告合格客戶清單(2026-08-11 匯出)
 *
 * 來源:aircare-formal-report-eligible-customers-20260811.csv(72 台 / 69 位客戶)
 * 這份清單本身就是「合格判定」的結果 —— 出現在這裡 = 已通過報告產製的資料門檻,
 * 前端不再自己拿 90 天去判(CSV 的 sensorValidDays 最大只有 87,那是「期間內有效
 * 感測天數」,與設備報告 meta.days 的「期間日曆天 90」是兩個不同定義)。
 *
 * ⚠ 個資處理(AGENTS.md §7):
 *   · 不落地姓名、電話、Email —— 用客戶編號即時向中台換(hooks/useMember360)
 *   · 地址只留到「縣市 + 行政區 + 路名」層級,完整門牌(巷/弄/號/樓)一律不落地,
 *     需要完整地址請看中台或報告原始檔
 */

export interface EligibleDevice {
  mac: string            // 設備 MAC(內部主鍵)
  model: string
  customerNo: string     // 客戶編號 = SF Contact.LeadNum__c,對中台的唯一接點
  orderNo: string
  city: string           // 縣市
  area: string           // 行政區
  road: string           // 路名層級(不含門牌)
  sensorValidDays: number // 期間內有效感測天數
  statusValidDays: number // 期間內有效狀態天數
}

/** 72 台設備。3 位客戶各有 2 台(C2026030838 / C2026030942 / C2026040197)。 */
export const ELIGIBLE_DEVICES: EligibleDevice[] = [
  { mac: '806599912074', model: 'CS101', customerNo: 'C2026010030', orderNo: '01150125014', city: '台南市', area: '安南區', road: '總安街一段', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a076050', model: 'CS101', customerNo: 'C2026010055', orderNo: '01150210003', city: '新北市', area: '泰山區', road: '明志路三段', sensorValidDays: 87, statusValidDays: 74 },
  { mac: '1cdbd4f8def8', model: 'CS101', customerNo: 'C2026010062', orderNo: '01150210006', city: '台中市', area: '南區', road: '文心南路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: '806599927630', model: 'CS101', customerNo: 'C2026010076', orderNo: '01150125029', city: '台中市', area: '南區', road: '福新街', sensorValidDays: 87, statusValidDays: 89 },
  { mac: '1cdbd4f6ac40', model: 'CS101', customerNo: 'C2026010083', orderNo: '01150210008', city: '台北市', area: '南港區', road: '永吉路', sensorValidDays: 87, statusValidDays: 73 },
  { mac: '8065998dcaf0', model: 'CS101', customerNo: 'C2026010088', orderNo: '01150125037', city: '台南市', area: '南區', road: '大同路二段', sensorValidDays: 87, statusValidDays: 73 },
  { mac: '1cdbd4f8a710', model: 'CS101', customerNo: 'C2026010263', orderNo: '01150206015', city: '台中市', area: '沙鹿區', road: '中山路', sensorValidDays: 87, statusValidDays: 88 },
  { mac: '8065998dca20', model: 'CS101', customerNo: 'C2026010510', orderNo: '01150125046', city: '台北市', area: '信義區', road: '光復南路', sensorValidDays: 87, statusValidDays: 83 },
  { mac: '8065998c798c', model: 'CS101', customerNo: 'C2026010511', orderNo: '01150125047', city: '高雄市', area: '前鎮區', road: '崗山西街', sensorValidDays: 86, statusValidDays: 84 },
  { mac: '8065998df014', model: 'CS101', customerNo: 'C2026010514', orderNo: '01150128002', city: '台中市', area: '南屯區', road: '春安三街', sensorValidDays: 87, statusValidDays: 81 },
  { mac: 'e8f60a2a6f94', model: 'CS101', customerNo: 'C2026020010', orderNo: '01150210026', city: '台中市', area: '清水區', road: '港新五路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a2ae844', model: 'CS101', customerNo: 'C2026020032', orderNo: '01150206024', city: '台中市', area: '西屯區', road: '福科路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a0a7174', model: 'CS101', customerNo: 'C2026020080', orderNo: '01150206029', city: '新北市', area: '新店區', road: '中央路', sensorValidDays: 87, statusValidDays: 88 },
  { mac: 'e8f60a0760c8', model: 'CS101', customerNo: 'C2026020113', orderNo: '01150206138', city: '台中市', area: '南屯區', road: '黎明東街', sensorValidDays: 87, statusValidDays: 77 },
  { mac: 'e8f60a2d02c0', model: 'CS101', customerNo: 'C2026020173', orderNo: '01150302001', city: '高雄市', area: '仁武區', road: '名湖街', sensorValidDays: 87, statusValidDays: 66 },
  { mac: 'e8f60a2bd9b8', model: 'CS101', customerNo: 'C2026020186', orderNo: '01150210032', city: '宜蘭縣', area: '頭城鎮', road: '協天路', sensorValidDays: 87, statusValidDays: 66 },
  { mac: 'e8f60a2af86c', model: 'CS101', customerNo: 'C2026020350', orderNo: '01150326154', city: '新北市', area: '淡水區', road: '中正東路一段', sensorValidDays: 87, statusValidDays: 81 },
  { mac: 'e8f60a2cf66c', model: 'CS101', customerNo: 'C2026020426', orderNo: '01150210037', city: '台中市', area: '南區', road: '南和路', sensorValidDays: 87, statusValidDays: 88 },
  { mac: '1cdbd4f8d858', model: 'CS101', customerNo: 'C2026020461', orderNo: '01150211004', city: '新北市', area: '板橋區', road: '新府路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: '1cdbd4f721d8', model: 'CS101', customerNo: 'C2026020478', orderNo: '01150223010', city: '屏東縣', area: '屏東市', road: '民貴街', sensorValidDays: 87, statusValidDays: 84 },
  { mac: 'e8f60a2ba994', model: 'CS101', customerNo: 'C2026020497', orderNo: '01150225002', city: '新北市', area: '板橋區', road: '江寧路三段', sensorValidDays: 87, statusValidDays: 85 },
  { mac: '1cdbd4f74f0c', model: 'CS101', customerNo: 'C2026020500', orderNo: '01150225004', city: '台南市', area: '中西區', road: '西賢一街', sensorValidDays: 87, statusValidDays: 82 },
  { mac: 'e8f60a2cf6c0', model: 'CS101', customerNo: 'C2026020515', orderNo: '01150226008', city: '高雄市', area: '三民區', road: '立強街', sensorValidDays: 86, statusValidDays: 71 },
  { mac: '1cdbd4f5eb3c', model: 'CS101', customerNo: 'C2026020517', orderNo: '01150226009', city: '台中市', area: '大里區', road: '大里路', sensorValidDays: 87, statusValidDays: 65 },
  { mac: 'e8f60a0a7194', model: 'CS101', customerNo: 'C2026020518', orderNo: '01150226010', city: '桃園市', area: '中壢區', road: '三民一路', sensorValidDays: 84, statusValidDays: 85 },
  { mac: '1cdbd4f71e18', model: 'CS101', customerNo: 'C2026020523', orderNo: '01150310001', city: '新北市', area: '三重區', road: '龍濱路', sensorValidDays: 87, statusValidDays: 84 },
  { mac: 'e8f60a2ac3c8', model: 'CS101', customerNo: 'C2026030002', orderNo: '01150304003', city: '高雄市', area: '仁武區', road: '北屋北街', sensorValidDays: 87, statusValidDays: 88 },
  { mac: 'e8f60a2a6694', model: 'CS101', customerNo: 'C2026030011', orderNo: '01150303013', city: '高雄市', area: '鳳山區', road: '明學路', sensorValidDays: 87, statusValidDays: 87 },
  { mac: 'e8f60a2b4a88', model: 'CS101', customerNo: 'C2026030014', orderNo: '01150304004', city: '高雄市', area: '苓雅區', road: '永裕街', sensorValidDays: 87, statusValidDays: 89 },
  { mac: '1cdbd4f94e98', model: 'CS101', customerNo: 'C2026030017', orderNo: '01150304008', city: '台南市', area: '善化區', road: '胡厝里西衛', sensorValidDays: 87, statusValidDays: 84 },
  { mac: 'e8f60a2c3c0c', model: 'CS101', customerNo: 'C2026030019', orderNo: '01150304010', city: '新北市', area: '汐止區', road: '康寧街', sensorValidDays: 81, statusValidDays: 81 },
  { mac: 'e8f60a2a69f8', model: 'CS101', customerNo: 'C2026030021', orderNo: '01150304013', city: '新北市', area: '永和區', road: '永平路', sensorValidDays: 81, statusValidDays: 82 },
  { mac: '1cdbd4f8d6ec', model: 'CS101', customerNo: 'C2026030022', orderNo: '01150304014', city: '台北市', area: '信義區', road: '信義路五段', sensorValidDays: 87, statusValidDays: 88 },
  { mac: 'e8f60a2b2bfc', model: 'CS101', customerNo: 'C2026030027', orderNo: '01150304019', city: '高雄市', area: '鼓山區', road: '美術南五街', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a0a7148', model: 'CS101', customerNo: 'C2026030032', orderNo: '01150305005', city: '澎湖縣', area: '馬公市', road: '光華里', sensorValidDays: 81, statusValidDays: 77 },
  { mac: 'e8f60a076208', model: 'CS101', customerNo: 'C2026030038', orderNo: '01150306003', city: '台中市', area: '太平區', road: '永平南路', sensorValidDays: 87, statusValidDays: 67 },
  { mac: 'e8f60a2ccba4', model: 'CS101', customerNo: 'C2026030040', orderNo: '01150306007', city: '台中市', area: '北屯區', road: '三甲東街', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a2b0f38', model: 'CS101', customerNo: 'C2026030041', orderNo: '01150306008', city: '嘉義市', area: '西區', road: '新建街', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a2c3300', model: 'CS101', customerNo: 'C2026030048', orderNo: '01150309005', city: '台南市', area: '東區', road: '崇德路', sensorValidDays: 85, statusValidDays: 82 },
  { mac: 'e8f60a2b7674', model: 'CS101', customerNo: 'C2026030051', orderNo: '01150309008', city: '台北市', area: '大同區', road: '重慶北路三段', sensorValidDays: 86, statusValidDays: 87 },
  { mac: 'e8f60a2a6064', model: 'CS101', customerNo: 'C2026030052', orderNo: '01150310004', city: '新北市', area: '中和區', road: '中安街', sensorValidDays: 69, statusValidDays: 68 },
  { mac: 'e8f60a2b4a30', model: 'CS101', customerNo: 'C2026030058', orderNo: '01150311004', city: '台中市', area: '大里區', road: '仁慈街', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a2c5578', model: 'CS101', customerNo: 'C2026030647', orderNo: '01150317003', city: '新北市', area: '新店區', road: '北新路三段', sensorValidDays: 71, statusValidDays: 69 },
  { mac: '1cdbd4f81fc4', model: 'CS101', customerNo: 'C2026030682', orderNo: '01150326155', city: '台北市', area: '文山區', road: '興隆路三段', sensorValidDays: 87, statusValidDays: 80 },
  { mac: 'e8f60a076174', model: 'CS101', customerNo: 'C2026030746', orderNo: '01150317002', city: '桃園市', area: '平鎮區', road: '延平路三段', sensorValidDays: 87, statusValidDays: 87 },
  { mac: '1cdbd4f70740', model: 'CS101', customerNo: 'C2026030770', orderNo: '01150327239', city: '新北市', area: '板橋區', road: '文化路一段', sensorValidDays: 87, statusValidDays: 78 },
  { mac: '1cdbd4f73718', model: 'CS101', customerNo: 'C2026030832', orderNo: '01150319013', city: '高雄市', area: '鳳山區', road: '文享街', sensorValidDays: 87, statusValidDays: 89 },
  { mac: '1cdbd4f89534', model: 'CS101', customerNo: 'C2026030838', orderNo: '01150429001', city: '台南市', area: '安平區', road: '國平北路', sensorValidDays: 87, statusValidDays: 88 },
  { mac: 'b0a60400271c', model: 'CS101', customerNo: 'C2026030838', orderNo: '01150320004', city: '台南市', area: '安平區', road: '國平北路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a2c54f8', model: 'CS101', customerNo: 'C2026030845', orderNo: '01150324002', city: '台南市', area: '北區', road: '海安路三段', sensorValidDays: 87, statusValidDays: 88 },
  { mac: 'e8f60a2d594c', model: 'CS101', customerNo: 'C2026030847', orderNo: '01150324005', city: '高雄市', area: '楠梓區', road: '藍田路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a075f4c', model: 'CS101', customerNo: 'C2026030848', orderNo: '01150324006', city: '台中市', area: '清水區', road: '民族路三段', sensorValidDays: 87, statusValidDays: 86 },
  { mac: 'e8f60a2d8ed4', model: 'CS101', customerNo: 'C2026030915', orderNo: '01150325006', city: '台北市', area: '中山區', road: '建國北路三段', sensorValidDays: 87, statusValidDays: 87 },
  { mac: '1cdbd4f75c1c', model: 'CS101', customerNo: 'C2026030933', orderNo: '01150330216', city: '高雄市', area: '三民區', road: '水源東路', sensorValidDays: 79, statusValidDays: 64 },
  { mac: 'e8f60a0a76e0', model: 'CS101', customerNo: 'C2026030942', orderNo: '01150331437', city: '台北市', area: '士林區', road: '中山北路六段', sensorValidDays: 81, statusValidDays: 75 },
  { mac: 'e8f60a2a6924', model: 'CS101', customerNo: 'C2026030942', orderNo: '01150331434', city: '台北市', area: '士林區', road: '中山北路六段', sensorValidDays: 87, statusValidDays: 82 },
  { mac: '1cdbd4f8d044', model: 'CS101', customerNo: 'C2026030944', orderNo: '01150331441', city: '台北市', area: '士林區', road: '中山北路七段', sensorValidDays: 87, statusValidDays: 87 },
  { mac: 'e8f60a2abad0', model: 'CS101', customerNo: 'C2026030945', orderNo: '01150331443', city: '新北市', area: '板橋區', road: '文化路一段', sensorValidDays: 87, statusValidDays: 87 },
  { mac: 'e8f60a075fc4', model: 'CS101', customerNo: 'C2026040002', orderNo: '01150401253', city: '新北市', area: '泰山區', road: '民權街', sensorValidDays: 84, statusValidDays: 83 },
  { mac: 'e8f60a2a4fd4', model: 'CS101', customerNo: 'C2026040149', orderNo: '01150407005', city: '高雄市', area: '鳳山區', road: '文衡路', sensorValidDays: 87, statusValidDays: 80 },
  { mac: 'e8f60a2d5c78', model: 'CS101', customerNo: 'C2026040170', orderNo: '01150409009', city: '台南市', area: '永康區', road: '永大路三段', sensorValidDays: 77, statusValidDays: 63 },
  { mac: 'e8f60a2daab0', model: 'CS101', customerNo: 'C2026040187', orderNo: '01150413013', city: '新北市', area: '新店區', road: '安康路二段', sensorValidDays: 87, statusValidDays: 88 },
  { mac: '1cdbd4f8eb70', model: 'CS101', customerNo: 'C2026040192', orderNo: '01150414017', city: '台南市', area: '安南區', road: '海東一街', sensorValidDays: 87, statusValidDays: 84 },
  { mac: 'e8f60a0760ac', model: 'CS101', customerNo: 'C2026040197', orderNo: '01150504002', city: '新北市', area: '三重區', road: '中央南路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a2a9c4c', model: 'CS101', customerNo: 'C2026040197', orderNo: '01150415006', city: '新北市', area: '三重區', road: '中央南路', sensorValidDays: 87, statusValidDays: 89 },
  { mac: 'e8f60a2ad2d0', model: 'CS101', customerNo: 'C2026040216', orderNo: '01150420005', city: '台中市', area: '南區', road: '東興路一段', sensorValidDays: 82, statusValidDays: 77 },
  { mac: 'e8f60a075f70', model: 'CS101', customerNo: 'C2026040221', orderNo: '01150421007', city: '台中市', area: '東區', road: '公園東路', sensorValidDays: 87, statusValidDays: 85 },
  { mac: 'e8f60a2b3a6c', model: 'CS101', customerNo: 'C2026040227', orderNo: '01150421010', city: '台中市', area: '北屯區', road: '大連路二段', sensorValidDays: 87, statusValidDays: 73 },
  { mac: 'e8f60a2ab478', model: 'CS101', customerNo: 'C2026040237', orderNo: '01150421020', city: '台北市', area: '南港區', road: '向陽路', sensorValidDays: 87, statusValidDays: 79 },
  { mac: '1cdbd4f85f4c', model: 'CS101', customerNo: 'C2026040260', orderNo: '01150428045', city: '新北市', area: '五股區', road: '天乙路', sensorValidDays: 87, statusValidDays: 76 },
  { mac: 'e8f60a2a8fd8', model: 'CS101', customerNo: 'C2026040286', orderNo: '01150504007', city: '新北市', area: '三重區', road: '穀保街', sensorValidDays: 87, statusValidDays: 88 },
  { mac: '8065998ca410', model: 'CS101', customerNo: 'Z0138', orderNo: '01150214009', city: '高雄市', area: '仁武區', road: '八德二路', sensorValidDays: 81, statusValidDays: 66 },
]

/** 客戶編號 → 該客戶的設備(1–2 台) */
export const ELIGIBLE_BY_CUSTOMER: Record<string, EligibleDevice[]> = ELIGIBLE_DEVICES.reduce(
  (acc, d) => {
    ;(acc[d.customerNo] ??= []).push(d)
    return acc
  },
  {} as Record<string, EligibleDevice[]>,
)

/** 合格客戶數(清單列數);設備數 = ELIGIBLE_DEVICES.length */
export const ELIGIBLE_CUSTOMER_COUNT = Object.keys(ELIGIBLE_BY_CUSTOMER).length
