import type { Coil, WindingResult } from './winding'

export type CoilElectricalInfo = {
  coil: Coil
  startSlot: number
  endSlot: number
  emfSign: 1 | -1
  direction: 'A→B' | 'B→A'
}

export function analyzeCoilPolarity(result: WindingResult): CoilElectricalInfo[] {
  return result.coilTable.map((coil) => {
    // A/B are the two calculated sides of the coil. The phase polarity of side A
    // is the reference; the opposite side has the opposite induced EMF sign.
    const emfSign: 1 | -1 = coil.polarity === '+' ? 1 : -1
    const forward = coil.sideB >= coil.sideA
    return {
      coil,
      startSlot: forward ? coil.sideA : coil.sideB,
      endSlot: forward ? coil.sideB : coil.sideA,
      emfSign,
      direction: forward ? 'A→B' : 'B→A',
    }
  })
}
