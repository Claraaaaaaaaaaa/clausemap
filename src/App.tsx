import { useEffect, useRef, useState } from 'react'
import { InspectionController } from './inspectionController'
import { parseRepositoryUrl } from './repositoryUrl'
import { rules } from './rules'
import type { MachineFinding, MachineReport, ManualId, ManualStatus, RepositoryIdentity } from './types'

const manualItems: { id: ManualId; title: string; action: string }[] = [
  { id: 'video', title: 'Demo video', action: 'Check the video is publicly accessible on YouTube or Vimeo and add its link to your Devpost entry.' },
  { id: 'eligibility', title: 'Eligibility', action: 'Read the official eligibility terms and confirm they apply to you.' },
  { id: 'form', title: 'Devpost form', action: 'Review every required Devpost field before final submission.' },
]
type Selection = MachineFinding['id'] | ManualId
type Status = MachineFinding['status'] | ManualStatus
const classFor = (status: Status) => `status-${status.toLowerCase().replaceAll(' ', '-')}`
const symbol = (status: Status) => status === 'Verified' ? '✓' : status === 'Missing' ? '!' : status === 'Self-confirmed' ? '◉' : '○'

function EvidenceInspector({ id, report, onClose }: { id: Selection; report: MachineReport; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const machine = report.findings.find(item => item.id === id)
  const manual = manualItems.find(item => item.id === id)
  const rule = machine?.rule ?? rules[id]
  const status: Status = machine?.status ?? 'Needs confirmation'
  const title = machine?.title ?? manual?.title ?? ''
  useEffect(() => {
    const formerOverflow = document.body.style.overflow
    const page = document.querySelector<HTMLElement>('.page')
    page?.setAttribute('inert', '')
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])'))
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { page?.removeAttribute('inert'); document.body.style.overflow = formerOverflow; document.removeEventListener('keydown', onKeyDown) }
  }, [onClose])
  return <div className="inspector-layer"><div className="scrim" onClick={onClose} aria-hidden="true" /><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="inspector-title" ref={panelRef}>
    <div className="drawer-head"><span className="micro">CLAUSEMAP / EVIDENCE INSPECTOR</span><button ref={closeRef} type="button" onClick={onClose} className="drawer-close" aria-label="Close evidence inspector">×</button></div>
    <div className="drawer-title"><p className="micro">RECORD {String(['repo', 'scope', 'prd', 'spec', 'video', 'eligibility', 'form'].indexOf(id) + 1).padStart(3, '0')} / 007</p><h2 id="inspector-title">{title}</h2><span className={`status-pill ${classFor(status)}`}><b aria-hidden="true">{symbol(status)}</b>{status}</span></div>
    <section className="drawer-section"><h3 className="micro">01 / OBSERVED · NOT OBSERVED</h3><div className="evidence-field">{machine?.observation ?? 'No machine check is available for this requirement. Please review it yourself.'}</div>{machine && <div className="evidence-meta"><p>Observed <time dateTime={machine.observedAt}>{new Date(machine.observedAt).toLocaleString()}</time></p>{machine.path && <p>Path <code>{machine.path}</code></p>}{machine.commitSha && <p>Commit <code>{machine.commitSha}</code></p>}{machine.treeSha && <p>Tree <code>{machine.treeSha}</code></p>}{machine.sourceUrl && <a href={machine.sourceUrl} target="_blank" rel="noreferrer">Open pinned GitHub source ↗</a>}</div>}</section>
    <section className="drawer-section"><h3 className="micro">02 / OFFICIAL REQUIREMENT · {rule.obligation.toUpperCase()}</h3><p>{rule.summary}</p><p className="drawer-small"><a href={rule.sourceUrl} target="_blank" rel="noreferrer">{rule.section} / Official Rules ↗</a><br />Rule catalog reviewed {rule.reviewedOn}</p></section>
    <section className="drawer-section"><h3 className="micro">03 / WHAT THIS PROVES</h3><p>{machine?.limitation ?? 'Your declaration is not independently verified. ClauseMap cannot determine video compliance, personal eligibility, or Devpost form completion from GitHub.'}</p></section>
    <section className="drawer-section"><h3 className="micro">04 / NEXT MOVE</h3><p className="next-action">{machine?.nextAction ?? manual?.action}</p></section>
    {manual && <section className="drawer-section manual-note"><h3 className="micro">HUMAN REVIEW</h3><p>Needs confirmation. This item cannot become Verified through a declaration.</p></section>}
    <p className="drawer-footer">CLAUSEMAP / A finding is limited to its stated evidence. No overall submission certification.</p>
  </aside></div>
}

