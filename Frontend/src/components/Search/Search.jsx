import React, { useState } from 'react'
import SearchResultCard from './SearchResultCard'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState([])
  const [filters, setFilters] = useState({
    domain: 'all',
    dataType: 'all',
    status: 'all',
    dateRange: 'all',
  })

  // Sample data
  const sampleDatasets = [
    {
      id: 1,
      title: 'Medical Research Dataset',
      description: 'High-quality medical Q&A dataset curated from research papers, clinical documents, and healthcare records for medical AI training.',
      domain: 'Healthcare',
      dataType: 'Text',
      size: '2.4 GB',
      records: '1.2M',
      quality: 98,
      status: 'Ready',
      createdAt: '2024-01-15',
      models: ['GPT-4', 'BERT', 'LLaMA-2'],
      downloads: 1234,
    },
    {
      id: 2,
      title: 'Legal Documents Corpus',
      description: 'Comprehensive collection of structured legal documents including contracts, agreements, case studies, and legal opinions.',
      domain: 'Legal',
      dataType: 'Text',
      size: '5.1 GB',
      records: '850K',
      quality: 95,
      status: 'Ready',
      createdAt: '2024-01-12',
      models: ['GPT-4', 'Claude'],
      downloads: 856,
    },
    {
      id: 3,
      title: 'E-commerce Product Reviews',
      description: 'Sentiment-labeled product reviews from multiple e-commerce platforms with rating predictions and category classifications.',
      domain: 'E-commerce',
      dataType: 'JSON',
      size: '1.8 GB',
      records: '3.5M',
      quality: 92,
      status: 'Processing',
      createdAt: '2024-01-10',
      models: ['BERT', 'RoBERTa'],
      downloads: 2341,
    },
    {
      id: 4,
      title: 'Scientific Paper Abstracts',
      description: 'Curated abstracts from top scientific journals across physics, chemistry, biology, and computer science disciplines.',
      domain: 'Research',
      dataType: 'Text',
      size: '890 MB',
      records: '500K',
      quality: 99,
      status: 'Ready',
      createdAt: '2024-01-08',
      models: ['SciBERT', 'GPT-4'],
      downloads: 567,
    },
    {
      id: 5,
      title: 'Financial News Dataset',
      description: 'Real-time financial news articles with sentiment analysis, entity recognition, and market impact scores.',
      domain: 'Finance',
      dataType: 'CSV',
      size: '3.2 GB',
      records: '2.1M',
      quality: 94,
      status: 'Ready',
      createdAt: '2024-01-05',
      models: ['FinBERT', 'GPT-4'],
      downloads: 1892,
    },
  ]

  const domains = ['All', 'Healthcare', 'Legal', 'E-commerce', 'Research', 'Finance', 'Technology']
  const dataTypes = ['All', 'Text', 'JSON', 'CSV', 'Structured']
  const statuses = ['All', 'Ready', 'Processing', 'Pending']
  const dateRanges = ['All Time', 'Today', 'This Week', 'This Month', 'This Year']

  const handleSearch = (e) => {
    e.preventDefault()
    setIsSearching(true)
    
    setTimeout(() => {
      const filtered = sampleDatasets.filter(dataset => {
        const matchesQuery = searchQuery === '' || 
          dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dataset.domain.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesDomain = filters.domain === 'all' || 
          dataset.domain.toLowerCase() === filters.domain.toLowerCase()
        
        const matchesType = filters.dataType === 'all' || 
          dataset.dataType.toLowerCase() === filters.dataType.toLowerCase()
        
        const matchesStatus = filters.status === 'all' || 
          dataset.status.toLowerCase() === filters.status.toLowerCase()
        
        return matchesQuery && matchesDomain && matchesType && matchesStatus
      })
      
      setResults(filtered)
      setIsSearching(false)
    }, 800)
  }

  const clearFilters = () => {
    setFilters({
      domain: 'all',
      dataType: 'all',
      status: 'all',
      dateRange: 'all',
    })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== 'all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                Search Datasets
              </h1>
              <p className="text-gray-400 mt-1">Find and explore curated datasets for LLM training</p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 lg:gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">1,234</p>
                <p className="text-xs text-gray-400">Datasets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">45 TB</p>
                <p className="text-xs text-gray-400">Total Data</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">98%</p>
                <p className="text-xs text-gray-400">Avg Quality</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-40 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Search by name, domain, or description..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl transition-all ${showFilters ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50"
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass rounded-2xl p-6 mb-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Domain Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  {domains.map(d => (
                    <option key={d} value={d.toLowerCase()} className="bg-slate-800">{d}</option>
                  ))}
                </select>
              </div>

              {/* Data Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data Type</label>
                <select
                  value={filters.dataType}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataType: e.target.value }))}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  {dataTypes.map(t => (
                    <option key={t} value={t.toLowerCase()} className="bg-slate-800">{t}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  {statuses.map(s => (
                    <option key={s} value={s.toLowerCase()} className="bg-slate-800">{s}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  {dateRanges.map(r => (
                    <option key={r} value={r.toLowerCase().replace(' ', '-')} className="bg-slate-800">{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <span className="text-sm text-gray-400">Active:</span>
                {Object.entries(filters).map(([key, value]) => (
                  value !== 'all' && (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full"
                    >
                      {value}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, [key]: 'all' }))}
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  )
                ))}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Searching datasets...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                Found <span className="text-white font-semibold">{results.length}</span> datasets
              </p>
              <select className="py-2 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option className="bg-slate-800">Sort by: Relevance</option>
                <option className="bg-slate-800">Sort by: Date (Newest)</option>
                <option className="bg-slate-800">Sort by: Quality Score</option>
                <option className="bg-slate-800">Sort by: Downloads</option>
              </select>
            </div>

            <div className="space-y-4">
              {results.map(dataset => (
                <SearchResultCard key={dataset.id} data={dataset} />
              ))}
            </div>
          </>
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400 text-center max-w-md">
              We couldn't find any datasets matching "{searchQuery}". Try different keywords or adjust your filters.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start your search</h3>
            <p className="text-gray-400 text-center max-w-md">
              Enter a search term or use filters to find the perfect datasets for your LLM training needs.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                handleSearch({ preventDefault: () => {} })
              }}
              className="mt-6 px-6 py-3 bg-purple-500/20 text-purple-300 font-medium rounded-xl hover:bg-purple-500/30 transition-all"
            >
              Browse All Datasets
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Search