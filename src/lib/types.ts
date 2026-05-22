// Seed data is loaded via the daily routine which runs python against the backlog HTML and upserts to Supabase.
// See jetins-brain-wiki routine for details.

export type Module =
  | 'bi'
  | 'orm'
  | 'creative'
  | 'perf'
  | 'legacy'
  | 'team'
  | 'integrations'
  | 'settings'
  | 'others'

export type Owner = 'jetin' | 'prem' | 'gayathri' | 'raghav'

export type Priority = 'high' | 'med' | 'low'

export type Status = 'todo' | 'ip' | 'qa' | 'live' | 'blocked' | 'new'

export type RoadmapQuarter = 'Q2 2026' | 'Q3 2026' | 'Q4 2026' | null

export interface WorkflowPRD {
  wiki_path: string
  drive_url: string
  created_at: string
}

export interface WorkflowFigma {
  url: string
}

export interface WorkflowTicket {
  id: string
  title: string
}

export interface Workflow {
  prd?: WorkflowPRD
  figma?: WorkflowFigma
  tickets?: WorkflowTicket[]
}

export interface BacklogItem {
  id: string
  linear_id: string | null
  title: string
  detail: string | null
  module: Module
  owner: Owner
  priority: Priority
  status: Status
  customers: string[]
  has_linear: boolean
  suggested_due: string | null
  roadmap_quarter: string | null
  roadmap_notes: string | null
  workflow: Workflow
  manually_overridden: boolean
  last_linear_sync: string | null
  created_at: string
  updated_at: string
}

export type PartialBacklogItem = Partial<Omit<BacklogItem, 'id' | 'created_at'>>

export interface FilterState {
  modules: Module[]
  owners: Owner[]
  priorities: Priority[]
  statuses: Status[]
  hasTicket: 'all' | 'yes' | 'no'
  customer: string
}
