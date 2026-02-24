/**
 * Persist analysis history in localStorage.
 * Key: placement-readiness-history
 * Value: array of analysis entries.
 */

const STORAGE_KEY = 'placement-readiness-history'

function loadRaw() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return []
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRaw(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    return true
  } catch {
    return false
  }
}

export function saveAnalysis(entry) {
  const list = loadRaw()
  const id = entry.id || `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const withId = { ...entry, id, createdAt: entry.createdAt || new Date().toISOString() }
  list.unshift(withId)
  saveRaw(list)
  return withId
}

export function getHistory() {
  return loadRaw()
}

export function getAnalysisById(id) {
  const list = loadRaw()
  return list.find((e) => e.id === id) || null
}

export function getLatestAnalysis() {
  const list = loadRaw()
  return list.length > 0 ? list[0] : null
}

/**
 * Update an existing history entry by id. Merges updates into the entry and saves.
 * Used to persist skillConfidenceMap and live readinessScore.
 */
export function updateAnalysisById(id, updates) {
  const list = loadRaw()
  const index = list.findIndex((e) => e.id === id)
  if (index === -1) return null
  const updated = { ...list[index], ...updates }
  list[index] = updated
  saveRaw(list)
  return updated
}
