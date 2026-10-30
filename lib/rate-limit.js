// Per serverless instance (in memory); enough to stop bulk password guessing from one source.
const attempts = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5

export function clientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'
}

export function isBlocked(key) {
  const entry = attempts.get(key)
  if (!entry) return false
  if (Date.now() - entry.first > WINDOW_MS) { attempts.delete(key); return false }
  return entry.count >= MAX_FAILURES
}

export function recordFailure(key) {
  const entry = attempts.get(key)
  if (!entry || Date.now() - entry.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() })
  else entry.count += 1
}

export const clearFailures = key => attempts.delete(key)
