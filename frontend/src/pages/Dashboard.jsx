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

// Handles both lowercase (radar keys) and Title_Case (SHAP engine output)
const FEATURE_LABELS = {
  role_assumption:          'Role Assumption',
  production_emphasis:      'Production Emphasis',
  initiation_of_structure:  'Init. of Structure',
  tolerance_of_uncertainty: 'Tolerance of Uncertainty',
  integration:              'Integration',
  consideration:            'Consideration',
  Role_Assumption:          'Role Assumption',
  Production_Emphasis:      'Production Emphasis',
  Initiation_of_Structure:  'Init. of Structure',
  Tolerance_of_Uncertainty: 'Tolerance of Uncertainty',
  Integration:              'Integration',
  Consideration:            'Consideration',
}
const featureLabel = (key) => FEATURE_LABELS[key] ?? key.replace(/_/g, ' ')

const RADAR_KEYS = [
  'role_assumption', 'production_emphasis', 'initiation_of_structure',
  'tolerance_of_uncertainty', 'integration', 'consideration',
]

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
  const [modelComp, setModelComp] = useState(null)
  const [error, setError] = useState('')
  const [csvExporting, setCsvExporting] = useState(false)

  const downloadCSV = async () => {
    setCsvExporting(true)
    try {
      const token = localStorage.getItem('access')
      const res = await fetch('/api/assessment/export-csv/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'lau_assessment_export.csv'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setCsvExporting(false)
    }
  }

  useEffect(() => {
    api.get('/assessment/analytics/')
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load analytics.'))
    api.get('/assessment/model-comparison/')
      .then(({ data }) => setModelComp(data))
      .catch(() => {/* non-critical */})
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
  const radarData = RADAR_KEYS.map((key) => ({
    subject: featureLabel(key),
    You: personal.avg_scores[key] ?? 0,
    Global: globalData.avg_scores[key] ?? 0,
    fullMark: 5,
  }))

  // Dimension trend (timeline, last 8)
  const trendData = personal.timeline.map((t) => ({
    date: t.date,
    confidence: t.confidence,
    ...Object.fromEntries(RADAR_KEYS.map((k) => [featureLabel(k).split(' ')[0], t[k]])),
  }))

  // SHAP frequency bar
  const shapFreqData = personal.shap_frequency.map((s) => ({
    name: featureLabel(s.feature),
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
              value={personal.shap_frequency[0] ? featureLabel(personal.shap_frequency[0].feature).split(' ')[0] : '—'}
              sub="Most influential behaviour"
              color="#F59E0B" light="#FFFBEB"
            />
          </div>

          {/* Goal Progress */}
          {user?.target_leadership_style && (
            <div className={`rounded-2xl p-5 mb-6 border ${
              user.target_leadership_style === personal.dominant_style
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-white border-gray-200 shadow-card'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  user.target_leadership_style === personal.dominant_style
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'gradient-brand text-white'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-900">Your Development Goal</h3>
                    {user.target_leadership_style === personal.dominant_style && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Goal Achieved!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Current:</span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: STYLE_CFG[personal.dominant_style]?.color ?? '#94A3B8' }}
                      >
                        {personal.dominant_style ?? 'None yet'}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Goal:</span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: STYLE_CFG[user.target_leadership_style]?.color ?? '#94A3B8' }}
                      >
                        {user.target_leadership_style}
                      </span>
                    </div>
                  </div>
                  {user.target_leadership_style !== personal.dominant_style && hasPersonal && (
                    <p className="text-xs text-gray-500 mt-2">
                      You've achieved your goal style in{' '}
                      <strong>
                        {personal.style_distribution.find(s => s.style === user.target_leadership_style)?.count ?? 0}
                      </strong> of <strong>{personal.total_assessments}</strong> assessments.
                      Keep retaking to track your progress.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Survey stats */}
          {personal.survey && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-indigo-900 mb-1">
                    H3 Satisfaction — {personal.survey.count} response{personal.survey.count !== 1 ? 's' : ''}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { label: 'Relevance',       val: personal.survey.avg_relevance },
                      { label: 'Personalisation', val: personal.survey.avg_personalisation },
                      { label: 'Usefulness',      val: personal.survey.avg_usefulness },
                    ].map((item) => (
                      <div key={item.label} className="bg-white rounded-xl p-3 text-center">
                        <div className="text-xl font-extrabold text-indigo-700">{item.val}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                        <div className="w-full bg-indigo-100 rounded-full h-1.5 mt-1.5">
                          <div className="h-1.5 rounded-full bg-brand" style={{ width: `${item.val / 5 * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-600 mt-2">
                    {personal.survey.useful_pct}% of responses rated usefulness ≥ 4
                    {personal.survey.useful_pct >= 70
                      ? ' — H3 target (70%) met'
                      : ' — H3 target (70%) not yet met'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* H2 Cosine Similarity Consistency */}
          {personal.cosine_consistency && (
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-violet-900">H2 — Cosine Similarity Consistency</h3>
                    <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                      threshold = {personal.cosine_consistency.threshold}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Total Pairs',      val: personal.cosine_consistency.total_pairs },
                      { label: 'Similar Pairs',    val: personal.cosine_consistency.similar_pairs, sub: `≥ ${personal.cosine_consistency.threshold}` },
                      { label: 'Consistent Pairs', val: personal.cosine_consistency.consistent_pairs, sub: 'same style' },
                      {
                        label: 'Consistency Rate',
                        val: personal.cosine_consistency.consistency_rate != null
                          ? `${personal.cosine_consistency.consistency_rate}%`
                          : '—',
                        highlight: true,
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-white rounded-xl p-3 text-center">
                        <div className={`text-xl font-extrabold ${item.highlight ? 'text-violet-700' : 'text-gray-800'}`}>
                          {item.val}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                        {item.sub && <div className="text-xs text-gray-400">{item.sub}</div>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-violet-600 mt-2">
                    Pairwise cosine similarity between response vectors. Threshold = 75th percentile of all pairwise similarities.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  data={RADAR_KEYS.map((key) => ({
                    subject: featureLabel(key),
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

        {/* ── H1 MODEL COMPARISON ──────────────────────────────── */}
        {modelComp && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full" />
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">H1 — Model Comparison</h2>
              <span className="text-xs text-gray-400 ml-1">— XGBoost vs baseline classifiers on test split</span>
            </div>
            <Card
              title="Benchmark Results"
              subtitle={modelComp.description}
              icon={Icon.chart}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Model</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Accuracy</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Macro F1</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Precision</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Recall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelComp.models.map((m) => (
                      <tr
                        key={m.name}
                        className={`border-b border-gray-50 ${m.selected ? 'bg-indigo-50 rounded-xl' : 'hover:bg-gray-50'}`}
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${m.selected ? 'text-brand' : 'text-gray-700'}`}>
                              {m.name}
                            </span>
                            {m.selected && (
                              <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full font-semibold">Selected</span>
                            )}
                            {m.note && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                *
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-3 px-3">
                          <span className={`font-bold ${m.selected ? 'text-brand' : 'text-gray-700'}`}>
                            {(m.accuracy * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${m.macro_f1 * 100}%`,
                                  backgroundColor: m.selected ? '#4F46E5' : '#94A3B8',
                                }}
                              />
                            </div>
                            <span className={`font-bold w-10 text-right ${m.selected ? 'text-brand' : 'text-gray-700'}`}>
                              {(m.macro_f1 * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-3 text-gray-500">{(m.macro_precision * 100).toFixed(1)}%</td>
                        <td className="text-right py-3 px-3 text-gray-500">{(m.macro_recall * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {modelComp.models.find((m) => m.note) && (
                <p className="text-xs text-amber-600 mt-3 pt-3 border-t border-gray-100">
                  * Logistic Regression anomalously high — likely reflects the synthetic dataset's linear separability, not real-world generalisation.
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={modelComp.models.map((m) => ({ name: m.short, f1: parseFloat((m.macro_f1 * 100).toFixed(1)), selected: m.selected }))}
                    margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid stroke="#F1F5F9" strokeDasharray="4 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `${v}%`} content={<ChartTooltip />} />
                    <Bar dataKey="f1" name="Macro F1" radius={[6, 6, 0, 0]}>
                      {modelComp.models.map((m, i) => (
                        <Cell key={i} fill={m.selected ? '#4F46E5' : '#CBD5E1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── ADMIN: RESEARCH EXPORT ─────────────────────────── */}
        {user?.is_staff && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-rose-500 to-pink-600 rounded-full" />
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Research Export</h2>
              <span className="text-xs text-gray-400 ml-1">— Admin only</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Download Assessment Data</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Full CSV export of all assessment results, demographics, behavioural scores, and H3 survey responses.
                </p>
              </div>
              <button
                onClick={downloadCSV}
                disabled={csvExporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex-shrink-0"
              >
                {csvExporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Exporting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
