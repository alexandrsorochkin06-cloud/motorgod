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

  const selectedCoil = selected === null ? null : byNumber.get(selected)

  return (
    <section className="unwrap-panel" style={{ overflow: 'hidden' }}>
      <div className="section-heading compact">
        <div><span className="eyebrow">WINDING LAYOUT</span><h3>Развёртка обмотки</h3></div>
        <span className="status-dot">{coils.length} КАТУШЕК · ШАГ {step}</span>
      </div>
      <div className="unwrap-toolbar">
        <span>Физическая укладка катушек по пазам.</span>
        {selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}
      </div>

      {selectedCoil && (
        <div className="unwrap-selected" style={{ position: 'relative', zIndex: 10, margin: '10px 0 12px', padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px 14px', alignItems: 'center', background: '#0b0f15', border: '1px solid #394454', borderRadius: 10, boxSizing: 'border-box' }}>
          <strong>Катушка №{selectedCoil.number}</strong>
          <span>Пазы: {selectedCoil.sideA} → {selectedCoil.sideB}</span>
          <span>Фаза: {selectedCoil.phase} {selectedCoil.polarity}</span>
          <span>Группа: {selectedCoil.phase}{selectedCoil.polarity}</span>
        </div>
      )}

      <div className="unwrap-scroll" style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}>
        <div className="unwrap-canvas" style={{ position: 'relative', width, minWidth: width, minHeight: height }}>
          <div className="slot-axis" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            {Array.from({ length: maxSlot }, (_, index) => <div key={index + 1} className="unwrap-slot" style={{ position: 'absolute', top: 8, left: 20 + index * 42, width: 42, transform: 'translateX(-50%)', textAlign: 'center' }}><span>{index + 1}</span><i style={{ display: 'block', width: 2, height: 12, margin: '5px auto 0', background: '#394454', borderRadius: 2 }} /></div>)}
          </div>
          <svg className="unwrap-svg" style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, display: 'block' }} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Развёртка обмотки">
            {coils.map((coil: Coil, index) => {
              const x1 = 20 + (coil.sideA - 1) * 42, x2 = 20 + (coil.sideB - 1) * 42, y = 70 + index * rowGap
              const color = palette[(coil.number - 1) % palette.length], active = selected === coil.number, dimmed = selected !== null && !active, mid = (x1 + x2) / 2
              return <g key={coil.number} onClick={() => setSelected(coil.number)} className="unwrap-coil" opacity={dimmed ? .18 : 1} style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
                <path d={`M ${x1} ${y} Q ${mid} ${y - 28} ${x2} ${y}`} fill="none" stroke={color} strokeWidth={active ? 9 : 6} strokeLinecap="round" />
                <circle cx={x1} cy={y} r={active ? 7 : 5} fill={color} /><circle cx={x2} cy={y} r={active ? 7 : 5} fill={color} />
                <rect x={mid - 33} y={y - 34} width="66" height="20" rx="6" fill="#0b0f15" stroke={color} />
                <text x={mid} y={y - 20} className="unwrap-label">К{coil.number}</text>
              </g>
            })}
          </svg>
        </div>
      </div>
      <p className="diagram-note">Нажмите на катушку — остальные соединения затемнятся.</p>
    </section>
  )
}
