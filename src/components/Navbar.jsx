import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../assets/AuthContext'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const links = [
    { path: '/', label: 'Home' },
    { path: '/predictions', label: 'Predictions' },
    { path: '/livescores', label: 'Live Scores' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/countries', label: 'Countries' },
    { path: '/map', label: 'Host Cities' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center justify-between sticky top-0 z-50">

      <Link to="/" className="text-green-400 font-extrabold text-2xl tracking-wide">
        ⚽ WC2026
      </Link>

      <div className="flex gap-6 items-center">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`font-medium transition ${
              location.pathname === link.path
                ? 'text-green-400 border-b-2 border-green-400 pb-1'
                : 'text-gray-300 hover:text-green-400'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <span className="text-gray-300 font-medium">
              👋 {user.username}
            </span>
            {user.is_admin && (
              <Link
                to="/admin"
                className="border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-bold px-5 py-2 rounded-full transition"
              >
                ⚙️ Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold px-5 py-2 rounded-full transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-bold px-5 py-2 rounded-full transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2 rounded-full transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

    </nav>
  )
}

export default Navbar