import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import API_URL from '../config'
import { useColor } from '../assets/ColorContext'

const FLAGS = {
  'Mexico': 'mx', 'South Korea': 'kr', 'South Africa': 'za', 'Czech Republic': 'cz',
  'Canada': 'ca', 'Switzerland': 'ch', 'Qatar': 'qa', 'Bosnia': 'ba',
  'Brazil': 'br', 'Scotland': 'gb-sct', 'Morocco': 'ma', 'Haiti': 'ht',
  'USA': 'us', 'Australia': 'au', 'Paraguay': 'py', 'Turkey': 'tr',
  'Germany': 'de', 'Ecuador': 'ec', 'Ivory Coast': 'ci', 'Curacao': 'cw',
  'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
  'Belgium': 'be', 'New Zealand': 'nz', 'Egypt': 'eg', 'Iran': 'ir',
  'Spain': 'es', 'Uruguay': 'uy', 'Saudi Arabia': 'sa', 'Cape Verde': 'cv',
  'France': 'fr', 'Norway': 'no', 'Senegal': 'sn', 'Iraq': 'iq',
  'Argentina': 'ar', 'Austria': 'at', 'Jordan': 'jo', 'Algeria': 'dz',
  'Portugal': 'pt', 'Colombia': 'co', 'Uzbekistan': 'uz', 'DR Congo': 'cd',
  'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
}

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','var(--accent)','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function getGroupColor(group) {
  const idx = GROUP_LETTERS.indexOf(group)
  return idx >= 0 ? GROUP_COLORS[idx] : 'var(--accent)'
}

