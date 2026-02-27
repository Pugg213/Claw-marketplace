import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Marketplace - Купить и продать AI агентов',
  description: 'Маркетплейс AI-агентов с готовым кодом и промптами',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-900 text-white">
        <header className="border-b border-slate-800">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              🤖 Agent Marketplace
            </a>
            <div className="flex items-center gap-6">
              <a href="/agents" className="hover:text-indigo-400 transition">Каталог</a>
              <a href="/sell" className="hover:text-indigo-400 transition">Продать</a>
              <a href="/login" className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
                Войти
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-slate-800 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
            © 2026 Agent Marketplace. Все права защищены.
          </div>
        </footer>
      </body>
    </html>
  )
}
