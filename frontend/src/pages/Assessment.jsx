import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

// SVG icons — one per behavioural dimension
const DIM_ICONS = {
  role_assumption: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  production_emphasis: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 3 3 5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7h3v3" />
    </svg>
  ),
  initiation_of_structure: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  tolerance_of_uncertainty: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  integration: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.356-3.772M9 20H4v-2a4 4 0 015.356-3.772M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  consideration: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

const QUESTIONS = [
  {
    key: 'role_assumption',
    label: 'Role Assumption',
    scenario: 'When joining a new team or project, I naturally step up, define responsibilities, and take ownership of the leadership role.',
    low: 'Prefer others to lead',
    high: 'Always take the lead',
  },
  {
    key: 'production_emphasis',
    label: 'Production Emphasis',
    scenario: 'I consistently push myself and others to meet performance targets, prioritising output quality and productivity above other considerations.',
    low: 'Results are secondary',
    high: 'Results-driven at all times',
  },
  {
    key: 'initiation_of_structure',
    label: 'Initiation of Structure',
    scenario: 'I establish clear tasks, timelines, and operating procedures so that team members always know exactly what is expected of them.',
    low: 'Flexible, unstructured',
    high: 'Highly structured & planned',
  },
  {
    key: 'tolerance_of_uncertainty',
    label: 'Tolerance of Uncertainty',
    scenario: 'I remain calm, decisive, and effective even when facing ambiguous situations or unexpected changes to plans.',
    low: 'Prefer certainty & stability',
    high: 'Thrive in ambiguity',
  },
  {
    key: 'integration',
    label: 'Integration',
    scenario: 'I actively work to mediate conflicts, build consensus, and bring diverse team members together toward a shared goal.',
    low: 'Let the team resolve it',
    high: 'Always bridge differences',
  },
  {
    key: 'consideration',
    label: 'Consideration',
    scenario: 'I pay careful attention to the personal needs, feelings, and well-being of each individual team member.',
    low: 'Focus on tasks over people',
    high: 'People-first approach',
  },
]

const SCALE_LABELS = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree']

const STYLE_CFG = {
  Transformational: { color: '#4F46E5', light: '#EEF2FF', gradient: 'from-indigo-500 to-violet-600' },
  Transactional:    { color: '#0EA5E9', light: '#F0F9FF', gradient: 'from-sky-500 to-blue-600' },
  Supportive:       { color: '#10B981', light: '#ECFDF5', gradient: 'from-emerald-500 to-teal-600' },
  'Laissez-Faire':  { color: '#F59E0B', light: '#FFFBEB', gradient: 'from-amber-500 to-orange-500' },
}

const DIM_KEYS = [
  'role_assumption', 'production_emphasis', 'initiation_of_structure',
  'tolerance_of_uncertainty', 'integration', 'consideration',
]
const DIM_SHORT = {
  role_assumption: 'Role',
  production_emphasis: 'Production',
  initiation_of_structure: 'Structure',
  tolerance_of_uncertainty: 'Uncertainty',
  integration: 'Integration',
  consideration: 'Consideration',
}

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

