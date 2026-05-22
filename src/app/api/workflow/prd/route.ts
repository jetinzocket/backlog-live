import { NextRequest, NextResponse } from 'next/server'
import { fetchItem, updateItem } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { item_id } = await req.json()
  if (!item_id) return NextResponse.json({ error: 'item_id required' }, { status: 400 })

  const item = await fetchItem(item_id)
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)
  const wiki_path = `wiki/prds/${slug}.md`
  const drive_url = `https://drive.google.com/drive/search?q=${encodeURIComponent(item.title)}`
  const created_at = new Date().toISOString()

  // Persist workflow state
  const updatedWorkflow = {
    ...(item.workflow ?? {}),
    prd: { wiki_path, drive_url, created_at },
  }
  await updateItem(item_id, { workflow: updatedWorkflow })

  return NextResponse.json({ wiki_path, drive_url, created_at })
}
