import { useMemo, useState } from 'react'
import type { Coil, WindingResult } from '../engine/winding'

type Props = { result: WindingResult }
const phaseColors: Record<string, string> = { A: '#fbbf24', B: '#38bdf8', C: '#34d399' }

export function WindingUnwrap({ result }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const coils = result.coilTable
  const maxSlot = result.slotTable.length
  const step = result.coilPitch
  const slotGap = 42, left = 34
  const width = Math.max(760, maxSlot * slotGap + 54)
  const groupGap = 88, laneStep = 18
  const byNumber = useMemo(() => new Map(coils.map((coil) => [coil.number, coil])), [coils])
  const selectedCoil = selected === null ? null : byNumber.get(selected)
  const coilsAtSlot = useMemo(() => {
    if (selectedSlot === null) return []
    return coils.filter((coil) => coil.sideA === selectedSlot || coil.sideB === selectedSlot)
  }, [coils, selectedSlot])
  const groupByCoil = useMemo(() => {
    const map = new Map<number, { index: number; label: string }>()
    result.phaseGroups.forEach((group, index) => group.coils.forEach((number) => map.set(number, { index, label: `Г${index + 1} · ${group.phase}${group.polarity}` })))
    return map
  }, [result.phaseGroups])
  const groupMembers = useMemo(() => {
    const map = new Map<number, Coil[]>()
    coils.forEach((coil) => { const group = groupByCoil.get(coil.number); if (!group) return; map.set(group.index, [...(map.get(group.index) ?? []), coil]) })
    return map
  }, [coils, groupByCoil])
  const maxGroupSize = Math.max(1, ...Array.from(groupMembers.values()).map((items) => items.length))
  const height = Math.max(320, 76 + result.phaseGroups.length * groupGap + maxGroupSize * laneStep + 60)

  const selectCoil = (number: number) => { setSelected(number); setSelectedSlot(null) }
  const selectSlot = (slot: number) => {
    setSelectedSlot(slot)
    const first = coils.find((coil) => coil.sideA === slot || coil.sideB === slot)
    setSelected(first?.number ?? null)
  }

  return <section className="unwrap-panel" style={{ overflow: 'hidden' }}>
    <div className="section-heading compact"><div><span className="eyebrow">WINDING LAYOUT</span><h3>Развёртка обмотки</h3></div><span className="status-dot">{coils.length} КАТУШЕК · ШАГ {step}</span></div>
    <div className="unwrap-toolbar"><span>Нажмите катушку или паз — MotorGod покажет их связь.</span>{(selected !== null || selectedSlot !== null) && <button className="secondary-button" onClick={() => { setSelected(null); setSelectedSlot(null) }}>Снять выбор</button>}</div>

    {(selectedCoil || selectedSlot !== null) && <div className="unwrap-selected" style={{ position: 'relative', zIndex: 10, margin: '10px 0 12px', padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '6px 14px', alignItems: 'center', background: '#0b0f15', border: '1px solid #394454', borderRadius: 10, boxSizing: 'border-box' }}>
      {selectedSlot !== null && <><strong>Паз №{selectedSlot}</strong><span>Катушек: {coilsAtSlot.length}</span><span>{coilsAtSlot.map((coil) => `К${coil.number}`).join(' · ') || 'Нет данных'}</span></>}
      {selectedCoil && <><strong>Катушка №{selectedCoil.number}</strong><span>Паз {selectedCoil.sideA} → {selectedCoil.sideB}</span><span>Фаза: {selectedCoil.phase} {selectedCoil.polarity}</span><span>{groupByCoil.get(selectedCoil.number)?.label ?? 'Группа не определена'}</span></>}
    </div>}

    <div className="unwrap-scroll" style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}>
      <div className="unwrap-canvas" style={{ position: 'relative', width, minWidth: width, minHeight: height }}>
        <svg className="unwrap-svg" style={{ display: 'block' }} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Схема укладки обмотки">
          {Array.from({ length: maxSlot }, (_, index) => {
            const slot = index + 1, x = left + index * slotGap, info = result.slotTable[index], color = phaseColors[info?.phase] ?? '#8b95a5'
            const activeSlot = selectedSlot === slot || (!!selectedCoil && (selectedCoil.sideA === slot || selectedCoil.sideB === slot))
            return <g key={slot} onClick={() => selectSlot(slot)} opacity={selected !== null || selectedSlot !== null ? (activeSlot ? 1 : .22) : 1} style={{ cursor: 'pointer', touchAction: 'manipulation' }}><line x1={x} y1={32} x2={x} y2={height - 22} stroke={color} strokeWidth={activeSlot ? 4 : 2.5} opacity={activeSlot ? 1 : .28} /><text x={x} y={18} textAnchor="middle" fontSize="13" fontWeight={activeSlot ? 800 : 600} fill={activeSlot ? color : '#eef2f7'}>{slot}</text></g>
          })}

          {result.phaseGroups.map((group, groupIndex) => {
            const members = groupMembers.get(groupIndex) ?? [], color = phaseColors[group.phase] ?? '#8b95a5', groupDimmed = (selected !== null || selectedSlot !== null) && !members.some((coil) => coil.number === selected || coil.sideA === selectedSlot || coil.sideB === selectedSlot), baseY = 56 + groupIndex * groupGap
            return <g key={`${group.phase}${group.polarity}-${groupIndex}`} opacity={groupDimmed ? .18 : 1}><rect x="4" y={baseY - 12} width="26" height="22" rx="4" fill="#0b0f15" stroke={color} /><text x="17" y={baseY + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>Г{groupIndex + 1}</text>{members.map((coil, localIndex) => { const x1 = left + (coil.sideA - 1) * slotGap, x2 = left + (coil.sideB - 1) * slotGap, y = baseY + localIndex * laneStep, color2 = phaseColors[coil.phase] ?? color, active = selected === coil.number || (selectedSlot !== null && (coil.sideA === selectedSlot || coil.sideB === selectedSlot)), lineWidth = active ? 5 : 3, labelX = (x1 + x2) / 2; return <g key={coil.number} onClick={() => selectCoil(coil.number)} opacity={active || (selected === null && selectedSlot === null) ? 1 : .18} style={{ cursor: 'pointer', touchAction: 'manipulation' }}><line x1={x1} y1={y - 14} x2={x1} y2={y} stroke={color2} strokeWidth={lineWidth} /><line x1={x1} y1={y} x2={x2} y2={y} stroke={color2} strokeWidth={lineWidth} /><line x1={x2} y1={y} x2={x2} y2={y + 14} stroke={color2} strokeWidth={lineWidth} /><rect x={labelX - 15} y={y - 10} width="30" height="20" rx="3" fill="#0b0f15" stroke={active ? color2 : 'none'} /><text x={labelX} y={y + 5} textAnchor="middle" fontSize="12" fontWeight="800" fill={color2}>К{coil.number}</text></g> })}</g>
          })}
        </svg>
      </div>
    </div>
    <p className="diagram-note">Нажмите К — увидеть её пазы. Нажмите паз — увидеть связанные катушки. Цвет показывает фазу, +/− — полярность.</p>
  </section>
}
