'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BacklogItem, FilterState } from '@/lib/types'
import { isSupabaseConfigured } from '@/lib/supabase'

// ─── demo/placeholder items shown when Supabase isn't configured ─────────────
const DEMO_ITEMS: BacklogItem[] = [
  {
    id: 'demo-1',
    linear_id: 'BRA-792',
    title: 'Meta API v23→v25 migration (BRA-792, ZOC-76)',
    detail: 'Upgrade all Meta API calls from v23 to v25 before June 9 2026 deprecation deadline.',
    module: 'bi',
    owner: 'jetin',
    priority: 'high',
    status: 'ip',
    customers: ['Croma', 'Lenskart'],
    has_linear: true,
    suggested_due: '2026-06-09',
    roadmap_quarter: 'Q2 2026',
    roadmap_notes: 'Hard deadline — Meta deprecates v23 on June 9 2026.',
    workflow: {},
    manually_overridden: false,
    last_linear_sync: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'linear',
    requested_by: 'Jetin',
    requested_at: '2026-04-01',
    request_context: null,
  },
  {
    id: 'demo-2',
    linear_id: null,
    title: 'Brand safety score dashboard for enterprise accounts',
    detail: 'Build a brand safety dashboard showing violations, score trends, and remediation suggestions.',
    module: 'bi',
    owner: 'prem',
    priority: 'high',
    status: 'todo',
    customers: ['Croma', 'Reliance'],
    has_linear: false,
    suggested_due: null,
    roadmap_quarter: 'Q3 2026',
    roadmap_notes: null,
    workflow: {},
    manually_overridden: false,
    last_linear_sync: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'customer-call',
    requested_by: 'Croma team',
    requested_at: '2026-04-15',
    request_context: null,
  },
  {
    id: 'demo-3',
    linear_id: 'CRE-45',
    title: 'AI video generation from product images',
    detail: 'One-click video generation using brand images as input, with motion presets.',
    module: 'creative',
    owner: 'gayathri',
    priority: 'high',
    status: 'qa',
    customers: ['Lenskart', 'Myntra'],
    has_linear: true,
    suggested_due: '2026-06-15',
    roadmap_quarter: 'Q2 2026',
    roadmap_notes: null,
    workflow: { prd: { wiki_path: 'wiki/prds/ai-video-gen.md', drive_url: 'https://drive.google.com/drive/folders/1jl0idgmxGn3kncuf8oIf5yQZnv2dBAYP', created_at: '2026-04-10', content: '# PRD: AI Video Generation\n\nDemo content.' } },
    manually_overridden: false,
    last_linear_sync: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'internal',
    requested_by: 'Gayathri',
    requested_at: '2026-03-20',
    request_context: null,
  },
  {
    id: 'demo-4',
    linear_id: null,
    title: 'Automated ORM response suggestions for negative reviews',
    detail: 'ML model suggests brand-appropriate responses to negative consumer reviews within 30s.',
    module: 'orm',
    owner: 'raghav',
    priority: 'med',
    status: 'blocked',
    customers: ['Croma'],
    has_linear: false,
    suggested_due: null,
    roadmap_quarter: 'Q3 2026',
    roadmap_notes: 'Blocked on brand voice model training dataset.',
    workflow: {},
    manually_overridden: false,
    last_linear_sync: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'customer-call',
    requested_by: 'Croma',
    requested_at: '2026-04-05',
    request_context: null,
  },
  {
    id: 'demo-5',
    linear_id: 'PERF-12',
    title: 'Smart budget allocation across Meta + Google campaigns',
    detail: 'AI-driven cross-channel budget reallocation to maximize ROAS based on real-time signals.',
    module: 'perf',
    owner: 'jetin',
    priority: 'high',
    status: 'todo',
    customers: ['Reliance', 'Lenskart', 'Croma'],
    has_linear: true,
    suggested_due: '2026-06-20',
    roadmap_quarter: 'Q2 2026',
    roadmap_notes: null,
    workflow: {},
    manually_overridden: false,
    last_linear_sync: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'internal',
    requested_by: 'Jetin',
    requested_at: '2026-04-10',
    request_context: null,
  },
  {
    id: 'demo-6',
    linear_id: null,
    title: 'SSO / SAML login for enterprise accounts',
    detail: 'Enterprise-grade SSO via SAML 2.0 for large account teams.',
    module: 'settings',
    owner: 'prem',
    priority: 'med',
    status: 'new',
    customers: ['Croma'],
    has_linear: false,
    suggested_due: null,
    roadmap_quarter: 'Q4 2026',
    roadmap_notes: null,
    workflow: {},
    manually_overridden: false,
    last_linear_sync: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'customer-call',
    requested_by: 'Croma IT',
    requested_at: '2026-05-01',
    request_context: null,
  },
]

export function useBacklog() {
  const [items, setItems] = useState<BacklogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    if (!isSupabaseConfigured) {
      setItems(DEMO_ITEMS)
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/items/list')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setItems(json.items ?? [])
    } catch (e) {
      setError(String(e))
      setItems(DEMO_ITEMS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { items, loading, error, refresh: load, setItems }
}

export function applyFilters(items: BacklogItem[], filters: FilterState): BacklogItem[] {
  return items.filter(item => {
    if (filters.modules.length > 0 && !filters.modules.includes(item.module)) return false
    if (filters.owners.length > 0 && !filters.owners.includes(item.owner)) return false
    if (filters.priorities.length > 0 && !filters.priorities.includes(item.priority)) return false
    if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) return false
    if (filters.hasTicket === 'yes' && !item.has_linear) return false
    if (filters.hasTicket === 'no' && item.has_linear) return false
    if (filters.customer) {
      const q = filters.customer.toLowerCase()
      if (!item.customers.some(c => c.toLowerCase().includes(q))) return false
    }
    if (filters.sources.length > 0) {
      if (!item.source || !filters.sources.includes(item.source)) return false
    }
    if (filters.requestedBy) {
      const q = filters.requestedBy.toLowerCase()
      if (!item.requested_by?.toLowerCase().includes(q)) return false
    }
    return true
  })
}