// Convert kickoff_utc ISO string to local time string for display
function toLocalTime(kickoff_utc) {
  try {
    return new Date(kickoff_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return ''
  }
}

// Get local date string YYYY-MM-DD from kickoff_utc
function toLocalDate(kickoff_utc) {
  try {
    return new Date(kickoff_utc).toLocaleDateString('en-CA') // returns YYYY-MM-DD in local time
  } catch {
    return ''
  }
}

function StatusBadge({ status, minute }) {
  if (status === 'LIVE') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
      color: '#f87171', fontSize: 11, fontWeight: 800,
      padding: '3px 9px', borderRadius: 100,
      animation: 'livePulse 2s infinite',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
      LIVE {minute ? `${minute}'` : ''}
    </span>
  )
  if (status === 'FT') return (
    <span style={{
      background: 'rgba(255,255,255,0.06)', color: '#64748b',
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>FT</span>
  )
  return (
    <span style={{
      background: 'rgba(255,255,255,0.04)', color: '#475569',
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>{status}</span>
  )
}

function MatchCard({ match, onClick }) {
  const isNS = match.status === 'NS'
  const isLive = match.status === 'LIVE'
  const groupColor = match.group ? getGroupColor(match.group) : 'var(--accent)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(match)}
      style={{
        background: '#0d1526',
        border: `1px solid ${isLive ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderTop: `3px solid ${isLive ? '#ef4444' : groupColor}`,
        borderRadius: 14, padding: 20, cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.15s',
        boxShadow: isLive ? '0 0 20px rgba(239,68,68,0.1)' : 'none',
      }}
      whileHover={{ y: -2 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: groupColor }}>
          {match.group ? `Group ${match.group}` : 'Match'}
        </span>
        <StatusBadge status={match.status} minute={match.minute} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
          <img src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`} alt={match.home}
            style={{ width: 64, height: 43, objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            onError={e => { e.target.style.display = 'none' }} />
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 12, textAlign: 'center', lineHeight: 1.3 }}>{match.home}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '0 4px' }}>
          {isNS ? (
            <>
              <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 17 }}>
                {toLocalTime(match.kickoff_utc)}
              </span>
              <span style={{ color: '#334155', fontSize: 10, fontWeight: 600 }}>Local Time</span>
            </>
          ) : (
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 30, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              {match.home_score ?? 0} – {match.away_score ?? 0}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
          <img src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`} alt={match.away}
            style={{ width: 64, height: 43, objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            onError={e => { e.target.style.display = 'none' }} />
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 12, textAlign: 'center', lineHeight: 1.3 }}>{match.away}</span>
        </div>
      </div>

      <p style={{ color: '#334155', fontSize: 11, textAlign: 'center', marginTop: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        📍 {match.venue}
      </p>
    </motion.div>
  )
}

function MatchModal({ match, onClose }) {
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    if (!match || match.status === 'NS' || !match.api_fixture_id) return
    setEventsLoading(true)
    axios.get(`${API_URL}/api/match-events/${match.api_fixture_id}`)
      .then(res => { setEvents(res.data); setEventsLoading(false) })
      .catch(() => setEventsLoading(false))
  }, [match])

  if (!match) return null

  const getEventIcon = (type, detail) => {
    if (type === 'Goal') return detail === 'Own Goal' ? '⚽🔴' : detail === 'Penalty' ? '⚽🎯' : '⚽'
    if (type === 'Card') return detail === 'Yellow Card' ? '🟨' : detail === 'Red Card' ? '🟥' : '🟨🟥'
    if (type === 'subst') return '🔄'
    return '•'
  }

  const homeEvents = events.filter(e =>
    match.home.toLowerCase().includes(e.team.toLowerCase()) ||
    e.team.toLowerCase().includes(match.home.toLowerCase())
  )
  const groupColor = match.group ? getGroupColor(match.group) : 'var(--accent)'

  // Local date and time from kickoff_utc
  const localDate = match.kickoff_utc
    ? new Date(match.kickoff_utc).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : ''
  const localTime = match.kickoff_utc ? toLocalTime(match.kickoff_utc) : ''

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        className="sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#0d1526', borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: `3px solid ${groupColor}`,
            width: '100%', maxWidth: 520, maxHeight: '90vh',
            overflowY: 'auto', padding: 24,
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          }}
          className="sm:rounded-2xl sm:mx-4"
        >
          <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '0 auto 20px' }} className="sm:hidden" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: groupColor, display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: groupColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {match.group ? `Group ${match.group}` : 'Match'}
              </span>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <img src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`} alt={match.home}
                style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} />
              <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 14, textAlign: 'center' }}>{match.home}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {match.status === 'NS' ? (
                <>
                  <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 24 }}>{localTime}</span>
                  <span style={{ color: '#334155', fontSize: 12 }}>Your Local Time</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 36, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {match.home_score ?? 0} – {match.away_score ?? 0}
                  </span>
                  <StatusBadge status={match.status} minute={match.minute} />
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <img src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`} alt={match.away}
                style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }} />
              <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 14, textAlign: 'center' }}>{match.away}</span>
            </div>
          </div>

          {match.status !== 'NS' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                Match Events
              </div>
              {eventsLoading ? (
                <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Loading events...</p>
              ) : events.length === 0 ? (
                <p style={{ color: '#334155', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No events yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.filter(e => e.type !== 'subst').map((e, i) => {
                    const isHome = homeEvents.includes(e)
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isHome ? 'row' : 'row-reverse' }}>
                        <span style={{ color: '#475569', fontSize: 11, width: 28, textAlign: 'center', flexShrink: 0 }}>{e.minute}'</span>
                        <span style={{ fontSize: 14 }}>{getEventIcon(e.type, e.detail)}</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, textAlign: isHome ? 'left' : 'right' }}>{e.player}</span>
                        {(e.detail === 'Own Goal' || e.detail === 'Penalty') && (
                          <span style={{ color: '#475569', fontSize: 11 }}>({e.detail})</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '📍', label: 'Venue', value: match.venue },
              { icon: '📅', label: 'Date', value: localDate },
              { icon: '🕐', label: 'Kick Off', value: localTime + ' (your local time)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ color: '#475569', fontSize: 13, flexShrink: 0 }}>{row.icon} {row.label}</span>
                <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {match.status === 'NS' && (
            <p style={{ color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
              Live stats will appear here once the match starts ⚡
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function LiveScores() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')

  const GROUPS = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  const fetchMatches = () => {
    axios.get(`${API_URL}/api/livescores`)
      .then(res => {
        // Filter only WC2026 matches (have kickoff_utc)
        const wc2026 = res.data.filter(m => m.kickoff_utc && m.kickoff_utc.startsWith('2026'))
        setMatches(wc2026)
        setLastUpdated(new Date().toLocaleTimeString())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(fetchMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  const liveCount = matches.filter(m => m.status === 'LIVE').length

  const filtered = matches.filter(m => {
    const groupMatch = filter === 'ALL' || m.group === filter
    // Compare selected date (YYYY-MM-DD) against user's local date of kickoff
    const dateMatch = !selectedDate || toLocalDate(m.kickoff_utc) === selectedDate
    return groupMatch && dateMatch
  })

  // Group by user's LOCAL date derived from kickoff_utc
  const byDate = filtered.reduce((acc, match) => {
    const localDate = toLocalDate(match.kickoff_utc)
    if (!acc[localDate]) acc[localDate] = []
    acc[localDate].push(match)
    return acc
  }, {})

  // Sort matches within each day by kickoff time
  Object.values(byDate).forEach(dayMatches =>
    dayMatches.sort((a, b) => new Date(a.kickoff_utc) - new Date(b.kickoff_utc))
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>Loading matches...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, var(--accent), #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              FIFA World Cup 2026
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Bebas Neue, sans-serif' }}>
              Live Scores ⚡
              {liveCount > 0 && (
                <span style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', fontSize: 12, fontWeight: 800,
                  padding: '3px 10px', borderRadius: 100,
                  animation: 'livePulse 2s infinite',
                }}>
                  {liveCount} LIVE
                </span>
              )}
            </h1>
            <p style={{ color: '#475569', marginTop: 6, fontSize: 14 }}>
              All times shown in your local timezone. Tap any match for details.
            </p>
          </div>
          {lastUpdated && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 100, padding: '6px 12px', fontSize: 11, color: '#475569', flexShrink: 0,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Updated {lastUpdated}
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {GROUPS.map(g => {
              const color = g === 'ALL' ? 'var(--accent)' : getGroupColor(g)
              const active = filter === g
              return (
                <button key={g} onClick={() => setFilter(g)}
                  style={{
                    flexShrink: 0, padding: '5px 12px', borderRadius: 8,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: active ? color : 'rgba(255,255,255,0.04)',
                    color: active ? (g === 'ALL' ? '#fff' : '#000') : '#64748b',
                    transition: 'all 0.15s',
                    boxShadow: active ? `0 2px 10px ${color}40` : 'none',
                  }}>
                  {g === 'ALL' ? 'All Groups' : `Group ${g}`}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              style={{
                background: '#0d1526', border: '1px solid rgba(255,255,255,0.08)',
                color: '#cbd5e1', padding: '7px 14px', borderRadius: 8,
                fontSize: 13, outline: 'none', flex: 1, maxWidth: 200,
              }} />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Clear ✕
              </button>
            )}
          </div>
        </div>

        {/* Match days — sorted by local date */}
        {Object.keys(byDate).sort().map(localDate => (
          <div key={localDate} style={{ marginBottom: 36 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8' }}>
                {new Date(localDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#475569', fontSize: 11, fontWeight: 700,
                padding: '2px 8px', borderRadius: 100,
              }}>
                {byDate[localDate].length} match{byDate[localDate].length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {byDate[localDate].map(match => (
                <MatchCard key={match.id} match={match} onClick={setSelectedMatch} />
              ))}
            </div>
          </div>
        ))}

        {Object.keys(byDate).length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ color: '#475569', fontSize: 16, fontWeight: 600 }}>No matches found.</p>
          </div>
        )}
      </div>

      {selectedMatch && <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
      `}</style>
    </div>
  )
}

export default LiveScores