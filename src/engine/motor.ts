export type MotorInput = {
  powerKw?: number
  voltageV?: number
  frequencyHz: number
  rpm: number
  slots: number
  phases: number
  connection?: 'Y' | 'Δ' | 'Y/Δ'
}

export type MotorAnalysis = {
  poles: number
  synchronousRpm: number
  slipPercent: number
  polePitchSlots: number
  slotsPerPolePerPhase: number
  electricalSlotAngleDeg: number
  fullPitchCoilSpan: number
  windingType: 'integral-slot' | 'fractional-slot'
  warnings: string[]
}

const COMMON_POLES = [2, 4, 6, 8, 10, 12]

function nearestPoleCount(frequencyHz: number, rpm: number): number {
  return COMMON_POLES.reduce((best, poles) => {
    const speed = (120 * frequencyHz) / poles
    const bestError = Math.abs((120 * frequencyHz) / best - rpm)
    const error = Math.abs(speed - rpm)
    return error < bestError ? poles : best
  }, COMMON_POLES[0])
}

export function analyzeMotor(input: MotorInput): MotorAnalysis {
  const warnings: string[] = []
  const poles = nearestPoleCount(input.frequencyHz, input.rpm)
  const synchronousRpm = (120 * input.frequencyHz) / poles
  const slipPercent = ((synchronousRpm - input.rpm) / synchronousRpm) * 100
  const polePitchSlots = input.slots / poles
  const slotsPerPolePerPhase = input.slots / (poles * input.phases)
  const electricalSlotAngleDeg = (180 * poles) / input.slots
  const fullPitchCoilSpan = Math.round(polePitchSlots)
  const windingType = Number.isInteger(slotsPerPolePerPhase) ? 'integral-slot' : 'fractional-slot'

  if (!Number.isInteger(input.slots) || input.slots <= 0) {
    throw new Error('Количество пазов должно быть положительным целым числом.')
  }
  if (!Number.isInteger(input.phases) || input.phases < 1) {
    throw new Error('Количество фаз должно быть положительным целым числом.')
  }
  if (input.frequencyHz <= 0 || input.rpm <= 0) {
    throw new Error('Частота и обороты должны быть больше нуля.')
  }
  if (input.rpm >= synchronousRpm) {
    warnings.push('Обороты не ниже синхронной скорости. Для обычного асинхронного двигателя это требует дополнительной проверки режима или исходных данных.')
  }
  if (slipPercent > 8) {
    warnings.push(`Расчётное скольжение ${slipPercent.toFixed(2)}% выглядит высоким для типового асинхронного двигателя. Проверьте обороты и частоту.`)
  }
  if (!Number.isInteger(slotsPerPolePerPhase)) {
    warnings.push('q = Z / (2p·m) не является целым. Для точной схемы потребуется расчёт дробной распределённой обмотки.')
  }
  if (!Number.isInteger(polePitchSlots)) {
    warnings.push('Полюсный шаг в пазах не является целым. Полный шаг катушки требует специального выбора шага и проверки схемы.')
  }

  return {
    poles,
    synchronousRpm,
    slipPercent,
    polePitchSlots,
    slotsPerPolePerPhase,
    electricalSlotAngleDeg,
    fullPitchCoilSpan,
    windingType,
    warnings,
  }
}
