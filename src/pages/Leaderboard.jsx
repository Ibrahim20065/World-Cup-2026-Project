import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../assets/AuthContext'
import API_URL from '../config'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [leagueName, setLeagueName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)
  const { user } = useAuth()
  const currentUser = user?.username
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get(`${API_URL}/api/leaderboard`)
      .then(res => { setPlayers(res.data); setLoading(false) })
      .catch(() => setLoading(false))

    if (token) {
      axios.get(`${API_URL}/api/leagues/my`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setLeagues(res.data)).catch(() => {})
    }
  }, [])

  const createLeague = async () => {
    if (!leagueName.trim()) return
    setModalLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/leagues`,
        { name: leagueName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Refresh leagues
      const updated = await axios.get(`${API_URL}/api/leagues/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeagues(updated.data)
      setLeagueName('')
      setShowCreateModal(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating league')
    }
    setModalLoading(false)
  }

  const joinLeague = async () => {
    if (!inviteCode.trim()) return
    setModalLoading(true)
    try {
      await axios.post(`${API_URL}/api/leagues/join`,
        { invite_code: inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updated = await axios.get(`${API_URL}/api/leagues/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeagues(updated.data)
      setInviteCode('')
      setShowJoinModal(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Error joining league')
    }
    setModalLoading(false)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const myRank = players.find(p => p.username === currentUser)

  const PODIUM_CONFIG = [
    { index: 1, height: 150, medal: '🥈', color: '#94a3b8', border: 'rgba(148,163,184,0.3)', delay: 0.2 },
    { index: 0, height: 200, medal: '🥇', color: '#fbbf24', border: 'rgba(251,191,36,0.4)', delay: 0.1 },
    { index: 2, height: 110, medal: '🥉', color: '#fb923c', border: 'rgba(251,146,60,0.3)', delay: 0.3 },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}></div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading leaderboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>

      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              FIFA World Cup 2026
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', fontFamily: 'Bebas Neue, sans-serif' }}>
              Leaderboard <span style={{ color: '#fbbf24' }}>🏅</span>
            </h1>
            <p style={{ color: '#475569', marginTop: 6, fontSize: 14 }}>
              Rankings update automatically as predictions come true.
            </p>
          </div>

          {/* League buttons */}
          {token && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowCreateModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  padding: '9px 16px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                🏆 Create League
              </button>
              <button onClick={() => setShowJoinModal(true)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontWeight: 700, fontSize: 13,
                  padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8' }}>
                🔗 Join League
              </button>
            </div>
          )}
        </div>

        {/* My Rank Card */}
        {myRank && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: '4px solid #22c55e',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#000', flexShrink: 0 }}>
                {myRank.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 800, color: '#22c55e', margin: 0, fontSize: 15 }}>{myRank.username}</p>
                <p style={{ color: '#475569', margin: 0, fontSize: 12 }}>Rank #{myRank.rank} · Your position</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{myRank.points}</p>
              <p style={{ color: '#475569', margin: 0, fontSize: 12 }}>points</p>
            </div>
          </motion.div>
        )}

        {/* Podium */}
        {players.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
            {PODIUM_CONFIG.map(({ index, height, medal, color, border, delay }) => {
              const p = players[index]
              if (!p) return null
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
                  style={{ flex: 1, maxWidth: index === 0 ? 160 : 130, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', background: `${color}10`, border: `1px solid ${border}`, borderBottom: `3px solid ${color}`, borderRadius: '12px 12px 0 0', padding: '12px 8px 14px' }}>
                  <span style={{ fontSize: index === 0 ? 32 : 24, marginBottom: 6 }}>{medal}</span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color, marginBottom: 6 }}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 12, color: '#f1f5f9', margin: 0, textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</p>
                  <p style={{ color, fontWeight: 800, fontSize: 13, margin: '2px 0 0', fontFamily:'Bebas Neue, sans-serif' }}>{p.points} pts</p>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Global Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>Rank</span><span>Player</span><span style={{ textAlign: 'right' }}>Points</span>
          </div>
          {players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👀</div>
              <p style={{ color: '#475569', fontSize: 16, fontWeight: 600, margin: 0 }}>No players yet</p>
            </div>
          ) : (
            players.map((player, i) => {
              const isMe = player.username === currentUser
              const rankColor = player.rank === 1 ? '#fbbf24' : player.rank === 2 ? '#94a3b8' : player.rank === 3 ? '#fb923c' : '#64748b'
              const avatarBg = player.rank === 1 ? 'linear-gradient(135deg,#fbbf24,#d97706)' : player.rank === 2 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : player.rank === 3 ? 'linear-gradient(135deg,#fb923c,#ea580c)' : 'rgba(255,255,255,0.06)'
              const avatarColor = player.rank <= 3 ? '#000' : '#94a3b8'
              return (
                <motion.div key={player.username} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}
                  style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px', padding: '12px 20px', borderBottom: i < players.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center', background: isMe ? 'rgba(34,197,94,0.06)' : 'transparent', borderLeft: isMe ? '3px solid #22c55e' : '3px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {player.rank <= 3 ? <span style={{ fontSize: 18 }}>{player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}</span> : <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>#{player.rank}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: avatarColor }}>
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: isMe ? '#22c55e' : '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {player.username}{isMe && <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600, marginLeft: 6 }}>(You)</span>}
                      </p>
                      {player.is_admin && <p style={{ color: '#fbbf24', fontSize: 11, margin: 0, fontWeight: 600 }}>⭐ Admin</p>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: rankColor }}>{player.points}</span>
                    <span style={{ color: '#475569', fontSize: 11, marginLeft: 4 }}>pts</span>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* ── MINI LEAGUES ── */}
        {leagues.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Your Mini Leagues
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {leagues.map((league, li) => (
                <motion.div key={league.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: li * 0.08 }}
                  style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, overflow: 'hidden', borderTop: '3px solid #3b82f6' }}>

                  {/* League header */}
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>🏆</span>
                        <span style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>{league.name}</span>
                        {league.is_creator && (
                          <span style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100 }}>Creator</span>
                        )}
                      </div>
                      <p style={{ color: '#475569', fontSize: 12, margin: '3px 0 0' }}>
                        {league.members.length} member{league.members.length !== 1 ? 's' : ''} · Created by {league.created_by}
                      </p>
                    </div>

                    {/* Invite code — only shown to creator */}
                    {league.invite_code && (
                      <button onClick={() => copyCode(league.invite_code)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: copiedCode === league.invite_code ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${copiedCode === league.invite_code ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 8, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.1em' }}>{league.invite_code}</span>
                        <span style={{ fontSize: 11, color: copiedCode === league.invite_code ? '#22c55e' : '#475569' }}>
                          {copiedCode === league.invite_code ? '✓ Copied!' : '📋 Copy'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* League members table */}
                  <div>
                    {league.members.map((member, mi) => {
                      const isMe = member.username === currentUser
                      const medalColor = mi === 0 ? '#fbbf24' : mi === 1 ? '#94a3b8' : mi === 2 ? '#fb923c' : '#475569'
                      return (
                        <div key={member.username}
                          style={{ display: 'grid', gridTemplateColumns: '44px 1fr 70px', padding: '10px 18px', borderBottom: mi < league.members.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center', background: isMe ? 'rgba(34,197,94,0.05)' : 'transparent', borderLeft: isMe ? '3px solid #22c55e' : '3px solid transparent' }}>
                          <div>
                            {mi < 3 ? (
                              <span style={{ fontSize: 16 }}>{mi === 0 ? '🥇' : mi === 1 ? '🥈' : '🥉'}</span>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>#{mi + 1}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMe ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isMe ? '#000' : '#94a3b8', flexShrink: 0 }}>
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: isMe ? '#22c55e' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {member.username}{isMe && <span style={{ fontSize: 10, marginLeft: 5, color: '#22c55e' }}>(You)</span>}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: medalColor }}>{member.points}</span>
                            <span style={{ color: '#475569', fontSize: 11, marginLeft: 3 }}>pts</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* No leagues yet */}
        {token && leagues.length === 0 && (
          <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🏆</div>
            <p style={{ color: '#475569', fontWeight: 600, fontSize: 15, margin: 0 }}>No mini leagues yet</p>
            <p style={{ color: '#334155', fontSize: 13, marginTop: 6 }}>Create one or join a friend's league!</p>
          </div>
        )}

        <p style={{ color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          Points awarded automatically when predictions match real results ⚡
        </p>
      </div>

      {/* ── CREATE MODAL ── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, borderTop: '3px solid #3b82f6' }}>
              <h2 style={{ fontWeight: 900, fontSize: 20, color: '#f1f5f9', margin: '0 0 6px' }}>🏆 Create a League</h2>
              <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>Give your league a name — your friends will join using the invite code.</p>
              <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>League Name</label>
              <input
                type="text" value={leagueName} onChange={e => setLeagueName(e.target.value)}
                placeholder="e.g. Family WC2026, Work Mates..."
                maxLength={50}
                onKeyDown={e => { if (e.key === 'Enter') createLeague() }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', padding: '12px 14px', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 10, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={createLeague} disabled={modalLoading || !leagueName.trim()}
                  style={{ flex: 2, background: leagueName.trim() ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.05)', color: leagueName.trim() ? '#fff' : '#475569', fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 10, border: 'none', cursor: leagueName.trim() ? 'pointer' : 'not-allowed', boxShadow: leagueName.trim() ? '0 4px 14px rgba(59,130,246,0.3)' : 'none' }}>
                  {modalLoading ? 'Creating...' : '🏆 Create League'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── JOIN MODAL ── */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowJoinModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0d1526', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, borderTop: '3px solid #22c55e' }}>
              <h2 style={{ fontWeight: 900, fontSize: 20, color: '#f1f5f9', margin: '0 0 6px' }}>🔗 Join a League</h2>
              <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>Enter the invite code from your friend to join their league.</p>
              <label style={{ color: '#64748b', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invite Code</label>
              <input
                type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. WC7X2K"
                maxLength={8}
                onKeyDown={e => { if (e.key === 'Enter') joinLeague() }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', padding: '12px 14px', borderRadius: 10, fontSize: 18, fontWeight: 800, letterSpacing: '0.15em', outline: 'none', boxSizing: 'border-box', marginBottom: 20, textAlign: 'center' }}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowJoinModal(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 10, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={joinLeague} disabled={modalLoading || !inviteCode.trim()}
                  style={{ flex: 2, background: inviteCode.trim() ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.05)', color: inviteCode.trim() ? '#000' : '#475569', fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 10, border: 'none', cursor: inviteCode.trim() ? 'pointer' : 'not-allowed', boxShadow: inviteCode.trim() ? '0 4px 14px rgba(34,197,94,0.3)' : 'none' }}>
                  {modalLoading ? 'Joining...' : '🔗 Join League'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Leaderboard