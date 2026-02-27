'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'
import { useAuth } from '@/app/components/AuthProvider'

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const data = await apiFetch<any>('/api/purchases')
        setPurchases(data.purchases || [])
      } catch (e: any) {
        alert(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  if (!token) {
    return (
      <div className="container py-10">
        <div className="text-slate-300">Нужно войти.</div>
        <Link className="text-primary" href="/login">Перейти к логину</Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Кабинет</h1>
      <div className="text-slate-400 mb-8">{user?.email}</div>

      <div className="bg-surface rounded-xl border border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Покупки</h2>
        {loading ? (
          <div className="text-slate-400">Загрузка...</div>
        ) : purchases.length === 0 ? (
          <div className="text-slate-400">Покупок пока нет.</div>
        ) : (
          <ul className="space-y-3">
            {purchases.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.agent.title}</div>
                  <div className="text-xs text-slate-400">{p.status}</div>
                </div>
                <button
                  disabled={p.status !== 'COMPLETED'}
                  className="text-primary disabled:opacity-40"
                  onClick={async () => {
                    try {
                      const r = await apiFetch<any>(`/api/purchases/${p.id}/download`)
                      window.location.href = r.downloadUrl
                    } catch (e: any) {
                      alert(e.message)
                    }
                  }}
                >
                  Скачать
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
