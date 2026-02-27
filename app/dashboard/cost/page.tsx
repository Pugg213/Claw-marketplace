'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'

function isPro(user: any) {
  const until = user?.proUntil
  if (!until) return false
  const d = new Date(until)
  return d.getTime() > Date.now()
}

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4': { input: 30, output: 60 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'claude-3-opus': { input: 15, output: 75 },
  'claude-3-sonnet': { input: 3, output: 15 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'gemini-pro': { input: 0.5, output: 1.5 },
}

export default function CostPage() {
  const { user } = useAuth()
  const pro = isPro(user)

  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo')
  const [estimatedMessages, setEstimatedMessages] = useState(1000)
  const [avgTokensPerMessage, setAvgTokensPerMessage] = useState(500)

  const estimated = useMemo(() => {
    const pricing = MODEL_PRICING[selectedModel]
    const totalTokens = estimatedMessages * avgTokensPerMessage
    const inputCost = (totalTokens * 0.7 / 1_000_000) * pricing.input
    const outputCost = (totalTokens * 0.3 / 1_000_000) * pricing.output
    return { total: inputCost + outputCost, tokens: totalTokens }
  }, [avgTokensPerMessage, estimatedMessages, selectedModel])

  if (!pro) {
    return (
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Cost</h1>
        <p className="text-slate-400 mb-6">Калькулятор и отчёты доступны в PRO.</p>
        <Link className="text-primary" href="/dashboard/pro">Купить PRO</Link>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cost</h1>
        <Link className="text-primary" href="/dashboard">Overview</Link>
      </div>

      <div className="bg-surface border border-slate-700 rounded-xl p-6 space-y-4">
        <div>
          <div className="text-slate-400 text-sm mb-1">Model</div>
          <select className="w-full rounded-lg bg-black/20 border border-slate-700 px-3 py-2" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
            {Object.keys(MODEL_PRICING).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="text-slate-400 mb-1">Messages</div>
            <input className="w-full rounded-lg bg-black/20 border border-slate-700 px-3 py-2" type="number" value={estimatedMessages} onChange={e => setEstimatedMessages(parseInt(e.target.value || '0', 10))} />
          </label>
          <label className="text-sm">
            <div className="text-slate-400 mb-1">Avg tokens/message</div>
            <input className="w-full rounded-lg bg-black/20 border border-slate-700 px-3 py-2" type="number" value={avgTokensPerMessage} onChange={e => setAvgTokensPerMessage(parseInt(e.target.value || '0', 10))} />
          </label>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <div className="text-slate-400 text-sm">Estimated tokens</div>
          <div className="text-xl font-semibold">{estimated.tokens.toLocaleString()}</div>
          <div className="text-slate-400 text-sm mt-2">Estimated cost</div>
          <div className="text-2xl font-bold">${estimated.total.toFixed(2)}</div>
        </div>

        <button
          className="py-2 rounded-lg border border-slate-700"
          onClick={() => {
            const report = { model: selectedModel, estimatedMessages, avgTokensPerMessage, estimated }
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'cost-report.json'
            a.click()
          }}
        >
          Export report
        </button>
      </div>
    </div>
  )
}
