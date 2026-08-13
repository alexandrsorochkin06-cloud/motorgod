import { useMemo, useState } from 'react'

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

  const poleEstimate = useMemo(() => {
    const frequency = Number(state.frequency)
    const rpm = Number(state.rpm)
    if (!frequency || !rpm) return null

    const candidates = [2, 4, 6, 8, 10, 12]
    return candidates.reduce((best, poles) => {
      const synchronous = (120 * frequency) / poles
      const bestError = Math.abs(best.rpm - rpm)
      const error = Math.abs(synchronous - rpm)
      return error < bestError ? { poles, rpm: synchronous } : best
    }, { poles: 2, rpm: (120 * frequency) / 2 })
  }, [state.frequency, state.rpm])

  function update(field: keyof CalculatorState, value: string) {
    setState((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">MG</span>
          <div>
            <strong>MotorGod</strong>
            <span>engineering platform</span>
          </div>
        </div>
        <button className="ghost-button" type="button">PRO скоро</button>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">⚡ ENGINEERING CORE · v0.1</div>
          <h1>Инженерный помощник<br /><em>по электродвигателям.</em></h1>
          <p>Расчёты, обмотки, схемы и диагностика — в одном рабочем пространстве.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#calculator">Начать расчёт <span>→</span></a>
            <a className="secondary-button" href="#features">Возможности</a>
          </div>
        </section>

        <section className="feature-grid" id="features">
          <article><span>01</span><h2>Расчёт двигателя</h2><p>Базовые параметры, частота, обороты, полюса и геометрия.</p></article>
          <article><span>02</span><h2>Расчёт обмотки</h2><p>Будущий модуль для витков, шага, провода и соединения фаз.</p></article>
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
            <button className="primary-button full" type="submit">Проверить параметры <span>→</span></button>
          </form>

          {submitted && (
            <div className="result-panel">
              <div><span>Предварительная оценка</span><strong>{poleEstimate ? `${poleEstimate.poles} полюса · синхронная скорость ${poleEstimate.rpm.toFixed(0)} об/мин` : 'Добавьте частоту и обороты'}</strong></div>
              <small>Это только первичная оценка. Полный инженерный расчёт будет добавлен следующим этапом.</small>
            </div>
          )}
        </section>
      </main>

      <footer>MotorGod · инженерный расчётный движок · 2026</footer>
    </div>
  )
}

export default App
