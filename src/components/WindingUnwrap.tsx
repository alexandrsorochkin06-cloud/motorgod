import { useMemo, useState } from 'react'
import type { Coil, WindingResult } from '../engine/winding'

type Props = { result: WindingResult }

const palette = ['#fbbf24', '#38bdf8', '#a78bfa', '#34d399', '#fb7185', '#f97316', '#e879f9', '#22d3ee']

export function WindingUnwrap({ result }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const coils = result.coilTable
  const maxSlot = result.slotTable.length
  const step = result.coilPitch
  const width = Math.max(760, maxSlot * 42 + 40)
  const rowGap = 48
  const height = Math.max(260, coils.length * rowGap + 90)
  const byNumber = useMemo(() => new Map(coils.map((coil) => [coil.number, coil])), [coils])

  return (
    <section className="unwrap-panel">
      <div className="section-heading compact">
        <div><span className="eyebrow">WINDING LAYOUT</span><h3>Развёртка обмотки</h3></div>
        <span className="status-dot">{coils.length} КАТУШЕК · ШАГ {step}</span>
      </div>
      <div className="unwrap-toolbar"><span>Физическая укладка катушек по пазам.</span>{selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}</div>
      <div className="unwrap-scroll">
        <div className="unwrap-canvas" style={{ width, minHeight: height }}>
          <div className="slot-axis">{Array.from({ length: maxSlot }, (_, index) => <div key={index + 1} className="unwrap-slot" style={{ left: 20 + index * 42 }}><span>{index + 1}</span><i /></div>)}</div>
          <svg className="unwrap-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Развёртка обмотки">
            {coils.map((coil: Coil, index) => {
              const x1 = 20 + (coil.slotA - 1) * 42, x2 = 20 + (coil.slotB - 1) * 42, y = 70 + index * rowGap
              const color = palette[(coil.number - 1) % palette.length], active = selected === coil.number, dimmed = selected !== null && !active, mid = (x1 + x2) / 2
              return <g key={coil.number} onClick={() => setSelected(coil.number)} className="unwrap-coil" opacity={dimmed ? .18 : 1}>
                <path d={`M ${x1} ${y} Q ${mid} ${y - 28} ${x2} ${y}`} fill="none" stroke={color} strokeWidth={active ? 9 : 6} strokeLinecap="round" />
                <circle cx={x1} cy={y} r={active ? 7 : 5} fill={color} /><circle cx={x2} cy={y} r={active ? 7 : 5} fill={color} />
                <rect x={mid - 33} y={y - 34} width="66" height="20" rx="6" fill="#0b0f15" stroke={color} />
                <text x={mid} y={y - 20} className="unwrap-label">К{coil.number}</text>
              </g>
            })}
          </svg>
          {selected !== null && (() => { const coil = byNumber.get(selected); if (!coil) return null; return <div className="unwrap-selected"><strong>Катушка №{coil.number}</strong><span>Пазы: {coil.slotA} → {coil.slotB}</span><span>Фаза: {coil.phase} {coil.polarity}</span><span>Группа: {coil.phase}{coil.polarity}</span></div> })()}
        </div>
      </div>
      <p className="diagram-note">Нажмите на катушку — остальные соединения затемнятся.</p>
    </section>
  )
}
