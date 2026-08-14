import { useMemo, useState } from 'react'
import type { WindingResult } from '../engine/winding'
import { buildConnectionModel, type ConnectionMode } from '../engine/connectionModel'
import { buildPhaseConnectionModel } from '../engine/phaseConnectionModel'

type Props = { result: WindingResult }
const phaseColors: Record<string, string> = { A: '#fbbf24', B: '#38bdf8', C: '#34d399' }

export function ConnectionDiagram({ result }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [mode, setMode] = useState<ConnectionMode>('Y')
  const model = useMemo(() => buildConnectionModel(result, mode), [result, mode])
  const phaseModel = useMemo(() => buildPhaseConnectionModel(result), [result])
  const selectedPhase = phaseModel.phases.find((phase) => phase.phase === selected)

  return <section className="unwrap-panel" style={{ overflow: 'hidden', marginTop: 16 }}>
    <div className="section-heading compact"><div><span className="eyebrow">ELECTRICAL CONNECTION</span><h3>Схема соединения групп</h3></div><span className="status-dot">{phaseModel.balanced ? 'ФАЗЫ СБАЛАНСИРОВАНЫ' : 'ПРОВЕРКА ФАЗ'}</span></div>
    <div className="schema-switch"><span>Соединение</span><button type="button" className={mode === 'Y' ? 'active' : ''} onClick={() => setMode('Y')}>Звезда Y</button><button type="button" className={mode === 'delta' ? 'active' : ''} onClick={() => setMode('delta')}>Треугольник Δ</button></div>
    <div className="unwrap-toolbar"><span>Фазная цепочка теперь строится отдельным расчётным модулем.</span>{selected !== null && <button className="secondary-button" onClick={() => setSelected(null)}>Снять выбор</button>}</div>
    <div style={{ display: 'grid', gap: 12, padding: '8px 0' }}>
      {phaseModel.phases.map((phase) => { const color = phaseColors[phase.phase] ?? '#8b95a5'; const active = selected === phase.phase; return <article key={phase.phase} style={{ border: `1px solid ${color}55`, borderRadius: 12, padding: 12, background: active ? `${color}0d` : '#0b0f15' }}>
        <button type="button" onClick={() => setSelected(active ? null : phase.phase)} style={{ width: '100%', border: 0, background: 'transparent', color: '#eef2f7', textAlign: 'left', padding: 0, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}><strong style={{ color, fontSize: 18 }}>Фаза {phase.phase}</strong><span>{phase.startTerminal} → {phase.endTerminal}</span><span style={{ marginLeft: 'auto', opacity: .65 }}>{phase.ordered.length} кат.</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}><div><small>Положительная группа</small><div>Г{phase.positiveGroup ?? '—'} · {phase.positive.length} кат.</div></div><div><small>Отрицательная группа</small><div>Г{phase.negativeGroup ?? '—'} · {phase.negative.length} кат.</div></div><div><small>Цепочка по полярности</small><div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>{phase.ordered.map((item, index) => <span key={item.coil.number} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><b>К{item.coil.number}</b><small>({item.startSlot}→{item.endSlot})</small>{index < phase.ordered.length - 1 && <span style={{ color }}>→</span>}</span>)}</div></div></div>
        </button>
        {active && <div className="unwrap-selected" style={{ marginTop: 10, padding: 10, borderRadius: 9, border: `1px solid ${color}55` }}>{phase.checks.map((check) => <div key={check}>✓ {check}</div>)}</div>}
      </article> })}
    </div>
    <div className="simple-schema" style={{ marginTop: 10 }}><div className="schema-title">Топология соединения</div>{model.links.map((link) => <div className="simple-phase" key={link}><span>{link}</span></div>)}{model.commonPoint && <small>Общая точка: STAR. Все три конца фаз сводятся в одну точку.</small>}</div>
    {phaseModel.warnings.length > 0 && <div className="warnings"><span>Инженерные проверки</span>{phaseModel.warnings.map((warning) => <small key={warning}>⚠ {warning}</small>)}</div>}
    <p className="diagram-note">Фазные цепочки построены из расчётной полярности катушек. U1/U2, V1/V2 и W1/W2 остаются расчётными терминалами до подтверждения физического начала/конца провода.</p>
  </section>
}
