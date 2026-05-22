'use client'

import { useState } from 'react'
import TodayFocus from '@/components/TodayFocus'
import { useBacklog } from '@/hooks/useBacklog'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function HomePage() {
  const { items, loading, setItems } = useBacklog()
  const [ticketMsg, setTicketMsg] = useState<string | null>(null)

  async function handleCreateTicket(itemId: string) {
    try {
      const res = await fetch('/api/create-linear-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      })
      const json = await res.json()
      if (json.linear_id) {
        setItems(prev =>
          prev.map(i => i.id === itemId ? { ...i, has_linear: true, linear_id: json.linear_id } : i)
        )
        setTicketMsg(`Ticket created: ${json.linear_id}`)
        setTimeout(() => setTicketMsg(null), 3000)
      }
    } catch {
      setTicketMsg('Failed to create ticket')
      setTimeout(() => setTicketMsg(null), 3000)
    }
  }

  return (
    <>
      {!isSupabaseConfigured && (
        <div className="max-w-5xl mx-auto px-6 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <strong>Demo mode</strong> — Supabase not configured. Showing sample data.{' '}
            <a href="/.env.local.example" className="underline">See .env.local.example</a> to connect your database.
          </div>
        </div>
      )}
      {ticketMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          {ticketMsg}
        </div>
      )}
      <TodayFocus items={items} loading={loading} onCreateTicket={handleCreateTicket} />
    </>
  )
}
