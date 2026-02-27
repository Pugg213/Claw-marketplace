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
        // simple list: query purchases by buyerId not implemented; reuse prisma via new endpoint later.
        // For now: show empty.
        setPurchases([])
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
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.agent.title}</span>
                <Link href={`/api/purchases/${p.id}/download`} className="text-primary">Скачать</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
