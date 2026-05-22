'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { BacklogItem } from '@/lib/types'
import { MODULE_SHORT, MODULE_COLORS, OWNER_COLORS, OWNER_INITIALS, META_API_DEADLINE } from '@/lib/constants'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import CustomerPill from './CustomerPill'

interface Props {
  items: BacklogItem[]
  loading: boolean
  onCreateTicket: (itemId: string) => void
}

function daysUntil(date: Date): number {
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function dayLabel(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const OWNERS = ['jetin', 'prem', 'gayathri', 'raghav'] as const

export default function TodayFocus({ items, loading, onCreateTicket }: Props) {
  const metaDays = daysUntil(META_API_DEADLINE)

  const today7d = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 7)
    return cutoff
  }, [])

  const jetin3 = useMemo(() =>
    items
      .filter(i => i.owner === 'jetin' && i.priority === 'high' && (
        i.status === 'blocked' ||
        i.status === 'qa' ||
        (i.status === 'todo' && i.suggested_due && new Date(i.suggested_due) <= today7d)
      ))
      .slice(0, 3),
    [items, today7d]
  )

  const ownerStats = useMemo(() =>
    OWNERS.map(owner => {
      const wip = items.filter(i => i.owner === owner && (i.status === 'ip' || i.status === 'qa')).length
      const top = items.find(i => i.owner === owner && i.priority === 'high' && i.status !== 'live')
      return { owner, wip, top }
    }),
    [items]
  )

  const needsTicket = useMemo(() =>
    items
      .filter(i => !i.has_linear)
      .sort((a, b) => {
        const po = { high: 0, med: 1, low: 2 }
        return (po[a.priority] ?? 9) - (po[b.priority] ?? 9)
      })
      .slice(0, 5),
    [items]
  )

  const recent = useMemo(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return items
      .filter(i => new Date(i.updated_at) > cutoff)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 8)
  }, [items])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Jetin 👋</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{dayLabel()}</p>
        </div>
        {metaDays < 30 && (
          <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">
            🚨 {metaDays} days to Meta API deadline
          </div>
        )}
      </div>

      {/* Critical deadline banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-red-800 text-sm">⚡ Critical Deadline — Meta API v23→v25</p>
          <p className="text-red-600 text-xs mt-0.5">BRA-792 · ZOC-76 · {metaDays > 0 ? `${metaDays} days remaining` : 'OVERDUE'} · Deprecation: June 9, 2026</p>
        </div>
        <Link
          href="/backlog?status=ip&linear_id=BRA-792"
          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Move to sprint →
        </Link>
      </div>

      {/* Your focus today */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">🎯 Your focus today</h2>
        {jetin3.length === 0 ? (
          <p className="text-sm text-gray-400">No critical items for today — nice work!</p>
        ) : (
          <div className="space-y-2">
            {jetin3.map(item => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="block bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm group-hover:text-primary truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[item.module]}`}>
                        {MODULE_SHORT[item.module]}
                      </span>
                      <StatusBadge status={item.status} />
                      {item.customers.slice(0, 3).map(c => <CustomerPill key={c} name={c} />)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={item.priority} />
                    {item.linear_id && (
                      <span className="text-xs text-gray-400 font-mono">{item.linear_id}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Team */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">👥 Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ownerStats.map(({ owner, wip, top }) => (
            <div key={owner} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${OWNER_COLORS[owner]}`}>
                  {OWNER_INITIALS[owner]}
                </span>
                <span className="text-sm font-semibold capitalize text-gray-800">{owner}</span>
                {wip > 3 && <span title="WIP > 3">🔴</span>}
                {wip === 0 && <span title="Nothing in progress">⚪</span>}
              </div>
              <p className="text-xs text-gray-500 mb-1">{wip} in progress</p>
              {top && (
                <p className="text-xs text-gray-700 line-clamp-2 leading-tight">{top.title}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Needs Linear tickets */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">➕ Needs Linear tickets</h2>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {needsTicket.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-3">All items have Linear tickets 🎉</p>
          ) : needsTicket.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <Link href={`/item/${item.id}`} className="text-sm text-gray-800 hover:text-primary font-medium truncate block">{item.title}</Link>
                <div className="flex gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_COLORS[item.module]}`}>
                    {MODULE_SHORT[item.module]}
                  </span>
                  <PriorityBadge priority={item.priority} />
                </div>
              </div>
              <button
                onClick={() => onCreateTicket(item.id)}
                className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shrink-0"
              >
                Create ticket
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent movement */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">📈 Recent movement</h2>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-3">No updates in the last 24 hours.</p>
          ) : recent.map(item => (
            <Link key={item.id} href={`/item/${item.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 group-hover:text-primary font-medium truncate">{item.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={item.status} />
                <span className="text-xs text-gray-400">
                  {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
