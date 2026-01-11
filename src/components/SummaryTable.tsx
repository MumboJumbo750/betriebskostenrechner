import type { CalculationResult } from '../lib/calc'
import { formatEUR, formatNumber } from '../lib/money'

export function SummaryTable({ result }: { result: CalculationResult }) {
  return (
    <div className="rainbow-border overflow-x-auto rounded-2xl shadow-sm">
      <table className="min-w-[1040px] w-full text-left text-sm">
        <thead className="theme-rainbow:bg-gradient-to-r theme-rainbow:from-pink-50 theme-rainbow:via-amber-50 theme-rainbow:to-sky-50 theme-rainbow:text-slate-700 theme-light:bg-slate-100 theme-light:text-blue-900 theme-dark:bg-[#232336] theme-dark:text-blue-100">
          <tr>
            <th className="px-4 py-3 font-semibold">Partei</th>
            <th className="px-4 py-3 font-semibold">m²</th>
            <th className="px-4 py-3 font-semibold">Grundkosten-Anteil</th>
            <th className="px-4 py-3 font-semibold">Zähler-Summe</th>
            <th className="px-4 py-3 font-semibold">Heizkosten-Anteil</th>
            <th className="px-4 py-3 font-semibold">Summe</th>
            <th className="px-4 py-3 font-semibold">Vorauszahlung</th>
            <th className="px-4 py-3 font-semibold">Restbetrag</th>
          </tr>
        </thead>
        <tbody>
          {result.parties.map((p) => (
            <tr key={p.partyId} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">{p.partyName}</td>
              <td className="px-4 py-3 text-slate-700">{formatNumber(p.sqm)}</td>
              <td className="px-4 py-3 text-slate-700">{formatEUR(p.baseShare)}</td>
              <td className="px-4 py-3 text-slate-700">{formatNumber(p.metersSum)}</td>
              <td className="px-4 py-3 text-slate-700">{formatEUR(p.heatShare)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">{formatEUR(p.total)}</td>
              <td className="px-4 py-3 text-slate-700">{formatEUR(p.prepayment)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">{formatEUR(p.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
