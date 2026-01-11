import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import type { EuerEntry } from './euer'
import { formatEUR } from './money'
import { toNonNegativeNumber } from './number'

export function downloadEuerPdf({
  year,
  entries,
  income,
  expense,
  surplus,
}: {
  year: number
  entries: EuerEntry[]
  income: number
  expense: number
  surplus: number
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const title = `Einnahmenüberschussrechnung (EÜR) ${year}`
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(title, 40, 48)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Einnahmen: ${formatEUR(income)}`, 40, 72)
  doc.text(`Ausgaben: ${formatEUR(expense)}`, 40, 88)
  doc.setFont('helvetica', 'bold')
  doc.text(`Überschuss: ${formatEUR(surplus)}`, 40, 104)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Exportiert am: ${new Date().toLocaleString()}`, 40, 124)

  const rows = entries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [
      e.date,
      e.type === 'income' ? 'Einnahme' : 'Ausgabe',
      e.category || '',
      e.description || '',
      formatEUR(toNonNegativeNumber(e.amount)),
    ])

  autoTable(doc, {
    startY: 150,
    head: [['Datum', 'Typ', 'Kategorie', 'Beschreibung', 'Betrag']],
    body: rows,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [255, 230, 0],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 72 },
      2: { cellWidth: 110 },
      3: { cellWidth: 210 },
      4: { cellWidth: 80, halign: 'right' },
    },
    margin: { left: 40, right: 40 },
  })

  doc.save(`euer-${year}.pdf`)
}
