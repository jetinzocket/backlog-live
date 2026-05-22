'use client'

import { useState, useRef, useEffect } from 'react'
import { MODULE_MAP, ALL_MODULES } from '@/lib/constants'
import type { Module } from '@/lib/types'

interface Props {
  currentModule: Module
  itemId?: string
  onSwitch?: (newModule: Module) => void
}

export default function CategorySwitcher({ currentModule, itemId, onSwitch }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function handleSelect(mod: Module) {
    if (mod === currentModule) { setOpen(false); return }
    setSaving(true)
    try {
      if (itemId) {
        await fetch(`/api/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module: mod }),
        })
      }
      onSwitch?.(mod)
    } finally {
      setSaving(false)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        {saving ? '…' : 'Switch category'}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-40 min-w-[200px] py-1 max-h-64 overflow-y-auto">
          {ALL_MODULES.map(mod => (
            <button
              key={mod}
              onClick={() => handleSelect(mod)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${mod === currentModule ? 'font-semibold text-primary' : 'text-gray-700'}`}
            >
              {MODULE_MAP[mod]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
