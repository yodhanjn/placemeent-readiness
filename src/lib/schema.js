/**
 * Canonical analysis entry schema, validation, and normalization.
 * Every saved history entry MUST have these fields (even if empty):
 *
 *   id: string
 *   createdAt: string (ISO)
 *   company: string | ""
 *   role: string | ""
 *   jdText: string
 *   extractedSkills: { coreCS, languages, web, data, cloud, testing, other } (each string[])
 *   roundMapping: [{ roundTitle, focusAreas[], whyItMatters }]
 *   checklist: [{ roundTitle, items[] }]
 *   plan7Days: [{ day, focus, tasks[] }]
 *   questions: string[]
 *   baseScore: number
 *   skillConfidenceMap: { [skill]: "know" | "practice" }
 *   finalScore: number
 *   updatedAt: string (ISO)
 */

export const JD_MIN_LENGTH_WARNING = 200
export const DEFAULT_OTHER_SKILLS = [
  'Communication',
  'Problem solving',
  'Basic coding',
  'Projects',
]

const EMPTY_EXTRACTED = {
  coreCS: [],
  languages: [],
  web: [],
  data: [],
  cloud: [],
  testing: [],
  other: [],
}

const CATEGORY_TO_KEY = {
  'Core CS': 'coreCS',
  'Languages': 'languages',
  'Web': 'web',
  'Data': 'data',
  'Cloud/DevOps': 'cloud',
  'Testing': 'testing',
}

const CANONICAL_KEYS = ['coreCS', 'languages', 'web', 'data', 'cloud', 'testing', 'other']

/**
 * Convert legacy categories object to canonical extractedSkills.
 * Accepts either legacy { categories: { 'Core CS': [...] } } or already canonical { coreCS: [], languages: [], ... }.
 */
export function toCanonicalExtractedSkills(categoriesOrLegacy, hasAny = true) {
  const out = { ...EMPTY_EXTRACTED }
  if (!categoriesOrLegacy || typeof categoriesOrLegacy !== 'object') {
    if (!hasAny) out.other = [...DEFAULT_OTHER_SKILLS]
    return out
  }
  // Already canonical (e.g. from runFullAnalysis or saved entry)
  if (CANONICAL_KEYS.some((k) => Array.isArray(categoriesOrLegacy[k]))) {
    for (const k of CANONICAL_KEYS) {
      if (Array.isArray(categoriesOrLegacy[k])) out[k] = [...categoriesOrLegacy[k]]
    }
    if (!hasAny && out.other.length === 0) out.other = [...DEFAULT_OTHER_SKILLS]
    return out
  }
  // Legacy: { categories: { 'Core CS': [...], ... } }
  const categories = categoriesOrLegacy.categories || categoriesOrLegacy
  for (const [cat, arr] of Object.entries(categories)) {
    const key = CATEGORY_TO_KEY[cat] || 'other'
    if (Array.isArray(arr) && key in out) {
      out[key] = [...arr]
    }
  }
  if (!hasAny && out.other.length === 0) {
    out.other = [...DEFAULT_OTHER_SKILLS]
  }
  return out
}

export function toCanonicalRoundMapping(roundMapping) {
  if (!Array.isArray(roundMapping)) return []
  return roundMapping.map((r) => ({
    roundTitle: r.roundTitle ?? r.name ?? '',
    focusAreas: Array.isArray(r.focusAreas) ? r.focusAreas : [],
    whyItMatters: r.whyItMatters ?? r.whyMatters ?? '',
  }))
}

export function toCanonicalChecklist(checklist) {
  if (!Array.isArray(checklist)) return []
  return checklist.map((c) => ({
    roundTitle: c.roundTitle ?? c.name ?? '',
    items: Array.isArray(c.items) ? c.items : [],
  }))
}

export function toCanonicalPlan7Days(plan) {
  if (!Array.isArray(plan)) return []
  return plan.map((p, i) => ({
    day: p.day ?? `Day ${i + 1}`,
    focus: p.focus ?? p.label ?? '',
    tasks: Array.isArray(p.tasks) ? p.tasks : [],
  }))
}

/**
 * Build categories object for UI from canonical extractedSkills.
 */
export function getCategoriesForDisplay(extractedSkills) {
  const e = extractedSkills || EMPTY_EXTRACTED
  const map = {
    'Core CS': e.coreCS,
    'Languages': e.languages,
    'Web': e.web,
    'Data': e.data,
    'Cloud/DevOps': e.cloud,
    'Testing': e.testing,
    'Other': e.other,
  }
  return Object.fromEntries(
    Object.entries(map).filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
  )
}

export function getAllSkillsFromExtracted(extractedSkills) {
  const e = extractedSkills || EMPTY_EXTRACTED
  return [
    ...(e.coreCS || []),
    ...(e.languages || []),
    ...(e.web || []),
    ...(e.data || []),
    ...(e.cloud || []),
    ...(e.testing || []),
    ...(e.other || []),
  ]
}

export function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') return false
  if (!entry.id || typeof entry.jdText !== 'string') return false
  if (!entry.extractedSkills || typeof entry.extractedSkills !== 'object') return false
  if (!Array.isArray(entry.questions)) return false
  if (typeof entry.baseScore !== 'number' && entry.baseScore != null) return false
  return true
}

export function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return null
  const now = new Date().toISOString()
  const createdAt = entry.createdAt ?? now
  const updatedAt = entry.updatedAt ?? createdAt

  const hasAnyLegacy = entry.extractedSkills?.categories &&
    Object.values(entry.extractedSkills.categories || {}).some((arr) => Array.isArray(arr) && arr.length > 0)
  const extractedSkills = toCanonicalExtractedSkills(entry.extractedSkills, hasAnyLegacy)
  if (!getAllSkillsFromExtracted(extractedSkills).length) {
    extractedSkills.other = [...DEFAULT_OTHER_SKILLS]
  }

  const baseScore = typeof entry.baseScore === 'number' ? entry.baseScore : (entry.baseReadinessScore ?? entry.readinessScore ?? 0)
  const finalScore = typeof entry.finalScore === 'number' ? entry.finalScore : (entry.readinessScore ?? baseScore)
  const skillConfidenceMap = entry.skillConfidenceMap && typeof entry.skillConfidenceMap === 'object' ? entry.skillConfidenceMap : {}

  return {
    id: entry.id ?? `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt,
    company: typeof entry.company === 'string' ? entry.company : '',
    role: typeof entry.role === 'string' ? entry.role : '',
    jdText: typeof entry.jdText === 'string' ? entry.jdText : '',
    extractedSkills,
    roundMapping: toCanonicalRoundMapping(entry.roundMapping ?? []),
    checklist: toCanonicalChecklist(entry.checklist ?? []),
    plan7Days: toCanonicalPlan7Days(entry.plan ?? entry.plan7Days ?? []),
    questions: Array.isArray(entry.questions) ? entry.questions : [],
    baseScore,
    skillConfidenceMap,
    finalScore,
    updatedAt,
    companyIntel: entry.companyIntel ?? null,
  }
}
