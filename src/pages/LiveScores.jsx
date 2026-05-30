import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

// ============================================================
// FLAG MAP — reusing same country codes as predictions
// ============================================================
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

// ============================================================
// STATUS BADGE — shows match status
// ============================================================
function StatusBadge({ status }) {
  if (status === 'LIVE') return (
    <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
      🔴 LIVE
    </span>
  )
  if (status === 'FT') return (
    <span className="bg-gray-600 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
      FT
    </span>
  )
  return (
    <span className="bg-gray-700 text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
      {status}
    </span>
  )
}

// ============================================================
// MATCH CARD — single match display
// ============================================================
function MatchCard({ match, onClick }) {
  const isNS = match.status === 'NS'
  const isFT = match.status === 'FT'
  const isLive = match.status === 'LIVE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(match)}
      className={`bg-gray-800 rounded-2xl p-5 border cursor-pointer transition hover:border-green-500 ${
        isLive ? 'border-red-500' : 'border-gray-700'
      }`}
    >
      {/* Group + Status */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          Group {match.group}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-4">

        {/* Home Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <img
            src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`}
            alt={match.home}
            className="w-14 h-10 object-cover rounded-md shadow"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="text-white font-bold text-sm text-center">{match.home}</span>
        </div>

        {/* Score / Time */}
        <div className="flex flex-col items-center gap-1">
          {isNS ? (
            <>
              <span className="text-green-400 font-bold text-lg">{match.time}</span>
              <span className="text-gray-500 text-xs">UTC</span>
            </>
          ) : (
            <span className="text-white font-extrabold text-3xl">
              {match.home_score ?? 0} — {match.away_score ?? 0}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <img
            src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`}
            alt={match.away}
            className="w-14 h-10 object-cover rounded-md shadow"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="text-white font-bold text-sm text-center">{match.away}</span>
        </div>

      </div>

      {/* Venue */}
      <p className="text-gray-500 text-xs text-center mt-4">📍 {match.venue}</p>
    </motion.div>
  )
}

// ============================================================
// MATCH DETAIL MODAL — shows when user clicks a match
// ============================================================
function MatchModal({ match, onClose }) {
  if (!match) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg border border-gray-700 shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-green-400 font-bold text-sm uppercase tracking-wider">
              Group {match.group} — {match.date}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Teams + Score */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex flex-col items-center gap-2 flex-1">
              <img
                src={`https://flagcdn.com/w80/${FLAGS[match.home] || 'un'}.png`}
                alt={match.home}
                className="w-16 h-11 object-cover rounded-md shadow"
              />
              <span className="text-white font-bold text-lg text-center">{match.home}</span>
            </div>

            <div className="flex flex-col items-center">
              {match.status === 'NS' ? (
                <>
                  <span className="text-green-400 font-bold text-2xl">{match.time}</span>
                  <span className="text-gray-500 text-xs mt-1">Kick Off (UTC)</span>
                </>
              ) : (
                <>
                  <span className="text-white font-extrabold text-4xl">
                    {match.home_score ?? 0} — {match.away_score ?? 0}
                  </span>
                  <StatusBadge status={match.status} />
                </>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <img
                src={`https://flagcdn.com/w80/${FLAGS[match.away] || 'un'}.png`}
                alt={match.away}
                className="w-16 h-11 object-cover rounded-md shadow"
              />
              <span className="text-white font-bold text-lg text-center">{match.away}</span>
            </div>
          </div>

          {/* Match Info */}
          <div className="bg-gray-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">📍 Venue</span>
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
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">🏆 Stage</span>
              <span className="text-white text-sm font-medium">Group Stage</span>
            </div>
          </div>

          {/* Coming Soon notice for live stats */}
          {match.status === 'NS' && (
            <p className="text-gray-500 text-xs text-center mt-4">
              Live stats, lineups and events will appear here once the match starts ⚡
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================
// MAIN LIVE SCORES PAGE
// ============================================================
function LiveScores() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')

  const GROUPS = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  // Fetch all matches on load
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/matches')
      .then(res => {
        setMatches(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filter matches
  const filtered = matches.filter(m => {
    const groupMatch = filter === 'ALL' || m.group === filter
    const dateMatch = !selectedDate || m.date === selectedDate
    return groupMatch && dateMatch
  })

  // Group by date
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
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-green-400 mb-2"
      >
        Live Scores ⚡
      </motion.h1>
      <p className="text-gray-400 mb-8">
        Follow every World Cup 2026 match — click a match for details.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Group filter */}
        <div className="flex flex-wrap gap-2">
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${
                filter === g
                  ? 'bg-green-500 text-black'
                  : 'border border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400'
              }`}
            >
              {g === 'ALL' ? 'All Groups' : `Group ${g}`}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white px-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-green-500"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="text-gray-400 hover:text-white text-sm px-2"
          >
            Clear date ✕
          </button>
        )}
      </div>

      {/* Matches grouped by date */}
      {Object.keys(byDate).sort().map(date => (
        <div key={date} className="mb-10">
          <h2 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-4 border-b border-gray-700 pb-2">
            📅 {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {byDate[date].map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={setSelectedMatch}
              />
            ))}
          </div>
        </div>
      ))}

      {/* No matches */}
      {Object.keys(byDate).length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No matches found for this filter.</p>
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

    </div>
  )
}

export default LiveScores