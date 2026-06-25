import { Navigate } from 'react-router-dom'
import { useAuth } from '../assets/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  // Wait for auth to load before deciding to redirect
  if (loading || user === undefined) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚽</div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading...</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/" replace />

  if (adminOnly && !user.is_admin) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute