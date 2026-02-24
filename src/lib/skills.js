/**
 * Skill extraction from JD text (heuristic, case-insensitive).
 * No external APIs. Keywords grouped by category.
 */

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchKeyword(jdLower, keyword) {
  const escaped = escapeRegex(keyword)
  const re = new RegExp(`\\b${escaped}\\b`, 'i')
  return re.test(jdLower)
}

export const SKILL_CATEGORIES = {
  'Core CS': ['DSA', 'OOP', 'DBMS', 'OS', 'Networks'],
  'Languages': ['Java', 'Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go'],
  'Web': ['React', 'Next.js', 'Node.js', 'Express', 'REST', 'GraphQL'],
  'Data': ['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
  'Cloud/DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  'Testing': ['Selenium', 'Cypress', 'Playwright', 'JUnit', 'PyTest'],
}

const CATEGORY_ORDER = [
  'Core CS',
  'Languages',
  'Web',
  'Data',
  'Cloud/DevOps',
  'Testing',
]

/**
 * @param {string} jdText - Raw job description text
 * @returns {{ categories: Record<string, string[]>, allSkills: string[], hasAny: boolean }}
 */
export function extractSkills(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return { categories: {}, allSkills: [], hasAny: false }
  }

  const jdLower = jdText.trim()
  const categories = {}
  const allSkills = []

  for (const category of CATEGORY_ORDER) {
    const keywords = SKILL_CATEGORIES[category]
    const found = keywords.filter((kw) => matchKeyword(jdLower, kw))
    if (found.length > 0) {
      categories[category] = found
      allSkills.push(...found)
    }
  }

  const hasAny = Object.keys(categories).length > 0
  return {
    categories,
    allSkills: [...new Set(allSkills)],
    hasAny,
  }
}

export function getDisplayStack(extracted) {
  return extracted.hasAny ? null : 'General fresher stack'
}
