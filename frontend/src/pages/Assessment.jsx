import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const QUESTIONS = [
  {
    key: 'role_assumption',
    label: 'Role Assumption',
    scenario:
      'When joining a new team or project, I naturally step up, define responsibilities, and take ownership of the leadership role.',
  },
  {
    key: 'production_emphasis',
    label: 'Production Emphasis',
    scenario:
      'I consistently push myself and others to meet performance targets, prioritising output quality and productivity above other considerations.',
  },
  {
    key: 'initiation_of_structure',
    label: 'Initiation of Structure',
    scenario:
      'I establish clear tasks, timelines, and operating procedures so that team members always know exactly what is expected of them.',
  },
  {
    key: 'tolerance_of_uncertainty',
    label: 'Tolerance of Uncertainty',
    scenario:
      'I remain calm, decisive, and effective even when facing ambiguous situations or unexpected changes to plans.',
  },
  {
    key: 'integration',
    label: 'Integration',
    scenario:
      'I actively work to mediate conflicts, build consensus, and bring diverse team members together toward a shared goal.',
  },
  {
    key: 'consideration',
    label: 'Consideration',
    scenario:
      'I pay careful attention to the personal needs, feelings, and well-being of each individual team member.',
  },
]

const LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

export default function Assessment() {
  const navigate = useNavigate()
  const [scores, setScores] = useState({
    role_assumption: 0,
    production_emphasis: 0,
    initiation_of_structure: 0,
    tolerance_of_uncertainty: 0,
    integration: 0,
    consideration: 0,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const allAnswered = Object.values(scores).every((v) => v > 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allAnswered) { setError('Please answer all questions before submitting.'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/assessment/submit/', scores)
      navigate(`/results/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Leadership Assessment</h1>
      <p className="text-sm text-gray-500 mb-8">
        Rate each statement on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree) based on your typical behaviour at work.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {QUESTIONS.map((q, qi) => (
          <div key={q.key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-3 mb-5">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center">
                {qi + 1}
              </span>
              <div>
                <p className="font-semibold text-gray-800 text-sm mb-1">{q.label}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{q.scenario}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => {
                const selected = scores[q.key] === val
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setScores({ ...scores, [q.key]: val })}
                    className={`flex-1 flex flex-col items-center py-2.5 rounded-lg border text-xs font-medium transition-all ${
                      selected
                        ? 'bg-brand border-brand text-white shadow-md'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-brand hover:text-brand'
                    }`}
                  >
                    <span className="text-base font-bold">{val}</span>
                    <span className="mt-0.5 text-center leading-tight hidden sm:block">{LABELS[val - 1]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading || !allAnswered}
          className="w-full bg-brand text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analysing…' : 'Submit & Get My Results'}
        </button>
      </form>
    </div>
  )
}
