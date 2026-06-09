import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import CITY_DATA from '../cityData'

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

const COUNTRY_ACCENT = { us: '#3b82f6', mx: '#22c55e', ca: '#ef4444' }

function CityProfile() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])

  const cityName = Object.keys(CITY_DATA).find(
    c => c.toLowerCase().replace(/ /g, '-') === name
  )
  const city = cityName ? CITY_DATA[cityName] : null
  const accent = city ? (COUNTRY_ACCENT[city.flag] || '#3b82f6') : '#3b82f6'

  useEffect(() => {
    if (!city) return
    axios.get('http://192.168.100.3:5000/api/matches').then(res => {
      const cityMatches = res.data.filter(m =>
        m.venue && (m.venue.includes(city.stadium) || m.venue.includes(cityName))
      )
      setMatches(cityMatches)
    })
  }, [cityName])

  if (!city) {
    return (
      <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#fff' }}>
        <div style={{ fontSize: 48 }}>🚧</div>
        <p style={{ color: '#64748b', fontSize: 18, fontWeight: 600 }}>City not found</p>
        <button onClick={() => navigate('/map')}
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 24px', borderRadius: 100, border: 'none', cursor: 'pointer' }}>
          ← Back to Map
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top color bar */}
      <div style={{
  height: 3,
  background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #14b8a6, #f59e0b, #84cc16, #6366f1)',
}} />      

      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, ${accent}15 0%, transparent 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px 32px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button onClick={() => navigate('/map')}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
            ← Back to Map
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Flag */}
            <img src={`https://flagcdn.com/w160/${city.flag}.png`} alt={city.country}
              style={{ width: 112, height: 75, objectFit: 'cover', borderRadius: 12, flexShrink: 0, boxShadow: `0 8px 32px ${accent}30`, border: `2px solid ${accent}40` }}
              onError={e => { e.target.style.display = 'none' }} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: accent,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: `${accent}15`, border: `1px solid ${accent}30`,
                  borderRadius: 100, padding: '3px 10px',
                }}>{city.country}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.02em' }}>{cityName}</h1>
              <p style={{ color: accent, fontWeight: 700, fontSize: 15, margin: '0 0 10px' }}>🏟️ {city.stadium}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  city.population && `👥 ${city.population}`,
                  `🪑 ${city.capacity?.toLocaleString()} seats`,
                  city.hosts,
                ].filter(Boolean).map((item, i) => (
                  <span key={i} style={{
                    fontSize: 12, fontWeight: 600, color: '#64748b',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 100, padding: '4px 10px',
                  }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

          {/* City Info */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              About {cityName}
            </div>
            <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', borderTop: `3px solid ${accent}` }}>

              {city.founded && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569', fontSize: 13 }}>📅 Founded</span>
                  <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>{city.founded}</span>
                </div>
              )}

              {city.funFact && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ color: '#475569', fontSize: 12, margin: '0 0 6px', fontWeight: 600 }}>💡 Did you know?</p>
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{city.funFact}</p>
                </div>
              )}

              {city.teams?.length > 0 && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ color: '#475569', fontSize: 12, margin: '0 0 10px', fontWeight: 600 }}>🏆 Local Teams</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {city.teams.map(team => (
                      <span key={team} style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8', fontSize: 12, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 100,
                      }}>{team}</span>
                    ))}
                  </div>
                </div>
              )}

              {city.attractions?.length > 0 && (
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ color: '#475569', fontSize: 12, margin: '0 0 10px', fontWeight: 600 }}>📍 Attractions</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {city.attractions.map(a => (
                      <span key={a} style={{
                        background: `${accent}12`,
                        border: `1px solid ${accent}30`,
                        color: accent, fontSize: 12, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 100,
                      }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Matches */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Matches Hosted
              </div>
              <span style={{
                background: `${accent}15`, border: `1px solid ${accent}30`,
                color: accent, fontSize: 11, fontWeight: 800,
                padding: '2px 8px', borderRadius: 100,
              }}>{matches.length}</span>
            </div>

            {matches.length === 0 ? (
              <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⚽</div>
                <p style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>No matches found for this venue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matches.map((match, i) => {
                  const gc = getGroupColor(match.group)
                  return (
                    <motion.div key={match.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        background: '#0d1526',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: `3px solid ${gc}`,
                        borderRadius: 10, padding: '12px 14px',
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, color: gc,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                        }}>
                          {match.group ? `Group ${match.group}` : 'Knockout'} · Match {match.id}
                        </span>
                        <span style={{ color: '#334155', fontSize: 11, fontWeight: 600 }}>
                          {match.date} · {match.time}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{match.home}</span>
                          <img src={`https://flagcdn.com/w40/${FLAGS[match.home] || 'un'}.png`} alt={match.home}
                            style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2 }}
                            onError={e => { e.target.style.display = 'none' }} />
                        </div>
                        <span style={{ color: '#334155', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>vs</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                          <img src={`https://flagcdn.com/w40/${FLAGS[match.away] || 'un'}.png`} alt={match.away}
                            style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2 }}
                            onError={e => { e.target.style.display = 'none' }} />
                          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{match.away}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CityProfile
