import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Marketplace - Купить и продать AI агентов',
  description: 'Маркетплейс AI-агентов с готовым кодом и промптами',
}

import { AuthProvider } from '@/app/components/AuthProvider'
import HeaderClient from '@/app/components/HeaderClient'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-900 text-white">
        <AuthProvider>
          <HeaderClient />
          <main>{children}</main>
          <footer className="border-t border-slate-800 mt-20 py-8">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
              © 2026 Agent Marketplace. Все права защищены.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
