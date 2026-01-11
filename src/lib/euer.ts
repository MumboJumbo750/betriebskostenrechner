import { newId } from './ids'
import { toNonNegativeNumber, round2 } from './number'

export type EuerEntryType = 'income' | 'expense'

export type EuerEntry = {
  id: string
  date: string // YYYY-MM-DD
  type: EuerEntryType
  category: string
  description: string
  amount: number
}

export type EuerState = {
  entries: EuerEntry[]
}

export function createDefaultEuerState(): EuerState {
  const today = new Date().toISOString().slice(0, 10)
  return {
    entries: [
      {
        id: newId(),
        date: today,
        type: 'income',
        category: 'Umsatz',
        description: 'Beispiel-Einnahme',
        amount: 0,
      },
      {
        id: newId(),
        date: today,
        type: 'expense',
        category: 'Betriebsausgabe',
        description: 'Beispiel-Ausgabe',
        amount: 0,
      },
    ],
  }
}

export function getEntryYear(entry: Pick<EuerEntry, 'date'>): number | null {
  if (typeof entry.date !== 'string' || entry.date.length < 4) return null
  const year = Number(entry.date.slice(0, 4))
  return Number.isFinite(year) ? year : null
}

export function getAvailableYears(entries: EuerEntry[]): number[] {
  const years = new Set<number>()
  for (const entry of entries) {
    const y = getEntryYear(entry)
    if (y) years.add(y)
  }
  return Array.from(years).sort((a, b) => b - a)
}

export function filterEntriesByYear(entries: EuerEntry[], year: number): EuerEntry[] {
  return entries.filter((e) => getEntryYear(e) === year)
}

export function calculateEuer(entries: EuerEntry[]) {
  const income = entries
    .filter((e) => e.type === 'income')
    .reduce((acc, e) => acc + toNonNegativeNumber(e.amount), 0)
  const expense = entries
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => acc + toNonNegativeNumber(e.amount), 0)
  const surplus = income - expense

  return {
    income: round2(income),
    expense: round2(expense),
    surplus: round2(surplus),
  }
}
