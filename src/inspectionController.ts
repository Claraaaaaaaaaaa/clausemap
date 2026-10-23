import { inspectGitHub } from './githubClient'
import { buildMachineReport } from './inspectionEngine'
import type { GitHubInspection, MachineReport, RepositoryIdentity } from './types'

type Inspect = (identity: RepositoryIdentity, signal?: AbortSignal) => Promise<GitHubInspection>

export class InspectionController {
  private generation = 0
  private active?: AbortController
  constructor(private inspect: Inspect = inspectGitHub) {}

  cancel(): void {
    this.generation += 1
    this.active?.abort()
    this.active = undefined
  }

  async run(identity: RepositoryIdentity, onStart: () => void, onComplete: (report: MachineReport) => void): Promise<void> {
    this.cancel()
    const runId = this.generation
    const active = new AbortController()
    this.active = active
    onStart()
    const inspection = await this.inspect(identity, active.signal)
    if (runId !== this.generation || active.signal.aborted) return
    this.active = undefined
    onComplete(buildMachineReport(identity, inspection, runId))
  }
}
