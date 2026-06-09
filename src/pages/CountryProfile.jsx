import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import COUNTRY_DATA from '../countryData'
import PLAYERS from '../players'

const GROUP_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#84cc16','#6366f1',
]
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function getGroupColor(group) {
  const idx = GROUP_LETTERS.indexOf(group)
  return idx >= 0 ? GROUP_COLORS[idx] : '#3b82f6'
}

function resultStyle(result) {
  if (result.includes('🏆')) return { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' }
  if (result.includes('Runners Up')) return { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' }
  if (result.includes('3rd') || result.includes('4th')) return { bg: 'rgba(251,146,60,0.15)', color: '#fb923c', border: 'rgba(251,146,60,0.3)' }
  if (result.includes('Semi')) return { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' }
  if (result.includes('Quarter')) return { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' }
  if (result.includes('Round of 16')) return { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' }
  if (result.includes('TBD')) return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' }
  return { bg: 'rgba(255,255,255,0.04)', color: '#64748b', border: 'rgba(255,255,255,0.08)' }
}

const POS_CONFIG = {
  'Goalkeeper': { icon: '🧤', color: '#f59e0b' },
  'Defender':   { icon: '🛡️', color: '#3b82f6' },
  'Midfielder': { icon: '⚙️', color: '#22c55e' },
  'Forward':    { icon: '⚡', color: '#ef4444' },
}

function CountryProfile() {
  const { name } = useParams()
  const navigate = useNavigate()

  const SPECIAL_NAMES = {
    'usa': 'USA', 'dr-congo': 'DR Congo', 'gb-eng': 'England',
    'gb-sct': 'Scotland', 'ivory-coast': 'Ivory Coast', 'cape-verde': 'Cape Verde',
    'saudi-arabia': 'Saudi Arabia', 'south-korea': 'South Korea',
    'south-africa': 'South Africa', 'new-zealand': 'New Zealand',
    'czech-republic': 'Czech Republic',
  }

  const countryName = SPECIAL_NAMES[name] || name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const data = COUNTRY_DATA[countryName]

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#fff' }}>
        <div style={{ fontSize: 48 }}>🚧</div>
        <p style={{ color: '#64748b', fontSize: 18, fontWeight: 600 }}>Profile coming soon for {countryName}</p>
        <button onClick={() => navigate('/countries')}
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 24px', borderRadius: 100, border: 'none', cursor: 'pointer' }}>
          ← Back to Countries
        </button>
      </div>
    )
  }

  const squad = PLAYERS.filter(p => p.country === countryName)
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
  const groupColor = getGroupColor(data.group_2026)

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{
  height: 3,
  background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)',
}} />      

      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, ${groupColor}18 0%, transparent 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px 32px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button onClick={() => navigate('/countries')}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
            ← Back to Countries
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Flag */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={`https://flagcdn.com/w160/${data.flag}.png`} alt={countryName}
                style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 12, boxShadow: `0 8px 32px ${groupColor}30`, border: `2px solid ${groupColor}40` }}
                onError={e => { e.target.style.display = 'none' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 7, background: groupColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0,
                }}>{data.group_2026}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: groupColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Group {data.group_2026}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{countryName}</h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: data.confederation },
                  { label: `FIFA Rank #${data.fifa_ranking}` },
                  { label: data.best_result },
                ].map((item, i) => (
                  <span key={i} style={{
                    fontSize: 12, fontWeight: 600, color: '#64748b',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 100, padding: '4px 10px',
                  }}>{item.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 36 }}>
          {[
            { label: 'Titles', value: data.titles, icon: '🏆', color: '#fbbf24' },
            { label: 'Appearances', value: data.all_time_appearances, icon: '🌍', color: '#3b82f6' },
            { label: 'Total Wins', value: data.total_wins, icon: '✅', color: '#22c55e' },
            { label: 'Goals Scored', value: data.goals_scored, icon: '⚽', color: '#f97316' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#0d1526', border: `1px solid ${stat.color}20`,
              borderTop: `3px solid ${stat.color}`,
              borderRadius: 12, padding: '16px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: '#475569', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 36 }}>

          {/* History Timeline */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>World Cup History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
              {data.history.map(entry => {
                const rs = resultStyle(entry.result)
                return (
                  <div key={entry.year} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#0d1526', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#64748b', width: 40, flexShrink: 0 }}>{entry.year}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                      background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                    }}>{entry.result}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Records */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Records & Staff</div>
            <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              {[
                { label: 'Coach', value: data.coach },
                { label: 'Captain', value: data.captain },
                { label: 'Top Scorer', value: `${data.top_scorer.name} (${data.top_scorer.goals} goals)` },
                { label: 'Most Capped', value: `${data.most_capped.name} (${data.most_capped.caps} caps)` },
                { label: 'Record', value: `W${data.total_wins} D${data.total_draws} L${data.total_losses} / ${data.total_matches} games` },
                { label: 'Goals Conceded', value: data.goals_conceded },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', gap: 16,
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <span style={{ color: '#475569', fontSize: 13, flexShrink: 0 }}>{item.label}</span>
                  <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Title years */}
            {data.title_years.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                  🏆 Title Years
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.title_years.map(year => (
                    <span key={year} style={{
                      background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
                      color: '#fbbf24', fontWeight: 800, fontSize: 15,
                      padding: '6px 16px', borderRadius: 100,
                    }}>{year}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Squad */}
        {squad.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              👕 2026 World Cup Squad
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {positions.map(pos => {
                const posPlayers = squad.filter(p => p.position === pos)
                if (posPlayers.length === 0) return null
                const pc = POS_CONFIG[pos]
                return (
                  <div key={pos} style={{
                    background: '#0d1526',
                    border: `1px solid ${pc.color}20`,
                    borderTop: `3px solid ${pc.color}`,
                    borderRadius: 12, overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '12px 14px 10px',
                      borderBottom: `1px solid ${pc.color}15`,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 16 }}>{pc.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: pc.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{pos}s</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#334155', fontWeight: 600 }}>{posPlayers.length}</span>
                    </div>
                    <div style={{ padding: '6px 0' }}>
                      {posPlayers.map(player => (
                        <div key={player.name} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 14px',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}>
                          <span style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: `${pc.color}15`, border: `1px solid ${pc.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 900, color: pc.color, flexShrink: 0,
                          }}>{player.number}</span>
                          <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CountryProfile
