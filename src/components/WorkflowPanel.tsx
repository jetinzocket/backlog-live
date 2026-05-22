'use client'

import { useState } from 'react'
import type { BacklogItem } from '@/lib/types'

interface Props {
  item: BacklogItem
  onUpdate: (patch: Partial<BacklogItem>) => void
  // onUpdate receives a patch; caller merges it
}

type StepStatus = 'not_started' | 'in_progress' | 'done'

function stepIcon(s: StepStatus) {
  if (s === 'done') return '✅'
  if (s === 'in_progress') return '🔄'
  return '⏳'
}

export default function WorkflowPanel({ item, onUpdate }: Props) {
  const [loadingPRD, setLoadingPRD] = useState(false)
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [figmaInput, setFigmaInput] = useState(item.workflow?.figma?.url ?? '')
  const [savingFigma, setSavingFigma] = useState(false)

  const prdStatus: StepStatus = item.workflow?.prd ? 'done' : 'not_started'
  const figmaStatus: StepStatus = item.workflow?.figma?.url ? 'done' : 'not_started'
  const ticketsStatus: StepStatus =
    item.workflow?.tickets && item.workflow.tickets.length > 0 ? 'done' : 'not_started'

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
        const newWorkflow = {
          ...item.workflow,
          prd: {
            wiki_path: json.wiki_path,
            drive_url: json.drive_url,
            created_at: new Date().toISOString(),
          },
        }
        onUpdate({ workflow: newWorkflow })
      }
    } finally {
      setLoadingPRD(false)
    }
  }

  async function saveFigmaUrl() {
    setSavingFigma(true)
    try {
      const newWorkflow = { ...item.workflow, figma: { url: figmaInput } }
      await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: newWorkflow }),
      })
      onUpdate({ workflow: newWorkflow })
    } finally {
      setSavingFigma(false)
    }
  }

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
        const newWorkflow = { ...item.workflow, tickets: json.tickets }
        onUpdate({ workflow: newWorkflow })
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

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800">Workflow</h2>

      {/* Step 1: PRD */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">{stepIcon(prdStatus)}</span>
          <h3 className="font-semibold text-sm text-gray-800">Step 1 — PRD & User Journey</h3>
        </div>
        {prdStatus === 'done' ? (
          <div className="space-y-1.5">
            <p className="text-xs text-green-700 font-medium">
              ✅ Created {item.workflow.prd?.created_at ? new Date(item.workflow.prd.created_at).toLocaleDateString() : ''}
            </p>
            {item.workflow.prd?.wiki_path && (
              <p className="text-xs text-gray-600">
                📄 Wiki: <span className="font-mono text-gray-700">{item.workflow.prd.wiki_path}</span>
              </p>
            )}
            {item.workflow.prd?.drive_url && item.workflow.prd.drive_url !== '#stub' && item.workflow.prd.drive_url !== '#' && (
              <a
                href={item.workflow.prd.drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                🔗 Open in Google Drive →
              </a>
            )}
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

      {/* Step 2: Figma */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">{stepIcon(figmaStatus)}</span>
          <h3 className="font-semibold text-sm text-gray-800">Step 2 — Figma Prototype</h3>
        </div>
        {figmaStatus === 'done' ? (
          <div className="space-y-2">
            <a
              href={item.workflow.figma?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline break-all"
            >
              🎨 {item.workflow.figma?.url}
            </a>
            <div className="flex gap-2">
              <input
                type="url"
                value={figmaInput}
                onChange={e => setFigmaInput(e.target.value)}
                placeholder="Update Figma URL"
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-primary"
              />
              <button
                onClick={saveFigmaUrl}
                disabled={savingFigma || !figmaInput}
                className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {savingFigma ? '…' : 'Update'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <a
              href="https://figma.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 text-sm font-medium text-center bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Open in Figma →
            </a>
            <div className="flex gap-2">
              <input
                type="url"
                value={figmaInput}
                onChange={e => setFigmaInput(e.target.value)}
                placeholder="Paste Figma URL here"
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-primary"
              />
              <button
                onClick={saveFigmaUrl}
                disabled={savingFigma || !figmaInput}
                className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {savingFigma ? '…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Linear Tickets */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg leading-none">{stepIcon(ticketsStatus)}</span>
          <h3 className="font-semibold text-sm text-gray-800">Step 3 — Linear Tickets</h3>
        </div>
        {item.workflow?.tickets && item.workflow.tickets.length > 0 && (
          <div className="mb-3 space-y-1">
            {item.workflow.tickets.map(t => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500">{t.id}</span>
                <span className="text-xs text-gray-700">{t.title}</span>
              </div>
            ))}
          </div>
        )}
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
            Create single ticket
          </button>
        </div>
        {item.linear_id && (
          <p className="mt-2 text-xs text-gray-500">
            Linear ID:{' '}
            <a
              href={`https://linear.app/issue/${item.linear_id}`}
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
