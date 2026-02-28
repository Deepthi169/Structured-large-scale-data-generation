import React from 'react'

const PerformanceChart = () => {
  const models = [
    { name: 'GPT-4 Fine-tuned', accuracy: 96.5, f1: 94.2, color: 'from-purple-500 to-purple-600' },
    { name: 'LLaMA-2 7B', accuracy: 92.8, f1: 91.5, color: 'from-blue-500 to-blue-600' },
    { name: 'BERT-Large', accuracy: 89.3, f1: 87.1, color: 'from-green-500 to-green-600' },
    { name: 'T5-Base', accuracy: 88.1, f1: 86.4, color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Chart Bars */}
      <div className="space-y-5">
        {models.map((model, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                {model.name}
              </span>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-slate-500">
                  Acc: <span className="text-slate-300 ml-1">{model.accuracy}%</span>
                </span>
                <span className="text-slate-500">
                  F1: <span className="text-slate-300 ml-1">{model.f1}%</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Accuracy Bar */}
              <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${model.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                  style={{ width: `${model.accuracy}%` }}
                ></div>
              </div>
              {/* F1 Score Bar */}
              <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${model.color} opacity-50 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${model.f1}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow shadow-purple-500/50"></div>
          <span className="text-xs font-medium text-slate-400">Accuracy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 opacity-50 rounded-full"></div>
          <span className="text-xs font-medium text-slate-400">F1 Score</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <p className="text-2xl font-bold text-white">96.5%</p>
          <p className="text-xs text-purple-400 font-medium mt-1 uppercase tracking-wide">Best Acc</p>
        </div>
        <div className="text-center p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <p className="text-2xl font-bold text-white">91.7%</p>
          <p className="text-xs text-blue-400 font-medium mt-1 uppercase tracking-wide">Avg Acc</p>
        </div>
        <div className="text-center p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <p className="text-2xl font-bold text-white">89.8%</p>
          <p className="text-xs text-green-400 font-medium mt-1 uppercase tracking-wide">Avg F1</p>
        </div>
      </div>
    </div>
  )
}

export default PerformanceChart