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
import {
  Award,
  Tag,
  ListChecks,
  Calendar,
  MessageCircle,
  Copy,
  Download,
  Lightbulb,
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
      const tasks = (day.tasks || []).map((t) => `  • ${t}`).join('\n')
      return `${day.label}\n${tasks}`
    })
    .join('\n\n')
}

function formatChecklistAsText(checklist) {
  if (!checklist || !checklist.length) return ''
  return checklist
    .map((round) => {
      const items = (round.items || []).map((i) => `  • ${i}`).join('\n')
      return `${round.name}\n${items}`
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
    let found = null
    if (id) found = getAnalysisById(id)
    if (!found) found = getLatestAnalysis()
    if (found && found.readinessScore != null && found.baseReadinessScore == null) {
      updateAnalysisById(found.id, { baseReadinessScore: found.readinessScore })
      found = { ...found, baseReadinessScore: found.readinessScore }
    }
    setEntry(found)
    setLoading(false)
  }, [id])

  const persistEntry = useCallback((updates) => {
    if (!entry?.id) return
    const updated = updateAnalysisById(entry.id, updates)
    if (updated) setEntry(updated)
  }, [entry?.id])

  const setSkillConfidence = useCallback(
    (skill, value) => {
      const map = { ...(entry?.skillConfidenceMap || {}), [skill]: value }
      const allSkills = getAllSkillsFromEntry(entry)
      const base = entry?.baseReadinessScore ?? entry?.readinessScore ?? 0
      const liveScore = computeLiveScore(base, map, allSkills)
      setEntry((prev) =>
        prev ? { ...prev, skillConfidenceMap: map, readinessScore: liveScore } : prev
      )
      persistEntry({ skillConfidenceMap: map, readinessScore: liveScore })
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
    const { company, role, readinessScore, extractedSkills, checklist, plan, questions } = entry
    const categories = extractedSkills?.categories || {}
    const sections = [
      '=== Placement Readiness – Analysis ===',
      '',
      `Company: ${company || '—'}`,
      `Role: ${role || '—'}`,
      `Readiness Score: ${readinessScore ?? 0}/100`,
      '',
      '--- Key skills extracted ---',
      ...(Object.keys(categories).length
        ? Object.entries(categories).flatMap(([cat, skills]) => [
            `${cat}: ${skills.join(', ')}`,
          ])
        : [extractedSkills?.displayStack || '—']),
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

  const { company, role, readinessScore, extractedSkills, checklist, plan, questions } = entry
  const categories = extractedSkills?.categories || {}
  const displayStack = extractedSkills?.displayStack
  const skillConfidenceMap = entry.skillConfidenceMap || {}

  function getAllSkillsFromEntry(e) {
    const cat = e?.extractedSkills?.categories || {}
    return Object.values(cat).flat()
  }

  const allSkills = getAllSkillsFromEntry(entry)
  const baseScore = entry.baseReadinessScore ?? entry.readinessScore ?? 0
  const liveScore = computeLiveScore(baseScore, skillConfidenceMap, allSkills)
  const practiceSkills = allSkills.filter((s) => (skillConfidenceMap[s] || DEFAULT_CONFIDENCE) === 'practice')
  const top3Weak = practiceSkills.slice(0, 3)

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
            <div className="flex flex-wrap gap-3">
              {Object.entries(categories).map(([cat, skills]) => (
                <div key={cat} className="space-y-1.5">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
              ))}
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
          {(checklist || []).map((round) => (
            <div key={round.id}>
              <h3 className="font-semibold text-gray-900 mb-2">{round.name}</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                {(round.items || []).map((item, i) => (
                  <li key={i}>{item}</li>
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
          {(plan || []).map((day, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900 mb-1">{day.label}</h3>
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
