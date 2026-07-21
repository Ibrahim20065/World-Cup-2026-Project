import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

const GROUPS = {
  'A': ['Mexico', 'South Korea', 'South Africa', 'Czech Republic'],
  'B': ['Canada', 'Switzerland', 'Qatar', 'Bosnia'],
  'C': ['Brazil', 'Scotland', 'Morocco', 'Haiti'],
  'D': ['USA', 'Australia', 'Paraguay', 'Turkey'],
  'E': ['Germany', 'Ecuador', 'Ivory Coast', 'Curacao'],
  'F': ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  'G': ['Belgium', 'New Zealand', 'Egypt', 'Iran'],
  'H': ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  'I': ['France', 'Norway', 'Senegal', 'Iraq'],
  'J': ['Argentina', 'Austria', 'Jordan', 'Algeria'],
  'K': ['Portugal', 'Colombia', 'Uzbekistan', 'DR Congo'],
  'L': ['England', 'Croatia', 'Ghana', 'Panama'],
}

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']
const ALL_TEAMS = Object.entries(GROUPS).flatMap(([group, teams]) => teams.map(team => ({ team, group })))

// All R32 matches with their teams for easy reference
const R32_MATCHES = [
  { match_id: 73, team1: 'South Africa', team2: 'Canada' },
  { match_id: 74, team1: 'Germany', team2: 'Paraguay' },
  { match_id: 75, team1: 'Netherlands', team2: 'Morocco' },
  { match_id: 76, team1: 'Brazil', team2: 'Japan' },
  { match_id: 77, team1: 'France', team2: 'Sweden' },
  { match_id: 78, team1: 'Ivory Coast', team2: 'Norway' },
  { match_id: 79, team1: 'Mexico', team2: 'Ecuador' },
  { match_id: 80, team1: 'England', team2: 'DR Congo' },
  { match_id: 81, team1: 'USA', team2: 'Bosnia & Herzegovina' },
  { match_id: 82, team1: 'Belgium', team2: 'Senegal' },
  { match_id: 83, team1: 'Portugal', team2: 'Croatia' },
  { match_id: 84, team1: 'Spain', team2: 'Austria' },
  { match_id: 85, team1: 'Switzerland', team2: 'Algeria' },
  { match_id: 86, team1: 'Argentina', team2: 'Cape Verde' },
  { match_id: 87, team1: 'Colombia', team2: 'Ghana' },
  { match_id: 88, team1: 'Australia', team2: 'Egypt' },
]

const ROUND_CONFIG = {
  R32:   { label: 'Round of 32',   matchIds: [73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88], color: '#06b6d4' },
  R16:   { label: 'Round of 16',   matchIds: [89,90,91,92,93,94,95,96], color: '#3b82f6' },
  QF:    { label: 'Quarter Finals',matchIds: [97,98,99,100], color: '#8b5cf6' },
  SF:    { label: 'Semi Finals',   matchIds: [101,102], color: '#f59e0b' },
  '3rd': { label: '3rd Place',     matchIds: [103], color: '#fb923c' },
  Final: { label: 'Final',         matchIds: [104], color: '#fbbf24' },
}

