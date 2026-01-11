export function formatEUR(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue)
}

export function formatNumber(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('de-AT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safeValue)
}
