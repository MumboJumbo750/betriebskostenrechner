import { Copy, FilePlus2, Trash2, X } from 'lucide-react'

import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { Input } from './Input'
import { Label } from './Label'

type DocLike = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export function DocumentsModal({
  open,
  documents,
  currentDocumentId,
  onClose,
  onSelect,
  onCreate,
  onRename,
  onDuplicate,
  onDelete,
}: {
  open: boolean
  documents: DocLike[]
  currentDocumentId: string
  onClose: () => void
  onSelect: (id: string) => void
  onCreate: () => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 theme-rainbow:bg-gradient-to-br theme-rainbow:from-pink-500/20 theme-rainbow:via-amber-400/15 theme-rainbow:to-sky-500/20 bg-white/80 theme-light:bg-white/80 theme-dark:bg-[#181825]/80"
        onClick={onClose}
      />

      <Card className="relative w-full max-w-3xl overflow-hidden">
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Dokumente</div>
            <div className="text-sm text-slate-500">Mehrere Abrechnungen verwalten (autosave).</div>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose} title="Schließen">
            <X className="h-4 w-4" />
            Schließen
          </Button>
        </CardHeader>

        <CardBody>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={onCreate}>
              <FilePlus2 className="h-4 w-4" />
              Neues Dokument
            </Button>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => {
              const isCurrent = doc.id === currentDocumentId

              return (
                <div
                  key={doc.id}
                  className={
                    'rounded-2xl p-4 shadow-sm ' +
                      (isCurrent
                        ? 'theme-rainbow:rainbow-border border-2 border-blue-400 theme-light:border-blue-400 theme-dark:border-blue-600'
                        : 'border border-slate-200 bg-white/80 backdrop-blur theme-dark:bg-[#232336]/80')
                  }
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                    <div className="sm:col-span-6">
                      <Label>Name</Label>
                      <Input
                        value={doc.name}
                        onChange={(e) => onRename(doc.id, e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label>Aktiv</Label>
                      <Button
                        variant={isCurrent ? 'primary' : 'secondary'}
                        className="w-full"
                        onClick={() => onSelect(doc.id)}
                      >
                        {isCurrent ? 'Aktiv' : 'Öffnen'}
                      </Button>
                    </div>

                    <div className="sm:col-span-2">
                      <Label>Duplizieren</Label>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => onDuplicate(doc.id)}
                      >
                        <Copy className="h-4 w-4" />
                        Kopie
                      </Button>
                    </div>

                    <div className="sm:col-span-2">
                      <Label>Löschen</Label>
                      <Button
                        variant="danger"
                        className="w-full"
                        disabled={documents.length <= 1}
                        onClick={() => onDelete(doc.id)}
                        title={documents.length <= 1 ? 'Mindestens ein Dokument behalten' : 'Löschen'}
                      >
                        <Trash2 className="h-4 w-4" />
                        Löschen
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Erstellt: {new Date(doc.createdAt).toLocaleString()} · Zuletzt geändert: {new Date(doc.updatedAt).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
