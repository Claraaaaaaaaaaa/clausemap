import { describe, expect, it } from 'vitest'
import { loadManualConfirmations, saveManualConfirmation } from '../src/manualConfirmationStore'
import { parseRepositoryUrl } from '../src/repositoryUrl'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() { return data.size },
    clear: () => data.clear(),
    getItem: key => data.get(key) ?? null,
    key: index => Array.from(data.keys())[index] ?? null,
    removeItem: key => { data.delete(key) },
    setItem: (key, value) => { data.set(key, value) },
  }
}

describe('repository-isolated human declarations', () => {
  it('persists one explicit flag, isolates another repo, and supports undo', () => {
    const storage = memoryStorage()
    const first = parseRepositoryUrl('https://github.com/Owner/Repo')!
    const equivalent = parseRepositoryUrl('github.com/owner/repo.git')!
    const second = parseRepositoryUrl('github.com/owner/other')!
    expect(first.key).toBe(equivalent.key)
    expect(saveManualConfirmation(first.key, 'video', true, storage)).toBe(true)
    expect(loadManualConfirmations(equivalent.key, storage)).toEqual(new Set(['video']))
    expect(loadManualConfirmations(second.key, storage)).toEqual(new Set())
    expect(saveManualConfirmation(first.key, 'eligibility', true, storage)).toBe(true)
    expect(loadManualConfirmations(first.key, storage)).toEqual(new Set(['video', 'eligibility']))
    expect(saveManualConfirmation(first.key, 'video', false, storage)).toBe(true)
    expect(loadManualConfirmations(first.key, storage)).toEqual(new Set(['eligibility']))
    storage.clear()
    expect(loadManualConfirmations(first.key, storage)).toEqual(new Set())
  })
  it('does not claim saved confirmation on corrupt or blocked storage', () => {
    const storage = memoryStorage()
    storage.setItem('clausemap.manual.v1', '{broken')
    expect(loadManualConfirmations('a/b', storage)).toEqual(new Set())
    const blocked = { ...storage, setItem: () => { throw new Error('blocked') } }
    expect(saveManualConfirmation('a/b', 'form', true, blocked)).toBe(false)
    expect(loadManualConfirmations('a/b', blocked)).toEqual(new Set())
  })
})
