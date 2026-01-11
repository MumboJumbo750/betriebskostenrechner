import jsPDF from 'jspdf'
import autoTable, { type RowInput } from 'jspdf-autotable'

import type { AppState } from '../types'
import type { CalculationResult, PartyResult } from './calc'
import { formatEUR, formatNumber } from './money'
import { round2, toNonNegativeNumber } from './number'

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function docHeader(doc: jsPDF, title: string) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(title, 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Erstellt am ${todayISO()}`, 14, 24)
  doc.setTextColor(0)
}

export function downloadOverallPdf(state: AppState, result: CalculationResult) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  docHeader(doc, 'Betriebskostenabrechnung – Gesamtübersicht')

  const totalAmount = toNonNegativeNumber(state.totalAmount)
  const baseTotal = round2(totalAmount * 0.3)
  const heatTotal = round2(totalAmount * 0.7)
  const totalPrepayments = round2(
    state.parties.reduce((acc, p) => acc + toNonNegativeNumber(p.prepayment), 0),
  )
  const totalBalance = round2(totalAmount - totalPrepayments)
  const balanceBaseTotal = round2(totalBalance * 0.3)
  const balanceHeatTotal = round2(totalBalance * 0.7)

  doc.setFontSize(11)
  doc.text(`Gesamtbetrag: ${formatEUR(totalAmount)}`, 14, 44)
  doc.text(`Vorauszahlungen gesamt: ${formatEUR(totalPrepayments)}`, 14, 60)
  doc.text(`Nachzahlung gesamt: ${formatEUR(totalBalance)}`, 14, 76)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Grundkosten (30%): ${formatEUR(baseTotal)}   |   Heizkosten (70%): ${formatEUR(heatTotal)}`, 14, 92)
  doc.text(`Nachzahlung 30/70: ${formatEUR(balanceBaseTotal)} / ${formatEUR(balanceHeatTotal)}`, 14, 104)
  doc.setTextColor(0)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(
    `m² Summe: ${formatNumber(result.totalSqm)}   |   Zähler Summe: ${formatNumber(result.totalMeters)}`,
    14,
    118,
  )
  doc.setTextColor(0)

  const rows: RowInput[] = result.parties.map((p) => [
    p.partyName,
    formatNumber(p.sqm),
    formatEUR(p.baseShare),
    formatNumber(p.metersSum),
    formatEUR(p.heatShare),
    formatEUR(p.total),
    formatEUR(p.prepayment),
    formatEUR(p.balance),
  ])

  autoTable(doc, {
    startY: 136,
    head: [
      [
        'Partei',
        'm²',
        'Grundkosten',
        'Zähler-Summe',
        'Heizkosten',
        'Summe',
        'Vorauszahlung',
        'Restbetrag',
      ],
    ],
    body: rows,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [15, 23, 42] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
  })

  doc.save(`betriebskosten-uebersicht-${todayISO()}.pdf`)
}

export function downloadPartyPdf(
  state: AppState,
  result: CalculationResult,
  party: PartyResult,
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  docHeader(doc, `Betriebskostenabrechnung – ${party.partyName}`)

  const totalAmount = toNonNegativeNumber(state.totalAmount)
  const baseTotal = round2(totalAmount * 0.3)
  const heatTotal = round2(totalAmount * 0.7)

  const y0 = 44
  doc.setFontSize(11)
  doc.text(`Gesamtbetrag: ${formatEUR(totalAmount)}`, 14, y0)
  doc.text(`Grundkosten (30%): ${formatEUR(baseTotal)}`, 14, y0 + 16)
  doc.text(`Heizkosten (70%): ${formatEUR(heatTotal)}`, 14, y0 + 32)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`m² Partei: ${formatNumber(party.sqm)} / ${formatNumber(result.totalSqm)}`, 14, y0 + 52)
  doc.text(`Zähler Partei: ${formatNumber(party.metersSum)} / ${formatNumber(result.totalMeters)}`, 14, y0 + 66)
  doc.setTextColor(0)

  autoTable(doc, {
    startY: y0 + 86,
    head: [['Posten', 'Rechnung', 'Betrag']],
    body: [
      [
        'Grundkosten-Anteil',
        result.totalSqm > 0
          ? `${formatEUR(baseTotal)} × (${formatNumber(party.sqm)} / ${formatNumber(result.totalSqm)})`
          : 'm² Summe ist 0',
        formatEUR(party.baseShare),
      ],
      [
        'Heizkosten-Anteil',
        result.totalMeters > 0
          ? `${formatEUR(heatTotal)} × (${formatNumber(party.metersSum)} / ${formatNumber(result.totalMeters)})`
          : 'Zähler Summe ist 0',
        formatEUR(party.heatShare),
      ],
      ['Summe', '', formatEUR(party.total)],
      ['Vorauszahlung', '', formatEUR(party.prepayment)],
      ['Restbetrag', `${formatEUR(party.total)} − ${formatEUR(party.prepayment)}`, formatEUR(party.balance)],
    ],
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [15, 23, 42] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      2: { halign: 'right' },
    },
  })

  // Include meter list from the editable state (labels)
  const stateParty = state.parties.find((p) => p.id === party.partyId)
  if (stateParty) {
    const meterRows: RowInput[] = stateParty.meters.map((m) => [m.label, formatNumber(m.value)])

    const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
    const startY = typeof lastAutoTable?.finalY === 'number' ? lastAutoTable.finalY + 18 : 360
    autoTable(doc, {
      startY,
      head: [['Heiz-Zähler', 'Wert']],
      body: meterRows,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 1: { halign: 'right' } },
    })
  }

  doc.save(`betriebskosten-${party.partyName.replaceAll(' ', '_')}-${todayISO()}.pdf`)
}
