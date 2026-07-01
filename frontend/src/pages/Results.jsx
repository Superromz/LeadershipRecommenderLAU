import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../api/client'

const STYLES = {
  Transformational: {
    gradient: 'from-indigo-600 to-violet-600',
    color:    '#4F46E5',
    light:    '#EEF2FF',
    icon:     '🚀',
    tagline:  'Vision · Inspiration · Innovation',
    description: 'You inspire others through a compelling vision, intellectual challenge, and personalised support. You are a catalyst for change and growth.',
  },
  Transactional: {
    gradient: 'from-sky-500 to-blue-600',
    color:    '#0EA5E9',
    light:    '#F0F9FF',
    icon:     '⚙️',
    tagline:  'Structure · Accountability · Results',
    description: 'You lead through clear expectations, defined roles, and performance-based recognition. You deliver consistent, measurable outcomes.',
  },
  Supportive: {
    gradient: 'from-emerald-500 to-teal-600',
    color:    '#10B981',
    light:    '#ECFDF5',
    icon:     '💚',
    tagline:  'Empathy · Trust · Well-being',
    description: 'You prioritise the well-being and development of your team members. You build psychological safety and lead with genuine care.',
  },
  'Laissez-Faire': {
    gradient: 'from-amber-500 to-orange-500',
    color:    '#F59E0B',
    light:    '#FFFBEB',
    icon:     '🕊️',
    tagline:  'Autonomy · Freedom · Trust',
    description: 'You grant high autonomy and minimal interference. This works best with self-driven experts — though more active engagement may be needed.',
  },
}

const FEATURE_LABELS = {
  role_assumption:          'Role Assumption',
  production_emphasis:      'Production Emphasis',
  initiation_of_structure:  'Initiation of Structure',
  tolerance_of_uncertainty: 'Tolerance of Uncertainty',
  integration:              'Integration',
  consideration:            'Consideration',
}

function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-gray-900">{children}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function Results() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/assessment/${id}/`)
      .then(({ data }) => setResult(data))
      .catch(() => setError('Could not load result.'))
  }, [id])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <Link to="/history" className="text-brand text-sm hover:underline">← Back to history</Link>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Generating your results…</p>
      </div>
    )
  }

  const { predicted_class_name, probabilities, top3_shap_features, counterfactual, recommendations } = result
  const style = STYLES[predicted_class_name] ?? STYLES.Transformational

  const radarData = Object.entries(FEATURE_LABELS).map(([key, label]) => ({
    subject: label.replace(' ', '\n'),
    score: result[key] ?? 0,
    fullMark: 5,
  }))

  const probData = Object.entries(probabilities ?? {})
    .map(([cls, val]) => ({ name: cls, pct: Math.round(val * 100) }))
    .sort((a, b) => b.pct - a.pct)

  const shapData = (top3_shap_features ?? []).map((f) => ({
    name: FEATURE_LABELS[f.feature] ?? f.feature,
    impact: parseFloat((f.shap_value ?? 0).toFixed(3)),
    positive: (f.shap_value ?? 0) >= 0,
  }))

  const topProb = probData[0]?.pct ?? 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className={`bg-gradient-to-br ${style.gradient} text-white`}>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Your Leadership Style</p>
          <div className="flex items-start gap-5">
            <div className="text-5xl">{style.icon}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold tracking-tight mb-1">{predicted_class_name}</h1>
              <p className="text-white/70 text-sm font-medium mb-3">{style.tagline}</p>
              <p className="text-white/90 text-sm leading-relaxed max-w-xl">{style.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-4xl font-extrabold">{topProb}%</div>
              <div className="text-white/60 text-xs mt-0.5">Confidence</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Confidence + Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Probability bars */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
            <SectionTitle subtitle="Model confidence across all four leadership styles">
              Prediction Confidence
            </SectionTitle>
            <div className="space-y-3">
              {probData.map((item) => {
                const s = STYLES[item.name]
                const isTop = item.name === predicted_class_name
                return (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-medium ${isTop ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.name}
                      </span>
                      <span className={`text-xs font-bold ${isTop ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.pct}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${item.pct}%`, backgroundColor: s?.color ?? '#94A3B8' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Radar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
            <SectionTitle subtitle="Your scores across the 6 behavioural dimensions">
              Behavioural Profile
            </SectionTitle>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#6B7280' }} />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke={style.color}
                  fill={style.color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }}
                  formatter={(v) => [v + ' / 5', 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SHAP panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
          <SectionTitle subtitle="SHAP values quantify how each behaviour influenced the model's prediction">
            Top Influencing Behaviours
          </SectionTitle>
          <div className="space-y-4 mb-4">
            {shapData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.positive ? 'bg-indigo-50 text-brand' : 'bg-red-50 text-red-600'
                  }`}>
                    {item.positive ? '+' : ''}{item.impact}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(Math.abs(item.impact) * 200, 100)}%`,
                      backgroundColor: item.positive ? style.color : '#F87171',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: style.color }} />
              Reinforces {predicted_class_name}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              Reduces probability
            </span>
          </div>
        </div>

        {/* Counterfactual */}
        {counterfactual && counterfactual.changes && Object.keys(counterfactual.changes).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-amber-900 mb-1">What Would Shift Your Style?</h2>
                <p className="text-xs text-amber-700 mb-4">
                  The minimum behavioural change that would reclassify you as{' '}
                  <span className="font-bold">{counterfactual.new_class}</span>:
                </p>
                <div className="space-y-2">
                  {Object.entries(counterfactual.changes).map(([feat, delta]) => (
                    <div key={feat} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-2.5 border border-amber-100">
                      <span className="text-sm text-amber-900 font-medium">
                        {FEATURE_LABELS[feat] ?? feat}
                      </span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${
                        delta > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
                      }`}>
                        {delta > 0 ? `+${delta}` : delta} step{Math.abs(delta) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Development Plan */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
            <SectionTitle subtitle="Personalised guidance based on your top SHAP-identified growth areas">
              Your Development Plan
            </SectionTitle>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="rounded-xl border border-gray-100 p-5" style={{ backgroundColor: style.light }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold text-white px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: style.color }}
                    >
                      Priority {rec.priority}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{rec.domain}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec.advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <Link
            to="/assessment"
            className="flex-1 text-center gradient-brand text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            Take Another Assessment
          </Link>
          <Link
            to="/history"
            className="flex-1 text-center bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-card"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  )
}
