import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../../components/ui/Card'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { ChevronRight, Calendar } from 'lucide-react'

const READINESS_MAX = 100
const CIRCLE_SIZE = 120
const STROKE_WIDTH = 10
const radius = (CIRCLE_SIZE - STROKE_WIDTH) / 2
const circumference = 2 * Math.PI * radius

function clampReadinessScore(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return 0
  return Math.min(READINESS_MAX, Math.max(0, Math.round(score)))
}

const readinessScore = clampReadinessScore(72)
const readinessProgressOffset = circumference - (readinessScore / READINESS_MAX) * circumference

const skillData = [
  { subject: 'DSA', value: 75, fullMark: 100 },
  { subject: 'System Design', value: 60, fullMark: 100 },
  { subject: 'Communication', value: 80, fullMark: 100 },
  { subject: 'Resume', value: 85, fullMark: 100 },
  { subject: 'Aptitude', value: 70, fullMark: 100 },
]

const WEEK_DAYS = [
  { label: 'Mon', active: true },
  { label: 'Tue', active: true },
  { label: 'Wed', active: true },
  { label: 'Thu', active: true },
  { label: 'Fri', active: false },
  { label: 'Sat', active: false },
  { label: 'Sun', active: false },
]

const assessments = [
  { title: 'DSA Mock Test', when: 'Tomorrow, 10:00 AM' },
  { title: 'System Design Review', when: 'Wed, 2:00 PM' },
  { title: 'HR Interview Prep', when: 'Friday, 11:00 AM' },
]

const practiceTopic = 'Dynamic Programming'
const practiceCompleted = 3
const practiceTotal = 10
const practiceAllComplete = practiceCompleted >= practiceTotal

const weeklySolved = 12
const weeklyTarget = 20
const weeklyPercent = weeklyTarget > 0 ? Math.min(100, (weeklySolved / weeklyTarget) * 100) : 0

export default function Dashboard() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm md:text-base text-gray-600">Your placement prep at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* 1. Overall Readiness */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Readiness</CardTitle>
            <CardDescription>Your current readiness score out of 100</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center">
              <svg
                width={CIRCLE_SIZE}
                height={CIRCLE_SIZE}
                className="transform -rotate-90"
                aria-hidden
              >
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={STROKE_WIDTH}
                  className="text-gray-200"
                />
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={readinessProgressOffset}
                  className="text-primary transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {readinessScore}/{READINESS_MAX}
                </span>
                <span className="text-xs font-medium text-gray-500">Readiness Score</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Skill Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
            <CardDescription>Scores across key placement areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData} margin={{ top: 16, right: 24, left: 24, bottom: 16 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickCount={5}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(245, 58%, 51%)"
                    fill="hsl(245, 58%, 51%)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Continue Practice */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Practice</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-gray-900">{practiceTopic}</p>
            {practiceAllComplete ? (
              <p className="text-sm text-gray-600">All topics complete!</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>{practiceCompleted}/{practiceTotal} completed</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${(practiceCompleted / practiceTotal) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!practiceAllComplete && (
              <Link
                to="/dashboard/practice"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </CardFooter>
        </Card>

        {/* 4. Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Problems solved this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Problems Solved: {weeklySolved}/{weeklyTarget} this week</p>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${weeklyPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-1 sm:gap-2 pt-2 min-w-0">
              {WEEK_DAYS.map(({ label, active }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-0 flex-1"
                  title={active ? 'Activity' : 'No activity'}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                      active
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {label.slice(0, 1)}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 truncate w-full text-center">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. Upcoming Assessments - span full width on 2-col or stay in grid */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
            <CardDescription>Scheduled tests and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {assessments.map(({ title, when }) => (
                <li
                  key={title}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500">{when}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