function InspectionMap({ report, onSelect }: { report: MachineReport; onSelect: (id: Selection, source: HTMLElement) => void }) {
  const nodes = [...report.findings.map(item => ({ id: item.id, title: item.title, status: item.status })), ...manualItems.map(item => ({ id: item.id, title: item.title, status: 'Needs confirmation' as const }))]
  return <div className="map-row"><div className="map-card"><div className="map-top"><strong>INSPECTION / MAP</strong><span className="micro">SELECT A NODE → INSPECT EVIDENCE</span><span>7 CHECKS / LIVE</span></div><div className="map-body"><svg className="map-lines" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true"><path d="M190 205 C305 205, 360 75, 500 75 M190 205 C310 205, 380 203, 500 203 M190 205 C310 205, 368 328, 500 328 M500 203 C630 203, 715 75, 830 75 M500 203 C630 203, 720 203, 830 203 M500 203 C630 203, 715 328, 830 328" /></svg>{nodes.map(node => <button key={node.id} className={`map-node ${node.id} ${classFor(node.status)}`} type="button" onClick={event => onSelect(node.id, event.currentTarget)} aria-label={`${node.title}: ${node.status}. Open evidence.`}><span className="s" aria-hidden="true">{symbol(node.status)}</span><span className="txt"><strong>{node.title}</strong><small>{node.status}</small></span></button>)}<span className="map-hint"><span className="dot-marker" /> SOURCE → REQUIRED FILES → HUMAN CHECKS</span></div></div><div className="side-column"><div className="side-box"><span className="micro">01 / MACHINE EVIDENCE</span><h3>See what is actually there.</h3><p>Repository access and document presence are checked against one default-branch commit. Select a node to see the observation and official rule.</p><span className="arrow">↗</span></div><div className="side-box"><span className="micro">02 / HUMAN REVIEW</span><h3>Keep the unknowns visible.</h3><p>Video, eligibility, and the Devpost form need your own review. They are never machine Verified by this GitHub inspection.</p></div></div></div>
}

function StatusSummary({ report }: { report: MachineReport }) {
  const count = (status: MachineFinding['status']) => report.findings.filter(item => item.status === status).length
  return <div className="overview" aria-label="Counts of findings, not an overall score"><div className="overview-card"><strong className="n">{count('Verified')}</strong><span className="meta">VERIFIED<small>Machine observed</small></span></div><div className="overview-card"><strong className="n">{count('Missing')}</strong><span className="meta">MISSING<small>Confirmed absent</small></span></div><div className="overview-card"><strong className="n">{count('Unable to verify')}</strong><span className="meta">UNABLE TO VERIFY<small>Insufficient evidence</small></span></div><div className="overview-card"><strong className="n">3</strong><span className="meta">NEEDS CONFIRMATION<small>Human review</small></span></div><div className="overview-caveat"><strong>Partial inspection, not certification.</strong><br />File presence cannot establish content compliance or submission eligibility.</div></div>
}

