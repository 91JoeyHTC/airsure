/**
 * 把 BATCH_MAP 的 key 轉成 spread 進 JSX 的 data-* attribute。
 *
 * 用法：
 *   <div className="card" {...batchAttrs('A.設備總覽.七分群分布')}>
 *
 * 若 key 不在表內會回傳空 object，不破壞畫面。
 */
import { BATCH_MAP, BATCH_LABEL } from '../../data/batch-map'

export function batchAttrs(key: string): Record<string, string> {
  const tag = BATCH_MAP[key]
  if (!tag) return {}
  const label = `${BATCH_LABEL[tag.batch].short}·${tag.source.replace(/\s+/g, ' ').trim()}`
  const attrs: Record<string, string> = {
    'data-batch': tag.batch,
    'data-batch-label': label,
    'data-source': tag.source,
  }
  if (tag.warn) attrs['data-warn'] = tag.warn
  return attrs
}
