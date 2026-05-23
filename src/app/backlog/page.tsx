'use client'

import { useState, useMemo } from 'react'
import BacklogTable from '@/components/BacklogTable'
import MultiSelectFilter from '@/components/MultiSelectFilter'
import { useBacklog, applyFilters } from '@/hooks/useBacklog'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  MODULE_MAP, ALL_MODULES, ALL_OWNERS, ALL_STATUSES, ALL_PRIORITIES,
  ALL_SOURCES, STATUS_MAP, PRIORITY_MAP, SOURCE_MAP,
} from '@/lib/constants'
import type { FilterState, BacklogItem, Module, Owner, Status, Priority, ItemSource } from '@/lib/types'

const DEFAULT_FILTERS: FilterState = {
  modules: [],
  owners: [],
  priorities: [],
  statuses: [],
  hasTicket: 'all',
  customer: '',
  sources: [],
  requestedBy: '',
}

export default function BacklogPage() {
  const { items, loading, setItems } = useBacklog()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const filtered = useMemo(() => applyFilters(items, filters), [items, filters])

  const activeFilterCount =
    filters.modules.length +
    filters.owners.length +
    filters.priorities.length +
    filters.statuses.length +
    filters.sources.length +
    (filters.hasTicket !== 'all' ? 1 : 0) +
    (filters.customer ? 1 : 0) +
    (filters.requestedBy ? 1 : 0)

  function clearAll() { setFilters(DEFAULT_FILTERS) }

  function handleItemUpdate(id: string, patch: Partial<BacklogItem>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {!isSupabaseConfigured && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Demo mode</strong> — showing sample data. Configure Supabase to load your backlog.
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Product Backlog</h1>
        <span className="text-sm text-gray-500">
          Showing <strong>{filtered.length}</strong> of <strong>{items.length}</strong> items
        </span>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b border-gray-200 -mx-6 px-6 py-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <MultiSelectFilter
            label="Module"
            options={ALL_MODULES.map(m => ({ value: m, label: MODULE_MAP[m] }))}
            selected={filters.modules}
            onChange={vals => setFilters(f => ({ ...f, modules: vals as Module[] }))}
          />
          <MultiSelectFilter
            label="Owner"
            options={ALL_OWNERS.map(o => ({ value: o, label: o.charAt(0).toUpperCase() + o.slice(1) }))}
            selected={filters.owners}
            onChange={vals => setFilters(f => ({ ...f, owners: vals as Owner[] }))}
          />
          <MultiSelectFilter
            label="Priority"
            options={ALL_PRIORITIES.map(p => ({ value: p, label: PRIORITY_MAP[p].label }))}
            selected={filters.priorities}
            onChange={vals => setFilters(f => ({ ...f, priorities: vals as Priority[] }))}
          />
          <MultiSelectFilter
            label="Status"
            options={ALL_STATUSES.map(s => ({ value: s, label: STATUS_MAP[s].label }))}
            selected={filters.statuses}
            onChange={vals => setFilters(f => ({ ...f, statuses: vals as Status[] }))}
          />
          <MultiSelectFilter
            label="Source"
            options={ALL_SOURCES.map(s => ({ value: s, label: `${SOURCE_MAP[s].icon} ${SOURCE_MAP[s].label}` }))}
            selected={filters.sources}
            onChange={vals => setFilters(f => ({ ...f, sources: vals as ItemSource[] }))}
          />

          {/* Has Ticket */}
          <select
            value={filters.hasTicket}
            onChange={e => setFilters(f => ({ ...f, hasTicket: e.target.value as FilterState['hasTicket'] }))}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filters.hasTicket !== 'all'
                ? 'border-primary bg-blue-50 text-primary font-medium'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <option value="all">Has Ticket</option>
            <option value="yes">Has Ticket: Yes</option>
            <option value="no">Has Ticket: No</option>
          </select>

          {/* Customer search */}
          <input
            type="text"
            value={filters.customer}
            onChange={e => setFilters(f => ({ ...f, customer: e.target.value }))}
            placeholder="Search customer…"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:border-primary focus:outline-none w-36"
          />

          {/* Requested by */}
          <input
            type="text"
            value={filters.requestedBy}
            onChange={e => setFilters(f => ({ ...f, requestedBy: e.target.value }))}
            placeholder="Requested by…"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:border-primary focus:outline-none w-36"
          />

          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {filters.modules.map(m => (
              <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full">
                {MODULE_MAP[m]}
                <button onClick={() => setFilters(f => ({ ...f, modules: f.modules.filter(x => x !== m) }))} className="hover:text-violet-900">×</button>
              </span>
            ))}
            {filters.owners.map(o => (
              <span key={o} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                {o}
                <button onClick={() => setFilters(f => ({ ...f, owners: f.owners.filter(x => x !== o) }))} className="hover:text-blue-900">×</button>
              </span>
            ))}
            {filters.priorities.map(p => (
              <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {PRIORITY_MAP[p].label}
                <button onClick={() => setFilters(f => ({ ...f, priorities: f.priorities.filter(x => x !== p) }))} className="hover:text-amber-900">×</button>
              </span>
            ))}
            {filters.statuses.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                {STATUS_MAP[s].label}
                <button onClick={() => setFilters(f => ({ ...f, statuses: f.statuses.filter(x => x !== s) }))} className="hover:text-gray-900">×</button>
              </span>
            ))}
            {filters.sources.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                {SOURCE_MAP[s].icon} {SOURCE_MAP[s].label}
                <button onClick={() => setFilters(f => ({ ...f, sources: f.sources.filter(x => x !== s) }))} className="hover:text-purple-900">×</button>
              </span>
            ))}
            {filters.hasTicket !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                Ticket: {filters.hasTicket}
                <button onClick={() => setFilters(f => ({ ...f, hasTicket: 'all' }))} className="hover:text-teal-900">×</button>
              </span>
            )}
            {filters.customer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
                Customer: {filters.customer}
                <button onClick={() => setFilters(f => ({ ...f, customer: '' }))} className="hover:text-slate-900">×</button>
              </span>
            )}
            {filters.requestedBy && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                By: {filters.requestedBy}
                <button onClick={() => setFilters(f => ({ ...f, requestedBy: '' }))} className="hover:text-pink-900">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <BacklogTable items={filtered} loading={loading} onItemUpdate={handleItemUpdate} />
      </div>
    </div>
  )
}
