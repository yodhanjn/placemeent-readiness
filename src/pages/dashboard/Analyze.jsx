import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import { runFullAnalysis } from '../../lib/analysis'
import { saveAnalysis } from '../../lib/storage'
import { JD_MIN_LENGTH_WARNING } from '../../lib/schema'
import { FileText } from 'lucide-react'

export default function Analyze() {
  const navigate = useNavigate()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const jd = (jdText || '').trim()
    if (!jd) {
      setError('Please paste the job description text.')
      return
    }
    setLoading(true)
    try {
      const result = runFullAnalysis(company.trim(), role.trim(), jd)
      const entry = {
        company: company.trim(),
        role: role.trim(),
        jdText: jd,
        extractedSkills: result.extractedSkills,
        plan: result.plan,
        checklist: result.checklist,
        questions: result.questions,
        baseScore: result.baseScore,
        finalScore: result.baseScore,
        skillConfidenceMap: {},
        companyIntel: result.companyIntel ?? null,
        roundMapping: result.roundMapping ?? [],
      }
      const saved = saveAnalysis(entry)
      if (!saved) {
        setError('Could not save analysis. Please try again.')
        return
      }
      navigate(`/dashboard/results?id=${saved.id}`, { replace: true })
    } catch (err) {
      setError(err?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Analyze JD</h2>
        <p className="text-sm md:text-base text-gray-600">
          Paste a job description to extract skills and get a preparation plan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Job description
          </CardTitle>
          <CardDescription>
            Enter company and role (optional). Paste the full JD below for best results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SDE 1, Backend Intern"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label htmlFor="jd" className="block text-sm font-medium text-gray-700 mb-1">
                Job description <span className="text-gray-500">(required)</span>
              </label>
              <textarea
                id="jd"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={12}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-y min-h-[200px]"
              />
              {(jdText || '').trim().length > 0 && (jdText || '').trim().length < JD_MIN_LENGTH_WARNING && (
                <p className="mt-1.5 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                  This JD is too short to analyze deeply. Paste full JD for better output.
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors"
            >
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
