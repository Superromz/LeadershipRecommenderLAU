import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const COUNTRIES = [
  { value: 'USA', label: 'United States' },
  { value: 'JPN', label: 'Japan' },
  { value: 'BRA', label: 'Brazil' },
  { value: 'NGA', label: 'Nigeria' },
  { value: 'IND', label: 'India' },
]

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow bg-white'
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide'

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()
  const [form, setForm] = useState({
    country:                  user?.country ?? '',
    age:                      user?.age ?? '',
    gender:                   user?.gender ?? '',
    education_level:          user?.education_level ?? '',
    work_experience_years:    user?.work_experience_years ?? '',
    position_level:           user?.position_level ?? '',
    target_leadership_style:  user?.target_leadership_style ?? '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setSaved(false)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.patch('/auth/me/', {
        ...form,
        age: Number(form.age),
        work_experience_years: Number(form.work_experience_years),
      })
      setSaved(true)
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not save changes.')
    } finally {
      setLoading(false)
    }
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.email}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your profile and demographic settings</p>
          </div>
        </div>

        {/* Success banner */}
        {saved && (
          <div className="mb-5 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Account (read-only) */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Account</p>
              <Field label="Email">
                <input
                  type="text"
                  value={user?.email ?? ''}
                  disabled
                  className={`${inputCls} opacity-60 cursor-not-allowed bg-gray-50`}
                />
              </Field>
            </div>

            <div className="border-t border-gray-100" />

            {/* Development Goal */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Development Goal</p>
              <Field label="Target Leadership Style">
                <select
                  name="target_leadership_style"
                  value={form.target_leadership_style}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">No goal set</option>
                  {['Transformational', 'Transactional', 'Supportive', 'Laissez-Faire'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  Track your progress toward becoming this type of leader across assessments.
                </p>
              </Field>
            </div>

            <div className="border-t border-gray-100" />

            {/* Demographics */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Demographics</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Country">
                  <select name="country" value={form.country} onChange={handleChange} className={inputCls}>
                    {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Age">
                  <input
                    type="number" name="age" value={form.age} onChange={handleChange}
                    min="16" max="80" className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Gender">
                  <select name="gender" value={form.gender} onChange={handleChange} className={inputCls}>
                    {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Education level">
                  <select name="education_level" value={form.education_level} onChange={handleChange} className={inputCls}>
                    {['Bachelor', 'Master', 'PhD', 'High School'].map((e) => <option key={e}>{e}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Work experience (yrs)">
                  <input
                    type="number" name="work_experience_years" value={form.work_experience_years}
                    onChange={handleChange} min="0" max="50" step="0.5" className={inputCls}
                  />
                </Field>
                <Field label="Position level">
                  <select name="position_level" value={form.position_level} onChange={handleChange} className={inputCls}>
                    {['Junior', 'Mid', 'Senior'].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full gradient-brand text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm"
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-card p-6">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Session</p>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>

      </div>
    </div>
  )
}
