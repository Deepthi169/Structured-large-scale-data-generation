export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const imageUrl = (path) => (path ? `${API_URL}${path}` : null)

export async function getJson(path, params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`${API_URL}${path}${qs}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`)
  return data
}
