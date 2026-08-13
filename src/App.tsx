import { useMemo, useState } from 'react'
import { analyzeMotor } from './engine/motor'

type CalculatorState = {
  power: string
  voltage: string
  frequency: string
  rpm: string
  slots: string
  phases: string
}

const initialState: CalculatorState = {
  power: '',
  voltage: '',
  frequency: '50',
  rpm: '',
  slots: '',
  phases: '3',
}

function App() {
  const [state, setState] = useState<CalculatorState>(initialState)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const analysis = useMemo(() => {
    if (!submitted) return null
    try {
      return analyzeMotor({
        powerKw: state.power ? Number(state.power) : undefined,
        voltageV: state.voltage ? Number(state.voltage) : undefined,
        frequencyHz: Number(state.frequency),
        rpm: Number(state.rpm),
        slots: Number(state.slots),
        phases: Number(state.phases),
      })
    } catch {
      return null
    }
  }, [state, submitted])

  function update(field: keyof CalculatorState, value: string) {
    setState((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
    setError('')
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const values = [state.frequency, state.rpm, state.slots, state.phases]
    if (values.some((value) => !value || Number(value) <= 0)) {
      setError('Заполните частоту, обороты, количество пазов и количество фаз.')
      setSubmitted(false)
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">MG</span>
          <div><strong>MotorGod</strong><span>engineering platform</span></div>
        </div>
        <button className="ghost-button" type="button">PRO скоро</button>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">⚡ ENGINEERING CORE · v0.2</div>
          <h1>Инженерный помощник<br /><em>по электродвигателям.</em></h1>
          <p>Расчёты, обмотки, схемы и диагностика — в одном рабочем пространстве.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#calculator">Начать расчёт <span>→</span></a>
            <a className="secondary-button" href="#features">Возможности</a>
          </div>
        </section>

        <section className="feature-grid" id="features">
          <article><span>01</span><h2>Расчёт двигателя</h2><p>Синхронная скорость, число полюсов, скольжение и параметры зубцовой зоны.</p></article>
          <article><span>02</span><h2>Расчёт обмотки</h2><p>Следующий слой движка: q, полюсный шаг, шаг катушки и распределение катушек.</p></article>
          <article><span>03</span><h2>Схемы</h2><p>Графическое представление пазов и катушек без ручного черчения.</p></article>
        </section>

        <section className="calculator-card" id="calculator">
          <div className="section-heading">
            <div><div className="eyebrow">MOTOR ANALYZER</div><h2>Первичный анализ двигателя</h2></div>
            <span className="status-dot">● CORE ONLINE</span>
          </div>

          <form onSubmit={submit}>
            <div className="form-grid">
              <label>Мощность, кВт<input inputMode="decimal" value={state.power} onChange={(e) => update('power', e.target.value)} placeholder="Например 5.5" /></label>
              <label>Напряжение, В<input inputMode="decimal" value={state.voltage} onChange={(e) => update('voltage', e.target.value)} placeholder="380" /></label>
              <label>Частота, Гц<input inputMode="decimal" value={state.frequency} onChange={(e) => update('frequency', e.target.value)} placeholder="50" /></label>
              <label>Обороты, об/мин<input inputMode="decimal" value={state.rpm} onChange={(e) => update('rpm', e.target.value)} placeholder="1450" /></label>
              <label>Количество пазов<input inputMode="numeric" value={state.slots} onChange={(e) => update('slots', e.target.value)} placeholder="36" /></label>
              <label>Фаз<input inputMode="numeric" value={state.phases} onChange={(e) => update('phases', e.target.value)} placeholder="3" /></label>
            </div>
            <button className="primary-button full" type="submit">Выполнить инженерный анализ <span>→</span></button>
          </form>

          {error && <div className="result-panel error-panel"><strong>{error}</strong></div>}

          {analysis && (
            <div className="result-panel">
              <div><span>Тип оценки</span><strong>Предварительный расчёт для асинхронного двигателя</strong></div>
              <div><span>Число полюсов</span><strong>{analysis.poles}</strong></div>
              <div><span>Синхронная скорость</span><strong>{analysis.synchronousRpm.toFixed(1)} об/мин</strong></div>
              <div><span>Расчётное скольжение</span><strong>{analysis.slipPercent.toFixed(2)}%</strong></div>
              <div><span>Полюсный шаг</span><strong>{analysis.polePitchSlots.toFixed(2)} пазов</strong></div>
              <div><span>Пазов на полюс и фазу, q</span><strong>{analysis.slotsPerPolePerPhase.toFixed(3)}</strong></div>
              <div><span>Электрический угол паза</span><strong>{analysis.electricalSlotAngleDeg.toFixed(2)}°</strong></div>
              <div><span>Полный шаг катушки</span><strong>{analysis.fullPitchCoilSpan} пазов</strong></div>
              <div><span>Тип пазовой структуры</span><strong>{analysis.windingType === 'integral-slot' ? 'Целочисленная' : 'Дробная'}</strong></div>
              {analysis.warnings.length > 0 && (
                <div className="warnings"><span>Проверки и предупреждения</span>{analysis.warnings.map((warning) => <small key={warning}>⚠ {warning}</small>)}</div>
              )}
              <small>Расчёт не определяет витки и диаметр провода: для этого потребуются дополнительные магнитные и тепловые параметры.</small>
            </div>
          )}
        </section>
      </main>

      <footer>MotorGod · инженерный расчётный движок · 2026</footer>
    </div>
  )
}

export default App
