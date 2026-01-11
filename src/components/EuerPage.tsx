import { Download, Plus, Printer, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { Input } from './Input'
import { Label } from './Label'
import { SectionTitle } from './SectionTitle'
import { Stat } from './Stat'
import { newId } from '../lib/ids'
import { formatEUR } from '../lib/money'
import { toNonNegativeNumber } from '../lib/number'
import { classNames } from '../lib/ui'
import {
  calculateEuer,
  createDefaultEuerState,
  filterEntriesByYear,
  getAvailableYears,
  type EuerEntry,
  type EuerEntryType,
} from '../lib/euer'
import { useLocalStorageState } from '../lib/useLocalStorageState'

function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={classNames(
        'w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm backdrop-blur',
        'outline-none ring-0 focus:border-pink-300 focus:ring-4 focus:ring-pink-100',
        className,
      )}
      {...props}
    />
  )
}

function guessCurrentYear() {
  return new Date().getFullYear()
}

export function EuerPage() {
  const [state, setState] = useLocalStorageState('euer_state_v1', createDefaultEuerState())
  const years = useMemo(() => {
    const y = getAvailableYears(state.entries)
    return y.length ? y : [guessCurrentYear()]
  }, [state.entries])

  const [year, setYear] = useState<number>(() => years[0] ?? guessCurrentYear())

  // Keep selected year valid when entries change.
  const selectedYear = years.includes(year) ? year : years[0]
  const entries = useMemo(() => filterEntriesByYear(state.entries, selectedYear), [state.entries, selectedYear])
  const totals = useMemo(() => calculateEuer(entries), [entries])

  function updateEntry(entryId: string, next: EuerEntry) {
    setState({
      ...state,
      entries: state.entries.map((e) => (e.id === entryId ? next : e)),
    })
  }

  function removeEntry(entryId: string) {
    setState({
      ...state,
      entries: state.entries.filter((e) => e.id !== entryId),
    })
  }

  function addEntry(type: EuerEntryType) {
    const today = new Date().toISOString().slice(0, 10)
    setState({
      ...state,
      entries: [
        {
          id: newId(),
          date: today,
          type,
          category: type === 'income' ? 'Umsatz' : 'Betriebsausgabe',
          description: '',
          amount: 0,
        },
        ...state.entries,
      ],
    })
  }

  function downloadCsv() {
    const header = ['Datum', 'Typ', 'Kategorie', 'Beschreibung', 'Betrag']
    const rows = entries.map((e) => [
      e.date,
      e.type === 'income' ? 'Einnahme' : 'Ausgabe',
      e.category,
      e.description,
      String(toNonNegativeNumber(e.amount)).replace('.', ','),
    ])
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(';'))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `euer-${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <SectionTitle
              title="Einnahmenüberschussrechnung (EÜR)"
              subtitle="Einfach Einnahmen & Ausgaben erfassen, EÜR wird automatisch berechnet."
            />
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Jahr</Label>
                <Select value={selectedYear} onChange={(e) => setYear(Number(e.target.value))}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-wrap items-end gap-2 print:hidden">
                <Button variant="secondary" onClick={() => setState(createDefaultEuerState())} title="Zurücksetzen">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button variant="secondary" onClick={() => downloadCsv()} title="CSV Export">
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button variant="secondary" onClick={() => window.print()} title="Drucken">
                  <Printer className="h-4 w-4" />
                  Drucken
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <Button variant="primary" onClick={() => addEntry('income')}
              >
                <Plus className="h-4 w-4" />
                Einnahme
              </Button>
              <Button variant="primary" onClick={() => addEntry('expense')}
              >
                <Plus className="h-4 w-4" />
                Ausgabe
              </Button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Rechnung</div>
              <div className="mt-1 text-xs text-slate-600">
                Überschuss = Einnahmen − Ausgaben = {formatEUR(totals.income)} − {formatEUR(totals.expense)} ={' '}
                <span className="font-semibold text-slate-900">{formatEUR(totals.surplus)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-3">
          <Stat label="Einnahmen" value={formatEUR(totals.income)} />
          <Stat label="Ausgaben" value={formatEUR(totals.expense)} />
          <Stat label="Überschuss" value={formatEUR(totals.surplus)} />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle title="Buchungen" subtitle="Liste der Einnahmen und Ausgaben." />
          <div className="text-xs text-slate-500">Anzahl: {entries.length}</div>
        </div>

        <div className="rainbow-border overflow-x-auto rounded-2xl shadow-sm">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-pink-50 via-amber-50 to-sky-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Typ</th>
                <th className="px-4 py-3 font-semibold">Kategorie</th>
                <th className="px-4 py-3 font-semibold">Beschreibung</th>
                <th className="px-4 py-3 font-semibold">Betrag (€)</th>
                <th className="px-4 py-3 font-semibold print:hidden">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Input
                      type="date"
                      value={e.date}
                      onChange={(ev) => updateEntry(e.id, { ...e, date: ev.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={e.type}
                      onChange={(ev) => updateEntry(e.id, { ...e, type: ev.target.value as EuerEntryType })}
                    >
                      <option value="income">Einnahme</option>
                      <option value="expense">Ausgabe</option>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={e.category}
                      onChange={(ev) => updateEntry(e.id, { ...e, category: ev.target.value })}
                      placeholder="z.B. Umsatz / Büro / Fahrtkosten"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={e.description}
                      onChange={(ev) => updateEntry(e.id, { ...e, description: ev.target.value })}
                      placeholder="z.B. Rechnung #123"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={e.amount}
                      onChange={(ev) => updateEntry(e.id, { ...e, amount: toNonNegativeNumber(ev.target.value) })}
                    />
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    <Button variant="danger" size="sm" onClick={() => removeEntry(e.id)}>
                      <Trash2 className="h-4 w-4" />
                      Löschen
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-500 print:hidden">
          Speichert automatisch im Browser (localStorage). Beträge werden auf 2 Nachkommastellen gerundet.
        </div>
      </div>
    </>
  )
}
