import { useMemo, useState } from 'react'
import type { Coil, WindingResult } from '../engine/winding'

type Props = { result: WindingResult }

const phaseColors: Record<string, string> = { A: '#fbbf24', B: '#38bdf8', C: '#34d399' }

export function WindingUnwrap({ result }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const coils = result.coilTable
  const maxSlot = result.slotTable.length
  const step = result.coilPitch
  const slotGap = 42
  const left = 20
  const width = Math.max(760, maxSlot * slotGap + 40)
  const rowGap = 58
  const height = Math.max(300, coils.length * rowGap + 120)
  const byNumber = useMemo(() => new Map(coils.map((coil) => [coil.number, coil])), [coils])
  const selectedCoil = selected === null ? null : byNumber.get(selected)

  return (
    <section className="unwrap-panel" style={{ overflow: 'hidden' }}>
      <div className="section-heading compact">
        <div><span className="eyebrow">WINDING LAYOUT</span><h3>Развёртка обмотки</h3></div>
        <span className="status-dot">{coils.length} КАТУШЕК · ШАГ {step}</span>
      </div>
      <div className="unwrap-toolbar">
        <span>Схема укладки: вертикальные пазы и горизонтальные участки катушек.</span>
        {selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}
      </div>

      {selectedCoil && (
        <div className="unwrap-selected" style={{ position: 'relative', zIndex: 10, margin: '10px 0 12px', padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px 14px', alignItems: 'center', background: '#0b0f15', border: '1px solid #394454', borderRadius: 10, boxSizing: 'border-box' }}>
          <strong>Катушка №{selectedCoil.number}</strong>
          <span>Паз {selectedCoil.sideA} → паз {selectedCoil.sideB}</span>
          <span>Фаза: {selectedCoil.phase} {selectedCoil.polarity}</span>
        </div>
      )}

      <div className="unwrap-scroll" style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}>
        <div className="unwrap-canvas" style={{ position: 'relative', width, minWidth: width, minHeight: height }}>
          <svg className="unwrap-svg" style={{ display: 'block' }} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Схема укладки обмотки">
            {Array.from({ length: maxSlot }, (_, index) => {
              const slot = index + 1
              const x = left + index * slotGap
              const info = result.slotTable[index]
              const color = phaseColors[info?.phase] ?? '#8b95a5'
              const selectedSide = selectedCoil && (selectedCoil.sideA === slot || selectedCoil.sideB === slot)
              return (
                <g key={slot} opacity={selected !== null && !selectedSide ? .28 : 1}>
                  <line x1={x} y1={32} x2={x} y2={height - 22} stroke={color} strokeWidth={selectedSide ? 4 : 2.5} />
                  <text x={x} y={18} textAnchor="middle" fontSize="13" fontWeight={selectedSide ? 800 : 600} fill={selectedSide ? color : '#eef2f7'}>{slot}</text>
                </g>
              )
            })}

            {coils.map((coil: Coil, index) => {
              const x1 = left + (coil.sideA - 1) * slotGap
              const x2 = left + (coil.sideB - 1) * slotGap
              const y = 58 + index * rowGap
              const color = phaseColors[coil.phase] ?? '#8b95a5'
              const active = selected === coil.number
              const dimmed = selected !== null && !active
              const lineWidth = active ? 5 : 3
              const direction = coil.sideB >= coil.sideA ? 1 : -1
              const branchY = y + (direction > 0 ? 0 : 20)
              const labelX = (x1 + x2) / 2

              return (
                <g key={coil.number} onClick={() => setSelected(coil.number)} opacity={dimmed ? .16 : 1} style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
                  <line x1={x1} y1={32} x2={x1} y2={branchY} stroke={color} strokeWidth={lineWidth} />
                  <line x1={x1} y1={branchY} x2={x2} y2={branchY} stroke={color} strokeWidth={lineWidth} />
                  <line x1={x2} y1={branchY} x2={x2} y2={branchY + 18} stroke={color} strokeWidth={lineWidth} />
                  <rect x={labelX - 15} y={branchY - 10} width="30" height="20" rx="3" fill="#0b0f15" />
                  <text x={labelX} y={branchY + 5} textAnchor="middle" fontSize="12" fontWeight="800" fill={color}>К{coil.number}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
      <p className="diagram-note">Катушка показана как схематическая укладка: стороны привязаны непосредственно к пазам. Нажмите на неё для выделения.</p>
    </section>
  )
}
