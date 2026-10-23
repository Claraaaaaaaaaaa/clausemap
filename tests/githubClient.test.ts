import { afterEach, describe, expect, it, vi } from 'vitest'
import { inspectGitHub } from '../src/githubClient'
import type { RepositoryIdentity } from '../src/types'

const identity: RepositoryIdentity = { owner: 'Example', repo: 'Project', key: 'example/project' }
const sha = 'a'.repeat(40)
const treeSha = 'b'.repeat(40)
const response = (status: number, body: unknown, headers?: Record<string, string>) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
const metadata = { private: false, full_name: 'Example/Project', default_branch: 'main', html_url: 'https://github.com/Example/Project' }
const commit = { sha, commit: { tree: { sha: treeSha } } }
const tree = { sha: treeSha, tree: [{ path: 'docs/scope.md', type: 'blob', mode: '100644' }], truncated: false }

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('real request contract with deterministic HTTP responses', () => {
  it('requests metadata, commit and exact tree SHA in order without browser cache', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(response(200, metadata)).mockResolvedValueOnce(response(200, commit)).mockResolvedValueOnce(response(200, tree))
    vi.stubGlobal('fetch', fetch)
    const result = await inspectGitHub(identity)
    expect(result.failure).toBeUndefined()
    expect(result.commit?.commitSha).toBe(sha)
    expect(result.tree?.sha).toBe(treeSha)
    expect(fetch.mock.calls.map(call => call[0])).toEqual([
      'https://api.github.com/repos/Example/Project',
      'https://api.github.com/repos/Example/Project/commits/main',
      `https://api.github.com/repos/Example/Project/git/trees/${treeSha}?recursive=1`,
    ])
    expect(fetch.mock.calls.every(call => call[1].cache === 'no-store')).toBe(true)
  })
  it.each([
    [404, {}, 'not-found'],
    [403, { message: 'Forbidden' }, 'forbidden'],
    [403, { message: 'API rate limit exceeded' }, 'rate-limit'],
    [429, { message: 'Too many requests' }, 'rate-limit'],
  ] as const)('classifies repository HTTP %s accurately', async (http, body, kind) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(http, body)))
    const result = await inspectGitHub(identity)
    expect(result.failure?.kind).toBe(kind)
    expect(result.metadata).toBeUndefined()
  })
  it('uses rate headers to distinguish primary limiting from other 403s', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(403, {}, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1792724399' })))
    expect((await inspectGitHub(identity)).failure?.kind).toBe('rate-limit')
  })
  it('keeps proven public metadata when a commit returns 409', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(200, metadata)).mockResolvedValueOnce(response(409, {})))
    const result = await inspectGitHub(identity)
    expect(result.metadata?.fullName).toBe('Example/Project')
    expect(result.failure?.kind).toBe('conflict')
  })
  it('rejects a tree SHA mismatch and a malformed completeness flag', async () => {
    for (const body of [{ ...tree, sha: 'c'.repeat(40) }, { ...tree, truncated: undefined }]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response(200, metadata)).mockResolvedValueOnce(response(200, commit)).mockResolvedValueOnce(response(200, body)))
      expect((await inspectGitHub(identity)).failure?.kind).toBe('invalid-response')
    }
  })
  it('classifies a network/CORS-like fetch rejection without inventing the cause', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    expect((await inspectGitHub(identity)).failure?.kind).toBe('network')
  })
  it('times out a stalled request', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    const pending = inspectGitHub(identity)
    await vi.advanceTimersByTimeAsync(10_001)
    expect((await pending).failure?.kind).toBe('timeout')
  })
})
