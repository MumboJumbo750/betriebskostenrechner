import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, FileText, Plus, Printer, RotateCcw, Upload } from 'lucide-react'
import { Breakdown } from './components/Breakdown'
import { Button } from './components/Button'
import { Card, CardBody, CardHeader } from './components/Card'
import { DocumentsModal } from './components/DocumentsModal'
import { EuerPage } from './components/EuerPage'
import { Input } from './components/Input'
import { Label } from './components/Label'
import { PartyCard } from './components/PartyCard'
import { SectionTitle } from './components/SectionTitle'
import { Stat } from './components/Stat'
import { SummaryTable } from './components/SummaryTable'
import { calculate } from './lib/calc'
import { createDefaultParty, createDefaultState } from './lib/defaults'
import { createDefaultWorkspace, createDocument, normalizeWorkspace } from './lib/documents'
import { formatEUR, formatNumber } from './lib/money'
import { toNonNegativeNumber } from './lib/number'
import { downloadOverallPdf, downloadPartyPdf } from './lib/pdf'
import { useLocalStorageState } from './lib/useLocalStorageState'
import { downloadJson, makeExportFile, normalizeState } from './lib/exportImport'
import type { AppState, Party } from './types'

function App() {
  const [page, setPage] = useState<'bkv' | 'euer'>(() =>
    window.location.hash === '#euer' ? 'euer' : 'bkv',
  )

  // Theme logic
  const themeOptions = [
    { key: 'rainbow', label: '🌈 Rainbow' },
    { key: 'light', label: '☀️ Light' },
    { key: 'dark', label: '🌙 Dark' },
  ];
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bkv_theme') || 'rainbow';
  });
  useEffect(() => {
    localStorage.setItem('bkv_theme', theme);
    document.documentElement.classList.remove('theme-rainbow', 'theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    const onHash = () => setPage(window.location.hash === '#euer' ? 'euer' : 'bkv')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [workspace, setWorkspace] = useLocalStorageState(
    'betriebkostenverrechner_workspace_v1',
    createDefaultWorkspace(),
  )

  // In case user imports/edits localStorage manually.
  useEffect(() => {
    setWorkspace((prev) => normalizeWorkspace(prev))
  }, [setWorkspace])

  const currentDoc = useMemo(() => {
    const found = workspace.documents.find((d) => d.id === workspace.currentDocumentId)
    return found ?? workspace.documents[0]
  }, [workspace])

  const state = currentDoc.state
  const setState = (next: AppState) => {
    setWorkspace((prev) => {
      const now = new Date().toISOString()
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === prev.currentDocumentId ? { ...d, state: next, updatedAt: now } : d,
        ),
      }
    })
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [docsOpen, setDocsOpen] = useState(false)

  useEffect(() => {
    // Migration for older saved states inside a document:
    // - ensure `prepayment` exists
    // - convert previous (baseTotal + heatTotal) into `totalAmount`
    const needsPrepaymentFix = state.parties.some((p) => !Number.isFinite((p as Party).prepayment))
    const hasTotalAmount = Number.isFinite((state as unknown as { totalAmount?: number }).totalAmount)
    const legacy = state as unknown as { baseTotal?: number; heatTotal?: number }

    if (!needsPrepaymentFix && hasTotalAmount) return

    const migratedTotalAmount = hasTotalAmount
      ? toNonNegativeNumber((state as unknown as { totalAmount?: number }).totalAmount)
      : toNonNegativeNumber(legacy.baseTotal) + toNonNegativeNumber(legacy.heatTotal)

    setState({
      ...state,
      totalAmount: migratedTotalAmount,
      parties: state.parties.map((p) => ({
        ...p,
        prepayment: Number.isFinite((p as Party).prepayment) ? (p as Party).prepayment : 0,
      })),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDoc.id])

  const totalAmount = toNonNegativeNumber(state.totalAmount)
  const baseTotal = Math.round(totalAmount * 0.3 * 100) / 100
  const heatTotal = Math.round(totalAmount * 0.7 * 100) / 100

  const totalPrepayments = state.parties.reduce(
    (acc, p) => acc + toNonNegativeNumber(p.prepayment),
    0,
  )
  const totalBalance = Math.round((totalAmount - totalPrepayments) * 100) / 100

  const balanceBaseTotal = Math.round(totalBalance * 0.3 * 100) / 100
  const balanceHeatTotal = Math.round(totalBalance * 0.7 * 100) / 100

  const result = calculate(state.parties, baseTotal, heatTotal)

  const showSqmWarning = baseTotal > 0 && result.totalSqm <= 0
  const showMeterWarning = heatTotal > 0 && result.totalMeters <= 0

  function updateParty(partyId: string, next: Party) {
    setState({
      ...state,
      parties: state.parties.map((p) => (p.id === partyId ? next : p)),
    })
  }

  function removeParty(partyId: string) {
    setState({
      ...state,
      parties: state.parties.filter((p) => p.id !== partyId),
    })
  }

  async function handleImportFile(file: File) {
    try {
      setImportError(null)
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const normalized = normalizeState(parsed)
      if (!normalized.parties.length) throw new Error('Keine Parteien in der Datei gefunden.')

      const nameFromFile =
        typeof (parsed as any)?.documentName === 'string' ? String((parsed as any).documentName) : null
      const shouldReplace = window.confirm(
        'Import in aktuelles Dokument übernehmen?\nOK = überschreiben, Abbrechen = als neues Dokument importieren.',
      )

      if (shouldReplace) {
        setState(normalized)
      } else {
        setWorkspace((prev) => {
          const newDoc = createDocument(
            nameFromFile && nameFromFile.trim().length > 0
              ? nameFromFile
              : `Import ${new Date().toLocaleDateString()}`,
            normalized,
          )
          return {
            ...prev,
            currentDocumentId: newDoc.id,
            documents: [newDoc, ...prev.documents],
          }
        })
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Import fehlgeschlagen.'
      setImportError(message)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-end items-center gap-2 px-4 pt-4 print:hidden">
        <div className="flex gap-1">
          {themeOptions.map((opt) => (
            <Button
              key={opt.key}
              variant={theme === opt.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTheme(opt.key)}
              title={`Theme: ${opt.label}`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <DocumentsModal
          open={docsOpen}
          documents={workspace.documents}
          currentDocumentId={workspace.currentDocumentId}
          onClose={() => setDocsOpen(false)}
          onSelect={(id) =>
            setWorkspace((prev) => ({
              ...prev,
              currentDocumentId: id,
            }))
          }
          onCreate={() =>
            setWorkspace((prev) => {
              const newDoc = createDocument(
                `Abrechnung ${prev.documents.length + 1}`,
                createDefaultState(),
              )
              return {
                ...prev,
                currentDocumentId: newDoc.id,
                documents: [newDoc, ...prev.documents],
              }
            })
          }
          onRename={(id, name) =>
            setWorkspace((prev) => ({
              ...prev,
              documents: prev.documents.map((d) => (d.id === id ? { ...d, name } : d)),
            }))
          }
          onDuplicate={(id) =>
            setWorkspace((prev) => {
              const src = prev.documents.find((d) => d.id === id)
              if (!src) return prev
              const copy = createDocument(`${src.name} (Kopie)`, src.state)
              return {
                ...prev,
                currentDocumentId: copy.id,
                documents: [copy, ...prev.documents],
              }
            })
          }
          onDelete={(id) =>
            setWorkspace((prev) => {
              if (prev.documents.length <= 1) return prev
              const remaining = prev.documents.filter((d) => d.id !== id)
              const nextCurrent =
                prev.currentDocumentId === id ? remaining[0]?.id ?? prev.currentDocumentId : prev.currentDocumentId
              return {
                ...prev,
                currentDocumentId: nextCurrent,
                documents: remaining,
              }
            })
          }
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium theme-rainbow:rainbow-border theme-light:bg-blue-100 theme-dark:bg-[#232336] theme-light:text-blue-900 theme-dark:text-blue-100 shadow-sm">
              <span className="inline-block w-3 h-3 rounded-full theme-rainbow:bg-gradient-to-r theme-rainbow:from-pink-500 theme-rainbow:via-amber-300 theme-rainbow:to-sky-500 theme-light:bg-blue-400 theme-dark:bg-blue-700 mr-2"></span>
              Betriebskostenabrechnung
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Betriebskosten-Verrechner
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Heizkosten nach Zählerwerten, Grundkosten nach Quadratmetern.
            </p>
            <div className="mt-2 text-xs font-medium text-slate-500">
              Dokument: <span className="text-slate-700">{currentDoc.name}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              variant={page === 'bkv' ? 'primary' : 'secondary'}
              onClick={() => {
                window.location.hash = ''
                setPage('bkv')
              }}
              title="Betriebskosten-Verrechner"
            >
              Betriebskosten
            </Button>

            <Button
              variant={page === 'euer' ? 'primary' : 'secondary'}
              onClick={() => {
                window.location.hash = '#euer'
                setPage('euer')
              }}
              title="Einnahmenüberschussrechnung (EÜR)"
            >
              EÜR
            </Button>

            {page === 'bkv' ? (
            <Button
              variant="secondary"
              onClick={() => setState(createDefaultState())}
              title="Alles zurücksetzen"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            ) : null}

            {page === 'bkv' ? (
              <Button variant="secondary" onClick={() => setDocsOpen(true)} title="Dokumente verwalten">
                <FileText className="h-4 w-4" />
                Dokumente
              </Button>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleImportFile(file)
              }}
            />

            {page === 'bkv' ? (
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                title="Daten importieren (.json)"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            ) : null}

            {page === 'bkv' ? (
              <Button
                variant="secondary"
                onClick={() =>
                  downloadJson(
                    `betriebskosten-${currentDoc.name.replaceAll(' ', '_')}-${new Date().toISOString().slice(0, 10)}.json`,
                    makeExportFile(state, currentDoc.name),
                  )
                }
                title="Daten exportieren (.json)"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            ) : null}

            {page === 'bkv' ? (
              <Button
                variant="secondary"
                onClick={() => downloadOverallPdf(state, result)}
                title="PDF Gesamtübersicht"
              >
                <Download className="h-4 w-4" />
                PDF Übersicht
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => window.print()} title="Drucken">
              <Printer className="h-4 w-4" />
              Drucken
            </Button>
          </div>
        </div>

        {page === 'bkv' && importError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            Import fehlgeschlagen: {importError}
          </div>
        ) : null}

        {page === 'bkv' ? (
          <>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <SectionTitle
                title="Kosteneingabe"
                subtitle="Du gibst den Gesamtbetrag ein; 30% Grundkosten & 70% Heizkosten werden automatisch abgeleitet."
              />
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Gesamtbetrag (€)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={state.totalAmount}
                    onChange={(e) =>
                      setState({
                        ...state,
                        totalAmount: toNonNegativeNumber(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Vorauszahlungen gesamt (€) (readonly)</Label>
                  <Input value={formatEUR(totalPrepayments)} readOnly />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col">
                  <Label className="min-h-[32px]">Nachzahlung gesamt (€) (readonly)</Label>
                  <Input value={formatEUR(totalBalance)} readOnly />
                  <div className="mt-1 text-xs text-slate-500">
                    Rechnung: {formatEUR(totalAmount)} − {formatEUR(totalPrepayments)}
                  </div>
                </div>

                <div className="flex flex-col">
                  <Label className="min-h-[32px]">Grundkosten 30% (Nachzahlung) (€) (readonly)</Label>
                  <Input value={formatEUR(balanceBaseTotal)} readOnly />
                  <div className="mt-1 text-xs text-slate-500">
                    {formatEUR(totalBalance)} × 0,30
                  </div>
                </div>

                <div className="flex flex-col">
                  <Label className="min-h-[32px]">Heizkosten 70% (Nachzahlung) (€) (readonly)</Label>
                  <Input value={formatEUR(balanceHeatTotal)} readOnly />
                  <div className="mt-1 text-xs text-slate-500">
                    {formatEUR(totalBalance)} × 0,70
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="font-medium text-slate-900">Hinweis zur Aufteilung</div>
                <div className="mt-1 text-xs text-slate-600">
                  Für die Verteilung auf Parteien werden die <span className="font-semibold">Kosten</span> als 30/70 vom Gesamtbetrag verwendet
                  (Grundkosten {formatEUR(baseTotal)}, Heizkosten {formatEUR(heatTotal)}). Die Nachzahlung ergibt sich danach aus den Vorauszahlungen.
                </div>
              </div>

              {(showSqmWarning || showMeterWarning) && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {showSqmWarning ? (
                    <div>Grundkosten &gt; 0, aber m² Summe ist 0. (Grundkosten-Anteile werden 0.)</div>
                  ) : null}
                  {showMeterWarning ? (
                    <div>Heizkosten &gt; 0, aber Zähler-Summe ist 0. (Heizkosten-Anteile werden 0.)</div>
                  ) : null}
                </div>
              )}
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Stat label="Gesamtbetrag" value={formatEUR(totalAmount)} />
            <Stat label="Nachzahlung gesamt" value={formatEUR(totalBalance)} />
            <Stat label="m² Summe" value={formatNumber(result.totalSqm)} />
            <Stat label="Zähler Summe" value={formatNumber(result.totalMeters)} />
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              title="Parteien"
              subtitle="Für jede Partei: Name, Quadratmeter und Heiz-Zähler."
            />
            <div className="print:hidden">
              <Button
                variant="secondary"
                onClick={() =>
                  setState({
                    ...state,
                    parties: [
                      ...state.parties,
                      createDefaultParty(`Partei ${state.parties.length + 1}`),
                    ],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Partei hinzufügen
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {state.parties.map((party) => (
              <PartyCard
                key={party.id}
                party={party}
                onChange={(next) => updateParty(party.id, next)}
                onRemove={() => removeParty(party.id)}
              />
            ))}

            {state.parties.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Keine Parteien vorhanden. Füge eine Partei hinzu.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle title="Übersicht" subtitle="Alle Anteile und Summen auf einen Blick." />
            <div className="print:hidden">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadOverallPdf(state, result)}
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
          <SummaryTable result={result} />
        </div>

        <div className="mt-10">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle title="Rechnung / Aufteilung" subtitle="Formel je Partei (übersichtlich)." />
            <div className="flex flex-wrap gap-2 print:hidden">
              {result.parties.map((p) => (
                <Button
                  key={p.partyId}
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadPartyPdf(state, result, p)}
                  title={`PDF für ${p.partyName}`}
                >
                  <Download className="h-4 w-4" />
                  {p.partyName}
                </Button>
              ))}
            </div>
          </div>
          <Breakdown result={result} baseTotal={baseTotal} heatTotal={heatTotal} />
        </div>

          <div className="mt-10 text-xs text-slate-500 print:hidden">
            Speichert automatisch im Browser (localStorage). Beträge werden auf 2 Nachkommastellen gerundet.
          </div>
          </>
        ) : (
          <EuerPage />
        )}
      </div>
    </div>
  )
}

export default App
