import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import { getAnalysisById, getLatestAnalysis, updateAnalysisById } from '../../lib/storage'
import { getCompanyIntel, buildRoundMapping } from '../../lib/companyIntel'
import { getCategoriesForDisplay, getAllSkillsFromExtracted } from '../../lib/schema'

/** Fixed order for displaying skill categories (matches schema) */
const CATEGORY_DISPLAY_ORDER = [
  'Core CS',
  'Languages',
  'Web',
  'Data',
  'Cloud/DevOps',
  'Testing',
  'Other',
]
import {
  Award,
  Tag,
  ListChecks,
  Calendar,
  MessageCircle,
  Copy,
  Download,
  Lightbulb,
  Building2,
  GitBranch,
} from 'lucide-react'

const DEFAULT_CONFIDENCE = 'practice'

function computeLiveScore(baseScore, skillConfidenceMap, allSkills) {
  let knowCount = 0
  for (const s of allSkills) {
    const c = skillConfidenceMap[s] || DEFAULT_CONFIDENCE
    if (c === 'know') knowCount++
  }
  const adjusted = baseScore + 2 * knowCount
  return Math.min(100, Math.max(0, Math.round(adjusted)))
}

function formatPlanAsText(plan) {
  if (!plan || !plan.length) return ''
  return plan
    .map((day) => {
      const label = day.label ?? day.focus ?? day.day ?? ''
      const tasks = (day.tasks || []).map((t) => `  • ${t}`).join('\n')
      return `${label}\n${tasks}`
    })
    .join('\n\n')
}

function formatChecklistAsText(checklist) {
  if (!checklist || !checklist.length) return ''
  return checklist
    .map((round) => {
      const title = round.roundTitle ?? round.name ?? ''
      const items = (round.items || []).map((i) => `  • ${i}`).join('\n')
      return `${title}\n${items}`
    })
    .join('\n\n')
}

function formatQuestionsAsText(questions) {
  if (!questions || !questions.length) return ''
  return questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
}

