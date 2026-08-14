import { useMemo, useState } from 'react'
import type { WindingResult } from '../engine/winding'
import { buildConnectionModel, type ConnectionMode } from '../engine/connectionModel'

type Props = { result: WindingResult }
const phaseColors: Record<string, string> = { A: '#fbbf24', B: '#38bdf8', C: '#34d399' }

export function ConnectionDiagram({ result }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [mode, setMode] = useState<ConnectionMode>('Y')
  const model = useMemo(() => buildConnectionModel(result, mode), [result, mode])
  const selectedPhase = model.phases.find((phase) => phase.phase === ['A', 'B', 'C'][selected ?? -1])

  return <section className="unwrap-panel" style={{ overflow: 'hidden', marginTop: 16 }}>
    <div className="section-heading compact"><div><span className="eyebrow">ELECTRICAL CONNECTION</span><h3>Схема соединения групп</h3></div><span className="status-dot">{mode === 'Y' ? 'ЗВЕЗДА Y' : 'ТРЕУГОЛЬНИК Δ'}</span></div>
    <div className="schema-switch"><span>Соединение</span><button type="button" className={mode === 'Y' ? 'active' : ''} onClick={() => setMode('Y')}>Звезда Y</button><button type="button" className={mode === 'delta' ? 'active' : ''} onClick={() => setMode('delta')}>Треугольник Δ</button></div>
    <div className="unwrap-toolbar"><span>Расчётная модель: группы → фазные выводы → схема соединения.</span>{selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}</div>
    <div style={{ display: 'grid', gap: 12, padding: '8px 0' }}>
      {model.phases.map((phase) => { const color = phaseColors[phase.phase] ?? '#8b95a5'; const active = selected === ['A', 'B', 'C'].indexOf(phase.phase); return <article key={phase.phase} style={{ border: `1px solid ${color}55`, borderRadius: 12, padding: 12, background: active ? `${color}0d` : '#0b0f15' }}>
        <button type="button" onClick={() => setSelected(active ? null : ['A', 'B', 'C'].indexOf(phase.phase))} style={{ width: '100%', border: 0, background: 'transparent', color: '#eef2f7', textAlign: 'left', padding: 0, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><strong style={{ color, fontSize: 18 }}>Фаза {phase.phase}</strong><span>{phase.startTerminal} → {phase.endTerminal}</span><span style={{ marginLeft: 'auto', opacity: .65 }}>{phase.coils.length} кат.</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}><div><small>Положительная группа</small><div>Г{phase.positiveGroup}</div></div><div><small>Отрицательная группа</small><div>Г{phase.negativeGroup}</div></div><div><small>Расчётная цепочка катушек</small><div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>{phase.coils.map((coil, index) => <span key={coil.number} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><b>К{coil.number}</b><small>({coil.sideA}→{coil.sideB})</small>{index < phase.coils.length - 1 && <span style={{ color }}>→</span>}</span>)}</div></div></div>
        </button>
      </article> })}
    </div>
    <div className="simple-schema" style={{ marginTop: 10 }}><div className="schema-title">Топология соединения</div>{model.links.map((link) => <div className="simple-phase" key={link}><span>{link}</span></div>)}{model.commonPoint && <small>Общая точка: STAR. Все три конца фаз сводятся в одну точку.</small>}</div>
    {model.warnings.length > 0 && <div className="warnings"><span>Ограничения модели</span>{model.warnings.map((warning) => <small key={warning}>⚠ {warning}</small>)}</div>}
    {selectedPhase && <div className="unwrap-selected" style={{ marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #394454' }}><strong>Фаза {selectedPhase.phase}</strong><div>Выводы: {selectedPhase.startTerminal} / {selectedPhase.endTerminal}</div><div>Группы: Г{selectedPhase.positiveGroup} и Г{selectedPhase.negativeGroup}</div></div>}
    <p className="diagram-note">Это инженерная модель топологии выводов. Она не утверждает фактическое начало/конец провода катушки без отдельного алгоритма определения ЭДС и направления намотки.</p>
  </section>
}
