/**
 * Analysis generation: checklist, 7-day plan, questions, readiness score.
 * Template-based from extracted skills. No external APIs.
 */

import { extractSkills, getDisplayStack } from './skills'

const ROUNDS = [
  { id: 'r1', name: 'Round 1: Aptitude / Basics', key: 'round1' },
  { id: 'r2', name: 'Round 2: DSA + Core CS', key: 'round2' },
  { id: 'r3', name: 'Round 3: Tech interview (projects + stack)', key: 'round3' },
  { id: 'r4', name: 'Round 4: Managerial / HR', key: 'round4' },
]

function buildRound1(extracted) {
  const base = [
    'Revise quantitative aptitude: percentages, ratios, time-speed-distance.',
    'Practice logical reasoning and puzzles.',
    'Brush up verbal ability and reading comprehension.',
    'Time yourself on sample aptitude tests.',
  ]
  const extra = []
  if (extracted.categories['Core CS']) {
    extra.push('Revise CS fundamentals: OS, DBMS, networks basics.')
  }
  if (extracted.categories['Languages']) {
    extra.push('Review syntax and basics of mentioned languages.')
  }
  return base.concat(extra).slice(0, 8)
}

function buildRound2(extracted) {
  const base = [
    'Revise core data structures: arrays, linked lists, trees, graphs.',
    'Practice time/space complexity analysis.',
    'Solve 5–10 medium DSA problems from arrays and strings.',
    'Revise sorting and searching algorithms.',
  ]
  const extra = []
  if (extracted.categories['Core CS']) {
    const list = extracted.categories['Core CS'].join(', ')
    extra.push(`Prepare short answers on: ${list}.`)
    if (extracted.categories['Core CS'].includes('OOP')) {
      extra.push('Revise OOP concepts: encapsulation, inheritance, polymorphism.')
    }
    if (extracted.categories['Core CS'].includes('DBMS')) {
      extra.push('Revise DBMS: normalization, ACID, transactions, indexing.')
    }
  }
  return base.concat(extra).slice(0, 8)
}

function buildRound3(extracted) {
  const base = [
    'Prepare 2–3 project stories with STAR format.',
    'Align resume points with JD keywords.',
    'Prepare “Tell me about yourself” and project deep-dives.',
  ]
  const extra = []
  const web = extracted.categories['Web']
  const data = extracted.categories['Data']
  const cloud = extracted.categories['Cloud/DevOps']
  const testing = extracted.categories['Testing']
  if (web && web.length) {
    extra.push(`Revise ${web.join(', ')}: architecture and common patterns.`)
  }
  if (data && data.length) {
    extra.push(`Prepare for ${data.join(', ')}: queries and design.`)
  }
  if (cloud && cloud.length) {
    extra.push(`Revise ${cloud.join(', ')} basics and your experience.`)
  }
  if (testing && testing.length) {
    extra.push(`Prepare testing concepts: ${testing.join(', ')}.`)
  }
  if (extracted.categories['Languages']?.length) {
    extra.push('Review language-specific best practices and common pitfalls.')
  }
  return base.concat(extra).slice(0, 8)
}

function buildRound4() {
  return [
    'Prepare behavioral questions: conflict, failure, leadership.',
    'Research company values and recent news.',
    'Prepare questions to ask the interviewer.',
    'Practice salary and expectation discussion (if applicable).',
    'Review body language and communication clarity.',
    'Prepare for “Why this company?” and “Where do you see yourself?”.',
  ].slice(0, 8)
}

export function buildChecklist(extracted) {
  return ROUNDS.map((r) => ({
    ...r,
    items:
      r.key === 'round1'
        ? buildRound1(extracted)
        : r.key === 'round2'
          ? buildRound2(extracted)
          : r.key === 'round3'
            ? buildRound3(extracted)
            : buildRound4(),
  }))
}

const DAY_LABELS = [
  'Day 1–2: Basics + core CS',
  'Day 3–4: DSA + coding practice',
  'Day 5: Project + resume alignment',
  'Day 6: Mock interview questions',
  'Day 7: Revision + weak areas',
]

