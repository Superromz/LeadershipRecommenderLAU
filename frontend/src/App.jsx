import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Assessment from './pages/Assessment'
import Results from './pages/Results'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Compare from './pages/Compare'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user, loading } = useAuth()

  // Show full-page Landing (no Navbar) for unauthenticated visitors at "/"
  if (!loading && !user) {
    return (
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Navigate to="/assessment" replace />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/assessment" element={<PrivateRoute><Assessment /></PrivateRoute>} />
        <Route path="/results/:id" element={<PrivateRoute><Results /></PrivateRoute>} />
        <Route path="/history"    element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/compare"    element={<PrivateRoute><Compare /></PrivateRoute>} />
        <Route path="*"           element={<Navigate to="/assessment" replace />} />
      </Routes>
    </>
  )
}
