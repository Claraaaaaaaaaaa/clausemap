import { describe, expect, it, vi } from 'vitest'
import { buildMachineReport } from '../src/inspectionEngine'
import { InspectionController } from '../src/inspectionController'
import { parseRepositoryUrl } from '../src/repositoryUrl'
import type { GitHubInspection, RepositoryIdentity, TreeEntry } from '../src/types'

const identity: RepositoryIdentity = { owner: 'Example', repo: 'Project', key: 'example/project' }
const sha = 'a'.repeat(40)
const treeSha = 'b'.repeat(40)
const now = '2026-10-23T03:00:00.000Z'
function inspection(entries: TreeEntry[], truncated = false): GitHubInspection {
  return {
    metadata: { identity, fullName: 'Example/Project', defaultBranch: 'main', htmlUrl: 'https://github.com/Example/Project', checkedAt: now },
    commit: { commitSha: sha, treeSha, checkedAt: now },
    tree: { sha: treeSha, entries, truncated, checkedAt: now },
  }
}
const blob = (path: string): TreeEntry => ({ path, type: 'blob', mode: '100644' })
const status = (result: GitHubInspection, id: string) => buildMachineReport(identity, result, 1).findings.find(f => f.id === id)!

describe('evidence thresholds', () => {
  it('accepts regular files in any subdirectory and exposes pinned paths', () => {
    const result = inspection([blob('docs/scope.md'), blob('devpost/prd.md'), blob('spec.md')])
    expect(status(result, 'scope').status).toBe('Verified')
    expect(status(result, 'scope').sourceUrl).toBe(`https://github.com/Example/Project/blob/${sha}/docs/scope.md`)
    expect(status(result, 'prd').status).toBe('Verified')
    expect(status(result, 'spec').status).toBe('Verified')
  })
  it('calls a file Missing only after a complete tree', () => {
    const finding = status(inspection([blob('docs/scope.md')]), 'spec')
    expect(finding.status).toBe('Missing')
    expect(finding.treeSha).toBe(treeSha)
    expect(finding.observation).toContain('complete recursive tree')
  })
  it('keeps unfound files unknown when truncated but preserves found presence', () => {
    const result = inspection([blob('nested/scope.md')], true)
    expect(status(result, 'scope').status).toBe('Verified')
    expect(status(result, 'prd').status).toBe('Unable to verify')
    expect(status(result, 'spec').status).toBe('Unable to verify')
  })
  it('does not mistake a symlink for a regular document', () => {
    expect(status(inspection([{ path: 'scope.md', type: 'blob', mode: '120000' }]), 'scope').status).toBe('Unable to verify')
  })
  it('keeps repository access separate from a failed commit read', () => {
    const result = inspection([])
    delete result.commit
    delete result.tree
    result.failure = { stage: 'commit', kind: 'conflict', detail: 'GitHub returned 409.', checkedAt: now, httpStatus: 409 }
    expect(status(result, 'repo').status).toBe('Verified')
    expect(status(result, 'scope').status).toBe('Unable to verify')
  })
  it('refuses an unpinned tree even if it claims complete coverage', () => {
    const result = inspection([])
    delete result.commit
    expect(status(result, 'spec').status).toBe('Unable to verify')
  })
  it('never calls an inaccessible repository private or its files Missing', () => {
    const result: GitHubInspection = { failure: { stage: 'repository', kind: 'not-found', detail: 'Not publicly found.', checkedAt: now, httpStatus: 404 } }
    expect(status(result, 'repo').status).toBe('Unable to verify')
    expect(status(result, 'spec').status).toBe('Unable to verify')
  })
})

describe('URL and recheck isolation', () => {
  it('normalizes equivalent repository URLs and rejects unrelated hosts/paths', () => {
    expect(parseRepositoryUrl('HTTPS://github.com/Example/Project.git/?tab=readme')?.key).toBe('example/project')
    expect(parseRepositoryUrl('github.com/example/project')?.key).toBe('example/project')
    expect(parseRepositoryUrl('https://evil.example/Example/Project')).toBeNull()
    expect(parseRepositoryUrl('https://github.com/Example/Project/tree/main')).toBeNull()
  })
  it('does not let an older response overwrite the latest run', async () => {
    const resolvers: Array<(value: GitHubInspection) => void> = []
    const inspect = vi.fn(() => new Promise<GitHubInspection>(resolve => { resolvers.push(resolve) }))
    const controller = new InspectionController(inspect)
    const completed: number[] = []
    const first = controller.run(identity, () => {}, report => completed.push(report.runId))
    const second = controller.run(identity, () => {}, report => completed.push(report.runId))
    resolvers[1](inspection([blob('scope.md')]))
    await second
    resolvers[0](inspection([]))
    await first
    expect(inspect).toHaveBeenCalledTimes(2)
    expect(completed).toEqual([2])
  })
})
