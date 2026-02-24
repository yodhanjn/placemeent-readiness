import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card'
import { getHistory } from '../../lib/storage'
import { History, ChevronRight } from 'lucide-react'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso || '—'
  }
}

export default function HistoryPage() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    try {
      setEntries(getHistory())
    } catch {
      setEntries([])
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">History</h2>
        <p className="text-gray-600">Past JD analyses. Click to view full results.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Saved analyses
          </CardTitle>
          <CardDescription>Date, company, role, and readiness score</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              No analyses yet. Analyze a JD to see history here.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {entries.map((e) => (
                <li key={e.id}>
                  <Link
                    to={`/dashboard/results?id=${e.id}`}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {e.company || 'No company'} · {e.role || 'No role'}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(e.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">
                        {e.readinessScore ?? '—'}/100
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
