import Link from 'next/link'

const categories = [
  { icon: '📧', name: 'Email', slug: 'email' },
  { icon: '📊', name: 'Analytics', slug: 'analytics' },
  { icon: '🎨', name: 'Design', slug: 'design' },
  { icon: '💬', name: 'Chat', slug: 'chat' },
  { icon: '🔍', name: 'SEO', slug: 'seo' },
  { icon: '📝', name: 'Content', slug: 'content' },
  { icon: '🤖', name: 'Automation', slug: 'automation' },
  { icon: '�-other', name: 'Other', slug: 'other' },
]

export default function Home() {
  return (
    <div className="container">
      {/* Hero */}
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
            <div className="stat-value">150+</div>
            <div className="stat-label">Агентов</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">500+</div>
            <div className="stat-label">Покупок</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">50+</div>
            <div className="stat-label">Продавцов</div>
          </div>
        </div>
      </section>

      {/* Categories */}
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

      {/* Featured Agents */}
      <section className="agents-section">
        <h2 className="section-title">Популярные агенты</h2>
        <div className="agents-grid">
          {/* Sample agent cards */}
          <div className="agent-card">
            <div className="preview">📧</div>
            <div className="content">
              <div className="title">AI Email Writer</div>
              <div className="description">
                Профессиональный агент для написания email-писем с адаптацией под тон бренда
              </div>
              <div className="tags">
                <span className="tag">#email</span>
                <span className="tag">#marketing</span>
              </div>
              <div className="footer">
                <div className="price">$49</div>
                <div className="stats">📥 23</div>
              </div>
            </div>
          </div>

          <div className="agent-card">
            <div className="preview">📊</div>
            <div className="content">
              <div className="title">Data Analyst</div>
              <div className="description">
                Анализирует данные, строит графики и создаёт отчёты
              </div>
              <div className="tags">
                <span className="tag">#analytics</span>
                <span className="tag">#data</span>
              </div>
              <div className="footer">
                <div className="price">$79</div>
                <div className="stats">📥 45</div>
              </div>
            </div>
          </div>

          <div className="agent-card">
            <div className="preview">🔍</div>
            <div className="content">
              <div className="title">SEO Optimizer</div>
              <div className="description">
                Анализирует сайты и предлагает улучшения для SEO
              </div>
              <div className="tags">
                <span className="tag">#seo</span>
                <span className="tag">#marketing</span>
              </div>
              <div className="footer">
                <div className="price">$59</div>
                <div className="stats">📥 18</div>
              </div>
            </div>
          </div>

          <div className="agent-card">
            <div className="preview">🎨</div>
            <div className="content">
              <div className="title">Image Generator</div>
              <div className="description">
                Генерирует промпты для AI-генераторов изображений
              </div>
              <div className="tags">
                <span className="tag">#design</span>
                <span className="tag">#ai</span>
              </div>
              <div className="footer">
                <div className="price">$39</div>
                <div className="stats">📥 67</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/agents" className="btn-primary">
            Смотреть все агенты →
          </Link>
        </div>
      </section>

      {/* CTA */}
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
