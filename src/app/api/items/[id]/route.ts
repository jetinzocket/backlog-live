import { NextRequest, NextResponse } from 'next/server'
import { updateItem } from '@/lib/supabase'
import type { BacklogItem } from '@/lib/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const patch: Partial<BacklogItem> = await req.json()
  // Always mark manual overrides when category/status is changed by user
  if (patch.module || patch.status) {
    patch.manually_overridden = true
  }
  const updated = await updateItem(params.id, patch)
  if (!updated) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ item: updated })
}
