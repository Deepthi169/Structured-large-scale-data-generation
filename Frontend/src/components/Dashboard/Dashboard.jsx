import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import StatsCard from './StatsCard'
import ModelCard from './ModelCard'
import PerformanceChart from './PerformanceChart'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  const stats = [
    {
      title: 'Total Datasets',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Models Trained',
      value: '56',
      change: '+8.2%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Avg. Quality Score',
      value: '94.8%',
      change: '+2.1%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Data Processed',
      value: '45.2 TB',
      change: '+18.7%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: 'orange',
    },
  ]

  const models = [
    {
      name: 'GPT-4 Fine-tuned',
      status: 'Completed',
      accuracy: 96.5,
      f1Score: 94.2,
      latency: '120ms',
      trainedOn: 'Medical Dataset',
      lastTrained: '2 hours ago',
    },
    {
      name: 'BERT-Large',
      status: 'Training',
      accuracy: 89.3,
      f1Score: 87.1,
      latency: '45ms',
      trainedOn: 'Legal Corpus',
      lastTrained: 'In progress',
      progress: 67,
    },
    {
      name: 'LLaMA-2 7B',
      status: 'Completed',
      accuracy: 92.8,
      f1Score: 91.5,
      latency: '85ms',
      trainedOn: 'Multi-domain',
      lastTrained: '1 day ago',
    },
    {
      name: 'Claude Adapter',
      status: 'Queued',
      accuracy: null,
      f1Score: null,
      latency: null,
      trainedOn: 'Scientific Papers',
      lastTrained: 'Pending',
    },
  ]

  const recentActivity = [
    { action: 'Dataset uploaded', item: 'Healthcare Q&A v2.1', time: '5 min ago', type: 'upload' },
    { action: 'Model training completed', item: 'GPT-4 Fine-tuned', time: '2 hours ago', type: 'success' },
    { action: 'New dataset created', item: 'Legal Documents', time: '4 hours ago', type: 'create' },
    { action: 'Model evaluation started', item: 'BERT-Large', time: '5 hours ago', type: 'process' },
    { action: 'Data cleaning completed', item: 'E-commerce Reviews', time: '1 day ago', type: 'success' },
  ]

  const activityIcons = {
    upload: { icon: '↑', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    success: { icon: '✓', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    create: { icon: '+', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    process: { icon: '⟳', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  }

  return (
    <div className="min-h-screen bg-slate-950 relative selection:bg-purple-500/30">
      
      {/* Background Ambience (Same as Auth Pages) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

              {/* Period Selector */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                {['24h', '7d', '30d', '90d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      selectedPeriod === period
                        ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Model Performance</h2>
                  <p className="text-sm text-slate-400">Comparing accuracy & F1 scores</p>
                </div>
                <Link to="/search" className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
                  View Report →
                </Link>
              </div>
              <PerformanceChart />
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                <button className="text-sm text-slate-400 hover:text-white transition-colors">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const config = activityIcons[activity.type]
                  return (
                    <div key={index} className="flex items-start gap-4 group">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.text} border ${config.border} flex items-center justify-center flex-shrink-0 text-sm font-bold transition-transform group-hover:scale-110`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors truncate">{activity.action}</p>
                        <p className="text-xs text-slate-500 truncate">{activity.item}</p>
                      </div>
                      <span className="text-xs text-slate-600 flex-shrink-0 pt-1">{activity.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Active Models</h2>
                <p className="text-sm text-slate-400">Monitor your fine-tuning jobs</p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40">
                + New Training
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {models.map((model, index) => (
                <ModelCard key={index} {...model} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link to="/search" className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-1">Upload Dataset</h3>
              <p className="text-sm text-slate-400">Import raw data for processing</p>
            </Link>

            <button className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-1">Start Training</h3>
              <p className="text-sm text-slate-400">Fine-tune a new model</p>
            </button>

            <button className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-1">Compare Models</h3>
              <p className="text-sm text-slate-400">Benchmark performance metrics</p>
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard