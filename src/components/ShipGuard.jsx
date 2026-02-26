import { Navigate } from 'react-router-dom'
import { allTestsPassed } from '../lib/testChecklist'
import Ship from '../pages/Ship'

const TEST_CHECKLIST_PATH = '/prp/07-test'

/**
 * Route guard: blocks direct URL entry to /prp/08-ship. No bypass.
 * - Typing or pasting /prp/08-ship in the address bar → redirect to Test Checklist (replace).
 * - Ship page only renders when all 10 tests are passed.
 */
export default function ShipGuard() {
  if (!allTestsPassed()) {
    return (
      <Navigate
        to={TEST_CHECKLIST_PATH}
        replace
        state={{ fromShipBlocked: true }}
      />
    )
  }
  return <Ship />
}
