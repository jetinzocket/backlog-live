'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      const target = e.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on scroll (so dropdown doesn't drift)
  useEffect(() => {
    if (!open) return
    function onScroll() { setOpen(false) }
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [open])

  function toggleOpen() {
    if (open) { setOpen(false); return }
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    })
    setOpen(true)
  }

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

  const dropdown = open && dropdownPos ? (
    <div
      ref={dropdownRef}
      style={{ top: dropdownPos.top, right: dropdownPos.right, position: 'fixed' }}
      className="bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] min-w-[200px] py-1 max-h-64 overflow-y-auto"
    >
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
  ) : null

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        disabled={saving}
        className="px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        {saving ? '…' : 'Switch category'}
      </button>
      {typeof document !== 'undefined' && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </>
  )
}
