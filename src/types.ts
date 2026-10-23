export type MachineStatus = 'Verified' | 'Missing' | 'Unable to verify'
export type ManualStatus = 'Needs confirmation' | 'Self-confirmed'
export type MachineId = 'repo' | 'scope' | 'prd' | 'spec'
export type ManualId = 'video' | 'eligibility' | 'form'
export type Stage = 'repository' | 'commit' | 'tree'

export interface RepositoryIdentity {
  owner: string
  repo: string
  key: string
}

export interface ApiFailure {
  stage: Stage
  kind: 'not-found' | 'rate-limit' | 'forbidden' | 'conflict' | 'timeout' | 'network' | 'invalid-response' | 'http-error' | 'aborted'
  detail: string
  checkedAt: string
  httpStatus?: number
  retryAt?: string
}

export interface RepositoryMetadata {
  identity: RepositoryIdentity
  fullName: string
  defaultBranch: string
  htmlUrl: string
  checkedAt: string
}

export interface CommitSnapshot {
  commitSha: string
  treeSha: string
  checkedAt: string
}

export interface TreeEntry {
  path: string
  type: string
  mode: string
}

export interface TreeSnapshot {
  sha: string
  entries: TreeEntry[]
  truncated: boolean
  checkedAt: string
}

export interface GitHubInspection {
  metadata?: RepositoryMetadata
  commit?: CommitSnapshot
  tree?: TreeSnapshot
  failure?: ApiFailure
}

export interface RuleRef {
  id: MachineId | ManualId
  section: string
  sourceUrl: string
  obligation: 'must' | 'should'
  summary: string
  reviewedOn: string
}

export interface MachineFinding {
  id: MachineId
  title: string
  status: MachineStatus
  observation: string
  observedAt: string
  coverage: 'complete' | 'incomplete' | 'unavailable'
  sourceUrl?: string
  path?: string
  commitSha?: string
  treeSha?: string
  limitation: string
  nextAction: string
  rule: RuleRef
}

export interface MachineReport {
  runId: number
  repositoryKey: string
  fullName: string
  defaultBranch?: string
  commitSha?: string
  treeSha?: string
  checkedAt: string
  findings: MachineFinding[]
}

export interface RuleRef {
  id: MachineId | ManualId
  section: string
  sourceUrl: string
  obligation: 'must' | 'should'
  summary: string
  reviewedOn: string
}

export interface MachineFinding {
  id: MachineId
  title: string
  status: MachineStatus
  observation: string
  observedAt: string
  coverage: 'complete' | 'incomplete' | 'unavailable'
  sourceUrl?: string
  path?: string
  commitSha?: string
  treeSha?: string
  limitation: string
  nextAction: string
  rule: RuleRef
}

export interface MachineReport {
  runId: number
  repositoryKey: string
  fullName: string
  defaultBranch?: string
  commitSha?: string
  treeSha?: string
  checkedAt: string
  findings: MachineFinding[]
}
