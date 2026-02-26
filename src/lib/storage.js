/**
 * Persist analysis history in localStorage.
 * Key: placement-readiness-history
 * Value: array of analysis entries (normalized to canonical schema).
 */

import { normalizeEntry, validateEntry } from './schema'

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
  const withId = { ...entry, id: entry.id || `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` }
  const normalized = normalizeEntry(withId)
  if (!normalized || !validateEntry(normalized)) return null
  normalized.updatedAt = new Date().toISOString()
  list.unshift(normalized)
  saveRaw(list)
  return normalized
}

/** @returns {{ entries: object[], skippedCount: number }} */
export function getHistory() {
  const raw = loadRaw()
  const entries = []
  let skippedCount = 0
  for (const e of raw) {
    try {
      const normalized = normalizeEntry(e)
      if (normalized && validateEntry(normalized)) {
        entries.push(normalized)
      } else {
        skippedCount += 1
      }
    } catch {
      skippedCount += 1
    }
  }
  return { entries, skippedCount }
}

export function getAnalysisById(id) {
  const raw = loadRaw()
  const found = raw.find((e) => e.id === id)
  if (!found) return null
  const normalized = normalizeEntry(found)
  return normalized && validateEntry(normalized) ? normalized : null
}

export function getLatestAnalysis() {
  const raw = loadRaw()
  for (const e of raw) {
    try {
      const normalized = normalizeEntry(e)
      if (normalized && validateEntry(normalized)) return normalized
    } catch {
      continue
    }
  }
  return null
}

/**
 * Update an existing history entry by id. Merges updates (e.g. skillConfidenceMap, finalScore), sets updatedAt, normalizes and saves.
 */
export function updateAnalysisById(id, updates) {
  const list = loadRaw()
  const index = list.findIndex((e) => e.id === id)
  if (index === -1) return null
  const updated = { ...list[index], ...updates, updatedAt: new Date().toISOString() }
  const normalized = normalizeEntry(updated)
  if (!normalized || !validateEntry(normalized)) return null
  list[index] = normalized
  saveRaw(list)
  return normalized
}
