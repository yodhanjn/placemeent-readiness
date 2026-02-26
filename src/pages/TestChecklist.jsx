import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import {
  getTestChecklist,
  setTestItem,
  resetTestChecklist,
  TEST_IDS,
  testsPassedCount,
} from '../lib/testChecklist'
import { CheckSquare, RotateCcw, Lock, ChevronRight } from 'lucide-react'

const TEST_ITEMS = [
  { id: 't1', label: 'JD required validation works', hint: 'Submit the Analyze form with empty JD; browser or app should block or show error.' },
  { id: 't2', label: 'Short JD warning shows for <200 chars', hint: 'Enter 1–199 characters in JD; calm warning about "too short to analyze deeply" should appear.' },
  { id: 't3', label: 'Skills extraction groups correctly', hint: 'Paste a JD with React, Java, SQL; run analysis; on Results, skills should appear under Core CS, Languages, Web, Data, etc.' },
  { id: 't4', label: 'Round mapping changes based on company + skills', hint: 'Analyze with a company name and JD with DSA/Web; Results should show round mapping section.' },
  { id: 't5', label: 'Score calculation is deterministic', hint: 'Same JD + same toggles should yield same final score after refresh.' },
  { id: 't6', label: 'Skill toggles update score live', hint: 'On Results, toggle "I know this" / "Need practice"; readiness score should update immediately.' },
  { id: 't7', label: 'Changes persist after refresh', hint: 'Toggle skills, refresh page; same entry should show same toggles and final score.' },
  { id: 't8', label: 'History saves and loads correctly', hint: 'Run an analysis, go to History; entry should appear; open it and see full results.' },
  { id: 't9', label: 'Export buttons copy the correct content', hint: 'On Results, use Copy round checklist / Copy 7-day plan / Copy questions; paste elsewhere and verify content.' },
  { id: 't10', label: 'No console errors on core pages', hint: 'Open Dashboard, Analyze, Results, History; check DevTools Console for errors.' },
]

export default function TestChecklistPage() {
  const location = useLocation()
  const fromShipBlocked = location.state?.fromShipBlocked === true
  const [state, setState] = useState(() => getTestChecklist())

  const refresh = useCallback(() => {
    setState(getTestChecklist())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleToggle = (id, checked) => {
    setTestItem(id, checked)
    setState(getTestChecklist())
  }

  const handleReset = () => {
    resetTestChecklist()
    setState(getTestChecklist())
  }

  const passed = testsPassedCount()
  const total = TEST_IDS.length
  const allPassed = passed === total

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {fromShipBlocked && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Direct access to Ship is not allowed. Complete all 10 tests below to unlock.
          </div>
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Test Checklist</h1>
            <p className="text-sm text-gray-600 mt-0.5">Placement Readiness Platform — built-in verification</p>
          </div>
          <Link
            to="/prp/08-ship"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 text-sm"
          >
            {allPassed ? 'Go to Ship' : <Lock className="w-4 h-4" />}
            Ship
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Tests Passed: {passed} / {total}
            </CardTitle>
            <CardDescription>
              {allPassed
                ? 'All checks passed. You can proceed to Ship.'
                : 'Complete each test and check it off before shipping.'}
            </CardDescription>
            {!allPassed && (
              <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-medium mt-2">
                Fix issues before shipping.
              </p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>Check each item after verifying the behavior. State is saved in localStorage.</CardDescription>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4" />
                Reset checklist
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {TEST_ITEMS.map(({ id, label, hint }) => (
              <label
                key={id}
                className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/50 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={!!state[id]}
                  onChange={(e) => handleToggle(id, e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 block">{label}</span>
                  {hint && (
                    <p className="text-xs text-gray-500 mt-1">How to test: {hint}</p>
                  )}
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
