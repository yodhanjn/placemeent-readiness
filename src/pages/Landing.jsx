import { Link } from 'react-router-dom'
import { Code2, Video, BarChart3 } from 'lucide-react'

const features = [
  {
    title: 'Practice Problems',
    description: 'Solve curated problems across DSA, aptitude, and technical topics.',
    icon: Code2,
  },
  {
    title: 'Mock Interviews',
    description: 'Simulate real interviews with timed rounds and feedback.',
    icon: Video,
  },
  {
    title: 'Track Progress',
    description: 'Monitor your growth with analytics and streak tracking.',
    icon: BarChart3,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-gray-50">
      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Ace Your Placement
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mb-6 sm:mb-8 px-1">
          Practice, assess, and prepare for your dream job
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
        >
          Get Started
        </Link>
      </header>

      {/* Features grid */}
      <section className="px-4 sm:px-6 py-10 sm:py-16 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-primary/30 hover:bg-primary-light/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 px-4 text-center text-sm text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} Placement Readiness Platform. All rights reserved.
      </footer>
    </div>
  )
}
