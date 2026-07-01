import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const QUESTIONS = [
  {
    key: 'role_assumption',
    label: 'Role Assumption',
    icon: '🎯',
    scenario: 'When joining a new team or project, I naturally step up, define responsibilities, and take ownership of the leadership role.',
    low: 'Prefer others to lead',
    high: 'Always take the lead',
  },
  {
    key: 'production_emphasis',
    label: 'Production Emphasis',
    icon: '📈',
    scenario: 'I consistently push myself and others to meet performance targets, prioritising output quality and productivity above other considerations.',
    low: 'Results are secondary',
    high: 'Results-driven at all times',
  },
  {
    key: 'initiation_of_structure',
    label: 'Initiation of Structure',
    icon: '🗂️',
    scenario: 'I establish clear tasks, timelines, and operating procedures so that team members always know exactly what is expected of them.',
    low: 'Flexible, unstructured',
    high: 'Highly structured & planned',
  },
  {
    key: 'tolerance_of_uncertainty',
    label: 'Tolerance of Uncertainty',
    icon: '🛡️',
    scenario: 'I remain calm, decisive, and effective even when facing ambiguous situations or unexpected changes to plans.',
    low: 'Prefer certainty & stability',
    high: 'Thrive in ambiguity',
  },
  {
    key: 'integration',
    label: 'Integration',
    icon: '🤝',
    scenario: 'I actively work to mediate conflicts, build consensus, and bring diverse team members together toward a shared goal.',
    low: 'Let team resolve it',
    high: 'Always bridge differences',
  },
  {
    key: 'consideration',
    label: 'Consideration',
    icon: '💛',
    scenario: 'I pay careful attention to the personal needs, feelings, and well-being of each individual team member.',
    low: 'Focus on tasks over people',
    high: 'People-first approach',
  },
]

const SCALE_LABELS = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree']

export default function Assessment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState({
    role_assumption: 0, production_emphasis: 0, initiation_of_structure: 0,
    tolerance_of_uncertainty: 0, integration: 0, consideration: 0,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const total = QUESTIONS.length
  const q = QUESTIONS[step]
  const answered = scores[q.key] > 0
  const allAnswered = Object.values(scores).every((v) => v > 0)
  const isLast = step === total - 1
  const progress = (Object.values(scores).filter((v) => v > 0).length / total) * 100

  const handleSelect = (val) => {
    setScores({ ...scores, [q.key]: val })
  }

  const handleNext = () => {
    if (!answered) return
    if (isLast) return
    setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">Leadership Assessment</p>
              <p className="text-sm font-semibold text-gray-700">
                Question {step + 1} of {total}
              </p>
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
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-8">
          {/* Icon + label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center text-xl shadow-sm">
              {q.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Dimension {step + 1}</p>
              <h2 className="text-lg font-bold text-gray-900">{q.label}</h2>
            </div>
          </div>

          {/* Scenario */}
          <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
            <p className="text-gray-600 text-sm leading-relaxed">
              &ldquo;{q.scenario}&rdquo;
            </p>
          </div>

          {/* Scale */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">How much does this describe you?</p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((val) => {
              const selected = scores[q.key] === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelect(val)}
                  className={`flex flex-col items-center py-4 rounded-xl border-2 transition-all duration-150 ${
                    selected
                      ? 'border-brand bg-brand-light shadow-sm scale-105'
                      : 'border-gray-200 bg-white hover:border-brand/40 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xl font-bold mb-1 ${selected ? 'text-brand' : 'text-gray-400'}`}>{val}</span>
                  <span className={`text-center text-xs leading-tight whitespace-pre-line ${selected ? 'text-brand font-medium' : 'text-gray-400'}`}>
                    {SCALE_LABELS[val - 1]}
                  </span>
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
          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
            )}
            <div className="flex-1" />
            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !allAnswered}
                className="px-8 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Analysing your style…' : 'Submit & Get Results →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!answered}
                className="px-8 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Mini overview */}
        <div className="mt-6 grid grid-cols-6 gap-2">
          {QUESTIONS.map((qItem, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-xl p-2.5 flex flex-col items-center gap-1 border transition-all ${
                i === step
                  ? 'border-brand bg-brand-light shadow-sm'
                  : scores[qItem.key] > 0
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-base">{qItem.icon}</span>
              {scores[qItem.key] > 0 && (
                <span className={`text-xs font-bold ${i === step ? 'text-brand' : 'text-green-600'}`}>
                  {scores[qItem.key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Click any dimension above to jump to that question
        </p>
      </div>
    </div>
  )
}
