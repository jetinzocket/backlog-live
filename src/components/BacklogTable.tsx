'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { BacklogItem, Module, ColumnKey } from '@/lib/types'
import { DEFAULT_VISIBLE_COLUMNS, ALL_COLUMN_KEYS, ALWAYS_VISIBLE, COLUMN_LABELS } from '@/lib/types'
import { MODULE_SHORT, MODULE_COLORS, OWNER_COLORS, SOURCE_MAP } from '@/lib/constants'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import CustomerPill from './CustomerPill'
import CategorySwitcher from './CategorySwitcher'

interface Props {
  items: BacklogItem[]
  loading: boolean
  onItemUpdate?: (id: string, patch: Partial<BacklogItem>) => void
}

type SortKey = 'title' | 'priority' | 'status' | 'requested_at' | 'due_date'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER = { high: 0, med: 1, low: 2 }
const STATUS_ORDER = { blocked: 0, ip: 1, qa: 2, todo: 3, new: 4, live: 5 }

const LS_KEY = 'backlog_visible_columns'

function loadVisibleColumns(): ColumnKey[] {
  if (typeof window === 'undefined') return DEFAULT_VISIBLE_COLUMNS
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEFAULT_VISIBLE_COLUMNS
    const parsed = JSON.parse(raw) as ColumnKey[]
    // Ensure always-visible columns are included
    const merged = Array.from(new Set([...ALWAYS_VISIBLE, ...parsed]))
    return merged
  } catch {
    return DEFAULT_VISIBLE_COLUMNS
  }
}

function saveVisibleColumns(cols: ColumnKey[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(cols)) } catch {}
}

// ─── Column picker dropdown ────────────────────────────────────────────────
function ColumnPicker({
  visible,
  onChange,
}: {
  visible: ColumnKey[]
  onChange: (cols: ColumnKey[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      const t = e.target as Node
      if (!btnRef.current?.contains(t) && !dropRef.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function toggle() {
    if (open) { setOpen(false); return }
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
    setOpen(true)
  }

  function toggleCol(key: ColumnKey) {
    if (ALWAYS_VISIBLE.includes(key)) return
    const next = visible.includes(key)
      ? visible.filter(k => k !== key)
      : [...visible, key]
    // Preserve canonical order
    const ordered = ALL_COLUMN_KEYS.filter(k => next.includes(k))
    onChange(ordered)
  }

  const optionalCols = ALL_COLUMN_KEYS.filter(k => !ALWAYS_VISIBLE.includes(k))

  const dropdown = open && pos ? (
    <div
      ref={dropRef}
      style={{ top: pos.top, right: pos.right, position: 'fixed' }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] w-52 py-2"
    >
      <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Show columns</p>
      {optionalCols.map(key => (
        <label
          key={key}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 ${
            ALWAYS_VISIBLE.includes(key) ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={visible.includes(key)}
            disabled={ALWAYS_VISIBLE.includes(key)}
            onChange={() => toggleCol(key)}
            className="accent-primary"
          />
          {COLUMN_LABELS[key]}
        </label>
      ))}
      <div className="border-t border-gray-100 mt-1 pt-1 px-3">
        <button
          onClick={() => { onChange(DEFAULT_VISIBLE_COLUMNS); setOpen(false) }}
          className="text-xs text-gray-400 hover:text-primary"
        >
          Reset to default
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 bg-white transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        Columns
      </button>
      {typeof document !== 'undefined' && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </>
  )
}

// ─── Main table ────────────────────────────────────────────────────────────
export default function BacklogTable({ items, loading, onItemUpdate }: Props) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS)

  // Hydrate from localStorage after mount
  useEffect(() => {
    setVisibleCols(loadVisibleColumns())
  }, [])

  function handleColChange(cols: ColumnKey[]) {
    setVisibleCols(cols)
    saveVisibleColumns(cols)
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    const arr = [...items]
    arr.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortKey === 'priority') cmp = (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      else if (sortKey === 'status') cmp = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
      else if (sortKey === 'requested_at') {
        const da = a.requested_at ?? ''
        const db = b.requested_at ?? ''
        cmp = da.localeCompare(db)
      }
      else if (sortKey === 'due_date') {
        const da = a.suggested_due ?? ''
        const db = b.suggested_due ?? ''
        cmp = da.localeCompare(db)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [items, sortKey, sortDir])

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-primary ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const show = (key: ColumnKey) => visibleCols.includes(key)

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-3xl mb-2">🔍</p>
        <p className="font-medium">No items match your filters</p>
        <p className="text-sm mt-1">Try removing some filters</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        <ColumnPicker visible={visibleCols} onChange={handleColChange} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
              {show('title') && (
                <th
                  className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
                  onClick={() => handleSort('title')}
                >
                  Title <SortIcon k="title" />
                </th>
              )}
              {show('module') && <th className="text-left py-2 px-3 font-medium">Module</th>}
              {show('owner') && <th className="text-left py-2 px-3 font-medium">Owner</th>}
              {show('priority') && (
                <th
                  className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
                  onClick={() => handleSort('priority')}
                >
                  Priority <SortIcon k="priority" />
                </th>
              )}
              {show('status') && (
                <th
                  className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon k="status" />
                </th>
              )}
              {show('customers') && <th className="text-left py-2 px-3 font-medium">Customers</th>}
              {show('linear') && <th className="text-left py-2 px-3 font-medium">Linear</th>}
              {show('source') && <th className="text-left py-2 px-3 font-medium">Source</th>}
              {show('requested_by') && <th className="text-left py-2 px-3 font-medium">Requested by</th>}
              {show('requested_at') && (
                <th
                  className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
                  onClick={() => handleSort('requested_at')}
                >
                  Requested on <SortIcon k="requested_at" />
                </th>
              )}
              {show('due_date') && (
                <th
                  className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
                  onClick={() => handleSort('due_date')}
                >
                  Due date <SortIcon k="due_date" />
                </th>
              )}
              {show('quarter') && <th className="text-left py-2 px-3 font-medium">Quarter</th>}
              {show('actions') && <th className="text-left py-2 px-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map(item => (
              <tr
                key={item.id}
                className="hover:bg-white/80 cursor-pointer group transition-colors"
                onClick={() => router.push(`/item/${item.id}`)}
              >
                {show('title') && (
                  <td className="py-3 px-3 max-w-xs">
                    <span className="font-medium text-gray-900 group-hover:text-primary line-clamp-2 leading-snug">
                      {item.title}
                    </span>
                  </td>
                )}
                {show('module') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[item.module]}`}>
                      {MODULE_SHORT[item.module]}
                    </span>
                  </td>
                )}
                {show('owner') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${OWNER_COLORS[item.owner]}`}>
                      {item.owner}
                    </span>
                  </td>
                )}
                {show('priority') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PriorityBadge priority={item.priority} />
                  </td>
                )}
                {show('status') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                )}
                {show('customers') && (
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {item.customers.slice(0, 3).map(c => <CustomerPill key={c} name={c} />)}
                      {item.customers.length > 3 && (
                        <span className="text-xs text-gray-400">+{item.customers.length - 3}</span>
                      )}
                    </div>
                  </td>
                )}
                {show('linear') && (
                  <td className="py-3 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    {item.linear_id ? (
                      <a
                        href={`https://linear.app/zocket-tech/issue/${item.linear_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary font-mono hover:underline"
                      >
                        {item.linear_id}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                )}
                {show('source') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    {item.source ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_MAP[item.source]?.className ?? 'bg-gray-100 text-gray-600'}`}>
                        <span>{SOURCE_MAP[item.source]?.icon}</span>
                        {SOURCE_MAP[item.source]?.label}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                )}
                {show('requested_by') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs text-gray-700">{item.requested_by ?? '—'}</span>
                  </td>
                )}
                {show('requested_at') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs text-gray-600">
                      {item.requested_at
                        ? new Date(item.requested_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>
                )}
                {show('due_date') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs text-gray-600">
                      {item.suggested_due
                        ? new Date(item.suggested_due).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>
                )}
                {show('quarter') && (
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-xs text-gray-600">{item.roadmap_quarter ?? '—'}</span>
                  </td>
                )}
                {show('actions') && (
                  <td className="py-3 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <CategorySwitcher
                        currentModule={item.module}
                        itemId={item.id}
                        onSwitch={(mod: Module) => onItemUpdate?.(item.id, { module: mod })}
                      />
                      <Link
                        href={`/item/${item.id}`}
                        className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded hover:border-primary hover:text-primary transition-colors"
                      >
                        → Detail
                      </Link>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
