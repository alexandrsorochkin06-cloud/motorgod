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
  const left = 34
  const width = Math.max(760, maxSlot * slotGap + 54)
  const groupGap = 88
  const laneStep = 18
  const byNumber = useMemo(() => new Map(coils.map((coil) => [coil.number, coil])), [coils])
  const selectedCoil = selected === null ? null : byNumber.get(selected)
  const groupByCoil = useMemo(() => {
    const map = new Map<number, { index: number; label: string }>()
    result.phaseGroups.forEach((group, index) => {
      group.coils.forEach((number) => map.set(number, { index, label: `Г${index + 1} · ${group.phase}${group.polarity}` }))
    })
    return map
  }, [result.phaseGroups])
  const groupMembers = useMemo(() => {
    const map = new Map<number, Coil[]>()
    coils.forEach((coil) => {
      const group = groupByCoil.get(coil.number)
      if (!group) return
      const list = map.get(group.index) ?? []
      list.push(coil)
      map.set(group.index, list)
    })
    return map
  }, [coils, groupByCoil])
  const maxGroupSize = Math.max(1, ...Array.from(groupMembers.values()).map((items) => items.length))
  const height = Math.max(320, 76 + result.phaseGroups.length * groupGap + maxGroupSize * laneStep + 60)

  return (
    <section className="unwrap-panel" style={{ overflow: 'hidden' }}>
      <div className="section-heading compact">
        <div><span className="eyebrow">WINDING LAYOUT</span><h3>Развёртка обмотки</h3></div>
        <span className="status-dot">{coils.length} КАТУШЕК · ШАГ {step}</span>
      </div>
      <div className="unwrap-toolbar">
        <span>Катушки сгруппированы по фазе и полярности.</span>
        {selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}
      </div>

      {selectedCoil && (
        <div className="unwrap-selected" style={{ position: 'relative', zIndex: 10, margin: '10px 0 12px', padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px 14px', alignItems: 'center', background: '#0b0f15', border: '1px solid #394454', borderRadius: 10, boxSizing: 'border-box' }}>
          <strong>Катушка №{selectedCoil.number}</strong>
          <span>Паз {selectedCoil.sideA} → паз {selectedCoil.sideB}</span>
          <span>Фаза: {selectedCoil.phase} {selectedCoil.polarity}</span>
          <span>{groupByCoil.get(selectedCoil.number)?.label ?? 'Группа не определена'}</span>
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
                  <line x1={x} y1={32} x2={x} y2={height - 22} stroke={color} strokeWidth={selectedSide ? 4 : 2.5} opacity={0.28} />
                  <text x={x} y={18} textAnchor="middle" fontSize="13" fontWeight={selectedSide ? 800 : 600} fill={selectedSide ? color : '#eef2f7'}>{slot}</text>
                </g>
              )
            })}

            {result.phaseGroups.map((group, groupIndex) => {
              const members = groupMembers.get(groupIndex) ?? []
              const color = phaseColors[group.phase] ?? '#8b95a5'
              const groupDimmed = selected !== null && !members.some((coil) => coil.number === selected)
              const baseY = 56 + groupIndex * groupGap
              return (
                <g key={`${group.phase}${group.polarity}-${groupIndex}`} opacity={groupDimmed ? .22 : 1}>
                  <rect x="4" y={baseY - 12} width="26" height="22" rx="4" fill="#0b0f15" stroke={color} />
                  <text x="17" y={baseY + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>Г{groupIndex + 1}</text>
                  {members.map((coil, localIndex) => {
                    const x1 = left + (coil.sideA - 1) * slotGap
                    const x2 = left + (coil.sideB - 1) * slotGap
                    const y = baseY + localIndex * laneStep
                    const active = selected === coil.number
                    const lineWidth = active ? 5 : 3
                    const labelX = (x1 + x2) / 2
                    return (
                      <g key={coil.number} onClick={() => setSelected(coil.number)} opacity={active || selected === null ? 1 : .18} style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
                        <line x1={x1} y1={y - 14} x2={x1} y2={y} stroke={color} strokeWidth={lineWidth} />
                        <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={lineWidth} />
                        <line x1={x2} y1={y} x2={x2} y2={y + 14} stroke={color} strokeWidth={lineWidth} />
                        <rect x={labelX - 15} y={y - 10} width="30" height="20" rx="3" fill="#0b0f15" stroke={active ? color : 'none'} />
                        <text x={labelX} y={y + 5} textAnchor="middle" fontSize="12" fontWeight="800" fill={color}>К{coil.number}</text>
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
      <p className="diagram-note">Г1, Г2 и т. д. — фазные группы. Цвет показывает фазу, знак +/− — полярность. Вертикальные отводы катушек заканчиваются на уровне своей группы.</p>
    </section>
  )
}
