import type { WindingResult } from './winding'

export type ValidationItem = { name: string; passed: boolean; detail: string }
export type ValidationReport = { passed: boolean; items: ValidationItem[] }

function item(name: string, passed: boolean, detail: string): ValidationItem { return { name, passed, detail } }

export function validateWinding(result: WindingResult): ValidationReport {
  const items: ValidationItem[] = []
  const slots = result.slotsPerPolePerPhase * result.polePitch * 3
  const slotNumbers = result.slotTable.map((slot) => slot.slot)
  const uniqueSlots = new Set(slotNumbers)
  items.push(item('Пазовая таблица', result.slotTable.length === slots, `${result.slotTable.length} из ${slots} пазов`))
  items.push(item('Нет дубликатов пазов', uniqueSlots.size === slotNumbers.length, `${uniqueSlots.size} уникальных`))
  const phases = new Set(result.slotTable.map((slot) => slot.phase))
  items.push(item('Все три фазы', ['A', 'B', 'C'].every((phase) => phases.has(phase)), `Фазы: ${[...phases].join(', ') || 'нет'}`))
  const polarities = new Set(result.slotTable.map((slot) => slot.polarity))
  items.push(item('Обе полярности', polarities.has('+') && polarities.has('-'), `Полярности: ${[...polarities].join(', ') || 'нет'}`))
  const validCoils = result.coilTable.every((coil) => coil.sideA >= 1 && coil.sideA <= slots && coil.sideB >= 1 && coil.sideB <= slots && coil.sideA !== coil.sideB)
  items.push(item('Катушки в пределах пазов', validCoils, `${result.coilTable.length} катушек проверено`))
  const expectedCoils = slots / 2
  items.push(item('Количество катушек', result.coilTable.length === expectedCoils, `${result.coilTable.length} / ${expectedCoils}`))
  const phaseCounts = ['A', 'B', 'C'].map((phase) => result.coilTable.filter((coil) => coil.phase === phase).length)
  items.push(item('Баланс фаз', phaseCounts.every((count) => count === phaseCounts[0]), phaseCounts.join(' / ')))
  const groupCounts = result.phaseGroups.map((group) => group.coils.length)
  items.push(item('Фазные группы заполнены', result.phaseGroups.length === 6 && groupCounts.every((count) => count > 0), `${result.phaseGroups.length} групп`))
  return { passed: items.every((check) => check.passed), items }
}

export function referenceCases(): Array<{ name: string; slots: number; poles: number; expectedCoils: number }> {
  return [
    { name: '24 паз / 4 полюса', slots: 24, poles: 4, expectedCoils: 12 },
    { name: '36 паз / 4 полюса', slots: 36, poles: 4, expectedCoils: 18 },
    { name: '48 паз / 4 полюса', slots: 48, poles: 4, expectedCoils: 24 },
  ]
}
