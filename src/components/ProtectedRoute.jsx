import { Navigate } from 'react-router-dom'
import { useAuth } from '../assets/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()

  if (user === undefined) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute