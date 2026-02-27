'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'

const categories = [
  { value: 'email', label: '📧 Email' },
  { value: 'analytics', label: '📊 Analytics' },
  { value: 'design', label: '🎨 Design' },
  { value: 'chat', label: '💬 Chat' },
  { value: 'seo', label: '🔍 SEO' },
  { value: 'content', label: '📝 Content' },
  { value: 'automation', label: '⚙️ Automation' },
  { value: 'other', label: '💡 Other' },
]

export default function SellPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [price, setPrice] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const { token } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      alert('Нужно войти')
      window.location.href = '/login'
      return
    }
    if (!file) {
      alert('Загрузите ZIP архив')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('tags', tags)
      formData.append('priceUsdt', price)

      const res = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || 'Upload failed')

      alert('Агент опубликован!')
      window.location.href = '/agents'
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Продать агента</h1>
        <p className="text-slate-400 mb-8">Загрузи своего AI агента и начни зарабатывать</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Название агента *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: AI Email Writer Pro"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Описание *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание возможностей агента..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Категория *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Выберите...</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Цена (USDT) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="49"
                  min="1"
                  step="1"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Теги (через запятую)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="email, marketing, copywriting"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Архив агента *</h2>
            
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center">
              {file ? (
                <div className="text-green-400">
                  <div className="text-4xl mb-2">📦</div>
                  <div className="font-semibold">{file.name}</div>
                  <div className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-2 text-red-400 hover:underline text-sm"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-slate-400 mb-2">Перетащи ZIP сюда или выбери файл</div>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition"
                  >
                    Выбрать файл
                  </label>
                </>
              )}
            </div>

            <div className="mt-4 text-sm text-slate-400">
              <p>Требования к архиву:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Формат: только ZIP</li>
                <li>Максимальный размер: 100 MB</li>
                <li>Должен содержать: main.py, README.md</li>
              </ul>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Комиссии</h2>
            <div className="space-y-2 text-slate-300">
              <p>🏷️ <strong>Ваша цена:</strong> {price || '0'} USDT</p>
              <p>📊 <strong>Комиссия платформы (30%):</strong> {price ? (parseFloat(price) * 0.3).toFixed(2) : '0'} USDT</p>
              <p className="text-green-400">💰 <strong>Вы получите:</strong> {price ? (parseFloat(price) * 0.7).toFixed(2) : '0'} USDT</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {uploading ? 'Публикация...' : 'Опубликовать агента'}
          </button>
        </form>
      </div>
    </div>
  )
}
