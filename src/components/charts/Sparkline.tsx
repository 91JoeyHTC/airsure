interface SparklineProps {
  data: number[]
  color?: string
  w?: number
  h?: number
}

export function Sparkline({ data, color = 'var(--as-mute-2)', w = 70, h = 24 }: SparklineProps) {
  if (data.length < 2) return null // 單點畫不出折線(i/(len-1) 會是 NaN)
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ')
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
