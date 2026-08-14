import { useMemo, useState } from 'react'
import type { Coil, WindingResult } from '../engine/winding'

type Props = { result: WindingResult }
const phaseColors: Record<string, string> = { A: '#fbbf24', B: '#38bdf8', C: '#34d399' }

export function ConnectionDiagram({ result }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const coils = result.coilTable
  const groups = result.phaseGroups
  const groupMap = useMemo(() => {
    const map = new Map<number, { index: number; phase: string; polarity: string }>()
    groups.forEach((group, index) => group.coils.forEach((number) => map.set(number, { index, phase: group.phase, polarity: group.polarity })))
    return map
  }, [groups])

  return <section className="unwrap-panel" style={{ overflow: 'hidden', marginTop: 16 }}>
    <div className="section-heading compact"><div><span className="eyebrow">ELECTRICAL CONNECTION</span><h3>Схема соединения групп</h3></div><span className="status-dot">{groups.length} ГРУПП</span></div>
    <div className="unwrap-toolbar"><span>Логическая последовательность групп по фазе и полярности.</span>{selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}</div>
    <div style={{ display: 'grid', gap: 14, padding: '8px 0' }}>
      {groups.map((group, groupIndex) => {
        const color = phaseColors[group.phase] ?? '#8b95a5'
        const members = group.coils.map((number) => coils.find((coil) => coil.number === number)).filter(Boolean) as Coil[]
        return <div key={`${group.phase}-${group.polarity}-${groupIndex}`} style={{ border: `1px solid ${color}55`, borderRadius: 12, padding: 12, background: '#0b0f15' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><strong style={{ color }}>Г{groupIndex + 1}</strong><span>Фаза {group.phase}</span><span>{group.polarity}</span><span style={{ marginLeft: 'auto', opacity: .65 }}>{members.length} кат.</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            {members.map((coil, index) => <div key={coil.number} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <button onClick={() => setSelected(coil.number)} style={{ border: `1px solid ${selected === coil.number ? color : '#394454'}`, background: selected === coil.number ? `${color}18` : '#11161d', color: '#eef2f7', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>К{coil.number}<small style={{ display: 'block', opacity: .65 }}>{coil.sideA}→{coil.sideB}</small></button>
              {index < members.length - 1 && <span aria-hidden="true" style={{ color, fontSize: 18 }}>→</span>}
            </div>)}
          </div>
        </div>
      })}
    </div>
    {selected !== null && (() => { const coil = coils.find((item) => item.number === selected); const group = groupMap.get(selected); if (!coil || !group) return null; return <div className="unwrap-selected" style={{ marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #394454', display: 'grid', gap: 6 }}><strong>Катушка К{coil.number}</strong><span>Пазы: {coil.sideA} → {coil.sideB}</span><span>Фаза: {group.phase} {group.polarity}</span><span>Группа: Г{group.index + 1}</span></div> })()}
    <p className="diagram-note">Важно: стрелки здесь показывают расчётную последовательность элементов группы, а не физическую маркировку начала/конца провода. Электрические перемычки и выводы Y/Δ добавим после проверки алгоритма.</p>
  </section>
}
