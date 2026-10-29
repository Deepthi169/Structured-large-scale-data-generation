import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { API_URL, getJson, imageUrl } from '../../api'

const Review = () => {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJson('/records', { status: 'Flagged', limit: 50 })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err.message || 'Could not reach the backend')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const decide = async (id, label) => {
    setBusy(id)
    try {
      const res = await fetch(`${API_URL}/records/${encodeURIComponent(id)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      setItems((list) => list.filter((r) => r._id !== id))
      setTotal((t) => t - 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Review Queue</h1>
            <p className="text-gray-400 mt-1">{total} flagged image{total === 1 ? '' : 's'} need a decision</p>
          </div>
          <Link to="/search" className="text-sm text-gray-400 hover:text-white transition-colors">← Search</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Nothing to review</h3>
            <p className="text-gray-400">Images the models disagree on will appear here after you analyze them.</p>
            <Link to="/analyze" className="inline-block mt-4 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30">
              Analyze an image
            </Link>
          </div>
        ) : (
          items.map((r) => (
            <div key={r._id} className="glass rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
              <img src={imageUrl(r.image_url)} alt={r.image_id} className="w-full sm:w-48 h-40 object-cover rounded-xl bg-black/20" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold">{r.image_id}</h3>
                <p className="text-gray-400 text-sm mt-1">{r.caption}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  {Object.entries(r.votes || {}).map(([model, vote]) => (
                    <span key={model} className="px-2 py-1 bg-white/5 rounded-lg text-gray-300">
                      {model.toUpperCase()}: <span className="capitalize">{vote || '—'}</span>
                    </span>
                  ))}
                  {r.vlm && (
                    <span className="px-2 py-1 bg-purple-500/10 rounded-lg text-purple-300">
                      VLM: <span className="capitalize">{r.vlm.species}</span> ({Math.round(r.vlm.confidence * 100)}%)
                    </span>
                  )}
                </div>
                {r.vlm?.notes && <p className="text-xs text-gray-500 mt-2">{r.vlm.notes}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  {['neem', 'tulasi', 'other'].map((label) => (
                    <button
                      key={label}
                      disabled={busy === r._id}
                      onClick={() => decide(r._id, label)}
                      className="px-4 py-2 text-sm font-medium rounded-xl capitalize bg-white/5 border border-white/10 text-gray-200 hover:bg-purple-500/30 hover:text-white disabled:opacity-50 transition-all"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}

export default Review
