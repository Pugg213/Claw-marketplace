'use client'

import Link from 'next/link'
import { useAuth } from '@/app/components/AuthProvider'
import { apiFetch } from '@/lib/api-client'

function isPro(user: any) {
  const until = user?.proUntil
  if (!until) return false
  const d = new Date(until)
  return d.getTime() > Date.now()
}

export default function ProPage() {
  const { token, user } = useAuth()
  const pro = isPro(user)

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">OpenClaw PRO</h1>
      <p className="text-slate-400 mb-6">PRO открывает Cost / AutoScale / Predictive.</p>

      {pro ? (
        <div className="bg-surface border border-slate-700 rounded-xl p-6">
          <div className="font-semibold">PRO активен</div>
          <div className="text-slate-400 text-sm">до {new Date(user.proUntil).toLocaleString()}</div>
          <div className="mt-4 flex gap-3">
            <Link className="text-primary" href="/dashboard/predictive">Predictive</Link>
            <Link className="text-primary" href="/dashboard/autoscale">AutoScale</Link>
            <Link className="text-primary" href="/dashboard/cost">Cost</Link>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-slate-700 rounded-xl p-6">
          <div className="font-semibold mb-2">Купить PRO на 30 дней</div>
          <div className="text-slate-400 text-sm mb-4">Оплата через OxaPay (USDT). После оплаты доступ откроется автоматически.</div>

          {!token ? (
            <div className="text-slate-300">
              Нужно войти. <Link className="text-primary" href="/login">Войти</Link>
            </div>
          ) : (
            <button
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold"
              onClick={async () => {
                const r = await apiFetch<any>('/api/subscriptions/pro', { method: 'POST' })
                window.location.href = r.payLink
              }}
            >
              Купить PRO
            </button>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-slate-500">
        <div className="font-semibold text-slate-300 mb-1">Что входит:</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cost: калькулятор затрат + экспорт отчётов</li>
          <li>AutoScale: правила + кнопка “применить сейчас”</li>
          <li>Predictive: анализ рисков по живым метрикам</li>
        </ul>
      </div>
    </div>
  )
}
