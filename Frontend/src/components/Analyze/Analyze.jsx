import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../../api'

const statusStyles = {
  ACCEPT: 'bg-green-500/20 text-green-400 border-green-500/30',
  FLAG_FOR_REVIEW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

const Analyze = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const f = e.target.files[0]
    setFile(f || null)
    setResult(null)
    setError('')
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(`${API_URL}/analyze-agentic`, { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not reach the backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Analyze Plant Image</h1>
            <p className="text-gray-400 mt-1">YOLO + CLIP + BLIP consensus with adaptive enhancement</p>
          </div>
          <Link to="/search" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to search
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30"
          />
          {preview && (
            <img src={preview} alt="Selected" className="mt-4 rounded-xl max-h-80 w-full object-contain bg-black/20" />
          )}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>

        <div className="glass rounded-2xl p-6">
          {!result ? (
            <p className="text-gray-400">Upload an image and run the analysis to see results.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusStyles[result.status]}`}>
                  {result.status === 'ACCEPT' ? 'Accepted' : 'Flagged for review'}
                </span>
                <span className="text-2xl font-bold text-white capitalize">{result.consensus_label || 'Unknown'}</span>
                <span className="text-sm text-gray-400">agreement {result.agreement_ratio}</span>
              </div>

              {!result.yolo_classifier_loaded && (
                <p className="text-sm text-yellow-400">
                  The trained YOLO classifier isn't loaded on the backend, so YOLO did not vote and results will be flagged.
                </p>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">Model votes</p>
                <div className="grid grid-cols-3 gap-3">
                  {['yolo', 'clip', 'blip'].map((m) => (
                    <div key={m} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 uppercase">{m}</p>
                      <p className="text-white capitalize">{result.votes[m] || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="YOLO confidence" value={result.yolo_confidence} />
                <Stat label="CLIP confidence" value={result.clip_confidence} />
                <Stat label="Blur score" value={result.quality_metrics.blur_score} />
                <Stat label="Brightness" value={result.quality_metrics.brightness} />
                <Stat label="Contrast" value={result.quality_metrics.contrast} />
                <Stat label="Enhancement retries" value={result.retry_count} />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">BLIP caption</p>
                <p className="text-gray-300">{result.caption}</p>
              </div>
              <p className="text-xs text-gray-500">Processed in {result.latency_seconds}s</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const Stat = ({ label, value }) => (
  <div className="bg-white/5 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-white font-semibold">{value}</p>
  </div>
)

export default Analyze
