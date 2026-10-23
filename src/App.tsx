import { useRef, useState } from 'react'
import { InspectionController } from './inspectionController'
import { parseRepositoryUrl } from './repositoryUrl'
import type { MachineFinding, MachineReport } from './types'

export default function App() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<MachineReport | null>(null)
  const [selected, setSelected] = useState<MachineFinding | null>(null)
  const controller = useRef(new InspectionController())

  function run(event: React.FormEvent) {
    event.preventDefault()
    const identity = parseRepositoryUrl(input)
    if (!identity) {
      controller.current.cancel()
      setLoading(false)
      setError('Enter a GitHub repository URL, such as github.com/owner/repo.')
      setReport(null)
      setSelected(null)
      return
    }
    setError('')
    void controller.current.run(identity,
      () => { setReport(null); setSelected(null); setLoading(true) },
      next => { setReport(next); setLoading(false) },
    )
  }

  return <main className="shell">
    <header className="top"><strong className="wordmark">CLAUSE<span>MAP</span></strong><span>BUILD WITH AI: BASICS / PREFLIGHT</span></header>
    <section className="hero">
      <div><p className="eyebrow">SUBMISSION / INSPECTION 001</p><h1>Before<br />you <span>submit.</span></h1><p className="deck">Inspect the public repository behind your hackathon entry. See what GitHub actually shows, then open the evidence.</p>
      <form onSubmit={run}><label htmlFor="repo-url">PUBLIC GITHUB REPOSITORY</label><div className="input-row"><input id="repo-url" value={input} onChange={event => setInput(event.target.value)} placeholder="github.com/owner/repo" autoComplete="url" /><button type="submit" disabled={loading}>{loading ? 'Checking…' : report ? 'Run Preflight again ↺' : 'Run Preflight →'}</button></div></form>
      {error && <p className="error" role="alert">Unable to verify — {error}</p>}</div>
      <div className="orbit" aria-hidden="true"><div className="ring ring-one"/><div className="ring ring-two"/><div className="ring ring-three"/><div className="core">CM<small>REAL EVIDENCE</small></div></div>
    </section>
    {loading && <p className="loading" role="status">Contacting GitHub and resolving a new default-branch snapshot…</p>}
    {report && <section className="result" aria-live="polite"><p className="eyebrow">LIVE GITHUB INSPECTION</p><h2>{report.findings.some(f => f.status === 'Missing') ? 'A file needs attention.' : report.findings.some(f => f.status === 'Unable to verify') ? 'Some evidence is unavailable.' : 'Named files observed.'}</h2>
      <p>{report.fullName} · {report.defaultBranch ?? 'Default branch unknown'} · Checked {report.checkedAt}</p>
      <p>Each result covers one claim. File presence does not prove content compliance or overall eligibility.</p>
      <div className="finding-list">{report.findings.map(finding => <button type="button" key={finding.id} onClick={() => setSelected(finding)} className="finding"><span>{finding.title}</span><strong>{finding.status}</strong><small>View evidence ↗</small></button>)}</div>
      {selected && <section className="basic-inspector" role="dialog" aria-label={`${selected.title} evidence`}><button type="button" className="close" onClick={() => setSelected(null)}>Close ×</button><p className="eyebrow">EVIDENCE / {selected.id.toUpperCase()}</p><h3>{selected.title} · {selected.status}</h3><h4>Observed / Not observed</h4><p>{selected.observation}</p><p>Observed at {selected.observedAt}</p>{selected.path && <p>Path: <code>{selected.path}</code></p>}{selected.commitSha && <p>Commit: <code>{selected.commitSha}</code></p>}{selected.treeSha && <p>Tree: <code>{selected.treeSha}</code></p>}{selected.sourceUrl && <p><a href={selected.sourceUrl} target="_blank" rel="noreferrer">Inspect GitHub source ↗</a></p>}<h4>Official requirement · {selected.rule.obligation}</h4><p>{selected.rule.summary}</p><p><a href={selected.rule.sourceUrl} target="_blank" rel="noreferrer">{selected.rule.section} / Official Rules ↗</a></p><h4>What this proves or cannot prove</h4><p>{selected.limitation}</p><h4>Next move</h4><p>{selected.nextAction}</p></section>}
    </section>}
    <footer>CLAUSEMAP / EVIDENCE BEFORE ASSURANCE</footer>
  </main>
}
