'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { BacklogItem } from '@/lib/types'
import { MODULE_MAP, MODULE_COLORS, MODULE_SHORT, OWNER_COLORS, ROADMAP_QUARTERS } from '@/lib/constants'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

const ALL_MODULES_TAB = ['all', 'bi', 'orm', 'creative', 'perf', 'legacy', 'team', 'integrations', 'settings', 'others'] as const

const COLUMNS = [...ROADMAP_QUARTERS, 'Backlog']

interface Props {
  items: BacklogItem[]
  onQuarterChange: (id: string, quarter: string | null) => void
  onNoteSave: (id: string, note: string) => void
}

export default function RoadmapBoard({ items, onQuarterChange, onNoteSave }: Props) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<{ id: string; text: string } | null>(null)

  const filtered = activeTab === 'all' ? items : items.filter(i => i.module === activeTab)

  const byColumn = useCallback((col: string) => {
    return filtered.filter(i =>
      col === 'Backlog' ? !i.roadmap_quarter : i.roadmap_quarter === col
    )
  }, [filtered])

  function handleDragStart(id: string) {
    setDragging(id)
  }
  function handleDragOver(e: React.DragEvent, col: string) {
    e.preventDefault()
    setDragOver(col)
  }
  function handleDrop(col: string) {
    if (!dragging) return
    const quarter = col === 'Backlog' ? null : col
    onQuarterChange(dragging, quarter)
    setDragging(null)
    setDragOver(null)
  }
  function handleDragEnd() {
    setDragging(null)
    setDragOver(null)
  }

  function exportCSV() {
    const rows = [
      ['Title', 'Module', 'Owner', 'Priority', 'Status', 'Quarter', 'Notes'],
      ...filtered.map(i => [
        i.title,
        MODULE_MAP[i.module],
        i.owner,
        i.priority,
        i.status,
        i.roadmap_quarter ?? 'Backlog',
        i.roadmap_notes ?? '',
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roadmap-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 flex-wrap mb-4 border-b border-gray-200 pb-3">
        {ALL_MODULES_TAB.map(mod => (
          <button
            key={mod}
            onClick={() => setActiveTab(mod)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              activeTab === mod
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {mod === 'all' ? 'All' : MODULE_SHORT[mod as keyof typeof MODULE_SHORT]}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => (
          <div
            key={col}
            onDragOver={e => handleDragOver(e, col)}
            onDrop={() => handleDrop(col)}
            className={`rounded-xl border-2 transition-colors min-h-[200px] p-3 ${
              dragOver === col ? 'border-primary bg-blue-50' : 'border-gray-200 bg-gray-50/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{col}</h3>
              <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                {byColumn(col).length}
              </span>
            </div>
            <div className="space-y-2">
              {byColumn(col).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-sm transition-all ${
                    dragging === item.id ? 'opacity-50' : ''
                  }`}
                >
                  <Link
                    href={`/item/${item.id}`}
                    className="block font-medium text-xs text-gray-900 hover:text-primary leading-snug mb-2"
                    onClick={e => e.stopPropagation()}
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-1 flex-wrap mb-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${MODULE_COLORS[item.module]}`}>
                      {MODULE_SHORT[item.module]}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize ${OWNER_COLORS[item.owner]}`}>
                      {item.owner}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                    {item.manually_overridden && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">Manually set</span>
                    )}
                  </div>
                  {item.roadmap_notes && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{item.roadmap_notes}</p>
                  )}
                  {editingNote?.id === item.id ? (
                    <div className="mt-2" onClick={e => e.stopPropagation()}>
                      <textarea
                        className="w-full text-xs border border-gray-200 rounded p-1.5 resize-none focus:outline-none focus:border-primary"
                        rows={2}
                        value={editingNote.text}
                        onChange={e => setEditingNote({ id: item.id, text: e.target.value })}
                        autoFocus
                      />
                      <div className="flex gap-1 mt-1">
                        <button
                          className="text-xs px-2 py-0.5 bg-primary text-white rounded"
                          onClick={() => { onNoteSave(item.id, editingNote.text); setEditingNote(null) }}
                        >Save</button>
                        <button
                          className="text-xs px-2 py-0.5 text-gray-500 border border-gray-200 rounded"
                          onClick={() => setEditingNote(null)}
                        >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="mt-1.5 text-xs text-gray-400 hover:text-primary transition-colors"
                      onClick={e => { e.stopPropagation(); setEditingNote({ id: item.id, text: item.roadmap_notes ?? '' }) }}
                    >
                      + Add note
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