function buildDay12(extracted) {
  const lines = [
    'Revise CS fundamentals: OS, DBMS, networks.',
    'Brush up OOP and basic data structures.',
  ]
  if (extracted.categories['Languages']?.length) {
    lines.push(`Review ${extracted.categories['Languages'].join(', ')} basics and syntax.`)
  }
  if (extracted.categories['Core CS']?.includes('DSA')) {
    lines.push('Start with arrays and strings in DSA.')
  }
  return lines
}

function buildDay34(extracted) {
  const lines = [
    'Solve 8–10 DSA problems (mix easy/medium).',
    'Focus on arrays, strings, hashing, two pointers.',
    'Practice writing code on paper/whiteboard.',
  ]
  if (extracted.categories['Core CS']?.includes('DSA')) {
    lines.push('Revise trees and graphs if time permits.')
  }
  return lines
}

function buildDay5(extracted) {
  const lines = [
    'Map your projects to JD requirements.',
    'Prepare 2–3 project stories with metrics.',
    'Update resume bullets to match JD keywords.',
  ]
  if (extracted.categories['Web']?.includes('React')) {
    lines.push('Revise React concepts: components, hooks, state management.')
  }
  if (extracted.categories['Web']?.length) {
    lines.push(`Align web stack (${extracted.categories['Web'].join(', ')}) with projects.`)
  }
  return lines
}

function buildDay6(extracted) {
  const lines = [
    'Practice 5–10 mock technical questions aloud.',
    'Time yourself on problem-solving.',
  ]
  if (extracted.categories['Data']?.length) {
    lines.push('Practice SQL/DB questions if applicable.')
  }
  if (extracted.categories['Testing']?.length) {
    lines.push('Revise testing concepts and frameworks.')
  }
  return lines
}

function buildDay7(extracted) {
  const lines = [
    'Revise weak areas identified in mocks.',
    'Quick pass over DSA patterns and core CS.',
    'Rest and stay calm before the interview.',
  ]
  if (extracted.categories['Web']?.includes('React')) {
    lines.push('Final pass: React lifecycle and state management.')
  }
  return lines
}

export function buildPlan(extracted) {
  return [
    { label: DAY_LABELS[0], tasks: buildDay12(extracted) },
    { label: DAY_LABELS[1], tasks: buildDay34(extracted) },
    { label: DAY_LABELS[2], tasks: buildDay5(extracted) },
    { label: DAY_LABELS[3], tasks: buildDay6(extracted) },
    { label: DAY_LABELS[4], tasks: buildDay7(extracted) },
  ]
}

const QUESTION_TEMPLATES = {
  'Core CS': [
    { when: ['DSA'], q: 'How would you optimize search in sorted data? Explain time complexity.' },
    { when: ['OOP'], q: 'Explain inheritance vs composition. When would you use each?' },
    { when: ['DBMS'], q: 'Explain indexing and when it helps. What are trade-offs?' },
    { when: ['OS'], q: 'Explain process vs thread. How does the OS schedule them?' },
    { when: ['Networks'], q: 'Explain HTTP vs HTTPS. What is TLS handshake?' },
  ],
  'Languages': [
    { when: ['Java'], q: 'Explain JVM memory model and garbage collection in brief.' },
    { when: ['Python'], q: 'Explain Python GIL. How does it affect multithreading?' },
    { when: ['JavaScript'], q: 'Explain event loop and async behavior in JavaScript.' },
    { when: ['TypeScript'], q: 'What benefits does TypeScript add over JavaScript?' },
    { when: ['C++'], q: 'Explain smart pointers and memory management in C++.' },
    { when: ['Go'], q: 'How does Go handle concurrency? Explain goroutines and channels.' },
  ],
  'Web': [
    { when: ['React'], q: 'Explain state management options in React (useState, Context, Redux).' },
    { when: ['Next.js'], q: 'Explain SSR vs SSG in Next.js. When to use which?' },
    { when: ['Node.js'], q: 'Explain event-driven architecture in Node.js.' },
    { when: ['Express'], q: 'How would you structure middleware for auth and logging?' },
    { when: ['REST'], q: 'Explain REST principles. Idempotency and safe methods.' },
    { when: ['GraphQL'], q: 'When would you choose GraphQL over REST?' },
  ],
  'Data': [
    { when: ['SQL'], q: 'Explain indexing and when it helps. Write a query using JOIN and index.' },
    { when: ['MongoDB'], q: 'When would you use MongoDB over a relational DB?' },
    { when: ['Redis'], q: 'What is Redis used for? Caching vs session store.' },
  ],
  'Cloud/DevOps': [
    { when: ['AWS'], q: 'Explain one AWS service you have used and its use case.' },
    { when: ['Docker'], q: 'Explain Docker image vs container. Why use containers?' },
    { when: ['Kubernetes'], q: 'What problem does Kubernetes solve? Pod vs Deployment.' },
    { when: ['CI/CD'], q: 'Explain your understanding of CI/CD pipeline.' },
  ],
  'Testing': [
    { when: ['Selenium'], q: 'How would you handle flaky tests in Selenium?' },
    { when: ['JUnit'], q: 'Explain unit testing best practices and mocking.' },
    { when: ['PyTest'], q: 'How do you structure tests and fixtures in PyTest?' },
  ],
}

