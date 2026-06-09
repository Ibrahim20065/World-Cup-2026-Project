import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../assets/AuthContext'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]

function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const currentUser = user?.username

  useEffect(() => {
    axios.get('http://192.168.100.3:5000/api/leaderboard')
      .then(res => { setPlayers(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const myRank = players.find(p => p.username === currentUser)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🏅</div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading leaderboard...</p>
      </div>
    </div>
  )

  const top3 = players.slice(0, 3)
  const rest = players.slice(3)

  const PODIUM_CONFIG = [
    { index: 1, height: 150, medal: '🥈', color: '#94a3b8', border: 'rgba(148,163,184,0.3)', delay: 0.2 },
    { index: 0, height: 200, medal: '🥇', color: '#fbbf24', border: 'rgba(251,191,36,0.4)', delay: 0.1 },
    { index: 2, height: 110, medal: '🥉', color: '#fb923c', border: 'rgba(251,146,60,0.3)', delay: 0.3 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{ display: 'flex', height: 3 }}>
        {GROUP_COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            FIFA World Cup 2026
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            Leaderboard <span style={{ color: '#fbbf24' }}>🏅</span>
          </h1>
          <p style={{ color: '#475569', marginTop: 6, fontSize: 14 }}>
            Rankings update automatically as predictions come true.
          </p>
        </div>

        {/* My Rank Card */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: '4px solid #22c55e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900, color: '#000', flexShrink: 0,
              }}>
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                  style={{
                    flex: 1, maxWidth: index === 0 ? 160 : 130,
                    height, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end',
                    background: `${color}10`,
                    border: `1px solid ${border}`,
                    borderBottom: `3px solid ${color}`,
                    borderRadius: '12px 12px 0 0',
                    padding: '12px 8px 14px',
                  }}
                >
                  <span style={{ fontSize: index === 0 ? 32 : 24, marginBottom: 6 }}>{medal}</span>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${color}20`, border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 900, color, marginBottom: 6,
                  }}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 12, color: '#f1f5f9', margin: 0, textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.username}
                  </p>
                  <p style={{ color, fontWeight: 800, fontSize: 13, margin: '2px 0 0' }}>{p.points} pts</p>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Full Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}
        >
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 80px',
            padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11, fontWeight: 700, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <span>Rank</span>
            <span>Player</span>
            <span style={{ textAlign: 'right' }}>Points</span>
          </div>

          {players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👀</div>
              <p style={{ color: '#475569', fontSize: 16, fontWeight: 600, margin: 0 }}>No players yet</p>
              <p style={{ color: '#334155', fontSize: 13, marginTop: 6 }}>Be the first to sign up!</p>
            </div>
          ) : (
            players.map((player, i) => {
              const isMe = player.username === currentUser
              const rankColor = player.rank === 1 ? '#fbbf24' : player.rank === 2 ? '#94a3b8' : player.rank === 3 ? '#fb923c' : '#64748b'
              const avatarBg = player.rank === 1 ? 'linear-gradient(135deg,#fbbf24,#d97706)' :
                               player.rank === 2 ? 'linear-gradient(135deg,#94a3b8,#64748b)' :
                               player.rank === 3 ? 'linear-gradient(135deg,#fb923c,#ea580c)' :
                               'rgba(255,255,255,0.06)'
              const avatarColor = player.rank <= 3 ? '#000' : '#94a3b8'

              return (
                <motion.div
                  key={player.username}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                  style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr 80px',
                    padding: '12px 20px',
                    borderBottom: i < players.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    alignItems: 'center',
                    background: isMe ? 'rgba(34,197,94,0.06)' : 'transparent',
                    borderLeft: isMe ? '3px solid #22c55e' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Rank */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {player.rank <= 3 ? (
                      <span style={{ fontSize: 18 }}>
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>#{player.rank}</span>
                    )}
                  </div>

                  {/* Player */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: avatarBg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: avatarColor,
                    }}>
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontWeight: 700, fontSize: 14, margin: 0,
                        color: isMe ? '#22c55e' : '#f1f5f9',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {player.username}
                        {isMe && <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600, marginLeft: 6 }}>(You)</span>}
                      </p>
                      {player.is_admin && (
                        <p style={{ color: '#fbbf24', fontSize: 11, margin: 0, fontWeight: 600 }}>⭐ Admin</p>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: rankColor }}>{player.points}</span>
                    <span style={{ color: '#475569', fontSize: 11, marginLeft: 4 }}>pts</span>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>

        <p style={{ color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          Points awarded automatically when predictions match real results ⚡
        </p>
      </div>
    </div>
  )
}

export default Leaderboard