export default function Results() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copyFeedback, setCopyFeedback] = useState(null)

  useEffect(() => {
    const found = id ? getAnalysisById(id) : null
    const resolved = found ?? getLatestAnalysis()
    setEntry(resolved)
    setLoading(false)
  }, [id])

  const persistEntry = useCallback((updates) => {
    if (!entry?.id) return
    const updated = updateAnalysisById(entry.id, updates)
    if (updated) setEntry(updated)
  }, [entry?.id])

  const setSkillConfidence = useCallback(
    (skill, value) => {
      if (!entry?.id) return
      const map = { ...(entry.skillConfidenceMap || {}), [skill]: value }
      const allSkills = getAllSkillsFromExtracted(entry.extractedSkills)
      const base = entry.baseScore ?? entry.baseReadinessScore ?? entry.readinessScore ?? 0
      const finalScore = computeLiveScore(base, map, allSkills)
      setEntry((prev) =>
        prev ? { ...prev, skillConfidenceMap: map, finalScore } : prev
      )
      persistEntry({ skillConfidenceMap: map, finalScore })
    },
    [entry, persistEntry]
  )

  const copyToClipboard = useCallback(async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(label)
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch {
      setCopyFeedback('Copy failed')
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }, [])

  const downloadTxt = useCallback(() => {
    if (!entry) return
    const { company, role, extractedSkills, questions } = entry
    const categories = getCategoriesForDisplay(extractedSkills)
    const score = entry.finalScore ?? entry.readinessScore ?? 0
    const checklist = entry.checklist ?? []
    const plan = entry.plan7Days?.length ? entry.plan7Days : entry.plan ?? []
    const sections = [
      '=== Placement Readiness – Analysis ===',
      '',
      `Company: ${company || '—'}`,
      `Role: ${role || '—'}`,
      `Readiness Score: ${score}/100`,
      '',
      '--- Key skills extracted ---',
      ...(Object.keys(categories).length
        ? Object.entries(categories).flatMap(([cat, skills]) => [
            `${cat}: ${skills.join(', ')}`,
          ])
        : ['General fresher stack']),
      '',
      '--- Round-wise checklist ---',
      formatChecklistAsText(checklist),
      '',
      '--- 7-day plan ---',
      formatPlanAsText(plan),
      '',
      '--- 10 likely questions ---',
      formatQuestionsAsText(questions),
    ]
    const blob = new Blob([sections.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `placement-readiness-${entry.id || 'export'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [entry])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Results</h2>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No analysis yet.</p>
            <Link
              to="/dashboard/analyze"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover"
            >
              Analyze a JD
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { company, role, extractedSkills, questions } = entry
  const categories = getCategoriesForDisplay(extractedSkills)
  const displayStack = Object.keys(categories).length === 0 ? 'General fresher stack' : null
  const skillConfidenceMap = entry.skillConfidenceMap || {}
  const allSkills = getAllSkillsFromExtracted(extractedSkills)
  const baseScore = entry.baseScore ?? entry.baseReadinessScore ?? entry.readinessScore ?? 0
  const liveScore = computeLiveScore(baseScore, skillConfidenceMap, allSkills)
  const practiceSkills = allSkills.filter((s) => (skillConfidenceMap[s] || DEFAULT_CONFIDENCE) === 'practice')
  const top3Weak = practiceSkills.slice(0, 3)

  const companyIntel = entry.companyIntel ?? (entry.company ? getCompanyIntel(entry.company, entry.jdText) : null)
  const extractedForRoundMapping = { categories }
  const roundMapping = entry.roundMapping?.length ? entry.roundMapping : (companyIntel ? buildRoundMapping(companyIntel, extractedForRoundMapping) : [])
  const checklist = entry.checklist ?? []
  const plan = entry.plan7Days?.length ? entry.plan7Days : (entry.plan ?? [])

  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Analysis results</h2>
        <p className="text-sm md:text-base text-gray-600 truncate">
          {company && `${company}${role ? ` · ${role}` : ''}`}
          {!company && !role && 'Your latest JD analysis'}
        </p>
      </div>

      {/* Readiness score – live */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Readiness score
          </CardTitle>
          <CardDescription>
            Base score adjusted by skill self-assessment (+2 per “I know”, −2 per “Need practice”)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{liveScore}</span>
            </div>
            <p className="text-sm text-gray-600">Out of 100 (updates as you toggle skills)</p>
          </div>
        </CardContent>
      </Card>

      {/* Company Intel – when company provided */}
      {companyIntel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Company intel
            </CardTitle>
            <CardDescription>Inferred from company name (heuristic)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 block">Company</span>
                <span className="font-medium text-gray-900">{companyIntel.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Industry</span>
                <span className="font-medium text-gray-900">{companyIntel.industry}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Estimated size</span>
                <span className="font-medium text-gray-900">{companyIntel.sizeLabel}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 block text-sm mb-1">Typical hiring focus</span>
              <p className="text-sm text-gray-700">{companyIntel.typicalHiringFocus}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Round Mapping – vertical timeline */}
      {roundMapping.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              Round mapping
            </CardTitle>
            <CardDescription>Expected interview flow based on company and skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l-2 border-gray-200 space-y-5">
              {roundMapping.map((round, i) => (
                <div key={round.id ?? i} className="relative">
                  <div className="absolute -left-[29px] top-0.5 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">{round.roundTitle ?? round.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Why this round matters: {round.whyItMatters ?? round.whyMatters}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(companyIntel || roundMapping.length > 0) && (
        <p className="text-xs text-gray-400">Demo Mode: Company intel generated heuristically.</p>
      )}

      {/* Key skills extracted – interactive toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Key skills extracted
          </CardTitle>
          <CardDescription>Tags grouped by category. Toggle confidence; changes are saved.</CardDescription>
        </CardHeader>
        <CardContent>
          {displayStack ? (
            <p className="text-gray-600">{displayStack}</p>
          ) : (
            <div className="space-y-6">
              {CATEGORY_DISPLAY_ORDER.filter(
                (cat) => Array.isArray(categories[cat]) && categories[cat].length > 0
              ).map((cat) => {
                const skills = categories[cat]
                return (
                  <div key={cat} className="space-y-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block border-b border-gray-100 pb-1">
                      {cat}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => {
                      const confidence = skillConfidenceMap[s] || DEFAULT_CONFIDENCE
                      const isKnow = confidence === 'know'
                      return (
                        <div
                          key={s}
                          className="inline-flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-0 rounded-lg border border-gray-200 bg-white overflow-hidden min-w-0 w-full sm:w-auto"
                        >
                          <span
                            className={`px-3 py-2 sm:py-1 sm:px-2.5 text-sm font-medium shrink-0 ${
                              isKnow ? 'bg-primary/15 text-primary' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {s}
                          </span>
                          <div className="flex rounded-b-lg sm:rounded-b-none sm:rounded-r-lg overflow-hidden border-t sm:border-t-0 sm:border-l border-gray-200">
                            <button
                              type="button"
                              onClick={() => setSkillConfidence(s, 'practice')}
                              className={`flex-1 min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-1 sm:px-2 text-xs sm:text-xs font-medium transition-colors ${
                                !isKnow
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                              title="Need practice"
                            >
                              Need practice
                            </button>
                            <button
                              type="button"
                              onClick={() => setSkillConfidence(s, 'know')}
                              className={`flex-1 min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-1 sm:px-2 text-xs font-medium transition-colors ${
                                isKnow
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                              title="I know this"
                            >
                              I know this
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Round-wise checklist + export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Round-wise preparation checklist
              </CardTitle>
              <CardDescription>Template-based items per round</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(formatChecklistAsText(checklist), 'Checklist copied')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Copy className="w-4 h-4" />
                Copy round checklist
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {checklist.map((round, i) => (
            <div key={round.id ?? i}>
              <h3 className="font-semibold text-gray-900 mb-2">{round.roundTitle ?? round.name}</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                {(round.items || []).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 7-day plan + export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                7-day plan
              </CardTitle>
              <CardDescription>Adapted to detected skills</CardDescription>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(formatPlanAsText(plan), '7-day plan copied')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Copy className="w-4 h-4" />
              Copy 7-day plan
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.map((day, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900 mb-1">{day.label ?? day.focus ?? day.day}</h3>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600 text-sm">
                {(day.tasks || []).map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 10 likely questions + export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                10 likely interview questions
              </CardTitle>
              <CardDescription>Based on detected skills</CardDescription>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(formatQuestionsAsText(questions), 'Questions copied')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Copy className="w-4 h-4" />
              Copy 10 questions
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            {(questions || []).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Export: Download as TXT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export
          </CardTitle>
          <CardDescription>Download all sections as a single text file</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={downloadTxt}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
          >
            <Download className="w-4 h-4" />
            Download as TXT
          </button>
        </CardContent>
      </Card>

      {/* Action Next */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Lightbulb className="w-5 h-5 text-primary" />
            Action next
          </CardTitle>
          <CardDescription>Focus areas and suggested next step</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {top3Weak.length > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-700">Top weak skills (need practice):</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {top3Weak.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-600">All listed skills marked as known. Keep revising.</p>
          )}
          <p className="text-sm font-medium text-primary">Start Day 1 plan now.</p>
        </CardContent>
      </Card>

      {copyFeedback && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 max-w-[calc(100vw-2rem)] sm:max-w-none px-4 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg text-center sm:text-left">
          {copyFeedback}
        </div>
      )}
    </div>
  )
}
