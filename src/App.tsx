import { useMemo, useState } from 'react'
import { analyzeMotor } from './engine/motor'
import { calculateThreePhaseWinding } from './engine/winding'
import { WindingDiagram } from './components/WindingDiagram'

type CalculatorState = { power: string; voltage: string; frequency: string; rpm: string; slots: string; phases: string }
const initialState: CalculatorState = { power: '', voltage: '', frequency: '50', rpm: '', slots: '', phases: '3' }

function App() {
  const [state, setState] = useState<CalculatorState>(initialState)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const analysis = useMemo(() => {
    if (!submitted) return null
    try { return analyzeMotor({ powerKw: state.power ? Number(state.power) : undefined, voltageV: state.voltage ? Number(state.voltage) : undefined, frequencyHz: Number(state.frequency), rpm: Number(state.rpm), slots: Number(state.slots), phases: Number(state.phases) }) } catch { return null }
  }, [state, submitted])

  const winding = useMemo(() => {
    if (!analysis || Number(state.phases) !== 3) return null
    try { return calculateThreePhaseWinding({ slots: Number(state.slots), phases: 3, poles: analysis.poles }) } catch { return null }
  }, [analysis, state.slots, state.phases])

  function update(field: keyof CalculatorState, value: string) { setState((current) => ({ ...current, [field]: value })); setSubmitted(false); setError('') }
  function submit(event: React.FormEvent) {
    event.preventDefault()
    const values = [state.frequency, state.rpm, state.slots, state.phases]
    if (values.some((value) => !value || Number(value) <= 0)) { setError('Заполните частоту, обороты, количество пазов и количество фаз.'); setSubmitted(false); return }
    if (Number(state.phases) !== 3) { setError('На этом этапе расчёт обмотки поддерживает только трёхфазные двигатели.'); setSubmitted(false); return }
    setError(''); setSubmitted(true)
  }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">MG</span><div><strong>MotorGod</strong><span>engineering platform</span></div></div><button className="ghost-button" type="button">PRO скоро</button></header>
    <main>
      <section className="hero"><div className="eyebrow">⚡ ENGINEERING CORE · v0.3</div><h1>Инженерный помощник<br /><em>по электродвигателям.</em></h1><p>Расчёты, обмотки, схемы и диагностика — в одном рабочем пространстве.</p><div className="hero-actions"><a className="primary-button" href="#calculator">Начать расчёт <span>→</span></a><a className="secondary-button" href="#features">Возможности</a></div></section>
      <section className="feature-grid" id="features"><article><span>01</span><h2>Расчёт двигателя</h2><p>Синхронная скорость, число полюсов, скольжение и параметры зубцовой зоны.</p></article><article><span>02</span><h2>Расчёт обмотки</h2><p>q, полюсный шаг, шаг катушки и распределение фаз по пазам.</p></article><article><span>03</span><h2>Схемы</h2><p>Расчётная SVG-визуализация статора и соединений катушек.</p></article></section>
      <section className="calculator-card" id="calculator"><div className="section-heading"><div><div className="eyebrow">MOTOR ANALYZER</div><h2>Первичный анализ двигателя</h2></div><span className="status-dot">● CORE ONLINE</span></div>
        <form onSubmit={submit}><div className="form-grid">
          <label>Мощность, кВт<input inputMode="decimal" value={state.power} onChange={(e) => update('power', e.target.value)} placeholder="5.5" /></label><label>Напряжение, В<input inputMode="decimal" value={state.voltage} onChange={(e) => update('voltage', e.target.value)} placeholder="380" /></label><label>Частота, Гц<input inputMode="decimal" value={state.frequency} onChange={(e) => update('frequency', e.target.value)} placeholder="50" /></label><label>Обороты, об/мин<input inputMode="decimal" value={state.rpm} onChange={(e) => update('rpm', e.target.value)} placeholder="1450" /></label><label>Количество пазов<input inputMode="numeric" value={state.slots} onChange={(e) => update('slots', e.target.value)} placeholder="36" /></label><label>Фаз<input inputMode="numeric" value={state.phases} onChange={(e) => update('phases', e.target.value)} placeholder="3" /></label>
        </div><button className="primary-button full" type="submit">Выполнить инженерный анализ <span>→</span></button></form>
        {error && <div className="result-panel error-panel"><strong>{error}</strong></div>}
        {analysis && <div className="result-panel"><div><span>Тип оценки</span><strong>Предварительный расчёт для асинхронного двигателя</strong></div><div><span>Число полюсов</span><strong>{analysis.poles}</strong></div><div><span>Синхронная скорость</span><strong>{analysis.synchronousRpm.toFixed(1)} об/мин</strong></div><div><span>Расчётное скольжение</span><strong>{analysis.slipPercent.toFixed(2)}%</strong></div><div><span>Полюсный шаг</span><strong>{analysis.polePitchSlots.toFixed(2)} пазов</strong></div><div><span>Пазов на полюс и фазу, q</span><strong>{analysis.slotsPerPolePerPhase.toFixed(3)}</strong></div><div><span>Электрический угол паза</span><strong>{analysis.electricalSlotAngleDeg.toFixed(2)}°</strong></div><div><span>Полный шаг катушки</span><strong>{analysis.fullPitchCoilSpan} пазов</strong></div><div><span>Тип пазовой структуры</span><strong>{analysis.windingType === 'integral-slot' ? 'Целочисленная' : 'Дробная'}</strong></div>
          {analysis.warnings.length > 0 && <div className="warnings"><span>Проверки и предупреждения</span>{analysis.warnings.map((warning) => <small key={warning}>⚠ {warning}</small>)}</div>}
        </div>}
        {winding && <section className="winding-result"><div className="section-heading compact"><div><div className="eyebrow">WINDING ENGINE</div><h2>Расчётная схема обмотки</h2></div><span className="status-dot">{winding.windingType === 'integer-slot' ? 'INTEGER SLOT' : 'FRACTIONAL SLOT'}</span></div>
          <div className="winding-summary"><div><span>q</span><strong>{winding.slotsPerPolePerPhase.toFixed(3)}</strong></div><div><span>Полюсный шаг</span><strong>{winding.polePitch} паз.</strong></div><div><span>Шаг катушки</span><strong>{winding.coilPitch} паз.</strong></div><div><span>Катушек</span><strong>{winding.coils}</strong></div></div>
          <WindingDiagram result={winding} />
          {winding.warnings.length > 0 && <div className="warnings"><span>Проверки схемы</span>{winding.warnings.map((warning) => <small key={warning}>⚠ {warning}</small>)}</div>}
          {winding.slotTable.length > 0 && <div className="slot-table-wrap"><h3>Пазовая таблица</h3><div className="slot-table">{winding.slotTable.map((slot) => <div className="slot-row" key={slot.slot}><strong>{slot.slot}</strong><span>Фаза {slot.phase}</span><span>{slot.polarity}</span></div>)}</div></div>}
          <p className="engineering-note">Это расчётная визуализация распределения пазов. Она не является готовой картой перемотки: перед практической работой необходима инженерная проверка магнитных, фазовых и соединительных параметров.</p>
        </section>}
        <small className="result-disclaimer">Количество витков и диаметр провода пока не определяются: для них потребуется следующий расчётный уровень с магнитными и тепловыми параметрами.</small>
      </section>
    </main><footer>MotorGod · инженерный расчётный движок · 2026</footer>
  </div>
}
export default App
