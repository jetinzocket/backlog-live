import { createClient } from '@supabase/supabase-js'
import type { BacklogItem } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured =
  !!supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' &&
  !!supabaseAnonKey && supabaseAnonKey !== 'your-anon-key'

// Only create the client if configured — avoids runtime errors during build
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// ──────────────────────────────────────────────
// Query helpers
// ──────────────────────────────────────────────

export async function fetchAllItems(): Promise<BacklogItem[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('backlog_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchAllItems:', error); return [] }
  return (data ?? []) as BacklogItem[]
}

export async function fetchItem(id: string): Promise<BacklogItem | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('backlog_items')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error('fetchItem:', error); return null }
  return data as BacklogItem
}

export async function updateItem(id: string, patch: Partial<BacklogItem>): Promise<BacklogItem | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('backlog_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateItem:', error); return null }
  return data as BacklogItem
}
