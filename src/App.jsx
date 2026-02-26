import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Practice from './pages/dashboard/Practice'
import Assessments from './pages/dashboard/Assessments'
import Resources from './pages/dashboard/Resources'
import Profile from './pages/dashboard/Profile'
import Analyze from './pages/dashboard/Analyze'
import Results from './pages/dashboard/Results'
import History from './pages/dashboard/History'
import TestChecklist from './pages/TestChecklist'
import ShipGuard from './components/ShipGuard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/prp/07-test" element={<TestChecklist />} />
      <Route path="/prp/08-ship" element={<ShipGuard />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="practice" element={<Practice />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="resources" element={<Resources />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analyze" element={<Analyze />} />
        <Route path="results" element={<Results />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  )
}
