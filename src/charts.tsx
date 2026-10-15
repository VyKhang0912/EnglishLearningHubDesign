import { useState } from 'react'

export function Bars({ data, max = 10, h = 180, fmt = (v: number) => v.toFixed(1) }: { data: { label: string; value: number; color: string }[]; max?: number; h?: number; fmt?: (v: number) => string }) {
  const [hov, setHov] = useState<number | null>(null)
  return (
    <div className="flex items-end justify-around gap-4 px-2" style={{ height: h }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2" onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
          <span className={'text-sm font-bold transition-opacity ' + (hov === i ? 'opacity-100' : 'opacity-80')}>{fmt(d.value)}</span>
          <div className="w-full max-w-[56px] rounded-t-lg transition-all duration-300" style={{ height: `${(d.value / max) * 100 * 0.78}%`, background: d.color, opacity: hov === null || hov === i ? 1 : 0.45 }} />
          <span className="text-xs font-semibold text-sub">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function Line({ series, labels, h = 190 }: { series: { name: string; color: string; data: number[] }[]; labels: string[]; h?: number }) {
  const W = 560, H = h, P = 28
  const x = (i: number) => P + (i * (W - P * 2)) / (labels.length - 1)
  const y = (v: number) => H - P - ((v - 5) / 5) * (H - P * 2)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Biểu đồ điểm trung bình theo tuần">
      {[5, 6.25, 7.5, 8.75, 10].map((v) => (
        <g key={v}>
          <line x1={P} x2={W - P} y1={y(v)} y2={y(v)} stroke="#e3e8f2" />
          <text x={4} y={y(v) + 4} fontSize="11" fill="#5b6a82">{v % 1 ? v.toFixed(1) : v}</text>
        </g>
      ))}
      {labels.map((l, i) => <text key={l} x={x(i)} y={H - 6} fontSize="11" textAnchor="middle" fill="#5b6a82">{l}</text>)}
      {series.map((s) => (
        <g key={s.name}>
          <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          {s.data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2"><title>{`${s.name}: ${v}`}</title></circle>)}
        </g>
      ))}
    </svg>
  )
}

export function Donut({ value, size = 120, color = '#5368ec', label }: { value: number; size?: number; color?: string; label?: string }) {
  const r = 46, c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e6ebf5" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} style={{ transition: 'stroke-dasharray .4s' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><p className="text-2xl font-extrabold leading-none">{value}%</p>{label && <p className="mt-1 text-[11px] text-sub">{label}</p>}</div>
      </div>
    </div>
  )
}

export function HBars({ data }: { data: { label: string; value: number; color?: string }[] }) {
  return (
    <div className="space-y-3.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{d.label}</span><span className="font-bold">{d.value}%</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#e6ebf5]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.value}%`, background: d.color || (d.value < 70 ? '#dc2626' : d.value < 80 ? '#e9a62a' : '#0e9f8f') }} /></div>
        </div>
      ))}
    </div>
  )
}
