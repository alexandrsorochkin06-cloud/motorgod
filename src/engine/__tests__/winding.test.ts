import { describe, expect, it } from 'vitest'
import { calculateThreePhaseWinding } from '../winding'

describe('calculateThreePhaseWinding', () => {
  it('calculates a 36-slot 4-pole 3-phase integer-slot winding', () => {
    const result = calculateThreePhaseWinding({ slots: 36, phases: 3, poles: 4 })

    expect(result.slotsPerPolePerPhase).toBe(3)
    expect(result.polePitch).toBe(9)
    expect(result.coilPitch).toBe(9)
    expect(result.windingType).toBe('integer-slot')
    expect(result.slotTable).toHaveLength(36)
    expect(result.slotTable[0]).toEqual({ slot: 1, phase: 'A', polarity: '+' })
    expect(result.slotTable[9]).toEqual({ slot: 10, phase: 'A', polarity: '-' })
  })

  it('does not invent a full slot table for a fractional-slot winding', () => {
    const result = calculateThreePhaseWinding({ slots: 30, phases: 3, poles: 4 })

    expect(result.windingType).toBe('fractional-slot')
    expect(result.slotTable).toHaveLength(0)
    expect(result.warnings.some((warning) => warning.includes('дробная'))).toBe(true)
  })
})
