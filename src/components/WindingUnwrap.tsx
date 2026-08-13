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
  const rowGap = 58
  const height = Math.max(300, coils.length * rowGap + 100)
  const byNumber = useMemo(() => new Map(coils.map((coil) => [coil.number, coil])), [coils])
  const selectedCoil = selected === null ? null : byNumber.get(selected)

  return (
    <section className="unwrap-panel" style={{ overflow: 'hidden' }}>
      <div className="section-heading compact">
        <div><span className="eyebrow">WINDING LAYOUT</span><h3>Развёртка обмотки</h3></div>
        <span className="status-dot">{coils.length} КАТУШЕК · ШАГ {step}</span>
      </div>
      <div className="unwrap-toolbar">
        <span>Каждая цветная фигура — одна катушка с двумя сторонами.</span>
        {selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}
      </div>

      {selectedCoil && (
        <div className="unwrap-selected" style={{ position: 'relative', zIndex: 10, margin: '10px 0 12px', padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px 14px', alignItems: 'center', background: '#0b0f15', border: '1px solid #394454', borderRadius: 10, boxSizing: 'border-box' }}>
          <strong>Катушка №{selectedCoil.number}</strong>
          <span>Сторона 1: паз {selectedCoil.sideA}</span>
          <span>Сторона 2: паз {selectedCoil.sideB}</span>
          <span>Фаза: {selectedCoil.phase} {selectedCoil.polarity}</span>
        </div>
      )}

      <div className="unwrap-scroll" style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}>
        <div className="unwrap-canvas" style={{ position: 'relative', width, minWidth: width, minHeight: height }}>
          <div className="slot-axis" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            {Array.from({ length: maxSlot }, (_, index) => <div key={index + 1} className="unwrap-slot" style={{ position: 'absolute', top: 8, left: 20 + index * 42, width: 42, transform: 'translateX(-50%)', textAlign: 'center' }}><span>{index + 1}</span><i style={{ display: 'block', width: 2, height: 12, margin: '5px auto 0', background: '#394454', borderRadius: 2 }} /></div>)}
          </div>
          <svg className="unwrap-svg" style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, display: 'block' }} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Развёртка обмотки">
            {coils.map((coil: Coil, index) => {
              const x1 = 20 + (coil.sideA - 1) * 42
              const x2 = 20 + (coil.sideB - 1) * 42
              const y = 72 + index * rowGap
              const color = palette[(coil.number - 1) % palette.length]
              const active = selected === coil.number
              const dimmed = selected !== null && !active
              const mid = (x1 + x2) / 2
              const thickness = active ? 8 : 5
              return (
                <g key={coil.number} onClick={() => setSelected(coil.number)} className="unwrap-coil" opacity={dimmed ? .16 : 1} style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
                  {/* First and second coil sides are drawn as two parallel legs. */}
                  <path d={`M ${x1} ${y - 7} Q ${mid} ${y - 34} ${x2} ${y - 7}`} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" />
                  <path d={`M ${x1} ${y + 7} Q ${mid} ${y + 34} ${x2} ${y + 7}`} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" />
                  <line x1={x1} y1={y - 7} x2={x1} y2={y + 7} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
                  <line x1={x2} y1={y - 7} x2={x2} y2={y + 7} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
                  <circle cx={x1} cy={y} r={active ? 8 : 6} fill={color} />
                  <circle cx={x2} cy={y} r={active ? 8 : 6} fill={color} />
                  <rect x={mid - 28} y={y - 11} width="56" height="22" rx="7" fill="#0b0f15" stroke={color} />
                  <text x={mid} y={y + 4} className="unwrap-label">К{coil.number}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
      <p className="diagram-note">Нажмите на катушку — её две стороны выделятся, остальные соединения затемнятся.</p>
    </section>
  )
}
