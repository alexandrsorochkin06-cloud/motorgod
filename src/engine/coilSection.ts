import type { Coil, WindingResult } from './winding'

export type CoilSection = {
  id: string
  coilNumber: number
  sectionIndex: number
  sideA: number
  sideB: number
  phase: string
  polarity: '+' | '-'
  span: number
}

export type CoilSectionModel = {
  sections: CoilSection[]
  sectionsPerCoil: number
  warnings: string[]
}

export function buildCoilSectionModel(result: WindingResult, sectionsPerCoil = 1): CoilSectionModel {
  const safeSections = Math.max(1, Math.floor(sectionsPerCoil))
  const sections: CoilSection[] = []
  const warnings: string[] = []

  result.coilTable.forEach((coil: Coil) => {
    const span = Math.abs(coil.sideB - coil.sideA)
    for (let index = 0; index < safeSections; index += 1) {
      sections.push({
        id: `K${coil.number}-S${index + 1}`,
        coilNumber: coil.number,
        sectionIndex: index + 1,
        sideA: coil.sideA,
        sideB: coil.sideB,
        phase: coil.phase,
        polarity: coil.polarity,
        span,
      })
    }
  })

  if (safeSections > 1) {
    warnings.push('Секции пока наследуют пазы и полярность родительской катушки. Реальное дробление по пазам требует отдельного правила укладки.')
  }
  return { sections, sectionsPerCoil: safeSections, warnings }
}
