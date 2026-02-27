'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useOpenClaw } from '../openclaw-provider'
import { useAuth } from '@/app/components/AuthProvider'

function isPro(user: any) {
  const until = user?.proUntil
  if (!until) return false
  const d = new Date(until)
  return d.getTime() > Date.now()
}

type Rule = {
  id: string
  name: string
  trigger: 'schedule' | 'cpu' | 'load' | 'time'
  action: 'start' | 'stop' | 'restart'
  agent: string // 'all' | agentId
  enabled: boolean
  config: any
}

const LS_KEY = 'openclaw-autoscale'

function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRules(rules: Rule[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rules))
}

export default function AutoScalePage() {
  const { isConnected, agents, startAgent, stopAgent, restartAgent } = useOpenClaw()
  const { user } = useAuth()
  const pro = isPro(user)

  const [rules, setRules] = useState<Rule[]>(() => (typeof window === 'undefined' ? [] : loadRules()))
  const [name, setName] = useState('')
  const [action, setAction] = useState<'start' | 'stop' | 'restart'>('restart')
  const [agent, setAgent] = useState<string>('all')

  const agentOptions = useMemo(() => [{ id: 'all', name: 'All agents' }, ...agents.map(a => ({ id: a.id, name: a.name }))], [agents])

  if (!isConnected) {
    return (
      <div className="container py-10">
        <div className="text-slate-300 mb-4">Нет подключения к Gateway.</div>
        <Link className="text-primary" href="/openclaw/connect">Подключиться</Link>
      </div>
    )
  }

  if (!pro) {
    return (
      <div className="container py-10 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">AutoScale</h1>
        <p className="text-slate-400 mb-6">Автоматизация доступна в PRO.</p>
        <Link className="text-primary" href="/openclaw/pro">Купить PRO</Link>
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AutoScale</h1>
        <Link className="text-primary" href="/openclaw">Overview</Link>
      </div>

      <div className="bg-surface border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Создать правило</h2>
        <div className="grid gap-3">
          <input className="rounded-lg bg-black/20 border border-slate-700 px-3 py-2" value={name} onChange={e => setName(e.target.value)} placeholder="Название правила" />
          <select className="rounded-lg bg-black/20 border border-slate-700 px-3 py-2" value={action} onChange={e => setAction(e.target.value as any)}>
            <option value="start">Start</option>
            <option value="stop">Stop</option>
            <option value="restart">Restart</option>
          </select>
          <select className="rounded-lg bg-black/20 border border-slate-700 px-3 py-2" value={agent} onChange={e => setAgent(e.target.value)}>
            {agentOptions.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <button
            className="py-2 rounded-lg bg-primary text-black font-semibold"
            onClick={() => {
              const r: Rule = {
                id: `rule-${Date.now()}`,
                name: name || 'Rule',
                trigger: 'schedule',
                action,
                agent,
                enabled: true,
                config: {},
              }
              const next = [r, ...rules]
              setRules(next)
              saveRules(next)
              setName('')
            }}
          >
            Добавить
          </button>
        </div>
      </div>

      <div className="bg-surface border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Правила</h2>
        {rules.length === 0 ? (
          <div className="text-slate-400">Правил пока нет.</div>
        ) : (
          <ul className="space-y-3">
            {rules.map(r => (
              <li key={r.id} className="border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.action} · {r.agent}</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="text-primary"
                      onClick={async () => {
                        const targets = r.agent === 'all' ? agents.map(a => a.id) : [r.agent]
                        for (const id of targets) {
                          if (r.action === 'start') await startAgent(id)
                          if (r.action === 'stop') await stopAgent(id)
                          if (r.action === 'restart') await restartAgent(id)
                        }
                        alert('Выполнено')
                      }}
                    >
                      Применить сейчас
                    </button>
                    <button
                      className="text-slate-400"
                      onClick={() => {
                        const next = rules.map(x => (x.id === r.id ? { ...x, enabled: !x.enabled } : x))
                        setRules(next)
                        saveRules(next)
                      }}
                    >
                      {r.enabled ? 'Выключить' : 'Включить'}
                    </button>
                    <button
                      className="text-red-400"
                      onClick={() => {
                        const next = rules.filter(x => x.id !== r.id)
                        setRules(next)
                        saveRules(next)
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-slate-500">MVP: правила хранятся локально; автозапуск по расписанию добавим позже.</div>
    </div>
  )
}
