import type { Coil, PhaseGroup, WindingResult } from './winding'

export type ConnectionMode = 'Y' | 'delta'
export type PhaseConnection = {
  phase: string
  positiveGroup: number
  negativeGroup: number
  coils: Coil[]
  startTerminal: string
  endTerminal: string
}
export type ConnectionModel = {
  mode: ConnectionMode
  phases: PhaseConnection[]
  commonPoint: string | null
  links: string[]
  warnings: string[]
}

function groupKey(group: PhaseGroup): string { return `${group.phase}${group.polarity}` }

export function buildConnectionModel(result: WindingResult, mode: ConnectionMode = 'Y'): ConnectionModel {
  const warnings: string[] = []
  const phases = ['A', 'B', 'C']
  const connections: PhaseConnection[] = []

  phases.forEach((phase) => {
    const positive = result.phaseGroups.find((group) => group.phase === phase && group.polarity === '+')
    const negative = result.phaseGroups.find((group) => group.phase === phase && group.polarity === '-')
    const groupNumbers = [...(positive?.coils ?? []), ...(negative?.coils ?? [])]
    const coils = groupNumbers.map((number) => result.coilTable.find((coil) => coil.number === number)).filter(Boolean) as Coil[]
    connections.push({
      phase,
      positiveGroup: positive ? result.phaseGroups.indexOf(positive) + 1 : 0,
      negativeGroup: negative ? result.phaseGroups.indexOf(negative) + 1 : 0,
      coils,
      startTerminal: phase === 'A' ? 'U1' : phase === 'B' ? 'V1' : 'W1',
      endTerminal: phase === 'A' ? 'U2' : phase === 'B' ? 'V2' : 'W2',
    })
  })

  if (result.phaseGroups.some((group) => group.coils.length === 0)) warnings.push('Одна или несколько фазных групп пусты: электрическое соединение требует проверки.')
  if (result.windingType === 'fractional-slot') warnings.push('Дробная пазовая обмотка: модель соединения является предварительной и требует отдельного алгоритма.')
  warnings.push('Порядок катушек внутри фазы пока не интерпретируется как подтверждённое физическое начало/конец провода.')

  const links = mode === 'Y'
    ? ['U2 + V2 + W2 → общая нулевая точка', 'U1 / V1 / W1 → фазные выводы']
    : ['U2 → V1', 'V2 → W1', 'W2 → U1']

  return { mode, phases: connections, commonPoint: mode === 'Y' ? 'STAR' : null, links, warnings }
}

export { groupKey }
