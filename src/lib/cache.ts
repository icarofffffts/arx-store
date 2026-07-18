const store = new Map<string, { data: unknown; expires: number }>()

export function cacheSet(key: string, data: unknown, ttlSeconds = 60) {
  store.set(key, { data, expires: Date.now() + ttlSeconds * 1000 })
}

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function cacheInvalidate(pattern?: string) {
  if (!pattern) {
    store.clear()
    return
  }
  for (const key of Array.from(store.keys())) {
    if (key.includes(pattern)) store.delete(key)
  }
}

export function cacheStats() {
  return { size: store.size, keys: Array.from(store.keys()) }
}