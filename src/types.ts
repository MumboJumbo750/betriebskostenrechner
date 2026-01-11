export type HeatMeter = {
  id: string
  label: string
  value: number
}

export type Party = {
  id: string
  name: string
  sqm: number
  prepayment: number
  meters: HeatMeter[]
}

export type AppState = {
  totalAmount: number
  parties: Party[]
}
