'use client'

import { useState, useMemo } from 'react'
import { useBacklog } from '@/hooks/useBacklog'
import { MODULE_MAP, MODULE_COLORS, ALL_MODULES, ROADMAP_QUARTERS, OWNER_COLORS, STATUS_MAP } from '@/lib/constants'
import type { BacklogItem, Module } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import Link from 'next/link'

const QUARTERS = [...ROADMAP_QUARTERS, 'Backlog']

function downloadCSV(items: BacklogItem[], module: string) {
  const rows = [
    ['Title', 'Module', 'Owner', 'Priority', 'Status', 'Quarter', 'Customers', 'Linear'].join(','),
    ...items.map(i => [
      `"${i.title.replace(/"/g, '""')}"`,
      module,
      i.owner,
      i.priority,
      i.status,
      i.roadmap_quarter ?? 'Backlog',
      `"${(i.customers ?? []).join('; ')}"`,
      i.linear_id ?? '',
    ].join(',')),
  ]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `roadmap-${module}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function RoadmapPage() {
  const { items, loading, setItems } = useBacklog()
  const [activeModule, setActiveModule] = useState<Module | 'all'>('all')
  const [noteEditing, setNoteEditing] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)

  const filtered = useMemo(() =>
    activeModule === 'all' ? items : items.filter(i => i.module === activeModule),
    [items, activeModule]
  )

  const byQuarter = useMemo(() =>
    QUARTERS.reduce((acc, q) => {
      acc[q] = filtered.filter(i => (i.roadmap_quarter ?? 'Backlog') === q)
      return acc
    }, {} as Record<string, BacklogItem[]>),
    [filtered]
  )

  async function handleDrop(quarter: string, itemId: string) {
    const newQ = quarter === 'Backlog' ? null : quarter
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, roadmap_quarter: newQ, manually_overridden: true } : i))
    await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roadmap_quarter: newQ }),
    })
    setDragging(null)
  }

  async function saveNote(itemId: string) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, roadmap_notes: noteValue } : i))
    await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roadmap_notes: noteValue }),
    })
    setNoteEditing(null)
  }

  const exportItems = activeModule === 'all' ? filtered : filtered
  const exportModuleName = activeModule === 'all' ? 'all' : MODULE_MAP[activeModule]

  return (
    <div className="max-w-full px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Roadmap</h1>
        <button
          onClick={() => downloadCSV(exportItems, exportModuleName)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Module tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveModule('all')}
          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
            activeModule === 'all' ? 'bg-nav text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Modules
        </button>
        {ALL_MODULES.map(m => (
          <button
            key={m}
            onClick={() => setActiveModule(m)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              activeModule === m
                ? 'bg-nav text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {MODULE_MAP[m]}
            <span className="ml-1.5 text-xs opacity-60">{items.filter(i => i.module === m).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {QUARTERS.map(q => (
            <div key={q} className="space-y-2">
              <div className="h-8 bg-white rounded-lg animate-pulse" />
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-lg animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 items-start">
          {QUARTERS.map(q => (
            <div
              key={q}
              className={`rounded-xl border-2 min-h-[200px] transition-colors ${
                dragging ? 'border-dashed border-primary/40 bg-blue-50/30' : 'border-transparent bg-gray-100/60'
              }`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragging && handleDrop(q, dragging)}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl font-semibold text-sm ${
                q === 'Backlog' ? 'bg-gray-200 text-gray-600' :
                q === 'Q2 2026' ? 'bg-blue-100 text-blue-800' :
                q === 'Q3 2026' ? 'bg-violet-100 text-violet-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                <span>{q}</span>
                <span className="text-xs font-normal opacity-70">{byQuarter[q]?.length ?? 0} items</span>
              </div>

              <div className="p-2 space-y-2">
                {(byQuarter[q] ?? []).map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragging(item.id)}
                    onDragEnd={() => setDragging(null)}
                    className={`bg-white rounded-lg border border-gray-100 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-300 transition-all ${
                      dragging === item.id ? 'opacity-40 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <Link
                        href={`/item/${item.id}`}
                        className="text-xs font-medium text-gray-800 hover:text-primary line-clamp-2 leading-tight"
                      >
                        {item.title}
                      </Link>
                      {item.manually_overridden && (
                        <span className="flex-shrink-0 text-[9px] px-1 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">manual</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${MODULE_COLORS[item.module]}`}>
                        {MODULE_MAP[item.module].split(' ')[0]}
                      </span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${OWNER_COLORS[item.owner]}`}>
                        {item.owner}
                      </span>
                      <StatusBadge status={item.status} size="xs" />
                      <PriorityBadge priority={item.priority} size="xs" />
                    </div>

                    {item.linear_id && (
                      <a
                        href={`https://linear.app/zocket-tech/issue/${item.linear_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-primary hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        {item.linear_id}
                      </a>
                    )}

                    {/* Roadmap note */}
                    {noteEditing === item.id ? (
                      <div className="mt-2">
                        <textarea
                          value={noteValue}
                          onChange={e => setNoteValue(e.target.value)}
                          className="w-full text-xs p-1.5 border border-gray-200 rounded resize-none focus:outline-none focus:border-primary"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-1 mt-1">
                          <button onClick={() => saveNote(item.id)} className="text-[10px] px-2 py-0.5 bg-primary text-white rounded hover:bg-blue-700">Save</button>
                          <button onClick={() => setNoteEditing(null)} className="text-[10px] px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setNoteEditing(item.id); setNoteValue(item.roadmap_notes ?? '') }}
                        className="mt-2 text-[10px] text-gray-400 hover:text-gray-600 block w-full text-left"
                      >
                        {item.roadmap_notes ? `📝 ${item.roadmap_notes.slice(0, 50)}${item.roadmap_notes.length > 50 ? '…' : ''}` : '+ Add note'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
