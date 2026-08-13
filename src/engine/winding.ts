export type WindingInput = {
  slots: number
  phases: number
  poles: number
  coilPitch?: number
}

export type WindingResult = {
  slotsPerPolePerPhase: number
  polePitch: number
  coilPitch: number
  windingType: 'integer-slot' | 'fractional-slot'
  layers: 2
  coils: number
  phaseSequence: string[]
  slotTable: Array<{ slot: number; phase: string; polarity: '+' | '-' }>
  warnings: string[]
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const remainder = a % b
    a = b
    b = remainder
  }
  return Math.abs(a)
}

export function calculateThreePhaseWinding(input: WindingInput): WindingResult {
  const { slots, phases, poles } = input

  if (!Number.isInteger(slots) || slots <= 0) throw new Error('Количество пазов должно быть положительным целым числом.')
  if (!Number.isInteger(phases) || phases <= 0) throw new Error('Количество фаз должно быть положительным целым числом.')
  if (!Number.isInteger(poles) || poles <= 0 || poles % 2 !== 0) throw new Error('Число полюсов должно быть положительным чётным числом.')
  if (slots < poles * phases) throw new Error('Слишком мало пазов для указанного числа полюсов и фаз.')

  const q = slots / (poles * phases)
  const polePitch = slots / poles
  const coilPitch = input.coilPitch ?? Math.round(polePitch)
  const windingType = Number.isInteger(q) ? 'integer-slot' : 'fractional-slot'
  const warnings: string[] = []

  if (!Number.isInteger(coilPitch) || coilPitch <= 0 || coilPitch > polePitch) {
    warnings.push('Шаг катушки должен быть положительным целым числом и не превышать полюсный шаг.')
  }

  if (windingType === 'fractional-slot') {
    warnings.push(`q = ${q.toFixed(4)}: используется дробная пазовая структура. Автоматическая схема пока ограничена.`)
  }

  const phaseSequence = ['A', 'B', 'C']
  const slotTable: WindingResult['slotTable'] = []

  if (windingType === 'integer-slot') {
    const slotsPerPhasePerPole = q
    const phaseBandWidth = slotsPerPhasePerPole
    const poleBlock = phases * phaseBandWidth

    for (let slot = 1; slot <= slots; slot += 1) {
      const indexInPole = (slot - 1) % poleBlock
      const phaseIndex = Math.floor(indexInPole / phaseBandWidth) % phases
      const poleIndex = Math.floor((slot - 1) / poleBlock)
      const polarity = poleIndex % 2 === 0 ? '+' : '-'
      slotTable.push({ slot, phase: phaseSequence[phaseIndex] ?? `F${phaseIndex + 1}`, polarity })
    }
  } else {
    // Для дробных пазовых обмоток не выдаём фиктивную схему.
    // Таблица остаётся пустой до реализации корректного распределения фазовых зон.
    warnings.push('Пазовая таблица для дробной обмотки будет построена отдельным алгоритмом.')
  }

  const reduced = gcd(slots, poles * phases)
  if (reduced > 1 && windingType === 'fractional-slot') {
    warnings.push(`Структура сокращается по НОД = ${reduced}; потребуется отдельная проверка повторяемости фазовых зон.`)
  }

  return {
    slotsPerPolePerPhase: q,
    polePitch,
    coilPitch,
    windingType,
    layers: 2,
    coils: slots,
    phaseSequence,
    slotTable,
    warnings,
  }
}
