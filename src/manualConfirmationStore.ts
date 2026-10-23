import type { ManualId } from './types'

const storageKey = 'clausemap.manual.v1'
const ids: ManualId[] = ['video', 'eligibility', 'form']
type RecordData = Record<string, Partial<Record<ManualId, true>>>

function read(storage: Storage): RecordData {
  try {
    const value: unknown = JSON.parse(storage.getItem(storageKey) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return value as RecordData
  } catch { return {} }
}

export function loadManualConfirmations(repositoryKey: string, storage?: Storage): Set<ManualId> {
  try {
    const record = read(storage ?? window.localStorage)[repositoryKey]
    if (!record || typeof record !== 'object' || Array.isArray(record)) return new Set()
    return new Set(ids.filter(id => record[id] === true))
  } catch { return new Set() }
}

export function saveManualConfirmation(repositoryKey: string, id: ManualId, checked: boolean, storage?: Storage): boolean {
  try {
    const target = storage ?? window.localStorage
    const all = read(target)
    const previous = all[repositoryKey]
    const next: Partial<Record<ManualId, true>> = previous && typeof previous === 'object' && !Array.isArray(previous) ? { ...previous } : {}
    if (checked) next[id] = true
    else delete next[id]
    if (Object.keys(next).length) all[repositoryKey] = next
    else delete all[repositoryKey]
    target.setItem(storageKey, JSON.stringify(all))
    return true
  } catch { return false }
}
