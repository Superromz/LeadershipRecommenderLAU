import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const COUNTRIES = [
  { value: 'USA', label: 'United States' },
  { value: 'JPN', label: 'Japan' },
  { value: 'BRA', label: 'Brazil' },
  { value: 'NGA', label: 'Nigeria' },
  { value: 'IND', label: 'India' },
]

const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow bg-white'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', password: '',
    country: '', age: '', gender: '',
    education_level: '', work_experience_years: '', position_level: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        ...form,
        username: form.email.split('@')[0] + '_' + Date.now(),
        age: Number(form.age),
        work_experience_years: Number(form.work_experience_years),
      })
      navigate('/assessment')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-5/12 gradient-brand flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <span className="font-bold text-lg">Leadership Coach</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight mb-4">Start your leadership journey today</h2>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Complete a short behavioural assessment and receive a personalised analysis powered by XGBoost and SHAP explainability.
          </p>
          <div className="mt-6 space-y-3">
            {['AI-powered style classification', 'SHAP explainability insights', 'Personalised development plan', 'Cross-cultural research backed'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-indigo-100">
                <svg className="w-4 h-4 text-indigo-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-xs">LAU Capstone Project · AI Engineering</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500">Takes less than 2 minutes</p>
          </div>

          {error && (
            <div className="mb-5 flex gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account</p>
              <div>
                <label className={labelCls}>Email address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password <span className="text-gray-400 font-normal">(min. 8 characters)</span></label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className={inputCls} />
              </div>
            </div>

            {/* Profile */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Profile</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Country</label>
                  <select name="country" value={form.country} onChange={handleChange} required className={inputCls}>
                    <option value="">Select…</option>
                    {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Age</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} required min="16" max="80" placeholder="25" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required className={inputCls}>
                    <option value="">Select…</option>
                    {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Education level</label>
                  <select name="education_level" value={form.education_level} onChange={handleChange} required className={inputCls}>
                    <option value="">Select…</option>
                    {['Bachelor', 'Master', 'PhD', 'High School'].map((e) => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Work experience (yrs)</label>
                  <input type="number" name="work_experience_years" value={form.work_experience_years} onChange={handleChange} required min="0" max="50" step="0.5" placeholder="5" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Position level</label>
                  <select name="position_level" value={form.position_level} onChange={handleChange} required className={inputCls}>
                    <option value="">Select…</option>
                    {['Junior', 'Mid', 'Senior'].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full gradient-brand text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm mt-2"
            >
              {loading ? 'Creating account…' : 'Create account & start assessment'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
