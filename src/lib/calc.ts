import type { Party } from '../types'
import { round2, toNonNegativeNumber } from './number'

export type PartyResult = {
  partyId: string
  partyName: string
  sqm: number
  metersSum: number
  baseShare: number
  heatShare: number
  total: number
  prepayment: number
  balance: number
}

export type CalculationResult = {
  totalSqm: number
  totalMeters: number
  parties: PartyResult[]
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + toNonNegativeNumber(v), 0)
}

export function calculate(
  parties: Party[],
  baseTotal: number,
  heatTotal: number,
): CalculationResult {
  const totalSqm = sum(parties.map((p) => p.sqm))
  const totalMeters = sum(
    parties.flatMap((p) => p.meters.map((m) => m.value)),
  )

  const safeBaseTotal = toNonNegativeNumber(baseTotal)
  const safeHeatTotal = toNonNegativeNumber(heatTotal)

  const results: PartyResult[] = parties.map((party) => {
    const metersSum = sum(party.meters.map((m) => m.value))
    const prepayment = toNonNegativeNumber((party as Party & { prepayment?: number }).prepayment)

    const baseShare =
      totalSqm > 0 ? (safeBaseTotal * toNonNegativeNumber(party.sqm)) / totalSqm : 0

    const heatShare =
      totalMeters > 0 ? (safeHeatTotal * metersSum) / totalMeters : 0

    const roundedBase = round2(baseShare)
    const roundedHeat = round2(heatShare)
    const roundedTotal = round2(roundedBase + roundedHeat)

    const balance = round2(roundedTotal - prepayment)

    return {
      partyId: party.id,
      partyName: party.name,
      sqm: toNonNegativeNumber(party.sqm),
      metersSum,
      baseShare: roundedBase,
      heatShare: roundedHeat,
      total: roundedTotal,
      prepayment: round2(prepayment),
      balance,
    }
  })

  return {
    totalSqm,
    totalMeters,
    parties: results,
  }
}
