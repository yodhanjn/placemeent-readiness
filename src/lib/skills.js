/**
 * Skill extraction from JD text (heuristic, case-insensitive).
 * No external APIs. Keywords grouped by category; expanded to match real JD phrasing.
 */

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Match keyword in JD text. Allows flexible whitespace for multi-word keywords.
 * Handles special chars (C++, Next.js, C#) via word boundaries.
 */
function matchKeyword(jdLower, keyword) {
  const escaped = escapeRegex(keyword.trim())
  const pattern = escaped.replace(/\s+/g, '\\s+')
  const re = new RegExp(`(?:^|[^a-zA-Z0-9_.])${pattern}(?=[^a-zA-Z0-9_.]|$)`, 'i')
  return re.test(jdLower)
}

/** Canonical display name for dedup when multiple keywords map to same skill */
const KEYWORD_TO_DISPLAY = {
  'Data Structures': 'DSA',
  'Data Structure': 'DSA',
  'Algorithms': 'DSA',
  'Algorithm': 'DSA',
  'Object Oriented': 'OOP',
  'Object-Oriented': 'OOP',
  'Object oriented programming': 'OOP',
  'Databases': 'DBMS',
  'Database': 'DBMS',
  'Operating System': 'OS',
  'Operating Systems': 'OS',
  'Computer Networks': 'Networks',
  'Networking': 'Networks',
  'ReactJS': 'React',
  'React.js': 'React',
  'NextJS': 'Next.js',
  'Node': 'Node.js',
  'NodeJS': 'Node.js',
  'REST API': 'REST',
  'RESTful': 'REST',
  'REST APIs': 'REST',
  'Vue': 'Vue.js',
  'VueJS': 'Vue.js',
  'Angular': 'Angular',
  'Postgres': 'PostgreSQL',
  'Mongo': 'MongoDB',
  'NoSQL': 'MongoDB',
  'Google Cloud': 'GCP',
  'K8s': 'Kubernetes',
  'Golang': 'Go',
  'JS': 'JavaScript',
  'TS': 'TypeScript',
  'Unit testing': 'JUnit',
  'Unit tests': 'JUnit',
}

function toDisplayName(keyword) {
  return KEYWORD_TO_DISPLAY[keyword] ?? keyword
}

export const SKILL_CATEGORIES = {
  'Core CS': [
    'DSA',
    'Data Structures',
    'Data Structure',
    'Algorithms',
    'Algorithm',
    'OOP',
    'Object Oriented',
    'Object-Oriented',
    'Object oriented programming',
    'DBMS',
    'Database',
    'Databases',
    'SQL Database',
    'OS',
    'Operating System',
    'Operating Systems',
    'Networks',
    'Computer Networks',
    'Networking',
    'System Design',
  ],
  'Languages': [
    'Java',
    'Python',
    'JavaScript',
    'JS',
    'TypeScript',
    'TS',
    'C',
    'C++',
    'C#',
    'Go',
    'Golang',
    'Ruby',
    'Kotlin',
    'Swift',
    'Scala',
    'R',
    'PHP',
  ],
  'Web': [
    'React',
    'ReactJS',
    'React.js',
    'Next.js',
    'NextJS',
    'Node',
    'Node.js',
    'NodeJS',
    'Express',
    'Angular',
    'Vue',
    'Vue.js',
    'VueJS',
    'REST',
    'REST API',
    'RESTful',
    'REST APIs',
    'GraphQL',
    'HTML',
    'CSS',
    'Redux',
  ],
  'Data': [
    'SQL',
    'MongoDB',
    'Mongo',
    'PostgreSQL',
    'Postgres',
    'MySQL',
    'Redis',
    'NoSQL',
    'Data Analytics',
    'ETL',
  ],
  'Cloud/DevOps': [
    'AWS',
    'Azure',
    'GCP',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'K8s',
    'CI/CD',
    'Linux',
    'Jenkins',
    'Terraform',
    'Ansible',
  ],
  'Testing': [
    'Selenium',
    'Cypress',
    'Playwright',
    'JUnit',
    'PyTest',
    'Jest',
    'Unit testing',
    'Unit tests',
  ],
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
 * Extract key skills from JD text and segregate into categories.
 * Uses expanded keyword lists and deduplicates by display name (e.g. "Data Structures" → DSA).
 *
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
    const seen = new Set()
    const found = []
    for (const kw of keywords) {
      if (!matchKeyword(jdLower, kw)) continue
      const display = toDisplayName(kw)
      if (seen.has(display)) continue
      seen.add(display)
      found.push(display)
    }
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
