import type { AppState, Party, HeatMeter } from '../types'
import { newId } from './ids'
import { toNonNegativeNumber } from './number'

export type ExportFileV1 = {
  schema: 'betriebkostenverrechner'
  version: 1
  exportedAt: string
  documentName?: string
  state: AppState
}

function safeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function normalizeMeter(meter: Partial<HeatMeter> | undefined, index: number): HeatMeter {
  return {
    id: safeString(meter?.id, newId()),
    label: safeString(meter?.label, `Zähler ${index + 1}`),
    value: toNonNegativeNumber(meter?.value),
  }
}

function normalizeParty(party: Partial<Party> | undefined, index: number): Party {
  const metersRaw = Array.isArray(party?.meters) ? party?.meters : []
  const meters = metersRaw.length > 0
    ? metersRaw.map((m, i) => normalizeMeter(m as Partial<HeatMeter>, i))
    : [normalizeMeter(undefined, 0)]

  return {
    id: safeString(party?.id, newId()),
    name: safeString(party?.name, `Partei ${index + 1}`),
    sqm: toNonNegativeNumber(party?.sqm),
    prepayment: toNonNegativeNumber((party as Party | undefined)?.prepayment),
    meters,
  }
}

export function normalizeState(input: unknown): AppState {
  // Supports either:
  // - raw AppState
  // - ExportFileV1 wrapper
  const maybeWrapper = input as Partial<ExportFileV1> | undefined
  const rawState: unknown =
    maybeWrapper && maybeWrapper.schema === 'betriebkostenverrechner' && maybeWrapper.version === 1
      ? maybeWrapper.state
      : input

  const s = rawState as Partial<AppState> | undefined

  const partiesRaw = Array.isArray(s?.parties) ? s?.parties : []
  const parties = partiesRaw.map((p, i) => normalizeParty(p as Partial<Party>, i))

  return {
    totalAmount: toNonNegativeNumber((s as AppState | undefined)?.totalAmount),
    parties,
  }
}

export function makeExportFile(state: AppState, documentName?: string): ExportFileV1 {
  return {
    schema: 'betriebkostenverrechner',
    version: 1,
    exportedAt: new Date().toISOString(),
    documentName,
    state,
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
