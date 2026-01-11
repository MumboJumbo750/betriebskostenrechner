import { Trash2, Plus } from 'lucide-react'
import type { Party } from '../types'
import { newId } from '../lib/ids'
import { toNonNegativeNumber } from '../lib/number'
import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { Input } from './Input'
import { Label } from './Label'

export function PartyCard({
  party,
  onChange,
  onRemove,
}: {
  party: Party
  onChange: (next: Party) => void
  onRemove: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Label>Name</Label>
            <Input
              value={party.name}
              onChange={(e) => onChange({ ...party, name: e.target.value })}
              placeholder="z.B. WG Zimmer 1"
            />
          </div>
          <div className="w-full sm:w-40">
            <Label>Quadratmeter (m²)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={party.sqm}
              onChange={(e) =>
                onChange({ ...party, sqm: toNonNegativeNumber(e.target.value) })
              }
            />
          </div>
          <div className="w-full sm:w-44">
            <Label>Vorauszahlung (€)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={party.prepayment}
              onChange={(e) =>
                onChange({
                  ...party,
                  prepayment: toNonNegativeNumber(e.target.value),
                })
              }
            />
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onRemove} title="Partei entfernen">
          <Trash2 className="h-4 w-4 theme-light:text-rose-600 theme-dark:text-rose-400" />
          Entfernen
        </Button>
      </CardHeader>
      <CardBody>
        <div className="text-xs text-slate-500 mb-2">Werte werden für Heizkosten-Anteil verwendet.</div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            onChange({
              ...party,
              meters: [
                ...party.meters,
                {
                  id: newId(),
                  label: `Zähler ${party.meters.length + 1}`,
                  value: 0,
                },
              ],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Zähler hinzufügen
        </Button>
        <div className="space-y-2 mt-4">
          {party.meters.map((meter) => (
            <div
              key={meter.id}
              className="grid grid-cols-1 gap-2 rounded-xl p-3 shadow-sm sm:grid-cols-12 theme-rainbow:rainbow-border"
            >
              <div className="sm:col-span-7">
                <Label>Bezeichnung</Label>
                <Input
                  value={meter.label}
                  onChange={(e) =>
                    onChange({
                      ...party,
                      meters: party.meters.map((m) =>
                        m.id === meter.id ? { ...m, label: e.target.value } : m,
                      ),
                    })
                  }
                  placeholder="z.B. Heizkörper Wohnzimmer"
                />
              </div>
              <div className="sm:col-span-3">
                <Label>Wert</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={meter.value}
                  onChange={(e) =>
                    onChange({
                      ...party,
                      meters: party.meters.map((m) =>
                        m.id === meter.id
                          ? { ...m, value: toNonNegativeNumber(e.target.value) }
                          : m,
                      ),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2 sm:flex sm:items-end">
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  disabled={party.meters.length <= 1}
                  onClick={() =>
                    onChange({
                      ...party,
                      meters: party.meters.filter((m) => m.id !== meter.id),
                    })
                  }
                  title={
                    party.meters.length <= 1
                      ? 'Mindestens ein Zähler pro Partei'
                      : 'Zähler entfernen'
                  }
                >
                  <Trash2 className="h-4 w-4 theme-light:text-rose-600 theme-dark:text-rose-400" />
                  Entfernen
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}