'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'

export default function HeaderClient() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          🤖 Agent Marketplace
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/agents" className="hover:text-indigo-400 transition">Каталог</Link>
          <Link href="/sell" className="hover:text-indigo-400 transition">Продать</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-indigo-400 transition">Кабинет</Link>
              <button onClick={logout} className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">Выйти</button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">Войти</Link>
          )}
        </div>
      </nav>
    </header>
  )
}
