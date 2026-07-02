import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import api from '../api/client'

const STYLE_CFG = {
  Transformational: { color: '#4F46E5', light: '#EEF2FF' },
  Transactional:    { color: '#0EA5E9', light: '#F0F9FF' },
  Supportive:       { color: '#10B981', light: '#ECFDF5' },
  'Laissez-Faire':  { color: '#F59E0B', light: '#FFFBEB' },
}

const RADAR_KEYS = [
  'role_assumption', 'production_emphasis', 'initiation_of_structure',
  'tolerance_of_uncertainty', 'integration', 'consideration',
]

const DIM_LABELS = {
  role_assumption:          'Role Assumption',
  production_emphasis:      'Production Emphasis',
  initiation_of_structure:  'Init. of Structure',
  tolerance_of_uncertainty: 'Uncertainty',
  integration:              'Integration',
  consideration:            'Consideration',
}

const FEATURE_LABEL_MAP = {
  Role_Assumption:          'Role Assumption',
  Production_Emphasis:      'Production Emphasis',
  Initiation_of_Structure:  'Init. of Structure',
  Tolerance_of_Uncertainty: 'Uncertainty',
  Integration:              'Integration',
  Consideration:            'Consideration',
}
const featureLabel = (key) => FEATURE_LABEL_MAP[key] ?? DIM_LABELS[key] ?? key.replace(/_/g, ' ')

function StyleBadge({ style }) {
  const cfg = STYLE_CFG[style] ?? { color: '#94A3B8', light: '#F8FAFC' }
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
      style={{ backgroundColor: cfg.color }}
    >
      {style}
    </span>
  )
}

function AssessmentSelector({ label, history, value, onChange, excluded }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
      >
        <option value="">Select an assessment…</option>
        {history
          .filter((h) => h.id !== excluded)
          .map((h) => {
            const conf = Math.round(Math.max(...Object.values(h.probabilities)) * 100)
            const date = new Date(h.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
            return (
              <option key={h.id} value={h.id}>
                {date} — {h.predicted_class_name} ({conf}% confidence)
              </option>
            )
          })}
      </select>
    </div>
  )
}

