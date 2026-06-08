import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Admin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editPoints, setEditPoints] = useState({})
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const isAdmin = localStorage.getItem('is_admin')
    if (!token) { navigate('/login'); return }
    if (isAdmin !== 'true') { navigate('/'); return }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get('http://192.168.100.3:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
      setLoading(false)
    } catch {
      setError('Failed to load users')
      setLoading(false)
    }
  }

  const deleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete ${username}?`)) return
    try {
      await axios.delete(`http://192.168.100.3:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(users.filter(u => u.id !== userId))
    } catch { alert('Failed to delete user') }
  }

  const toggleAdmin = async (userId) => {
    try {
      const res = await axios.post(
        `http://192.168.100.3:5000/api/admin/users/${userId}/toggle-admin`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: res.data.is_admin } : u))
    } catch { alert('Failed to update admin status') }
  }

  const updatePoints = async (userId) => {
    const points = editPoints[userId]
    if (points === undefined) return
    try {
      await axios.post(
        `http://192.168.100.3:5000/api/admin/users/${userId}/points`,
        { points: parseInt(points) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(users.map(u => u.id === userId ? { ...u, points: parseInt(points) } : u))
      setEditPoints(prev => ({ ...prev, [userId]: undefined }))
    } catch { alert('Failed to update points') }
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-green-400 text-xl animate-pulse">Loading admin panel...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 py-8">

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-extrabold text-green-400 mb-2"
      >
        Admin Panel ⚙️
      </motion.h1>
      <p className="text-gray-400 text-sm mb-6">Manage users, points, and admin privileges.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: '👥' },
          { label: 'Admins', value: users.filter(u => u.is_admin).length, icon: '⭐' },
          { label: 'Top Points', value: Math.max(...users.map(u => u.points), 0), icon: '🏆' },
          { label: 'Avg Points', value: users.length ? Math.round(users.reduce((a, u) => a + u.points, 0) / users.length) : 0, icon: '📊' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 rounded-2xl p-3 sm:p-4 border border-gray-700 text-center">
            <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-green-400">{stat.value}</div>
            <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tournament Controls */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 sm:p-6 mb-6">
        <h2 className="text-green-400 font-extrabold text-lg mb-4">⚙️ Tournament Controls</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-xs">Run after June 27 when group stage ends</p>
            <button
              onClick={async () => {
                if (!confirm('Score all group stage predictions now?')) return
                try {
                  const res = await axios.post('http://192.168.100.3:5000/api/admin/score-groups', {}, { headers: { Authorization: `Bearer ${token}` } })
                  alert(`✅ Group stage scored! ${res.data.results?.length || 0} users updated.`)
                  fetchUsers()
                } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
              }}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-full transition"
            >
              📊 Score Group Stage
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-xs">Manually trigger knockout match scoring</p>
            <button
              onClick={async () => {
                if (!confirm('Run knockout scoring now?')) return
                try {
                  await axios.post('http://192.168.100.3:5000/api/admin/score-knockouts', {}, { headers: { Authorization: `Bearer ${token}` } })
                  alert('✅ Knockout scoring done!')
                  fetchUsers()
                } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
              }}
              className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-full transition"
            >
              🏆 Score Knockouts
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-xs">⚠️ Resets everyone's points to 0</p>
            <button
              onClick={async () => {
                if (!confirm('RESET ALL POINTS? This cannot be undone!')) return
                if (!confirm('Are you absolutely sure?')) return
                try {
                  await axios.post('http://192.168.100.3:5000/api/admin/reset-points', {}, { headers: { Authorization: `Bearer ${token}` } })
                  alert('✅ All points reset to 0')
                  fetchUsers()
                } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full transition"
            >
              🔄 Reset All Points
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by username or email..."
        className="w-full max-w-md bg-gray-800 border border-gray-600 text-white px-5 py-3 rounded-full mb-6 focus:outline-none focus:border-green-500"
      />

      {/* Desktop Table — hidden on mobile */}
      <div className="hidden sm:block bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
          <span className="col-span-1">ID</span>
          <span className="col-span-3">Username</span>
          <span className="col-span-3">Email</span>
          <span className="col-span-2">Points</span>
          <span className="col-span-3">Actions</span>
        </div>

        {filtered.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * index }}
            className="grid grid-cols-12 px-6 py-4 border-b border-gray-700 last:border-0 items-center hover:bg-gray-700 transition"
          >
            <span className="col-span-1 text-gray-500 text-sm">#{user.id}</span>
            <div className="col-span-3">
              <span className="text-white font-medium text-sm">{user.username}</span>
              {user.is_admin && <span className="text-yellow-400 text-xs ml-2">⭐</span>}
            </div>
            <span className="col-span-3 text-gray-400 text-sm truncate">{user.email}</span>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="number"
                value={editPoints[user.id] !== undefined ? editPoints[user.id] : user.points}
                onChange={e => setEditPoints(prev => ({ ...prev, [user.id]: e.target.value }))}
                className="w-16 bg-gray-700 text-white text-sm px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {editPoints[user.id] !== undefined && (
                <button onClick={() => updatePoints(user.id)} className="text-green-400 text-xs font-bold">Save</button>
              )}
            </div>
            <div className="col-span-3 flex gap-2">
              <button
                onClick={() => toggleAdmin(user.id)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition ${
                  user.is_admin ? 'bg-yellow-500 text-black' : 'border border-yellow-500 text-yellow-400'
                }`}
              >
                {user.is_admin ? 'Remove' : 'Make Admin'}
              </button>
              <button
                onClick={() => deleteUser(user.id, user.username)}
                className="text-xs font-bold px-3 py-1 rounded-full border border-red-500 text-red-400"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Mobile Cards — shown only on mobile */}
      <div className="sm:hidden flex flex-col gap-4">
        {filtered.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="bg-gray-800 rounded-2xl p-4 border border-gray-700"
          >
            {/* User info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-bold">
                  {user.username}
                  {user.is_admin && <span className="text-yellow-400 text-xs ml-2">⭐ Admin</span>}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
              </div>
              <span className="text-gray-500 text-xs">#{user.id}</span>
            </div>

            {/* Points editor */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400 text-sm">Points:</span>
              <input
                type="number"
                value={editPoints[user.id] !== undefined ? editPoints[user.id] : user.points}
                onChange={e => setEditPoints(prev => ({ ...prev, [user.id]: e.target.value }))}
                className="w-20 bg-gray-700 text-white text-sm px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {editPoints[user.id] !== undefined && (
                <button onClick={() => updatePoints(user.id)} className="text-green-400 text-sm font-bold">
                  Save
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleAdmin(user.id)}
                className={`flex-1 text-xs font-bold px-3 py-2 rounded-full transition ${
                  user.is_admin
                    ? 'bg-yellow-500 text-black'
                    : 'border border-yellow-500 text-yellow-400'
                }`}
              >
                {user.is_admin ? '⭐ Remove Admin' : 'Make Admin'}
              </button>
              <button
                onClick={() => deleteUser(user.id, user.username)}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-full border border-red-500 text-red-400"
              >
                🗑️ Delete
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Admin