import type { CalculationResult } from '../lib/calc'
import { formatEUR, formatNumber } from '../lib/money'

export function Breakdown({
  result,
  baseTotal,
  heatTotal,
}: {
  result: CalculationResult
  baseTotal: number
  heatTotal: number
}) {
  return (
    <div className="space-y-3">
      {result.parties.map((p) => {
        const baseDenom = result.totalSqm
        const heatDenom = result.totalMeters

        return (
          <div key={p.partyId} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-slate-900">{p.partyName}</div>
              <div className="text-sm font-semibold text-slate-900">{formatEUR(p.total)}</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-600">Grundkosten</div>
                {baseDenom > 0 ? (
                  <div className="mt-1 font-mono text-[13px]">
                    {formatEUR(baseTotal)} × ({formatNumber(p.sqm)} / {formatNumber(baseDenom)}) ={' '}
                    <span className="font-semibold">{formatEUR(p.baseShare)}</span>
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-slate-500">m² Summe ist 0 → Anteil = 0</div>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-600">Heizkosten</div>
                {heatDenom > 0 ? (
                  <div className="mt-1 font-mono text-[13px]">
                    {formatEUR(heatTotal)} × ({formatNumber(p.metersSum)} / {formatNumber(heatDenom)}) ={' '}
                    <span className="font-semibold">{formatEUR(p.heatShare)}</span>
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-slate-500">Zähler Summe ist 0 → Anteil = 0</div>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-600">Vorauszahlung & Restbetrag</div>
                <div className="mt-1 font-mono text-[13px]">
                  {formatEUR(p.total)} − {formatEUR(p.prepayment)} ={' '}
                  <span className="font-semibold">{formatEUR(p.balance)}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {p.balance > 0
                    ? 'Restbetrag (nachzuzahlen)'
                    : p.balance < 0
                      ? 'Guthaben (zurückzubekommen)'
                      : 'Ausgeglichen'}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
