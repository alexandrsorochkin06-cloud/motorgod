import type { WindingResult } from './winding'

export type DiagramPoint = { x: number; y: number; slot: number }
export type CoilConnection = { from: number; to: number; phase: string; polarity: '+' | '-' }

export type WindingDiagram = {
  size: number
  center: number
  radius: number
  points: DiagramPoint[]
  connections: CoilConnection[]
}

export function buildWindingDiagram(result: WindingResult, size = 560): WindingDiagram {
  const center = size / 2
  const radius = size * 0.36
  const points: DiagramPoint[] = []

  for (let i = 0; i < result.slotTable.length; i += 1) {
    const slot = result.slotTable[i].slot
    const angle = -Math.PI / 2 + (i / result.slotTable.length) * Math.PI * 2
    points.push({
      slot,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    })
  }

  const connections: CoilConnection[] = []
  if (result.slotTable.length > 0 && Number.isInteger(result.coilPitch)) {
    for (const item of result.slotTable) {
      const target = item.slot + result.coilPitch
      if (target <= result.slotTable.length) {
        connections.push({
          from: item.slot,
          to: target,
          phase: item.phase,
          polarity: item.polarity,
        })
      }
    }
  }

  return { size, center, radius, points, connections }
}
