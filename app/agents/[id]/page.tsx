'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'
import { useAuth } from '@/app/components/AuthProvider'

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const { token } = useAuth()
  const [agent, setAgent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await apiFetch<any>(`/api/agents/${params.id}`)
        setAgent(data.agent)
      } catch (e: any) {
        alert(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id])

  const handlePurchase = async () => {
    if (!token) {
      alert('Нужно войти')
      window.location.href = '/login'
      return
    }
    setPurchasing(true)
    try {
      const data = await apiFetch<any>('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: params.id })
      })
      window.location.href = data.payLink
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) return <div className="container py-8 text-slate-400">Загрузка...</div>
  if (!agent) return <div className="container py-8 text-slate-400">Не найдено</div>

  return (
    <div className="container py-8">
      <Link href="/agents" className="text-slate-400 hover:text-white mb-4 inline-flex items-center gap-2">← Назад</Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl border border-slate-700 overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-7xl">🤖</div>
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-2">{agent.title}</h1>
              <div className="text-slate-400 mb-6">📥 {agent.downloads} продаж</div>
              <div className="text-slate-300 whitespace-pre-wrap">{agent.description}</div>
              <div className="flex flex-wrap gap-2 mt-6">
                {(agent.tags||[]).map((t:string)=>(<span key={t} className="px-3 py-1 bg-slate-700 rounded-full text-sm">#{t}</span>))}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl border border-slate-700 p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-sm text-slate-400">Цена</div>
              <div className="text-4xl font-bold text-accent">${Number(agent.priceUsdt).toFixed(0)}</div>
            </div>
            <button onClick={handlePurchase} disabled={purchasing} className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg disabled:opacity-50">
              {purchasing?'...':'Купить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
