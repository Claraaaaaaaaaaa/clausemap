import type { RepositoryIdentity } from './types'

const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/
const REPO = /^[A-Za-z0-9_.-]+$/

export function parseRepositoryUrl(input: string): RepositoryIdentity | null {
  const raw = input.trim()
  if (!raw) return null
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com' || url.port || url.username || url.password) return null
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length !== 2) return null
  const [owner, rawRepo] = segments
  const repo = rawRepo.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo
  if (!OWNER.test(owner) || !REPO.test(repo) || repo === '.' || repo === '..') return null
  return { owner, repo, key: `${owner.toLowerCase()}/${repo.toLowerCase()}` }
}
