import type { AppState, Party } from '../types'
import { newId } from './ids'

export function createDefaultParty(name: string): Party {
  return {
    id: newId(),
    name,
    sqm: 0,
    prepayment: 0,
    meters: [{ id: newId(), label: 'Zähler 1', value: 0 }],
  }
}

export function createDefaultState(): AppState {
  return {
    totalAmount: 0,
    parties: [
      createDefaultParty('Partei 1'),
      createDefaultParty('Partei 2'),
      createDefaultParty('Partei 3'),
    ],
  }
}
