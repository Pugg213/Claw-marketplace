'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useOpenClaw } from '../openclaw-provider'
import { useAuth } from '@/app/components/AuthProvider'

function isPro(user: any) {
  const until = user?.proUntil
  if (!until) return false
  const d = new Date(until)
  return d.getTime() > Date.now()
}

type Prediction = {
  id: string
  agentId: string
  agentName: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  recommendation: string
}

function generatePredictions(agents: any[]): Prediction[] {
  const out: Prediction[] = []

  for (const a of agents) {
    if ((a.cpu ?? 0) > 60) {
      out.push({
        id: `${a.id}-cpu`,
        agentId: a.id,
        agentName: a.name,
        severity: (a.cpu ?? 0) > 80 ? 'critical' : 'warning',
        title: 'Высокая нагрузка CPU',
        description: `CPU сейчас ${a.cpu ?? 0}%. Возможна деградация производительности.`,
        recommendation: 'Рекомендуем увеличить лимиты/ресурсы или снизить нагрузку.',
      })
    }

    if ((a.ram ?? 0) > 800) {
      out.push({
        id: `${a.id}-ram`,
        agentId: a.id,
        agentName: a.name,
        severity: (a.ram ?? 0) > 1200 ? 'critical' : 'warning',
        title: 'Рост потребления памяти',
        description: `RAM сейчас ${a.ram ?? 0}MB.`,
        recommendation: 'Проверьте утечки памяти или увеличьте лимит.',
      })
    }

    if (a.status === 'error') {
      out.push({
        id: `${a.id}-err`,
        agentId: a.id,
        agentName: a.name,
        severity: 'critical',
        title: 'Агент в ошибке',
        description: a.error ? `Ошибка: ${a.error}` : 'Агент в состоянии error.',
        recommendation: 'Откройте логи и перезапустите агента.',
      })
    }

    if ((a.tasks_per_sec ?? 0) > 0 && (a.tasks_per_sec ?? 0) < 3) {
      out.push({
        id: `${a.id}-perf`,
        agentId: a.id,
        agentName: a.name,
        severity: 'info',
        title: 'Низкая производительность',
        description: `TPS: ${a.tasks_per_sec}.`,
        recommendation: 'Проверьте внешние зависимости/ограничения.',
      })
    }
  }

  const order = { critical: 0, warning: 1, info: 2 }
  return out.sort((x, y) => order[x.severity] - order[y.severity])
}

export default function PredictivePage() {
  const { isConnected, agents, fetchAgents } = useOpenClaw()
  const { user } = useAuth()
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (!isConnected) return
    void fetchAgents()
  }, [fetchAgents, isConnected])

  const pro = isPro(user)

  const predictions = useMemo(() => (pro ? generatePredictions(agents) : []), [agents, pro])

  if (!isConnected) {
    return (
      <div className="container py-10">
        <div className="text-slate-300 mb-4">Нет подключения к Gateway.</div>
        <Link className="text-primary" href="/dashboard/connect">Подключиться</Link>
      </div>
    )
  }

  if (!pro) {
    return (
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Predictive</h1>
        <p className="text-slate-400 mb-6">Продвинутый анализ доступен в PRO.</p>
        <Link className="text-primary" href="/dashboard/pro">Купить PRO</Link>
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Predictive</h1>
        <div className="flex gap-3">
          <Link className="text-primary" href="/dashboard">Overview</Link>
          <button
            className="text-primary"
            onClick={async () => {
              setAnalyzing(true)
              await new Promise(r => setTimeout(r, 800))
              setAnalyzing(false)
            }}
          >
            {analyzing ? 'Анализ...' : 'Запустить анализ'}
          </button>
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="text-slate-400">Рисков не найдено.</div>
      ) : (
        <ul className="space-y-3">
          {predictions.map(p => (
            <li key={p.id} className="bg-surface border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-slate-400">{p.severity}</div>
              </div>
              <div className="text-sm text-slate-300 mt-2">{p.agentName}: {p.description}</div>
              <div className="text-sm text-slate-400 mt-2">Рекомендация: {p.recommendation}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
