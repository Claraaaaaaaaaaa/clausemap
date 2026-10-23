import { failureAction, fileSource, repositorySource } from './evidenceBuilder'
import { rules } from './rules'
import type { GitHubInspection, MachineFinding, MachineId, MachineReport, RepositoryIdentity, TreeEntry } from './types'

const documentIds: Array<Exclude<MachineId, 'repo'>> = ['scope', 'prd', 'spec']

function basename(path: string): string { return path.slice(path.lastIndexOf('/') + 1) }
function regular(entry: TreeEntry): boolean { return entry.type === 'blob' && (entry.mode === '100644' || entry.mode === '100755') }
function order(entry: TreeEntry): string {
  return `${entry.path === basename(entry.path) ? '0' : entry.path.startsWith('devpost/') ? '1' : '2'}:${entry.path}`
}

export function buildMachineReport(identity: RepositoryIdentity, inspection: GitHubInspection, runId: number): MachineReport {
  const { metadata, commit, tree, failure } = inspection
  const trustedTree = commit && tree?.sha === commit.treeSha ? tree : undefined
  const repoIdentity = metadata?.identity ?? identity
  const repoFinding: MachineFinding = {
    id: 'repo', title: 'Public repository', status: metadata ? 'Verified' : 'Unable to verify',
    observation: metadata ? `GitHub returned public metadata for ${metadata.fullName}.` : failure?.detail ?? 'No public repository observation was obtained.',
    observedAt: metadata?.checkedAt ?? failure?.checkedAt ?? new Date().toISOString(),
    coverage: metadata ? 'complete' : 'unavailable',
    sourceUrl: metadata ? repositorySource(repoIdentity, commit?.commitSha) : undefined,
    commitSha: commit?.commitSha, treeSha: commit?.treeSha,
    limitation: metadata ? 'This verifies public repository access only. It does not establish a complete file listing or submission compliance.' : 'A failed lookup cannot establish whether the repository exists, is private, or is otherwise unavailable.',
    nextAction: metadata ? 'Review the file-presence findings and your remaining submission materials.' : failureAction(failure),
    rule: rules.repo,
  }
  const findings: MachineFinding[] = [repoFinding]
  for (const id of documentIds) {
    const name = `${id}.md`
    const candidates = trustedTree?.entries.filter(entry => basename(entry.path) === name) ?? []
    const found = candidates.filter(regular).sort((a, b) => order(a).localeCompare(order(b)))[0]
    const unsupported = candidates.length > 0 && !found
    const complete = Boolean(trustedTree && !trustedTree.truncated)
    const status = found ? 'Verified' : complete && !unsupported ? 'Missing' : 'Unable to verify'
    let observation: string
    if (found) observation = `A regular file named ${name} was observed at ${found.path} in the pinned default-branch tree.`
    else if (unsupported) observation = `${name} appears only as a symlink, submodule, or unsupported tree entry; document presence is not established.`
    else if (complete) observation = `A complete recursive tree of ${trustedTree!.entries.length} entries contained no file named ${name}.`
    else if (trustedTree?.truncated) observation = `The recursive tree was truncated; ${name} was not observed in the returned portion.`
    else observation = failure?.detail ?? 'The repository file tree could not be inspected reliably.'
    findings.push({
      id, title: name, status, observation,
      observedAt: trustedTree?.checkedAt ?? failure?.checkedAt ?? metadata?.checkedAt ?? new Date().toISOString(),
      coverage: trustedTree ? trustedTree.truncated ? 'incomplete' : 'complete' : 'unavailable',
      sourceUrl: found && commit ? fileSource(repoIdentity, commit.commitSha, found.path) : trustedTree && commit ? repositorySource(repoIdentity, commit.commitSha) : undefined,
      path: found?.path, commitSha: commit?.commitSha, treeSha: trustedTree?.sha,
      limitation: found ? 'Only this filename and regular-file presence were checked; content, authorship, and Skill Pack use were not verified.' : status === 'Missing' ? 'Absence is based on this complete commit-pinned file tree only; the branch may change later.' : 'The available evidence does not establish whether this required document is absent.',
      nextAction: found ? 'Open the file and review its contents yourself.' : status === 'Missing' ? `Add ${name} anywhere in the public repository, push it to the default branch, then run Preflight again.` : unsupported ? `Replace or review the unsupported ${name} entry, then run Preflight again.` : failureAction(failure),
      rule: rules[id],
    })
  }
  return { runId, repositoryKey: repoIdentity.key, fullName: metadata?.fullName ?? `${identity.owner}/${identity.repo}`, defaultBranch: metadata?.defaultBranch, commitSha: commit?.commitSha, treeSha: commit?.treeSha, checkedAt: new Date().toISOString(), findings }
}
