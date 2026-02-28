'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const categories = [
  { icon: '📧', name: 'Email', slug: 'email' },
  { icon: '📊', name: 'Analytics', slug: 'analytics' },
  { icon: '🎨', name: 'Design', slug: 'design' },
  { icon: '💬', name: 'Chat', slug: 'chat' },
  { icon: '🔍', name: 'SEO', slug: 'seo' },
  { icon: '📝', name: 'Content', slug: 'content' },
  { icon: '🤖', name: 'Automation', slug: 'automation' },
  { icon: '💡', name: 'Other', slug: 'other' },
]

type Agent = {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  priceUsdt: number
  downloads: number
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(data => {
        if (data.agents) setAgents(data.agents.slice(0, 8))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container">
      <section className="hero">
        <h1>Магазин AI Агентов</h1>
        <p>
          Покупай и продавай готовых AI-агентов с кодом, промптами и настройками.
          Загрузи на свой сервер и используй.
        </p>
        
        <div className="search-box">
          <input type="text" placeholder="Поиск агентов..." />
          <button>Найти</button>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-value">{agents.length}</div>
            <div className="stat-label">Агентов</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Категории</h2>
        <div className="categories">
          {categories.map(cat => (
            <Link href={`/agents?category=${cat.slug}`} key={cat.slug} className="category-card">
              <div className="icon">{cat.icon}</div>
              <div className="name">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="agents-section">
        <h2 className="section-title">Агенты</h2>
        
        {loading ? (
          <div className="text-slate-400">Загрузка...</div>
        ) : agents.length === 0 ? (
          <div className="text-slate-400">Агентов пока нет. Будь первым!</div>
        ) : (
          <div className="agents-grid">
            {agents.map(agent => (
              <Link href={`/agents/${agent.id}`} key={agent.id} className="agent-card">
                <div className="preview">🤖</div>
                <div className="content">
                  <div className="title">{agent.title}</div>
                  <div className="description">
                    {agent.description?.slice(0, 80)}...
                  </div>
                  <div className="tags">
                    {agent.tags?.slice(0, 3).map(t => (
                      <span key={t} className="tag">#{t}</span>
                    ))}
                  </div>
                  <div className="footer">
                    <div className="price">${agent.priceUsdt}</div>
                    <div className="stats">📥 {agent.downloads || 0}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {agents.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/agents" className="btn-primary">
              Смотреть все агенты →
            </Link>
          </div>
        )}
      </section>

      <section style={{ textAlign: 'center', marginTop: '80px', padding: '60px', background: 'linear-gradient(135deg, #1e293b, #334155)', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Хочешь продавать своих агентов?</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
          Загружай свои AI-агенты и зарабатывай. Мы берём 30% комиссии.
        </p>
        <Link href="/sell" className="btn-primary">
          Начать продавать
        </Link>
      </section>
    </div>
  )
}
