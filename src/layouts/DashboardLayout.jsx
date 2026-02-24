import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Code2,
  ClipboardCheck,
  BookOpen,
  User,
  FileSearch,
  History,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/practice', label: 'Practice', icon: Code2 },
  { to: '/dashboard/assessments', label: 'Assessments', icon: ClipboardCheck },
  { to: '/dashboard/resources', label: 'Resources', icon: BookOpen },
  { to: '/dashboard/analyze', label: 'Analyze', icon: FileSearch },
  { to: '/dashboard/history', label: 'History', icon: History },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      {/* Sidebar: drawer on mobile, fixed on desktop */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 max-w-[85vw] md:w-56 flex-shrink-0
          bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-200 ease-out
          md:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Placement Prep</span>
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] md:min-h-0 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-14 flex-shrink-0 px-4 md:px-6 flex items-center justify-between bg-white border-b border-gray-200">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate flex-1 text-center md:text-left md:ml-0 ml-4">
            Placement Prep
          </h1>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
