'use client'

import { useState } from 'react'
import type { BacklogItem } from '@/lib/types'
import { DRIVE_FOLDER_PRDS, DRIVE_FOLDER_FIGR } from '@/lib/constants'

interface Props {
  item: BacklogItem
  onUpdate: (patch: Partial<BacklogItem>) => void
}

type StepStatus = 'not_started' | 'done'

function stepIcon(s: StepStatus) {
  return s === 'done' ? '✅' : '⏳'
}

function downloadMd(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function WorkflowPanel({ item, onUpdate }: Props) {
  const [loadingPRD, setLoadingPRD]       = useState(false)
  const [loadingFigr, setLoadingFigr]     = useState(false)
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [figrUrl, setFigrUrl]             = useState(item.workflow?.figr?.url ?? '')
  const [savingFigrUrl, setSavingFigrUrl] = useState(false)
  const [showPRDPreview, setShowPRDPreview]   = useState(false)
  const [showFigrPreview, setShowFigrPreview] = useState(false)

  const prdStatus: StepStatus     = item.workflow?.prd ? 'done' : 'not_started'
  const figrStatus: StepStatus    = (item.workflow?.figr?.spec_content || item.workflow?.figr?.url) ? 'done' : 'not_started'
  const ticketsStatus: StepStatus = item.workflow?.tickets?.length ? 'done' : 'not_started'

  // ── Step 1: PRD ─────────────────────────────────────────────────────────────
  async function generatePRD() {
    setLoadingPRD(true)
    try {
      const res = await fetch('/api/workflow/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id }),
      })
      const json = await res.json()
      if (json.wiki_path) {
        onUpdate({
          workflow: {
            ...item.workflow,
            prd: {
              wiki_path: json.wiki_path,
              drive_url: json.drive_url,
              created_at: json.created_at,
              content: json.content,
            },
          },
        })
      }
    } finally {
      setLoadingPRD(false)
    }
  }

  // ── Step 2: Figr ─────────────────────────────────────────────────────────────
  async function generateFigrSpec() {
    setLoadingFigr(true)
    try {
      const res = await fetch('/api/workflow/figr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id }),
      })
      const json = await res.json()
      if (json.content) {
        onUpdate({
          workflow: {
            ...item.workflow,
            figr: {
              ...item.workflow?.figr,
              spec_content: json.content,
              drive_url: json.drive_url,
              created_at: json.created_at,
            },
          },
        })
      }
    } finally {
      setLoadingFigr(false)
    }
  }

  async function saveFigrUrl() {
    setSavingFigrUrl(true)
    try {
      await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: { ...item.workflow, figr: { ...item.workflow?.figr, url: figrUrl } },
        }),
      })
      onUpdate({ workflow: { ...item.workflow, figr: { ...item.workflow?.figr, url: figrUrl } } })
    } finally {
      setSavingFigrUrl(false)
    }
  }

  // ── Step 3: Tickets ──────────────────────────────────────────────────────────
  async function createTickets() {
    setLoadingTickets(true)
    try {
      const res = await fetch('/api/workflow/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id }),
      })
      const json = await res.json()
      if (json.tickets) {
        onUpdate({ workflow: { ...item.workflow, tickets: json.tickets } })
      }
    } finally {
      setLoadingTickets(false)
    }
  }

  async function createSingleTicket() {
    const res = await fetch('/api/create-linear-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id }),
    })
    const json = await res.json()
    if (json.linear_id) {
      onUpdate({ has_linear: true, linear_id: json.linear_id })
    }
  }

  const prdFilename  = `prd-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.md`
  const figrFilename = `figr-spec-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.md`

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800">Workflow</h2>

      {/* ── Step 1: PRD ──────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">{stepIcon(prdStatus)}</span>
          <h3 className="font-semibold text-sm text-gray-800">Step 1 — PRD & User Journey</h3>
        </div>

        {prdStatus === 'done' ? (
          <div className="space-y-2">
            <p className="text-xs text-green-700 font-medium">
              Generated {item.workflow.prd?.created_at
                ? new Date(item.workflow.prd.created_at).toLocaleDateString()
                : ''}
            </p>

            {/* Action row */}
            <div className="flex flex-wrap gap-2">
              {item.workflow.prd?.content && (
                <button
                  onClick={() => downloadMd(item.workflow.prd!.content!, prdFilename)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
                >
                  ↓ Download .md
                </button>
              )}
              <a
                href={DRIVE_FOLDER_PRDS}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                📂 Open PRDs folder
              </a>
              <button
                onClick={() => setShowPRDPreview(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {showPRDPreview ? 'Hide preview' : 'Preview'}
              </button>
            </div>

            <p className="text-[10px] text-gray-400">
              Download the .md file and drag it into the shared Drive folder — Prem, Gayathri &amp; Raghav all have access.
            </p>

            {showPRDPreview && item.workflow.prd?.content && (
              <pre className="mt-2 text-[10px] text-gray-600 bg-white border border-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                {item.workflow.prd.content.slice(0, 1200)}{item.workflow.prd.content.length > 1200 ? '\n…' : ''}
              </pre>
            )}

            {/* Regenerate */}
            <button
              onClick={generatePRD}
              disabled={loadingPRD}
              className="mt-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {loadingPRD ? 'Regenerating…' : '↺ Regenerate'}
            </button>
          </div>
        ) : (
          <button
            onClick={generatePRD}
            disabled={loadingPRD}
            className="w-full py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loadingPRD ? 'Generating…' : 'Generate PRD'}
          </button>
        )}
      </div>

      {/* ── Step 2: Figr ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">{stepIcon(figrStatus)}</span>
          <h3 className="font-semibold text-sm text-gray-800">Step 2 — Figr Prototype</h3>
        </div>

        {figrStatus === 'done' ? (
          <div className="space-y-2">
            {item.workflow.figr?.url ? (
              <a
                href={item.workflow.figr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all block"
              >
                🎨 {item.workflow.figr.url}
              </a>
            ) : (
              <p className="text-xs text-amber-700 font-medium">
                Spec generated — paste Figr link once prototype is ready
              </p>
            )}

            {/* Action row */}
            <div className="flex flex-wrap gap-2">
              {item.workflow.figr?.spec_content && (
                <button
                  onClick={() => downloadMd(item.workflow.figr!.spec_content!, figrFilename)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
                >
                  ↓ Download spec .md
                </button>
              )}
              <a
                href={DRIVE_FOLDER_FIGR}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                📂 Open Figr Specs folder
              </a>
              {item.workflow.figr?.spec_content && (
                <button
                  onClick={() => setShowFigrPreview(v => !v)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {showFigrPreview ? 'Hide' : 'Preview'}
                </button>
              )}
            </div>

            {showFigrPreview && item.workflow.figr?.spec_content && (
              <pre className="mt-1 text-[10px] text-gray-600 bg-white border border-gray-100 rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                {item.workflow.figr.spec_content.slice(0, 1200)}{item.workflow.figr.spec_content.length > 1200 ? '\n…' : ''}
              </pre>
            )}

            {/* Paste Figr URL */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={figrUrl}
                onChange={e => setFigrUrl(e.target.value)}
                placeholder="Paste Figr prototype URL"
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-primary"
              />
              <button
                onClick={saveFigrUrl}
                disabled={savingFigrUrl || !figrUrl}
                className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {savingFigrUrl ? '…' : 'Save'}
              </button>
            </div>

            <button
              onClick={generateFigrSpec}
              disabled={loadingFigr}
              className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {loadingFigr ? 'Regenerating…' : '↺ Regenerate spec'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={generateFigrSpec}
              disabled={loadingFigr}
              className="w-full py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loadingFigr ? 'Generating spec…' : 'Generate Figr Spec'}
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Generates a prototype brief .md to upload to Figr
            </p>
          </div>
        )}
      </div>

      {/* ── Step 3: Linear Tickets ───────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">{stepIcon(ticketsStatus)}</span>
          <h3 className="font-semibold text-sm text-gray-800">Step 3 — Linear Tickets</h3>
        </div>

        {item.workflow?.tickets?.length ? (
          <div className="mb-3 space-y-1">
            {item.workflow.tickets.map(t => (
              <div key={t.id} className="flex items-center gap-2">
                <a
                  href={`https://linear.app/zocket-tech/issue/${t.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline"
                >
                  {t.id}
                </a>
                <span className="text-xs text-gray-700">{t.title}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={createTickets}
            disabled={loadingTickets}
            className="flex-1 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loadingTickets ? 'Creating…' : 'Create from PRD'}
          </button>
          <button
            onClick={createSingleTicket}
            className="flex-1 py-2 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Single ticket
          </button>
        </div>

        {item.linear_id && (
          <p className="mt-2 text-xs text-gray-500">
            Linear:{' '}
            <a
              href={`https://linear.app/zocket-tech/issue/${item.linear_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline"
            >
              {item.linear_id}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
