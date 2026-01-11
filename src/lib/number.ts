export function toNonNegativeNumber(value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numberValue)) return 0
  return Math.max(0, numberValue)
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
