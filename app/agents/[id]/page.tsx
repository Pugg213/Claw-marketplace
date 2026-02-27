'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const [purchasing, setPurchasing] = useState(false)

  // In real app, fetch from API
  const agent = {
    id: params.id,
    title: 'AI Email Writer',
    description: `Профессиональный AI агент для написания email-писем. Адаптируется под тон вашего бренда, учитывает контекст и цель письма.

Возможности:
• Написание продающих писем
• Follow-up последовательности
• Newsletter контент
• Ответы на возражения
• Персонализация под аудиторию

Агент поставляется с:
• Полным кодом на Python
• Системным промптом
• Примерами шаблонов
• Документацией по установке`,
    price: 49,
    seller: { username: 'ai_seller', avatar: '🤖' },
    category: 'email',
    tags: ['email', 'marketing', 'copywriting'],
    downloads: 23,
    rating: 4.8,
    ratingCount: 12,
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    // In real app, call API
    alert('Перенаправление на оплату...')
    setPurchasing(false)
  }

  return (
    <div className="container py-8">
      <Link href="/agents" className="text-slate-400 hover:text-white mb-4 inline-flex items-center gap-2">
        ← Назад к каталогу
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl border border-slate-700 overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-8xl">
              📧
            </div>
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{agent.title}</h1>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Категория: {agent.category}</span>
                    <span>•</span>
                    <span>📥 {agent.downloads} продаж</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {agent.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert max-w-none">
                <h3>Описание</h3>
                <pre className="whitespace-pre-wrap font-sans text-slate-300 bg-transparent">
                  {agent.description}
                </pre>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Что входит в архив</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>✅ main.py — основной код агента</li>
                  <li>✅ requirements.txt — зависимости</li>
                  <li>✅ config.env.example — пример конфига</li>
                  <li>✅ prompts/system.txt — системный промпт</li>
                  <li>✅ prompts/templates/ — 50+ готовых шаблонов</li>
                  <li>✅ README.md — полная документация</li>
                  <li>✅ tests/ — тесты и примеры</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Как использовать</h3>
                <div className="bg-slate-800 rounded-xl p-6 font-mono text-sm">
                  <p className="text-slate-400"># 1. Установи зависимости</p>
                  <p className="text-white">pip install -r requirements.txt</p>
                  <p className="text-slate-400 mt-4"># 2. Настрой конфиг</p>
                  <p className="text-white">cp config.env.example config.env</p>
                  <p className="text-slate-400 mt-4"># 3. Запусти</p>
                  <p className="text-white">python main.py</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl border border-slate-700 p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{agent.seller.avatar}</div>
              <div className="font-semibold">{agent.seller.username}</div>
            </div>

            <div className="text-center mb-6">
              <div className="text-sm text-slate-400 mb-1">Цена</div>
              <div className="text-4xl font-bold text-accent">${agent.price}</div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg mb-4 hover:opacity-90 transition disabled:opacity-50"
            >
              {purchasing ? 'Загрузка...' : 'Купить сейчас'}
            </button>

            <button className="w-full py-3 border border-slate-600 rounded-xl font-semibold mb-4 hover:bg-slate-700 transition">
              Добавить в избранное
            </button>

            <div className="border-t border-slate-700 pt-4 mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Рейтинг</span>
                <span>⭐ {agent.rating} ({agent.ratingCount} отзывов)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Продаж</span>
                <span>{agent.downloads}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-slate-700 p-6 mt-6">
            <h3 className="font-semibold mb-4">Гарантии</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✅ Код проверен</li>
              <li>✅ Работает с OpenAI API</li>
              <li>✅ Бесплатные обновления</li>
              <li>✅ Техподдержка продавца</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
