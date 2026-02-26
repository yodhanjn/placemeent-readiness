/**
 * Built-in test checklist for Placement Readiness Platform.
 * Stored in localStorage; ship route is locked until all 10 tests are passed.
 */

const STORAGE_KEY = 'placement-readiness-test-checklist'

export const TEST_IDS = [
  't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10',
]

const DEFAULT_STATE = Object.fromEntries(TEST_IDS.map((id) => [id, false]))

function loadRaw() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(s)
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_STATE }
    const out = { ...DEFAULT_STATE }
    for (const id of TEST_IDS) {
      if (parsed[id] === true) out[id] = true
    }
    return out
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function saveRaw(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** @returns {Record<string, boolean>} */
export function getTestChecklist() {
  return loadRaw()
}

/**
 * @param {string} id - test id (t1..t10)
 * @param {boolean} checked
 */
export function setTestItem(id, checked) {
  const state = loadRaw()
  if (!TEST_IDS.includes(id)) return false
  state[id] = !!checked
  return saveRaw(state)
}

/** Toggle a single test; returns new state. */
export function toggleTestItem(id) {
  const state = loadRaw()
  if (!TEST_IDS.includes(id)) return state
  state[id] = !state[id]
  saveRaw(state)
  return state
}

/** Reset all items to unchecked. */
export function resetTestChecklist() {
  return saveRaw({ ...DEFAULT_STATE })
}

export function allTestsPassed() {
  const state = loadRaw()
  return TEST_IDS.every((id) => state[id] === true)
}

export function testsPassedCount() {
  const state = loadRaw()
  return TEST_IDS.filter((id) => state[id] === true).length
}
