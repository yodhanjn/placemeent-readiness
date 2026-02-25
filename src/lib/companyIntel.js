/**
 * Company Intel + Round Mapping (heuristic, no scraping).
 * Infers size, industry, typical hiring focus; generates round flow from company + skills.
 */

const KNOWN_ENTERPRISE = [
  'amazon', 'microsoft', 'google', 'meta', 'apple', 'ibm', 'oracle', 'salesforce',
  'infosys', 'tcs', 'tata consultancy', 'wipro', 'accenture', 'cognizant', 'capgemini',
  'hcl', 'tech mahindra', 'ltimindtree', 'dell', 'cisco', 'intel', 'nvidia', 'adobe',
  'netflix', 'uber', 'paypal', 'goldman sachs', 'morgan stanley', 'jpmorgan', 'jpmc',
]

const MID_SIZE_KEYWORDS = ['ltd', 'limited', 'corp', 'corporation', 'inc']

const INDUSTRY_KEYWORDS = [
  { keywords: ['bank', 'finance', 'capital', 'investment'], industry: 'Financial Services' },
  { keywords: ['health', 'pharma', 'medical', 'biotech'], industry: 'Healthcare & Life Sciences' },
  { keywords: ['retail', 'ecommerce', 'e-commerce', 'shop'], industry: 'Retail & E-commerce' },
  { keywords: ['edu', 'learning', 'education'], industry: 'EdTech' },
  { keywords: ['insurance'], industry: 'Insurance' },
  { keywords: ['consulting', 'consultancy'], industry: 'Consulting' },
]

const DEFAULT_INDUSTRY = 'Technology Services'

function normalize(s) {
  return (s || '').toLowerCase().trim()
}

/**
 * @param {string} companyName
 * @param {string} [jdText] - optional, for future keyword-based industry
 * @returns {{ name: string, industry: string, sizeCategory: 'Startup'|'Mid-size'|'Enterprise', sizeLabel: string, typicalHiringFocus: string } | null}
 */
export function getCompanyIntel(companyName, jdText = '') {
  const name = (companyName || '').trim()
  if (!name) return null

  const lower = normalize(name)
  const combined = `${lower} ${normalize(jdText).slice(0, 500)}`

  let sizeCategory = 'Startup'
  let sizeLabel = 'Startup (<200)'
  if (KNOWN_ENTERPRISE.some((c) => lower.includes(c))) {
    sizeCategory = 'Enterprise'
    sizeLabel = 'Enterprise (2000+)'
  } else if (MID_SIZE_KEYWORDS.some((k) => lower.includes(k)) || name.length > 25) {
    sizeCategory = 'Mid-size'
    sizeLabel = 'Mid-size (200–2000)'
  }

  let industry = DEFAULT_INDUSTRY
  for (const { keywords, industry: ind } of INDUSTRY_KEYWORDS) {
    if (keywords.some((k) => combined.includes(k))) {
      industry = ind
      break
    }
  }

  let typicalHiringFocus = ''
  if (sizeCategory === 'Enterprise') {
    typicalHiringFocus = 'Structured process with emphasis on DSA, core CS fundamentals, system design, and behavioral rounds. High bar on consistency across many candidates.'
  } else if (sizeCategory === 'Mid-size') {
    typicalHiringFocus = 'Mix of problem-solving, core fundamentals, and hands-on skills. Often 2–3 technical rounds plus culture fit.'
  } else {
    typicalHiringFocus = 'Practical problem-solving and stack depth. Focus on what you can build, past projects, and culture fit. Fewer formal rounds.'
  }

  return {
    name,
    industry,
    sizeCategory,
    sizeLabel,
    typicalHiringFocus,
  }
}

/**
 * Round mapping: dynamic rounds based on company size + detected skills.
 * Each round: { id, name, whyMatters }
 */
export function buildRoundMapping(companyIntel, extracted) {
  const size = companyIntel?.sizeCategory || 'Startup'
  const hasDSA = extracted?.categories?.['Core CS']?.includes('DSA') ?? false
  const hasWeb = (extracted?.categories?.['Web']?.length ?? 0) > 0
  const hasCoreCS = (extracted?.categories?.['Core CS']?.length ?? 0) > 0

  if (size === 'Enterprise') {
    if (hasDSA || hasCoreCS) {
      return [
        { id: 'e1', name: 'Round 1: Online Test (DSA + Aptitude)', whyMatters: 'Filters for baseline problem-solving and aptitude; often elimination round.' },
        { id: 'e2', name: 'Round 2: Technical (DSA + Core CS)', whyMatters: 'Deep dive into data structures, algorithms, and CS fundamentals.' },
        { id: 'e3', name: 'Round 3: Tech + Projects', whyMatters: 'Evaluates real-world application and how you apply knowledge in projects.' },
        { id: 'e4', name: 'Round 4: HR / Behavioral', whyMatters: 'Culture fit, motivation, and soft skills; final gate before offer.' },
      ]
    }
    return [
      { id: 'e1', name: 'Round 1: Aptitude / Screening', whyMatters: 'Initial filter for logical and verbal ability.' },
      { id: 'e2', name: 'Round 2: Technical Interview', whyMatters: 'Domain and technical depth relevant to the role.' },
      { id: 'e3', name: 'Round 3: HR / Behavioral', whyMatters: 'Culture fit and alignment with company values.' },
    ]
  }

  if (size === 'Mid-size') {
    return [
      { id: 'm1', name: 'Round 1: Technical / Coding', whyMatters: 'Assesses coding ability and core skills early.' },
      { id: 'm2', name: 'Round 2: System / Design Discussion', whyMatters: 'How you think about problems and trade-offs.' },
      { id: 'm3', name: 'Round 3: Team / Culture Fit', whyMatters: 'Fit with the team and company way of working.' },
    ]
  }

  if (hasWeb) {
    return [
      { id: 's1', name: 'Round 1: Practical Coding', whyMatters: 'Hands-on task or live coding to see how you build.' },
      { id: 's2', name: 'Round 2: System / Stack Discussion', whyMatters: 'Depth in the stack they use (e.g. React, Node).' },
      { id: 's3', name: 'Round 3: Culture Fit', whyMatters: 'Motivation, ownership, and how you work in small teams.' },
    ]
  }

  if (hasDSA) {
    return [
      { id: 's1', name: 'Round 1: Coding Round', whyMatters: 'Problem-solving under time; often 1–2 problems.' },
      { id: 's2', name: 'Round 2: Technical Depth', whyMatters: 'Follow-up on approach, complexity, and core concepts.' },
      { id: 's3', name: 'Round 3: Projects & Fit', whyMatters: 'Projects and how you collaborate.' },
    ]
  }

  return [
    { id: 's1', name: 'Round 1: Technical Screening', whyMatters: 'Quick assessment of skills and fit for the role.' },
    { id: 's2', name: 'Round 2: Deep Dive / Projects', whyMatters: 'Experience and how you apply it.' },
    { id: 's3', name: 'Round 3: Culture & Fit', whyMatters: 'Alignment with team and company.' },
  ]
}
