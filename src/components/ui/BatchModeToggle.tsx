/**
 * 施工狀態徽章開關
 *
 * - 預設關（demo 友好）
 * - localStorage 'as.batch-mode' 記憶
 * - 開啟時：body[data-batch-mode="on"]，CSS 顯示卡片右上 P1/P2/P3 徽章
 */
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'as.batch-mode'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

export function BatchModeToggle() {
  const [on, setOn] = useState<boolean>(() => readInitial())

  useEffect(() => {
    document.body.setAttribute('data-batch-mode', on ? 'on' : 'off')
    try {
      window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
    } catch {
      // ignore
    }
  }, [on])

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        className={`batch-toggle ${on ? 'on' : ''}`}
        onClick={() => setOn(v => !v)}
        title={on ? '隱藏 8/1 上線批次標示' : '顯示 8/1 上線批次標示（P1 第一批 / P2 第二批 / P3 先放著）'}
      >
        <span className="dot" />
        <span>🔧 施工狀態</span>
        <span style={{ fontSize: 11, color: 'var(--as-mute)', marginLeft: 2 }}>
          {on ? 'ON' : 'OFF'}
        </span>
      </button>
      {on && (
        <span className="batch-legend">
          <span className="it"><span className="pip p1">P1</span>第一批</span>
          <span className="it"><span className="pip p2">P2</span>第二批</span>
          <span className="it"><span className="pip p3">P3</span>先放著</span>
        </span>
      )}
    </div>
  )
}
