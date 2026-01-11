import { createDefaultEuerState, type EuerEntryType, type EuerState } from './euer'
import { newId } from './ids'

export type EuerDocument = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  state: EuerState
}

export type EuerWorkspace = {
  schema: 'betriebkostenverrechner-euer-workspace'
  version: 1
  currentDocumentId: string
  documents: EuerDocument[]
}

const LEGACY_EUER_STATE_KEY = 'euer_state_v1'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function getString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function getNumber(value: unknown): number | null {
  return Number.isFinite(value) ? Number(value) : null
}

export function createEuerDocument(name: string, state: EuerState = createDefaultEuerState()): EuerDocument {
  const now = new Date().toISOString()
  return {
    id: newId(),
    name,
    createdAt: now,
    updatedAt: now,
    state,
  }
}

function normalizeEuerState(input: unknown): EuerState {
  const fallback = createDefaultEuerState()
  if (!isRecord(input)) return fallback

  const rawEntries = input.entries
  if (!Array.isArray(rawEntries)) return fallback

  const entries = rawEntries
    .filter((e): e is UnknownRecord => isRecord(e))
    .map((e) => {
      const id = getString(e.id) ?? newId()
      const date = getString(e.date) ?? new Date().toISOString().slice(0, 10)
      const type: EuerEntryType = e.type === 'expense' ? 'expense' : 'income'
      const category = getString(e.category) ?? ''
      const description = getString(e.description) ?? ''
      const amount = getNumber(e.amount) ?? 0

      return { id, date, type, category, description, amount }
    })

  return { entries }
}

export function normalizeEuerWorkspace(input: unknown): EuerWorkspace {
  const base = createDefaultEuerWorkspace()

  if (!isRecord(input)) return base

  // Accept raw legacy EuerState as workspace.
  if (Array.isArray(input.entries)) {
    const doc = createEuerDocument('EÜR', normalizeEuerState(input))
    return {
      schema: 'betriebkostenverrechner-euer-workspace',
      version: 1,
      currentDocumentId: doc.id,
      documents: [doc],
    }
  }

  const schema = input.schema
  const version = input.version
  const docs = input.documents

  if (schema !== 'betriebkostenverrechner-euer-workspace' || version !== 1 || !Array.isArray(docs)) {
    return base
  }

  const documents: EuerDocument[] = docs
    .filter((d): d is UnknownRecord => isRecord(d))
    .map((d) => {
      const now = new Date().toISOString()
      const id = getString(d.id) ?? newId()
      const nameRaw = getString(d.name)
      const name = nameRaw && nameRaw.trim().length > 0 ? nameRaw : 'EÜR'
      const createdAt = getString(d.createdAt) ?? now
      const updatedAt = getString(d.updatedAt) ?? createdAt
      const state = normalizeEuerState(d.state)

      return { id, name, createdAt, updatedAt, state }
    })

  const currentDocumentIdRaw = input.currentDocumentId
  const currentDocumentId =
    typeof currentDocumentIdRaw === 'string' && documents.some((d) => d.id === currentDocumentIdRaw)
      ? currentDocumentIdRaw
      : documents[0]?.id ?? base.currentDocumentId

  return {
    schema: 'betriebkostenverrechner-euer-workspace',
    version: 1,
    currentDocumentId,
    documents: documents.length ? documents : base.documents,
  }
}

export function createDefaultEuerWorkspace(): EuerWorkspace {
  // Best-effort migration from the previous single-state key.
  try {
    const legacy = localStorage.getItem(LEGACY_EUER_STATE_KEY)
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown
      const doc = createEuerDocument('EÜR', normalizeEuerState(parsed))
      return {
        schema: 'betriebkostenverrechner-euer-workspace',
        version: 1,
        currentDocumentId: doc.id,
        documents: [doc],
      }
    }
  } catch {
    // ignore
  }

  const doc = createEuerDocument('EÜR', createDefaultEuerState())
  return {
    schema: 'betriebkostenverrechner-euer-workspace',
    version: 1,
    currentDocumentId: doc.id,
    documents: [doc],
  }
}