export default function App() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<MachineReport | null>(null)
  const [identity, setIdentity] = useState<RepositoryIdentity | null>(null)
  const [selected, setSelected] = useState<Selection | null>(null)
  const controller = useRef(new InspectionController())
  const returnFocus = useRef<HTMLElement | null>(null)
  const reportRef = useRef<HTMLElement>(null)
  useEffect(() => { if (selected === null && report) returnFocus.current?.focus() }, [selected, report])
  function start(target: RepositoryIdentity) {
    setIdentity(target); setError('')
    void controller.current.run(target, () => { setReport(null); setSelected(null); setLoading(true) }, next => { setReport(next); setLoading(false); requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })) })
  }
  function submit(event: React.FormEvent) {
    event.preventDefault()
    const target = parseRepositoryUrl(input)
    if (!target) { controller.current.cancel(); setLoading(false); setReport(null); setIdentity(null); setError('Enter a public GitHub repository URL, such as github.com/owner/repo.'); return }
    start(target)
  }
  function open(id: Selection, source: HTMLElement) { returnFocus.current = source; setSelected(id) }
  function close() { setSelected(null) }
  function startOver() { controller.current.cancel(); setReport(null); setIdentity(null); setInput(''); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return <><div className="grain" aria-hidden="true" /><div className="page"><header className="header container"><button className="brand" onClick={startOver} type="button" aria-label="ClauseMap home"><span className="mark" aria-hidden="true">✓</span><span className="brand-name">clausemap<span>.</span></span></button><div className="header-right"><span className="edition">BUILD WITH AI: BASICS / SUBMISSION PREFLIGHT</span><a href="https://learn-ai-basics.devpost.com/rules" target="_blank" rel="noreferrer">OFFICIAL RULES ↗</a></div></header><div className="ticker" aria-hidden="true"><div>CHECK THE SOURCE <span>✳</span> FIND THE GAP <span>✳</span> FIX BEFORE SUBMIT <span>✳</span> CHECK THE SOURCE <span>✳</span> FIND THE GAP <span>✳</span> FIX BEFORE SUBMIT <span>✳</span></div></div>
    <main>{!report && !loading && <section className="landing container"><div className="hero"><div className="hero-copy"><p className="overline micro"><b /> EDITION N°01 — THE PRE-SUBMISSION INSPECTION</p><h1>DON'T<br />SUBMIT<br /><span>BLIND.</span></h1><p className="hero-deck"><strong>Your project deserves a proper final check.</strong> Find missing requirements before you hit submit.</p><div className="form-label micro"><label htmlFor="repo-url">01 / YOUR PUBLIC GITHUB REPOSITORY</label><span>LIVE CHECK</span></div><form className="launch-form" onSubmit={submit}><span className="repo-icon" aria-hidden="true">⌘</span><input id="repo-url" value={input} onChange={event => setInput(event.target.value)} placeholder="github.com/you/your-project" autoComplete="url" spellCheck="false" aria-invalid={Boolean(error)} aria-describedby={error ? 'form-error' : undefined} /><button type="submit" className="launch-button">RUN PREFLIGHT <span aria-hidden="true">↗</span></button></form>{error && <p id="form-error" className="form-error" role="alert">{error}</p>}<div className="form-meta"><span>✳ No login. No API key.</span><span>Public GitHub data, checked live.</span></div></div><div className="radial-zone" aria-hidden="true"><div className="orbit-stage"><div className="ring r1" /><div className="ring r2" /><div className="ring r3" /><div className="ring r4" /><div className="orbit-core"><strong>CM</strong><span>PRE-SUBMISSION / INSPECTION</span></div><span className="orbit-chip c1">01 / SOURCE</span><span className="orbit-chip c2">02 / FILES</span><span className="orbit-chip c3">03 / HUMAN REVIEW</span></div></div></div><div className="hero-foot"><div className="foot-point"><span>01</span><div><b>Check the repo.</b><p>Inspect public access and the planning files.</p></div></div><div className="foot-point"><span>02</span><div><b>See the evidence.</b><p>Open every finding and read its source.</p></div></div><div className="foot-point"><span>03</span><div><b>Fix. Re-check.</b><p>Only fresh observations change machine findings.</p></div></div></div></section>}
      {loading && <section className="checking container" role="status" aria-live="polite"><div className="checking-orbit" aria-hidden="true">↗</div><p className="micro">LIVE GITHUB INSPECTION</p><h1>Resolving a fresh snapshot.</h1><p>Checking public access, the default-branch commit, and its recursive file tree. No result is shown until the response is evaluated.</p></section>}
      {report && <section className="report container" ref={reportRef} aria-live="polite"><div className="report-header"><div><p className="report-kicker micro">✳ LIVE INSPECTION / {report.fullName.toUpperCase()}</p><h1 className="report-title">{report.findings.some(item => item.status === 'Missing') ? <>A detail <span>needs you.</span></> : report.findings.some(item => item.status === 'Unable to verify') ? <>Evidence <span>is incomplete.</span></> : <>Files <span>observed.</span></>}</h1><p className="report-sub">Default branch: {report.defaultBranch ?? 'unavailable'} · Checked <time dateTime={report.checkedAt}>{new Date(report.checkedAt).toLocaleString()}</time>{report.commitSha && <> · Commit <code>{report.commitSha.slice(0, 12)}</code></>}</p></div><div className="report-buttons"><button type="button" className="secondary-btn" onClick={startOver}>ANOTHER REPO</button><button type="button" className="accent-btn" onClick={() => identity && start(identity)}>RUN PREFLIGHT AGAIN ↗</button></div></div><StatusSummary report={report} /><InspectionMap report={report} onSelect={open} /><p className="report-note"><strong>Evidence has limits.</strong> This inspection checks public access and file presence at one commit. It does not certify the overall submission.</p></section>}
    </main><footer className="footer container"><span>CLAUSEMAP / EVIDENCE BEFORE ASSURANCE</span><span>BUILD WITH AI: BASICS · NO OVERALL COMPLIANCE SCORE</span></footer></div>{selected && report && <EvidenceInspector id={selected} report={report} onClose={close} />}</>
}