// ── Progress check intro screen ───────────────────────────────────────────────
function ProgressCheckIntro({ lastResult, assessmentCount, onStart }) {
  const cfg = STYLE_CFG[lastResult.predicted_class_name] ?? STYLE_CFG.Transformational
  const confidence = Math.round(Math.max(...Object.values(lastResult.probabilities)) * 100)

  const radarData = DIM_KEYS.map((key) => ({
    subject: DIM_SHORT[key],
    score: lastResult[key] ?? 0,
    fullMark: 5,
  }))

  const dateStr = new Date(lastResult.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-brand text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-indigo-100">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Progress Check — Assessment #{assessmentCount + 1}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Track your leadership development</h1>
          <p className="text-gray-500 text-sm">
            You've taken this assessment {assessmentCount} time{assessmentCount !== 1 ? 's' : ''} before.
            Retake it to see if your behavioural profile has shifted.
          </p>
        </div>

        {/* Last result card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden mb-6">
          <div className={`bg-gradient-to-br ${cfg.gradient} text-white px-6 py-4`}>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Your last result · {dateStr}</p>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold">{lastResult.predicted_class_name}</h2>
                <p className="text-white/70 text-xs mt-0.5">
                  {Object.entries(lastResult.probabilities)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([k, v]) => `${k} ${Math.round(v * 100)}%`)
                    .join(' · ')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold">{confidence}%</div>
                <div className="text-white/60 text-xs">Confidence</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your previous behavioural scores</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {DIM_KEYS.map((key) => (
                <div key={key} className="text-center rounded-xl p-2.5" style={{ backgroundColor: cfg.light }}>
                  <div className="text-lg font-extrabold" style={{ color: cfg.color }}>{lastResult[key]}</div>
                  <div className="text-xs text-gray-500 leading-tight">{DIM_SHORT[key]}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#6B7280' }} />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke={cfg.color} fill={cfg.color} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Why retake */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Why retake?</p>
          <ul className="space-y-2">
            {[
              'See if your behavioural profile has changed since last time',
              'Track development against the recommendations you received',
              'Each result is stored separately — your history is preserved',
              'New results update your consistency and trend analytics',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onStart}
            className="flex-1 gradient-brand text-white py-3.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Start progress check
          </button>
          <Link
            to={`/results/${lastResult.id}`}
            className="flex-1 text-center bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-card"
          >
            View last result
          </Link>
        </div>

      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Assessment() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [phase, setPhase]           = useState('loading') // loading | intro | questions
  const [lastResult, setLastResult] = useState(null)
  const [assessmentCount, setAssessmentCount] = useState(0)

  const [step, setStep]     = useState(0)
  const [scores, setScores] = useState({
    role_assumption: 0, production_emphasis: 0, initiation_of_structure: 0,
    tolerance_of_uncertainty: 0, integration: 0, consideration: 0,
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // On mount: check assessment history
  useEffect(() => {
    api.get('/assessment/history/')
      .then(({ data }) => {
        if (data.length > 0) {
          setAssessmentCount(data.length)
          // Fetch the most recent full result for the intro screen
          return api.get(`/assessment/${data[0].id}/`).then(({ data: full }) => {
            setLastResult(full)
            setPhase('intro')
          })
        } else {
          setPhase('questions')
        }
      })
      .catch(() => setPhase('questions')) // On error, just go straight to questions
  }, [])

  const total      = QUESTIONS.length
  const q          = QUESTIONS[step]
  const answered   = scores[q.key] > 0
  const allAnswered = Object.values(scores).every((v) => v > 0)
  const isLast     = step === total - 1
  const progress   = (Object.values(scores).filter((v) => v > 0).length / total) * 100

  const handleSelect = (val) => setScores({ ...scores, [q.key]: val })
  const handleNext   = () => { if (answered && !isLast) setStep(step + 1) }
  const handleBack   = () => { if (step > 0) setStep(step - 1) }

  const handleSubmit = async () => {
    if (!allAnswered) { setError('Please answer all questions before submitting.'); return }
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...scores,
        country:               user.country,
        age:                   user.age,
        gender:                user.gender,
        education_level:       user.education_level,
        work_experience_years: user.work_experience_years,
        position_level:        user.position_level,
      }
      const { data } = await api.post('/assessment/submit/', payload)
      navigate(`/results/${data.id}`)
    } catch (err) {
      const data = err.response?.data
      setError(data ? JSON.stringify(data) : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  // ── Progress check intro ───────────────────────────────────────────────────
  if (phase === 'intro' && lastResult) {
    return (
      <ProgressCheckIntro
        lastResult={lastResult}
        assessmentCount={assessmentCount}
        onStart={() => setPhase('questions')}
      />
    )
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">
                {assessmentCount > 0 ? `Progress Check #${assessmentCount + 1}` : 'Leadership Assessment'}
              </p>
              <p className="text-sm font-semibold text-gray-700">Question {step + 1} of {total}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">{Math.round(progress)}% complete</p>
              <div className="flex gap-1">
                {QUESTIONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`w-6 h-1.5 rounded-full transition-colors ${
                      scores[QUESTIONS[i].key] > 0 ? 'bg-brand' :
                      i === step ? 'bg-gray-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div
              className="gradient-brand h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 flex gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          {/* Icon + label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center text-white shadow-sm">
              {DIM_ICONS[q.key]}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Dimension {step + 1}</p>
              <h2 className="text-lg font-bold text-gray-900">{q.label}</h2>
            </div>
            {/* Show previous score badge for returning users */}
            {lastResult && lastResult[q.key] && (
              <div className="ml-auto text-right">
                <span className="text-xs text-gray-400">Last time:</span>
                <span className="ml-1 text-xs font-bold text-brand bg-brand-light px-2 py-0.5 rounded-full">
                  {lastResult[q.key]} / 5
                </span>
              </div>
            )}
          </div>

          {/* Scenario */}
          <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
            <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{q.scenario}&rdquo;</p>
          </div>

          {/* Scale */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">How much does this describe you?</p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((val) => {
              const selected = scores[q.key] === val
              const wasPrevious = lastResult && lastResult[q.key] === val && !selected
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelect(val)}
                  className={`flex flex-col items-center py-4 rounded-xl border-2 transition-all duration-150 ${
                    selected
                      ? 'border-brand bg-brand-light shadow-sm scale-105'
                      : wasPrevious
                      ? 'border-gray-300 bg-gray-50 ring-1 ring-gray-200'
                      : 'border-gray-200 bg-white hover:border-brand/40 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xl font-bold mb-1 ${selected ? 'text-brand' : 'text-gray-400'}`}>{val}</span>
                  <span className={`text-center text-xs leading-tight whitespace-pre-line ${selected ? 'text-brand font-medium' : 'text-gray-400'}`}>
                    {SCALE_LABELS[val - 1]}
                  </span>
                  {wasPrevious && (
                    <span className="text-xs text-gray-400 mt-1 leading-none">prev</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Low/high labels */}
          <div className="flex justify-between text-xs text-gray-400 px-1 mb-8">
            <span>{q.low}</span>
            <span>{q.high}</span>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 items-center">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            <div className="flex-1" />
            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !allAnswered}
                className="flex items-center gap-2 px-8 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Analysing…
                  </>
                ) : (
                  <>
                    Submit & Get Results
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!answered}
                className="flex items-center gap-2 px-8 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mini dimension overview */}
        <div className="mt-6 grid grid-cols-6 gap-2">
          {QUESTIONS.map((qItem, i) => {
            const done   = scores[qItem.key] > 0
            const active = i === step
            return (
              <button
                key={i}
                onClick={() => setStep(i)}
                title={qItem.label}
                className={`rounded-xl p-2.5 flex flex-col items-center gap-1.5 border transition-all ${
                  active ? 'border-brand bg-brand-light shadow-sm'
                  : done  ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={active ? 'text-brand' : done ? 'text-green-600' : 'text-gray-400'}>
                  {done && !active
                    ? <CheckIcon />
                    : <span className={`w-4 h-4 block ${active ? 'text-brand' : 'text-gray-400'}`}>{DIM_ICONS[qItem.key]}</span>
                  }
                </span>
                {done && (
                  <span className={`text-xs font-bold ${active ? 'text-brand' : 'text-green-600'}`}>
                    {scores[qItem.key]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Click any dimension above to jump to that question
        </p>
      </div>
    </div>
  )
}
