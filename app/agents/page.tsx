'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api-client'

const categories = [
  { icon: '📧', name: 'Email', slug: 'email' },
  { icon: '📊', name: 'Analytics', slug: 'analytics' },
  { icon: '🎨', name: 'Design', slug: 'design' },
  { icon: '💬', name: 'Chat', slug: 'chat' },
  { icon: '🔍', name: 'SEO', slug: 'seo' },
  { icon: '📝', name: 'Content', slug: 'content' },
  { icon: '⚙️', name: 'Automation', slug: 'automation' },
  { icon: '💡', name: 'Other', slug: 'other' },
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(false)

  const query = useMemo(() => {
    const sp = new URLSearchParams()
    if (category && category !== 'all') sp.set('category', category)
    if (search) sp.set('search', search)
    if (sort) sp.set('sort', sort)
    return sp.toString()
  }, [search, category, sort])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await apiFetch<any>(`/api/agents?${query}`)
        setAgents(data.agents || [])
      } catch (e: any) {
        alert(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [query])

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-surface rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Категории</h3>
            <div className="space-y-2">
              <button onClick={() => setCategory('all')} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-700 transition ${category==='all'?'bg-slate-700':''}`}>Все категории</button>
              {categories.map(cat => (
                <button key={cat.slug} onClick={() => setCategory(cat.slug)} className={`w-full text-left py-2 px-3 rounded-lg hover:bg-slate-700 transition flex items-center gap-2 ${category===cat.slug?'bg-slate-700':''}`}>
                  <span>{cat.icon}</span><span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-slate-700 mt-6">
            <h3 className="text-lg font-semibold mb-4">Сортировка</h3>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="newest">Новинки</option>
              <option value="popular">Популярные</option>
              <option value="price_asc">Сначала дешевые</option>
              <option value="price_desc">Сначала дорогие</option>
            </select>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex gap-3">
            <input value={search} onChange={e=>setSearch(e.target.value)} type="text" placeholder="Поиск агентов..." className="flex-1 bg-surface border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400" />
            <button onClick={() => { /* effect uses query */ }} className="px-4 py-3 bg-slate-800 rounded-xl">Поиск</button>
          </div>

          {loading ? (
            <div className="text-slate-400">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map(a => (
                <Link key={a.id} href={`/agents/${a.id}`} className="agent-card">
                  <div className="preview">🤖</div>
                  <div className="content">
                    <div className="title">{a.title}</div>
                    <div className="description">{a.description}</div>
                    <div className="tags">{(a.tags||[]).slice(0,3).map((t:string)=>(<span key={t} className="tag">#{t}</span>))}</div>
                    <div className="footer">
                      <div className="price">${Number(a.priceUsdt).toFixed(0)}</div>
                      <div className="stats">📥 {a.downloads}</div>
                    </div>
                  </div>
                </Link>
              ))}
              {agents.length === 0 && <div className="text-slate-400">Ничего не найдено</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
