import type { ApiFailure, CommitSnapshot, GitHubInspection, RepositoryIdentity, RepositoryMetadata, Stage, TreeEntry, TreeSnapshot } from './types'

const API = 'https://api.github.com'
const SHA = /^[0-9a-f]{40}$/i
const TIMEOUT_MS = 10_000

function failure(stage: Stage, kind: ApiFailure['kind'], detail: string, httpStatus?: number, retryAt?: string): ApiFailure {
  return { stage, kind, detail, httpStatus, retryAt, checkedAt: new Date().toISOString() }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function messageOf(value: unknown): string {
  return isRecord(value) && typeof value.message === 'string' ? value.message : ''
}

function classifyHttp(stage: Stage, response: Response, body: unknown): ApiFailure {
  const status = response.status
  const message = messageOf(body)
  const remaining = response.headers.get('x-ratelimit-remaining')
  const retryAfter = response.headers.get('retry-after')
  const reset = response.headers.get('x-ratelimit-reset')
  const retryAt = retryAfter ? `Retry after ${retryAfter} seconds.` : reset && remaining === '0' ? `Rate limit resets at ${new Date(Number(reset) * 1000).toISOString()}.` : undefined
  if (status === 404) return failure(stage, 'not-found', stage === 'repository' ? 'GitHub could not find this repository publicly. It may not exist or may not be visible.' : 'GitHub could not retrieve the requested commit or tree.', status)
  if (status === 409) return failure(stage, 'conflict', 'GitHub returned a conflict; the repository may be empty or its commit/tree unavailable.', status)
  if (status === 429 || (status === 403 && (remaining === '0' || /secondary rate limit|rate limit exceeded/i.test(message)))) return failure(stage, 'rate-limit', 'GitHub rate-limited this check. Try again later.', status, retryAt)
  if (status === 403) return failure(stage, 'forbidden', 'GitHub denied access to this request; the exact reason is not established.', status)
  return failure(stage, 'http-error', `GitHub returned HTTP ${status}.`, status)
}

async function getJson(path: string, stage: Stage, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController()
  let timedOut = false
  const timeout = setTimeout(() => { timedOut = true; controller.abort() }, TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  if (signal?.aborted) controller.abort()
  try {
    const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store', signal: controller.signal })
    let body: unknown
    try { body = await response.json() } catch { throw failure(stage, 'invalid-response', 'GitHub returned an unreadable JSON response.', response.status) }
    if (!response.ok) throw classifyHttp(stage, response, body)
    return body
  } catch (error) {
    if (isApiFailure(error)) throw error
    if (timedOut) throw failure(stage, 'timeout', 'GitHub did not respond before the timeout.')
    if (signal?.aborted) throw failure(stage, 'aborted', 'This inspection was replaced by a newer one.')
    throw failure(stage, 'network', 'The network or browser blocked this GitHub request; the cause cannot be confirmed.')
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}

export function isApiFailure(value: unknown): value is ApiFailure {
  return isRecord(value) && typeof value.stage === 'string' && typeof value.kind === 'string' && typeof value.checkedAt === 'string'
}

function parseMetadata(body: unknown, input: RepositoryIdentity): RepositoryMetadata {
  if (!isRecord(body) || body.private !== false || typeof body.full_name !== 'string' || typeof body.default_branch !== 'string' || !body.default_branch || typeof body.html_url !== 'string') {
    throw failure('repository', 'invalid-response', 'GitHub did not provide a trustworthy public-repository response.')
  }
  const canonical = body.full_name.split('/')
  if (canonical.length !== 2) throw failure('repository', 'invalid-response', 'GitHub returned an invalid repository identity.')
  const [owner, repo] = canonical
  if (!owner || !repo || owner.toLowerCase() !== input.owner.toLowerCase() || repo.toLowerCase() !== input.repo.toLowerCase()) {
    throw failure('repository', 'invalid-response', 'GitHub returned a different repository identity; check the entered URL.')
  }
  return { identity: { owner, repo, key: `${owner.toLowerCase()}/${repo.toLowerCase()}` }, fullName: body.full_name, defaultBranch: body.default_branch, htmlUrl: body.html_url, checkedAt: new Date().toISOString() }
}

function parseCommit(body: unknown): CommitSnapshot {
  if (!isRecord(body) || typeof body.sha !== 'string' || !SHA.test(body.sha) || !isRecord(body.commit) || !isRecord(body.commit.tree) || typeof body.commit.tree.sha !== 'string' || !SHA.test(body.commit.tree.sha)) {
    throw failure('commit', 'invalid-response', 'GitHub did not provide a valid commit and root tree SHA.')
  }
  return { commitSha: body.sha, treeSha: body.commit.tree.sha, checkedAt: new Date().toISOString() }
}

function parseTree(body: unknown, requestedSha: string): TreeSnapshot {
  if (!isRecord(body) || body.sha !== requestedSha || !Array.isArray(body.tree) || typeof body.truncated !== 'boolean') {
    throw failure('tree', 'invalid-response', 'GitHub returned an incomplete or mismatched tree response.')
  }
  const entries: TreeEntry[] = []
  for (const entry of body.tree) {
    if (!isRecord(entry) || typeof entry.path !== 'string' || typeof entry.type !== 'string' || typeof entry.mode !== 'string') {
      throw failure('tree', 'invalid-response', 'GitHub returned a malformed tree entry.')
    }
    entries.push({ path: entry.path, type: entry.type, mode: entry.mode })
  }
  return { sha: requestedSha, entries, truncated: body.truncated, checkedAt: new Date().toISOString() }
}

export async function inspectGitHub(identity: RepositoryIdentity, signal?: AbortSignal): Promise<GitHubInspection> {
  const result: GitHubInspection = {}
  try {
    const base = `/repos/${encodeURIComponent(identity.owner)}/${encodeURIComponent(identity.repo)}`
    result.metadata = parseMetadata(await getJson(base, 'repository', signal), identity)
    result.commit = parseCommit(await getJson(`${base}/commits/${encodeURIComponent(result.metadata.defaultBranch)}`, 'commit', signal))
    result.tree = parseTree(await getJson(`${base}/git/trees/${result.commit.treeSha}?recursive=1`, 'tree', signal), result.commit.treeSha)
  } catch (error) {
    result.failure = isApiFailure(error) ? error : failure('repository', 'network', 'The inspection ended unexpectedly.')
  }
  return result
}
