import { useRef, useState } from 'react'
import { inspectGitHub } from './githubClient'
import { parseRepositoryUrl } from './repositoryUrl'
import type { GitHubInspection } from './types'

export default function App() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GitHubInspection | null>(null)
  const generation = useRef(0)
  const active = useRef<AbortController | null>(null)

  async function run(event: React.FormEvent) {
    event.preventDefault()
    const identity = parseRepositoryUrl(input)
    if (!identity) {
      setError('Enter a GitHub repository URL, such as github.com/owner/repo.')
      setResult(null)
      return
    }
    const current = ++generation.current
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    setError('')
    setResult(null)
    setLoading(true)
    const inspection = await inspectGitHub(identity, controller.signal)
    if (current !== generation.current) return
    setResult(inspection)
    setLoading(false)
  }

  return <main className="shell">
    <header className="top"><strong className="wordmark">CLAUSE<span>MAP</span></strong><span>BUILD WITH AI: BASICS / PREFLIGHT</span></header>
    <section className="hero">
      <div><p className="eyebrow">SUBMISSION / INSPECTION 001</p><h1>Before<br />you <span>submit.</span></h1><p className="deck">Inspect the public repository behind your hackathon entry. See what GitHub actually shows, then open the evidence.</p>
      <form onSubmit={run}><label htmlFor="repo-url">PUBLIC GITHUB REPOSITORY</label><div className="input-row"><input id="repo-url" value={input} onChange={event => setInput(event.target.value)} placeholder="github.com/owner/repo" autoComplete="url" /><button type="submit" disabled={loading}>{loading ? 'Checking…' : 'Run Preflight →'}</button></div></form>
      {error && <p className="error" role="alert">Unable to verify — {error}</p>}</div>
      <div className="orbit" aria-hidden="true"><div className="ring ring-one"/><div className="ring ring-two"/><div className="ring ring-three"/><div className="core">CM<small>REAL EVIDENCE</small></div></div>
    </section>
    {loading && <p className="loading" role="status">Contacting GitHub and resolving the default branch snapshot…</p>}
    {result && <section className="result" aria-live="polite"><p className="eyebrow">LIVE GITHUB OBSERVATION</p><h2>{result.metadata ? 'Public repository observed.' : 'Unable to verify.'}</h2>
      {result.metadata && <><p>{result.metadata.fullName} is publicly readable. This proves repository access only.</p><p>Default branch: <code>{result.metadata.defaultBranch}</code></p><p>Observed: <time>{result.metadata.checkedAt}</time></p><a href={result.metadata.htmlUrl} target="_blank" rel="noreferrer">Open observed repository ↗</a></>}
      {result.commit && <p>Commit: <code>{result.commit.commitSha}</code></p>}
      {result.tree && <p>Recursive tree: <code>{result.tree.sha}</code> · {result.tree.entries.length} entries · {result.tree.truncated ? 'Truncated' : 'Complete'}</p>}
      {result.failure && <p className="error">Unable to verify {result.failure.stage}: {result.failure.detail} ({result.failure.httpStatus ?? result.failure.kind})</p>}
      <p className="note">File findings and the full Inspection Map are the next verified build slice. No document compliance is claimed here.</p>
    </section>}
    <footer>CLAUSEMAP / EVIDENCE BEFORE ASSURANCE</footer>
  </main>
}