export default function Compare() {
  const [history, setHistory] = useState([])
  const [idA, setIdA] = useState(null)
  const [idB, setIdB] = useState(null)
  const [resultA, setResultA] = useState(null)
  const [resultB, setResultB] = useState(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    api.get('/assessment/history/')
      .then(({ data }) => setHistory(data))
      .finally(() => setHistoryLoading(false))
  }, [])

  useEffect(() => {
    if (!idA) { setResultA(null); return }
    setLoadingA(true)
    api.get(`/assessment/${idA}/`)
      .then(({ data }) => setResultA(data))
      .finally(() => setLoadingA(false))
  }, [idA])

  useEffect(() => {
    if (!idB) { setResultB(null); return }
    setLoadingB(true)
    api.get(`/assessment/${idB}/`)
      .then(({ data }) => setResultB(data))
      .finally(() => setLoadingB(false))
  }, [idB])

  const bothLoaded = resultA && resultB

  // Radar: overlay both assessments
  const radarData = RADAR_KEYS.map((key) => ({
    subject: DIM_LABELS[key],
    A: resultA?.[key] ?? 0,
    B: resultB?.[key] ?? 0,
    fullMark: 5,
  }))

  // Confidence
  const confA = resultA ? Math.round(Math.max(...Object.values(resultA.probabilities)) * 100) : 0
  const confB = resultB ? Math.round(Math.max(...Object.values(resultB.probabilities)) * 100) : 0

  const cfgA = STYLE_CFG[resultA?.predicted_class_name] ?? STYLE_CFG.Transformational
  const cfgB = STYLE_CFG[resultB?.predicted_class_name] ?? STYLE_CFG.Transformational

  const dateStr = (iso) => new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  if (historyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading history…</p>
      </div>
    )
  }

  if (history.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center text-white mx-auto">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Not enough assessments yet</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          You need at least 2 assessments to compare. Take another assessment to track your progress.
        </p>
        <Link
          to="/assessment"
          className="gradient-brand text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          Take an Assessment
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assessment Comparison</h1>
            <p className="text-sm text-gray-400 mt-0.5">Select two assessments to compare side by side</p>
          </div>
          <Link
            to="/assessment"
            className="gradient-brand text-white text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-sm"
          >
            + New Assessment
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Selectors */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
          <div className="flex gap-4 items-end flex-wrap">
            <AssessmentSelector
              label="Assessment A"
              history={history}
              value={idA}
              onChange={setIdA}
              excluded={idB ? Number(idB) : null}
            />
            <div className="flex-shrink-0 pb-2.5 text-gray-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <AssessmentSelector
              label="Assessment B"
              history={history}
              value={idB}
              onChange={setIdB}
              excluded={idA ? Number(idA) : null}
            />
          </div>
        </div>

        {/* Loading spinners */}
        {(loadingA || loadingB) && (
          <div className="flex items-center justify-center py-8 gap-3">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading results…</p>
          </div>
        )}

        {/* Comparison content */}
        {bothLoaded && !loadingA && !loadingB && (
          <>
            {/* Style headers */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { result: resultA, cfg: cfgA, label: 'A', conf: confA },
                { result: resultB, cfg: cfgB, label: 'B', conf: confB },
              ].map(({ result, cfg, label, conf }) => (
                <div
                  key={label}
                  className="rounded-2xl text-white p-5"
                  style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                        Assessment {label} · {dateStr(result.created_at)}
                      </p>
                      <h2 className="text-2xl font-extrabold">{result.predicted_class_name}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-extrabold">{conf}%</div>
                      <div className="text-white/60 text-xs">Confidence</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar overlay */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Behavioural Profile Overlay</h3>
              <p className="text-xs text-gray-400 mb-4">Both profiles plotted on the same 6-dimensional radar</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar name={`A: ${resultA.predicted_class_name}`} dataKey="A" stroke={cfgA.color} fill={cfgA.color} fillOpacity={0.2} strokeWidth={2} />
                  <Radar name={`B: ${resultB.predicted_class_name}`} dataKey="B" stroke={cfgB.color} fill={cfgB.color} fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 3" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Dimension Score Comparison</h3>
              <div className="space-y-3">
                {RADAR_KEYS.map((key) => {
                  const a = resultA[key] ?? 0
                  const b = resultB[key] ?? 0
                  const delta = b - a
                  return (
                    <div key={key} className="grid grid-cols-[1fr_2rem_3rem_3rem_3rem] items-center gap-3">
                      <span className="text-sm text-gray-700 font-medium">{DIM_LABELS[key]}</span>
                      <span
                        className="text-xs font-bold text-center px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: cfgA.light, color: cfgA.color }}
                      >{a}</span>
                      <span className={`text-xs font-bold text-center ${
                        delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {delta > 0 ? `+${delta}` : delta < 0 ? delta : '—'}
                      </span>
                      <span
                        className="text-xs font-bold text-center px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: cfgB.light, color: cfgB.color }}
                      >{b}</span>
                      <span className="text-xs text-gray-300 text-center">/ 5</span>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cfgA.color }} />
                    A: {resultA.predicted_class_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cfgB.color }} />
                    B: {resultB.predicted_class_name}
                  </span>
                  <span className="ml-auto">Middle column = B minus A</span>
                </div>
              </div>
            </div>

            {/* SHAP top-3 side by side */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { result: resultA, cfg: cfgA, label: 'A' },
                { result: resultB, cfg: cfgB, label: 'B' },
              ].map(({ result, cfg, label }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-card p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">
                    Top Drivers — <span style={{ color: cfg.color }}>Assessment {label}</span>
                  </h3>
                  <div className="space-y-3">
                    {(result.top3_shap_features ?? []).map((f, i) => {
                      const impact = parseFloat((f.shap_value ?? 0).toFixed(3))
                      const positive = impact >= 0
                      return (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700">{featureLabel(f.feature)}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-indigo-50 text-brand' : 'bg-red-50 text-red-600'}`}>
                              {positive ? '+' : ''}{impact}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(Math.abs(impact) * 200, 100)}%`,
                                backgroundColor: positive ? cfg.color : '#F87171',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Counterfactual side by side */}
            {(resultA.counterfactual || resultB.counterfactual) && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { result: resultA, label: 'A' },
                  { result: resultB, label: 'B' },
                ].map(({ result, label }) => {
                  const cf = result.counterfactual
                  const changes = Array.isArray(cf?.changes) ? cf.changes : []
                  if (!changes.length) return (
                    <div key={label} className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center text-xs text-gray-400 flex items-center justify-center">
                      No counterfactual for Assessment {label}
                    </div>
                  )
                  return (
                    <div key={label} className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-amber-900 mb-2">
                        Shift from {result.predicted_class_name} — Assessment {label}
                      </h3>
                      <p className="text-xs text-amber-700 mb-3">
                        → <strong>{cf.counterfactual_class_name}</strong>
                        {cf.proximity_distance != null && (
                          <span className="ml-2 text-xs bg-white border border-amber-200 px-2 py-0.5 rounded-full">
                            d = {cf.proximity_distance}
                          </span>
                        )}
                      </p>
                      <div className="space-y-2">
                        {changes.map((c, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 border border-amber-100">
                            <span className="text-xs text-amber-900 font-medium">{featureLabel(c.feature)}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                              c.direction === 'increase' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
                            }`}>
                              {c.direction === 'increase' ? '+ increase' : '− decrease'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!idA && !idB && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-sm">Select two assessments above to compare them</p>
          </div>
        )}

      </div>
    </div>
  )
}
