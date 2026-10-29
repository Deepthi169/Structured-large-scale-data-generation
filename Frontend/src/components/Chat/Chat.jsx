import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL, imageUrl } from '../../api'

const examples = [
  'How many images are in the dataset?',
  'Show the sharpest flagged images',
  'Which of my uploads were accepted?',
]

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me about the plant-image dataset: counts, flagged images, sharpest photos and more.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const message = text.trim()
    if (!message || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: message }])
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Request failed')
      setMessages((m) => [...m, { role: 'assistant', text: data.answer, items: data.items }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: `Sorry, that failed: ${err.message}`, error: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ask the Dataset</h1>
            <p className="text-gray-400 text-sm">Natural-language search powered by a hosted LLM</p>
          </div>
          <Link to="/search" className="text-sm text-gray-400 hover:text-white transition-colors">← Search</Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : m.error
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                  : 'glass text-gray-200'
              }`}
            >
              {m.text}
              {m.items && m.items.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                  {m.items.map((it) => (
                    <div key={it._id} className="rounded-lg overflow-hidden bg-black/20" title={it.caption}>
                      {it.image_url && <img src={imageUrl(it.image_url)} alt={it.image_id} className="w-full h-16 object-cover" />}
                      <p className="text-[10px] text-gray-400 px-1 py-0.5 truncate">{it.image_id}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500">Thinking…</p>}
        <div ref={bottomRef} />
      </main>

      <footer className="max-w-3xl w-full mx-auto px-4 pb-6">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {examples.map((e) => (
              <button key={e} onClick={() => send(e)} className="px-3 py-1.5 text-xs bg-purple-500/20 text-purple-300 rounded-full hover:bg-purple-500/30">
                {e}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the images…"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  )
}

export default Chat
