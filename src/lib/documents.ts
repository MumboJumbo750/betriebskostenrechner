import type { AppState } from '../types'
import { newId } from './ids'
import { createDefaultState } from './defaults'
import { normalizeState } from './exportImport'

export type Document = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  state: AppState
}

export type Workspace = {
  schema: 'betriebkostenverrechner-workspace'
  version: 1
  currentDocumentId: string
  documents: Document[]
}

export function createDocument(name: string, state?: AppState): Document {
  const now = new Date().toISOString()
  return {
    id: newId(),
    name,
    createdAt: now,
    updatedAt: now,
    state: state ?? createDefaultState(),
  }
}

export function createDefaultWorkspace(): Workspace {
  // Legacy migration: if the old single-state key exists, use it as initial doc.
  try {
    const legacyRaw = localStorage.getItem('betriebkostenverrechner_state_v1')
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as unknown
      const migrated = normalizeState(parsed)
      const doc = createDocument('Abrechnung 1', migrated)
      return {
        schema: 'betriebkostenverrechner-workspace',
        version: 1,
        currentDocumentId: doc.id,
        documents: [doc],
      }
    }
  } catch {
    // ignore
  }

  const doc = createDocument('Abrechnung 1')
  return {
    schema: 'betriebkostenverrechner-workspace',
    version: 1,
    currentDocumentId: doc.id,
    documents: [doc],
  }
}

export function normalizeWorkspace(input: unknown): Workspace {
  const w = input as Partial<Workspace> | undefined

  if (w?.schema === 'betriebkostenverrechner-workspace' && w.version === 1 && Array.isArray(w.documents)) {
    const documents = w.documents
      .map((d, idx) => {
        const now = new Date().toISOString()
        const state = normalizeState((d as Document | undefined)?.state)
        const id = typeof (d as Document | undefined)?.id === 'string' ? (d as Document).id : newId()
        const name = typeof (d as Document | undefined)?.name === 'string' ? (d as Document).name : `Abrechnung ${idx + 1}`
        return {
          id,
          name,
          createdAt: typeof (d as Document | undefined)?.createdAt === 'string' ? (d as Document).createdAt : now,
          updatedAt: typeof (d as Document | undefined)?.updatedAt === 'string' ? (d as Document).updatedAt : now,
          state,
        }
      })
      .filter((d) => d.state.parties.length > 0)

    const fallbackDoc = documents[0] ?? createDocument('Abrechnung 1')
    const currentId =
      typeof w.currentDocumentId === 'string' && documents.some((d) => d.id === w.currentDocumentId)
        ? w.currentDocumentId
        : fallbackDoc.id

    return {
      schema: 'betriebkostenverrechner-workspace',
      version: 1,
      currentDocumentId: currentId,
      documents: documents.length > 0 ? documents : [fallbackDoc],
    }
  }

  // If someone imports a raw AppState or export file, wrap it into a workspace.
  const migratedState = normalizeState(input)
  const doc = createDocument('Import', migratedState)
  return {
    schema: 'betriebkostenverrechner-workspace',
    version: 1,
    currentDocumentId: doc.id,
    documents: [doc],
  }
}
