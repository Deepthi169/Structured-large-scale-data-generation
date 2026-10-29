import React from 'react'
import { imageUrl } from '../../api'

const statusStyles = {
  Imported: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  Flagged: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Reviewed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const pct = (v) => (v == null ? '—' : `${Math.round(v * 100)}%`)

const SearchResultCard = ({ data }) => {
  const q = data.quality_metrics || {}

  return (
    <div className="group glass rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Thumbnail */}
        <div className="w-full sm:w-40 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-black/20">
          {data.image_url ? (
            <img src={imageUrl(data.image_url)} alt={data.image_id} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No preview</div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mr-2">
              {data.image_id}
            </h3>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[data.status] || ''}`}>
              {data.status}
            </span>
            {data.label && (
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full capitalize">{data.label}</span>
            )}
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full capitalize">{data.source}</span>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-2">{data.caption || 'No caption'}</p>
          {data.vlm && (
            <p className="text-xs text-purple-300/80 mb-4">
              VLM: <span className="capitalize">{data.vlm.species}</span>, {data.vlm.leaf_condition} leaves
              {data.adjudicated && ' · confirmed by VLM'}
            </p>
          )}
          {!data.vlm && <div className="mb-2" />}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Metric label="Sharpness" value={q.blur_score} />
            <Metric label="Brightness" value={q.brightness} />
            <Metric label="Contrast" value={q.contrast} />
            {data.source === 'upload' ? (
              <Metric label="YOLO / CLIP" value={`${pct(data.yolo_confidence)} / ${pct(data.clip_confidence)}`} />
            ) : (
              <Metric label="Objects" value={data.object_count} />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10 text-sm text-gray-500">
        <span>
          {data.created_at
            ? new Date(data.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
            : ''}
        </span>
        {data.agreement_ratio && <span>Model agreement {data.agreement_ratio}</span>}
      </div>
    </div>
  )
}

const Metric = ({ label, value }) => (
  <div>
    <p className="text-white font-semibold">{value ?? '—'}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
)

export default SearchResultCard
