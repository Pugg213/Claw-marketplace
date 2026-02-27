import Link from 'next/link'

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
  return (
    <div className="container py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-surface rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Категории</h3>
            <div className="space-y-2">
              <Link 
                href="/agents" 
                className="block py-2 px-3 rounded-lg hover:bg-slate-700 transition"
              >
                Все категории
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/agents?category=${cat.slug}`}
                  className="block py-2 px-3 rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-slate-700 mt-6">
            <h3 className="text-lg font-semibold mb-4">Сортировка</h3>
            <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
              <option value="newest">Новинки</option>
              <option value="popular">Популярные</option>
              <option value="price_asc">Сначала дешевые</option>
              <option value="price_desc">Сначала дорогие</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск агентов..."
              className="w-full bg-surface border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample agent cards - in real app these come from API */}
            <Link href="/agents/1" className="agent-card">
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
            </Link>

            <Link href="/agents/2" className="agent-card">
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
            </Link>

            <Link href="/agents/3" className="agent-card">
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
            </Link>

            <Link href="/agents/4" className="agent-card">
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
            </Link>

            <Link href="/agents/5" className="agent-card">
              <div className="preview">💬</div>
              <div className="content">
                <div className="title">Customer Support</div>
                <div className="description">
                  AI агент для обработки обращений клиентов
                </div>
                <div className="tags">
                  <span className="tag">#chat</span>
                  <span className="tag">#support</span>
                </div>
                <div className="footer">
                  <div className="price">$89</div>
                  <div className="stats">📥 34</div>
                </div>
              </div>
            </Link>

            <Link href="/agents/6" className="agent-card">
              <div className="preview">⚙️</div>
              <div className="content">
                <div className="title">Task Automator</div>
                <div className="description">
                  Автоматизирует рутинные задачи
                </div>
                <div className="tags">
                  <span className="tag">#automation</span>
                  <span className="tag">#productivity</span>
                </div>
                <div className="footer">
                  <div className="price">$69</div>
                  <div className="stats">📥 29</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-12">
            <button className="px-4 py-2 bg-surface border border-slate-700 rounded-lg hover:bg-slate-700 transition">
              ←
            </button>
            <button className="px-4 py-2 bg-primary rounded-lg">1</button>
            <button className="px-4 py-2 bg-surface border border-slate-700 rounded-lg hover:bg-slate-700 transition">
              2
            </button>
            <button className="px-4 py-2 bg-surface border border-slate-700 rounded-lg hover:bg-slate-700 transition">
              3
            </button>
            <button className="px-4 py-2 bg-surface border border-slate-700 rounded-lg hover:bg-slate-700 transition">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
