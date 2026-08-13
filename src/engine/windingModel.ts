import type { Coil, PhaseGroup, WindingResult } from './winding'

export type WindingSection = { id: number; phase: string; polarity: '+' | '-'; coils: number[] }
export type ElectricalPhase = { phase: string; positive: number[]; negative: number[] }

export type WindingModel = {
  sections: WindingSection[]
  phases: ElectricalPhase[]
  checks: string[]
}

export function buildWindingModel(result: WindingResult): WindingModel {
  const sections: WindingSection[] = result.phaseGroups.map((group, index) => ({
    id: index + 1,
    phase: group.phase,
    polarity: group.polarity,
    coils: [...group.coils],
  }))

  const phases = ['A', 'B', 'C'].map((phase) => ({
    phase,
    positive: sections.find((group) => group.phase === phase && group.polarity === '+')?.coils ?? [],
    negative: sections.find((group) => group.phase === phase && group.polarity === '-')?.coils ?? [],
  }))

  const checks: string[] = []
  const expected = result.windingType === 'integer-slot' ? result.slotTable.length / 2 : null
  if (expected !== null && result.coils === expected) checks.push(`✓ ${result.coils} катушек соответствуют двухслойной модели`)
  if (sections.length === 6) checks.push('✓ Сформированы 6 фазных групп: A+, A−, B+, B−, C+, C−')
  if (sections.some((group) => group.coils.length === 0)) checks.push('⚠ Одна или несколько фазных групп пустые — требуется проверка параметров')
  if (result.windingType === 'fractional-slot') checks.push('⚠ Дробная обмотка требует отдельного алгоритма группировки')

  return { sections, phases, checks }
}

export function getCoil(result: WindingResult, number: number): Coil | undefined {
  return result.coilTable.find((coil) => coil.number === number)
}

export function getGroup(result: WindingResult, phase: string, polarity: '+' | '-'): PhaseGroup | undefined {
  return result.phaseGroups.find((group) => group.phase === phase && group.polarity === polarity)
}
