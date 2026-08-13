import { buildWindingDiagram } from '../engine/diagram'
import type { WindingResult } from '../engine/winding'

type Props = { result: WindingResult }

const phaseClass: Record<string, string> = { A: 'phase-a', B: 'phase-b', C: 'phase-c' }

export function WindingDiagram({ result }: Props) {
  const diagram = buildWindingDiagram(result)

  if (!diagram.points.length) {
    return <div className="diagram-empty">Для дробной пазовой структуры графическая схема пока не строится автоматически.</div>
  }

  return (
    <div className="winding-visual">
      <svg viewBox={`0 0 ${diagram.size} ${diagram.size}`} role="img" aria-label="Расчётная схема распределения пазов">
        <circle className="stator-ring" cx={diagram.center} cy={diagram.center} r={diagram.radius + 34} />
        <circle className="stator-core" cx={diagram.center} cy={diagram.center} r={diagram.radius - 28} />

        {diagram.connections.map((connection) => {
          const from = diagram.points[connection.from - 1]
          const to = diagram.points[connection.to - 1]
          if (!from || !to) return null
          return (
            <line
              key={`${connection.from}-${connection.to}`}
              className={`coil-line ${phaseClass[connection.phase] ?? ''}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          )
        })}

        {diagram.points.map((point) => {
          const slot = result.slotTable[point.slot - 1]
          return (
            <g key={point.slot}>
              <circle className={`slot-dot ${phaseClass[slot.phase] ?? ''}`} cx={point.x} cy={point.y} r="13" />
              <text className="slot-number" x={point.x} y={point.y + 4}>{point.slot}</text>
            </g>
          )
        })}
      </svg>

      <div className="diagram-legend">
        <span><i className="legend-dot phase-a" /> Фаза A</span>
        <span><i className="legend-dot phase-b" /> Фаза B</span>
        <span><i className="legend-dot phase-c" /> Фаза C</span>
      </div>
      <p className="diagram-note">Расчётная визуализация распределения пазов. Перед практической перемоткой требуется инженерная проверка схемы.</p>
    </div>
  )
}
