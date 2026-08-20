import type { WindingResult } from './winding'
import { buildCoilSectionModel, type CoilSectionModel } from './coilSection'

export type WindingLayer = 'single' | 'double'
export type WindingFractionality = 'integer' | 'fractional'

export type WindingTopology = {
  layer: WindingLayer
  fractionality: WindingFractionality
  coilPitch: number
  sectionsPerCoil: number
  slotSequence: number[]
  coilSections: CoilSectionModel
  warnings: string[]
}

export function buildWindingTopology(
  result: WindingResult,
  options: Partial<Pick<WindingTopology, 'layer' | 'fractionality' | 'sectionsPerCoil'>> = {},
): WindingTopology {
  const layer = options.layer ?? 'double'
  const fractionality = options.fractionality ?? 'integer'
  const sectionsPerCoil = Math.max(1, Math.floor(options.sectionsPerCoil ?? 1))
  const topologyWarnings: string[] = []

  if (layer === 'double' && result.coilTable.length * 2 !== result.slotTable.length) {
    topologyWarnings.push('Для двухслойной модели число сторон катушек не совпадает с числом пазов; проверьте исходный расчёт.')
  }
  if (fractionality === 'fractional') {
    topologyWarnings.push('Дробная обмотка требует отдельного правила распределения секций по пазам.')
  }
  if (sectionsPerCoil > 1) {
    topologyWarnings.push('Многосекционная укладка пока не меняет физические пазовые стороны автоматически.')
  }

  return {
    layer,
    fractionality,
    coilPitch: result.coilPitch,
    sectionsPerCoil,
    slotSequence: result.slotTable.map((slot) => slot.slot),
    coilSections: buildCoilSectionModel(result, sectionsPerCoil),
    warnings: [...topologyWarnings, ...buildCoilSectionModel(result, sectionsPerCoil).warnings],
  }
}
