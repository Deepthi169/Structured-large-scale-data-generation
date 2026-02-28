import React from 'react'

const SearchResultCard = ({ data }) => {
  const statusStyles = {
    Ready: 'bg-green-500/20 text-green-400 border-green-500/30',
    Processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  return (
    <div className="group glass rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                {data.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[data.status]}`}>
                  {data.status}
                </span>
                <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  {data.domain}
                </span>
                <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                  {data.dataType}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {data.description}
          </p>

          {/* Compatible Models */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Compatible with:</span>
            {data.models.map((model, idx) => (
              <span key={idx} className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded-lg">
                {model}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-row lg:flex-col justify-between lg:justify-start gap-4 lg:min-w-[140px] lg:text-right">
          <div>
            <p className="text-lg font-bold text-white">{data.size}</p>
            <p className="text-xs text-gray-500">Dataset Size</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{data.records}</p>
            <p className="text-xs text-gray-500">Records</p>
          </div>
          <div>
            <div className="flex items-center lg:justify-end gap-2">
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  style={{ width: `${data.quality}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold text-green-400">{data.quality}%</span>
            </div>
            <p className="text-xs text-gray-500">Quality Score</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {data.downloads.toLocaleString()} downloads
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-sm font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all">
            Preview
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20">
            Use Dataset
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchResultCard