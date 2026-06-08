import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

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

function StatusBadge({ status }) {
  if (status === 'LIVE') return (
    <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
      🔴 LIVE
    </span>
  )
  if (status === 'FT') return (
    <span className="bg-gray-600 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">FT</span>
  )
  return (
    <span className="bg-gray-700 text-gray-400 text-xs font-bold px-2 py-1 rounded-full">{status}</span>
  )
}

function MatchCard({ match, onClick }) {
  const isNS = match.status === 'NS'
  const isLive = match.status === 'LIVE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(match)}
      className={`bg-gray-800 rounded-2xl p-4 border cursor-pointer transition hover:border-green-500 ${
        isLive ? 'border-red-500' : 'border-gray-700'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          {match.group ? `Group ${match.group}` : match.round ? `Round ${match.round}` : 'Match'}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1 flex-1">
          <img
            src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`}
            alt={match.home}
            className="w-12 h-8 object-cover rounded-md shadow"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="text-white font-bold text-xs text-center leading-tight">{match.home}</span>
        </div>

        <div className="flex flex-col items-center gap-1 px-2">
          {isNS ? (
            <>
              <span className="text-green-400 font-bold text-base">{match.time}</span>
              <span className="text-gray-500 text-xs">UTC</span>
            </>
          ) : (
            <span className="text-white font-extrabold text-2xl whitespace-nowrap">
              {match.home_score ?? 0} — {match.away_score ?? 0}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <img
            src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`}
            alt={match.away}
            className="w-12 h-8 object-cover rounded-md shadow"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="text-white font-bold text-xs text-center leading-tight">{match.away}</span>
        </div>
      </div>

      <p className="text-gray-500 text-xs text-center mt-3 truncate">📍 {match.venue}</p>
    </motion.div>
  )
}

function MatchModal({ match, onClose }) {
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    if (!match) return
    if (match.status === 'NS') return
    if (!match.api_fixture_id) return

    setEventsLoading(true)
    axios.get(`http://192.168.100.3:5000/api/match-events/${match.api_fixture_id}`)
      .then(res => { setEvents(res.data); setEventsLoading(false) })
      .catch(() => setEventsLoading(false))
  }, [match])

  if (!match) return null

  const getEventIcon = (type, detail) => {
    if (type === 'Goal') {
      if (detail === 'Own Goal') return '⚽🔴'
      if (detail === 'Penalty') return '⚽🎯'
      return '⚽'
    }
    if (type === 'Card') {
      if (detail === 'Yellow Card') return '🟨'
      if (detail === 'Red Card') return '🟥'
      if (detail === 'Yellow Red Card') return '🟨🟥'
    }
    if (type === 'subst') return '🔄'
    return '•'
  }

  const homeEvents = events.filter(e =>
    match.home.toLowerCase().includes(e.team.toLowerCase()) ||
    e.team.toLowerCase().includes(match.home.toLowerCase())
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-lg sm:mx-4 border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Handle bar for mobile */}
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4 sm:hidden"></div>

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-green-400 font-bold text-xs uppercase tracking-wider">
              {match.group ? `Group ${match.group}` : `Round ${match.round}`} — {match.date}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
          </div>

          {/* Teams + Score */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex flex-col items-center gap-2 flex-1">
              <img
                src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`}
                alt={match.home}
                className="w-14 h-10 object-cover rounded-md shadow"
              />
              <span className="text-white font-bold text-sm text-center">{match.home}</span>
            </div>

            <div className="flex flex-col items-center">
              {match.status === 'NS' ? (
                <>
                  <span className="text-green-400 font-bold text-xl">{match.time}</span>
                  <span className="text-gray-500 text-xs mt-1">Kick Off (UTC)</span>
                </>
              ) : (
                <>
                  <span className="text-white font-extrabold text-3xl sm:text-4xl">
                    {match.home_score ?? 0} — {match.away_score ?? 0}
                  </span>
                  {match.status === 'LIVE' && match.minute && (
                    <span className="text-red-400 font-bold text-sm mt-1 animate-pulse">{match.minute}'</span>
                  )}
                  <StatusBadge status={match.status} />
                </>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <img
                src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`}
                alt={match.away}
                className="w-14 h-10 object-cover rounded-md shadow"
              />
              <span className="text-white font-bold text-sm text-center">{match.away}</span>
            </div>
          </div>

          {/* Match Events */}
          {match.status !== 'NS' && (
            <div className="mb-6">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Match Events</h3>
              {eventsLoading ? (
                <p className="text-gray-500 text-sm text-center py-4 animate-pulse">Loading events...</p>
              ) : events.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">No events yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {events.filter(e => e.type !== 'subst').map((e, i) => {
                    const isHome = homeEvents.includes(e)
                    return (
                      <div key={i} className={`flex items-center gap-2 text-sm ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className="text-gray-500 text-xs w-7 text-center">{e.minute}'</span>
                        <span className="text-base">{getEventIcon(e.type, e.detail)}</span>
                        <span className={`text-white font-medium text-xs ${isHome ? 'text-left' : 'text-right'}`}>
                          {e.player}
                        </span>
                        {(e.detail === 'Own Goal' || e.detail === 'Penalty') && (
                          <span className="text-gray-500 text-xs">({e.detail})</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Match Info */}
          <div className="bg-gray-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400 text-sm flex-shrink-0">📍 Venue</span>
              <span className="text-white text-sm font-medium text-right">{match.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">📅 Date</span>
              <span className="text-white text-sm font-medium">{match.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">🕐 Kick Off</span>
              <span className="text-white text-sm font-medium">{match.time} UTC</span>
            </div>
          </div>

          {match.status === 'NS' && (
            <p className="text-gray-500 text-xs text-center mt-4">
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
    axios.get('http://192.168.100.3:5000/api/livescores')
      .then(res => {
        const wc2026 = res.data.filter(m => m.date && m.date.startsWith('2026'))
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

  const filtered = matches.filter(m => {
    const groupMatch = filter === 'ALL' || m.group === filter
    const dateMatch = !selectedDate || m.date === selectedDate
    return groupMatch && dateMatch
  })

  const byDate = filtered.reduce((acc, match) => {
    if (!acc[match.date]) acc[match.date] = []
    acc[match.date].push(match)
    return acc
  }, {})

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-green-400 text-xl animate-pulse">Loading matches...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 py-8">

      {/* Title row */}
      <div className="flex items-center justify-between mb-1">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-green-400"
        >
          Live Scores ⚡
        </motion.h1>
        {lastUpdated && (
          <span className="text-gray-500 text-xs">🔄 {lastUpdated}</span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Follow every World Cup 2026 match — tap a match for details.
      </p>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Group filter — horizontally scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                filter === g
                  ? 'bg-green-500 text-black'
                  : 'border border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400'
              }`}
            >
              {g === 'ALL' ? 'All' : `Grp ${g}`}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="flex-1 sm:flex-none bg-gray-800 border border-gray-600 text-white px-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-green-500"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate('')} className="text-gray-400 hover:text-white text-sm">
              Clear ✕
            </button>
          )}
        </div>
      </div>

      {/* Matches */}
      {Object.keys(byDate).sort().map(date => (
        <div key={date} className="mb-8">
          <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
            📅 {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byDate[date].map(match => (
              <MatchCard key={match.id} match={match} onClick={setSelectedMatch} />
            ))}
          </div>
        </div>
      ))}

      {Object.keys(byDate).length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No matches found.</p>
        </div>
      )}

      {selectedMatch && (
        <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  )
}

export default LiveScores