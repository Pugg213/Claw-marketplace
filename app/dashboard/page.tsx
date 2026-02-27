'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useOpenClaw } from './openclaw-provider'

export default function OpenClawHomePage() {
  const { isConnected, wsStatus, agents, metrics, fetchAgents } = useOpenClaw()

  useEffect(() => {
    if (!isConnected) return
    void fetchAgents()
    const t = setInterval(() => void fetchAgents(), 30000)
    return () => clearInterval(t)
  }, [fetchAgents, isConnected])

  if (!isConnected) {
    return (
      <div className="container py-10">
        <div className="text-slate-300 mb-4">Сначала подключите ваш OpenClaw Gateway.</div>
        <Link className="text-primary" href="/dashboard/connect">Перейти к подключению</Link>
      </div>
    )
  }

  const running = agents.filter(a => a.status === 'running').length
  const errors = agents.filter(a => a.status === 'error').length

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">OpenClaw Dashboard</h1>
          <div className="text-slate-400 text-sm">WS: {wsStatus}</div>
        </div>
        <div className="flex gap-3">
          <Link className="text-primary" href="/dashboard/predictive">Predictive</Link>
          <Link className="text-primary" href="/dashboard/autoscale">AutoScale</Link>
          <Link className="text-primary" href="/dashboard/cost">Cost</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Agents</div>
          <div className="text-2xl font-semibold">{agents.length}</div>
        </div>
        <div className="bg-surface border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Running</div>
          <div className="text-2xl font-semibold">{running}</div>
        </div>
        <div className="bg-surface border border-slate-700 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Errors</div>
          <div className="text-2xl font-semibold">{errors}</div>
        </div>
      </div>

      <div className="bg-surface border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Agents</h2>
        {agents.length === 0 ? (
          <div className="text-slate-400">Нет данных.</div>
        ) : (
          <ul className="space-y-3">
            {agents.map(a => (
              <li key={a.id} className="flex items-center justify-between gap-3 border border-slate-800 rounded-lg p-3">
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-slate-400">{a.status} · cpu {a.cpu ?? 0}% · ram {a.ram ?? 0}MB · tps {a.tasks_per_sec ?? 0}</div>
                  {a.error && <div className="text-xs text-red-400">{a.error}</div>}
                </div>
                <div className="flex gap-2">
                  <Link className="text-primary" href={`/dashboard/autoscale?agent=${encodeURIComponent(a.id)}`}>AutoScale</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-slate-500">Metrics: cpu_avg {metrics?.cpu_avg ?? 0}% · ram {metrics?.ram_used ?? 0}/{metrics?.ram_total ?? 0}</div>
    </div>
  )
}
