import { NextResponse } from 'next/server'
import { fetchAllItems } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await fetchAllItems()
  return NextResponse.json({ items })
}
