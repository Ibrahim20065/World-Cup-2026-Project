import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../assets/AuthContext'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">

      {/* Main bar */}
      <div className="px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-green-400 font-extrabold text-2xl tracking-wide">
          ⚽ WC2026
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 items-center">
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

        {/* Desktop auth buttons */}
        <div className="hidden md:flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-gray-300 font-medium">👋 {user.username}</span>
              {user.is_admin && (
                <Link to="/admin"
                  className="border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-bold px-5 py-2 rounded-full transition">
                  ⚙️ Admin
                </Link>
              )}
              <button onClick={handleLogout}
                className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold px-5 py-2 rounded-full transition">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-bold px-5 py-2 rounded-full transition">
                Login
              </Link>
              <Link to="/signup"
                className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2 rounded-full transition">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile right side — username + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {user && (
            <span className="text-gray-300 text-sm font-medium">👋 {user.username}</span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-300 hover:text-green-400 transition p-2"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-6 py-4 flex flex-col gap-3">

          {/* Nav links */}
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`font-medium py-2 transition border-b border-gray-700 last:border-0 ${
                location.pathname === link.path
                  ? 'text-green-400'
                  : 'text-gray-300 hover:text-green-400'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth buttons */}
          <div className="flex flex-col gap-3 pt-2">
            {user ? (
              <>
                {user.is_admin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="border border-yellow-500 text-yellow-400 font-bold px-5 py-2 rounded-full text-center transition hover:bg-yellow-500 hover:text-black">
                    ⚙️ Admin
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="border border-red-500 text-red-400 font-bold px-5 py-2 rounded-full transition hover:bg-red-500 hover:text-white">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="border border-green-500 text-green-400 font-bold px-5 py-2 rounded-full text-center transition hover:bg-green-500 hover:text-black">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}
                  className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2 rounded-full text-center transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>
      )}

    </nav>
  )
}

export default Navbar