import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SearchResultCard from './SearchResultCard'
import { getJson } from '../../api'

const PAGE_SIZE = 20

const filterOptions = {
  label: { title: 'Plant', options: [['', 'All'], ['neem', 'Neem'], ['tulasi', 'Tulasi']] },
  source: { title: 'Source', options: [['', 'All'], ['dataset', 'Dataset'], ['upload', 'Uploaded']] },
  status: { title: 'Status', options: [['', 'All'], ['Imported', 'Imported'], ['Accepted', 'Accepted'], ['Flagged', 'Flagged']] },
}

const sortOptions = [
  ['newest', 'Sort by: Newest'],
  ['sharpest', 'Sort by: Sharpness'],
  ['confidence', 'Sort by: YOLO confidence'],
]

const selectClass =
  'w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ label: '', source: '', status: '' })
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(0)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState(null)
  const [isSearching, setIsSearching] = useState(true)
  const [error, setError] = useState('')

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const runSearch = useCallback(async () => {
    setIsSearching(true)
    setError('')
    try {
      const params = { q: submittedQuery, sort, limit: PAGE_SIZE, skip: page * PAGE_SIZE }
      Object.entries(filters).forEach(([k, v]) => v && (params[k] = v))
      const data = await getJson('/records', params)
      setResults(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err.message || 'Could not reach the backend')
      setResults([])
      setTotal(0)
    } finally {
      setIsSearching(false)
    }
  }, [submittedQuery, filters, sort, page])

  useEffect(() => {
    runSearch()
  }, [runSearch])

  useEffect(() => {
    getJson('/stats').then(setStats).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setSubmittedQuery(searchQuery.trim())
  }

  const updateFilter = (key, value) => {
    setPage(0)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setPage(0)
    setFilters({ label: '', source: '', status: '' })
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
                Search Images
              </h1>
              <p className="text-gray-400 mt-1">Browse the structured medicinal-plant image dataset</p>
            </div>

            <div className="flex items-center gap-6 lg:gap-8">
              <Link
                to="/analyze"
                className="px-4 py-2 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-xl hover:bg-purple-500/30 transition-all"
              >
                Analyze an image
              </Link>
              <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats ? stats.total : '—'}</p>
                <p className="text-xs text-gray-400">Images</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{stats ? stats.by_source.upload || 0 : '—'}</p>
                <p className="text-xs text-gray-400">Uploaded</p>
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
              placeholder="Search by file name, caption or plant..."
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
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass rounded-2xl p-6 mb-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(filterOptions).map(([key, { title, options }]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{title}</label>
                  <select value={filters[key]} onChange={(e) => updateFilter(key, e.target.value)} className={selectClass}>
                    {options.map(([value, text]) => (
                      <option key={value} value={value} className="bg-slate-800">{text}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <span className="text-sm text-gray-400">Active:</span>
                {Object.entries(filters).map(([key, value]) =>
                  value ? (
                    <span key={key} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                      {value}
                      <button onClick={() => updateFilter(key, '')} className="ml-1 hover:text-white">×</button>
                    </span>
                  ) : null
                )}
                <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white transition-colors ml-2">
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {error ? (
          <div className="glass rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Couldn't load results</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : isSearching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                Found <span className="text-white font-semibold">{total}</span> images
              </p>
              <select
                value={sort}
                onChange={(e) => { setPage(0); setSort(e.target.value) }}
                className="py-2 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(([value, text]) => (
                  <option key={value} value={value} className="bg-slate-800">{text}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {results.map((record) => (
                <SearchResultCard key={record._id} data={record} />
              ))}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">Page {page + 1} of {pageCount}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page + 1 >= pageCount}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400 text-center max-w-md">
              Nothing matched{submittedQuery ? ` "${submittedQuery}"` : ' these filters'}. Try different keywords or clear the filters.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Search
