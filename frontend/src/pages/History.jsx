import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const STYLES = {
  Transformational: { color: '#4F46E5', bg: '#EEF2FF', icon: '🚀' },
  Transactional:    { color: '#0EA5E9', bg: '#F0F9FF', icon: '⚙️' },
  Supportive:       { color: '#10B981', bg: '#ECFDF5', icon: '💚' },
  'Laissez-Faire':  { color: '#F59E0B', bg: '#FFFBEB', icon: '🕊️' },
}

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/assessment/history/')
      .then(({ data }) => setHistory(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading history…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment History</h1>
          <p className="text-sm text-gray-400 mt-0.5">{history.length} assessment{history.length !== 1 ? 's' : ''} completed</p>
        </div>
        <Link
          to="/assessment"
          className="gradient-brand text-white text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-sm"
        >
          + New Assessment
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-700 font-semibold mb-1">No assessments yet</p>
          <p className="text-sm text-gray-400 mb-6">Take your first assessment to discover your leadership style.</p>
          <Link
            to="/assessment"
            className="inline-block gradient-brand text-white text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-semibold"
          >
            Start Now →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const s = STYLES[item.predicted_class_name] ?? { color: '#64748B', bg: '#F8FAFC', icon: '📊' }
            const topProb = item.probabilities
              ? Math.max(...Object.values(item.probabilities)) * 100
              : null
            return (
              <Link
                key={item.id}
                to={`/results/${item.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-card px-5 py-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: s.bg }}
                >
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: s.color }}>
                    {item.predicted_class_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {topProb !== null && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-700">{topProb.toFixed(0)}%</div>
                    <div className="text-xs text-gray-400">confidence</div>
                  </div>
                )}
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
