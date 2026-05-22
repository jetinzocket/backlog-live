'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BacklogItem } from '@/lib/types'
import { MODULE_MAP, MODULE_COLORS, OWNER_COLORS, STATUS_MAP, PRIORITY_MAP, ALL_MODULES } from '@/lib/constants'
import { fetchItem } from '@/lib/supabase'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import CustomerPill from '@/components/CustomerPill'
import WorkflowPanel from '@/components/WorkflowPanel'
import CategorySwitcher from '@/components/CategorySwitcher'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<BacklogItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchItem(id).then(data => {
      setItem(data)
      setLoading(false)
    })
  }, [id])

  async function handlePatch(patch: Partial<BacklogItem>) {
    if (!item) return
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      const { item: updated } = await res.json()
      setItem(updated)
    }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="h-10 w-32 bg-white rounded-lg animate-pulse mb-6" />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
        </div>
        <div className="col-span-2 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />)}
        </div>
      </div>
    </div>
  )

  if (!item) return (
    <div className="max-w-6xl mx-auto px-6 py-16 text-center">
      <p className="text-gray-500 mb-4">Item not found.</p>
      <Link href="/backlog" className="text-primary hover:underline text-sm">← Back to backlog</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link href="/" className="hover:text-gray-800">Home</Link>
        <span>/</span>
        <Link href="/backlog" className="hover:text-gray-800">Backlog</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-xs">{item.title}</span>
      </div>

      <div className="grid grid-cols-5 gap-6 items-start">
        {/* Left — item details */}
        <div className="col-span-3 space-y-4">

          {/* Title card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-lg font-bold text-gray-900 leading-snug">{item.title}</h1>
              {item.manually_overridden && (
                <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">Manually overridden</span>
              )}
            </div>
            {item.detail && <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>}
          </div>

          {/* Meta grid */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Item Details</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Module</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[item.module]}`}>
                  {MODULE_MAP[item.module]}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Owner</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${OWNER_COLORS[item.owner]}`}>
                  {item.owner}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Priority</span>
                <PriorityBadge priority={item.priority} />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Status</span>
                <StatusBadge status={item.status} />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Roadmap</span>
                <span className="text-gray-700">{item.roadmap_quarter ?? 'Backlog'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Suggested due</span>
                <span className="text-gray-700">{item.suggested_due ?? '—'}</span>
              </div>
              {item.linear_id && (
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 block mb-0.5">Linear ticket</span>
                  <a
                    href={`https://linear.app/zocket-tech/issue/${item.linear_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    {item.linear_id} ↗
                  </a>
                </div>
              )}
              {item.customers?.length > 0 && (
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 block mb-1">Customers</span>
                  <div className="flex flex-wrap gap-1">
                    {item.customers.map(c => <CustomerPill key={c} name={c} />)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category switcher */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Switch Category</h2>
            <CategorySwitcher
              currentModule={item.module}
              itemId={item.id}
              onSwitch={newModule => handlePatch({ module: newModule })}
            />
          </div>

          {/* Roadmap notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Roadmap Notes</h2>
            <RoadmapNotesEditor
              quarter={item.roadmap_quarter}
              notes={item.roadmap_notes}
              onSave={({ quarter, notes }) => handlePatch({ roadmap_quarter: quarter, roadmap_notes: notes })}
            />
          </div>
        </div>

        {/* Right — workflow panel */}
        <div className="col-span-2">
          <WorkflowPanel item={item} onUpdate={patch => setItem(prev => prev ? { ...prev, ...patch } : prev)} />
        </div>
      </div>
    </div>
  )
}

// ── Inline roadmap notes editor ──────────────────────────────────────────────
function RoadmapNotesEditor({
  quarter, notes, onSave,
}: {
  quarter: string | null
  notes: string | null
  onSave: (v: { quarter: string | null; notes: string }) => void
}) {
  const [q, setQ] = useState(quarter ?? '')
  const [n, setN] = useState(notes ?? '')
  const [dirty, setDirty] = useState(false)

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Quarter</label>
        <select
          value={q}
          onChange={e => { setQ(e.target.value); setDirty(true) }}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="">Backlog (no quarter)</option>
          <option value="Q2 2026">Q2 2026</option>
          <option value="Q3 2026">Q3 2026</option>
          <option value="Q4 2026">Q4 2026</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Notes</label>
        <textarea
          value={n}
          onChange={e => { setN(e.target.value); setDirty(true) }}
          rows={3}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-primary"
          placeholder="Context, blockers, decisions…"
        />
      </div>
      {dirty && (
        <button
          onClick={() => { onSave({ quarter: q || null, notes: n }); setDirty(false) }}
          className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      )}
    </div>
  )
}