function Admin() {
  const [users, setUsers] = useState([])
  const [leagues, setLeagues] = useState([])
  const [standings, setStandings] = useState({})
  const [qualification, setQualification] = useState([])
  const [knockoutResults, setKnockoutResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [search, setSearch] = useState('')
  const [editPoints, setEditPoints] = useState({})
  const [selectedGroup, setSelectedGroup] = useState('A')
  const [editStanding, setEditStanding] = useState(null)
  const [standingForm, setStandingForm] = useState({})
  const [savingStanding, setSavingStanding] = useState(false)
  const [qualForm, setQualForm] = useState({ team: '', group: 'A', status: 'advanced', message: '' })
  const [savingQual, setSavingQual] = useState(false)
  const [selectedRound, setSelectedRound] = useState('R32')
  const [knockoutForm, setKnockoutForm] = useState({ match_id: '', team1: '', team2: '', winner: '' })
  const [savingKnockout, setSavingKnockout] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const isAdmin = localStorage.getItem('is_admin')
    if (!token) { navigate('/login'); return }
    if (isAdmin !== 'true') { navigate('/'); return }
    fetchUsers()
    fetchLeagues()
    fetchStandings()
    fetchQualification()
    fetchKnockoutResults()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(res.data)
      setLoading(false)
    } catch { setLoading(false) }
  }
  const fetchLeagues = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/leagues`, { headers: { Authorization: `Bearer ${token}` } })
      setLeagues(res.data)
    } catch {}
  }
  const fetchStandings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/standings`)
      setStandings(res.data)
    } catch {}
  }
  const fetchQualification = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/qualification`)
      setQualification(res.data)
    } catch {}
  }
  const fetchKnockoutResults = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/knockout-results`)
      setKnockoutResults(res.data)
    } catch {}
  }

  const deleteUser = async (userId, username) => {
    if (!confirm(`Delete ${username}?`)) return
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(users.filter(u => u.id !== userId))
    } catch { alert('Failed to delete user') }
  }

  const toggleAdmin = async (userId) => {
    try {
      const res = await axios.post(`${API_URL}/api/admin/users/${userId}/toggle-admin`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: res.data.is_admin } : u))
    } catch { alert('Failed to update admin status') }
  }

  const updatePoints = async (userId) => {
    const points = editPoints[userId]
    if (points === undefined) return
    try {
      await axios.post(`${API_URL}/api/admin/users/${userId}/points`, { points: parseInt(points) }, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(users.map(u => u.id === userId ? { ...u, points: parseInt(points) } : u))
      setEditPoints(prev => ({ ...prev, [userId]: undefined }))
    } catch { alert('Failed to update points') }
  }

  const deleteLeague = async (leagueId, leagueName) => {
    if (!confirm(`Delete league "${leagueName}"? This cannot be undone.`)) return
    try {
      await axios.delete(`${API_URL}/api/admin/leagues/${leagueId}`, { headers: { Authorization: `Bearer ${token}` } })
      setLeagues(leagues.filter(l => l.id !== leagueId))
    } catch { alert('Failed to delete league') }
  }

  const openEditStanding = (group, team) => {
    const existing = standings[group]?.find(s => s.team === team) || {}
    setEditStanding({ group, team })
    setStandingForm({
      played: existing.played ?? 0, won: existing.won ?? 0, drawn: existing.drawn ?? 0,
      lost: existing.lost ?? 0, gf: existing.gf ?? 0, ga: existing.ga ?? 0,
      points: existing.points ?? 0, yellow_cards: existing.yellow_cards ?? 0, red_cards: existing.red_cards ?? 0,
    })
  }

  const saveStanding = async () => {
    if (!editStanding) return
    setSavingStanding(true)
    try {
      await axios.post(`${API_URL}/api/admin/standings`, {
        group: editStanding.group, team: editStanding.team,
        ...Object.fromEntries(Object.entries(standingForm).map(([k, v]) => [k, parseInt(v) || 0]))
      }, { headers: { Authorization: `Bearer ${token}` } })
      await fetchStandings()
      setEditStanding(null)
      alert('✅ Standing updated!')
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.error || err.message))
    }
    setSavingStanding(false)
  }

  const saveQualification = async () => {
    if (!qualForm.team || !qualForm.status) { alert('Select a team and status!'); return }
    setSavingQual(true)
    try {
      await axios.post(`${API_URL}/api/admin/qualification`, qualForm, { headers: { Authorization: `Bearer ${token}` } })
      await fetchQualification()
      alert(`✅ ${qualForm.team} marked as ${qualForm.status}!`)
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.error || err.message))
    }
    setSavingQual(false)
  }

  const removeQualification = async (team, group) => {
    if (!confirm(`Reset ${team}'s qualification status to TBD?`)) return
    try {
      await axios.post(`${API_URL}/api/admin/qualification`, { team, group, status: 'tbd', message: '' }, { headers: { Authorization: `Bearer ${token}` } })
      await fetchQualification()
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.error || err.message))
    }
  }

  const saveKnockoutResult = async () => {
    if (!knockoutForm.match_id || !knockoutForm.team1 || !knockoutForm.team2 || !knockoutForm.winner) {
      alert('Fill in all fields!'); return
    }
    setSavingKnockout(true)
    try {
      await axios.post(`${API_URL}/api/admin/knockout-results`, {
        match_id: parseInt(knockoutForm.match_id),
        round: selectedRound,
        team1: knockoutForm.team1,
        team2: knockoutForm.team2,
        winner: knockoutForm.winner,
      }, { headers: { Authorization: `Bearer ${token}` } })
      await fetchKnockoutResults()
      alert(`✅ M${knockoutForm.match_id}: ${knockoutForm.winner} wins saved!`)
      setKnockoutForm({ match_id: '', team1: '', team2: '', winner: '' })
    } catch (err) {
      alert('❌ Failed: ' + (err.response?.data?.error || err.message))
    }
    setSavingKnockout(false)
  }

  // When a match is selected from R32, auto-fill team1/team2
  const handleMatchSelect = (matchId) => {
    const match = R32_MATCHES.find(m => m.match_id === parseInt(matchId))
    if (match && selectedRound === 'R32') {
      setKnockoutForm(prev => ({ ...prev, match_id: matchId, team1: match.team1, team2: match.team2, winner: '' }))
    } else {
      // For later rounds, look up from existing results
      const existing = knockoutResults.find(r => r.match_id === parseInt(matchId))
      if (existing) {
        setKnockoutForm(prev => ({ ...prev, match_id: matchId, team1: existing.team1, team2: existing.team2, winner: existing.winner || '' }))
      } else {
        setKnockoutForm(prev => ({ ...prev, match_id: matchId, team1: '', team2: '', winner: '' }))
      }
    }
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const CONTROLS = [
    { label: 'Score Group Stage', desc: 'Run after June 27 when group stage ends', color: '#3b82f6', icon: '📊',
      action: async () => {
        if (!confirm('Score all group stage predictions now?')) return
        try {
          const res = await axios.post(`${API_URL}/api/admin/score-groups`, {}, { headers: { Authorization: `Bearer ${token}` } })
          alert(`✅ Group stage scored! ${res.data.results?.length || 0} users updated.`)
          fetchUsers()
        } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
      }
    },
    { label: 'Score Knockouts', desc: 'Manually trigger knockout match scoring', color: '#8b5cf6', icon: '🏆',
      action: async () => {
        if (!confirm('Run knockout scoring now?')) return
        try {
          await axios.post(`${API_URL}/api/admin/score-knockouts`, {}, { headers: { Authorization: `Bearer ${token}` } })
          alert('✅ Knockout scoring done!')
          fetchUsers()
        } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
      }
    },
    { label: 'Reset All Points', desc: "⚠️ Resets everyone's points to 0", color: '#ef4444', icon: '🔄',
      action: async () => {
        if (!confirm('RESET ALL POINTS? This cannot be undone!')) return
        if (!confirm('Are you absolutely sure?')) return
        try {
          await axios.post(`${API_URL}/api/admin/reset-points`, {}, { headers: { Authorization: `Bearer ${token}` } })
          alert('✅ All points reset to 0')
          fetchUsers()
        } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
      }
    },

    { label: 'Score Second Chance', desc: 'Score SC bracket predictions', color: '#f59e0b', icon: '🔮',
  action: async () => {
    if (!confirm('Score Second Chance predictions now?')) return
    try {
      const res = await axios.post(`${API_URL}/api/admin/score-second-chance`, {}, { headers: { Authorization: `Bearer ${token}` } })
      alert(`✅ ${res.data.message}\n${res.data.results?.slice(0,5).map(r => `${r.username}: +${r.points_awarded}pts`).join('\n')}`)
    } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
  }
},
{ label: 'Score Main Knockouts', desc: 'Score pre-tournament knockout predictions', color: '#22c55e', icon: '🏆',
  action: async () => {
    if (!confirm('Score main knockout predictions now?')) return
    try {
      const res = await axios.post(`${API_URL}/api/admin/score-main-knockouts`, {}, { headers: { Authorization: `Bearer ${token}` } })
      alert(`✅ ${res.data.message}\n${res.data.results?.slice(0,5).map(r => `${r.username}: +${r.points_awarded}pts`).join('\n')}`)
    } catch (err) { alert('❌ Failed: ' + (err.response?.data?.error || err.message)) }
  }
},
  ]

  const STATS = [
    { label: 'Total Users', value: users.length, icon: '👥', color: '#3b82f6' },
    { label: 'Admins', value: users.filter(u => u.is_admin).length, icon: '⭐', color: '#fbbf24' },
    { label: 'Top Points', value: Math.max(...users.map(u => u.points), 0), icon: '🏆', color: '#22c55e' },
    { label: 'Mini Leagues', value: leagues.length, icon: '🏅', color: '#8b5cf6' },
  ]

  const currentRoundConfig = ROUND_CONFIG[selectedRound]
  const resultsMap = {}
  knockoutResults.forEach(r => { resultsMap[r.match_id] = r })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading admin panel...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>
            Admin Panel <span style={{ color: '#fbbf24' }}>⚙️</span>
          </h1>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Manage users, leagues, points, standings, qualification and knockout results.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ background: '#0d1526', border: `1px solid ${stat.color}20`, borderTop: `3px solid ${stat.color}`, borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tournament Controls */}
        <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 24, borderTop: '3px solid #fbbf24' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>⚙️ Tournament Controls</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {CONTROLS.map(ctrl => (
              <div key={ctrl.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ color: '#334155', fontSize: 11, margin: 0, fontWeight: 600 }}>{ctrl.desc}</p>
                <button onClick={ctrl.action}
                  style={{ background: `${ctrl.color}15`, border: `1px solid ${ctrl.color}40`, color: ctrl.color, fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${ctrl.color}25`}
                  onMouseLeave={e => e.currentTarget.style.background = `${ctrl.color}15`}>
                  {ctrl.icon} {ctrl.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'users',         label: '👥 Users',        count: users.length },
            { id: 'leagues',       label: '🏆 Mini Leagues', count: leagues.length },
            { id: 'standings',     label: '📊 Standings',    count: 12 },
            { id: 'qualification', label: '🎯 Qualification', count: qualification.filter(q => q.status !== 'tbd').length },
            { id: 'knockouts',     label: '⚔️ Knockouts',    count: knockoutResults.length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? '#fff' : '#94a3b8', boxShadow: activeTab === tab.id ? '0 4px 14px rgba(59,130,246,0.3)' : 'none' }}>
              {tab.label}
              <span style={{ marginLeft: 6, background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <>
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email..."
                style={{ width: '100%', background: '#0d1526', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', padding: '10px 16px 10px 40px', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px 160px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <span>ID</span><span>Username</span><span>Email</span><span>Points</span><span>Actions</span>
              </div>
              {filtered.map((user, i) => (
                <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                  style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px 160px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ color: '#334155', fontSize: 12, fontWeight: 600 }}>#{user.id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: user.is_admin ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)', border: user.is_admin ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: user.is_admin ? '#fbbf24' : '#94a3b8' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{user.username}</span>
                      {user.is_admin && <span style={{ color: '#fbbf24', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>⭐ ADMIN</span>}
                    </div>
                  </div>
                  <span style={{ color: '#475569', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{user.email}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="number" value={editPoints[user.id] !== undefined ? editPoints[user.id] : user.points}
                      onChange={e => setEditPoints(prev => ({ ...prev, [user.id]: e.target.value }))}
                      style={{ width: 56, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 12, padding: '5px 8px', borderRadius: 6, outline: 'none' }} />
                    {editPoints[user.id] !== undefined && (
                      <button onClick={() => updatePoints(user.id)} style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleAdmin(user.id)}
                      style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: user.is_admin ? 'rgba(251,191,36,0.15)' : 'transparent', border: `1px solid ${user.is_admin ? 'rgba(251,191,36,0.4)' : 'rgba(251,191,36,0.25)'}`, color: '#fbbf24' }}>
                      {user.is_admin ? 'Remove' : 'Admin'}
                    </button>
                    <button onClick={() => deleteUser(user.id, user.username)}
                      style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px' }}><p style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>No users found</p></div>}
            </div>
          </>
        )}

        {/* ── LEAGUES TAB ── */}
        {activeTab === 'leagues' && (
          <div>
            {leagues.length === 0 ? (
              <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
                <p style={{ color: '#475569', fontSize: 16, fontWeight: 600, margin: 0 }}>No leagues created yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {leagues.map((league, i) => (
                  <motion.div key={league.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                    style={{ background: '#0d1526', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: '16px 20px', borderLeft: '4px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>🏆</span>
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>{league.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#475569' }}>👤 <span style={{ color: '#94a3b8', fontWeight: 600 }}>{league.created_by}</span></span>
                        <span style={{ fontSize: 12, color: '#475569' }}>👥 <span style={{ color: '#94a3b8', fontWeight: 600 }}>{league.member_count}</span> members</span>
                        <span style={{ fontSize: 12, color: '#475569' }}>📅 {league.created_at}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8, padding: '6px 12px' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.1em' }}>{league.invite_code}</span>
                      </div>
                      <button onClick={() => deleteLeague(league.id, league.name)}
                        style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STANDINGS TAB ── */}
        {activeTab === 'standings' && (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {GROUP_LETTERS.map((g, i) => (
                <button key={g} onClick={() => setSelectedGroup(g)}
                  style={{ width: 36, height: 36, borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: selectedGroup === g ? GROUP_COLORS[i] : 'rgba(255,255,255,0.05)', color: selectedGroup === g ? '#000' : '#94a3b8' }}>{g}</button>
              ))}
            </div>
            <div style={{ background: '#0d1526', border: `1px solid ${GROUP_COLORS[GROUP_LETTERS.indexOf(selectedGroup)]}30`, borderRadius: 14, overflow: 'hidden', borderTop: `3px solid ${GROUP_COLORS[GROUP_LETTERS.indexOf(selectedGroup)]}` }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>Group {selectedGroup}</span>
                <span style={{ fontSize: 12, color: '#475569' }}>Click Edit to update a team's stats</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 40px 40px 40px 40px 40px 40px 50px 50px 80px', padding: '8px 16px', fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span>Team</span><span style={{ textAlign: 'center' }}>P</span><span style={{ textAlign: 'center' }}>W</span><span style={{ textAlign: 'center' }}>D</span><span style={{ textAlign: 'center' }}>L</span><span style={{ textAlign: 'center' }}>GF</span><span style={{ textAlign: 'center' }}>GA</span><span style={{ textAlign: 'center' }}>GD</span><span style={{ textAlign: 'center' }}>🟨</span><span style={{ textAlign: 'center' }}>🟥</span><span style={{ textAlign: 'center' }}>Pts</span>
              </div>
              {GROUPS[selectedGroup].map((team, i) => {
                const s = standings[selectedGroup]?.find(x => x.team === team) || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, yellow_cards: 0, red_cards: 0 }
                const color = GROUP_COLORS[GROUP_LETTERS.indexOf(selectedGroup)]
                return (
                  <div key={team} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 40px 40px 40px 40px 40px 40px 50px 50px 80px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 20, height: 20, borderRadius: 4, background: i < 2 ? '#22c55e' : i === 2 ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#000', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{team}</span>
                    </div>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>{s.played}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#22c55e' }}>{s.won}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>{s.drawn}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#ef4444' }}>{s.lost}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>{s.gf}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>{s.ga}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: s.gd > 0 ? '#22c55e' : s.gd < 0 ? '#ef4444' : '#94a3b8' }}>{s.gd > 0 ? '+' : ''}{s.gd}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#fbbf24' }}>{s.yellow_cards}</span>
                    <span style={{ textAlign: 'center', fontSize: 13, color: '#ef4444' }}>{s.red_cards}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color }}>{s.points}</span>
                      <button onClick={() => openEditStanding(selectedGroup, team)}
                        style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, cursor: 'pointer', background: `${color}15`, border: `1px solid ${color}40`, color }}>Edit</button>
                    </div>
                  </div>
                )
              })}
            </div>

            {editStanding && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 18, color: '#f1f5f9', margin: '0 0 4px' }}>Edit — {editStanding.team}</h3>
                  <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>Group {editStanding.group}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                    {[{ key: 'played', label: 'Played' }, { key: 'won', label: 'Won' }, { key: 'drawn', label: 'Drawn' }, { key: 'lost', label: 'Lost' }, { key: 'gf', label: 'Goals For' }, { key: 'ga', label: 'Goals Against' }, { key: 'points', label: 'Points' }, { key: 'yellow_cards', label: '🟨 Yellow' }, { key: 'red_cards', label: '🟥 Red' }].map(({ key, label }) => (
                      <div key={key}>
                        <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 4, fontWeight: 600 }}>{label}</label>
                        <input type="number" min="0" value={standingForm[key]}
                          onChange={e => setStandingForm(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 16, fontWeight: 700, padding: '8px 10px', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setEditStanding(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveStanding} disabled={savingStanding} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: savingStanding ? 0.6 : 1 }}>
                      {savingStanding ? 'Saving...' : '✅ Save Standing'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* ── QUALIFICATION TAB ── */}
        {activeTab === 'qualification' && (
          <div>
            <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 24, borderTop: '3px solid #3b82f6' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>🎯 Set Team Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 600 }}>Team</label>
                  <select value={qualForm.team} onChange={e => {
                    const found = ALL_TEAMS.find(t => t.team === e.target.value)
                    setQualForm(prev => ({ ...prev, team: e.target.value, group: found?.group || prev.group }))
                  }} style={{ width: '100%', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none' }}>
                    <option value="">Select team...</option>
                    {GROUP_LETTERS.map(g => (
                      <optgroup key={g} label={`Group ${g}`}>
                        {GROUPS[g].map(team => <option key={team} value={team}>{team}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 600 }}>Status</label>
                  <select value={qualForm.status} onChange={e => setQualForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ width: '100%', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none' }}>
                    <option value="advanced">✅ Advanced</option>
                    <option value="eliminated">❌ Eliminated</option>
                    <option value="tbd">⏳ TBD (reset)</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 600 }}>Message <span style={{ color: '#334155' }}>(shown when user taps the team)</span></label>
                <textarea value={qualForm.message} onChange={e => setQualForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="e.g. Mexico advance to the Round of 32!" rows={2}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <button onClick={saveQualification} disabled={savingQual || !qualForm.team}
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: savingQual || !qualForm.team ? 0.5 : 1 }}>
                {savingQual ? 'Saving...' : '💾 Save Status'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Current Statuses ({qualification.filter(q => q.status !== 'tbd').length} set)
              </div>
              {qualification.filter(q => q.status !== 'tbd').length === 0 ? (
                <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '24px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#334155', fontSize: 14, margin: 0 }}>No teams marked yet.</p>
                </div>
              ) : (
                qualification.filter(q => q.status !== 'tbd').sort((a, b) => {
                  if (a.status === b.status) return a.team.localeCompare(b.team)
                  return a.status === 'advanced' ? -1 : 1
                }).map(t => (
                  <div key={t.team} style={{ background: '#0d1526', border: `1px solid ${t.status === 'advanced' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderLeft: `4px solid ${t.status === 'advanced' ? '#22c55e' : '#ef4444'}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{t.status === 'advanced' ? '✅' : '❌'}</span>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{t.team}</span>
                        <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>Group {t.group}</span>
                      </div>
                    </div>
                    {t.message && <span style={{ fontSize: 12, color: '#64748b', flex: 1, fontStyle: 'italic' }}>"{t.message.slice(0, 60)}{t.message.length > 60 ? '...' : ''}"</span>}
                    <button onClick={() => removeQualification(t.team, t.group)}
                      style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', whiteSpace: 'nowrap' }}>
                      Reset
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── KNOCKOUTS TAB ── */}
        {activeTab === 'knockouts' && (
          <div>
            {/* Round selector + form */}
            <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, marginBottom: 24, borderTop: `3px solid ${currentRoundConfig.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: currentRoundConfig.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>⚔️ Set Knockout Result</div>

              {/* Round tabs */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {Object.entries(ROUND_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => { setSelectedRound(key); setKnockoutForm({ match_id: '', team1: '', team2: '', winner: '' }) }}
                    style={{ padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', border: 'none', background: selectedRound === key ? cfg.color : 'rgba(255,255,255,0.05)', color: selectedRound === key ? '#000' : '#94a3b8' }}>
                    {cfg.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {/* Match selector */}
                <div>
                  <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 600 }}>Match</label>
                  <select value={knockoutForm.match_id} onChange={e => handleMatchSelect(e.target.value)}
                    style={{ width: '100%', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none' }}>
                    <option value="">Select match...</option>
                    {currentRoundConfig.matchIds.map(mid => {
                      const existing = resultsMap[mid]
                      return (
                        <option key={mid} value={mid}>
                          M{mid}{existing ? ` ✓ ${existing.winner}` : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Winner selector — only shows once team1/team2 known */}
                <div>
                  <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 600 }}>Winner</label>
                  <select value={knockoutForm.winner} onChange={e => setKnockoutForm(prev => ({ ...prev, winner: e.target.value }))}
                    disabled={!knockoutForm.team1 && !knockoutForm.team2}
                    style={{ width: '100%', background: '#0f1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none', opacity: !knockoutForm.team1 && !knockoutForm.team2 ? 0.4 : 1 }}>
                    <option value="">Select winner...</option>
                    {knockoutForm.team1 && <option value={knockoutForm.team1}>{knockoutForm.team1}</option>}
                    {knockoutForm.team2 && <option value={knockoutForm.team2}>{knockoutForm.team2}</option>}
                  </select>
                </div>
              </div>

              {/* Manual team entry for R16+ where teams aren't pre-known */}
              {selectedRound !== 'R32' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 600 }}>Team 1</label>
                    <input type="text" value={knockoutForm.team1} onChange={e => setKnockoutForm(prev => ({ ...prev, team1: e.target.value, winner: '' }))}
                      placeholder="e.g. Germany"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 600 }}>Team 2</label>
                    <input type="text" value={knockoutForm.team2} onChange={e => setKnockoutForm(prev => ({ ...prev, team2: e.target.value, winner: '' }))}
                      placeholder="e.g. France"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: 13, padding: '10px 12px', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}

              <button onClick={saveKnockoutResult} disabled={savingKnockout || !knockoutForm.match_id || !knockoutForm.winner}
                style={{ background: `linear-gradient(135deg, ${currentRoundConfig.color}, ${currentRoundConfig.color}cc)`, color: '#000', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: savingKnockout || !knockoutForm.match_id || !knockoutForm.winner ? 0.5 : 1 }}>
                {savingKnockout ? 'Saving...' : `💾 Save Result`}
              </button>
            </div>

            {/* Current results */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Saved Results ({knockoutResults.length})
            </div>
            {knockoutResults.length === 0 ? (
              <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '24px 20px', textAlign: 'center' }}>
                <p style={{ color: '#334155', fontSize: 14, margin: 0 }}>No results saved yet. Use the form above after each match.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(ROUND_CONFIG).map(([roundKey, cfg]) => {
                  const roundResults = knockoutResults.filter(r => r.round === roundKey)
                  if (roundResults.length === 0) return null
                  return (
                    <div key={roundKey}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, marginTop: 8 }}>{cfg.label}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {roundResults.sort((a, b) => a.match_id - b.match_id).map(r => (
                          <div key={r.match_id} style={{ background: '#0d1526', border: `1px solid ${cfg.color}30`, borderLeft: `4px solid ${cfg.color}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>M{r.match_id}</span>
                              <span style={{ fontSize: 13, color: r.winner === r.team1 ? '#22c55e' : '#64748b', fontWeight: r.winner === r.team1 ? 800 : 600 }}>{r.team1}</span>
                              <span style={{ fontSize: 11, color: '#334155' }}>vs</span>
                              <span style={{ fontSize: 13, color: r.winner === r.team2 ? '#22c55e' : '#64748b', fontWeight: r.winner === r.team2 ? 800 : 600 }}>{r.team2}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>✓ {r.winner}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Admin