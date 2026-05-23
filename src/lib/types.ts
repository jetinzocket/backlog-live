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

export type ItemSource =
  | 'slack'
  | 'linear'
  | 'customer-call'
  | 'internal'
  | 'email'
  | 'gtm'
  | 'other'

export interface WorkflowPRD {
  wiki_path: string
  drive_url: string
  created_at: string
  content?: string
}

export interface WorkflowFigr {
  url?: string
  drive_url?: string
  spec_content?: string
  created_at?: string
}

export interface WorkflowTicket {
  id: string
  title: string
}

export interface Workflow {
  prd?: WorkflowPRD
  figr?: WorkflowFigr
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
  // provenance fields
  source: ItemSource | null
  requested_by: string | null
  requested_at: string | null
  request_context: string | null
}

export type PartialBacklogItem = Partial<Omit<BacklogItem, 'id' | 'created_at'>>

// Column visibility
export type ColumnKey =
  | 'title'
  | 'module'
  | 'owner'
  | 'priority'
  | 'status'
  | 'customers'
  | 'linear'
  | 'source'
  | 'requested_by'
  | 'requested_at'
  | 'due_date'
  | 'quarter'
  | 'actions'

export const ALWAYS_VISIBLE: ColumnKey[] = ['title', 'actions']

export const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
  'title', 'module', 'owner', 'priority', 'status', 'customers', 'linear', 'actions',
]

export const ALL_COLUMN_KEYS: ColumnKey[] = [
  'title', 'module', 'owner', 'priority', 'status', 'customers', 'linear',
  'source', 'requested_by', 'requested_at', 'due_date', 'quarter', 'actions',
]

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  title: 'Title',
  module: 'Module',
  owner: 'Owner',
  priority: 'Priority',
  status: 'Status',
  customers: 'Customers',
  linear: 'Linear',
  source: 'Source',
  requested_by: 'Requested by',
  requested_at: 'Requested on',
  due_date: 'Due date',
  quarter: 'Quarter',
  actions: 'Actions',
}

export interface FilterState {
  modules: Module[]
  owners: Owner[]
  priorities: Priority[]
  statuses: Status[]
  hasTicket: 'all' | 'yes' | 'no'
  customer: string
  sources: ItemSource[]
  requestedBy: string
}
