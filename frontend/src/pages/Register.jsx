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

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    country: '',
    age: '',
    gender: '',
    education_level: '',
    work_experience_years: '',
    position_level: '',
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
        age: Number(form.age),
        work_experience_years: Number(form.work_experience_years),
      })
      navigate('/assessment')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const messages = Object.values(data).flat().join(' ')
        setError(messages)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const field = (label, name, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  )

  const select = (label, name, options) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join the Leadership Style Coach platform</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('First name', 'first_name', 'text', 'Jane')}
            {field('Last name', 'last_name', 'text', 'Doe')}
          </div>
          {field('Email', 'email', 'email', 'you@example.com')}
          {field('Password', 'password', 'password', '••••••••')}

          <hr className="my-2 border-gray-100" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Profile</p>

          <div className="grid grid-cols-2 gap-4">
            {select('Country', 'country', COUNTRIES)}
            {field('Age', 'age', 'number', '25')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {select('Gender', 'gender', ['Male', 'Female', 'Other'])}
            {select('Education level', 'education_level', ['Bachelor', 'Master', 'PhD', 'Other'])}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Work experience (years)', 'work_experience_years', 'number', '5')}
            {select('Position level', 'position_level', ['Junior', 'Mid', 'Senior'])}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
