import React from 'react'

const StatsCard = ({ title, value, change, trend, icon, color }) => {
  const colorConfig = {
    purple: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      hover: 'group-hover:border-purple-500/50',
    },
    blue: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      hover: 'group-hover:border-blue-500/50',
    },
    green: {
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      hover: 'group-hover:border-green-500/50',
    },
    orange: {
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      hover: 'group-hover:border-orange-500/50',
    },
  }

  const config = colorConfig[color]

  return (
    <div className={`group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${config.hover}`}>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${config.bg} ${config.text} border ${config.border} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center text-sm font-semibold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          {change}
        </span>
        <span className="text-slate-500 text-sm">vs last period</span>
      </div>
    </div>
  )
}

export default StatsCard