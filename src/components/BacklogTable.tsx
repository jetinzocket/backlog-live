'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { BacklogItem, Module } from '@/lib/types'
import { MODULE_SHORT, MODULE_COLORS, OWNER_COLORS } from '@/lib/constants'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import CustomerPill from './CustomerPill'
import CategorySwitcher from './CategorySwitcher'

interface Props {
  items: BacklogItem[]
  loading: boolean
  onItemUpdate?: (id: string, patch: Partial<BacklogItem>) => void
}

type SortKey = 'title' | 'priority' | 'status'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER = { high: 0, med: 1, low: 2 }
const STATUS_ORDER = { blocked: 0, ip: 1, qa: 2, todo: 3, new: 4, live: 5 }

export default function BacklogTable({ items, loading, onItemUpdate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

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
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [items, sortKey, sortDir])

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-primary ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) {
    return (
      <div className="space-y-2">
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th
              className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
              onClick={() => handleSort('title')}
            >
              Title <SortIcon k="title" />
            </th>
            <th className="text-left py-2 px-3 font-medium">Module</th>
            <th className="text-left py-2 px-3 font-medium">Owner</th>
            <th
              className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
              onClick={() => handleSort('priority')}
            >
              Priority <SortIcon k="priority" />
            </th>
            <th
              className="text-left py-2 px-3 font-medium cursor-pointer hover:text-gray-800 select-none"
              onClick={() => handleSort('status')}
            >
              Status <SortIcon k="status" />
            </th>
            <th className="text-left py-2 px-3 font-medium">Customers</th>
            <th className="text-left py-2 px-3 font-medium">Linear</th>
            <th className="text-left py-2 px-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map(item => (
            <tr
              key={item.id}
              className="hover:bg-white/80 cursor-pointer group transition-colors"
              onClick={() => window.location.href = `/item/${item.id}`}
            >
              <td className="py-3 px-3 max-w-xs">
                <span className="font-medium text-gray-900 group-hover:text-primary line-clamp-2 leading-snug">
                  {item.title}
                </span>
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[item.module]}`}>
                  {MODULE_SHORT[item.module]}
                </span>
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${OWNER_COLORS[item.owner]}`}>
                  {item.owner}
                </span>
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <PriorityBadge priority={item.priority} />
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <StatusBadge status={item.status} />
              </td>
              <td className="py-3 px-3">
                <div className="flex flex-wrap gap-1">
                  {item.customers.slice(0, 3).map(c => <CustomerPill key={c} name={c} />)}
                  {item.customers.length > 3 && (
                    <span className="text-xs text-gray-400">+{item.customers.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                {item.linear_id ? (
                  <a
                    href={`https://linear.app/issue/${item.linear_id}`}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
