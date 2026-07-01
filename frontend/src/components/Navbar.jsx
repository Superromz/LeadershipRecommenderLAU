import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-0 flex items-center justify-between h-14 sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-sm tracking-tight">Leadership Coach</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-1">
          <Link
            to="/assessment"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/assessment') ? 'bg-brand-light text-brand' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Assessment
          </Link>
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard') ? 'bg-brand-light text-brand' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/history"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/history') ? 'bg-brand-light text-brand' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            History
          </Link>
          <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors">
            Login
          </Link>
          <Link to="/register" className="text-sm bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-dark transition-colors font-medium">
            Sign up
          </Link>
        </div>
      )}
    </nav>
  )
}