const FALLBACK_QUESTIONS = [
  'Tell me about yourself and your relevant projects.',
  'What is your approach to solving a new coding problem?',
  'Describe a challenging bug you fixed and how you debugged it.',
  'How do you stay updated with technology?',
  'Where do you see yourself in 2–3 years?',
  'Explain a project from your resume in detail.',
  'What is your greatest strength and weakness?',
  'How do you handle disagreement in a team?',
  'Why do you want to join this company?',
  'Do you have any questions for us?',
]

function pickQuestions(extracted, count = 10) {
  const out = []
  const used = new Set()

  for (const category of Object.keys(extracted.categories || {})) {
    const templates = QUESTION_TEMPLATES[category]
    if (!templates) continue
    const skillsInCategory = extracted.categories[category] || []
    for (const t of templates) {
      const match = t.when.some((s) => skillsInCategory.includes(s))
      if (match && !used.has(t.q)) {
        used.add(t.q)
        out.push(t.q)
        if (out.length >= count) return out
      }
    }
  }

  for (const q of FALLBACK_QUESTIONS) {
    if (out.length >= count) break
    if (!used.has(q)) out.push(q)
  }
  return out.slice(0, count)
}

export function buildQuestions(extracted) {
  return pickQuestions(extracted, 10)
}

const MAX_CATEGORY_BONUS = 30
const CATEGORY_BONUS_PER = 5
const COMPANY_BONUS = 10
const ROLE_BONUS = 10
const JD_LENGTH_THRESHOLD = 800
const JD_LENGTH_BONUS = 10

export function computeReadinessScore(payload) {
  const { company = '', role = '', jdText = '', extracted } = payload
  let score = 35

  const categoryCount = extracted?.categories ? Object.keys(extracted.categories).length : 0
  score += Math.min(MAX_CATEGORY_BONUS, categoryCount * CATEGORY_BONUS_PER)

  if (typeof company === 'string' && company.trim().length > 0) score += COMPANY_BONUS
  if (typeof role === 'string' && role.trim().length > 0) score += ROLE_BONUS
  if (typeof jdText === 'string' && jdText.trim().length > JD_LENGTH_THRESHOLD) score += JD_LENGTH_BONUS

  return Math.min(100, Math.max(0, Math.round(score)))
}

export function runFullAnalysis(company, role, jdText) {
  const extracted = extractSkills(jdText)
  const displayStack = getDisplayStack(extracted)
  const checklist = buildChecklist(extracted)
  const plan = buildPlan(extracted)
  const questions = buildQuestions(extracted)
  const readinessScore = computeReadinessScore({ company, role, jdText, extracted })
  return {
    extractedSkills: { ...extracted, displayStack },
    checklist,
    plan,
    questions,
    readinessScore,
  }
}
