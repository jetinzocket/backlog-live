import { NextRequest, NextResponse } from 'next/server'
import { fetchItem, updateItem } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { item_id } = await req.json()
  if (!item_id) return NextResponse.json({ error: 'item_id required' }, { status: 400 })

  const item = await fetchItem(item_id)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  // Stub: generate sub-tickets from PRD
  const tickets = [
    { id: `BRA-${Math.floor(Math.random() * 900) + 100}`, title: `[FE] ${item.title.slice(0, 50)}` },
    { id: `BRA-${Math.floor(Math.random() * 900) + 100}`, title: `[BE] ${item.title.slice(0, 50)}` },
    { id: `BRA-${Math.floor(Math.random() * 900) + 100}`, title: `[QA] ${item.title.slice(0, 50)}` },
  ]

  const updatedWorkflow = {
    ...(item.workflow ?? {}),
    tickets,
  }
  await updateItem(item_id, { has_linear: true, workflow: updatedWorkflow })

  return NextResponse.json({ tickets })
}
