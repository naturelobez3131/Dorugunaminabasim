interface RingProps {
  progress: number // 0..1
  size?: number
  stroke?: number
  color?: string
  track?: string
  num?: string
  cap?: string
}

export function Ring({
  progress,
  size = 96,
  stroke = 11,
  color = '#111111',
  track = '#ececec',
  num,
  cap
}: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.min(1, Math.max(0, progress))
  const offset = c * (1 - p)
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {(num || cap) && (
        <div className="center">
          {num && <div className="num">{num}</div>}
          {cap && <div className="cap">{cap}</div>}
        </div>
      )}
    </div>
  )
}
