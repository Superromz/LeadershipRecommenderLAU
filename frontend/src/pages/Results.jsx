import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../api/client'

const CLASS_COLORS = {
  Transformational: '#4F46E5',
  Transactional:    '#0EA5E9',
  Supportive:       '#10B981',
  'Laissez-Faire':  '#F59E0B',
}

const CLASS_DESCRIPTIONS = {
  Transformational: 'You inspire and motivate others through a compelling vision, intellectual stimulation, and individual consideration. You drive change and foster innovation.',
  Transactional:    'You lead through clear structures, defined roles, and performance-based rewards. You excel at maintaining standards and delivering consistent results.',
  Supportive:       'You prioritise the well-being, development, and psychological safety of your team members. You build trust through empathy and genuine care.',
  'Laissez-Faire':  'You grant team members high autonomy and minimal direction. This style works well with self-driven experts but may require more active engagement.',
}

const FEATURE_LABELS = {
  role_assumption:          'Role Assumption',
  production_emphasis:      'Production Emphasis',
  initiation_of_structure:  'Initiation of Structure',
  tolerance_of_uncertainty: 'Tolerance of Uncertainty',
  integration:              'Integration',
  consideration:            'Consideration',
}

const DOMAIN_ICONS = {
  'Leadership Presence':   '🎯',
  'Performance Focus':     '📈',
  'Organisational Skills': '🗂️',
  'Resilience':            '🛡️',
  'Team Cohesion':         '🤝',
  'People Development':    '💛',
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

  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>
  if (!result) return <p className="text-center mt-20 text-gray-400">Loading results…</p>

  const { predicted_class_name, probabilities, top3_shap_features, counterfactual, recommendations } = result

  const radarData = Object.entries(FEATURE_LABELS).map(([key, label]) => ({
    subject: label,
    score: result[key] ?? 0,
    fullMark: 5,
  }))

  const probData = Object.entries(probabilities ?? {}).map(([cls, val]) => ({
    name: cls,
    probability: Math.round(val * 100),
  }))

  const shapData = (top3_shap_features ?? []).map((f) => ({
    name: FEATURE_LABELS[f.feature] ?? f.feature,
    impact: parseFloat((f.shap_value ?? 0).toFixed(3)),
  }))

  const mainColor = CLASS_COLORS[predicted_class_name] ?? '#4F46E5'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Your Leadership Style</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: mainColor }}>
          {predicted_class_name}
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          {CLASS_DESCRIPTIONS[predicted_class_name]}
        </p>
      </div>

      {/* Probability bar + Radar — side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Class probabilities */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Prediction Confidence</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={probData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                {probData.map((entry) => (
                  <Cell key={entry.name} fill={CLASS_COLORS[entry.name] ?? '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Behavioural Profile</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke={mainColor} fill={mainColor} fillOpacity={0.25} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SHAP top-3 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Top Influencing Behaviours</h2>
        <p className="text-xs text-gray-400 mb-4">
          SHAP values show how each behaviour pushed the model toward or away from your predicted style.
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={shapData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
              {shapData.map((entry) => (
                <Cell key={entry.name} fill={entry.impact >= 0 ? mainColor : '#F87171'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-3">
          Positive values reinforce the predicted style. Negative values reduce its probability.
        </p>
      </div>

      {/* Counterfactual */}
      {counterfactual && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-amber-800 mb-3">What Would Change Your Style?</h2>
          <p className="text-xs text-amber-700 mb-3">
            The smallest behavioural change that would shift your predicted style to{' '}
            <span className="font-semibold">{counterfactual.new_class}</span>:
          </p>
          <ul className="space-y-1">
            {Object.entries(counterfactual.changes ?? {}).map(([feat, delta]) => (
              <li key={feat} className="text-sm text-amber-900">
                <span className="font-medium">{FEATURE_LABELS[feat] ?? feat}</span>
                {' '}
                <span className={delta > 0 ? 'text-emerald-700' : 'text-red-600'}>
                  {delta > 0 ? `+${delta}` : delta} step{Math.abs(delta) !== 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Development Plan */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Your Development Plan</h2>
          <p className="text-xs text-gray-400 mb-5">
            Personalised guidance based on your top SHAP-identified growth areas.
          </p>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-2xl flex-shrink-0">
                  {DOMAIN_ICONS[rec.domain] ?? '📌'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: mainColor }}>
                      Priority {rec.priority}
                    </span>
                    <span className="text-xs text-gray-500">{rec.domain}</span>
                  </div>
                  <p className="text-sm text-gray-700">{rec.advice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/assessment"
          className="flex-1 text-center bg-brand text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Take Another Assessment
        </Link>
        <Link
          to="/history"
          className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          View History
        </Link>
      </div>
    </div>
  )
}
