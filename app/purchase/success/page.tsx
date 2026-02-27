'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'
import { useAuth } from '@/app/components/AuthProvider'

export default function PurchaseSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [purchase, setPurchase] = useState<any | null>(null)

  useEffect(() => {
    const id = searchParams.orderId
    if (!id) {
      setLoading(false)
      return
    }
    let alive = true
    ;(async () => {
      try {
        for (let i = 0; i < 10; i++) {
          const p = await apiFetch<any>(`/api/purchases/${id}`)
          if (!alive) return
          setPurchase(p)
          if (p.status === 'COMPLETED') break
          await new Promise(r => setTimeout(r, 1500))
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [searchParams.orderId])

  if (!token) {
    return (
      <div className="container py-16 text-center text-slate-300">
        Нужно войти, чтобы скачать покупку.{' '}
        <Link className="text-primary" href="/login">
          Войти
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-xl">Проверка оплаты...</div>
        </div>
      </div>
    )
  }

  const ok = purchase?.status === 'COMPLETED'

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-6">{ok ? '✅' : '⌛'}</div>
        <h1 className="text-3xl font-bold mb-4">{ok ? 'Оплата успешна!' : 'Ожидаем оплату'}</h1>
        <p className="text-slate-400 mb-8">
          {ok
            ? 'Теперь вы можете скачать агента.'
            : 'Если вы только что оплатили — подождите пару секунд.'}
        </p>

        <div className="bg-surface rounded-xl border border-slate-700 p-6 mb-8 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Статус</span>
            <span className="font-semibold">{purchase?.status || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Заказ</span>
            <span className="font-mono text-sm">{searchParams.orderId || '—'}</span>
          </div>
        </div>

        <button
          disabled={!ok}
          onClick={async () => {
            const r = await apiFetch<any>(`/api/purchases/${searchParams.orderId}/download`)
            window.location.href = r.downloadUrl
          }}
          className="block w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg hover:opacity-90 transition mb-4 disabled:opacity-50"
        >
          📥 Скачать агента
        </button>

        <Link
          href="/dashboard"
          className="block w-full py-3 border border-slate-600 rounded-xl font-semibold hover:bg-slate-800 transition"
        >
          В кабинет
        </Link>
      </div>
    </div>
  )
}
