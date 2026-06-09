import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

function Admin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editPoints, setEditPoints] = useState({})
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin')
    if (!token) { navigate('/login'); return }
    if (isAdmin !== 'true') { navigate('/'); return }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://192.168.100.3:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  const deleteUser = async (userId, username) => {
    if (!confirm(`Delete ${username}?`)) return
    try {
      await axios.delete(`http://192.168.100.3:5000/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(users.filter(u => u.id !== userId))
    } catch { alert('Failed to delete user') }
  }

  const toggleAdmin = async (userId) => {
    try {
      const res = await axios.post(`http://192.168.100.3:5000/api/admin/users/${userId}/toggle-admin`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: res.data.is_admin } : u))
    } catch { alert('Failed to update admin status') }
  }

  const updatePoints = async (userId) => {
    const points = editPoints[userId]
    if (points === undefined) return
    try {
      await axios.post(`http://192.168.100.3:5000/api/admin/users/${userId}/points`, { points: parseInt(points) }, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(users.map(u => u.id === userId ? { ...u, points: parseInt(points) } : u))
      setEditPoints(prev => ({ ...prev, [userId]: undefined }))
    } catch { alert('Failed to update points') }
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading admin panel...</p>
      </div>
    </div>
  )

  const CONTROLS = [
    {
      label: 'Score Group Stage',
      desc: 'Run after June 27 when group stage ends',
      color: '#3b82f6',
      icon: '📊',
      action: async () => {
        if (!confirm('Score all group stage predictions now?')) return
        try {
          const res = await axios.post('http://192.168.100.3:5000/api/admin/score-groups', {}, { headers: { Authorization: `Bearer ${token}` } })
          alert(`✅ Group stage scored! ${res.data.results?.length || 0} users updated.`)
          fetchUsers()
        } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
      }
    },
    {
      label: 'Score Knockouts',
      desc: 'Manually trigger knockout match scoring',
      color: '#8b5cf6',
      icon: '🏆',
      action: async () => {
        if (!confirm('Run knockout scoring now?')) return
        try {
          await axios.post('http://192.168.100.3:5000/api/admin/score-knockouts', {}, { headers: { Authorization: `Bearer ${token}` } })
          alert('✅ Knockout scoring done!')
          fetchUsers()
        } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
      }
    },
    {
      label: 'Reset All Points',
      desc: '⚠️ Resets everyone\'s points to 0',
      color: '#ef4444',
      icon: '🔄',
      action: async () => {
        if (!confirm('RESET ALL POINTS? This cannot be undone!')) return
        if (!confirm('Are you absolutely sure?')) return
        try {
          await axios.post('http://192.168.100.3:5000/api/admin/reset-points', {}, { headers: { Authorization: `Bearer ${token}` } })
          alert('✅ All points reset to 0')
          fetchUsers()
        } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
      }
    },
  ]

  const STATS = [
    { label: 'Total Users', value: users.length, icon: '👥', color: '#3b82f6' },
    { label: 'Admins', value: users.filter(u => u.is_admin).length, icon: '⭐', color: '#fbbf24' },
    { label: 'Top Points', value: Math.max(...users.map(u => u.points), 0), icon: '🏆', color: '#22c55e' },
    { label: 'Avg Points', value: users.length ? Math.round(users.reduce((a, u) => a + u.points, 0) / users.length) : 0, icon: '📊', color: '#8b5cf6' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{ display: 'flex', height: 3 }}>
        {GROUP_COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            FIFA World Cup 2026
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Admin Panel <span style={{ color: '#fbbf24' }}>⚙️</span>
          </h1>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Manage users, points, and tournament controls.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{
              background: '#0d1526', border: `1px solid ${stat.color}20`,
              borderTop: `3px solid ${stat.color}`, borderRadius: 12,
              padding: '16px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tournament Controls */}
        <div style={{
          background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 20, marginBottom: 24,
          borderTop: '3px solid #fbbf24',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            ⚙️ Tournament Controls
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {CONTROLS.map(ctrl => (
              <div key={ctrl.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ color: '#334155', fontSize: 11, margin: 0, fontWeight: 600 }}>{ctrl.desc}</p>
                <button onClick={ctrl.action}
                  style={{
                    background: `${ctrl.color}15`, border: `1px solid ${ctrl.color}40`,
                    color: ctrl.color, fontWeight: 700, fontSize: 13,
                    padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                    transition: 'background 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${ctrl.color}25`}
                  onMouseLeave={e => e.currentTarget.style.background = `${ctrl.color}15`}
                >
                  {ctrl.icon} {ctrl.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            style={{
              width: '100%', background: '#0d1526',
              border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9',
              padding: '10px 16px 10px 40px', borderRadius: 10, fontSize: 13,
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block" style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px 160px',
            padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <span>ID</span><span>Username</span><span>Email</span><span>Points</span><span>Actions</span>
          </div>

          {filtered.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
              style={{
                display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px 160px',
                padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: '#334155', fontSize: 12, fontWeight: 600 }}>#{user.id}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: user.is_admin ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
                  border: user.is_admin ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: user.is_admin ? '#fbbf24' : '#94a3b8',
                }}>{user.username.charAt(0).toUpperCase()}</div>
                <div>
                  <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{user.username}</span>
                  {user.is_admin && <span style={{ color: '#fbbf24', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>⭐ ADMIN</span>}
                </div>
              </div>
              <span style={{ color: '#475569', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{user.email}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="number"
                  value={editPoints[user.id] !== undefined ? editPoints[user.id] : user.points}
                  onChange={e => setEditPoints(prev => ({ ...prev, [user.id]: e.target.value }))}
                  style={{
                    width: 56, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f1f5f9', fontSize: 12, padding: '5px 8px', borderRadius: 6, outline: 'none',
                  }} />
                {editPoints[user.id] !== undefined && (
                  <button onClick={() => updatePoints(user.id)}
                    style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleAdmin(user.id)}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                    background: user.is_admin ? 'rgba(251,191,36,0.15)' : 'transparent',
                    border: `1px solid ${user.is_admin ? 'rgba(251,191,36,0.4)' : 'rgba(251,191,36,0.25)'}`,
                    color: '#fbbf24', transition: 'background 0.15s',
                  }}>
                  {user.is_admin ? 'Remove' : 'Admin'}
                </button>
                <button onClick={() => deleteUser(user.id, user.username)}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171', transition: 'background 0.15s',
                  }}>
                  Delete
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <p style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>No users found</p>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: user.is_admin ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${user.is_admin ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: user.is_admin ? '#fbbf24' : '#94a3b8',
                  }}>{user.username.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', margin: 0 }}>
                      {user.username}
                      {user.is_admin && <span style={{ color: '#fbbf24', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>⭐</span>}
                    </p>
                    <p style={{ color: '#334155', fontSize: 12, margin: 0 }}>{user.email}</p>
                  </div>
                </div>
                <span style={{ color: '#334155', fontSize: 11, fontWeight: 600 }}>#{user.id}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Points:</span>
                <input type="number"
                  value={editPoints[user.id] !== undefined ? editPoints[user.id] : user.points}
                  onChange={e => setEditPoints(prev => ({ ...prev, [user.id]: e.target.value }))}
                  style={{
                    width: 64, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f1f5f9', fontSize: 13, padding: '6px 10px', borderRadius: 8, outline: 'none',
                  }} />
                {editPoints[user.id] !== undefined && (
                  <button onClick={() => updatePoints(user.id)}
                    style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleAdmin(user.id)}
                  style={{
                    flex: 1, fontSize: 12, fontWeight: 700, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                    background: user.is_admin ? 'rgba(251,191,36,0.15)' : 'transparent',
                    border: `1px solid ${user.is_admin ? 'rgba(251,191,36,0.4)' : 'rgba(251,191,36,0.25)'}`,
                    color: '#fbbf24',
                  }}>
                  {user.is_admin ? '⭐ Remove Admin' : 'Make Admin'}
                </button>
                <button onClick={() => deleteUser(user.id, user.username)}
                  style={{
                    flex: 1, fontSize: 12, fontWeight: 700, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171',
                  }}>
                  🗑️ Delete
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <p style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>No users found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Admin