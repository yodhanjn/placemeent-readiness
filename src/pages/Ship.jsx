import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card'
import { resetTestChecklist } from '../lib/testChecklist'
import { CheckCircle, RotateCcw } from 'lucide-react'

const TEST_CHECKLIST_PATH = '/prp/07-test'

/**
 * Rendered only when ShipGuard has already verified all tests passed. No bypass.
 */
export default function ShipPage() {
  const navigate = useNavigate()

  const handleReset = () => {
    resetTestChecklist()
    navigate(TEST_CHECKLIST_PATH, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Ship</h1>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Ready to ship</CardTitle>
            <CardDescription>
              All tests passed. The Placement Readiness Platform is verified and ready to ship.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <RotateCcw className="w-4 h-4" />
              Reset checklist
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
