import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const CLASS_COLORS = {
  Transformational: '#4F46E5',
  Transactional:    '#0EA5E9',
  Supportive:       '#10B981',
  'Laissez-Faire':  '#F59E0B',
}

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/assessment/history/')
      .then(({ data }) => setHistory(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center mt-20 text-gray-400">Loading history…</p>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assessment History</h1>
        <Link
          to="/assessment"
          className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          New Assessment
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">No assessments yet</p>
          <p className="text-sm">Take your first assessment to see results here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const topProb = item.probabilities
              ? Math.max(...Object.values(item.probabilities)) * 100
              : null
            const color = CLASS_COLORS[item.predicted_class_name] ?? '#64748B'
            return (
              <Link
                key={item.id}
                to={`/results/${item.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-sm" style={{ color }}>
                    {item.predicted_class_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {topProb !== null && (
                    <span className="text-xs font-semibold text-gray-500">
                      {topProb.toFixed(0)}% confidence
                    </span>
                  )}
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
