import type { Coil, WindingResult } from './winding'
import { analyzeCoilPolarity, type CoilElectricalInfo } from './coilPolarity'

export type PhaseChain = {
  phase: string
  positiveGroup: number | null
  negativeGroup: number | null
  positive: CoilElectricalInfo[]
  negative: CoilElectricalInfo[]
  ordered: CoilElectricalInfo[]
  startTerminal: string
  endTerminal: string
  checks: string[]
}

export type PhaseConnectionModel = {
  phases: PhaseChain[]
  balanced: boolean
  warnings: string[]
}

const terminal = (phase: string, end: boolean) => {
  if (phase === 'A') return end ? 'U2' : 'U1'
  if (phase === 'B') return end ? 'V2' : 'V1'
  return end ? 'W2' : 'W1'
}

export function buildPhaseConnectionModel(result: WindingResult): PhaseConnectionModel {
  const electrical = analyzeCoilPolarity(result)
  const warnings: string[] = []
  const phases = ['A', 'B', 'C'].map((phase): PhaseChain => {
    const positiveGroup = result.phaseGroups.findIndex((g) => g.phase === phase && g.polarity === '+')
    const negativeGroup = result.phaseGroups.findIndex((g) => g.phase === phase && g.polarity === '-')
    const positive = electrical.filter((item) => item.coil.phase === phase && item.coil.polarity === '+')
    const negative = electrical.filter((item) => item.coil.phase === phase && item.coil.polarity === '-')
    const ordered = [...positive, ...negative]
    const checks: string[] = []
    if (!positive.length) checks.push('Нет катушек положительной полярности')
    if (!negative.length) checks.push('Нет катушек отрицательной полярности')
    if (positive.length !== negative.length) checks.push('Количество катушек + и − различается')
    if (!checks.length) checks.push('Полярности обеих групп присутствуют')
    return { phase, positiveGroup: positiveGroup >= 0 ? positiveGroup + 1 : null, negativeGroup: negativeGroup >= 0 ? negativeGroup + 1 : null, positive, negative, ordered, startTerminal: terminal(phase, false), endTerminal: terminal(phase, true), checks }
  })
  const counts = phases.map((phase) => phase.ordered.length)
  const balanced = counts.every((count) => count === counts[0] && count > 0)
  if (!balanced) warnings.push('Фазы имеют различное количество рассчитанных катушек; симметрия соединения требует проверки.')
  if (result.windingType === 'fractional-slot') warnings.push('Для дробной пазовой обмотки цепочка является предварительной: требуется отдельная проверка вектора ЭДС.')
  warnings.push('U1/U2, V1/V2 и W1/W2 являются расчётными терминалами модели, а не подтверждённой маркировкой физического провода.')
  return { phases, balanced, warnings }
}
