'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PurchaseSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check payment status
    setTimeout(() => setLoading(false), 2000)
  }, [])

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

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-4">Оплата успешна!</h1>
        <p className="text-slate-400 mb-8">
          Спасибо за покупку! Теперь вы можете скачать своего агента.
        </p>

        <div className="bg-surface rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Агент</span>
            <span className="font-semibold">AI Email Writer</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Цена</span>
            <span className="font-semibold text-accent">$49</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Номер заказа</span>
            <span className="font-mono text-sm">{searchParams.orderId || '—'}</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="block w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg hover:opacity-90 transition mb-4"
        >
          📥 Скачать агента
        </Link>

        <Link
          href="/agents"
          className="block w-full py-3 border border-slate-600 rounded-xl font-semibold hover:bg-slate-800 transition"
        >
          Продолжить покупки
        </Link>
      </div>
    </div>
  )
}
