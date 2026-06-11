import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../assets/AuthContext'
import wc2026 from '../assets/wc2026-logo.png'
import { useColor } from '../assets/ColorContext'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

const LINKS = [
  { path: '/', label: 'Home' },
  { path: '/predictions', label: 'Predictions' },
  { path: '/livescores', label: 'Live Scores' },
  {path: '/standings', label: 'Standings'},
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/countries', label: 'Countries' },
  { path: '/map', label: 'Host Cities' },
  { path: '/history', label: 'History' },
]

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { accent, changeColor } = useColor()
  const [showPicker, setShowPicker] = useState(false)

  const COLORS = [
  { color: '#3b82f6', label: 'Blue' },
  { color: '#22c55e', label: 'Green' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#ef4444', label: 'Red' },
  { color: '#f97316', label: 'Orange' },
  { color: '#fbbf24', label: 'Gold' },
  
]

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background: 'rgba(8,13,26,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky', top: 0, zIndex: 50,
      fontFamily: 'Barlow, system-ui, sans-serif',
    }}>
      
      {/* Rainbow color bar */}
<div style={{
  height: 2,
  background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, var(--accent), #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)',
}} />

      {/* Main bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <img 
           src={wc2026}
           alt="WC2026"
           style={{ width: 36, height: 36, objectFit: 'contain' }}
         />
        <span style={{ fontWeight: 900, fontSize: 18, color: '#f1f5f9', letterSpacing: '-0.02em' }}>WC2026</span>
        </Link>

        <div style={{ position: 'relative' }}>
        <button onClick={() => setShowPicker(!showPicker)}
    style={{
      width: 28, height: 28, borderRadius: '50%',
      background: accent, border: '2px solid rgba(255,255,255,0.2)',
      cursor: 'pointer', flexShrink: 0,
    }} />
  {showPicker && (
    <div style={{
      position: 'absolute', top: 40, right: 0,
      background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: 10,
      display: 'flex', gap: 8, zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {COLORS.map(({ color, label }) => (
        <button key={color} onClick={() => { changeColor(color); setShowPicker(false) }}
          title={label}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: color, cursor: 'pointer',
            border: accent === color ? '3px solid #fff' : '2px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.15s',
            transform: accent === color ? 'scale(1.2)' : 'scale(1)',
          }} />
      ))}
    </div>
  )}
</div>

        {/* Desktop nav links */}
        <div style={{ display: 'none' }} className="md-nav">
          {LINKS.map(link => (
            <Link key={link.path} to={link.path} style={{
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
              color: isActive(link.path) ? '#f1f5f9' : '#64748b',
              padding: '6px 12px', borderRadius: 8,
              background: isActive(link.path) ? 'rgba(255,255,255,0.06)' : 'transparent',
              transition: 'color 0.15s, background 0.15s',
              position: 'relative',
            }}
              onMouseEnter={e => { if (!isActive(link.path)) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
              onMouseLeave={e => { if (!isActive(link.path)) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' } }}
            >
              {link.label}
              {isActive(link.path) && (
                <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 16, height: 2, background: 'var(--accent)', borderRadius: 1 }} />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div style={{ display: 'none' }} className="md-auth">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#94a3b8',
              }}>{user.username.charAt(0).toUpperCase()}</div>
              <span style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>{user.username}</span>

              {user.is_admin && (
                <Link to="/admin" style={{
                  textDecoration: 'none', fontSize: 12, fontWeight: 700,
                  color: '#fbbf24', padding: '5px 12px', borderRadius: 8,
                  background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}>
                  ⚙️ Admin
                </Link>
              )}

              <button onClick={handleLogout} style={{
                fontSize: 12, fontWeight: 700, color: '#64748b',
                padding: '5px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to="/login" style={{
                textDecoration: 'none', fontSize: 13, fontWeight: 700, color: '#94a3b8',
                padding: '6px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
                Sign In
              </Link>
              <Link to="/signup" style={{
                textDecoration: 'none', fontSize: 13, fontWeight: 700, color: '#fff',
                padding: '6px 14px', borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent), #1d4ed8)',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: username + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="mobile-controls">
          {user && (
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#94a3b8', flexShrink: 0,
            }}>{user.username.charAt(0).toUpperCase()}</div>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
            {menuOpen ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#0d1526', borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 20px 20px',
        }}>
          {/* User info */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
              marginBottom: 12,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#94a3b8', flexShrink: 0,
              }}>{user.username.charAt(0).toUpperCase()}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', margin: 0 }}>{user.username}</p>
                <p style={{ color: '#334155', fontSize: 11, margin: 0 }}>{user.is_admin ? '⭐ Admin' : 'Member'}</p>
              </div>
            </div>
          )}

          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
            {LINKS.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                style={{
                  textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  color: isActive(link.path) ? '#f1f5f9' : '#64748b',
                  padding: '10px 12px', borderRadius: 8,
                  background: isActive(link.path) ? 'rgba(59,130,246,0.1)' : 'transparent',
                  borderLeft: isActive(link.path) ? '3px solid var(--accent)' : '3px solid transparent',
                  display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s',
                }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {user ? (
              <>
                {user.is_admin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                    textDecoration: 'none', textAlign: 'center', fontSize: 13, fontWeight: 700,
                    color: '#fbbf24', padding: '10px', borderRadius: 10,
                    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                  }}>⚙️ Admin Panel</Link>
                )}
                <button onClick={handleLogout} style={{
                  fontSize: 13, fontWeight: 700, color: '#f87171',
                  padding: '10px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.06)', cursor: 'pointer',
                }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  textDecoration: 'none', textAlign: 'center', fontSize: 13, fontWeight: 700,
                  color: '#94a3b8', padding: '10px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>Sign In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} style={{
                  textDecoration: 'none', textAlign: 'center', fontSize: 13, fontWeight: 700,
                  color: '#fff', padding: '10px', borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--accent), #1d4ed8)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                }}>Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .md-nav { display: flex !important; align-items: center; gap: 4px; }
          .md-auth { display: flex !important; }
          .mobile-controls { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

export default Navbar