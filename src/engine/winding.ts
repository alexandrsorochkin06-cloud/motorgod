export type WindingInput = {
  slots: number
  phases: number
  poles: number
  coilPitch?: number
}

export type Coil = { number: number; phase: string; polarity: '+' | '-'; sideA: number; sideB: number }
export type PhaseGroup = { phase: string; polarity: '+' | '-'; coils: number[] }
export type WindingResult = {
  slotsPerPolePerPhase: number; polePitch: number; coilPitch: number
  windingType: 'integer-slot' | 'fractional-slot'; layers: 2; coils: number
  phaseSequence: string[]; slotTable: Array<{ slot: number; phase: string; polarity: '+' | '-' }>
  coilTable: Coil[]; phaseGroups: PhaseGroup[]; warnings: string[]
}

function gcd(a: number, b: number): number { while (b !== 0) { const r = a % b; a = b; b = r } return Math.abs(a) }

function phaseBelt(index: number): { phase: string; polarity: '+' | '-' } {
  const belts = [
    { phase: 'A', polarity: '+' as const }, { phase: 'C', polarity: '-' as const },
    { phase: 'B', polarity: '+' as const }, { phase: 'A', polarity: '-' as const },
    { phase: 'C', polarity: '+' as const }, { phase: 'B', polarity: '-' as const },
  ]
  return belts[index % belts.length]
}

export function calculateThreePhaseWinding(input: WindingInput): WindingResult {
  const { slots, phases, poles } = input
  if (!Number.isInteger(slots) || slots <= 0) throw new Error('Количество пазов должно быть положительным целым числом.')
  if (!Number.isInteger(phases) || phases <= 0) throw new Error('Количество фаз должно быть положительным целым числом.')
  if (!Number.isInteger(poles) || poles <= 0 || poles % 2 !== 0) throw new Error('Число полюсов должно быть положительным чётным числом.')
  if (phases !== 3) throw new Error('Текущий алгоритм рассчитан на трёхфазную обмотку.')
  if (slots % 2 !== 0) throw new Error('Для текущей двухслойной катушечной модели количество пазов должно быть чётным.')
  if (slots < poles * phases) throw new Error('Слишком мало пазов для указанного числа полюсов и фаз.')

  const q = slots / (poles * phases)
  const polePitch = slots / poles
  const coilPitch = input.coilPitch ?? Math.round(polePitch)
  const windingType = Number.isInteger(q) ? 'integer-slot' : 'fractional-slot'
  const warnings: string[] = []
  const phaseSequence = ['A', 'B', 'C']
  const slotTable: WindingResult['slotTable'] = []
  const coilTable: Coil[] = []
  const phaseGroups: PhaseGroup[] = []

  if (!Number.isInteger(coilPitch) || coilPitch <= 0 || coilPitch > polePitch) warnings.push('Шаг катушки должен быть положительным целым числом и не превышать полюсный шаг.')

  if (windingType === 'fractional-slot') {
    warnings.push(`q = ${q.toFixed(4)}: используется дробная пазовая структура. Автоматическая схема пока ограничена.`)
  }

  if (windingType === 'integer-slot') {
    const poleBlock = phases * q
    const slotsPerBelt = q
    for (let slot = 1; slot <= slots; slot += 1) {
      const indexInPole = (slot - 1) % poleBlock
      const belt = Math.floor(indexInPole / slotsPerBelt)
      const poleIndex = Math.floor((slot - 1) / poleBlock)
      const phase = phaseBelt(belt + poleIndex * 3)
      slotTable.push({ slot, phase: phase.phase, polarity: phase.polarity })
    }

    for (let sideA = 1; sideA <= slots; sideA += 1) {
      const sideB = sideA + coilPitch
      if (sideB > slots) continue
      const side = slotTable[sideA - 1]
      coilTable.push({ number: coilTable.length + 1, phase: side.phase, polarity: side.polarity, sideA, sideB })
    }

    for (const phase of phaseSequence) for (const polarity of ['+', '-'] as const) {
      phaseGroups.push({ phase, polarity, coils: coilTable.filter((coil) => coil.phase === phase && coil.polarity === polarity).map((coil) => coil.number) })
    }
  } else {
    warnings.push('Пазовая таблица, катушки и фазные группы для дробной обмотки будут построены отдельным алгоритмом.')
  }

  if (coilTable.length !== slots / 2 && windingType === 'integer-slot') warnings.push(`Получено ${coilTable.length} катушек вместо ожидаемых ${slots / 2}. Требуется проверка шага катушки.`)
  const reduced = gcd(slots, poles * phases)
  if (reduced > 1 && windingType === 'fractional-slot') warnings.push(`Структура сокращается по НОД = ${reduced}; потребуется отдельная проверка повторяемости фазовых зон.`)

  return { slotsPerPolePerPhase: q, polePitch, coilPitch, windingType, layers: 2, coils: coilTable.length, phaseSequence, slotTable, coilTable, phaseGroups, warnings }
}
