'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOpenClaw } from '../openclaw-provider'

export default function OpenClawConnectPage() {
  const router = useRouter()
  const { servers, addServer, switchServer, removeServer, activeServerId } = useOpenClaw()

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Подключение OpenClaw</h1>
      <p className="text-slate-400 mb-8">Введите URL Gateway и персональный токен OpenClaw. Подключение идёт по WebSocket.</p>

      {servers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Сохранённые серверы</h2>
          <ul className="space-y-2">
            {servers.map(s => (
              <li
                key={s.id}
                className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${activeServerId === s.id ? 'border-primary' : 'border-slate-700'}`}
              >
                <button className="text-left flex-1" onClick={() => { switchServer(s.id); router.push('/dashboard') }}>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.serverUrl}</div>
                </button>
                <button className="text-red-400" onClick={() => removeServer(s.id)}>Удалить</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Добавить сервер</h2>

        <div className="grid grid-cols-1 gap-4">
          <label className="text-sm">
            <div className="mb-1 text-slate-300">Название (опционально)</div>
            <input className="w-full rounded-lg bg-black/20 border border-slate-700 px-3 py-2" value={name} onChange={e => setName(e.target.value)} placeholder="my-vps" />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-slate-300">Gateway URL</div>
            <input className="w-full rounded-lg bg-black/20 border border-slate-700 px-3 py-2" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://vps.example.com:3210" />
            <div className="text-xs text-slate-500 mt-1">Можно с портом или без. https → wss автоматически.</div>
          </label>
          <label className="text-sm">
            <div className="mb-1 text-slate-300">OpenClaw Token</div>
            <input className="w-full rounded-lg bg-black/20 border border-slate-700 px-3 py-2" value={token} onChange={e => setToken(e.target.value)} placeholder="..." />
          </label>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold disabled:opacity-50"
            onClick={async () => {
              setError(null)
              setLoading(true)
              try {
                const r = await addServer(name, url, token)
                if (!r.success) throw new Error(r.error || 'Failed')
                router.push('/dashboard')
              } catch (e: any) {
                setError(e.message)
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? 'Подключение...' : 'Подключиться'}
          </button>
        </div>
      </div>
    </div>
  )
}
