import type { Module, Owner, Status, Priority } from './types'

export const MODULE_MAP: Record<Module, string> = {
  bi: 'Brand Intelligence & Governance',
  orm: 'Consumer AI & ORM',
  creative: 'Creative AI',
  perf: 'Performance AI',
  legacy: 'Zocket Legacy (v1)',
  team: 'Team & Collaboration',
  integrations: 'Integrations & Connectors',
  settings: 'Settings & Billing',
  others: 'GTM & Operations',
}

export const MODULE_SHORT: Record<Module, string> = {
  bi: 'Brand Intel',
  orm: 'Consumer AI',
  creative: 'Creative AI',
  perf: 'Performance AI',
  legacy: 'Legacy v1',
  team: 'Team & Collab',
  integrations: 'Integrations',
  settings: 'Settings',
  others: 'GTM & Ops',
}

export const MODULE_COLORS: Record<Module, string> = {
  bi: 'bg-violet-100 text-violet-700',
  orm: 'bg-cyan-100 text-cyan-700',
  creative: 'bg-pink-100 text-pink-700',
  perf: 'bg-orange-100 text-orange-700',
  legacy: 'bg-slate-100 text-slate-600',
  team: 'bg-teal-100 text-teal-700',
  integrations: 'bg-indigo-100 text-indigo-700',
  settings: 'bg-gray-100 text-gray-600',
  others: 'bg-lime-100 text-lime-700',
}

export const OWNER_COLORS: Record<Owner, string> = {
  jetin: 'bg-blue-100 text-blue-700',
  prem: 'bg-purple-100 text-purple-700',
  gayathri: 'bg-orange-100 text-orange-700',
  raghav: 'bg-green-100 text-green-700',
}

export const OWNER_INITIALS: Record<Owner, string> = {
  jetin: 'JK',
  prem: 'PR',
  gayathri: 'GK',
  raghav: 'RV',
}

export const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  todo: { label: 'Todo', className: 'bg-gray-100 text-gray-600' },
  ip: { label: 'In Progress', className: 'bg-amber-50 text-amber-700' },
  qa: { label: 'In QA', className: 'bg-green-50 text-green-700' },
  live: { label: 'Live', className: 'bg-teal-50 text-teal-700' },
  blocked: { label: 'Blocked', className: 'bg-red-50 text-red-700' },
  new: { label: 'New', className: 'bg-blue-50 text-blue-700' },
}

export const PRIORITY_MAP: Record<Priority, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-red-50 text-red-700' },
  med: { label: 'Med', className: 'bg-amber-50 text-amber-700' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-500' },
}

export const ROADMAP_QUARTERS = ['Q2 2026', 'Q3 2026', 'Q4 2026']

export const ALL_MODULES: Module[] = [
  'bi', 'orm', 'creative', 'perf', 'legacy', 'team', 'integrations', 'settings', 'others',
]

export const ALL_OWNERS: Owner[] = ['jetin', 'prem', 'gayathri', 'raghav']

export const ALL_STATUSES: Status[] = ['todo', 'ip', 'qa', 'live', 'blocked', 'new']

export const ALL_PRIORITIES: Priority[] = ['high', 'med', 'low']

// Meta API deadline: June 9, 2026
export const META_API_DEADLINE = new Date('2026-06-09')
