import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <Link to="/" className="text-brand font-bold text-lg tracking-tight">
        Leadership Style Coach
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <Link to="/assessment" className="text-sm text-gray-600 hover:text-brand transition-colors">
            New Assessment
          </Link>
          <Link to="/history" className="text-sm text-gray-600 hover:text-brand transition-colors">
            History
          </Link>
          <span className="text-sm text-gray-400">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-brand transition-colors">
            Login
          </Link>
          <Link to="/register" className="text-sm bg-brand text-white px-4 py-1.5 rounded-md hover:bg-indigo-700 transition-colors">
            Sign up
          </Link>
        </div>
      )}
    </nav>
  )
}
