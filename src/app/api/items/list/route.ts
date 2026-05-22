import { NextResponse } from 'next/server'
import { fetchAllItems } from '@/lib/supabase'

export async function GET() {
  const items = await fetchAllItems()
  return NextResponse.json({ items })
}
