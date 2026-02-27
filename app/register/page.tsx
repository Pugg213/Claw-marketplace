'use client'

import { useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'
import { useAuth } from '@/app/components/AuthProvider'

export default function RegisterPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await apiFetch<any>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      })
      login(r.token, r.user)
      window.location.href = '/dashboard'
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-slate-700 p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Регистрация</h1>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Username (опц.)</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Пароль (&gt;= 8)</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3" />
            </div>
            <button disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold disabled:opacity-50">{loading?'...':'Создать аккаунт'}</button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-6">
            Уже есть аккаунт? <Link href="/login" className="text-primary hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
