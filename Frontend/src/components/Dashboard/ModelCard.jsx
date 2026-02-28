import React from 'react'

const ModelCard = ({ name, status, accuracy, f1Score, latency, trainedOn, lastTrained, progress }) => {
  const statusConfig = {
    Completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    Training: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    Queued: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    Failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  }

  const config = statusConfig[status] || statusConfig.Queued

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">{name}</h3>
          <p className="text-sm text-slate-400 mt-0.5">Dataset: {trainedOn}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
          {status}
        </span>
      </div>

      {/* Training Progress */}
      {status === 'Training' && progress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Training Progress</span>
            <span className="text-blue-400 font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Metrics */}
      {status === 'Completed' && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
            <p className="text-lg font-bold text-white">{accuracy}%</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Accuracy</p>
          </div>
          <div className="text-center p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
            <p className="text-lg font-bold text-white">{f1Score}%</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">F1 Score</p>
          </div>
          <div className="text-center p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
            <p className="text-lg font-bold text-white">{latency}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Latency</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <span className="text-xs font-medium text-slate-500">{lastTrained}</span>
        <div className="flex items-center gap-2">
          {status === 'Completed' && (
            <>
              <button className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            </>
          )}
          <button className="px-4 py-2 bg-slate-800 text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-700 transition-all border border-slate-700">
            {status === 'Completed' ? 'View Details' : status === 'Training' ? 'View Logs' : 'Configure'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModelCard