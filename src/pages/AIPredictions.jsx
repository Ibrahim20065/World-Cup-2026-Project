import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import API_URL from '../config'

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
  'Bosnia & Herzegovina': 'ba', 'Norway': 'no',
}

const ROUND_COLORS = {
  'Round of 32': '#06b6d4',
  'Round of 16': '#8b5cf6',
  'Quarter Final': '#f59e0b',
  'Semi Final': '#ef4444',
  'Final': '#fbbf24',
}

function toLocalDate(utc) {
  return new Date(utc).toLocaleDateString('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
}

function formatKickoff(utc) {
  return new Date(utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Flag({ team, size = 32 }) {
  const code = FLAGS[team] || 'un'
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={team}
      style={{ width: size * 1.4, height: size, objectFit: 'cover', borderRadius: 4 }}
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

function ConfidenceBar({ value, color }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        style={{ height: '100%', background: color, borderRadius: 100 }}
      />
    </div>
  )
}

function MatchCard({ match, onPredict, isSelected, prediction, loading }) {
  const now = new Date()
  const kickoff = new Date(match.kickoff_utc)
  const isUpcoming = kickoff > now
  const roundColor = ROUND_COLORS[match.round] || '#3b82f6'
  const isKnockout = match.id >= 73
  const homeTeam = match.home
  const awayTeam = match.away

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isSelected ? '#0d1a2e' : '#0a1628',
        border: `1px solid ${isSelected ? roundColor + '50' : 'rgba(255,255,255,0.06)'}`,
        borderTop: `3px solid ${roundColor}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: `${roundColor}08` }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: roundColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {match.round} · M{match.id}
        </span>
        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
          {new Date(match.kickoff_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {formatKickoff(match.kickoff_utc)} local
        </span>
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <Flag team={homeTeam} size={40} />
          <span style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9', textAlign: 'center', wordBreak: 'break-word' }}>{homeTeam}</span>
        </div>

        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          {match.status === 'FT' ? (
            <div>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>{match.home_score} – {match.away_score}</span>
              {match.home_pen != null && match.away_pen != null && (
                <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>pen {match.home_pen}–{match.away_pen}</div>
              )}
              <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, marginTop: 4 }}>FT</div>
            </div>
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, color: '#334155' }}>vs</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <Flag team={awayTeam} size={40} />
          <span style={{ fontWeight: 800, fontSize: 13, color: '#f1f5f9', textAlign: 'center', wordBreak: 'break-word' }}>{awayTeam}</span>
        </div>
      </div>

      {/* Venue */}
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#334155' }}>📍</span>
        <span style={{ fontSize: 11, color: '#334155', fontWeight: 500 }}>{match.venue}</span>
      </div>

      {/* Predict Button */}
      {isUpcoming && (
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={() => onPredict(match)}
            disabled={loading}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, border: 'none',
              background: loading && isSelected
                ? 'rgba(255,255,255,0.04)'
                : `linear-gradient(135deg, ${roundColor}, ${roundColor}cc)`,
              color: loading && isSelected ? '#475569' : '#000',
              fontWeight: 800, fontSize: 13, cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.15s', fontFamily: 'inherit',
            }}
          >
            {loading && isSelected ? '🤖 Analyzing...' : '🤖 Predict This Match'}
          </button>
        </div>
      )}

      {/* Prediction Result */}
      <AnimatePresence>
        {isSelected && prediction && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: `1px solid ${roundColor}25`, overflow: 'hidden' }}
          >
            <div style={{ padding: '20px 16px', background: `${roundColor}06` }}>

              {/* Winner prediction */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Predicted Outcome</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', border: `1px solid ${roundColor}20` }}>
                  <Flag team={prediction.winner} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 15, color: roundColor }}>{prediction.winner} wins</div>
                    {prediction.goes_to_pens && (
                      <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>
                        ⚽ Goes to penalties
                      </div>
                    )}
                    {prediction.predicted_score && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Predicted score: {prediction.predicted_score}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: roundColor }}>{prediction.confidence}%</div>
                    <div style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>confidence</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <ConfidenceBar value={prediction.confidence} color={roundColor} />
                </div>
              </div>

              {/* Eliminated team */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Eliminated</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ filter: 'grayscale(70%)', opacity: 0.7 }}>
                    <Flag team={prediction.eliminated} size={24} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#64748b' }}>{prediction.eliminated}</span>
                  <span style={{ fontSize: 14, marginLeft: 'auto' }}>❌</span>
                </div>
              </div>

              {/* Key factors */}
              {prediction.key_factors && prediction.key_factors.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Key Factors</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {prediction.key_factors.map((factor, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                        <span style={{ color: roundColor, flexShrink: 0, marginTop: 1 }}>→</span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Analysis</div>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{prediction.analysis}</p>
              </div>

              {/* Disclaimer */}
              <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: 10, color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  🤖 AI prediction based on recent form, FIFA rankings, tournament performance and historical data. For entertainment purposes only.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AIPredictions() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [predicting, setPredicting] = useState(false)
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    axios.get(`${API_URL}/api/livescores`)
      .then(res => {
        // Only show knockout matches (R32 onwards)
        const knockoutMatches = res.data.filter(m => 
        m.round === 'Quarter Final' || 
        m.round === 'Semi Final' || 
        m.round === 'Final' || 
        m.round === '3rd Place'
      )
        setMatches(knockoutMatches)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handlePredict = async (match) => {
  setSelectedMatchId(match.id)
  setPredicting(true)

  try {
    const response = await axios.post(`${API_URL}/api/ai-prediction`, {
      home: match.home,
      away: match.away,
      round: match.round,
      venue: match.venue,
      date: new Date(match.kickoff_utc).toDateString()
    })
    setPredictions(prev => ({ ...prev, [match.id]: response.data }))
  } catch (err) {
    console.error('Prediction error:', err)
  }

  setPredicting(false)
}

  const now = new Date()
  const upcomingMatches = matches.filter(m => new Date(m.kickoff_utc) > now && m.status === 'NS')
  const completedMatches = matches.filter(m => m.status === 'FT')
  const displayMatches = filter === 'upcoming' ? upcomingMatches : completedMatches

  // Group by round
  const rounds = ['Quarter Final', 'Semi Final', 'Final', 'Round of 16', 'Round of 32']
  const grouped = {}
  rounds.forEach(r => {
    const roundMatches = displayMatches.filter(m => m.round === r)
    if (roundMatches.length > 0) grouped[r] = roundMatches
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
        <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 16 }}>Loading matches...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Barlow, system-ui, sans-serif' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f59e0b, #ef4444, #fbbf24)' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>FIFA World Cup 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, margin: 0, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
              AI Match Predictions
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100 }}>
              🤖 Powered by Claude
            </span>
          </div>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
            Select any upcoming match and get an AI-powered prediction based on recent form, FIFA rankings, and tournament performance.
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[
            { id: 'upcoming', label: `⏳ Upcoming (${upcomingMatches.length})` },
            { id: 'completed', label: `✅ Completed (${completedMatches.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', background: filter === tab.id ? '#8b5cf6' : 'rgba(255,255,255,0.05)', color: filter === tab.id ? '#fff' : '#64748b', transition: 'all 0.15s', fontFamily: 'inherit', boxShadow: filter === tab.id ? '0 4px 14px rgba(139,92,246,0.3)' : 'none' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Matches */}
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#0d1526', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
            <p style={{ color: '#475569', fontSize: 16, fontWeight: 600, margin: 0 }}>
              {filter === 'upcoming' ? 'No upcoming matches right now.' : 'No completed matches yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {Object.entries(grouped).map(([round, roundMatches]) => (
              <div key={round}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: ROUND_COLORS[round] || '#3b82f6' }} />
                  <h2 style={{ fontWeight: 900, fontSize: 16, color: ROUND_COLORS[round] || '#3b82f6', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Bebas Neue, sans-serif' }}>{round}</h2>
                  <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>{roundMatches.length} match{roundMatches.length !== 1 ? 'es' : ''}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {roundMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onPredict={handlePredict}
                      isSelected={selectedMatchId === match.id}
                      prediction={predictions[match.id]}
                      loading={predicting && selectedMatchId === match.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
    </div>
  )
}

export default AIPredictions