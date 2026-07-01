import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
  PieChart, Pie,
} from 'recharts'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

// ── Style config ─────────────────────────────────────────────────────────────
const STYLE_CFG = {
  Transformational: { color: '#4F46E5', light: '#EEF2FF' },
  Transactional:    { color: '#0EA5E9', light: '#F0F9FF' },
  Supportive:       { color: '#10B981', light: '#ECFDF5' },
  'Laissez-Faire':  { color: '#F59E0B', light: '#FFFBEB' },
}

const FEATURE_LABELS = {
  role_assumption:          'Role Assumption',
  production_emphasis:      'Production Emphasis',
  initiation_of_structure:  'Init. of Structure',
  tolerance_of_uncertainty: 'Tolerance of Uncertainty',
  integration:              'Integration',
  consideration:            'Consideration',
}

// ── SVG Icon set ─────────────────────────────────────────────────────────────
const Icon = {
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5-5 4 4 5-5 4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.356-3.772M9 20H4v-2a4 4 0 015.356-3.772M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </svg>
  ),
  lightning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
    </svg>
  ),
  trend: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 3 3 5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7h3v3" />
    </svg>
  ),
}

// ── Reusable card ─────────────────────────────────────────────────────────────
function Card({ title, subtitle, icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-card p-6 ${className}`}>
      {(title || icon) && (
        <div className="flex items-start gap-3 mb-5">
          {icon && (
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#4F46E5', light = '#EEF2FF' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: light }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-card-hover px-3 py-2 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/assessment/analytics/')
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load analytics.'))
  }, [])

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  )

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading analytics…</p>
    </div>
  )

  const { personal, global: globalData } = data
  const hasPersonal = personal.total_assessments > 0
  const mainStyle = STYLE_CFG[personal.dominant_style] ?? STYLE_CFG.Transformational

  // Radar data — personal avg vs global avg
  const radarData = Object.entries(FEATURE_LABELS).map(([key, label]) => ({
    subject: label,
    You: personal.avg_scores[key] ?? 0,
    Global: globalData.avg_scores[key] ?? 0,
    fullMark: 5,
  }))

  // Dimension trend (timeline, last 8)
  const trendData = personal.timeline.map((t) => ({
    date: t.date,
    confidence: t.confidence,
    ...Object.fromEntries(Object.keys(FEATURE_LABELS).map((k) => [FEATURE_LABELS[k].split(' ')[0], t[k]])),
  }))

  // SHAP frequency bar
  const shapFreqData = personal.shap_frequency.map((s) => ({
    name: FEATURE_LABELS[s.feature] ?? s.feature,
    count: s.count,
  }))

  // Global style distribution (pie-like)
  const globalStyles = globalData.style_distribution

  // Style by position — fill missing styles with 0
  const ALL_STYLES = Object.keys(STYLE_CFG)
  const positionData = globalData.style_by_position.map((row) => ({
    ...row,
    ...Object.fromEntries(ALL_STYLES.map((s) => [s, row[s] ?? 0])),
  }))

  // Style by country
  const countryData = globalData.style_by_country.map((row) => ({
    ...row,
    ...Object.fromEntries(ALL_STYLES.map((s) => [s, row[s] ?? 0])),
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">AI-powered insights from your assessments</p>
          </div>
          <Link
            to="/assessment"
            className="gradient-brand text-white text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-sm"
          >
            + New Assessment
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── PERSONAL SECTION ─────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 gradient-brand rounded-full" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Your Analytics</h2>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Icon.clipboard}
              label="Total Assessments"
              value={personal.total_assessments}
              color="#4F46E5" light="#EEF2FF"
            />
            <StatCard
              icon={Icon.star}
              label="Dominant Style"
              value={personal.dominant_style ?? '—'}
              sub={hasPersonal ? `${personal.style_distribution.find(s => s.style === personal.dominant_style)?.count ?? 0} times` : undefined}
              color={mainStyle.color} light={mainStyle.light}
            />
            <StatCard
              icon={Icon.target}
              label="Style Consistency"
              value={hasPersonal ? `${personal.consistency_pct}%` : '—'}
              sub="Same style across assessments"
              color="#10B981" light="#ECFDF5"
            />
            <StatCard
              icon={Icon.lightning}
              label="SHAP Key Driver"
              value={personal.shap_frequency[0] ? FEATURE_LABELS[personal.shap_frequency[0].feature]?.split(' ')[0] : '—'}
              sub="Most influential behaviour"
              color="#F59E0B" light="#FFFBEB"
            />
          </div>

          {hasPersonal ? (
            <>
              {/* Radar: you vs global */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <Card
                  title="Behavioural Profile — You vs Global Average"
                  subtitle="How your dimension scores compare to all platform users"
                  icon={Icon.chart}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar name="You" dataKey="You" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.25} strokeWidth={2} />
                      <Radar name="Global Avg" dataKey="Global" stroke="#D1D5DB" fill="#D1D5DB" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>

                {/* SHAP frequency */}
                <Card
                  title="Top SHAP Drivers"
                  subtitle="Behaviours most frequently identified as key predictors across your assessments"
                  icon={Icon.lightning}
                >
                  {shapFreqData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={shapFreqData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={145} tick={{ fontSize: 10 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="count" name="Times in Top 3" radius={[0, 6, 6, 0]}>
                          {shapFreqData.map((_, i) => (
                            <Cell key={i} fill={['#4F46E5','#0EA5E9','#10B981','#F59E0B','#8B5CF6','#F43F5E'][i % 6]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-16">No SHAP data yet</p>
                  )}
                </Card>
              </div>

              {/* Confidence over time */}
              {trendData.length > 1 && (
                <Card
                  title="Assessment Confidence Over Time"
                  subtitle="Model confidence in your predicted style per assessment"
                  icon={Icon.trend}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid stroke="#F1F5F9" strokeDasharray="4 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `${v}%`} content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4, fill: '#4F46E5' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
              <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand">
                {Icon.clipboard}
              </div>
              <p className="text-gray-700 font-semibold mb-1">No assessments yet</p>
              <p className="text-sm text-gray-400 mb-5">Complete your first assessment to unlock personal analytics.</p>
              <Link to="/assessment" className="gradient-brand text-white text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-semibold inline-block">
                Take Assessment →
              </Link>
            </div>
          )}
        </div>

        {/* ── GLOBAL SECTION ───────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Platform Insights</h2>
            <span className="text-xs text-gray-400 ml-1">— aggregate data across all users</span>
          </div>

          {/* Global stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Icon.users}     label="Registered Users"      value={globalData.total_users}       color="#0EA5E9" light="#F0F9FF" />
            <StatCard icon={Icon.clipboard} label="Total Assessments"     value={globalData.total_assessments} color="#4F46E5" light="#EEF2FF" />
            <StatCard
              icon={Icon.star}
              label="Most Common Style"
              value={globalData.style_distribution[0]?.style?.split('-')[0] ?? '—'}
              sub={`${globalData.style_distribution[0]?.count ?? 0} assessments`}
              color={STYLE_CFG[globalData.style_distribution[0]?.style]?.color ?? '#4F46E5'}
              light={STYLE_CFG[globalData.style_distribution[0]?.style]?.light ?? '#EEF2FF'}
            />
            <StatCard
              icon={Icon.globe}
              label="Countries"
              value={globalData.style_by_country.length}
              sub="In cross-cultural dataset"
              color="#10B981" light="#ECFDF5"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Global style distribution */}
            <Card
              title="Global Style Distribution"
              subtitle="Breakdown of leadership styles across all assessments"
              icon={Icon.chart}
            >
              <div className="space-y-3">
                {globalStyles.map((s) => {
                  const cfg = STYLE_CFG[s.style] ?? { color: '#94A3B8', light: '#F8FAFC' }
                  const pct = globalData.total_assessments > 0
                    ? Math.round(s.count / globalData.total_assessments * 100)
                    : 0
                  return (
                    <div key={s.style}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{s.style}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{s.count} assessments</span>
                          <span className="text-xs font-bold" style={{ color: cfg.color }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Global radar */}
            <Card
              title="Global Average Behavioural Profile"
              subtitle="Mean scores across all platform users"
              icon={Icon.target}
            >
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart
                  data={Object.entries(FEATURE_LABELS).map(([key, label]) => ({
                    subject: label,
                    score: globalData.avg_scores[key] ?? 0,
                    fullMark: 5,
                  }))}
                  margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                >
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar dataKey="score" name="Global Avg" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip content={<ChartTooltip />} formatter={(v) => [v + ' / 5', 'Avg Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Style by country */}
          {countryData.length > 0 && (
            <Card
              title="Leadership Style by Country"
              subtitle="Cross-cultural distribution — aligned with Hofstede cultural dimensions research"
              icon={Icon.globe}
              className="mb-5"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={countryData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="4 3" vertical={false} />
                  <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  {ALL_STYLES.map((s) => (
                    <Bar key={s} dataKey={s} name={s} stackId="a" fill={STYLE_CFG[s].color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Style by position level */}
          {positionData.some((p) => ALL_STYLES.some((s) => p[s] > 0)) && (
            <Card
              title="Leadership Style by Position Level"
              subtitle="How seniority correlates with leadership style"
              icon={Icon.trend}
            >
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={positionData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="4 3" vertical={false} />
                  <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  {ALL_STYLES.map((s) => (
                    <Bar key={s} dataKey={s} name={s} stackId="a" fill={STYLE_CFG[s].color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
