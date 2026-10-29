import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatsCard from './StatsCard'
import { getJson, imageUrl } from '../../api'

const icon = (d) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
)

const ICONS = {
  images: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  upload: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  flag: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
}

// Real models used by the pipeline. Accuracy is the final-epoch validation top-1
// from the training run (results.csv); CLIP and BLIP are used as pretrained.
const models = [
  { name: 'YOLOv8 classifier', role: 'Neem vs tulasi classification', detail: '98.9% validation accuracy (25 epochs)' },
  { name: 'CLIP ViT-B/32', role: 'Zero-shot vote and image embeddings', detail: 'Pretrained (OpenAI)' },
  { name: 'BLIP base', role: 'Captioning and caption-based vote', detail: 'Pretrained (Salesforce)' },
]

const statusColors = {
  Imported: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
  Flagged: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

const barColors = ['from-purple-500 to-purple-600', 'from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-orange-500 to-orange-600']

const Distribution = ({ title, counts, total }) => (
  <div>
    <p className="text-sm font-semibold text-slate-300 mb-3">{title}</p>
    <div className="space-y-3">
      {Object.entries(counts).map(([name, count], i) => (
        <div key={name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 capitalize">{name}</span>
            <span className="text-slate-500">{count}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${barColors[i % barColors.length]} rounded-full`}
              style={{ width: `${total ? (count / total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const timeAgo = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getJson('/stats').then(setStats).catch((e) => setError(e.message || 'Could not reach the backend'))
  }, [])

  const cards = stats && [
    { title: 'Total Images', value: stats.total, subtitle: 'In the structured dataset', icon: icon(ICONS.images), color: 'purple' },
    { title: 'Uploaded & Analysed', value: stats.by_source.upload || 0, subtitle: 'Run through the consensus pipeline', icon: icon(ICONS.upload), color: 'blue' },
    { title: 'Accepted', value: stats.by_status.Accepted || 0, subtitle: 'Models agreed with high confidence', icon: icon(ICONS.check), color: 'green' },
    { title: 'Flagged for Review', value: stats.by_status.Flagged || 0, subtitle: 'Low agreement or confidence', icon: icon(ICONS.flag), color: 'orange' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 relative selection:bg-purple-500/30">
      {/* Background Ambience (Same as Auth Pages) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-slate-400 text-xs">Overview & Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/search" className="text-slate-400 hover:text-white transition-colors">Search</Link>
              <Link
                to="/analyze"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all"
              >
                Analyze an image
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {error && (
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-red-400">
              Couldn't load dashboard data: {error}
            </div>
          )}

          {!stats && !error && <p className="text-slate-400">Loading…</p>}

          {stats && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                  <StatsCard key={card.title} {...card} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-white">Dataset Breakdown</h2>
                    <p className="text-sm text-slate-400">
                      Average quality: sharpness {stats.avg_quality.blur}, brightness {stats.avg_quality.brightness}, contrast {stats.avg_quality.contrast}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <Distribution title="By plant" counts={stats.by_label} total={stats.total} />
                    <Distribution title="By status" counts={stats.by_status} total={stats.total} />
                    <Distribution title="By source" counts={stats.by_source} total={stats.total} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Recent Images</h2>
                    <Link to="/search" className="text-sm text-slate-400 hover:text-white transition-colors">View all</Link>
                  </div>
                  <div className="space-y-4">
                    {stats.recent.map((r) => (
                      <div key={r._id} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                          {r.image_url && <img src={imageUrl(r.image_url)} alt="" className="w-full h-full object-cover" loading="lazy" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{r.image_id}</p>
                          <p className="text-xs text-slate-500 truncate">{r.caption}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColors[r.status] || ''}`}>{r.status}</span>
                          <p className="text-xs text-slate-600 mt-1">{timeAgo(r.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Pipeline Models</h2>
                  <p className="text-sm text-slate-400">The three models that vote on every analysed image</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {models.map((m) => (
                    <div key={m.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                      <h3 className="text-lg font-bold text-white">{m.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{m.role}</p>
                      <p className="text-sm text-purple-300 mt-4">{m.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
