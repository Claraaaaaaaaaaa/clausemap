import type { ApiFailure, RepositoryIdentity } from './types'

export function repositorySource(identity: RepositoryIdentity, commitSha?: string): string {
  const base = `https://github.com/${encodeURIComponent(identity.owner)}/${encodeURIComponent(identity.repo)}`
  return commitSha ? `${base}/tree/${commitSha}` : base
}

export function fileSource(identity: RepositoryIdentity, commitSha: string, path: string): string {
  return `${repositorySource(identity)}/blob/${commitSha}/${path.split('/').map(encodeURIComponent).join('/')}`
}

export function failureAction(error?: ApiFailure): string {
  if (!error) return 'Run Preflight again when GitHub is available.'
  if (error.kind === 'not-found' && error.stage === 'repository') return 'Check the URL and that the repository is public, then run Preflight again.'
  if (error.kind === 'rate-limit') return error.retryAt ? `${error.retryAt} Then run Preflight again.` : 'Wait for GitHub access to recover, then run Preflight again.'
  if (error.kind === 'conflict') return 'Check that the default branch has a commit, then run Preflight again.'
  return 'Run Preflight again after checking the repository and your connection.'
}
