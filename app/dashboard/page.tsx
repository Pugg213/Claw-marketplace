'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales' | 'payouts'>('purchases')

  // Mock data
  const purchases = [
    { id: '1', agent: 'AI Email Writer', price: 49, date: '2026-02-20', status: 'completed' },
    { id: '2', agent: 'Data Analyst', price: 79, date: '2026-02-18', status: 'completed' },
  ]

  const sales = [
    { id: '1', agent: 'SEO Optimizer', price: 59, buyers: 12, earnings: 495.60, date: '2026-02-15' },
    { id: '2', agent: 'Image Generator', price: 39, buyers: 8, earnings: 218.40, date: '2026-02-10' },
  ]

  const payouts = [
    { id: '1', amount: 300, status: 'completed', date: '2026-02-15', txHash: '0x123...' },
    { id: '2', amount: 150, status: 'pending', date: '2026-02-20', txHash: null },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64">
          <div className="bg-surface rounded-xl border border-slate-700 p-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">👤</div>
              <div className="font-semibold">Username</div>
              <div className="text-sm text-slate-400">user@example.com</div>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">$714.00</div>
                <div className="text-sm text-slate-400">Баланс</div>
              </div>
            </div>
          </div>

          <nav className="mt-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary">
              <span>📊</span> Покупки
            </Link>
            <Link href="/dashboard/sales" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800">
              <span>💰</span> Продажи
            </Link>
            <Link href="/dashboard/payouts" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800">
              <span>💳</span> Вывод
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800">
              <span>⚙️</span> Настройки
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-surface rounded-xl border border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-1">Всего покупок</div>
              <div className="text-3xl font-bold">12</div>
            </div>
            <div className="bg-surface rounded-xl border border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-1">Всего продаж</div>
              <div className="text-3xl font-bold">23</div>
            </div>
            <div className="bg-surface rounded-xl border border-slate-700 p-6">
              <div className="text-slate-400 text-sm mb-1">Доход</div>
              <div className="text-3xl font-bold text-green-400">$1,240</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'purchases' ? 'bg-primary' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Мои покупки
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'sales' ? 'bg-primary' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Мои продажи
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'payouts' ? 'bg-primary' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Вывод средств
            </button>
          </div>

          {/* Purchases */}
          {activeTab === 'purchases' && (
            <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Агент</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Цена</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Дата</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Статус</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {purchases.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 font-medium">{p.agent}</td>
                      <td className="px-6 py-4">${p.price}</td>
                      <td className="px-6 py-4 text-slate-400">{p.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-900 text-green-400 rounded-full text-xs">
                          {p.status === 'completed' ? 'Завершено' : p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:underline">Скачать</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sales */}
          {activeTab === 'sales' && (
            <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Агент</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Цена</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Продаж</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Доход</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sales.map(s => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 font-medium">{s.agent}</td>
                      <td className="px-6 py-4">${s.price}</td>
                      <td className="px-6 py-4">{s.buyers}</td>
                      <td className="px-6 py-4 text-green-400">${s.earnings.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payouts */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              <div className="bg-surface rounded-xl border border-slate-700 p-6">
                <h3 className="font-semibold mb-4">Запросить вывод</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Адрес кошелька (USDT)"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Сумма"
                    className="w-32 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2"
                  />
                  <button className="px-6 py-2 bg-primary rounded-lg font-medium">
                    Вывести
                  </button>
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Сумма</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Дата</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Статус</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">TX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {payouts.map(p => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 font-medium">${p.amount}</td>
                        <td className="px-6 py-4 text-slate-400">{p.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            p.status === 'completed' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
                          }`}>
                            {p.status === 'completed' ? 'Выплачено' : 'Ожидание'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-sm">
                          {p.txHash || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
