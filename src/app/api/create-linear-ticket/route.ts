import { NextRequest, NextResponse } from 'next/server'
import { fetchItem, updateItem } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { item_id } = await req.json()
  if (!item_id) return NextResponse.json({ error: 'item_id required' }, { status: 400 })

  const item = await fetchItem(item_id)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  // Stub: in production this calls the Linear MCP / API
  // Returns a fake linear_id for now
  const fakeId = `BRA-${Math.floor(Math.random() * 900) + 100}`

  await updateItem(item_id, {
    has_linear: true,
    linear_id: fakeId,
    manually_overridden: true,
  })

  return NextResponse.json({ linear_id: fakeId, title: item.title })
}
